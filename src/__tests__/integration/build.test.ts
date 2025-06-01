/**
 * Build Integration Tests
 * Automated verification of build process and file generation
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

const DIST_DIR = join(process.cwd(), 'dist');
const RSS_FILE = join(DIST_DIR, 'rss.xml');
const SITEMAP_FILE = join(DIST_DIR, 'sitemap.xml');
const AI_METADATA_FILE = join(DIST_DIR, 'ai-metadata.json');

describe('Build Integration Tests', () => {
  beforeAll(async () => {
    // Clean build
    try {
      execSync('rm -rf dist', { stdio: 'pipe' });
    } catch (error) {
      // Directory might not exist, that's ok
    }
    
    // Run build
    console.log('Running build...');
    execSync('npm run build', { stdio: 'pipe', timeout: 120000 });
    console.log('Build completed');
  }, 150000); // 2.5 minutes timeout for build

  describe('Build Success', () => {
    test('should create dist directory', () => {
      expect(existsSync(DIST_DIR)).toBe(true);
    });

    test('should generate index.html', () => {
      const indexFile = join(DIST_DIR, 'index.html');
      expect(existsSync(indexFile)).toBe(true);
      
      const stats = statSync(indexFile);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('RSS Feed Generation', () => {
    test('should generate rss.xml file', () => {
      expect(existsSync(RSS_FILE)).toBe(true);
    });

    test('RSS file should have reasonable size', () => {
      const stats = statSync(RSS_FILE);
      expect(stats.size).toBeGreaterThan(500); // At least 500 bytes
      expect(stats.size).toBeLessThan(50000); // Less than 50KB
    });

    test('RSS file should be readable', () => {
      expect(() => {
        readFileSync(RSS_FILE, 'utf-8');
      }).not.toThrow();
    });
  });

  describe('Sitemap Generation', () => {
    test('should generate sitemap.xml file', () => {
      expect(existsSync(SITEMAP_FILE)).toBe(true);
    });

    test('Sitemap file should have reasonable size', () => {
      const stats = statSync(SITEMAP_FILE);
      expect(stats.size).toBeGreaterThan(200); // At least 200 bytes
      expect(stats.size).toBeLessThan(10000); // Less than 10KB
    });

    test('Sitemap file should be readable', () => {
      expect(() => {
        readFileSync(SITEMAP_FILE, 'utf-8');
      }).not.toThrow();
    });
  });

  describe('AI Metadata Generation', () => {
    test('should generate ai-metadata.json file', () => {
      expect(existsSync(AI_METADATA_FILE)).toBe(true);
    });

    test('AI Metadata file should have reasonable size', () => {
      const stats = statSync(AI_METADATA_FILE);
      expect(stats.size).toBeGreaterThan(100); // At least 100 bytes
      expect(stats.size).toBeLessThan(5000); // Less than 5KB
    });

    test('AI Metadata should be valid JSON', () => {
      const content = readFileSync(AI_METADATA_FILE, 'utf-8');
      expect(() => {
        JSON.parse(content);
      }).not.toThrow();
    });
  });

  describe('Asset Generation', () => {
    test('should generate CSS assets', () => {
      const stylesDir = join(DIST_DIR, 'styles');
      expect(existsSync(stylesDir)).toBe(true);
    });

    test('should generate JavaScript assets', () => {
      const assetsDir = join(DIST_DIR, 'assets');
      expect(existsSync(assetsDir)).toBe(true);
    });

    test('should generate favicon files', () => {
      const faviconFile = join(DIST_DIR, 'favicon.ico');
      expect(existsSync(faviconFile)).toBe(true);
    });
  });
});
