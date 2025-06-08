/**
 * Imagemin Configuration
 * 
 * Replaces complex custom image optimization system with standard configuration.
 * This file defines presets and settings that match the original system's functionality
 * but uses industry-standard imagemin plugins.
 */

import imageminWebp from 'imagemin-webp';
import imageminAvif from 'imagemin-avif';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';

// Image optimization presets matching the original system
export const PRESETS = {
  // Default preset for regular images
  default: {
    width: 1200,
    height: null,
    quality: 80,
    formats: ['webp', 'avif', 'jpeg']
  },
  
  // Open Graph preset for social media
  og: {
    width: 1200,
    height: 630,
    quality: 80,
    formats: ['webp', 'jpeg'],
    fit: 'cover'
  },
  
  // Thumbnail preset
  thumb: {
    width: 600,
    height: 315,
    quality: 80,
    formats: ['webp', 'jpeg'],
    fit: 'cover'
  },
  
  // WhatsApp Stories preset
  wsp: {
    width: 1080,
    height: 1080,
    quality: 80,
    formats: ['webp', 'jpeg'],
    fit: 'cover'
  },
  
  // Low Quality Image Placeholder
  lqip: {
    width: 20,
    height: null,
    quality: 20,
    formats: ['webp'],
    blur: 5
  }
};

// Imagemin plugin configurations
export const PLUGINS = {
  webp: (options = {}) => imageminWebp({
    quality: options.quality || 80,
    method: 6, // Best compression
    resize: options.resize || null,
    crop: options.crop || null
  }),
  
  avif: (options = {}) => imageminAvif({
    quality: Math.round((options.quality || 80) * 0.8), // AVIF needs lower quality
    speed: 6, // Balance between speed and compression
    resize: options.resize || null,
    crop: options.crop || null
  }),
  
  jpeg: (options = {}) => imageminMozjpeg({
    quality: options.quality || 80,
    progressive: true,
    optimize: true
  }),
  
  png: (options = {}) => imageminPngquant({
    quality: [0.6, (options.quality || 80) / 100],
    speed: 1, // Best compression
    strip: true // Remove metadata
  })
};

// Path configuration
export const PATHS = {
  input: 'images/raw',
  output: 'public/images',
  patterns: {
    all: '**/*.{jpg,jpeg,png,webp,gif}',
    covers: '**/{portada,cover,featured}.{jpg,jpeg,png,webp}',
    post: (postId) => `${postId}/**/*.{jpg,jpeg,png,webp,gif}`
  }
};

// File naming configuration
export const NAMING = {
  // Generate output filename based on preset
  getOutputName: (baseName, preset, format) => {
    if (preset === 'default') {
      return `${baseName}.${format}`;
    }
    return `${baseName}-${preset}.${format}`;
  },
  
  // Check if image is a cover image
  isCoverImage: (fileName) => {
    const coverNames = ['portada', 'cover', 'featured'];
    const baseName = fileName.toLowerCase().replace(/\.[^/.]+$/, '');
    return coverNames.some(name => baseName.includes(name));
  }
};

// Optimization configuration
export const OPTIMIZATION = {
  // Which presets to apply to different image types
  getPresetsForImage: (fileName) => {
    if (NAMING.isCoverImage(fileName)) {
      // Cover images get all presets
      return Object.keys(PRESETS);
    } else {
      // Regular images get only default preset
      return ['default'];
    }
  },
  
  // Skip processing if output is newer than source
  shouldSkip: (sourcePath, outputPath, force = false) => {
    if (force) return false;
    
    try {
      const fs = require('fs');
      if (!fs.existsSync(outputPath)) return false;
      
      const sourceStats = fs.statSync(sourcePath);
      const outputStats = fs.statSync(outputPath);
      
      return outputStats.mtime > sourceStats.mtime;
    } catch {
      return false;
    }
  }
};

// Quality settings for different use cases
export const QUALITY_PROFILES = {
  // High quality for hero images
  high: {
    webp: 90,
    avif: 75,
    jpeg: 90,
    png: 95
  },
  
  // Standard quality for most images
  standard: {
    webp: 80,
    avif: 65,
    jpeg: 80,
    png: 85
  },
  
  // Lower quality for thumbnails
  low: {
    webp: 70,
    avif: 55,
    jpeg: 70,
    png: 75
  },
  
  // Minimal quality for placeholders
  placeholder: {
    webp: 20,
    avif: 15,
    jpeg: 30,
    png: 40
  }
};

// Export default configuration
export default {
  presets: PRESETS,
  plugins: PLUGINS,
  paths: PATHS,
  naming: NAMING,
  optimization: OPTIMIZATION,
  quality: QUALITY_PROFILES
};
