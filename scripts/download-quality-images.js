#!/usr/bin/env node

/**
 * Download Quality Images Script
 * Downloads high-quality, relevant images for blog posts from free sources
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
 * High-quality free images from Unsplash (programming/tech themed)
 */
const QUALITY_IMAGES = {
  // Architecture and modular design
  'arquitectura-modular-astro.webp': {
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop&crop=center',
    description: 'Modern architecture - modular design concept'
  },
  
  // SEO and TypeScript
  'seo-automatico-typescript.webp': {
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center',
    description: 'Code and analytics - SEO and TypeScript'
  },
  
  // Dark mode and UI
  'dark-mode-perfecto-astro.webp': {
    url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop&crop=center',
    description: 'Dark interface design'
  },
  
  // Testing and automation
  'testing-automatizado.webp': {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center',
    description: 'Testing and quality assurance'
  },
  
  // Architecture cover
  'architecture-cover.webp': {
    url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop&crop=center',
    description: 'Software architecture and development'
  }
};

/**
 * GitHub Actions and deployment images
 */
const GITHUB_IMAGES = {
  'github-secrets.webp': {
    url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=400&fit=crop&crop=center',
    description: 'Security and secrets management'
  },
  
  'github-actions-success.webp': {
    url: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop&crop=center',
    description: 'Success and automation'
  }
};

/**
 * Download image from URL
 */
async function downloadImage(imageUrl, localPath, description) {
  try {
    log(`⬇️ Downloading: ${description}`, 'cyan');
    log(`   URL: ${imageUrl}`, 'blue');
    log(`   Path: ${localPath}`, 'blue');
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Ensure directory exists
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Download and save
    const fileStream = createWriteStream(localPath);
    await pipeline(response.body, fileStream);
    
    log(`✅ Downloaded: ${path.basename(localPath)}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Download failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Convert WebP to other formats if needed
 */
function getImagePath(filename, directory = 'public/images/blog') {
  return path.join(process.cwd(), directory, filename);
}

/**
 * Main execution function
 */
async function main() {
  log('🖼️ Quality Images Downloader', 'bold');
  log('=====================================\n', 'cyan');
  
  const downloadedImages = [];
  const failedImages = [];
  
  // Download blog images
  log('📥 Downloading blog images...', 'yellow');
  for (const [filename, imageData] of Object.entries(QUALITY_IMAGES)) {
    const localPath = getImagePath(filename);
    
    // Skip if file already exists and is not an SVG placeholder
    if (fs.existsSync(localPath) && !localPath.endsWith('.svg')) {
      log(`⏭️ Skipping existing: ${filename}`, 'yellow');
      continue;
    }
    
    const success = await downloadImage(imageData.url, localPath, imageData.description);
    
    if (success) {
      downloadedImages.push(filename);
    } else {
      failedImages.push(filename);
    }
    
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Download GitHub Actions images
  log('\n📥 Downloading GitHub Actions images...', 'yellow');
  for (const [filename, imageData] of Object.entries(GITHUB_IMAGES)) {
    const localPath = getImagePath(filename, 'public/images/deploy-automatico-wrangler-github-actions');
    
    // Skip if file already exists and is not an SVG placeholder
    if (fs.existsSync(localPath) && !localPath.endsWith('.svg')) {
      log(`⏭️ Skipping existing: ${filename}`, 'yellow');
      continue;
    }
    
    const success = await downloadImage(imageData.url, localPath, imageData.description);
    
    if (success) {
      downloadedImages.push(filename);
    } else {
      failedImages.push(filename);
    }
    
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  log('\n=====================================', 'cyan');
  log('📊 Download Summary:', 'bold');
  log(`   - Images downloaded: ${downloadedImages.length}`, downloadedImages.length > 0 ? 'green' : 'yellow');
  log(`   - Images failed: ${failedImages.length}`, failedImages.length > 0 ? 'red' : 'green');
  
  if (downloadedImages.length > 0) {
    log('\n✅ Successfully downloaded:', 'green');
    downloadedImages.forEach(filename => {
      log(`   - ${filename}`, 'green');
    });
  }
  
  if (failedImages.length > 0) {
    log('\n❌ Failed to download:', 'red');
    failedImages.forEach(filename => {
      log(`   - ${filename}`, 'red');
    });
  }
  
  // Clean up SVG placeholders that were replaced
  log('\n🧹 Cleaning up SVG placeholders...', 'yellow');
  const svgFiles = [
    'public/images/blog/arquitectura-modular-astro.svg',
    'public/images/blog/seo-automatico-typescript.svg',
    'public/images/blog/dark-mode-perfecto-astro.svg',
    'public/images/blog/testing-automatizado.svg',
    'public/images/blog/architecture-cover.svg',
    'public/images/deploy-automatico-wrangler-github-actions/github-secrets.svg',
    'public/images/deploy-automatico-wrangler-github-actions/github-actions-success.svg'
  ];
  
  let cleanedCount = 0;
  for (const svgFile of svgFiles) {
    const fullPath = path.join(process.cwd(), svgFile);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        log(`🗑️ Removed: ${svgFile}`, 'yellow');
        cleanedCount++;
      } catch (error) {
        log(`⚠️ Could not remove: ${svgFile}`, 'yellow');
      }
    }
  }
  
  log(`\n🎯 Cleanup complete: ${cleanedCount} SVG placeholders removed`, 'blue');
  log('\n💡 Recommendation: Refresh the browser to see the new high-quality images!', 'blue');
  
  // Verify images are accessible
  log('\n🔍 Verifying image accessibility...', 'cyan');
  const baseUrl = 'http://localhost:4324';
  
  for (const filename of downloadedImages) {
    const imageUrl = filename.includes('github') 
      ? `${baseUrl}/images/deploy-automatico-wrangler-github-actions/${filename}`
      : `${baseUrl}/images/blog/${filename}`;
    
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        log(`✅ Accessible: ${filename}`, 'green');
      } else {
        log(`❌ Not accessible: ${filename} (${response.status})`, 'red');
      }
    } catch (error) {
      log(`❌ Error checking: ${filename}`, 'red');
    }
  }
  
  log('\n🎉 Quality images download complete!', 'green');
}

// Run the downloader
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { downloadImage, main };
