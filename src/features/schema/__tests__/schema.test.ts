/**
 * Schema.org Feature Tests
 * Tests for the modular schema generation system
 */

import { describe, it, expect } from 'vitest';
import { generateSchema, detectPageType, toJsonLd } from '../engine.ts';
import { SCHEMA_CONFIG } from '../config.ts';
import type { SchemaContext } from '../engine.ts';

// Mock CollectionEntry type for testing
type MockCollectionEntry = {
  id: string;
  slug: string;
  body: string;
  collection: 'blog';
  data: {
    title: string;
    description: string;
    date: Date;
    updatedDate?: Date;
    author: string;
    tags?: string[];
    image?: string;
  };
};

// Create mock post helper
const createMockPost = (overrides: Partial<MockCollectionEntry> = {}): MockCollectionEntry => ({
  id: 'test-post.md',
  slug: 'test-post',
  body: 'Este es un post de prueba con contenido suficiente para calcular el word count correctamente.',
  collection: 'blog',
  data: {
    title: 'Test Blog Post',
    description: 'This is a test blog post description',
    date: new Date('2023-06-15T10:30:00Z'),
    author: 'Matías Cappato',
    tags: ['test', 'blog'],
    ...overrides.data
  },
  ...overrides
});

describe('Schema.org Feature', () => {
  
  describe('detectPageType', () => {
    it('should detect home page', () => {
      const context: SchemaContext = { url: 'https://cappato.dev/' };
      expect(detectPageType(context)).toBe('home');
    });

    it('should detect blog index page', () => {
      const context: SchemaContext = { url: 'https://cappato.dev/blog' };
      expect(detectPageType(context)).toBe('blog-index');
    });

    it('should detect blog post page', () => {
      const mockPost = createMockPost();
      const context: SchemaContext = { 
        url: 'https://cappato.dev/blog/test-post',
        post: mockPost
      };
      expect(detectPageType(context)).toBe('blog-post');
    });
  });

  describe('generateSchema', () => {
    it('should generate WebSite schema for home page', () => {
      const context: SchemaContext = { url: 'https://cappato.dev/' };
      const schemas = generateSchema(context);
      
      expect(schemas).toHaveLength(1);
      expect(schemas[0]['@type']).toBe('WebSite');
      expect(schemas[0].name).toBe(SCHEMA_CONFIG.site.name);
      expect(schemas[0].url).toBe(SCHEMA_CONFIG.site.url);
      expect(schemas[0].inLanguage).toBe('es');
    });

    it('should generate Blog schema for blog index', () => {
      const context: SchemaContext = { url: 'https://cappato.dev/blog' };
      const schemas = generateSchema(context);
      
      expect(schemas).toHaveLength(1);
      expect(schemas[0]['@type']).toBe('Blog');
      expect(schemas[0].url).toContain('/blog');
      expect(schemas[0].inLanguage).toBe('es');
    });

    it('should generate BlogPosting schema for blog post', () => {
      const mockPost = createMockPost();
      const context: SchemaContext = { 
        url: 'https://cappato.dev/blog/test-post',
        post: mockPost
      };
      const schemas = generateSchema(context);
      
      expect(schemas).toHaveLength(1);
      expect(schemas[0]['@type']).toBe('BlogPosting');
      expect(schemas[0].headline).toBe(mockPost.data.title);
      expect(schemas[0].description).toBe(mockPost.data.description);
      expect(schemas[0].inLanguage).toBe('es');
      expect(schemas[0].wordCount).toBeGreaterThan(0);
    });

    it('should handle custom author in blog posts', () => {
      const mockPost = createMockPost({
        data: {
          title: 'Test Blog Post',
          description: 'This is a test blog post description',
          date: new Date('2023-06-15T10:30:00Z'),
          author: 'Custom Author'
        }
      });
      const context: SchemaContext = { 
        url: 'https://cappato.dev/blog/test-post',
        post: mockPost
      };
      const schemas = generateSchema(context);
      
      expect(schemas[0].author.name).toBe('Custom Author');
    });

    it('should generate absolute URLs', () => {
      const mockPost = createMockPost({
        data: {
          title: 'Test Blog Post',
          description: 'This is a test blog post description',
          date: new Date('2023-06-15T10:30:00Z'),
          author: 'Test Author',
          image: '/images/test.webp'
        }
      });
      const context: SchemaContext = { 
        url: 'https://cappato.dev/blog/test-post',
        post: mockPost
      };
      const schemas = generateSchema(context);
      
      expect(schemas[0].image).toBe('https://cappato.dev/images/test.webp');
      expect(schemas[0].url).toBe('https://cappato.dev/blog/test-post');
    });

    it('should handle missing post data gracefully', () => {
      const context: SchemaContext = { 
        url: 'https://cappato.dev/blog/test-post',
        pageType: 'blog-post'
        // No post data
      };
      const schemas = generateSchema(context);
      
      expect(schemas).toHaveLength(0);
    });
  });

  describe('toJsonLd', () => {
    it('should convert schemas to valid JSON-LD', () => {
      const context: SchemaContext = { url: 'https://cappato.dev/' };
      const schemas = generateSchema(context);
      const jsonLd = toJsonLd(schemas);
      
      expect(typeof jsonLd).toBe('string');
      expect(() => JSON.parse(jsonLd)).not.toThrow();
      
      const parsed = JSON.parse(jsonLd);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0]['@context']).toBe('https://schema.org');
    });
  });

  describe('Configuration', () => {
    it('should have valid configuration', () => {
      expect(SCHEMA_CONFIG.site.name).toBeDefined();
      expect(SCHEMA_CONFIG.site.url).toMatch(/^https?:\/\//);
      expect(SCHEMA_CONFIG.site.language).toBe('es');
      expect(SCHEMA_CONFIG.defaults.image).toBeDefined();
    });
  });
});
