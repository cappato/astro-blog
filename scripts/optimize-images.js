#!/usr/bin/env node
/**
 * Image optimization script - refactored version
 * Modular and maintainable image optimizer for blog posts
 *
 * USAGE EXAMPLES:
 * ---------------
 *
 * 1. Optimize all images from all posts:
 *    node scripts/optimize-images.js
 *
 * 2. Optimize images from a specific post:
 *    node scripts/optimize-images.js --postId=bienvenida
 *
 * 3. Force regeneration of all images:
 *    node scripts/optimize-images.js --force
 *
 * 4. Optimize a specific image:
 *    node scripts/optimize-images.js --file=images/raw/section/image.jpg
 *
 * 5. Debug mode with detailed information:
 *    node scripts/optimize-images.js --debug
 */

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

// Import refactored modules
import { PRESETS, getPreset, getPresetNames, IMAGE_CONFIG, generateOutputFilename, validatePreset } from './lib/presets.js';
import {
  ensureDirectories,
  getPostDirectories,
  getPostImages,
  needsProcessing,
  createOutputDirectory,
  resolveFilePath
} from './lib/file-utils.js';
import {
  processImageWithPreset,
  generateLQIP,
  validateImage
} from './lib/image-processor.js';
import { logger, setLogLevel } from './lib/logger.js';

/**
 * Command line arguments configuration
 */
const argv = yargs(hideBin(process.argv))
  .option('postId', {
    alias: 'p',
    type: 'string',
    description: 'Post ID to process'
  })
  .option('force', {
    alias: 'f',
    type: 'boolean',
    description: 'Force regeneration of all images'
  })
  .option('file', {
    alias: 'i',
    type: 'string',
    description: 'Specific image file path to process'
  })
  .option('debug', {
    alias: 'd',
    type: 'boolean',
    description: 'Enable debug mode with detailed information'
  })
  .option('preset', {
    type: 'string',
    description: 'Specific preset to apply (for use with --file)',
    choices: getPresetNames()
  })
  .help()
  .alias('help', 'h')
  .argv;

/**
 * Process an individual image with a preset
 * @param {string} sourcePath - Source image path
 * @param {string} outputDir - Output directory
 * @param {string} fileName - File name
 * @param {string} presetName - Preset name
 * @param {boolean} force - Force regeneration
 * @returns {Promise<boolean>} True if processed successfully
 */
async function processImage(sourcePath, outputDir, fileName, presetName, force = false) {
  // Validate preset exists and is valid
  const preset = getPreset(presetName);
  if (!preset) {
    logger.error(`Preset not found: ${presetName}`);
    return false;
  }

  if (!validatePreset(preset)) {
    logger.error(`Invalid preset configuration: ${presetName}`);
    return false;
  }

  // Generate output filename using centralized function
  const baseName = fileName.split('.')[0];
  const outputFileName = generateOutputFilename(baseName, presetName, preset.format);
  const outputPath = `${outputDir}/${outputFileName}`;

  if (!needsProcessing(sourcePath, outputPath, force)) {
    logger.skipped(`${outputFileName} (no changes)`);
    return true;
  }

  // Validate image before processing
  const validation = await validateImage(sourcePath);
  if (!validation.valid) {
    logger.error(`Invalid image ${sourcePath}: ${validation.error}`);
    return false;
  }

  logger.processing(`${outputFileName}...`);

  // Process image
  const result = await processImageWithPreset(sourcePath, outputDir, fileName, preset, presetName);

  if (result.success) {
    const sizeKB = (result.size / 1024).toFixed(1);
    logger.success(`${result.outputFileName} (${sizeKB} KB)`);
    return true;
  } else {
    logger.error(`Error processing ${sourcePath}`, new Error(result.error));
    return false;
  }
}

/**
 * Process all images from a post
 * @param {string} postId - Post ID
 * @param {boolean} force - Force regeneration
 * @returns {Promise<boolean>} True if processed successfully
 */
async function processPost(postId, force = false) {
  const images = getPostImages(postId);

  if (!images.exists) {
    logger.error(`Directory not found for post "${postId}"`);
    return false;
  }

  logger.section(`Processing post: ${postId}`);

  if (images.allImages.length === 0) {
    logger.warn(`No images found in post ${postId}`);
    return true;
  }

  logger.info(`Found ${images.allImages.length} images`);

  // Create output directory
  const outputDir = createOutputDirectory(postId);

  let processedCount = 0;
  let totalImages = 0;

  // Process cover image with all presets
  if (images.coverImage) {
    logger.info(`Cover image found: ${images.coverImage}`);
    const coverPath = `${images.directory}/${images.coverImage}`;

    totalImages += getPresetNames().length;

    for (const presetName of getPresetNames()) {
      const success = await processImage(coverPath, outputDir, images.coverImage, presetName, force);
      if (success) processedCount++;

      logger.progress(processedCount, totalImages, 'cover');
    }

    // Generate LQIP for cover image
    if (getPreset('lqip')) {
      logger.processing('Generating LQIP...');
      const baseName = images.coverImage.split('.')[0];
      const lqipResult = await generateLQIP(coverPath, outputDir, baseName);

      if (lqipResult.success) {
        logger.success(`LQIP generated (${(lqipResult.size / 1024).toFixed(1)} KB)`);
      } else {
        logger.error('Error generating LQIP', new Error(lqipResult.error));
      }
    }
  } else {
    logger.warn('Cover image not found (portada.jpg/png/webp)');
    logger.warn('Social media variants will not be generated');
  }

  // Process other images with default preset only
  if (images.otherImages.length > 0) {
    totalImages += images.otherImages.length;

    for (const image of images.otherImages) {
      const imagePath = `${images.directory}/${image}`;
      const success = await processImage(imagePath, outputDir, image, IMAGE_CONFIG.DEFAULT_PRESET, force);
      if (success) processedCount++;

      logger.progress(processedCount, totalImages, 'other images');
    }
  }

  return processedCount > 0;
}

/**
 * Process a specific file
 * @param {string} filePath - File path
 * @param {string} presetName - Preset to apply
 * @param {boolean} force - Force regeneration
 * @returns {Promise<boolean>} True if processed successfully
 */
async function processSpecificFile(filePath, presetName = IMAGE_CONFIG.DEFAULT_PRESET, force = false) {
  // Validate preset before processing
  if (!getPreset(presetName)) {
    logger.error(`Invalid preset: ${presetName}`);
    return false;
  }

  const fileInfo = resolveFilePath(filePath);

  if (!fileInfo.exists) {
    logger.error(`File not found: ${filePath}`);
    return false;
  }

  logger.section(`Processing specific file: ${filePath}`);

  // Validate image
  const validation = await validateImage(fileInfo.absolutePath);
  if (!validation.valid) {
    logger.error(`Invalid image: ${validation.error}`);
    return false;
  }

  // Create output directory
  const outputDir = fileInfo.outputPath.split('/').slice(0, -1).join('/');

  // Process with specified preset
  const fileName = fileInfo.relativePath;
  return await processImage(fileInfo.absolutePath, outputDir, fileName, presetName, force);
}

/**
 * Main function
 */
async function main() {
  // Configure logging
  if (argv.debug) {
    setLogLevel('debug');
  }

  logger.start('Starting image optimization...');

  // Ensure directories exist
  ensureDirectories();

  try {
    // Process specific file
    if (argv.file) {
      const preset = argv.preset || IMAGE_CONFIG.DEFAULT_PRESET;
      const success = await processSpecificFile(argv.file, preset, argv.force);

      if (success) {
        logger.finish('Specific file optimization completed');
      } else {
        logger.error('Error in file optimization');
        process.exit(1);
      }
      return;
    }

    // Process specific post
    if (argv.postId) {
      const success = await processPost(argv.postId, argv.force);

      if (success) {
        logger.finish(`Post "${argv.postId}" optimization completed`);
      } else {
        logger.error(`Error in post "${argv.postId}" optimization`);
        process.exit(1);
      }
      return;
    }

    // Process all posts
    const postDirs = getPostDirectories();

    if (postDirs.length === 0) {
      logger.warn('No post directories found in images/raw/');
      return;
    }

    logger.info(`Found ${postDirs.length} post directories`);

    let successCount = 0;
    for (const postId of postDirs) {
      const success = await processPost(postId, argv.force);
      if (success) successCount++;
    }

    if (successCount === postDirs.length) {
      logger.finish('All posts optimization completed');
    } else {
      logger.warn(`Completed ${successCount} of ${postDirs.length} posts`);
    }

  } catch (error) {
    logger.error('Error in main process', error);
    process.exit(1);
  }
}

// Execute script
main().catch(error => {
  logger.error('Fatal error', error);
  process.exit(1);
});
