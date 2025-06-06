/**
 * Content Validation Tests
 * Automated verification of generated content quality and structure
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { DOMParser } from '@xmldom/xmldom';

const DIST_DIR = join(process.cwd(), 'dist');
const RSS_FILE = join(DIST_DIR, 'rss.xml');
const SITEMAP_FILE = join(DIST_DIR, 'sitemap.xml');
const AI_METADATA_FILE = join(DIST_DIR, 'ai-metadata.json');

const parser = new DOMParser({
  onError: (msg) => { throw new Error(msg); },
  onWarning: () => {}
});

describe('Content Validation Tests', () => {
  let rssContent: string;
  let sitemapContent: string;
  let aiMetadataContent: string;
  let rssDoc: Document;
  let sitemapDoc: Document;
  let aiMetadata: any;

  beforeAll(() => {
    // Read file contents
    rssContent = readFileSync(RSS_FILE, 'utf-8');
    sitemapContent = readFileSync(SITEMAP_FILE, 'utf-8');
    aiMetadataContent = readFileSync(AI_METADATA_FILE, 'utf-8');

    // Parse documents
    rssDoc = parser.parseFromString(rssContent, 'text/xml');
    sitemapDoc = parser.parseFromString(sitemapContent, 'text/xml');
    aiMetadata = JSON.parse(aiMetadataContent);
  });

  describe('RSS Content Quality', () => {
    test('should have proper site information', () => {
      const title = rssDoc.getElementsByTagName('title')[0]?.textContent;
      const description = rssDoc.getElementsByTagName('description')[0]?.textContent;
      const link = rssDoc.getElementsByTagName('link')[0]?.textContent;

      expect(title).toContain('Matías Cappato');
      expect(description).toBeTruthy();
      expect(link).toBe('https://cappato.dev');
    });

    test('should have proper language setting', () => {
      const language = rssDoc.getElementsByTagName('language')[0]?.textContent;
      expect(language).toBe('es');
    });

    test('should have generator information', () => {
      const generator = rssDoc.getElementsByTagName('generator')[0]?.textContent;
      expect(generator).toBeTruthy();
    });

    test('should have valid publication dates', () => {
      const pubDate = rssDoc.getElementsByTagName('pubDate')[0]?.textContent;
      const lastBuildDate = rssDoc.getElementsByTagName('lastBuildDate')[0]?.textContent;

      expect(pubDate).toBeTruthy();
      expect(lastBuildDate).toBeTruthy();

      // Should be valid RFC 2822 format
      expect(new Date(pubDate!)).toBeInstanceOf(Date);
      expect(new Date(lastBuildDate!)).toBeInstanceOf(Date);
    });

    test('should have TTL setting', () => {
      const ttl = rssDoc.getElementsByTagName('ttl')[0]?.textContent;
      expect(ttl).toBeTruthy();
      expect(parseInt(ttl!)).toBeGreaterThan(0);
    });

    test('blog items should have complete metadata', () => {
      const items = rssDoc.getElementsByTagName('item');
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const title = item.getElementsByTagName('title')[0]?.textContent;
        const description = item.getElementsByTagName('description')[0]?.textContent;
        const link = item.getElementsByTagName('link')[0]?.textContent;
        const guid = item.getElementsByTagName('guid')[0]?.textContent;
        const pubDate = item.getElementsByTagName('pubDate')[0]?.textContent;
        const author = item.getElementsByTagName('author')[0]?.textContent;
        const category = item.getElementsByTagName('category')[0]?.textContent;

        expect(title).toBeTruthy();
        expect(description).toBeTruthy();
        expect(link).toMatch(/^https:\/\/cappato\.dev\/blog\//);
        expect(guid).toBe(link);
        expect(new Date(pubDate!)).toBeInstanceOf(Date);
        expect(author).toBeTruthy();
        expect(category).toBeTruthy();
      }
    });
  });

  describe('Sitemap Content Quality', () => {
    test('should include essential pages', () => {
      const locs = Array.from(sitemapDoc.getElementsByTagName('loc'))
        .map(loc => loc.textContent);

      // Home page
      expect(locs).toContain('https://cappato.dev');
      
      // Blog section
      expect(locs.some(loc => loc === 'https://cappato.dev/blog')).toBe(true);
      
      // Should have blog posts
      expect(locs.some(loc => loc?.includes('/blog/') && loc !== 'https://cappato.dev/blog')).toBe(true);
    });

    test('should have proper URL structure', () => {
      const urls = sitemapDoc.getElementsByTagName('url');
      
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const loc = url.getElementsByTagName('loc')[0]?.textContent;
        const changefreq = url.getElementsByTagName('changefreq')[0]?.textContent;
        const priority = url.getElementsByTagName('priority')[0]?.textContent;

        // URL should be absolute and HTTPS
        expect(loc).toMatch(/^https:\/\/cappato\.dev/);
        
        // Change frequency should be valid
        const validFreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
        expect(validFreqs).toContain(changefreq);
        
        // Priority should be between 0.0 and 1.0
        const priorityNum = parseFloat(priority!);
        expect(priorityNum).toBeGreaterThanOrEqual(0.0);
        expect(priorityNum).toBeLessThanOrEqual(1.0);
      }
    });

    test('should have logical priority hierarchy', () => {
      const urls = Array.from(sitemapDoc.getElementsByTagName('url'));
      
      const homeUrl = urls.find(url => 
        url.getElementsByTagName('loc')[0]?.textContent === 'https://cappato.dev'
      );
      const blogUrl = urls.find(url => 
        url.getElementsByTagName('loc')[0]?.textContent === 'https://cappato.dev/blog'
      );

      if (homeUrl && blogUrl) {
        const homePriority = parseFloat(homeUrl.getElementsByTagName('priority')[0]?.textContent!);
        const blogPriority = parseFloat(blogUrl.getElementsByTagName('priority')[0]?.textContent!);
        
        // Home should have highest priority
        expect(homePriority).toBe(1.0);
        // Blog should have high priority but less than home
        expect(blogPriority).toBeLessThan(homePriority);
        expect(blogPriority).toBeGreaterThanOrEqual(0.8);
      }
    });
  });

  describe('AI Metadata Content Quality', () => {
    test('should have required fields', () => {
      expect(aiMetadata).toHaveProperty('name');
      expect(aiMetadata).toHaveProperty('author');
      expect(aiMetadata).toHaveProperty('url');
      expect(aiMetadata).toHaveProperty('technicalInfo');
    });

    test('should have valid site information', () => {
      expect(aiMetadata).toHaveProperty('name');
      expect(aiMetadata).toHaveProperty('url');
      expect(aiMetadata).toHaveProperty('description');

      expect(aiMetadata.url).toBe('https://cappato.dev');
      expect(aiMetadata.name).toBeTruthy();
      expect(aiMetadata.description).toBeTruthy();
    });

    test('should have author information', () => {
      expect(aiMetadata.author).toHaveProperty('name');
      expect(aiMetadata.author).toHaveProperty('@type');

      expect(aiMetadata.author.name).toBeTruthy();
      expect(aiMetadata.author['@type']).toBe('Person');
    });

    test('should have technical stack information', () => {
      expect(aiMetadata.technicalInfo).toHaveProperty('framework');
      expect(aiMetadata.technicalInfo).toHaveProperty('language');
      expect(aiMetadata.technicalInfo).toHaveProperty('features');

      expect(aiMetadata.technicalInfo.framework).toBeTruthy();
      expect(aiMetadata.technicalInfo.language).toBeTruthy();
      expect(Array.isArray(aiMetadata.technicalInfo.features)).toBe(true);
    });

    test('should have content structure', () => {
      expect(aiMetadata).toHaveProperty('aiInstructions');
      expect(aiMetadata.aiInstructions).toHaveProperty('primaryTopics');

      expect(Array.isArray(aiMetadata.aiInstructions.primaryTopics)).toBe(true);
      expect(aiMetadata.aiInstructions.primaryTopics.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-Content Consistency', () => {
    test('URLs should be consistent across files', () => {
      // Get URLs from RSS
      const rssLinks = Array.from(rssDoc.getElementsByTagName('link'))
        .map(link => link.textContent)
        .filter(link => link?.includes('/blog/'));

      // Get URLs from Sitemap
      const sitemapLinks = Array.from(sitemapDoc.getElementsByTagName('loc'))
        .map(loc => loc.textContent)
        .filter(loc => loc?.includes('/blog/'));

      // RSS links should be present in sitemap
      rssLinks.forEach(rssLink => {
        expect(sitemapLinks).toContain(rssLink);
      });
    });

    test('site information should be consistent', () => {
      const rssTitle = rssDoc.getElementsByTagName('title')[0]?.textContent;
      const rssLink = rssDoc.getElementsByTagName('link')[0]?.textContent;

      expect(aiMetadata.url).toBe(rssLink);
      expect(aiMetadata.name).toContain('Matías Cappato');
    });
  });
});
