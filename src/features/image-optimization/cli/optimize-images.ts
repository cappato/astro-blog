#!/usr/bin/env node
/**
 * Image Optimization Feature - CLI Interface
 *
 * Modular CLI for image optimization with comprehensive
 * argument parsing and processing workflow.
 */

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import type { CLIArguments, ProcessingStats } from '../engine/types.ts';
import { imageProcessor } from '../engine/image-processor.ts';
import { fileUtils } from '../engine/file-utils.ts';
import { logger, setLogLevel } from '../engine/logger.ts';
import {
  getPreset,
  getPresetNames,
  getCoverImagePresets,
  getOtherImagePresets,
  generateOutputFilename
} from '../engine/presets.ts';
import { IMAGE_OPTIMIZATION_CONFIG } from '../engine/constants.ts';

/**
 * CLI Configuration and Argument Parsing
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
  .option('preset', {
    type: 'string',
    description: 'Specific preset to apply (for use with --file)',
    choices: getPresetNames()
  })
  .option('debug', {
    alias: 'd',
    type: 'boolean',
    description: 'Enable debug mode with detailed information'
  })
  .option('stats', {
    alias: 's',
    type: 'boolean',
    description: 'Show detailed processing statistics'
  })
  .option('dry-run', {
    type: 'boolean',
    description: 'Show what would be processed without actually processing'
  })
  .help()
  .alias('help', 'h')
  .example('$0', 'Optimize all images from all posts')
  .example('$0 --postId=my-post', 'Optimize images from specific post')
  .example('$0 --file=images/raw/post/image.jpg --preset=og', 'Optimize specific file with preset')
  .example('$0 --force --debug', 'Force regeneration with debug output')
  .argv as CLIArguments & { stats?: boolean; 'dry-run'?: boolean };

/**
 * Image Optimization CLI Class
 */
export class ImageOptimizationCLI {
  private stats: ProcessingStats;

  constructor() {
    this.stats = {
      totalImages: 0,
      processedImages: 0,
      skippedImages: 0,
      errorImages: 0,
      startTime: new Date()
    };
  }

  /**
   * Main CLI execution
   */
  public async run(): Promise<void> {
    try {
      // Set log level based on debug flag
      if (argv.debug) {
        setLogLevel('debug');
      }

      logger.info('️  Image Optimization CLI - Modular Feature');
      logger.separator();

      // Ensure required directories exist
      fileUtils.ensureDirectories();

      // Process based on arguments
      if (argv.file) {
        await this.processSpecificFile();
      } else if (argv.postId) {
        await this.processPost(argv.postId);
      } else {
        await this.processAllPosts();
      }

      // Finalize stats and show summary
      this.finalizeStats();

      if (argv.stats) {
        this.showDetailedStats();
      }

      logger.finish('Image optimization completed successfully');

    } catch (error) {
      logger.error('Fatal error in CLI execution', error);
      process.exit(1);
    }
  }

  /**
   * Process specific file
   */
  private async processSpecificFile(): Promise<void> {
    const filePath = argv.file!;
    const preset = argv.preset || IMAGE_OPTIMIZATION_CONFIG.defaultPreset;

    logger.info(`Processing specific file: ${filePath}`);
    logger.info(`Using preset: ${preset}`);

    if (argv['dry-run']) {
      logger.info('DRY RUN: Would process file with specified preset');
      return;
    }

    const resolution = fileUtils.resolveFilePath(filePath);

    if (!resolution.exists) {
      logger.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    if (!resolution.isInRawDir) {
      logger.warn('File is not in raw images directory, processing anyway...');
    }

    const validation = await imageProcessor.validateImage(resolution.absolutePath);

    if (!validation.valid) {
      logger.error(`Invalid image file: ${validation.error}`);
      process.exit(1);
    }

    const outputDir = path.dirname(resolution.outputPath);
    const outputFileName = path.basename(filePath);

    const result = await imageProcessor.processImageWithPreset(
      resolution.absolutePath,
      outputDir,
      outputFileName,
      preset
    );

    if (result.success) {
      logger.info(` Generated: ${result.outputPath} (${this.formatFileSize(result.size)})`);
      this.stats.processedImages++;
    } else {
      logger.error(` Failed to process: ${result.error}`);
      this.stats.errorImages++;
    }

    this.stats.totalImages = 1;
  }

  /**
   * Process specific post
   */
  private async processPost(postId: string): Promise<void> {
    logger.info(`Processing post: ${postId}`);

    const images = fileUtils.getPostImages(postId);

    if (images.coverImages.length === 0 && images.otherImages.length === 0) {
      logger.warn(`No images found for post: ${postId}`);
      return;
    }

    const outputDir = fileUtils.createOutputDirectory(postId);
    let processedCount = 0;

    // Process cover images with all presets
    if (images.coverImages.length > 0) {
      logger.info(`Processing ${images.coverImages.length} cover image(s)`);

      for (const image of images.coverImages) {
        const imagePath = path.join(images.directory, image);
        const presets = getCoverImagePresets();

        this.stats.totalImages += presets.length;

        for (const presetName of presets) {
          if (argv['dry-run']) {
            logger.debug(`DRY RUN: Would process ${image} with preset ${presetName}`);
            continue;
          }

          const success = await this.processImage(imagePath, outputDir, image, presetName, argv.force || false);
          if (success) processedCount++;

          logger.progress(processedCount, this.stats.totalImages, 'cover images');
        }

        // Generate LQIP for cover images
        if (!argv['dry-run']) {
          const lqipResult = await imageProcessor.generateLQIP(imagePath, outputDir, 'portada');
          if (lqipResult.success) {
            logger.debug(` Generated LQIP: ${lqipResult.lqipPath}`);
          }
        }
      }
    }

    // Process other images with default preset only
    if (images.otherImages.length > 0) {
      logger.info(`Processing ${images.otherImages.length} other image(s)`);
      this.stats.totalImages += images.otherImages.length;

      for (const image of images.otherImages) {
        const imagePath = path.join(images.directory, image);

        if (argv['dry-run']) {
          logger.debug(`DRY RUN: Would process ${image} with default preset`);
          continue;
        }

        const success = await this.processImage(
          imagePath,
          outputDir,
          image,
          IMAGE_OPTIMIZATION_CONFIG.defaultPreset,
          argv.force || false
        );
        if (success) processedCount++;

        logger.progress(processedCount, this.stats.totalImages, 'other images');
      }
    }

    logger.info(`Post "${postId}" processing completed`);
  }

  /**
   * Process all posts
   */
  private async processAllPosts(): Promise<void> {
    const postDirs = fileUtils.getPostDirectories();

    if (postDirs.length === 0) {
      logger.warn('No post directories found in images/raw/');
      return;
    }

    logger.info(`Found ${postDirs.length} post directories`);

    if (argv['dry-run']) {
      logger.info('DRY RUN: Would process the following posts:');
      postDirs.forEach(postId => logger.info(`  - ${postId}`));
      return;
    }

    for (const postId of postDirs) {
      await this.processPost(postId);
      logger.separator();
    }
  }

  /**
   * Process individual image
   */
  private async processImage(
    imagePath: string,
    outputDir: string,
    fileName: string,
    presetName: string,
    force: boolean
  ): Promise<boolean> {
    const preset = getPreset(presetName);
    if (!preset) {
      logger.error(`Invalid preset: ${presetName}`);
      this.stats.errorImages++;
      return false;
    }

    const outputFileName = generateOutputFilename(fileName, presetName, preset);
    const outputPath = path.join(outputDir, outputFileName);

    // Check if processing is needed
    if (!fileUtils.needsProcessing(imagePath, outputPath, force)) {
      logger.debug(`⏭️  Skipping: ${outputFileName} (up to date)`);
      this.stats.skippedImages++;
      return false;
    }

    // Validate image
    const validation = await imageProcessor.validateImage(imagePath);
    if (!validation.valid) {
      logger.error(` Invalid image ${fileName}: ${validation.error}`);
      this.stats.errorImages++;
      return false;
    }

    // Process image
    const result = await imageProcessor.processImageWithPreset(
      imagePath,
      outputDir,
      fileName,
      presetName
    );

    if (result.success) {
      logger.debug(` Generated: ${outputFileName} (${this.formatFileSize(result.size)})`);
      this.stats.processedImages++;
      return true;
    } else {
      logger.error(` Failed ${fileName} [${presetName}]: ${result.error}`);
      this.stats.errorImages++;
      return false;
    }
  }

  /**
   * Finalize processing statistics
   */
  private finalizeStats(): void {
    this.stats.endTime = new Date();
    this.stats.duration = this.stats.endTime.getTime() - this.stats.startTime.getTime();
  }

  /**
   * Show detailed statistics
   */
  private showDetailedStats(): void {
    logger.stats({
      total: this.stats.totalImages,
      processed: this.stats.processedImages,
      skipped: this.stats.skippedImages,
      errors: this.stats.errorImages,
      duration: this.stats.duration
    });
  }

  /**
   * Format file size in human readable format
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

// Execute CLI if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new ImageOptimizationCLI();
  cli.run().catch(error => {
    logger.error('CLI execution failed', error);
    process.exit(1);
  });
}
