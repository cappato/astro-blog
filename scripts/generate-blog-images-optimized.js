#!/usr/bin/env node

/**
 * Blog Image Generator - Optimized Version
 * 
 * Integrates URL downloading with the existing image optimization module
 * Supports both manual mode (user places images) and automatic mode (AI downloads + optimizes)
 */

import fs from 'fs/promises';
import path from 'path';
// Note: We'll implement URL processing inline for now since the module is TypeScript

// Image URLs for automatic mode
const IMAGE_URLS = {
  architecture: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop&crop=center',
  seo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center',
  darkmode: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop&crop=center',
  testing: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop&crop=center'
};

// Presets to generate for blog images
const BLOG_PRESETS = [
  'og',        // 1200x630 WebP for Open Graph
  'og-jpg',    // 1200x630 JPEG for compatibility
  'thumb',     // 600x315 WebP for thumbnails
  'avif',      // 1200px AVIF for modern browsers
  'og-avif'    // 1200x630 AVIF for modern OG
];

/**
 * Configuration
 */
const CONFIG = {
  OUTPUT_DIR: 'public/images/blog',
  MODES: {
    SIMPLE: 'simple',      // Download single WebP (current behavior)
    OPTIMIZED: 'optimized' // Download + full optimization pipeline
  }
};

/**
 * Generate optimized images for a blog post
 */
async function generateOptimizedBlogImage(postName, mode = CONFIG.MODES.OPTIMIZED) {
  const imageUrl = IMAGE_URLS[postName];
  if (!imageUrl) {
    throw new Error(`URL de imagen para ${postName} no encontrada`);
  }

  const outputDir = CONFIG.OUTPUT_DIR;
  await fs.mkdir(outputDir, { recursive: true });

  console.log(`🎨 Procesando ${postName} en modo ${mode}...`);

  if (mode === CONFIG.MODES.SIMPLE) {
    // Simple mode: single WebP download (backward compatibility)
    return await generateSimpleImage(postName, imageUrl, outputDir);
  } else {
    // Optimized mode: full optimization pipeline
    return await generateOptimizedImage(postName, imageUrl, outputDir);
  }
}

/**
 * Simple mode: Download single WebP image
 */
async function generateSimpleImage(postName, imageUrl, outputDir) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const filename = `${postName}-cover.webp`;
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(filepath, Buffer.from(buffer));
    
    console.log(`  ✅ ${filename} (simple mode)`);
    return { success: true, files: [filename] };
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Optimized mode: Download + use existing CLI optimization
 */
async function generateOptimizedImage(postName, imageUrl, outputDir) {
  try {
    const baseName = `${postName}-cover`;

    // Step 1: Download to raw images directory
    // Use 'portada' name to trigger full optimization (8 variants)
    const rawDir = `images/raw/blog`;
    const rawPath = path.join(rawDir, `portada.jpg`);

    await fs.mkdir(rawDir, { recursive: true });

    console.log(`  📥 Descargando imagen...`);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    await fs.writeFile(rawPath, Buffer.from(buffer));

    console.log(`  ✅ Descargada: ${rawPath}`);

    // Step 2: Use existing optimization CLI
    console.log(`  🔧 Optimizando con módulo existente...`);

    const { spawn } = await import('child_process');
    const { promisify } = await import('util');
    const execFile = promisify(spawn);

    // Run optimization CLI for the blog directory
    const optimizeProcess = spawn('npm', ['run', 'optimize-images', '--', '--postId', 'blog', '--force'], {
      stdio: 'pipe',
      shell: true
    });

    let stdout = '';
    let stderr = '';

    optimizeProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    optimizeProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const exitCode = await new Promise((resolve) => {
      optimizeProcess.on('close', resolve);
    });

    if (exitCode === 0) {
      console.log(`  ✅ Optimización completada`);

      // Step 3: Rename generated files from 'portada' to correct post name
      const publicBlogDir = 'public/images/blog';
      try {
        const files = await fs.readdir(publicBlogDir);
        const portadaFiles = files.filter(file => file.startsWith('portada'));
        const renamedFiles = [];

        console.log(`  🔄 Renombrando ${portadaFiles.length} archivos...`);

        for (const file of portadaFiles) {
          const newName = file.replace('portada', baseName);
          const oldPath = path.join(publicBlogDir, file);
          const newPath = path.join(publicBlogDir, newName);

          await fs.rename(oldPath, newPath);
          renamedFiles.push(newName);
          console.log(`    - ${file} → ${newName}`);
        }

        console.log(`  📁 Archivos finales: ${renamedFiles.length}`);

        return {
          success: true,
          files: renamedFiles,
          stats: {
            successful: renamedFiles.length,
            failed: 0,
            total: renamedFiles.length
          }
        };
      } catch (error) {
        console.log(`  ⚠️ Error en renombrado: ${error.message}`);
        return { success: true, files: [], stats: { successful: 1, failed: 0, total: 1 } };
      }
    } else {
      console.error(`  ❌ Optimización falló (código: ${exitCode})`);
      if (stderr) console.error(`  Error: ${stderr}`);
      return { success: false, error: `Optimization failed with code ${exitCode}` };
    }

  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Generate images for all blog posts
 */
async function generateAllImages(mode = CONFIG.MODES.OPTIMIZED) {
  console.log(`🚀 Generando imágenes para blog posts (modo: ${mode})...\n`);
  
  const results = [];
  let totalSuccessful = 0;
  let totalFailed = 0;
  let totalFiles = 0;
  
  for (const postName of Object.keys(IMAGE_URLS)) {
    try {
      const result = await generateOptimizedBlogImage(postName, mode);
      results.push({ postName, ...result });
      
      if (result.success) {
        totalSuccessful++;
        if (result.files) {
          totalFiles += result.files.length;
        }
      } else {
        totalFailed++;
      }
      
    } catch (error) {
      console.error(`❌ Error procesando ${postName}:`, error.message);
      results.push({ 
        postName, 
        success: false, 
        error: error.message 
      });
      totalFailed++;
    }
    
    console.log(''); // Separador
  }
  
  // Resumen final
  console.log('📊 RESUMEN FINAL:');
  console.log(`✅ Posts exitosos: ${totalSuccessful}/${Object.keys(IMAGE_URLS).length}`);
  console.log(`📁 Archivos generados: ${totalFiles}`);
  console.log(`📍 Ubicación: ${CONFIG.OUTPUT_DIR}`);
  
  if (mode === CONFIG.MODES.OPTIMIZED) {
    console.log('\n🎯 ARCHIVOS GENERADOS POR POST:');
    console.log('- {post}-cover-og.webp (1200x630 WebP)');
    console.log('- {post}-cover-og-jpg.jpeg (1200x630 JPEG)');
    console.log('- {post}-cover-thumb.webp (600x315 thumbnail)');
    console.log('- {post}-cover-avif.avif (1200px AVIF)');
    console.log('- {post}-cover-og-avif.avif (1200x630 AVIF)');
    console.log('- {post}-cover-lqip.webp (placeholder)');
    console.log('- {post}-cover-lqip.txt (base64 data URI)');
  }
  
  return results;
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    mode: CONFIG.MODES.OPTIMIZED,
    post: null,
    help: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--simple') {
      options.mode = CONFIG.MODES.SIMPLE;
    } else if (arg === '--optimized') {
      options.mode = CONFIG.MODES.OPTIMIZED;
    } else if (arg === '--post' && i + 1 < args.length) {
      options.post = args[i + 1];
      i++; // Skip next argument
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }
  
  return options;
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
🎨 Blog Image Generator - Optimized Version

USAGE:
  node scripts/generate-blog-images-optimized.js [options]

OPTIONS:
  --simple      Simple mode: single WebP download (backward compatibility)
  --optimized   Optimized mode: full optimization pipeline (default)
  --post <name> Generate images for specific post only
  --help, -h    Show this help

EXAMPLES:
  # Generate all images with full optimization
  npm run generate:images:optimized

  # Generate all images in simple mode
  npm run generate:images:optimized -- --simple

  # Generate images for specific post
  npm run generate:images:optimized -- --post architecture

  # Generate specific post in simple mode
  npm run generate:images:optimized -- --post seo --simple

MODES:
  simple    - Downloads single WebP image (current behavior)
  optimized - Downloads + generates multiple formats and sizes
              * WebP + JPEG + AVIF formats
              * Open Graph + thumbnail sizes
              * LQIP placeholders
              * ~7 files per image
`);
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }
  
  try {
    if (options.post) {
      // Generate for specific post
      if (!IMAGE_URLS[options.post]) {
        console.error(`❌ Post '${options.post}' no encontrado.`);
        console.log(`Posts disponibles: ${Object.keys(IMAGE_URLS).join(', ')}`);
        process.exit(1);
      }
      
      await generateOptimizedBlogImage(options.post, options.mode);
    } else {
      // Generate for all posts
      await generateAllImages(options.mode);
    }
    
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { 
  generateOptimizedBlogImage, 
  generateAllImages, 
  IMAGE_URLS, 
  CONFIG 
};
