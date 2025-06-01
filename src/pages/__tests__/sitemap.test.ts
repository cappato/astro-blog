/**
 * Tests para utilidades de sitemap
 * Valida generación de sitemap XML sin dependencias de Astro
 */

import { describe, it, expect, vi } from 'vitest';

// Definir tipos manualmente para evitar importar astro:content
type CollectionEntry<T extends string> = {
  id: string;
  slug: string;
  body: string;
  collection: T;
  data: T extends 'blog' ? {
    title: string;
    description: string;
    date: Date;
    author: string;
    draft?: boolean;
    slug?: string;
  } : any;
};

// Importar las utilidades que podemos testear
import { generateSitemap } from '../../utils/sitemap.ts';
import { shouldIncludePost } from '../../utils/shared/post-filters.ts';

// Constantes de test
const SITEMAP_CONSTANTS = {
  SITE_URL: 'https://cappato.dev',
  XML_DECLARATION: '<?xml version="1.0" encoding="UTF-8"?>',
  URLSET_NAMESPACE: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  CONTENT_TYPE: 'application/xml',
  EXPECTED_STATIC_URLS: [
    'https://cappato.dev',
    'https://cappato.dev/blog'
  ],
  PRIORITIES: {
    HOME: '1.0',
    BLOG_INDEX: '0.9',
    BLOG_POST: '0.8'
  },
  CHANGEFREQ: {
    HOME: 'weekly',
    BLOG_INDEX: 'daily',
    BLOG_POST: 'monthly'
  }
} as const;

// Mock data para posts
const createMockPost = (overrides: Partial<CollectionEntry<'blog'>> = {}): CollectionEntry<'blog'> => ({
  id: 'test-post.md',
  slug: 'test-post',
  body: 'Test content',
  collection: 'blog',
  data: {
    title: 'Test Post',
    description: 'Test description',
    date: new Date('2023-06-15'),
    author: 'Test Author',
    draft: false,
    ...overrides.data
  },
  ...overrides
});

describe('Sitemap Utilities', () => {

  describe('shouldIncludePost function', () => {
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

    it('should handle posts without draft field (default to false)', () => {
      vi.stubEnv('PROD', true);

      const post = createMockPost({ data: { draft: undefined } });
      expect(shouldIncludePost(post)).toBe(true);
    });
  });

describe('generateSitemap function', () => {

  describe('XML Structure', () => {
    it('should generate valid XML structure', () => {
      const mockPosts = [createMockPost()];
      const xmlContent = generateSitemap(mockPosts);

      expect(xmlContent).toContain(SITEMAP_CONSTANTS.XML_DECLARATION);
      expect(xmlContent).toContain(SITEMAP_CONSTANTS.URLSET_NAMESPACE);
      expect(xmlContent).toContain('<urlset');
      expect(xmlContent).toContain('</urlset>');
    });

    it('should include static pages with correct priorities', () => {
      const xmlContent = generateSitemap([]);

      // Home page
      expect(xmlContent).toContain(`<loc>${SITEMAP_CONSTANTS.SITE_URL}</loc>`);
      expect(xmlContent).toContain(`<priority>${SITEMAP_CONSTANTS.PRIORITIES.HOME}</priority>`);
      expect(xmlContent).toContain(`<changefreq>${SITEMAP_CONSTANTS.CHANGEFREQ.HOME}</changefreq>`);

      // Blog index
      expect(xmlContent).toContain(`<loc>${SITEMAP_CONSTANTS.SITE_URL}/blog</loc>`);
      expect(xmlContent).toContain(`<priority>${SITEMAP_CONSTANTS.PRIORITIES.BLOG_INDEX}</priority>`);
      expect(xmlContent).toContain(`<changefreq>${SITEMAP_CONSTANTS.CHANGEFREQ.BLOG_INDEX}</changefreq>`);
    });

    it('should include blog posts with correct metadata', () => {
      const testDate = new Date('2023-06-15T10:30:00Z');
      const mockPost = createMockPost({
        slug: 'my-test-post',
        data: {
          title: 'Test Post with Custom Slug',
          description: 'Test description',
          date: testDate,
          author: 'Test Author',
          slug: 'custom-slug'
        }
      });
      const xmlContent = generateSitemap([mockPost]);

      // Should use custom slug if available, otherwise post.slug
      expect(xmlContent).toContain(`<loc>${SITEMAP_CONSTANTS.SITE_URL}/blog/custom-slug</loc>`);
      expect(xmlContent).toContain(`<lastmod>2023-06-15</lastmod>`);
      expect(xmlContent).toContain(`<priority>${SITEMAP_CONSTANTS.PRIORITIES.BLOG_POST}</priority>`);
      expect(xmlContent).toContain(`<changefreq>${SITEMAP_CONSTANTS.CHANGEFREQ.BLOG_POST}</changefreq>`);
    });

    it('should fallback to post.slug when data.slug is not available', () => {
      const mockPost = createMockPost({
        slug: 'fallback-slug',
        data: {
          title: 'Test Post with Fallback Slug',
          description: 'Test description',
          date: new Date('2023-06-15'),
          author: 'Test Author',
          slug: undefined
        }
      });
      const xmlContent = generateSitemap([mockPost]);

      expect(xmlContent).toContain(`<loc>${SITEMAP_CONSTANTS.SITE_URL}/blog/fallback-slug</loc>`);
    });

    it('should handle multiple posts correctly', () => {
      const mockPosts = [
        createMockPost({
          slug: 'post-1',
          data: {
            title: 'First Post',
            description: 'First post description',
            slug: 'first-post',
            date: new Date('2023-01-01'),
            author: 'Test Author'
          }
        }),
        createMockPost({
          slug: 'post-2',
          data: {
            title: 'Second Post',
            description: 'Second post description',
            slug: 'second-post',
            date: new Date('2023-02-01'),
            author: 'Test Author'
          }
        }),
        createMockPost({
          slug: 'post-3',
          data: {
            title: 'Third Post',
            description: 'Third post description',
            slug: 'third-post',
            date: new Date('2023-03-01'),
            author: 'Test Author'
          }
        })
      ];
      const xmlContent = generateSitemap(mockPosts);

      expect(xmlContent).toContain('/blog/first-post</loc>');
      expect(xmlContent).toContain('/blog/second-post</loc>');
      expect(xmlContent).toContain('/blog/third-post</loc>');
    });

    it('should format dates correctly', () => {
      const testCases = [
        { input: new Date('2023-01-01T15:30:45Z'), expected: '2023-01-01' },
        { input: new Date('2023-12-31T23:59:59Z'), expected: '2023-12-31' },
        { input: new Date('2023-06-15T00:00:00Z'), expected: '2023-06-15' }
      ];

      for (const testCase of testCases) {
        const mockPost = createMockPost({
          data: {
            title: 'Test Post with Date',
            description: 'Test description',
            date: testCase.input,
            author: 'Test Author'
          }
        });
        const xmlContent = generateSitemap([mockPost]);

        expect(xmlContent).toContain(`<lastmod>${testCase.expected}</lastmod>`);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty posts array', () => {
      const xmlContent = generateSitemap([]);

      // Should still include static pages
      expect(xmlContent).toContain(SITEMAP_CONSTANTS.SITE_URL);
      expect(xmlContent).toContain('/blog</loc>');
      expect(xmlContent).toContain('</urlset>');
    });

    it('should handle posts with missing optional fields', () => {
      const mockPost = createMockPost({
        data: {
          title: 'Test Post with Missing Optional Fields',
          description: 'Test description',
          slug: undefined, // Test fallback to post.slug
          date: new Date('2023-06-15'),
          author: 'Test Author'
        }
      });
      const xmlContent = generateSitemap([mockPost]);

      expect(xmlContent).toContain(`/blog/${mockPost.slug}</loc>`);
      expect(xmlContent).toContain('</urlset>');
    });
  });
  });
});
