/**
 * Tests para utilidades de RSS Feed
 * Valida generación de RSS XML sin dependencias de Astro
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
import { generateRSSFeed, shouldIncludePost } from '../rss.ts';

// Constantes de test
const RSS_CONSTANTS = {
  SITE_URL: 'https://cappato.dev',
  XML_DECLARATION: '<?xml version="1.0" encoding="UTF-8"?>',
  RSS_VERSION: '<rss version="2.0"',
  ATOM_NAMESPACE: 'xmlns:atom="http://www.w3.org/2005/Atom"',
  CONTENT_TYPE: 'application/rss+xml; charset=utf-8',
  CHANNEL_ELEMENTS: ['<title>', '<description>', '<link>', '<language>', '<managingEditor>'],
  ITEM_ELEMENTS: ['<item>', '<title>', '<description>', '<link>', '<guid isPermaLink="true">', '<pubDate>', '<author>']
} as const;

// Mock data para posts
const createMockPost = (overrides: Partial<CollectionEntry<'blog'>> = {}): CollectionEntry<'blog'> => ({
  id: 'test-post.md',
  slug: 'test-post',
  body: 'Este es el contenido del post de prueba. Tiene **texto en negrita** y *cursiva*. También tiene `código` y [enlaces](https://example.com).',
  collection: 'blog',
  data: {
    title: 'Test Post',
    description: 'Test description',
    date: new Date('2023-06-15T10:30:00Z'),
    author: 'Test Author',
    draft: false,
    ...overrides.data
  },
  ...overrides
});

describe('RSS Feed Utilities', () => {

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

  describe('generateRSSFeed function', () => {

    describe('XML Structure', () => {
      it('should generate valid RSS XML structure', () => {
        const mockPosts = [createMockPost()];
        const rssContent = generateRSSFeed(mockPosts);

        expect(rssContent).toContain(RSS_CONSTANTS.XML_DECLARATION);
        expect(rssContent).toContain(RSS_CONSTANTS.RSS_VERSION);
        expect(rssContent).toContain(RSS_CONSTANTS.ATOM_NAMESPACE);
        expect(rssContent).toContain('<channel>');
        expect(rssContent).toContain('</channel>');
        expect(rssContent).toContain('</rss>');
      });

      it('should include required channel elements', () => {
        const rssContent = generateRSSFeed([]);

        RSS_CONSTANTS.CHANNEL_ELEMENTS.forEach(element => {
          expect(rssContent).toContain(element);
        });

        expect(rssContent).toContain(RSS_CONSTANTS.SITE_URL);
        expect(rssContent).toContain('Matías Cappato');
        expect(rssContent).toContain('<language>es</language>');
        expect(rssContent).toContain('<atom:link');
        expect(rssContent).toContain('rel="self"');
      });

      it('should include RSS metadata', () => {
        const rssContent = generateRSSFeed([]);

        expect(rssContent).toContain('<ttl>60</ttl>');
        expect(rssContent).toContain('<generator>Astro v5.8.0</generator>');
        expect(rssContent).toContain('<docs>https://www.rssboard.org/rss-specification</docs>');
        expect(rssContent).toContain('<lastBuildDate>');
        expect(rssContent).toContain('<pubDate>');
      });
    });

    describe('RSS Items', () => {
      it('should include blog posts as RSS items', () => {
        const testDate = new Date('2023-06-15T10:30:00Z');
        const mockPost = createMockPost({
          slug: 'my-test-post',
          data: {
            title: 'My Test Post',
            description: 'This is a test post description',
            date: testDate,
            author: 'John Doe',
            slug: 'custom-slug'
          }
        });
        const rssContent = generateRSSFeed([mockPost]);

        RSS_CONSTANTS.ITEM_ELEMENTS.forEach(element => {
          expect(rssContent).toContain(element);
        });

        expect(rssContent).toContain('<title>My Test Post</title>');
        expect(rssContent).toContain('<description>This is a test post description</description>');
        expect(rssContent).toContain(`<link>${RSS_CONSTANTS.SITE_URL}/blog/custom-slug</link>`);
        expect(rssContent).toContain('<author>John Doe</author>');
        expect(rssContent).toContain('<category>Blog</category>');
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
        const rssContent = generateRSSFeed([mockPost]);

        expect(rssContent).toContain(`<link>${RSS_CONSTANTS.SITE_URL}/blog/fallback-slug</link>`);
        expect(rssContent).toContain(`<guid isPermaLink="true">${RSS_CONSTANTS.SITE_URL}/blog/fallback-slug</guid>`);
      });

      it('should format dates correctly in RFC 2822 format', () => {
        const testDate = new Date('2023-06-15T10:30:00Z');
        const mockPost = createMockPost({
          data: {
            title: 'Test Post with Date',
            description: 'Test description',
            date: testDate,
            author: 'Test Author'
          }
        });
        const rssContent = generateRSSFeed([mockPost]);

        // RFC 2822 format: "Thu, 15 Jun 2023 10:30:00 GMT"
        expect(rssContent).toContain('<pubDate>Thu, 15 Jun 2023 10:30:00 GMT</pubDate>');
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
          })
        ];
        const rssContent = generateRSSFeed(mockPosts);

        expect(rssContent).toContain('<title>First Post</title>');
        expect(rssContent).toContain('<title>Second Post</title>');
        expect(rssContent).toContain('/blog/first-post</link>');
        expect(rssContent).toContain('/blog/second-post</link>');
      });
    });

    describe('Content Processing', () => {
      it('should generate excerpt from post body when description is not provided', () => {
        const mockPost = createMockPost({
          body: 'Este es un post muy largo con **markdown** y *formato* que debería ser truncado correctamente.',
          data: {
            title: 'Test Post with Generated Excerpt',
            description: undefined,
            date: new Date('2023-06-15'),
            author: 'Test Author'
          }
        });
        const rssContent = generateRSSFeed([mockPost]);

        expect(rssContent).toContain('<description>Este es un post muy largo con markdown y formato que debería ser truncado correctamente.</description>');
      });

      it('should escape XML special characters', () => {
        const mockPost = createMockPost({
          data: {
            title: 'Post with <special> & "characters"',
            description: 'Description with <tags> & "quotes" and \'apostrophes\'',
            date: new Date('2023-06-15'),
            author: 'Test Author'
          }
        });
        const rssContent = generateRSSFeed([mockPost]);

        expect(rssContent).toContain('<title>Post with &lt;special&gt; &amp; &quot;characters&quot;</title>');
        expect(rssContent).toContain('<description>Description with &lt;tags&gt; &amp; &quot;quotes&quot; and &#39;apostrophes&#39;</description>');
      });

      it('should truncate long excerpts correctly', () => {
        const longContent = 'A'.repeat(200) + ' final words';
        const mockPost = createMockPost({
          body: longContent,
          data: {
            title: 'Test Post with Long Content',
            description: undefined,
            date: new Date('2023-06-15'),
            author: 'Test Author'
          }
        });
        const rssContent = generateRSSFeed([mockPost]);

        // Should be truncated to ~160 chars and end with ...
        expect(rssContent).toContain('...');
        const descMatch = rssContent.match(/<description>(.*?)<\/description>/);
        expect(descMatch?.[1].length).toBeLessThanOrEqual(165); // 160 + "..."
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty posts array', () => {
        const rssContent = generateRSSFeed([]);

        expect(rssContent).toContain('<channel>');
        expect(rssContent).toContain('</channel>');
        expect(rssContent).not.toContain('<item>');
      });

      it('should set lastBuildDate to most recent post date', () => {
        const oldPost = createMockPost({
          data: {
            title: 'Old Post',
            description: 'Old post description',
            date: new Date('2023-01-01'),
            author: 'Test Author'
          }
        });
        const newPost = createMockPost({
          data: {
            title: 'New Post',
            description: 'New post description',
            date: new Date('2023-06-15'),
            author: 'Test Author'
          }
        });
        const rssContent = generateRSSFeed([newPost, oldPost]);

        expect(rssContent).toContain('<lastBuildDate>Thu, 15 Jun 2023');
      });
    });
  });
});
