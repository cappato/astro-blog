/**
 * XML Validation Tests
 * Automated verification of RSS and Sitemap XML structure and content
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { DOMParser } from '@xmldom/xmldom';

const DIST_DIR = join(process.cwd(), 'dist');
const RSS_FILE = join(DIST_DIR, 'rss.xml');
const SITEMAP_FILE = join(DIST_DIR, 'sitemap.xml');

// XML Parser setup
const parser = new DOMParser({
  errorHandler: {
    warning: () => {},
    error: (msg) => { throw new Error(msg); },
    fatalError: (msg) => { throw new Error(msg); }
  }
});

describe('XML Validation Tests', () => {
  let rssContent: string;
  let sitemapContent: string;
  let rssDoc: Document;
  let sitemapDoc: Document;

  beforeAll(() => {
    // Ensure files exist
    expect(existsSync(RSS_FILE)).toBe(true);
    expect(existsSync(SITEMAP_FILE)).toBe(true);

    // Read file contents
    rssContent = readFileSync(RSS_FILE, 'utf-8');
    sitemapContent = readFileSync(SITEMAP_FILE, 'utf-8');

    // Parse XML documents
    rssDoc = parser.parseFromString(rssContent, 'text/xml');
    sitemapDoc = parser.parseFromString(sitemapContent, 'text/xml');
  });

  describe('RSS Feed Validation', () => {
    test('should be valid XML', () => {
      expect(() => {
        parser.parseFromString(rssContent, 'text/xml');
      }).not.toThrow();
    });

    test('should have XML declaration', () => {
      expect(rssContent).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    });

    test('should have RSS root element', () => {
      const rssElement = rssDoc.getElementsByTagName('rss')[0];
      expect(rssElement).toBeDefined();
      expect(rssElement.getAttribute('version')).toBe('2.0');
    });

    test('should have channel element', () => {
      const channelElement = rssDoc.getElementsByTagName('channel')[0];
      expect(channelElement).toBeDefined();
    });

    test('should have required channel metadata', () => {
      const title = rssDoc.getElementsByTagName('title')[0];
      const description = rssDoc.getElementsByTagName('description')[0];
      const link = rssDoc.getElementsByTagName('link')[0];

      expect(title?.textContent).toBeTruthy();
      expect(description?.textContent).toBeTruthy();
      expect(link?.textContent).toBeTruthy();
    });

    test('should have valid atom namespace', () => {
      const rssElement = rssDoc.getElementsByTagName('rss')[0];
      const atomNamespace = rssElement.getAttribute('xmlns:atom');
      expect(atomNamespace).toBe('http://www.w3.org/2005/Atom');
    });

    test('should have atom:link self-reference', () => {
      const atomLinks = rssDoc.getElementsByTagName('atom:link');
      expect(atomLinks.length).toBeGreaterThan(0);
      
      const selfLink = Array.from(atomLinks).find(link => 
        link.getAttribute('rel') === 'self'
      );
      expect(selfLink).toBeDefined();
      expect(selfLink?.getAttribute('type')).toBe('application/rss+xml');
    });

    test('should contain blog items', () => {
      const items = rssDoc.getElementsByTagName('item');
      expect(items.length).toBeGreaterThan(0);
    });

    test('items should have required fields', () => {
      const items = rssDoc.getElementsByTagName('item');
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const title = item.getElementsByTagName('title')[0];
        const link = item.getElementsByTagName('link')[0];
        const guid = item.getElementsByTagName('guid')[0];
        const pubDate = item.getElementsByTagName('pubDate')[0];

        expect(title?.textContent).toBeTruthy();
        expect(link?.textContent).toBeTruthy();
        expect(guid?.textContent).toBeTruthy();
        expect(pubDate?.textContent).toBeTruthy();
      }
    });
  });

  describe('Sitemap Validation', () => {
    test('should be valid XML', () => {
      expect(() => {
        parser.parseFromString(sitemapContent, 'text/xml');
      }).not.toThrow();
    });

    test('should have XML declaration', () => {
      expect(sitemapContent).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    });

    test('should have urlset root element', () => {
      const urlsetElement = sitemapDoc.getElementsByTagName('urlset')[0];
      expect(urlsetElement).toBeDefined();
      
      const xmlns = urlsetElement.getAttribute('xmlns');
      expect(xmlns).toBe('http://www.sitemaps.org/schemas/sitemap/0.9');
    });

    test('should contain URL entries', () => {
      const urls = sitemapDoc.getElementsByTagName('url');
      expect(urls.length).toBeGreaterThan(0);
    });

    test('URLs should have required fields', () => {
      const urls = sitemapDoc.getElementsByTagName('url');
      
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const loc = url.getElementsByTagName('loc')[0];
        const lastmod = url.getElementsByTagName('lastmod')[0];
        const changefreq = url.getElementsByTagName('changefreq')[0];
        const priority = url.getElementsByTagName('priority')[0];

        expect(loc?.textContent).toBeTruthy();
        expect(lastmod?.textContent).toBeTruthy();
        expect(changefreq?.textContent).toBeTruthy();
        expect(priority?.textContent).toBeTruthy();

        // Validate URL format
        expect(loc?.textContent).toMatch(/^https?:\/\//);
        
        // Validate date format (YYYY-MM-DD)
        expect(lastmod?.textContent).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        
        // Validate priority range (0.0 - 1.0)
        const priorityValue = parseFloat(priority?.textContent || '0');
        expect(priorityValue).toBeGreaterThanOrEqual(0.0);
        expect(priorityValue).toBeLessThanOrEqual(1.0);
      }
    });

    test('should include main pages', () => {
      const locs = Array.from(sitemapDoc.getElementsByTagName('loc'))
        .map(loc => loc.textContent);
      
      // Should include home page
      expect(locs.some(loc => loc?.endsWith('cappato.dev'))).toBe(true);
      
      // Should include blog section
      expect(locs.some(loc => loc?.includes('/blog'))).toBe(true);
    });
  });
});
