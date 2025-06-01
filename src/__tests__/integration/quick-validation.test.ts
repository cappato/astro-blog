/**
 * Quick Validation Test
 * Fast verification of existing build artifacts
 */

import { describe, test, expect } from 'vitest';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const DIST_DIR = join(process.cwd(), 'dist');
const RSS_FILE = join(DIST_DIR, 'rss.xml');
const SITEMAP_FILE = join(DIST_DIR, 'sitemap.xml');
const AI_METADATA_FILE = join(DIST_DIR, 'ai-metadata.json');

describe('Quick Validation Tests', () => {
  describe('File Existence', () => {
    test('dist directory should exist', () => {
      expect(existsSync(DIST_DIR)).toBe(true);
    });

    test('RSS file should exist', () => {
      expect(existsSync(RSS_FILE)).toBe(true);
    });

    test('Sitemap file should exist', () => {
      expect(existsSync(SITEMAP_FILE)).toBe(true);
    });

    test('AI Metadata file should exist', () => {
      expect(existsSync(AI_METADATA_FILE)).toBe(true);
    });
  });

  describe('File Sizes', () => {
    test('RSS file should have reasonable size', () => {
      if (existsSync(RSS_FILE)) {
        const stats = statSync(RSS_FILE);
        expect(stats.size).toBeGreaterThan(500);
        expect(stats.size).toBeLessThan(50000);
      }
    });

    test('Sitemap file should have reasonable size', () => {
      if (existsSync(SITEMAP_FILE)) {
        const stats = statSync(SITEMAP_FILE);
        expect(stats.size).toBeGreaterThan(200);
        expect(stats.size).toBeLessThan(10000);
      }
    });

    test('AI Metadata file should have reasonable size', () => {
      if (existsSync(AI_METADATA_FILE)) {
        const stats = statSync(AI_METADATA_FILE);
        expect(stats.size).toBeGreaterThan(100);
        expect(stats.size).toBeLessThan(5000);
      }
    });
  });

  describe('Content Validation', () => {
    test('RSS should start with XML declaration', () => {
      if (existsSync(RSS_FILE)) {
        const content = readFileSync(RSS_FILE, 'utf-8');
        expect(content).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
        expect(content).toContain('<rss version="2.0"');
        expect(content).toContain('<channel>');
      }
    });

    test('Sitemap should start with XML declaration', () => {
      if (existsSync(SITEMAP_FILE)) {
        const content = readFileSync(SITEMAP_FILE, 'utf-8');
        expect(content).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
        expect(content).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
        expect(content).toContain('<url>');
      }
    });

    test('AI Metadata should be valid JSON', () => {
      if (existsSync(AI_METADATA_FILE)) {
        const content = readFileSync(AI_METADATA_FILE, 'utf-8');
        expect(() => {
          const parsed = JSON.parse(content);
          expect(parsed).toHaveProperty('name');
          expect(parsed).toHaveProperty('author');
        }).not.toThrow();
      }
    });
  });

  describe('Content Quality', () => {
    test('RSS should contain site information', () => {
      if (existsSync(RSS_FILE)) {
        const content = readFileSync(RSS_FILE, 'utf-8');
        expect(content).toContain('Matías Cappato');
        expect(content).toContain('https://cappato.dev');
        expect(content).toContain('<title>');
        expect(content).toContain('<description>');
      }
    });

    test('Sitemap should contain main URLs', () => {
      if (existsSync(SITEMAP_FILE)) {
        const content = readFileSync(SITEMAP_FILE, 'utf-8');
        expect(content).toContain('https://cappato.dev');
        expect(content).toContain('<loc>');
        expect(content).toContain('<lastmod>');
        expect(content).toContain('<priority>');
      }
    });

    test('AI Metadata should contain required fields', () => {
      if (existsSync(AI_METADATA_FILE)) {
        const content = readFileSync(AI_METADATA_FILE, 'utf-8');
        const parsed = JSON.parse(content);

        expect(parsed).toHaveProperty('name');
        expect(parsed).toHaveProperty('url');
        expect(parsed.url).toBe('https://cappato.dev');
        expect(parsed.author).toHaveProperty('name');
      }
    });
  });
});
