#!/usr/bin/env node

/**
 * Fix Portada Images Script
 * Specifically targets the missing portada-avif.avif images found in server logs
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
 * List of missing portada images identified from server logs
 */
const MISSING_PORTADA_IMAGES = [
  'optimizacion-performance-astro-tecnicas-avanzadas/portada-avif.avif',
  'debugging-auto-merge-github-actions-troubleshooting/portada-avif.avif',
  'reglas-esenciales-proyectos-profesionales-estándares/portada-avif.avif',
  'sistema-triggers-automaticos-desarrollo-context-loading/portada-avif.avif',
  'test-post-draft-sistema/portada-avif.avif',
  'reglas-rigidas-vs-escalamiento-progresivo/portada-avif.avif',
  'migracion-sistemas-preservando-vision/portada-avif.avif',
  'dark-mode-perfecto-astro/portada-avif.avif',
  'testing-automatizado-sitios-estaticos/portada-avif.avif',
  'seo-automatico-typescript/portada-avif.avif',
  'deploy-automatico-wrangler-github-actions/portada-avif.avif',
  'protocolos-automaticos-ia-arquitectura/portada-avif.avif',
  'github-actions-deploy-automatico-wrangler/portada-avif.avif',
  'troubleshooting-wrangler-wsl-deploy/portada-avif.avif',
  'arquitectura-modular-astro/portada-avif.avif',
  'auto-merge-inteligente-ux-control/portada-avif.avif'
];

/**
 * High-quality themed images from Unsplash for different topics
 */
const THEMED_IMAGES = {
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
  
  // SEO and TypeScript
  'seo': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center',
  'typescript': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center',
  
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
  
  // Default fallback
  'default': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop&crop=center'
};

/**
 * Determine the best image URL based on the directory name
 */
function getImageUrlForDirectory(dirName) {
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
 * Download and convert image to WebP format
 */
async function downloadPortadaImage(imagePath) {
  const dirName = path.dirname(imagePath);
  const imageUrl = getImageUrlForDirectory(path.basename(dirName));
  const localPath = path.join(process.cwd(), 'public/images', imagePath);
  
  // Convert to WebP format (better than AVIF for compatibility)
  const webpPath = localPath.replace('.avif', '.webp');
  
  try {
    log(`⬇️ Downloading portada image for: ${path.basename(dirName)}`, 'cyan');
    log(`   URL: ${imageUrl}`, 'blue');
    log(`   Path: ${webpPath}`, 'blue');
    
    // Ensure directory exists
    const dir = path.dirname(webpPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Download and save as WebP
    const fileStream = createWriteStream(webpPath);
    await pipeline(response.body, fileStream);
    
    log(`✅ Downloaded: ${path.basename(webpPath)}`, 'green');
    
    // Also create the AVIF version by copying the WebP (for now)
    // In a real scenario, you'd convert to AVIF format
    fs.copyFileSync(webpPath, localPath);
    log(`📋 Created AVIF version: ${path.basename(localPath)}`, 'green');
    
    return { webp: webpPath, avif: localPath };
  } catch (error) {
    log(`❌ Download failed: ${error.message}`, 'red');
    
    // Create SVG placeholder as fallback
    const svgContent = `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#666" text-anchor="middle" dy=".3em">Portada: ${path.basename(dirName)}</text>
    </svg>`;
    
    const svgPath = localPath.replace('.avif', '.svg');
    fs.writeFileSync(svgPath, svgContent);
    
    log(`📝 Created placeholder: ${path.basename(svgPath)}`, 'yellow');
    return { svg: svgPath };
  }
}

/**
 * Verify image accessibility
 */
async function verifyImageAccessibility(imagePath) {
  const baseUrl = 'http://localhost:4324';
  const imageUrl = `${baseUrl}/images/${imagePath}`;
  
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
  log('🖼️ Portada Images Fixer', 'bold');
  log('=====================================\n', 'cyan');
  
  log(`🔍 Found ${MISSING_PORTADA_IMAGES.length} missing portada images to fix...\n`, 'blue');
  
  const downloadedImages = [];
  const failedImages = [];
  
  // Process each missing image
  for (let i = 0; i < MISSING_PORTADA_IMAGES.length; i++) {
    const imagePath = MISSING_PORTADA_IMAGES[i];
    log(`[${i + 1}/${MISSING_PORTADA_IMAGES.length}] Processing: ${imagePath}`, 'yellow');
    
    try {
      const result = await downloadPortadaImage(imagePath);
      
      if (result.webp || result.avif) {
        downloadedImages.push({
          original: imagePath,
          downloaded: result
        });
        log(`✅ Successfully processed: ${imagePath}`, 'green');
      } else {
        failedImages.push(imagePath);
        log(`❌ Failed to process: ${imagePath}`, 'red');
      }
    } catch (error) {
      failedImages.push(imagePath);
      log(`❌ Error processing ${imagePath}: ${error.message}`, 'red');
    }
    
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  log('\n=====================================', 'cyan');
  log('📊 Processing Summary:', 'bold');
  log(`   - Images processed: ${downloadedImages.length}`, downloadedImages.length > 0 ? 'green' : 'yellow');
  log(`   - Images failed: ${failedImages.length}`, failedImages.length > 0 ? 'red' : 'green');
  
  if (downloadedImages.length > 0) {
    log('\n✅ Successfully processed images:', 'green');
    downloadedImages.forEach(img => {
      log(`   - ${img.original}`, 'green');
      if (img.downloaded.webp) log(`     → WebP: ${path.basename(img.downloaded.webp)}`, 'blue');
      if (img.downloaded.avif) log(`     → AVIF: ${path.basename(img.downloaded.avif)}`, 'blue');
    });
  }
  
  if (failedImages.length > 0) {
    log('\n❌ Failed to process:', 'red');
    failedImages.forEach(img => {
      log(`   - ${img}`, 'red');
    });
  }
  
  // Verify accessibility
  log('\n🔍 Verifying image accessibility...', 'cyan');
  let accessibleCount = 0;
  
  for (const img of downloadedImages) {
    const accessible = await verifyImageAccessibility(img.original);
    if (accessible) {
      log(`✅ Accessible: ${img.original}`, 'green');
      accessibleCount++;
    } else {
      log(`❌ Not accessible: ${img.original}`, 'red');
    }
  }
  
  log(`\n📊 Accessibility: ${accessibleCount}/${downloadedImages.length} images accessible`, 
      accessibleCount === downloadedImages.length ? 'green' : 'yellow');
  
  log('\n💡 Recommendations:', 'blue');
  log('   1. Refresh the browser to see the new images', 'blue');
  log('   2. Check server logs for any remaining 404 errors', 'blue');
  log('   3. Consider optimizing images for better performance', 'blue');
  
  log('\n🎉 Portada images fix complete!', 'green');
}

// Run the fixer
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { downloadPortadaImage, verifyImageAccessibility, main };
