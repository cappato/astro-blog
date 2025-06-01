/**
 * Image Optimization Feature - Constants and Configuration
 * 
 * Centralized configuration for image optimization system
 * with presets, paths, and validation rules.
 */

import type { ImageOptimizationConfig, ProjectPaths } from './types.ts';

/** Default image optimization configuration */
export const IMAGE_OPTIMIZATION_CONFIG: ImageOptimizationConfig = {
  /** Default preset name */
  defaultPreset: 'default',
  
  /** Minimum image dimensions for validation */
  minDimensions: {
    width: 100,
    height: 100
  },
  
  /** Maximum file size in bytes (10MB) */
  maxFileSize: 10 * 1024 * 1024,
  
  /** LQIP generation settings */
  lqip: {
    width: 20,
    blur: 5,
    quality: 20
  }
} as const;

/** Project paths configuration */
export const PROJECT_PATHS: ProjectPaths = {
  rawDir: 'images/raw',
  publicDir: 'public/images'
} as const;

/** Supported file extensions pattern */
export const SUPPORTED_EXTENSIONS = /\.(jpg|jpeg|png|webp|avif|gif|tiff)$/i;

/** Special files configuration */
export const SPECIAL_FILES = {
  /** Cover image pattern */
  COVER_PATTERN: /^portada\.(jpg|jpeg|png|webp)$/i,
  
  /** LQIP file suffix */
  LQIP_SUFFIX: '-lqip',
  
  /** Base64 file suffix */
  BASE64_SUFFIX: '-lqip.txt'
} as const;

/** Error codes for image optimization */
export const ERROR_CODES = {
  INVALID_IMAGE: 'INVALID_IMAGE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  INVALID_PRESET: 'INVALID_PRESET',
  INVALID_DIMENSIONS: 'INVALID_DIMENSIONS',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  DIRECTORY_ERROR: 'DIRECTORY_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR'
} as const;

/** Error messages */
export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_IMAGE]: 'Invalid image file or corrupted data',
  [ERROR_CODES.UNSUPPORTED_FORMAT]: 'Unsupported image format',
  [ERROR_CODES.FILE_NOT_FOUND]: 'Image file not found',
  [ERROR_CODES.PROCESSING_FAILED]: 'Image processing failed',
  [ERROR_CODES.INVALID_PRESET]: 'Invalid or unknown preset',
  [ERROR_CODES.INVALID_DIMENSIONS]: 'Image dimensions are too small',
  [ERROR_CODES.FILE_TOO_LARGE]: 'Image file size exceeds maximum limit',
  [ERROR_CODES.DIRECTORY_ERROR]: 'Directory creation or access error',
  [ERROR_CODES.PERMISSION_ERROR]: 'Insufficient permissions for file operations'
} as const;

/** Validation rules */
export const VALIDATION_RULES = {
  /** Minimum image width */
  MIN_WIDTH: 100,
  
  /** Minimum image height */
  MIN_HEIGHT: 100,
  
  /** Maximum image width */
  MAX_WIDTH: 8000,
  
  /** Maximum image height */
  MAX_HEIGHT: 8000,
  
  /** Quality range */
  MIN_QUALITY: 1,
  MAX_QUALITY: 100,
  
  /** Supported formats for validation */
  SUPPORTED_FORMATS: ['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif', 'tiff'] as const
} as const;

/** CLI configuration */
export const CLI_CONFIG = {
  /** Default log level */
  DEFAULT_LOG_LEVEL: 'info' as const,
  
  /** Progress update interval */
  PROGRESS_INTERVAL: 100,
  
  /** CLI colors */
  COLORS: {
    SUCCESS: '\x1b[32m',
    ERROR: '\x1b[31m',
    WARNING: '\x1b[33m',
    INFO: '\x1b[36m',
    RESET: '\x1b[0m'
  }
} as const;

/** Performance configuration */
export const PERFORMANCE_CONFIG = {
  /** Concurrent processing limit */
  MAX_CONCURRENT: 4,
  
  /** Memory limit for Sharp operations */
  MEMORY_LIMIT: 512 * 1024 * 1024, // 512MB
  
  /** Timeout for individual image processing (30 seconds) */
  PROCESSING_TIMEOUT: 30 * 1000
} as const;

/** Cache configuration */
export const CACHE_CONFIG = {
  /** Enable file modification time checking */
  CHECK_MTIME: true,
  
  /** Cache directory for temporary files */
  TEMP_DIR: '.image-cache',
  
  /** Cache cleanup interval (24 hours) */
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000
} as const;

/** Feature metadata */
export const FEATURE_METADATA = {
  name: 'image-optimization',
  version: '1.0.0',
  description: 'Complete image optimization system with CLI and component integration',
  author: 'Augment Agent',
  dependencies: ['sharp', 'fs-extra', 'yargs', 'astro'],
  exports: {
    components: ['OptimizedImage'],
    classes: ['ImageProcessor', 'FileUtils', 'Logger'],
    utilities: ['processImage', 'generateLQIP', 'validateImage'],
    types: ['ImagePreset', 'ProcessingResult', 'OptimizedImageProps']
  },
  capabilities: [
    'Multi-format image optimization (WebP, AVIF, JPEG, PNG)',
    'LQIP (Low Quality Image Placeholder) generation',
    'Social media preset optimization (OG, thumbnails, WhatsApp)',
    'CLI interface with comprehensive options',
    'Astro component integration',
    'Comprehensive validation and error handling',
    'Performance optimization with concurrent processing',
    'TypeScript type safety'
  ],
  integrations: {
    cli: ['npm run optimize-images'],
    components: ['OptimizedImage.astro'],
    scripts: ['optimize-images.js']
  }
} as const;

/** Default Sharp options */
export const SHARP_DEFAULTS = {
  /** Default resize options */
  resize: {
    withoutEnlargement: true,
    fastShrinkOnLoad: true
  },
  
  /** Default WebP options */
  webp: {
    effort: 4,
    smartSubsample: true
  },
  
  /** Default AVIF options */
  avif: {
    effort: 4,
    chromaSubsampling: '4:2:0'
  },
  
  /** Default JPEG options */
  jpeg: {
    progressive: true,
    mozjpeg: true
  },
  
  /** Default PNG options */
  png: {
    compressionLevel: 9,
    adaptiveFiltering: true
  }
} as const;

/** File naming conventions */
export const NAMING_CONVENTIONS = {
  /** Preset suffix separator */
  PRESET_SEPARATOR: '-',
  
  /** Output file extensions by format */
  EXTENSIONS: {
    webp: '.webp',
    avif: '.avif',
    jpeg: '.jpeg',
    png: '.png'
  },
  
  /** Reserved filenames */
  RESERVED_NAMES: ['lqip', 'base64', 'metadata']
} as const;
