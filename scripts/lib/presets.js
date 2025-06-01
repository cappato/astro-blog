/**
 * Image optimization presets configuration
 * Centralizes all available formats and quality settings
 */

/**
 * Image optimization presets
 * Each preset defines width, height, format, quality and fit
 */
export const PRESETS = {
  // Default preset for general images
  default: {
    width: 1200,
    height: null,
    format: 'webp',
    quality: 80
  },

  // Open Graph for social media (WebP)
  og: {
    width: 1200,
    height: 630,
    format: 'webp',
    quality: 80,
    fit: 'cover'
  },

  // Open Graph in JPEG for better compatibility
  'og-jpg': {
    width: 1200,
    height: 630,
    format: 'jpeg',
    quality: 80,
    fit: 'cover'
  },

  // Thumbnails for previews
  thumb: {
    width: 600,
    height: 315,
    format: 'webp',
    quality: 80,
    fit: 'cover'
  },

  // WhatsApp Stories (square)
  wsp: {
    width: 1080,
    height: 1080,
    format: 'webp',
    quality: 80,
    fit: 'cover'
  },

  // AVIF for modern browsers
  'avif': {
    width: 1200,
    height: null,
    format: 'avif',
    quality: 65,
    fit: 'inside'
  },

  // Open Graph in AVIF
  'og-avif': {
    width: 1200,
    height: 630,
    format: 'avif',
    quality: 65,
    fit: 'cover'
  },

  // Low Quality Image Placeholder
  'lqip': {
    width: 20,
    height: null,
    format: 'webp',
    quality: 20,
    fit: 'inside'
  }
};

/**
 * Image optimization configuration constants
 */
export const IMAGE_CONFIG = {
  /** Default preset name */
  DEFAULT_PRESET: 'default',
  /** Minimum image dimensions for validation */
  MIN_DIMENSIONS: {
    width: 100,
    height: 100
  },
  /** Maximum file size in bytes (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  /** LQIP generation settings */
  LQIP: {
    width: 20,
    blur: 5,
    quality: 20
  }
};

/**
 * Project paths configuration
 */
export const PATHS = {
  RAW_DIR: 'images/raw',
  PUBLIC_DIR: 'public/images'
};

/**
 * Supported file extensions
 */
export const SUPPORTED_EXTENSIONS = /\.(jpg|jpeg|png|webp)$/i;

/**
 * Special files configuration
 */
export const SPECIAL_FILES = {
  COVER_PATTERN: /^portada\.(jpg|jpeg|png|webp)$/i
};

/**
 * Get preset by name
 * @param {string} presetName - Preset name
 * @returns {Object|null} Preset configuration or null if not found
 */
export function getPreset(presetName) {
  return PRESETS[presetName] || null;
}

/**
 * Get all available preset names
 * @returns {string[]} Array of preset names
 */
export function getPresetNames() {
  return Object.keys(PRESETS);
}

/**
 * Check if a file is a supported image
 * @param {string} filename - File name
 * @returns {boolean} True if supported extension
 */
export function isSupportedImage(filename) {
  return SUPPORTED_EXTENSIONS.test(filename);
}

/**
 * Check if a file is a cover image
 * @param {string} filename - File name
 * @returns {boolean} True if cover image
 */
export function isCoverImage(filename) {
  return SPECIAL_FILES.COVER_PATTERN.test(filename);
}

/**
 * Generate output filename with preset suffix
 * @param {string} baseName - Base name without extension
 * @param {string} presetName - Preset name
 * @param {string} format - Output format
 * @returns {string} Filename with suffix and extension
 */
export function generateOutputFilename(baseName, presetName, format) {
  const suffix = presetName === IMAGE_CONFIG.DEFAULT_PRESET ? '' : `-${presetName}`;
  return `${baseName}${suffix}.${format}`;
}

/**
 * Validate preset configuration
 * @param {Object} preset - Preset configuration
 * @returns {boolean} True if valid preset
 */
export function validatePreset(preset) {
  if (!preset || typeof preset !== 'object') return false;

  return !!(
    preset.format &&
    typeof preset.format === 'string' &&
    (preset.width || preset.height) &&
    preset.quality &&
    typeof preset.quality === 'number' &&
    preset.quality > 0 &&
    preset.quality <= 100
  );
}
