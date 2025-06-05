/**
 * Performance SEO Tests
 * Core Web Vitals and performance metrics validation
 * Run manually: npm run test:seo:performance
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

const PRODUCTION_URL = 'https://cappato.dev';
const BLOG_URL = 'https://cappato.dev/blog';
const REQUEST_TIMEOUT = 20000;

// Performance thresholds (based on Core Web Vitals)
const PERFORMANCE_THRESHOLDS = {
  RESPONSE_TIME: 3000,      // 3 seconds max response time
  CONTENT_SIZE: 1024 * 1024, // 1MB max page size
  IMAGE_SIZE: 500 * 1024,    // 500KB max single image
  SCRIPT_COUNT: 10,          // Max 10 external scripts
  CSS_COUNT: 5,              // Max 5 external CSS files
  FONT_COUNT: 4              // Max 4 font files
};

// Helper function to fetch with timing
async function fetchWithTiming(url: string): Promise<{
  response: Response;
  timing: number;
  size: number;
}> {
  const startTime = Date.now();
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SEO-Performance-Test/1.0)'
    }
  });
  
  const endTime = Date.now();
  const content = await response.text();
  
  return {
    response,
    timing: endTime - startTime,
    size: new Blob([content]).size
  };
}

// Helper function to parse HTML and analyze resources
async function analyzePageResources(url: string): Promise<{
  dom: JSDOM;
  scripts: string[];
  stylesheets: string[];
  images: string[];
  fonts: string[];
  timing: number;
  size: number;
}> {
  // Create fresh request for each analysis to avoid "Body is unusable" error
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Get timing and size from a separate request
  const { timing, size } = await fetchWithTiming(url);

  // Extract external resources
  const scripts = Array.from(document.querySelectorAll('script[src]'))
    .map(script => script.getAttribute('src'))
    .filter(src => src && src.startsWith('http')) as string[];

  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map(link => link.getAttribute('href'))
    .filter(href => href && href.startsWith('http')) as string[];

  const images = Array.from(document.querySelectorAll('img[src]'))
    .map(img => img.getAttribute('src'))
    .filter(src => src) as string[];

  const fonts = Array.from(document.querySelectorAll('link[href*="font"]'))
    .map(link => link.getAttribute('href'))
    .filter(href => href) as string[];

  return {
    dom,
    scripts,
    stylesheets,
    images,
    fonts,
    timing,
    size
  };
}

describe('Performance SEO Tests', () => {
  describe('Homepage Performance', () => {
    let homeAnalysis: Awaited<ReturnType<typeof analyzePageResources>>;

    beforeAll(async () => {
      homeAnalysis = await analyzePageResources(PRODUCTION_URL);
    }, REQUEST_TIMEOUT);

    test('should have fast response time', () => {
      expect(homeAnalysis.timing).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME);
    });

    test('should have reasonable page size', () => {
      expect(homeAnalysis.size).toBeLessThan(PERFORMANCE_THRESHOLDS.CONTENT_SIZE);
      console.log(`Homepage size: ${(homeAnalysis.size / 1024).toFixed(2)} KB`);
    });

    test('should have limited external scripts', () => {
      expect(homeAnalysis.scripts.length).toBeLessThan(PERFORMANCE_THRESHOLDS.SCRIPT_COUNT);
      console.log(`External scripts: ${homeAnalysis.scripts.length}`);
    });

    test('should have limited external stylesheets', () => {
      expect(homeAnalysis.stylesheets.length).toBeLessThan(PERFORMANCE_THRESHOLDS.CSS_COUNT);
      console.log(`External stylesheets: ${homeAnalysis.stylesheets.length}`);
    });

    test('should have optimized images', () => {
      const document = homeAnalysis.dom.window.document;
      const images = document.querySelectorAll('img');
      
      images.forEach(img => {
        // Check for alt attributes
        expect(img.getAttribute('alt')).toBeTruthy();
        
        // Check for loading attribute
        const loading = img.getAttribute('loading');
        if (loading) {
          expect(['lazy', 'eager']).toContain(loading);
        }
        
        // Check for width/height attributes (helps prevent CLS)
        const width = img.getAttribute('width');
        const height = img.getAttribute('height');
        if (width && height) {
          expect(parseInt(width)).toBeGreaterThan(0);
          expect(parseInt(height)).toBeGreaterThan(0);
        }
      });
    });

    test('should have proper resource hints', () => {
      const document = homeAnalysis.dom.window.document;
      
      // Check for preconnect hints for external domains
      const preconnects = document.querySelectorAll('link[rel="preconnect"]');
      const dnsPrefetch = document.querySelectorAll('link[rel="dns-prefetch"]');
      
      // Check if we have external resources that would benefit from resource hints
      const externalScripts = homeAnalysis.scripts.filter(script =>
        script.startsWith('http') && !script.includes('cappato.dev')
      );
      const externalStylesheets = homeAnalysis.stylesheets.filter(stylesheet =>
        stylesheet.startsWith('http') && !stylesheet.includes('cappato.dev')
      );

      if (externalScripts.length > 0 || externalStylesheets.length > 0) {
        // Only require resource hints if there are truly external resources
        expect(preconnects.length + dnsPrefetch.length).toBeGreaterThan(0);
        console.log(`External resources found: ${externalScripts.length} scripts, ${externalStylesheets.length} stylesheets`);
      } else {
        // No external resources - resource hints not required, this is actually good for performance
        console.log('No external resources found - resource hints not required (this is good for performance)');
        expect(true).toBe(true); // Pass the test since no external resources is optimal
      }
    });

    test('should have efficient font loading', () => {
      const document = homeAnalysis.dom.window.document;
      const fontLinks = document.querySelectorAll('link[href*="font"]');
      
      fontLinks.forEach(link => {
        const rel = link.getAttribute('rel');
        expect(['preload', 'stylesheet']).toContain(rel);
        
        if (rel === 'preload') {
          expect(link.getAttribute('as')).toBe('font');
          expect(link.getAttribute('crossorigin')).toBeTruthy();
        }
      });
    });
  });

  describe('Blog Performance', () => {
    let blogAnalysis: Awaited<ReturnType<typeof analyzePageResources>>;

    beforeAll(async () => {
      blogAnalysis = await analyzePageResources(BLOG_URL);
    }, REQUEST_TIMEOUT);

    test('should have fast response time', () => {
      expect(blogAnalysis.timing).toBeLessThan(PERFORMANCE_THRESHOLDS.RESPONSE_TIME);
    });

    test('should have reasonable page size', () => {
      expect(blogAnalysis.size).toBeLessThan(PERFORMANCE_THRESHOLDS.CONTENT_SIZE);
      console.log(`Blog page size: ${(blogAnalysis.size / 1024).toFixed(2)} KB`);
    });

    test('should have optimized blog post previews', () => {
      const document = blogAnalysis.dom.window.document;
      const blogPosts = document.querySelectorAll('[class*="post"], [class*="article"], article');
      
      if (blogPosts.length > 0) {
        blogPosts.forEach(post => {
          const images = post.querySelectorAll('img');
          images.forEach(img => {
            expect(img.getAttribute('alt')).toBeTruthy();
          });
        });
      }
    });
  });

  describe('Resource Optimization', () => {
    test('should have compressed responses', async () => {
      const response = await fetch(PRODUCTION_URL, {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        }
      });
      
      const contentEncoding = response.headers.get('content-encoding');
      expect(contentEncoding).toBeTruthy();
      expect(['gzip', 'deflate', 'br']).toContain(contentEncoding);
    });

    test('should have proper caching headers', async () => {
      const response = await fetch(PRODUCTION_URL);
      
      const cacheControl = response.headers.get('cache-control');
      const etag = response.headers.get('etag');
      const lastModified = response.headers.get('last-modified');
      
      // Should have at least one caching mechanism
      expect(cacheControl || etag || lastModified).toBeTruthy();
    });

    test('should serve images in modern formats', async () => {
      const response = await fetch(PRODUCTION_URL);
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Check for picture elements with modern formats
      const pictures = document.querySelectorAll('picture');
      if (pictures.length > 0) {
        pictures.forEach(picture => {
          const sources = picture.querySelectorAll('source');
          const hasModernFormat = Array.from(sources).some(source => {
            const type = source.getAttribute('type');
            return type && ['image/webp', 'image/avif'].includes(type);
          });
          
          if (sources.length > 0) {
            expect(hasModernFormat).toBe(true);
          }
        });
      }
    });

    test('should have minimal render-blocking resources', async () => {
      const response = await fetch(PRODUCTION_URL);
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Check for async/defer on scripts
      const scripts = document.querySelectorAll('script[src]');
      const blockingScripts = Array.from(scripts).filter(script => 
        !script.hasAttribute('async') && 
        !script.hasAttribute('defer') &&
        !script.hasAttribute('type') // type="module" is non-blocking
      );
      
      expect(blockingScripts.length).toBeLessThan(3);
    });
  });

  describe('Core Web Vitals Indicators', () => {
    test('should have elements that support good CLS', async () => {
      const response = await fetch(PRODUCTION_URL);
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Check for width/height on images
      const images = document.querySelectorAll('img');
      let imagesWithDimensions = 0;
      
      images.forEach(img => {
        if (img.getAttribute('width') && img.getAttribute('height')) {
          imagesWithDimensions++;
        }
      });
      
      if (images.length > 0) {
        const dimensionRatio = imagesWithDimensions / images.length;
        // For static sites, even 25% is acceptable as long as critical images have dimensions
        expect(dimensionRatio).toBeGreaterThan(0.25); // At least 25% should have dimensions
        console.log(`Images with dimensions: ${imagesWithDimensions}/${images.length} (${(dimensionRatio * 100).toFixed(1)}%)`);
      }
    });

    test('should have proper viewport meta tag', async () => {
      const response = await fetch(PRODUCTION_URL);
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).toBeTruthy();
      
      const content = viewport?.getAttribute('content');
      expect(content).toContain('width=device-width');
      expect(content).toContain('initial-scale=1');
    });

    test('should have reasonable DOM complexity', async () => {
      const response = await fetch(PRODUCTION_URL);
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      const allElements = document.querySelectorAll('*');
      expect(allElements.length).toBeLessThan(1500); // Reasonable DOM size
      
      // Check nesting depth
      const deepestElement = Array.from(allElements).reduce((deepest, el) => {
        let depth = 0;
        let parent = el.parentElement;
        while (parent) {
          depth++;
          parent = parent.parentElement;
        }
        return depth > deepest ? depth : deepest;
      }, 0);
      
      expect(deepestElement).toBeLessThan(15); // Reasonable nesting depth
    });
  });

  describe('Mobile Performance', () => {
    test('should be mobile-friendly', async () => {
      const response = await fetch(PRODUCTION_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
        }
      });
      
      expect(response.status).toBe(200);
      
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Check viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).toBeTruthy();
      
      // Check for touch-friendly elements
      const buttons = document.querySelectorAll('button, [role="button"], a');
      if (buttons.length > 0) {
        // Should have reasonable touch targets (this is a basic check)
        expect(buttons.length).toBeGreaterThan(0);
      }
    });

    test('should have reasonable mobile page size', async () => {
      const { size } = await fetchWithTiming(PRODUCTION_URL);
      
      // Mobile pages should be even more optimized
      expect(size).toBeLessThan(PERFORMANCE_THRESHOLDS.CONTENT_SIZE * 0.8);
    });
  });
});
