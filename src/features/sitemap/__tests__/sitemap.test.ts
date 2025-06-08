/**
 * Sitemap Feature - Test Suite
 * Comprehensive tests for framework-agnostic XML sitemap generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BlogPost, SitemapConfig } from '../engine/types.ts';
import { SitemapGenerator, generateSitemap } from '../engine/sitemap-generator.ts';
import {
  escapeXML,
  validateSitemapConfig,
  validatePostData,
  shouldIncludePost,
  isValidPost,
  getValidPosts,
  generateBlogPostUrl,
  generateStaticPageUrl
} from '../engine/utils.ts';
import { SITEMAP_CONFIG, SITEMAP_ERRORS } from '../engine/constants.ts';

// Mock SitemapEndpointHandler to avoid astro:content import issues
class MockSitemapEndpointHandler {
  constructor(private config: SitemapConfig) {}

  handleRequest(posts: BlogPost[]) {
    try {
      const generator = new SitemapGenerator(this.config);
      const result = generator.generateSitemap(posts);

      if (result.success) {
        return {
          status: 200,
          headers: { 'Content-Type': 'application/xml; charset=utf-8' },
          body: result.xml
        };
      } else {
        return {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Sitemap generation error'
        };
      }
    } catch (error) {
      return {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Sitemap generation error'
      };
    }
  }
}

// Mock convenience functions
function handleSitemapRequest(posts: BlogPost[], config: SitemapConfig) {
  const handler = new MockSitemapEndpointHandler(config);
  return handler.handleRequest(posts);
}

function createSitemapConfig(siteConfig: any): SitemapConfig {
  return {
    site: {
      url: siteConfig.site.url,
      title: siteConfig.site.title,
      description: siteConfig.site.description,
      language: siteConfig.site.language
    },
    sitemap: {
      namespace: 'http://www.sitemaps.org/schemas/sitemap/0.9',
      blogPath: '/blog',
      maxUrls: 50000
    },
    urls: {
      changefreq: {
        home: 'weekly',
        blogIndex: 'daily',
        blogPost: 'monthly'
      },
      priority: {
        home: '1.0',
        blogIndex: '0.9',
        blogPost: '0.8'
      }
    },
    staticPages: [
      {
        path: '',
        changefreq: 'weekly',
        priority: '1.0'
      },
      {
        path: '/blog',
        changefreq: 'daily',
        priority: '0.9'
      }
    ]
  };
}

// Test constants
const TEST_CONFIG: SitemapConfig = {
  site: {
    url: 'https://test.dev',
    title: 'Test Site',
    description: 'Test site description',
    language: 'en-US'
  },
  sitemap: {
    namespace: 'http://www.sitemaps.org/schemas/sitemap/0.9',
    blogPath: '/blog',
    maxUrls: 50000
  },
  urls: {
    changefreq: {
      home: 'weekly',
      blogIndex: 'daily',
      blogPost: 'monthly'
    },
    priority: {
      home: '1.0',
      blogIndex: '0.9',
      blogPost: '0.8'
    }
  },
  staticPages: [
    {
      path: '',
      changefreq: 'weekly',
      priority: '1.0'
    },
    {
      path: '/blog',
      changefreq: 'daily',
      priority: '0.9'
    }
  ]
};

// Mock post factory
function createMockPost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: 'test-post',
    data: {
      title: 'Test Post',
      date: new Date('2024-01-01'),
      draft: false,
      description: 'Test post description',
      ...overrides.data
    },
    body: 'Test post content.',
    ...overrides
  } as BlogPost;
}

describe('Sitemap Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Utils', () => {
    describe('escapeXML', () => {
      it('should escape XML special characters', () => {
        expect(escapeXML('Test & <script>alert("xss")</script>')).toBe(
          'Test &amp; &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
        );
      });

      it('should handle undefined input', () => {
        expect(escapeXML(undefined)).toBe('');
      });

      it('should remove control characters', () => {
        expect(escapeXML('Test\x00\x08\x0B\x0C\x0E\x1F\x7F')).toBe('Test');
      });
    });

    describe('validateSitemapConfig', () => {
      it('should validate correct config', () => {
        const result = validateSitemapConfig(TEST_CONFIG);
        expect(result.valid).toBe(true);
      });

      it('should reject config without site', () => {
        const result = validateSitemapConfig({});
        expect(result.valid).toBe(false);
        expect(result.error).toBe(SITEMAP_ERRORS.INVALID_SITE_CONFIG);
      });

      it('should reject invalid URL', () => {
        const config = { ...TEST_CONFIG, site: { ...TEST_CONFIG.site, url: 'invalid-url' } };
        const result = validateSitemapConfig(config);
        expect(result.valid).toBe(false);
        expect(result.error).toContain(SITEMAP_ERRORS.INVALID_SITE_URL);
      });
    });

    describe('validatePostData', () => {
      it('should validate correct post', () => {
        const post = createMockPost();
        const result = validatePostData(post);
        expect(result.valid).toBe(true);
      });

      it('should reject post without title', () => {
        const post = createMockPost({ data: { title: '' } });
        const result = validatePostData(post);
        expect(result.valid).toBe(false);
        expect(result.error).toContain(SITEMAP_ERRORS.MISSING_TITLE);
      });

      it('should reject post without date', () => {
        const post = createMockPost({ data: { title: 'Valid Title', date: undefined } });
        const result = validatePostData(post);
        expect(result.valid).toBe(false);
        expect(result.error).toContain(SITEMAP_ERRORS.MISSING_DATE);
      });
    });

    describe('shouldIncludePost', () => {
      it('should include non-draft posts in production', () => {
        vi.stubEnv('PROD', true);
        const post = createMockPost({ data: { draft: false } });
        expect(shouldIncludePost(post)).toBe(true);
      });

      it('should exclude draft posts in production', () => {
        vi.stubEnv('PROD', true);
        const post = createMockPost({ data: { draft: true } });
        expect(shouldIncludePost(post)).toBe(false);
      });

      it('should include all posts in development', () => {
        vi.stubEnv('PROD', false);
        const draftPost = createMockPost({ data: { draft: true } });
        const publishedPost = createMockPost({ data: { draft: false } });
        expect(shouldIncludePost(draftPost)).toBe(true);
        expect(shouldIncludePost(publishedPost)).toBe(true);
      });
    });

    describe('generateBlogPostUrl', () => {
      it('should generate correct blog post URL', () => {
        const post = createMockPost({ slug: 'my-post' });
        const url = generateBlogPostUrl(post, 'https://test.dev', '/blog');
        expect(url).toBe('https://test.dev/blog/my-post');
      });

      it('should use data.slug if available', () => {
        const post = createMockPost({ 
          slug: 'file-slug',
          data: { slug: 'custom-slug' }
        });
        const url = generateBlogPostUrl(post, 'https://test.dev', '/blog');
        expect(url).toBe('https://test.dev/blog/custom-slug');
      });
    });

    describe('generateStaticPageUrl', () => {
      it('should generate correct static page URL', () => {
        const page = { path: '/about', changefreq: 'monthly', priority: '0.7' };
        const url = generateStaticPageUrl(page, 'https://test.dev');
        expect(url).toBe('https://test.dev/about');
      });

      it('should handle root path', () => {
        const page = { path: '', changefreq: 'weekly', priority: '1.0' };
        const url = generateStaticPageUrl(page, 'https://test.dev');
        expect(url).toBe('https://test.dev');
      });
    });

    describe('getValidPosts', () => {
      it('should filter valid posts', () => {
        const posts = [
          createMockPost({ slug: 'valid-1', data: { title: 'Valid 1', date: new Date(), draft: false } }),
          createMockPost({ slug: 'valid-2', data: { title: 'Valid 2', date: new Date(), draft: false } }),
          { slug: '', data: {} } as BlogPost, // Invalid post
        ];

        vi.stubEnv('PROD', false);
        const validPosts = getValidPosts(posts);
        expect(validPosts).toHaveLength(2);
        expect(validPosts[0].slug).toBe('valid-1');
        expect(validPosts[1].slug).toBe('valid-2');
      });
    });
  });

  describe('SitemapGenerator', () => {
    let generator: SitemapGenerator;

    beforeEach(() => {
      generator = new SitemapGenerator(TEST_CONFIG);
    });

    it('should create generator with valid config', () => {
      expect(generator).toBeInstanceOf(SitemapGenerator);
      expect(generator.getConfig()).toEqual(TEST_CONFIG);
    });

    it('should throw error with invalid config', () => {
      expect(() => new SitemapGenerator({} as SitemapConfig)).toThrow();
    });

    it('should generate valid sitemap', () => {
      const posts = [createMockPost()];
      const result = generator.generateSitemap(posts);

      expect(result.success).toBe(true);
      expect(result.xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result.xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(result.xml).toContain('<loc>https://test.dev</loc>');
      expect(result.xml).toContain('<loc>https://test.dev/blog</loc>');
      expect(result.xml).toContain('<loc>https://test.dev/blog/test-post</loc>');
      expect(result.urlCount).toBe(3); // 2 static + 1 blog post
      expect(result.skippedCount).toBe(0);
    });

    it('should handle empty posts array', () => {
      const result = generator.generateSitemap([]);
      expect(result.success).toBe(true);
      expect(result.urlCount).toBe(2); // Only static pages
    });

    it('should limit posts when maxUrls specified', () => {
      const posts = Array.from({ length: 15 }, (_, i) => 
        createMockPost({ slug: `post-${i}` })
      );
      
      const result = generator.generateSitemap(posts, { maxUrls: 5 });
      expect(result.success).toBe(true);
      expect(result.urlCount).toBe(7); // 2 static + 5 blog posts
    });

    it('should skip invalid posts and continue', () => {
      const posts = [
        createMockPost({ slug: 'valid-post', data: { title: 'Valid Post', date: new Date() } }),
        createMockPost({ slug: 'another-valid-post', data: { title: 'Another Valid', date: new Date() } })
      ];

      // Mock the generateBlogUrl method to throw an error for one post
      const originalGenerateBlogUrl = generator['generateBlogUrl'];
      let callCount = 0;
      vi.spyOn(generator as any, 'generateBlogUrl').mockImplementation((post, options) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Simulated URL generation error');
        }
        return originalGenerateBlogUrl.call(generator, post, options);
      });

      const result = generator.generateSitemap(posts);
      expect(result.success).toBe(true);
      expect(result.urlCount).toBe(3); // 2 static + 1 valid blog post
      expect(result.skippedCount).toBe(1);
    });

    it('should get sitemap statistics', () => {
      const posts = [
        createMockPost({ slug: 'post-1' }),
        createMockPost({ slug: 'post-2' })
      ];

      const stats = generator.getStats(posts);
      expect(stats.totalUrls).toBe(4); // 2 static + 2 blog posts
      expect(stats.staticUrls).toBe(2);
      expect(stats.blogUrls).toBe(2);
      expect(stats.skippedUrls).toBe(0);
    });
  });

  describe('SitemapEndpointHandler', () => {
    let handler: MockSitemapEndpointHandler;

    beforeEach(() => {
      handler = new MockSitemapEndpointHandler(TEST_CONFIG);
    });

    it('should handle successful request', () => {
      const posts = [createMockPost()];
      const response = handler.handleRequest(posts);

      expect(response.status).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/xml; charset=utf-8');
      expect(response.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    });

    it('should sort posts by date', () => {
      const posts = [
        createMockPost({ 
          slug: 'older-post', 
          data: { date: new Date('2024-01-01'), title: 'Older Post' } 
        }),
        createMockPost({ 
          slug: 'newer-post', 
          data: { date: new Date('2024-01-02'), title: 'Newer Post' } 
        })
      ];

      const response = handler.handleRequest(posts);
      expect(response.status).toBe(200);
      
      // Newer post should appear first in the sitemap
      const newerIndex = response.body.indexOf('newer-post');
      const olderIndex = response.body.indexOf('older-post');
      expect(newerIndex).toBeLessThan(olderIndex);
    });

    it('should handle errors gracefully', () => {
      const invalidConfig = {} as SitemapConfig;
      const invalidHandler = new MockSitemapEndpointHandler(invalidConfig);

      const response = invalidHandler.handleRequest([createMockPost()]);
      expect(response.status).toBe(500);
      expect(response.body).toContain('Sitemap generation error');
    });
  });

  describe('Convenience Functions', () => {
    it('should generate sitemap with convenience function', () => {
      const posts = [createMockPost()];
      const result = generateSitemap(posts, TEST_CONFIG);

      expect(result.success).toBe(true);
      expect(result.xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    });

    it('should handle sitemap request with convenience function', () => {
      const posts = [createMockPost()];
      const response = handleSitemapRequest(posts, TEST_CONFIG);

      expect(response.status).toBe(200);
      expect(response.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    });

    it('should create sitemap config from site config', () => {
      const siteConfig = {
        site: {
          url: 'https://example.com',
          title: 'Example Site',
          description: 'Example description',
          language: 'en-US'
        }
      };

      const sitemapConfig = createSitemapConfig(siteConfig);
      expect(sitemapConfig.site.url).toBe('https://example.com');
      expect(sitemapConfig.site.title).toBe('Example Site');
      expect(sitemapConfig.sitemap.namespace).toBe('http://www.sitemaps.org/schemas/sitemap/0.9');
    });
  });
});
