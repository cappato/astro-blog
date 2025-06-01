/**
 * Image Optimization Feature - Comprehensive Test Suite
 * 
 * Unified tests for all image optimization functionality
 * including engine, CLI, and component integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';

// Import feature modules (excluding Astro component for testing)
import {
  IMAGE_PRESETS,
  getPreset,
  getPresetNames,
  validatePreset,
  generateOutputFilename,
  isSupportedImage,
  isCoverImage
} from '../engine/presets.ts';
import { ImageProcessor } from '../engine/image-processor.ts';
import { FileUtils } from '../engine/file-utils.ts';
import { Logger } from '../engine/logger.ts';
import { IMAGE_OPTIMIZATION_CONFIG } from '../engine/constants.ts';

// Mock dependencies
vi.mock('sharp', () => {
  const mockSharp = vi.fn(() => ({
    metadata: vi.fn(),
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    png: vi.fn().mockReturnThis(),
    avif: vi.fn().mockReturnThis(),
    blur: vi.fn().mockReturnThis(),
    toFile: vi.fn(),
    toBuffer: vi.fn()
  }));
  
  return { default: mockSharp };
});

vi.mock('fs-extra');

describe('Image Optimization Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Exports', () => {
    it('should export all required components', () => {
      expect(ImageProcessor).toBeDefined();
      expect(FileUtils).toBeDefined();
      expect(Logger).toBeDefined();
    });

    it('should export all preset functions', () => {
      expect(getPreset).toBeDefined();
      expect(getPresetNames).toBeDefined();
      expect(validatePreset).toBeDefined();
      expect(generateOutputFilename).toBeDefined();
    });

    it('should export utility functions', () => {
      expect(isSupportedImage).toBeDefined();
      expect(isCoverImage).toBeDefined();
    });

    it('should export configuration constants', () => {
      expect(IMAGE_PRESETS).toBeDefined();
      expect(IMAGE_OPTIMIZATION_CONFIG).toBeDefined();
    });
  });

  describe('Image Presets', () => {
    it('should have all required presets', () => {
      const expectedPresets = ['default', 'og', 'og-jpg', 'thumb', 'wsp', 'avif', 'og-avif', 'lqip'];
      const actualPresets = getPresetNames();
      
      expectedPresets.forEach(preset => {
        expect(actualPresets).toContain(preset);
      });
    });

    it('should return valid preset configurations', () => {
      const defaultPreset = getPreset('default');
      
      expect(defaultPreset).toEqual({
        width: 1200,
        height: null,
        format: 'webp',
        quality: 80
      });
    });

    it('should return null for invalid presets', () => {
      expect(getPreset('invalid')).toBeNull();
      expect(getPreset('')).toBeNull();
    });

    it('should validate preset configurations correctly', () => {
      const validPreset = {
        width: 800,
        height: 600,
        format: 'webp' as const,
        quality: 80
      };

      const result = validatePreset(validPreset);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid preset configurations', () => {
      const invalidPreset = {
        width: -100,
        format: 'invalid' as any,
        quality: 150
      };

      const result = validatePreset(invalidPreset);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('File Utilities', () => {
    let fileUtils: FileUtils;

    beforeEach(() => {
      fileUtils = new FileUtils();
    });

    it('should identify supported image formats', () => {
      expect(isSupportedImage('image.jpg')).toBe(true);
      expect(isSupportedImage('image.png')).toBe(true);
      expect(isSupportedImage('image.webp')).toBe(true);
      expect(isSupportedImage('image.avif')).toBe(true);
      expect(isSupportedImage('document.pdf')).toBe(false);
      expect(isSupportedImage('video.mp4')).toBe(false);
    });

    it('should identify cover images', () => {
      expect(isCoverImage('portada.jpg')).toBe(true);
      expect(isCoverImage('portada.png')).toBe(true);
      expect(isCoverImage('portada.webp')).toBe(true);
      expect(isCoverImage('other-image.jpg')).toBe(false);
      expect(isCoverImage('logo.png')).toBe(false);
    });

    it('should determine if processing is needed', () => {
      // Force processing
      expect(fileUtils.needsProcessing('/source.jpg', '/output.webp', true)).toBe(true);
      
      // Output doesn't exist
      fs.existsSync.mockReturnValue(false);
      expect(fileUtils.needsProcessing('/source.jpg', '/output.webp', false)).toBe(true);
    });

    it('should resolve file paths correctly', () => {
      fs.existsSync.mockReturnValue(true);
      
      const result = fileUtils.resolveFilePath('/project/images/raw/post/image.jpg', '/project');
      
      expect(result.exists).toBe(true);
      expect(result.isInRawDir).toBe(true);
      expect(result.relativePath).toBe('post/image.jpg');
    });
  });

  describe('Image Processor', () => {
    let imageProcessor: ImageProcessor;

    beforeEach(() => {
      imageProcessor = new ImageProcessor();
    });

    it('should calculate optimal dimensions correctly', () => {
      // Don't upscale
      const result1 = imageProcessor.calculateOptimalDimensions(800, 600, 1200);
      expect(result1.width).toBe(800);
      expect(result1.height).toBe(600);

      // Scale down maintaining aspect ratio
      const result2 = imageProcessor.calculateOptimalDimensions(1600, 900, 1200);
      expect(result2.width).toBe(1200);
      expect(result2.height).toBe(675);
    });

    it('should validate images correctly', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.stat.mockResolvedValue({ size: 1024 * 1024 }); // 1MB

      const sharp = await import('sharp');
      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({
          width: 1920,
          height: 1080,
          format: 'jpeg'
        })
      };
      sharp.default.mockReturnValue(mockSharpInstance);

      const result = await imageProcessor.validateImage('/path/to/image.jpg');
      
      expect(result.valid).toBe(true);
      expect(result.metadata.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject invalid images', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await imageProcessor.validateImage('/path/to/nonexistent.jpg');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('Logger', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('info');
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should respect log levels', () => {
      logger.setLevel('error');
      
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('should format messages correctly', () => {
      logger.info('test message');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]')
      );
    });

    it('should handle progress updates', () => {
      vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
      
      logger.progress(5, 10, 'processing');
      
      expect(process.stdout.write).toHaveBeenCalledWith(
        expect.stringContaining('50%')
      );
    });
  });

  describe('Filename Generation', () => {
    it('should generate correct output filenames', () => {
      const preset = getPreset('og')!;
      
      const result = generateOutputFilename('portada.jpg', 'og', preset);
      expect(result).toBe('portada-og.webp');
    });

    it('should handle default preset correctly', () => {
      const preset = getPreset('default')!;
      
      const result = generateOutputFilename('image.jpg', 'default', preset);
      expect(result).toBe('image.webp');
    });

    it('should preserve base filename', () => {
      const preset = getPreset('thumb')!;
      
      const result = generateOutputFilename('my-image.png', 'thumb', preset);
      expect(result).toBe('my-image-thumb.webp');
    });
  });

  describe('Class Instantiation', () => {
    it('should create processor instance', () => {
      const processor = new ImageProcessor();
      expect(processor).toBeInstanceOf(ImageProcessor);
    });

    it('should create file utils instance', () => {
      const fileUtils = new FileUtils();
      expect(fileUtils).toBeInstanceOf(FileUtils);
    });

    it('should create logger instance', () => {
      const logger = new Logger();
      expect(logger).toBeInstanceOf(Logger);
    });
  });

  describe('Configuration', () => {
    it('should have valid default configuration', () => {
      expect(IMAGE_OPTIMIZATION_CONFIG.defaultPreset).toBe('default');
      expect(IMAGE_OPTIMIZATION_CONFIG.minDimensions.width).toBeGreaterThan(0);
      expect(IMAGE_OPTIMIZATION_CONFIG.minDimensions.height).toBeGreaterThan(0);
      expect(IMAGE_OPTIMIZATION_CONFIG.maxFileSize).toBeGreaterThan(0);
    });

    it('should have valid LQIP configuration', () => {
      const lqipConfig = IMAGE_OPTIMIZATION_CONFIG.lqip;
      
      expect(lqipConfig.width).toBeGreaterThan(0);
      expect(lqipConfig.blur).toBeGreaterThan(0);
      expect(lqipConfig.quality).toBeGreaterThan(0);
      expect(lqipConfig.quality).toBeLessThanOrEqual(100);
    });
  });
});
