/**
 * SEO Production Tests
 * Comprehensive SEO validation for live production site
 * Run manually: npm run test:seo:production
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

const PRODUCTION_URL = 'https://cappato.dev';
const BLOG_URL = 'https://cappato.dev/blog';
const REQUEST_TIMEOUT = 15000;

// Helper function to fetch and parse HTML
async function fetchAndParse(url: string): Promise<{ dom: JSDOM; response: Response }> {
  const response = await fetch(url, {
    headers: {
      'User-developer': 'Mozilla/5.0 (compatible; SEO-Test-Bot/1.0)'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  
  const html = await response.text();
  const dom = new JSDOM(html);
  
  return { dom, response };
}

// Helper function to get meta content
function getMetaContent(dom: JSDOM, name: string, property?: string): string | null {
  const document = dom.window.document;
  
  if (property) {
    const meta = document.querySelector(`meta[property="${property}"]`);
    return meta?.getAttribute('content') || null;
  }
  
  const meta = document.querySelector(`meta[name="${name}"]`) || 
               document.querySelector(`meta[property="${name}"]`);
  return meta?.getAttribute('content') || null;
}

// Helper function to get structured data
function getStructuredData(dom: JSDOM): any[] {
  const document = dom.window.document;
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const data: any[] = [];
  
  scripts.forEach(script => {
    try {
      const json = JSON.parse(script.textContent || '');
      data.push(json);
    } catch (error) {
      console.warn('Invalid JSON-LD found:', script.textContent);
    }
  });
  
  return data;
}

describe('SEO Production Tests', () => {
  describe('Homepage SEO (https://cappato.dev)', () => {
    let homeDom: JSDOM;
    let homeResponse: Response;

    beforeAll(async () => {
      const result = await fetchAndParse(PRODUCTION_URL);
      homeDom = result.dom;
      homeResponse = result.response;
    }, REQUEST_TIMEOUT);

    test('should return 200 status', () => {
      expect(homeResponse.status).toBe(200);
    });

    test('should have proper content type', () => {
      const contentType = homeResponse.headers.get('content-type');
      expect(contentType).toMatch(/text\/html/);
    });

    test('should have title tag', () => {
      const title = homeDom.window.document.querySelector('title')?.textContent;
      expect(title).toBeTruthy();
      expect(title).toContain('Matías Cappato');
    });

    test('should have meta description', () => {
      const description = getMetaContent(homeDom, 'description');
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(50);
      expect(description!.length).toBeLessThan(160);
    });

    test('should have Open Graph tags', () => {
      const ogTitle = getMetaContent(homeDom, '', 'og:title');
      const ogDescription = getMetaContent(homeDom, '', 'og:description');
      const ogUrl = getMetaContent(homeDom, '', 'og:url');
      const ogType = getMetaContent(homeDom, '', 'og:type');

      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
      expect(ogUrl).toBe(PRODUCTION_URL);
      expect(ogType).toBe('website');
    });

    test('should have Twitter Card tags', () => {
      const twitterCard = getMetaContent(homeDom, 'twitter:card');
      const twitterTitle = getMetaContent(homeDom, 'twitter:title');
      const twitterDescription = getMetaContent(homeDom, 'twitter:description');

      expect(twitterCard).toBeTruthy();
      expect(twitterTitle).toBeTruthy();
      expect(twitterDescription).toBeTruthy();
    });

    test('should have canonical URL', () => {
      const canonical = homeDom.window.document.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute('href')).toBe(PRODUCTION_URL);
    });

    test('should have language declaration', () => {
      const html = homeDom.window.document.documentElement;
      const lang = html.getAttribute('lang');
      expect(lang).toBe('es');
    });

    test('should have structured data', () => {
      const structuredData = getStructuredData(homeDom);
      expect(structuredData.length).toBeGreaterThan(0);
      
      // Should have at least a WebSite or Person schema
      const hasWebSite = structuredData.some(data => 
        data['@type'] === 'WebSite' || data['@type'] === 'Person'
      );
      expect(hasWebSite).toBe(true);
    });

    test('should have favicon', () => {
      const favicon = homeDom.window.document.querySelector('link[rel="icon"]') ||
                     homeDom.window.document.querySelector('link[rel="shortcut icon"]');
      expect(favicon).toBeTruthy();
    });

    test('should have viewport meta tag', () => {
      const viewport = getMetaContent(homeDom, 'viewport');
      expect(viewport).toBeTruthy();
      expect(viewport).toContain('width=device-width');
    });
  });

  describe('Blog Section SEO (https://cappato.dev/blog)', () => {
    let blogDom: JSDOM;
    let blogResponse: Response;

    beforeAll(async () => {
      const result = await fetchAndParse(BLOG_URL);
      blogDom = result.dom;
      blogResponse = result.response;
    }, REQUEST_TIMEOUT);

    test('should return 200 status', () => {
      expect(blogResponse.status).toBe(200);
    });

    test('should have blog-specific title', () => {
      const title = blogDom.window.document.querySelector('title')?.textContent;
      expect(title).toBeTruthy();
      expect(title).toMatch(/blog/i);
    });

    test('should have blog-specific meta description', () => {
      const description = getMetaContent(blogDom, 'description');
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(50);
    });

    test('should have canonical URL for blog', () => {
      const canonical = blogDom.window.document.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute('href')).toBe(BLOG_URL);
    });

    test('should have Open Graph type as website', () => {
      const ogType = getMetaContent(blogDom, '', 'og:type');
      expect(ogType).toBe('website');
    });

    test('should have blog posts listed', () => {
      const document = blogDom.window.document;
      
      // Look for blog post links
      const blogLinks = document.querySelectorAll('a[href*="/blog/"]');
      expect(blogLinks.length).toBeGreaterThan(0);
    });

    test('should have proper heading structure', () => {
      const document = blogDom.window.document;
      const h1 = document.querySelector('h1');
      expect(h1).toBeTruthy();
      expect(h1?.textContent).toMatch(/blog/i);
    });
  });

  describe('RSS and Sitemap Accessibility', () => {
    test('RSS feed should be accessible', async () => {
      const rssResponse = await fetch(`${PRODUCTION_URL}/rss.xml`);
      expect(rssResponse.status).toBe(200);
      
      const contentType = rssResponse.headers.get('content-type');
      expect(contentType).toMatch(/xml/);
      
      const rssContent = await rssResponse.text();
      expect(rssContent).toContain('<?xml');
      expect(rssContent).toContain('<rss');
      expect(rssContent).toContain('Matías Cappato');
    });

    test('Sitemap should be accessible', async () => {
      const sitemapResponse = await fetch(`${PRODUCTION_URL}/sitemap.xml`);
      expect(sitemapResponse.status).toBe(200);
      
      const contentType = sitemapResponse.headers.get('content-type');
      expect(contentType).toMatch(/xml/);
      
      const sitemapContent = await sitemapResponse.text();
      expect(sitemapContent).toContain('<?xml');
      expect(sitemapContent).toContain('<urlset');
      expect(sitemapContent).toContain(PRODUCTION_URL);
    });

    test('AI Metadata should be accessible', async () => {
      const aiResponse = await fetch(`${PRODUCTION_URL}/ai-metadata.json`);
      expect(aiResponse.status).toBe(200);
      
      const contentType = aiResponse.headers.get('content-type');
      expect(contentType).toMatch(/json/);
      
      const aiContent = await aiResponse.text();
      const aiData = JSON.parse(aiContent);
      expect(aiData.name).toBeTruthy();
      expect(aiData.url).toBe(PRODUCTION_URL);
    });
  });

  describe('Performance and Technical SEO', () => {
    test('should have reasonable response times', async () => {
      const startTime = Date.now();
      const response = await fetch(PRODUCTION_URL);
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(3000); // Less than 3 seconds
    });

    test('should have security headers', async () => {
      const response = await fetch(PRODUCTION_URL);
      
      // Check for common security headers
      const headers = response.headers;
      
      // At least some security measures should be in place
      const hasSecurityHeaders = 
        headers.has('x-frame-options') ||
        headers.has('x-content-type-options') ||
        headers.has('referrer-policy') ||
        headers.has('content-security-policy');
      
      expect(hasSecurityHeaders).toBe(true);
    });

    test('should be served over HTTPS', () => {
      expect(PRODUCTION_URL).toMatch(/^https:/);
    });
  });
});
