/**
 * Tests para el módulo de procesamiento de imágenes
 * Valida funciones de Sharp, validación y cálculos de dimensiones
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs-extra';
import {
  validateImage,
  getImageMetadata,
  calculateOptimalDimensions
} from '../image-processor.js';

// Mock de sharp
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

// Mock de fs-extra
vi.mock('fs-extra');

describe('calculateOptimalDimensions function', () => {
  it('should calculate dimensions with width only', () => {
    const result = calculateOptimalDimensions(1600, 900, 1200);
    
    expect(result.width).toBe(1200);
    expect(result.height).toBe(675); // 1200 / (1600/900) = 675
  });

  it('should not upscale images', () => {
    const result = calculateOptimalDimensions(800, 600, 1200);
    
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
  });

  it('should calculate dimensions with width and height constraints', () => {
    // Imagen más ancha que alta, limitada por ancho
    const result1 = calculateOptimalDimensions(1600, 900, 1200, 800);
    expect(result1.width).toBe(1200);
    expect(result1.height).toBe(675);

    // Imagen más alta que ancha, limitada por alto
    const result2 = calculateOptimalDimensions(900, 1600, 1200, 800);
    expect(result2.width).toBe(450);
    expect(result2.height).toBe(800);
  });

  it('should handle square images', () => {
    const result = calculateOptimalDimensions(1000, 1000, 800);
    
    expect(result.width).toBe(800);
    expect(result.height).toBe(800);
  });

  it('should handle very wide images', () => {
    const result = calculateOptimalDimensions(3000, 500, 1200);
    
    expect(result.width).toBe(1200);
    expect(result.height).toBe(200); // Mantiene aspect ratio
  });

  it('should handle very tall images', () => {
    const result = calculateOptimalDimensions(500, 3000, 1200, 800);
    
    expect(result.width).toBe(133); // Limitado por altura
    expect(result.height).toBe(800);
  });

  it('should round dimensions to integers', () => {
    // Caso que produce decimales
    const result = calculateOptimalDimensions(1333, 1000, 1200);
    
    expect(Number.isInteger(result.width)).toBe(true);
    expect(Number.isInteger(result.height)).toBe(true);
    expect(result.width).toBe(1200);
    expect(result.height).toBe(900); // Redondeado
  });
});

describe('getImageMetadata function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return metadata for valid images', async () => {
    const mockMetadata = {
      width: 1920,
      height: 1080,
      format: 'jpeg',
      space: 'srgb',
      channels: 3,
      depth: 'uchar',
      density: 72,
      hasProfile: false,
      hasAlpha: false
    };

    const sharp = await import('sharp');
    const mockSharpInstance = {
      metadata: vi.fn().mockResolvedValue(mockMetadata)
    };
    sharp.default.mockReturnValue(mockSharpInstance);

    const result = await getImageMetadata('/path/to/image.jpg');

    expect(result.success).toBe(true);
    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
    expect(result.format).toBe('jpeg');
    expect(result.space).toBe('srgb');
    expect(result.channels).toBe(3);
    expect(result.depth).toBe('uchar');
    expect(result.density).toBe(72);
    expect(result.hasProfile).toBe(false);
    expect(result.hasAlpha).toBe(false);
    expect(result.error).toBeNull();
  });

  it('should handle metadata extraction errors', async () => {
    const sharp = await import('sharp');
    const mockSharpInstance = {
      metadata: vi.fn().mockRejectedValue(new Error('Invalid image format'))
    };
    sharp.default.mockReturnValue(mockSharpInstance);

    const result = await getImageMetadata('/path/to/invalid.jpg');

    expect(result.success).toBe(false);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
    expect(result.format).toBeNull();
    expect(result.error).toBe('Invalid image format');
  });

  it('should handle different image formats', async () => {
    const formats = [
      { format: 'png', hasAlpha: true },
      { format: 'webp', hasAlpha: false },
      { format: 'avif', hasAlpha: true },
      { format: 'gif', hasAlpha: false }
    ];

    const sharp = await import('sharp');

    for (const formatData of formats) {
      const mockMetadata = {
        width: 800,
        height: 600,
        format: formatData.format,
        hasAlpha: formatData.hasAlpha,
        channels: formatData.hasAlpha ? 4 : 3
      };

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue(mockMetadata)
      };
      sharp.default.mockReturnValue(mockSharpInstance);

      const result = await getImageMetadata(`/path/to/image.${formatData.format}`);

      expect(result.success).toBe(true);
      expect(result.format).toBe(formatData.format);
      expect(result.hasAlpha).toBe(formatData.hasAlpha);
    }
  });
});

describe('validateImage function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return invalid for non-existent files', async () => {
    fs.existsSync.mockReturnValue(false);

    const result = await validateImage('/path/to/nonexistent.jpg');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('El archivo no existe');
  });

  it('should return invalid for files with unreadable metadata', async () => {
    fs.existsSync.mockReturnValue(true);

    const sharp = await import('sharp');
    const mockSharpInstance = {
      metadata: vi.fn().mockRejectedValue(new Error('Cannot read metadata'))
    };
    sharp.default.mockReturnValue(mockSharpInstance);

    const result = await validateImage('/path/to/corrupted.jpg');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('No se pueden leer los metadatos: Cannot read metadata');
  });

  it('should return invalid for images that are too small', async () => {
    fs.existsSync.mockReturnValue(true);

    const mockMetadata = {
      width: 5,
      height: 5,
      format: 'jpeg'
    };

    const sharp = await import('sharp');
    const mockSharpInstance = {
      metadata: vi.fn().mockResolvedValue(mockMetadata)
    };
    sharp.default.mockReturnValue(mockSharpInstance);

    const result = await validateImage('/path/to/tiny.jpg');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('La imagen es demasiado pequeña (mínimo 10x10px)');
  });

  it('should return invalid for unsupported formats', async () => {
    fs.existsSync.mockReturnValue(true);

    const mockMetadata = {
      width: 800,
      height: 600,
      format: 'bmp' // formato no soportado
    };

    const sharp = await import('sharp');
    const mockSharpInstance = {
      metadata: vi.fn().mockResolvedValue(mockMetadata)
    };
    sharp.default.mockReturnValue(mockSharpInstance);

    const result = await validateImage('/path/to/image.bmp');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Formato no soportado: bmp');
  });

  it('should return valid for correct images', async () => {
    fs.existsSync.mockReturnValue(true);

    const mockMetadata = {
      width: 1920,
      height: 1080,
      format: 'jpeg'
    };

    const sharp = await import('sharp');
    const mockSharpInstance = {
      metadata: vi.fn().mockResolvedValue(mockMetadata)
    };
    sharp.default.mockReturnValue(mockSharpInstance);

    const result = await validateImage('/path/to/valid.jpg');

    expect(result.valid).toBe(true);
    expect(result.metadata).toBeDefined();
    expect(result.metadata.success).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should validate all supported formats', async () => {
    fs.existsSync.mockReturnValue(true);

    const supportedFormats = ['jpeg', 'png', 'webp', 'gif', 'tiff', 'avif'];

    const sharp = await import('sharp');

    for (const format of supportedFormats) {
      const mockMetadata = {
        width: 800,
        height: 600,
        format: format
      };

      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue(mockMetadata)
      };
      sharp.default.mockReturnValue(mockSharpInstance);

      const result = await validateImage(`/path/to/image.${format}`);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    }
  });

  it('should handle edge case dimensions', async () => {
    fs.existsSync.mockReturnValue(true);

    const sharp = await import('sharp');

    // Caso límite: exactamente 10x10 (mínimo válido)
    const mockMetadata1 = {
      width: 10,
      height: 10,
      format: 'jpeg'
    };

    const mockSharpInstance1 = {
      metadata: vi.fn().mockResolvedValue(mockMetadata1)
    };
    sharp.default.mockReturnValue(mockSharpInstance1);

    const result1 = await validateImage('/path/to/minimum.jpg');
    expect(result1.valid).toBe(true);

    // Caso límite: 9x10 (inválido por ancho)
    const mockMetadata2 = {
      width: 9,
      height: 10,
      format: 'jpeg'
    };

    const mockSharpInstance2 = {
      metadata: vi.fn().mockResolvedValue(mockMetadata2)
    };
    sharp.default.mockReturnValue(mockSharpInstance2);

    const result2 = await validateImage('/path/to/too-narrow.jpg');
    expect(result2.valid).toBe(false);
  });
});
