/**
 * Image Optimization Feature - Image Processor
 * 
 * Core image processing functionality using Sharp with
 * comprehensive validation and error handling.
 */

import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import type { 
  ProcessingResult, 
  LQIPResult, 
  ImageMetadata, 
  ImageValidationResult,
  ImagePreset,
  IImageProcessor,
  DimensionResult
} from './types.ts';
import { getPreset, generateOutputFilename } from './presets.ts';
import { 
  IMAGE_OPTIMIZATION_CONFIG, 
  ERROR_CODES, 
  ERROR_MESSAGES,
  SHARP_DEFAULTS,
  SPECIAL_FILES
} from './constants.ts';

/**
 * Image Processor Class
 * Handles all Sharp-based image processing operations
 */
export class ImageProcessor implements IImageProcessor {
  
  /**
   * Process image with specific preset
   */
  public async processImageWithPreset(
    sourcePath: string,
    outputDir: string,
    outputFileName: string,
    presetName: string
  ): Promise<ProcessingResult> {
    const preset = getPreset(presetName);
    
    if (!preset) {
      return {
        success: false,
        outputPath: '',
        outputFileName,
        preset: presetName,
        format: 'webp',
        size: 0,
        error: ERROR_MESSAGES[ERROR_CODES.INVALID_PRESET]
      };
    }

    const finalOutputFileName = generateOutputFilename(outputFileName, presetName, preset);
    const outputPath = path.join(outputDir, finalOutputFileName);

    // Ensure output directory exists
    await fs.ensureDir(outputDir);

    try {
      // Configure base transformation
      let transform = sharp(sourcePath).resize({
        width: preset.width,
        height: preset.height,
        fit: preset.fit || 'inside',
        ...SHARP_DEFAULTS.resize
      });

      // Apply specific format with optimized settings
      transform = this.applyFormat(transform, preset);

      // Save image
      await transform.toFile(outputPath);

      // Get generated file information
      const stats = await fs.stat(outputPath);

      return {
        success: true,
        outputPath,
        outputFileName: finalOutputFileName,
        preset: presetName,
        format: preset.format,
        size: stats.size,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        outputPath,
        outputFileName: finalOutputFileName,
        preset: presetName,
        format: preset.format,
        size: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Generate Low Quality Image Placeholder (LQIP)
   */
  public async generateLQIP(
    sourcePath: string,
    outputDir: string,
    baseName: string
  ): Promise<LQIPResult> {
    const lqipFileName = `${baseName}${SPECIAL_FILES.LQIP_SUFFIX}.webp`;
    const base64FileName = `${baseName}${SPECIAL_FILES.BASE64_SUFFIX}`;
    const lqipPath = path.join(outputDir, lqipFileName);
    const base64Path = path.join(outputDir, base64FileName);

    // Ensure output directory exists
    await fs.ensureDir(outputDir);

    try {
      // Generate LQIP image using centralized configuration
      await sharp(sourcePath)
        .resize(IMAGE_OPTIMIZATION_CONFIG.lqip.width)
        .blur(IMAGE_OPTIMIZATION_CONFIG.lqip.blur)
        .webp({ 
          quality: IMAGE_OPTIMIZATION_CONFIG.lqip.quality,
          ...SHARP_DEFAULTS.webp
        })
        .toFile(lqipPath);

      // Generate base64 version for inline use
      const lqipBuffer = await fs.readFile(lqipPath);
      const base64 = lqipBuffer.toString('base64');
      const dataUri = `data:image/webp;base64,${base64}`;

      await fs.writeFile(base64Path, dataUri);

      return {
        success: true,
        lqipPath,
        base64Path,
        dataUri,
        size: lqipBuffer.length,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        lqipPath,
        base64Path,
        dataUri: null,
        size: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Validate image file
   */
  public async validateImage(imagePath: string): Promise<ImageValidationResult> {
    try {
      // Check if file exists
      if (!await fs.pathExists(imagePath)) {
        return {
          valid: false,
          metadata: this.createEmptyMetadata(ERROR_MESSAGES[ERROR_CODES.FILE_NOT_FOUND]),
          error: ERROR_MESSAGES[ERROR_CODES.FILE_NOT_FOUND]
        };
      }

      // Get image metadata
      const metadata = await this.getImageMetadata(imagePath);
      
      if (!metadata.success) {
        return {
          valid: false,
          metadata,
          error: metadata.error
        };
      }

      // Validate dimensions
      if (metadata.width < IMAGE_OPTIMIZATION_CONFIG.minDimensions.width ||
          metadata.height < IMAGE_OPTIMIZATION_CONFIG.minDimensions.height) {
        return {
          valid: false,
          metadata,
          error: ERROR_MESSAGES[ERROR_CODES.INVALID_DIMENSIONS]
        };
      }

      // Check file size
      const stats = await fs.stat(imagePath);
      if (stats.size > IMAGE_OPTIMIZATION_CONFIG.maxFileSize) {
        return {
          valid: false,
          metadata,
          error: ERROR_MESSAGES[ERROR_CODES.FILE_TOO_LARGE]
        };
      }

      return {
        valid: true,
        metadata,
        error: null
      };
    } catch (error) {
      return {
        valid: false,
        metadata: this.createEmptyMetadata(error instanceof Error ? error.message : String(error)),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get image metadata
   */
  public async getImageMetadata(imagePath: string): Promise<ImageMetadata> {
    try {
      const metadata = await sharp(imagePath).metadata();
      
      return {
        success: true,
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || null,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
        hasProfile: metadata.hasProfile,
        hasAlpha: metadata.hasAlpha,
        error: null
      };
    } catch (error) {
      return this.createEmptyMetadata(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Calculate optimal dimensions for resizing
   */
  public calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight?: number
  ): DimensionResult {
    // Don't upscale images
    if (originalWidth <= targetWidth && (!targetHeight || originalHeight <= targetHeight)) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;

    if (!targetHeight) {
      // Only width constraint
      const newWidth = Math.min(originalWidth, targetWidth);
      const newHeight = Math.round(newWidth / aspectRatio);
      return { width: newWidth, height: newHeight };
    }

    // Both width and height constraints
    const widthRatio = targetWidth / originalWidth;
    const heightRatio = targetHeight / originalHeight;
    const ratio = Math.min(widthRatio, heightRatio);

    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  }

  /**
   * Apply format-specific optimizations
   */
  private applyFormat(transform: sharp.Sharp, preset: ImagePreset): sharp.Sharp {
    switch (preset.format) {
      case 'webp':
        return transform.webp({ 
          quality: preset.quality,
          ...SHARP_DEFAULTS.webp
        });
      
      case 'avif':
        return transform.avif({ 
          quality: preset.quality,
          ...SHARP_DEFAULTS.avif
        });
      
      case 'jpeg':
        return transform.jpeg({ 
          quality: preset.quality,
          ...SHARP_DEFAULTS.jpeg
        });
      
      case 'png':
        return transform.png({
          quality: preset.quality,
          ...SHARP_DEFAULTS.png
        });
      
      default:
        return transform.webp({ quality: preset.quality });
    }
  }

  /**
   * Create empty metadata object for errors
   */
  private createEmptyMetadata(error: string): ImageMetadata {
    return {
      success: false,
      width: 0,
      height: 0,
      format: null,
      error
    };
  }
}

// Export singleton instance
export const imageProcessor = new ImageProcessor();

// Export utility functions
export const {
  processImageWithPreset,
  generateLQIP,
  validateImage,
  getImageMetadata
} = imageProcessor;
