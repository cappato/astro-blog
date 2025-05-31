/**
 * Tests para el módulo de presets
 * Valida configuración, validación de archivos y generación de nombres
 */

import { describe, it, expect } from 'vitest';
import {
  PRESETS,
  PATHS,
  SUPPORTED_EXTENSIONS,
  SPECIAL_FILES,
  getPreset,
  getPresetNames,
  isSupportedImage,
  isCoverImage,
  generateOutputFilename
} from '../presets.js';

// Test constants for image processing
const TEST_CONSTANTS = {
  DIMENSIONS: {
    DEFAULT_WIDTH: 1200,
    OG_WIDTH: 1200,
    OG_HEIGHT: 630,
    LQIP_WIDTH: 20,
  },
  QUALITY: {
    DEFAULT: 80,
    LQIP: 20,
  },
  FORMATS: {
    WEBP: 'webp',
    JPG: 'jpg',
    AVIF: 'avif',
  },
  PATHS: {
    RAW_DIR: 'images/raw',
    PUBLIC_DIR: 'public/images',
  },
  PRESETS: {
    EXPECTED: ['default', 'og', 'og-jpg', 'thumb', 'wsp', 'avif', 'og-avif', 'lqip'],
  }
};

describe('PRESETS configuration', () => {
  it('should have all required presets', () => {
    const actualPresets = Object.keys(PRESETS);

    TEST_CONSTANTS.PRESETS.EXPECTED.forEach(preset => {
      expect(actualPresets).toContain(preset);
    });
  });

  it('should have valid preset configurations', () => {
    Object.entries(PRESETS).forEach(([name, preset]) => {
      expect(preset).toHaveProperty('width');
      expect(preset).toHaveProperty('format');
      expect(preset).toHaveProperty('quality');

      expect(typeof preset.width).toBe('number');
      expect(typeof preset.format).toBe('string');
      expect(typeof preset.quality).toBe('number');

      // Validar rangos
      expect(preset.width).toBeGreaterThan(0);
      expect(preset.quality).toBeGreaterThan(0);
      expect(preset.quality).toBeLessThanOrEqual(100);

      // Validar formatos soportados
      const supportedFormats = ['webp', 'jpeg', 'png', 'avif'];
      expect(supportedFormats).toContain(preset.format);
    });
  });

  it('should have specific preset configurations', () => {
    // Default preset
    expect(PRESETS.default).toEqual({
      width: TEST_CONSTANTS.DIMENSIONS.DEFAULT_WIDTH,
      height: null,
      format: TEST_CONSTANTS.FORMATS.WEBP,
      quality: TEST_CONSTANTS.QUALITY.DEFAULT
    });

    // Open Graph preset
    expect(PRESETS.og).toEqual({
      width: TEST_CONSTANTS.DIMENSIONS.OG_WIDTH,
      height: TEST_CONSTANTS.DIMENSIONS.OG_HEIGHT,
      format: TEST_CONSTANTS.FORMATS.WEBP,
      quality: TEST_CONSTANTS.QUALITY.DEFAULT,
      fit: 'cover'
    });

    // LQIP preset
    expect(PRESETS.lqip).toEqual({
      width: TEST_CONSTANTS.DIMENSIONS.LQIP_WIDTH,
      height: null,
      format: TEST_CONSTANTS.FORMATS.WEBP,
      quality: TEST_CONSTANTS.QUALITY.LQIP,
      fit: 'inside'
    });
  });
});

describe('PATHS configuration', () => {
  it('should have correct path configuration', () => {
    expect(PATHS.RAW_DIR).toBe(TEST_CONSTANTS.PATHS.RAW_DIR);
    expect(PATHS.PUBLIC_DIR).toBe(TEST_CONSTANTS.PATHS.PUBLIC_DIR);
  });
});

describe('getPreset function', () => {
  it('should return correct preset for valid names', () => {
    const defaultPreset = getPreset('default');
    expect(defaultPreset).toEqual(PRESETS.default);

    const ogPreset = getPreset('og');
    expect(ogPreset).toEqual(PRESETS.og);
  });

  it('should return null for invalid preset names', () => {
    expect(getPreset('invalid')).toBeNull();
    expect(getPreset('')).toBeNull();
    expect(getPreset(null)).toBeNull();
    expect(getPreset(undefined)).toBeNull();
  });
});

describe('getPresetNames function', () => {
  it('should return all preset names', () => {
    const names = getPresetNames();
    expect(Array.isArray(names)).toBe(true);
    expect(names.length).toBeGreaterThan(0);
    expect(names).toContain('default');
    expect(names).toContain('og');
    expect(names).toContain('lqip');
  });

  it('should return names in consistent order', () => {
    const names1 = getPresetNames();
    const names2 = getPresetNames();
    expect(names1).toEqual(names2);
  });
});

describe('isSupportedImage function', () => {
  it('should return true for supported image extensions', () => {
    const supportedFiles = [
      'image.jpg',
      'photo.jpeg',
      'picture.png',
      'graphic.webp',
      'IMAGE.JPG',
      'PHOTO.JPEG',
      'test.PNG',
      'file.WEBP'
    ];

    supportedFiles.forEach(filename => {
      expect(isSupportedImage(filename)).toBe(true);
    });
  });

  it('should return false for unsupported extensions', () => {
    const unsupportedFiles = [
      'document.pdf',
      'video.mp4',
      'audio.mp3',
      'text.txt',
      'data.json',
      'style.css',
      'script.js',
      'image', // sin extensión
      'image.',
      '.hidden' // archivo oculto
    ];

    unsupportedFiles.forEach(filename => {
      const result = isSupportedImage(filename);
      if (result) {
        console.log(`Unexpected supported file: ${filename}`);
      }
      expect(result).toBe(false);
    });
  });

  it('should handle edge cases', () => {
    expect(isSupportedImage('')).toBe(false);
    expect(isSupportedImage('.')).toBe(false);
    expect(isSupportedImage('..')).toBe(false);
  });
});

describe('isCoverImage function', () => {
  it('should return true for cover image files', () => {
    const coverFiles = [
      'portada.jpg',
      'portada.jpeg',
      'portada.png',
      'portada.webp',
      'PORTADA.JPG',
      'Portada.PNG',
      'PORTADA.WEBP'
    ];

    coverFiles.forEach(filename => {
      expect(isCoverImage(filename)).toBe(true);
    });
  });

  it('should return false for non-cover image files', () => {
    const nonCoverFiles = [
      'imagen.jpg',
      'photo.png',
      'picture.webp',
      'portada', // sin extensión
      'portada.pdf',
      'mi-portada.jpg', // con prefijo
      'portada-thumb.jpg', // con sufijo
      'cover.jpg' // nombre diferente
    ];

    nonCoverFiles.forEach(filename => {
      expect(isCoverImage(filename)).toBe(false);
    });
  });
});

describe('generateOutputFilename function', () => {
  it('should generate correct filenames for default preset', () => {
    const result = generateOutputFilename('imagen', 'default', 'webp');
    expect(result).toBe('imagen.webp');
  });

  it('should generate correct filenames for named presets', () => {
    const result1 = generateOutputFilename('portada', 'og', 'webp');
    expect(result1).toBe('portada-og.webp');

    const result2 = generateOutputFilename('photo', 'thumb', 'jpeg');
    expect(result2).toBe('photo-thumb.jpeg');

    const result3 = generateOutputFilename('image', 'lqip', 'webp');
    expect(result3).toBe('image-lqip.webp');
  });

  it('should handle different formats correctly', () => {
    const formats = ['webp', 'jpeg', 'png', 'avif'];

    formats.forEach(format => {
      const result = generateOutputFilename('test', 'og', format);
      expect(result).toBe(`test-og.${format}`);
    });
  });

  it('should handle edge cases', () => {
    // Nombres vacíos
    expect(generateOutputFilename('', 'default', 'webp')).toBe('.webp');
    expect(generateOutputFilename('test', '', 'webp')).toBe('test-.webp');

    // Caracteres especiales en nombres
    expect(generateOutputFilename('test-image', 'og', 'webp')).toBe('test-image-og.webp');
    expect(generateOutputFilename('test_image', 'thumb', 'jpeg')).toBe('test_image-thumb.jpeg');
  });
});
