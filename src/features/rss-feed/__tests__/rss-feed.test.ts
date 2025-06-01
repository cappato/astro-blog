/**
 * RSS Feed Feature - Test Suite
 * Comprehensive tests for framework-agnostic RSS feed generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BlogPost, RSSConfig } from '../engine/types.ts';
import { RSSGenerator, generateRSSFeed } from '../engine/rss-generator.ts';
import { RSSEndpointHandler, handleRSSRequest, createRSSConfig } from '../endpoints/rss-endpoint.ts';
import { 
  escapeXML, 
  validateRSSConfig, 
  validatePostData, 
  generateExcerpt,
  shouldIncludePost,
  isValidPost,
  getValidPosts
} from '../engine/utils.ts';
import { RSS_CONFIG, RSS_ERRORS } from '../engine/constants.ts';

// Test constants
const TEST_CONFIG: RSSConfig = {
  site: {
    url: 'https://test.dev',
    title: 'Test Blog',
    description: 'Test blog description',
    author: 'Test Author',
    language: 'en-US'
  },
  feed: {
    version: '2.0',
    ttl: 60,
    path: '/rss.xml',
    maxItems: 10
  },
  content: {
    maxExcerptLength: 200,
    minExcerptLength: 50,
    defaultCategory: 'Blog'
  }
};

// Mock post factory
function createMockPost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: 'test-post',
    data: {
      title: 'Test Post',
      description: 'Test post description',
      date: new Date('2024-01-01'),
      draft: false,
      ...overrides.data
    },
    body: 'Test post content with more than fifty characters to test excerpt generation.',
    ...overrides
  } as BlogPost;
}

describe('RSS Feed Feature', () => {
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

    describe('validateRSSConfig', () => {
      it('should validate correct config', () => {
        const result = validateRSSConfig(TEST_CONFIG);
        expect(result.valid).toBe(true);
      });

      it('should reject config without site', () => {
        const result = validateRSSConfig({});
        expect(result.valid).toBe(false);
        expect(result.error).toBe(RSS_ERRORS.INVALID_SITE_CONFIG);
      });

      it('should reject invalid URL', () => {
        const config = { ...TEST_CONFIG, site: { ...TEST_CONFIG.site, url: 'invalid-url' } };
        const result = validateRSSConfig(config);
        expect(result.valid).toBe(false);
        expect(result.error).toContain(RSS_ERRORS.INVALID_SITE_URL);
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
        expect(result.error).toContain(RSS_ERRORS.MISSING_TITLE);
      });

      it('should reject post without date', () => {
        const post = createMockPost({ data: { title: 'Valid Title', date: undefined } });
        const result = validatePostData(post);
        expect(result.valid).toBe(false);
        expect(result.error).toContain(RSS_ERRORS.MISSING_DATE);
      });
    });

    describe('generateExcerpt', () => {
      it('should generate excerpt from long content', () => {
        const content = 'This is a very long content that should be truncated to a reasonable length for RSS feed descriptions.';
        const excerpt = generateExcerpt(content, 50, 20);
        expect(excerpt.length).toBeLessThanOrEqual(53); // 50 + '...'
        expect(excerpt).toContain('...');
      });

      it('should return full content if shorter than max', () => {
        const content = 'Short content';
        const excerpt = generateExcerpt(content, 50, 10);
        expect(excerpt).toBe(content);
      });

      it('should remove HTML tags', () => {
        const content = '<p>This is <strong>HTML</strong> content</p>';
        const excerpt = generateExcerpt(content, 100, 10);
        expect(excerpt).toBe('This is HTML content');
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

    describe('isValidPost', () => {
      it('should validate complete post', () => {
        const post = createMockPost();
        expect(isValidPost(post)).toBe(true);
      });

      it('should reject post without required fields', () => {
        const invalidPost = { slug: '', data: {} } as BlogPost;
        expect(isValidPost(invalidPost)).toBe(false);
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

  describe('RSSGenerator', () => {
    let generator: RSSGenerator;

    beforeEach(() => {
      generator = new RSSGenerator(TEST_CONFIG);
    });

    it('should create generator with valid config', () => {
      expect(generator).toBeInstanceOf(RSSGenerator);
      expect(generator.getConfig()).toEqual(TEST_CONFIG);
    });

    it('should throw error with invalid config', () => {
      expect(() => new RSSGenerator({} as RSSConfig)).toThrow();
    });

    it('should generate valid RSS feed', () => {
      const posts = [createMockPost()];
      const result = generator.generateFeed(posts);

      expect(result.success).toBe(true);
      expect(result.xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result.xml).toContain('<rss version="2.0"');
      expect(result.xml).toContain('<title>Test Blog</title>');
      expect(result.xml).toContain('<item>');
      expect(result.itemCount).toBe(1);
      expect(result.skippedCount).toBe(0);
    });

    it('should handle empty posts array', () => {
      const result = generator.generateFeed([]);
      expect(result.success).toBe(true);
      expect(result.itemCount).toBe(0);
    });

    it('should limit posts when maxItems specified', () => {
      const posts = Array.from({ length: 15 }, (_, i) => 
        createMockPost({ slug: `post-${i}` })
      );
      
      const result = generator.generateFeed(posts, { maxItems: 5 });
      expect(result.success).toBe(true);
      expect(result.itemCount).toBe(5);
    });

    it('should skip invalid posts and continue', () => {
      const posts = [
        createMockPost({ slug: 'valid-post', data: { title: 'Valid Post', date: new Date(), description: 'Valid description' } }),
        createMockPost({
          slug: 'invalid-post',
          data: { title: 'Valid Title', date: new Date(), description: '' },
          body: '' // This will cause generateRSSItem to fail due to empty description
        }),
        createMockPost({ slug: 'another-valid-post', data: { title: 'Another Valid', date: new Date(), description: 'Another description' } })
      ];

      const result = generator.generateFeed(posts);
      expect(result.success).toBe(true);
      expect(result.itemCount).toBe(2);
      expect(result.skippedCount).toBe(1);
    });
  });

  describe('RSSEndpointHandler', () => {
    let handler: RSSEndpointHandler;

    beforeEach(() => {
      handler = new RSSEndpointHandler(TEST_CONFIG);
    });

    it('should handle successful request', () => {
      const posts = [createMockPost()];
      const response = handler.handleRequest(posts);

      expect(response.status).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/rss+xml; charset=utf-8');
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
      
      // Newer post should appear first in the feed
      const newerIndex = response.body.indexOf('Newer Post');
      const olderIndex = response.body.indexOf('Older Post');
      expect(newerIndex).toBeLessThan(olderIndex);
    });

    it('should handle errors gracefully', () => {
      const invalidConfig = {} as RSSConfig;
      const invalidHandler = new RSSEndpointHandler(invalidConfig);
      
      const response = invalidHandler.handleRequest([createMockPost()]);
      expect(response.status).toBe(500);
      expect(response.body).toContain('Error generating RSS feed');
    });
  });

  describe('Convenience Functions', () => {
    it('should generate RSS feed with convenience function', () => {
      const posts = [createMockPost()];
      const result = generateRSSFeed(posts, TEST_CONFIG);

      expect(result.success).toBe(true);
      expect(result.xml).toContain('<rss version="2.0"');
    });

    it('should handle RSS request with convenience function', () => {
      const posts = [createMockPost()];
      const response = handleRSSRequest(posts, TEST_CONFIG);

      expect(response.status).toBe(200);
      expect(response.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    });

    it('should create RSS config from site config', () => {
      const siteConfig = {
        site: {
          url: 'https://example.com',
          title: 'Example Site',
          description: 'Example description',
          author: 'Example Author',
          language: 'en-US'
        }
      };

      const rssConfig = createRSSConfig(siteConfig);
      expect(rssConfig.site.url).toBe('https://example.com');
      expect(rssConfig.site.title).toBe('Example Site');
      expect(rssConfig.feed.version).toBe('2.0');
    });
  });
});
