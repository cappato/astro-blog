/**
 * Image Optimization Feature - Public API
 *
 * Centralized exports for the complete image optimization system
 * with CLI, components, and programmatic interfaces.
 */

import path from 'path';

// ============================================================================
// NOTE: This is a pure TypeScript/JavaScript image processing engine
// No Astro components - this feature is framework-agnostic
// ============================================================================

// ============================================================================
// ENGINE CLASSES
// ============================================================================

export { ImageProcessor, imageProcessor } from './engine/image-processor.ts';
export { FileUtils, fileUtils } from './engine/file-utils.ts';
export { Logger, logger, setLogLevel } from './engine/logger.ts';

// ============================================================================
// PRESETS AND CONFIGURATION
// ============================================================================

export {
  IMAGE_PRESETS,
  getPreset,
  getPresetNames,
  hasPreset,
  validatePreset,
  generateOutputFilename,
  isSupportedImage,
  isCoverImage,
  getCoverImagePresets,
  getOtherImagePresets,
  createCustomPreset,
  getPresetByPurpose,
  getRecommendedPresets,
  estimateOutputSize
} from './engine/presets.ts';

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

export {
  IMAGE_OPTIMIZATION_CONFIG,
  PROJECT_PATHS,
  SUPPORTED_EXTENSIONS,
  SPECIAL_FILES,
  ERROR_CODES,
  ERROR_MESSAGES,
  VALIDATION_RULES,
  CLI_CONFIG,
  PERFORMANCE_CONFIG,
  CACHE_CONFIG,
  FEATURE_METADATA,
  SHARP_DEFAULTS,
  NAMING_CONVENTIONS
} from './engine/constants.ts';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export {
  processImageWithPreset,
  generateLQIP,
  validateImage,
  getImageMetadata
} from './engine/image-processor.ts';

export {
  ensureDirectories,
  getPostDirectories,
  getPostImages,
  needsProcessing,
  createOutputDirectory,
  resolveFilePath
} from './engine/file-utils.ts';

// ============================================================================
// CLI INTERFACE
// ============================================================================

export { ImageOptimizationCLI } from './cli/optimize-images.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type {
  // Core types
  ImageFormat,
  FitOption,
  LogLevel,
  ImagePreset,
  ImageOptimizationConfig,
  ProjectPaths,
  
  // Processing types
  ProcessingResult,
  LQIPResult,
  ImageMetadata,
  ImageValidationResult,
  ProcessingStats,
  
  // File types
  FileInfo,
  FileResolutionResult,
  PostImages,
  
  // Component types
  OptimizedImageProps,
  ImageSourceSet,
  DimensionResult,
  
  // CLI types
  CLIArguments,
  
  // Validation types
  PresetValidationResult,
  ImageOptimizationError,
  
  // Interface types
  IImageProcessor,
  IFileUtils,
  ILogger,
  
  // Feature metadata
  FeatureMetadata
} from './engine/types.ts';

// ============================================================================
// FEATURE METADATA
// ============================================================================

export const FEATURE_INFO = {
  name: 'image-optimization',
  version: '1.0.0',
  description: 'Framework-agnostic image optimization engine with CLI interface',
  
  classes: {
    ImageProcessor: 'ImageProcessor',
    FileUtils: 'FileUtils',
    Logger: 'Logger',
    CLI: 'ImageOptimizationCLI'
  },
  
  utilities: {
    processImage: 'processImageWithPreset',
    generateLQIP: 'generateLQIP',
    validateImage: 'validateImage',
    getMetadata: 'getImageMetadata'
  },
  
  presets: {
    getPreset: 'getPreset',
    getAllPresets: 'getPresetNames',
    validatePreset: 'validatePreset',
    createCustom: 'createCustomPreset'
  },
  
  fileUtils: {
    ensureDirectories: 'ensureDirectories',
    getPostDirectories: 'getPostDirectories',
    getPostImages: 'getPostImages',
    needsProcessing: 'needsProcessing'
  }
} as const;

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick setup function for basic image optimization
 */
export async function setupImageOptimization(options?: {
  customPaths?: Partial<ProjectPaths>;
  logLevel?: LogLevel;
}): Promise<{
  processor: ImageProcessor;
  fileUtils: FileUtils;
  logger: Logger;
}> {
  const { customPaths, logLevel = 'info' } = options || {};
  
  // Create instances with custom configuration
  const processor = new ImageProcessor();
  const utils = new FileUtils(customPaths);
  const log = new Logger(logLevel);
  
  // Ensure directories exist
  utils.ensureDirectories();
  
  log.info('Image optimization system initialized');
  
  return {
    processor,
    fileUtils: utils,
    logger: log
  };
}

/**
 * Process a single image with default settings
 */
export async function optimizeImage(
  sourcePath: string,
  outputDir: string,
  options?: {
    preset?: string;
    force?: boolean;
    generateLQIP?: boolean;
  }
): Promise<ProcessingResult> {
  const { preset = 'default', force = false, generateLQIP: shouldGenerateLQIP = false } = options || {};
  
  const fileName = path.basename(sourcePath);
  const result = await processImageWithPreset(sourcePath, outputDir, fileName, preset);
  
  // Generate LQIP if requested and processing was successful
  if (shouldGenerateLQIP && result.success && isCoverImage(fileName)) {
    const baseName = path.parse(fileName).name;
    await generateLQIP(sourcePath, outputDir, baseName);
  }
  
  return result;
}

/**
 * Batch process multiple images
 */
export async function optimizeImages(
  imagePaths: string[],
  outputDir: string,
  options?: {
    preset?: string;
    force?: boolean;
    onProgress?: (current: number, total: number) => void;
  }
): Promise<ProcessingResult[]> {
  const { preset = 'default', force = false, onProgress } = options || {};
  const results: ProcessingResult[] = [];
  
  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i];
    const fileName = path.basename(imagePath);
    
    const result = await processImageWithPreset(imagePath, outputDir, fileName, preset);
    results.push(result);
    
    if (onProgress) {
      onProgress(i + 1, imagePaths.length);
    }
  }
  
  return results;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Main classes
  ImageProcessor,
  FileUtils,
  Logger,
  ImageOptimizationCLI,

  // Utility functions
  optimizeImage,
  optimizeImages,
  setupImageOptimization,

  // Configuration
  FEATURE_INFO,
  IMAGE_OPTIMIZATION_CONFIG,
  IMAGE_PRESETS,

  // Quick access to commonly used functions
  getPreset,
  validateImage,
  processImageWithPreset,
  generateLQIP
};
