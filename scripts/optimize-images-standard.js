#!/usr/bin/env node

/**
 * Standard Image Optimization Script
 * 
 * Replaces complex custom image optimization system with standard tools:
 * - imagemin for optimization
 * - imagemin plugins for WebP, AVIF, JPEG, PNG
 * - sharp-cli for simple transformations
 * 
 * This script provides the same functionality as the custom system
 * but uses industry-standard tools with community support.
 */

import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import imageminAvif from 'imagemin-avif';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename, extname, parse } from 'path';
import { glob } from 'glob';

// Configuration matching the original system
const CONFIG = {
  INPUT_DIR: 'images/raw',
  OUTPUT_DIR: 'public/images',
  PRESETS: {
    default: { width: 1200, height: null, quality: 80 },
    og: { width: 1200, height: 630, quality: 80 },
    thumb: { width: 600, height: 315, quality: 80 },
    wsp: { width: 1080, height: 1080, quality: 80 },
    lqip: { width: 20, height: null, quality: 20 }
  },
  FORMATS: ['webp', 'avif', 'jpeg'],
  COVER_IMAGE_NAMES: ['portada', 'cover', 'featured']
};

class StandardImageOptimizer {
  constructor() {
    this.processed = 0;
    this.skipped = 0;
    this.errors = 0;
    this.totalSaved = 0;
  }

  async optimizeImages(options = {}) {
    const { postId, force = false, debug = false } = options;
    
    console.log('🔍 Starting image optimization with standard tools...\n');
    
    if (debug) {
      console.log('📋 Configuration:');
      console.log(`   Input: ${CONFIG.INPUT_DIR}`);
      console.log(`   Output: ${CONFIG.OUTPUT_DIR}`);
      console.log(`   Formats: ${CONFIG.FORMATS.join(', ')}`);
      console.log(`   Force: ${force}`);
      console.log('');
    }

    // Find images to process
    const pattern = postId 
      ? `${CONFIG.INPUT_DIR}/${postId}/**/*.{jpg,jpeg,png,webp}`
      : `${CONFIG.INPUT_DIR}/**/*.{jpg,jpeg,png,webp}`;
    
    const imageFiles = await glob(pattern);
    
    if (imageFiles.length === 0) {
      console.log('❌ No images found to process');
      return;
    }

    console.log(`📊 Found ${imageFiles.length} images to process\n`);

    for (const imagePath of imageFiles) {
      await this.processImage(imagePath, force, debug);
    }

    this.printSummary();
  }

  async processImage(imagePath, force, debug) {
    const fileName = basename(imagePath);
    const fileNameWithoutExt = parse(fileName).name;
    const relativePath = imagePath.replace(`${CONFIG.INPUT_DIR}/`, '');
    const outputDir = join(CONFIG.OUTPUT_DIR, dirname(relativePath));

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const isCoverImage = this.isCoverImage(fileNameWithoutExt);
    const presets = isCoverImage 
      ? Object.keys(CONFIG.PRESETS) 
      : ['default'];

    if (debug) {
      console.log(`📄 Processing: ${fileName}`);
      console.log(`   Type: ${isCoverImage ? 'Cover image' : 'Regular image'}`);
      console.log(`   Presets: ${presets.join(', ')}`);
    }

    for (const presetName of presets) {
      await this.processWithPreset(imagePath, outputDir, fileNameWithoutExt, presetName, force, debug);
    }
  }

  async processWithPreset(imagePath, outputDir, baseName, presetName, force, debug) {
    const preset = CONFIG.PRESETS[presetName];
    
    for (const format of CONFIG.FORMATS) {
      const outputFileName = presetName === 'default' 
        ? `${baseName}.${format}`
        : `${baseName}-${presetName}.${format}`;
      
      const outputPath = join(outputDir, outputFileName);

      // Skip if file exists and not forcing
      if (!force && existsSync(outputPath)) {
        const sourceStats = statSync(imagePath);
        const outputStats = statSync(outputPath);
        
        if (outputStats.mtime > sourceStats.mtime) {
          this.skipped++;
          if (debug) console.log(`   ⏭️  Skipped: ${outputFileName} (up to date)`);
          continue;
        }
      }

      try {
        await this.optimizeWithImagemin(imagePath, outputPath, format, preset, debug);
        this.processed++;
        
        if (debug) {
          const originalSize = statSync(imagePath).size;
          const optimizedSize = statSync(outputPath).size;
          const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
          console.log(`   ✅ Generated: ${outputFileName} (${savings}% smaller)`);
        }
      } catch (error) {
        this.errors++;
        console.error(`   ❌ Error processing ${outputFileName}:`, error.message);
      }
    }
  }

  async optimizeWithImagemin(inputPath, outputPath, format, preset, debug) {
    const plugins = [];
    
    // Configure plugins based on format
    switch (format) {
      case 'webp':
        plugins.push(imageminWebp({
          quality: preset.quality,
          resize: preset.width ? {
            width: preset.width,
            height: preset.height
          } : undefined
        }));
        break;
        
      case 'avif':
        plugins.push(imageminAvif({
          quality: Math.round(preset.quality * 0.8), // AVIF typically needs lower quality
          resize: preset.width ? {
            width: preset.width,
            height: preset.height
          } : undefined
        }));
        break;
        
      case 'jpeg':
        plugins.push(imageminMozjpeg({
          quality: preset.quality,
          progressive: true
        }));
        break;
        
      case 'png':
        plugins.push(imageminPngquant({
          quality: [0.6, preset.quality / 100]
        }));
        break;
    }

    // Process with imagemin
    const files = await imagemin([inputPath], {
      destination: dirname(outputPath),
      plugins
    });

    // Rename to correct output filename if needed
    if (files.length > 0) {
      const tempPath = files[0].destinationPath;
      if (tempPath !== outputPath) {
        const fs = await import('fs/promises');
        await fs.rename(tempPath, outputPath);
      }
    }
  }

  isCoverImage(fileName) {
    return CONFIG.COVER_IMAGE_NAMES.some(name => 
      fileName.toLowerCase().includes(name.toLowerCase())
    );
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMAGE OPTIMIZATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Processed: ${this.processed} images`);
    console.log(`⏭️  Skipped: ${this.skipped} images (up to date)`);
    console.log(`❌ Errors: ${this.errors} images`);
    console.log('='.repeat(60));
    
    if (this.errors === 0) {
      console.log('🎉 Image optimization completed successfully!');
    } else {
      console.log('⚠️  Image optimization completed with some errors');
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--postId' && args[i + 1]) {
      options.postId = args[i + 1];
      i++;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--debug') {
      options.debug = true;
    } else if (arg === '--help') {
      console.log(`
Image Optimization with Standard Tools

Usage:
  node scripts/optimize-images-standard.js [options]

Options:
  --postId <id>    Process specific post directory
  --force          Force regeneration of existing images
  --debug          Enable detailed logging
  --help           Show this help message

Examples:
  node scripts/optimize-images-standard.js
  node scripts/optimize-images-standard.js --postId=my-post --force
  node scripts/optimize-images-standard.js --debug
      `);
      process.exit(0);
    }
  }
  
  const optimizer = new StandardImageOptimizer();
  await optimizer.optimizeImages(options);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { StandardImageOptimizer };
