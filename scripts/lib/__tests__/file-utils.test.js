/**
 * Tests para el módulo de utilidades de archivos
 * Valida operaciones del sistema de archivos y detección de cambios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import {
  getProjectPaths,
  needsProcessing,
  resolveFilePath,
  getFileInfo
} from '../file-utils.js';

// Mock de fs-extra para tests
vi.mock('fs-extra');

describe('getProjectPaths function', () => {
  it('should return correct paths with default cwd', () => {
    const paths = getProjectPaths('/test/project');

    expect(paths.rawDir).toBe('/test/project/images/raw');
    expect(paths.publicDir).toBe('/test/project/public/images');
  });

  it('should handle different working directories', () => {
    const paths1 = getProjectPaths('/home/user/blog');
    expect(paths1.rawDir).toBe('/home/user/blog/images/raw');
    expect(paths1.publicDir).toBe('/home/user/blog/public/images');

    const paths2 = getProjectPaths('/var/www/site');
    expect(paths2.rawDir).toBe('/var/www/site/images/raw');
    expect(paths2.publicDir).toBe('/var/www/site/public/images');
  });

  it('should handle relative paths', () => {
    const paths = getProjectPaths('./project');
    expect(paths.rawDir).toBe('project/images/raw');
    expect(paths.publicDir).toBe('project/public/images');
  });
});

describe('needsProcessing function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when force is enabled', () => {
    // Mock que el archivo de salida existe
    fs.existsSync.mockReturnValue(true);

    const result = needsProcessing('/source/image.jpg', '/output/image.webp', true);
    expect(result).toBe(true);
  });

  it('should return true when output file does not exist', () => {
    fs.existsSync.mockReturnValue(false);

    const result = needsProcessing('/source/image.jpg', '/output/image.webp', false);
    expect(result).toBe(true);
  });

  it('should return true when source is newer than output', () => {
    fs.existsSync.mockReturnValue(true);

    // Mock stats - source más reciente
    const sourceStats = { mtimeMs: 1000 };
    const outputStats = { mtimeMs: 500 };

    fs.statSync
      .mockReturnValueOnce(sourceStats) // primera llamada (source)
      .mockReturnValueOnce(outputStats); // segunda llamada (output)

    const result = needsProcessing('/source/image.jpg', '/output/image.webp', false);
    expect(result).toBe(true);
  });

  it('should return false when output is newer than source', () => {
    fs.existsSync.mockReturnValue(true);

    // Mock stats - output más reciente
    const sourceStats = { mtimeMs: 500 };
    const outputStats = { mtimeMs: 1000 };

    fs.statSync
      .mockReturnValueOnce(sourceStats)
      .mockReturnValueOnce(outputStats);

    const result = needsProcessing('/source/image.jpg', '/output/image.webp', false);
    expect(result).toBe(false);
  });

  it('should return false when files have same timestamp', () => {
    fs.existsSync.mockReturnValue(true);

    const sameStats = { mtimeMs: 1000 };
    fs.statSync.mockReturnValue(sameStats);

    const result = needsProcessing('/source/image.jpg', '/output/image.webp', false);
    expect(result).toBe(false);
  });
});

describe('resolveFilePath function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle non-existent files', () => {
    fs.existsSync.mockReturnValue(false);

    const result = resolveFilePath('/path/to/nonexistent.jpg', '/project');

    expect(result.exists).toBe(false);
    expect(result.absolutePath).toBe('/path/to/nonexistent.jpg');
    expect(result.isInRawDir).toBe(false);
    expect(result.relativePath).toBeNull();
    expect(result.outputPath).toBeNull();
  });

  it('should handle files in raw directory', () => {
    fs.existsSync.mockReturnValue(true);

    const filePath = '/project/images/raw/post/image.jpg';
    const cwd = '/project';

    const result = resolveFilePath(filePath, cwd);

    expect(result.exists).toBe(true);
    expect(result.absolutePath).toBe(filePath);
    expect(result.isInRawDir).toBe(true);
    expect(result.relativePath).toBe('post/image.jpg');
    expect(result.outputPath).toBe('/project/public/images/post/image.webp');
  });

  it('should handle files outside raw directory', () => {
    fs.existsSync.mockReturnValue(true);

    const filePath = '/other/path/image.jpg';
    const cwd = '/project';

    const result = resolveFilePath(filePath, cwd);

    expect(result.exists).toBe(true);
    expect(result.absolutePath).toBe(filePath);
    expect(result.isInRawDir).toBe(false);
    expect(result.relativePath).toBe('image.jpg');
    expect(result.outputPath).toBe('/other/path/image.webp');
  });

  it('should convert different image extensions to webp', () => {
    fs.existsSync.mockReturnValue(true);

    const testCases = [
      { input: 'image.jpg', expected: 'image.webp' },
      { input: 'photo.jpeg', expected: 'photo.webp' },
      { input: 'picture.png', expected: 'picture.webp' },
      { input: 'graphic.gif', expected: 'graphic.webp' }
    ];

    testCases.forEach(({ input, expected }) => {
      const filePath = `/other/path/${input}`;
      const result = resolveFilePath(filePath, '/project');

      expect(result.outputPath).toBe(`/other/path/${expected}`);
    });
  });

  it('should handle relative file paths', () => {
    fs.existsSync.mockReturnValue(true);

    // Mock path.resolve para simular resolución de rutas relativas
    const originalResolve = path.resolve;
    vi.spyOn(path, 'resolve').mockImplementation((cwd, filePath) => {
      return `/project/${filePath}`;
    });

    const result = resolveFilePath('images/raw/post/image.jpg', '/project');

    expect(result.absolutePath).toBe('/project/images/raw/post/image.jpg');

    // Restaurar función original
    path.resolve.mockRestore();
  });
});

describe('getFileInfo function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct file information', () => {
    const mockStats = {
      size: 1024000,
      mtime: new Date('2023-01-01T12:00:00Z')
    };

    fs.statSync.mockReturnValue(mockStats);

    const result = getFileInfo('/path/to/portada.jpg');

    expect(result.path).toBe('/path/to/portada.jpg');
    expect(result.name).toBe('portada');
    expect(result.ext).toBe('.jpg');
    expect(result.base).toBe('portada.jpg');
    expect(result.dir).toBe('/path/to');
    expect(result.size).toBe(1024000);
    expect(result.modified).toEqual(new Date('2023-01-01T12:00:00Z'));
    expect(result.isImage).toBe(true);
    expect(result.isCover).toBe(true);
  });

  it('should identify non-image files correctly', () => {
    const mockStats = {
      size: 2048,
      mtime: new Date()
    };

    fs.statSync.mockReturnValue(mockStats);

    const result = getFileInfo('/path/to/document.pdf');

    expect(result.name).toBe('document');
    expect(result.ext).toBe('.pdf');
    expect(result.isImage).toBe(false);
    expect(result.isCover).toBe(false);
  });

  it('should identify regular images correctly', () => {
    const mockStats = {
      size: 512000,
      mtime: new Date()
    };

    fs.statSync.mockReturnValue(mockStats);

    const result = getFileInfo('/path/to/photo.png');

    expect(result.name).toBe('photo');
    expect(result.ext).toBe('.png');
    expect(result.isImage).toBe(true);
    expect(result.isCover).toBe(false);
  });

  it('should handle files without extensions', () => {
    const mockStats = {
      size: 1000,
      mtime: new Date()
    };

    fs.statSync.mockReturnValue(mockStats);

    const result = getFileInfo('/path/to/filename');

    expect(result.name).toBe('filename');
    expect(result.ext).toBe('');
    expect(result.base).toBe('filename');
    expect(result.isImage).toBe(false);
    expect(result.isCover).toBe(false);
  });
});
