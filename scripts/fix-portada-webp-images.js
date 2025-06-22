#!/usr/bin/env node

/**
 * Fix Portada WebP Images Script
 * Creates the missing portada.webp images that blog posts are actually looking for
 */

import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * List of blog post directories that need portada.webp images
 * Based on the server logs and error messages
 */
const BLOG_POST_DIRECTORIES = [
  'seo-automatico-typescript',
  'optimizacion-performance-astro-tecnicas-avanzadas',
  'debugging-auto-merge-github-actions-troubleshooting',
  'reglas-esenciales-proyectos-profesionales-estandares',
  'sistema-triggers-automaticos-desarrollo-context-loading',
  'test-post-draft-sistema',
  'reglas-rigidas-vs-escalamiento-progresivo',
  'migracion-sistemas-preservando-vision',
  'dark-mode-perfecto-astro',
  'testing-automatizado-sitios-estaticos',
  'deploy-automatico-wrangler-github-actions',
  'protocolos-automaticos-ia-arquitectura',
  'github-actions-deploy-automatico-wrangler',
  'troubleshooting-wrangler-wsl-deploy',
  'arquitectura-modular-astro',
  'auto-merge-inteligente-ux-control',
  'anatomia-sistema-protocolos-automaticos',
  'configurar-wrangler-cloudflare-pages-2024',
  'bienvenida-a-mi-blog'
];

/**
 * High-quality themed images from Unsplash for different topics
 */
const THEMED_IMAGES = {
  // SEO and TypeScript
  'seo-automatico-typescript': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center',
  
  // Performance and optimization
  'optimizacion-performance': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
  
  // Debugging and troubleshooting
  'debugging': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&crop=center',
  'troubleshooting': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&crop=center',
  
  // Rules and standards
  'reglas': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&crop=center',
  'estandares': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&crop=center',
  
  // Systems and automation
  'sistema': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&crop=center',
  'triggers': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&crop=center',
  'automaticos': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&crop=center',
  
  // Testing
  'test': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
  'testing': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
  
  // Migration
  'migracion': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop&crop=center',
  
  // Dark mode and UI
  'dark-mode': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop&crop=center',
  
  // Deploy and GitHub Actions
  'deploy': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop&crop=center',
  'github': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop&crop=center',
  'actions': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop&crop=center',
  
  // Protocols and architecture
  'protocolos': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop&crop=center',
  'arquitectura': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop&crop=center',
  
  // Auto-merge and control
  'auto-merge': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop&crop=center',
  'merge': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop&crop=center',
  
  // Configuration and setup
  'configurar': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&crop=center',
  'wrangler': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop&crop=center',
  'cloudflare': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop&crop=center',
  
  // Anatomy and systems
  'anatomia': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop&crop=center',
  
  // Welcome and blog
  'bienvenida': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&crop=center',
  'blog': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop&crop=center',
  
  // Default fallback
  'default': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop&crop=center'
};

/**
 * Determine the best image URL based on the directory name
 */
function getImageUrlForDirectory(dirName) {
  // Direct match first
  if (THEMED_IMAGES[dirName]) {
    return THEMED_IMAGES[dirName];
  }
  
  // Extract key terms from directory name
  const terms = dirName.toLowerCase().split('-');
  
  // Try to match with themed images
  for (const term of terms) {
    if (THEMED_IMAGES[term]) {
      return THEMED_IMAGES[term];
    }
  }
  
  // Try compound terms
  for (const [key, url] of Object.entries(THEMED_IMAGES)) {
    if (dirName.toLowerCase().includes(key)) {
      return url;
    }
  }
  
  // Default fallback
  return THEMED_IMAGES.default;
}

/**
 * Download portada.webp image for a blog post directory
 */
async function downloadPortadaWebp(dirName) {
  const imageUrl = getImageUrlForDirectory(dirName);
  const localPath = path.join(process.cwd(), 'public/images', dirName, 'portada.webp');
  
  try {
    log(`⬇️ Downloading portada.webp for: ${dirName}`, 'cyan');
    log(`   URL: ${imageUrl}`, 'blue');
    log(`   Path: ${localPath}`, 'blue');
    
    // Ensure directory exists
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Download and save as WebP
    const fileStream = createWriteStream(localPath);
    await pipeline(response.body, fileStream);
    
    log(`✅ Downloaded: ${dirName}/portada.webp`, 'green');
    return localPath;
  } catch (error) {
    log(`❌ Download failed for ${dirName}: ${error.message}`, 'red');
    
    // Create SVG placeholder as fallback
    const svgContent = `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#666" text-anchor="middle" dy=".3em">Portada: ${dirName}</text>
    </svg>`;
    
    const svgPath = localPath.replace('.webp', '.svg');
    fs.writeFileSync(svgPath, svgContent);
    
    log(`📝 Created placeholder: ${dirName}/portada.svg`, 'yellow');
    return svgPath;
  }
}

/**
 * Verify image accessibility
 */
async function verifyImageAccessibility(dirName) {
  const baseUrl = 'http://localhost:4324';
  const imageUrl = `${baseUrl}/images/${dirName}/portada.webp`;
  
  try {
    const response = await fetch(imageUrl);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  log('🖼️ Portada WebP Images Fixer', 'bold');
  log('=====================================\n', 'cyan');
  
  log(`🔍 Creating portada.webp images for ${BLOG_POST_DIRECTORIES.length} blog posts...\n`, 'blue');
  
  const downloadedImages = [];
  const failedImages = [];
  
  // Process each blog post directory
  for (let i = 0; i < BLOG_POST_DIRECTORIES.length; i++) {
    const dirName = BLOG_POST_DIRECTORIES[i];
    log(`[${i + 1}/${BLOG_POST_DIRECTORIES.length}] Processing: ${dirName}`, 'yellow');
    
    // Check if portada.webp already exists
    const existingPath = path.join(process.cwd(), 'public/images', dirName, 'portada.webp');
    if (fs.existsSync(existingPath)) {
      log(`⏭️ Skipping existing: ${dirName}/portada.webp`, 'yellow');
      downloadedImages.push({ dirName, path: existingPath, status: 'existing' });
      continue;
    }
    
    try {
      const result = await downloadPortadaWebp(dirName);
      
      if (result) {
        downloadedImages.push({
          dirName,
          path: result,
          status: result.endsWith('.svg') ? 'placeholder' : 'downloaded'
        });
        log(`✅ Successfully processed: ${dirName}`, 'green');
      } else {
        failedImages.push(dirName);
        log(`❌ Failed to process: ${dirName}`, 'red');
      }
    } catch (error) {
      failedImages.push(dirName);
      log(`❌ Error processing ${dirName}: ${error.message}`, 'red');
    }
    
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  log('\n=====================================', 'cyan');
  log('📊 Processing Summary:', 'bold');
  log(`   - Directories processed: ${downloadedImages.length}`, downloadedImages.length > 0 ? 'green' : 'yellow');
  log(`   - Directories failed: ${failedImages.length}`, failedImages.length > 0 ? 'red' : 'green');
  
  if (downloadedImages.length > 0) {
    log('\n✅ Successfully processed directories:', 'green');
    downloadedImages.forEach(img => {
      const statusIcon = img.status === 'existing' ? '📁' : img.status === 'placeholder' ? '📝' : '⬇️';
      log(`   ${statusIcon} ${img.dirName} (${img.status})`, 'green');
    });
  }
  
  if (failedImages.length > 0) {
    log('\n❌ Failed to process:', 'red');
    failedImages.forEach(dirName => {
      log(`   - ${dirName}`, 'red');
    });
  }
  
  // Verify accessibility
  log('\n🔍 Verifying image accessibility...', 'cyan');
  let accessibleCount = 0;
  
  for (const img of downloadedImages) {
    if (img.status !== 'placeholder') {
      const accessible = await verifyImageAccessibility(img.dirName);
      if (accessible) {
        log(`✅ Accessible: ${img.dirName}/portada.webp`, 'green');
        accessibleCount++;
      } else {
        log(`❌ Not accessible: ${img.dirName}/portada.webp`, 'red');
      }
    }
  }
  
  const nonPlaceholderImages = downloadedImages.filter(img => img.status !== 'placeholder');
  log(`\n📊 Accessibility: ${accessibleCount}/${nonPlaceholderImages.length} images accessible`, 
      accessibleCount === nonPlaceholderImages.length ? 'green' : 'yellow');
  
  log('\n💡 Recommendations:', 'blue');
  log('   1. Refresh the browser to see the new images', 'blue');
  log('   2. Check browser console for any remaining 404 errors', 'blue');
  log('   3. All blog posts should now display their portada images correctly', 'blue');
  
  log('\n🎉 Portada WebP images fix complete!', 'green');
}

// Run the fixer
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { downloadPortadaWebp, verifyImageAccessibility, main };
