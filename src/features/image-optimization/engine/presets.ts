/**
 * Image Optimization Feature - Preset Configuration
 * 
 * Centralized preset definitions for different image optimization scenarios
 * with validation and utility functions.
 */

import type { ImagePreset, PresetValidationResult } from './types.ts';
import { VALIDATION_RULES, ERROR_CODES, ERROR_MESSAGES, NAMING_CONVENTIONS } from './constants.ts';

/** Image optimization presets */
export const IMAGE_PRESETS: Record<string, ImagePreset> = {
  /** Default preset for general images */
  default: {
    width: 1200,
    height: null,
    format: 'webp',
    quality: 80
  },

  /** Open Graph for social media (WebP) */
  og: {
    width: 1200,
    height: 630,
    format: 'webp',
    quality: 80,
    fit: 'cover'
  },

  /** Open Graph in JPEG for better compatibility */
  'og-jpg': {
    width: 1200,
    height: 630,
    format: 'jpeg',
    quality: 80,
    fit: 'cover'
  },

  /** Thumbnails for previews */
  thumb: {
    width: 600,
    height: 315,
    format: 'webp',
    quality: 80,
    fit: 'cover'
  },

  /** WhatsApp Stories (square) */
  wsp: {
    width: 1080,
    height: 1080,
    format: 'webp',
    quality: 80,
    fit: 'cover'
  },

  /** AVIF for modern browsers */
  avif: {
    width: 1200,
    height: null,
    format: 'avif',
    quality: 65,
    fit: 'inside'
  },

  /** Open Graph in AVIF */
  'og-avif': {
    width: 1200,
    height: 630,
    format: 'avif',
    quality: 65,
    fit: 'cover'
  },

  /** Low Quality Image Placeholder */
  lqip: {
    width: 20,
    height: null,
    format: 'webp',
    quality: 20,
    fit: 'inside'
  }
} as const;

/**
 * Get preset by name
 */
export function getPreset(presetName: string): ImagePreset | null {
  return IMAGE_PRESETS[presetName] || null;
}

/**
 * Get all available preset names
 */
export function getPresetNames(): string[] {
  return Object.keys(IMAGE_PRESETS);
}

/**
 * Check if preset exists
 */
export function hasPreset(presetName: string): boolean {
  return presetName in IMAGE_PRESETS;
}

/**
 * Validate preset configuration
 */
export function validatePreset(preset: Partial<ImagePreset>): PresetValidationResult {
  const errors: string[] = [];

  // Validate width
  if (!preset.width || typeof preset.width !== 'number') {
    errors.push('Width is required and must be a number');
  } else if (preset.width < VALIDATION_RULES.MIN_WIDTH || preset.width > VALIDATION_RULES.MAX_WIDTH) {
    errors.push(`Width must be between ${VALIDATION_RULES.MIN_WIDTH} and ${VALIDATION_RULES.MAX_WIDTH}`);
  }

  // Validate height (optional)
  if (preset.height !== null && preset.height !== undefined) {
    if (typeof preset.height !== 'number') {
      errors.push('Height must be a number or null');
    } else if (preset.height < VALIDATION_RULES.MIN_HEIGHT || preset.height > VALIDATION_RULES.MAX_HEIGHT) {
      errors.push(`Height must be between ${VALIDATION_RULES.MIN_HEIGHT} and ${VALIDATION_RULES.MAX_HEIGHT}`);
    }
  }

  // Validate format
  if (!preset.format || typeof preset.format !== 'string') {
    errors.push('Format is required and must be a string');
  } else if (!VALIDATION_RULES.SUPPORTED_FORMATS.includes(preset.format as any)) {
    errors.push(`Format must be one of: ${VALIDATION_RULES.SUPPORTED_FORMATS.join(', ')}`);
  }

  // Validate quality
  if (!preset.quality || typeof preset.quality !== 'number') {
    errors.push('Quality is required and must be a number');
  } else if (preset.quality < VALIDATION_RULES.MIN_QUALITY || preset.quality > VALIDATION_RULES.MAX_QUALITY) {
    errors.push(`Quality must be between ${VALIDATION_RULES.MIN_QUALITY} and ${VALIDATION_RULES.MAX_QUALITY}`);
  }

  // Validate fit (optional)
  if (preset.fit && typeof preset.fit !== 'string') {
    errors.push('Fit must be a string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate output filename based on preset and input
 */
export function generateOutputFilename(
  inputFileName: string,
  presetName: string,
  preset: ImagePreset
): string {
  const baseName = inputFileName.replace(/\.[^/.]+$/, ''); // Remove extension
  const extension = NAMING_CONVENTIONS.EXTENSIONS[preset.format] || `.${preset.format}`;
  
  if (presetName === 'default') {
    return `${baseName}${extension}`;
  }
  
  return `${baseName}${NAMING_CONVENTIONS.PRESET_SEPARATOR}${presetName}${extension}`;
}

/**
 * Check if image file is supported
 */
export function isSupportedImage(filename: string): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  return ext ? VALIDATION_RULES.SUPPORTED_FORMATS.includes(ext as any) : false;
}

/**
 * Check if image is a cover image
 */
export function isCoverImage(filename: string): boolean {
  return /^portada\.(jpg|jpeg|png|webp|avif)$/i.test(filename);
}

/**
 * Get preset for cover images (returns all presets except default)
 */
export function getCoverImagePresets(): string[] {
  return getPresetNames().filter(name => name !== 'default');
}

/**
 * Get preset for other images (returns only default)
 */
export function getOtherImagePresets(): string[] {
  return ['default'];
}

/**
 * Create custom preset
 */
export function createCustomPreset(
  name: string,
  config: Partial<ImagePreset>
): ImagePreset | null {
  const validation = validatePreset(config);
  
  if (!validation.valid) {
    console.error(`Invalid preset configuration for "${name}":`, validation.errors);
    return null;
  }

  return {
    width: config.width!,
    height: config.height || null,
    format: config.format!,
    quality: config.quality!,
    fit: config.fit
  };
}

/**
 * Get preset by image type and purpose
 */
export function getPresetByPurpose(
  isCover: boolean,
  purpose: 'default' | 'social' | 'thumbnail' | 'modern' = 'default'
): string[] {
  if (!isCover) {
    return ['default'];
  }

  switch (purpose) {
    case 'social':
      return ['og', 'og-jpg', 'wsp'];
    case 'thumbnail':
      return ['thumb'];
    case 'modern':
      return ['avif', 'og-avif'];
    case 'default':
    default:
      return getPresetNames();
  }
}

/**
 * Get recommended presets for different scenarios
 */
export function getRecommendedPresets(): Record<string, string[]> {
  return {
    blog_post: ['default', 'og', 'og-jpg', 'thumb', 'avif', 'lqip'],
    social_media: ['og', 'og-jpg', 'wsp', 'og-avif'],
    thumbnails: ['thumb'],
    modern_browsers: ['avif', 'og-avif'],
    compatibility: ['og-jpg', 'default'],
    performance: ['lqip', 'webp', 'avif']
  };
}

/**
 * Calculate output file size estimation
 */
export function estimateOutputSize(
  inputWidth: number,
  inputHeight: number,
  preset: ImagePreset
): number {
  const outputWidth = Math.min(inputWidth, preset.width);
  const outputHeight = preset.height 
    ? Math.min(inputHeight, preset.height)
    : Math.round(outputHeight * (outputWidth / inputWidth));

  const pixels = outputWidth * outputHeight;
  
  // Rough estimation based on format and quality
  const bytesPerPixel = {
    webp: 0.5 + (preset.quality / 100) * 1.5,
    avif: 0.3 + (preset.quality / 100) * 1.2,
    jpeg: 0.8 + (preset.quality / 100) * 2.0,
    png: 3.0 // PNG is lossless, quality doesn't affect much
  };

  return Math.round(pixels * (bytesPerPixel[preset.format] || 1.0));
}
