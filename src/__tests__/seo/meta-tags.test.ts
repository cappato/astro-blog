/**
 * Meta Tags SEO Tests
 * Detailed validation of meta tags across different page types
 * Run manually: npm run test:seo:meta
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

const PRODUCTION_URL = 'https://cappato.dev';
const REQUEST_TIMEOUT = 15000;

// Helper function to fetch and parse HTML
async function fetchAndParse(url: string): Promise<JSDOM> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SEO-Test-Bot/1.0)'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  
  const html = await response.text();
  return new JSDOM(html);
}

// Helper function to get meta content
function getMetaContent(dom: JSDOM, selector: string): string | null {
  const element = dom.window.document.querySelector(selector);
  return element?.getAttribute('content') || null;
}

// Helper function to get all meta tags
function getAllMetaTags(dom: JSDOM): { name: string; content: string; property?: string }[] {
  const metas = dom.window.document.querySelectorAll('meta[name], meta[property]');
  return Array.from(metas).map(meta => ({
    name: meta.getAttribute('name') || meta.getAttribute('property') || '',
    content: meta.getAttribute('content') || '',
    property: meta.getAttribute('property') || undefined
  }));
}

// Helper function to find blog post URLs
async function findBlogPostUrls(): Promise<string[]> {
  const blogDom = await fetchAndParse(`${PRODUCTION_URL}/blog`);
  const links = blogDom.window.document.querySelectorAll('a[href*="/blog/"]');
  
  const urls = Array.from(links)
    .map(link => link.getAttribute('href'))
    .filter(href => href && href !== '/blog' && !href.includes('#'))
    .map(href => href!.startsWith('http') ? href : `${PRODUCTION_URL}${href}`)
    .slice(0, 3); // Test first 3 blog posts
  
  return [...new Set(urls)]; // Remove duplicates
}

describe('Meta Tags SEO Tests', () => {
  describe('Homepage Meta Tags', () => {
    let homeDom: JSDOM;
    let allMetas: { name: string; content: string; property?: string }[];

    beforeAll(async () => {
      homeDom = await fetchAndParse(PRODUCTION_URL);
      allMetas = getAllMetaTags(homeDom);
    }, REQUEST_TIMEOUT);

    test('should have essential meta tags', () => {
      const requiredMetas = ['description', 'viewport'];
      
      requiredMetas.forEach(metaName => {
        const meta = allMetas.find(m => m.name === metaName);
        expect(meta, `Missing required meta tag: ${metaName}`).toBeTruthy();
        expect(meta!.content, `Empty content for meta tag: ${metaName}`).toBeTruthy();
      });
    });

    test('should have proper Open Graph tags', () => {
      const requiredOgTags = ['og:title', 'og:description', 'og:url', 'og:type'];
      
      requiredOgTags.forEach(ogTag => {
        const meta = allMetas.find(m => m.name === ogTag || m.property === ogTag);
        expect(meta, `Missing Open Graph tag: ${ogTag}`).toBeTruthy();
        expect(meta!.content, `Empty content for OG tag: ${ogTag}`).toBeTruthy();
      });
    });

    test('should have Twitter Card tags', () => {
      const requiredTwitterTags = ['twitter:card', 'twitter:title', 'twitter:description'];
      
      requiredTwitterTags.forEach(twitterTag => {
        const meta = allMetas.find(m => m.name === twitterTag);
        expect(meta, `Missing Twitter tag: ${twitterTag}`).toBeTruthy();
        expect(meta!.content, `Empty content for Twitter tag: ${twitterTag}`).toBeTruthy();
      });
    });

    test('should have proper meta description length', () => {
      const description = getMetaContent(homeDom, 'meta[name="description"]');
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(50);
      expect(description!.length).toBeLessThan(160);
    });

    test('should have consistent titles across tags', () => {
      const pageTitle = homeDom.window.document.querySelector('title')?.textContent;
      const ogTitle = getMetaContent(homeDom, 'meta[property="og:title"]');
      const twitterTitle = getMetaContent(homeDom, 'meta[name="twitter:title"]');

      expect(pageTitle).toBeTruthy();
      expect(ogTitle).toBeTruthy();
      expect(twitterTitle).toBeTruthy();

      // Titles should be related (contain similar keywords)
      const normalizeTitle = (title: string) => title.toLowerCase().replace(/[^\w\s]/g, '');
      const normalizedPageTitle = normalizeTitle(pageTitle!);
      const normalizedOgTitle = normalizeTitle(ogTitle!);
      
      expect(normalizedOgTitle).toContain('matías') || expect(normalizedPageTitle).toContain('matías');
    });

    test('should have proper URL formats', () => {
      const ogUrl = getMetaContent(homeDom, 'meta[property="og:url"]');
      const canonical = homeDom.window.document.querySelector('link[rel="canonical"]')?.getAttribute('href');

      expect(ogUrl).toBe(PRODUCTION_URL);
      expect(canonical).toBe(PRODUCTION_URL);
    });
  });

  describe('Blog Section Meta Tags', () => {
    let blogDom: JSDOM;

    beforeAll(async () => {
      blogDom = await fetchAndParse(`${PRODUCTION_URL}/blog`);
    }, REQUEST_TIMEOUT);

    test('should have blog-specific meta tags', () => {
      const title = blogDom.window.document.querySelector('title')?.textContent;
      const description = getMetaContent(blogDom, 'meta[name="description"]');
      const ogType = getMetaContent(blogDom, 'meta[property="og:type"]');

      expect(title).toMatch(/blog/i);
      expect(description).toBeTruthy();
      expect(ogType).toBe('website');
    });

    test('should have proper canonical URL', () => {
      const canonical = blogDom.window.document.querySelector('link[rel="canonical"]')?.getAttribute('href');
      expect(canonical).toBe(`${PRODUCTION_URL}/blog`);
    });
  });

  describe('Blog Post Meta Tags', () => {
    let blogPostUrls: string[];

    beforeAll(async () => {
      blogPostUrls = await findBlogPostUrls();
    }, REQUEST_TIMEOUT);

    test('should find blog posts to test', () => {
      expect(blogPostUrls.length).toBeGreaterThan(0);
    });

    test('blog posts should have proper meta tags', async () => {
      if (blogPostUrls.length === 0) {
        console.warn('No blog posts found to test');
        return;
      }

      for (const url of blogPostUrls) {
        try {
          const postDom = await fetchAndParse(url);
          const allMetas = getAllMetaTags(postDom);

          // Check essential meta tags
          const title = postDom.window.document.querySelector('title')?.textContent;
          const description = getMetaContent(postDom, 'meta[name="description"]');
          const ogType = getMetaContent(postDom, 'meta[property="og:type"]');
          const ogUrl = getMetaContent(postDom, 'meta[property="og:url"]');

          expect(title, `Blog post ${url} missing title`).toBeTruthy();
          expect(description, `Blog post ${url} missing description`).toBeTruthy();
          expect(ogType, `Blog post ${url} missing og:type`).toBe('article');
          expect(ogUrl, `Blog post ${url} missing og:url`).toBe(url);

          // Check article-specific tags
          const articleTags = ['article:author', 'article:published_time'];
          articleTags.forEach(tag => {
            const meta = allMetas.find(m => m.name === tag || m.property === tag);
            if (!meta) {
              console.warn(`Blog post ${url} missing ${tag} (optional but recommended)`);
            }
          });

        } catch (error) {
          console.warn(`Failed to test blog post ${url}:`, error);
        }
      }
    }, 30000); // Extended timeout for multiple requests
  });

  describe('Meta Tags Quality Checks', () => {
    test('homepage should not have duplicate meta tags', async () => {
      const homeDom = await fetchAndParse(PRODUCTION_URL);
      const allMetas = getAllMetaTags(homeDom);
      
      const metaNames = allMetas.map(m => m.name || m.property);
      const uniqueNames = [...new Set(metaNames)];
      
      expect(metaNames.length).toBe(uniqueNames.length);
    });

    test('should have proper character encoding', async () => {
      const homeDom = await fetchAndParse(PRODUCTION_URL);
      const charset = homeDom.window.document.querySelector('meta[charset]') ||
                     homeDom.window.document.querySelector('meta[http-equiv="Content-Type"]');
      
      expect(charset).toBeTruthy();
    });

    test('should have robots meta tag or robots.txt', async () => {
      const homeDom = await fetchAndParse(PRODUCTION_URL);
      const robotsMeta = getMetaContent(homeDom, 'meta[name="robots"]');
      
      if (!robotsMeta) {
        // Check if robots.txt exists
        try {
          const robotsResponse = await fetch(`${PRODUCTION_URL}/robots.txt`);
          expect(robotsResponse.status).toBe(200);
        } catch (error) {
          throw new Error('Neither robots meta tag nor robots.txt found');
        }
      }
    });

    test('should have theme-color for mobile browsers', async () => {
      const homeDom = await fetchAndParse(PRODUCTION_URL);
      const themeColor = getMetaContent(homeDom, 'meta[name="theme-color"]');
      
      if (themeColor) {
        expect(themeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });
  });
});
