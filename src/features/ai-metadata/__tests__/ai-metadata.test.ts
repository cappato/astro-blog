/**
 * AI Metadata Feature - Test Suite
 * 
 * Comprehensive tests for AI metadata system including
 * validation, generation, and endpoint functionality.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AIMetadataManager } from '../engine/ai-metadata-manager.ts';
import { 
  validateAIMetadataProps,
  makeAbsoluteUrl,
  formatTags,
  generateMetaTagName,
  sanitizeTitle,
  sanitizeDescription,
  formatDateISO,
  isValidUrl,
  isValidContentType
} from '../engine/utils.ts';
import { 
  generateAIMetadataResponse,
  generateAIMetadataHeaders 
} from '../endpoints/ai-metadata-json.ts';
import type { AIMetadataProps, SiteInfo } from '../engine/types.ts';

// Test data
const mockSiteInfo: SiteInfo = {
  url: 'https://example.com',
  title: 'Test Site',
  description: 'Test site description',
  author: {
    name: 'Test Author',
    email: 'test@example.com'
  }
};

const mockProps: AIMetadataProps = {
  title: 'Test Article',
  description: 'Test article description',
  type: 'article',
  url: '/test-article',
  datePublished: new Date('2024-01-01'),
  dateModified: new Date('2024-01-02'),
  tags: ['test', 'article'],
  author: 'Test Author',
  language: 'en'
};

describe('AI Metadata Utils', () => {
  describe('validateAIMetadataProps', () => {
    it('should validate valid props', () => {
      const result = validateAIMetadataProps(mockProps);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing required fields', () => {
      const result = validateAIMetadataProps({});
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid title length', () => {
      const result = validateAIMetadataProps({
        ...mockProps,
        title: 'a'.repeat(201)
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Title'))).toBe(true);
    });

    it('should reject invalid URL format', () => {
      const result = validateAIMetadataProps({
        ...mockProps,
        url: 'invalid-url'
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('URL'))).toBe(true);
    });

    it('should reject invalid content type', () => {
      const result = validateAIMetadataProps({
        ...mockProps,
        type: 'invalid' as any
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('type'))).toBe(true);
    });
  });

  describe('makeAbsoluteUrl', () => {
    it('should convert relative URL to absolute', () => {
      const result = makeAbsoluteUrl('/test', mockSiteInfo);
      expect(result).toBe('https://example.com/test');
    });

    it('should return absolute URL unchanged', () => {
      const url = 'https://other.com/test';
      const result = makeAbsoluteUrl(url, mockSiteInfo);
      expect(result).toBe(url);
    });

    it('should handle URLs without leading slash', () => {
      const result = makeAbsoluteUrl('test', mockSiteInfo);
      expect(result).toBe('https://example.com/test');
    });
  });

  describe('formatTags', () => {
    it('should format tags correctly', () => {
      const result = formatTags(['tag1', 'tag2', 'tag3']);
      expect(result).toBe('tag1, tag2, tag3');
    });

    it('should filter empty tags', () => {
      const result = formatTags(['tag1', '', 'tag2', '   ']);
      expect(result).toBe('tag1, tag2');
    });

    it('should trim whitespace', () => {
      const result = formatTags([' tag1 ', '  tag2  ']);
      expect(result).toBe('tag1, tag2');
    });
  });

  describe('generateMetaTagName', () => {
    it('should generate meta tag name with default prefix', () => {
      const result = generateMetaTagName('description');
      expect(result).toBe('ai:description');
    });

    it('should generate meta tag name with custom prefix', () => {
      const result = generateMetaTagName('description', 'custom:');
      expect(result).toBe('custom:description');
    });
  });

  describe('sanitizeTitle', () => {
    it('should trim and normalize whitespace', () => {
      const result = sanitizeTitle('  Test   Title  ');
      expect(result).toBe('Test Title');
    });

    it('should truncate long titles', () => {
      const longTitle = 'a'.repeat(250);
      const result = sanitizeTitle(longTitle);
      expect(result.length).toBeLessThanOrEqual(200);
    });
  });

  describe('formatDateISO', () => {
    it('should format date to ISO string', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const result = formatDateISO(date);
      expect(result).toBe('2024-01-01T12:00:00.000Z');
    });

    it('should throw error for invalid date', () => {
      expect(() => formatDateISO(new Date('invalid'))).toThrow();
    });
  });

  describe('isValidUrl', () => {
    it('should validate HTTP URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('should validate relative URLs', () => {
      expect(isValidUrl('/path')).toBe(true);
      expect(isValidUrl('/path/to/page')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('invalid')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
    });
  });

  describe('isValidContentType', () => {
    it('should validate correct content types', () => {
      expect(isValidContentType('website')).toBe(true);
      expect(isValidContentType('article')).toBe(true);
      expect(isValidContentType('profile')).toBe(true);
      expect(isValidContentType('blog')).toBe(true);
    });

    it('should reject invalid content types', () => {
      expect(isValidContentType('invalid')).toBe(false);
      expect(isValidContentType('')).toBe(false);
    });
  });
});

describe('AIMetadataManager', () => {
  let manager: AIMetadataManager;

  beforeEach(() => {
    manager = new AIMetadataManager({}, mockSiteInfo);
  });

  describe('generateStructuredData', () => {
    it('should generate valid structured data', () => {
      const result = manager.generateStructuredData(mockProps);
      
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('BlogPosting');
      expect(result.name).toBe(mockProps.title);
      expect(result.description).toBe(mockProps.description);
      expect(result.url).toBe('https://example.com/test-article');
    });

    it('should include article-specific fields for articles', () => {
      const result = manager.generateStructuredData(mockProps);
      
      expect(result.datePublished).toBeDefined();
      expect(result.dateModified).toBeDefined();
      expect(result.mainEntityOfPage).toBeDefined();
    });

    it('should handle website type correctly', () => {
      const websiteProps = { ...mockProps, type: 'website' as const };
      const result = manager.generateStructuredData(websiteProps);
      
      expect(result['@type']).toBe('WebSite');
      expect(result.datePublished).toBeUndefined();
    });
  });

  describe('generateMetaTags', () => {
    it('should generate all required meta tags', () => {
      const result = manager.generateMetaTags(mockProps);
      
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'ai:description' }),
          expect.objectContaining({ name: 'ai:type' }),
          expect.objectContaining({ name: 'ai:author' })
        ])
      );
    });

    it('should include optional tags when provided', () => {
      const result = manager.generateMetaTags(mockProps);
      
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'ai:keywords' }),
          expect.objectContaining({ name: 'ai:published' }),
          expect.objectContaining({ name: 'ai:modified' })
        ])
      );
    });
  });

  describe('getContentType', () => {
    it('should map content types correctly', () => {
      expect(manager.getContentType('website')).toBe('WebSite');
      expect(manager.getContentType('article')).toBe('BlogPosting');
      expect(manager.getContentType('profile')).toBe('Person');
      expect(manager.getContentType('blog')).toBe('Blog');
    });
  });

  describe('validateProps', () => {
    it('should validate props using internal validation', () => {
      const result = manager.validateProps(mockProps);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid props', () => {
      const result = manager.validateProps({});
      expect(result.valid).toBe(false);
    });
  });
});

describe('AI Metadata Endpoint', () => {
  describe('generateAIMetadataResponse', () => {
    it('should generate valid response', () => {
      const result = generateAIMetadataResponse(mockSiteInfo);
      
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('WebSite');
      expect(result.name).toBe(mockSiteInfo.title);
      expect(result.description).toBe(mockSiteInfo.description);
      expect(result.technicalInfo).toBeDefined();
      expect(result.aiInstructions).toBeDefined();
    });

    it('should include technical information', () => {
      const result = generateAIMetadataResponse(mockSiteInfo);
      
      expect(result.technicalInfo?.framework).toBe('Astro');
      expect(result.technicalInfo?.language).toBe('TypeScript');
      expect(result.technicalInfo?.features).toBeInstanceOf(Array);
    });

    it('should include AI instructions', () => {
      const result = generateAIMetadataResponse(mockSiteInfo);
      
      expect(result.aiInstructions?.preferredCitation).toContain(mockSiteInfo.author.name);
      expect(result.aiInstructions?.contentLicense).toBeDefined();
      expect(result.aiInstructions?.crawlingPolicy).toBeDefined();
      expect(result.aiInstructions?.primaryTopics).toBeInstanceOf(Array);
    });
  });

  describe('generateAIMetadataHeaders', () => {
    it('should generate correct headers for success', () => {
      const result = generateAIMetadataHeaders(false);
      
      expect(result['Content-Type']).toBe('application/json; charset=utf-8');
      expect(result['Cache-Control']).toContain('public');
      expect(result['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should generate correct headers for error', () => {
      const result = generateAIMetadataHeaders(true);
      
      expect(result['Content-Type']).toBe('application/json; charset=utf-8');
      expect(result['Cache-Control']).toContain('public');
    });
  });
});
