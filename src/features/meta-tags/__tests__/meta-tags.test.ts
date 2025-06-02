/**
 * Meta Tags Feature Tests
 * Comprehensive test suite for meta tag generation system
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  MetaTagGenerator,
  MetaTagValidator,
  generateMetaTags,
  generateArticleMetaTags,
  createMetaTagSystem,
  extractMetaContent,
  filterMetaTagsByType,
  validateSEORequirements,
  DEFAULT_META_CONFIG,
  DEFAULT_VALIDATION_RULES
} from '../index';
import type { MetaTagProps, ArticleProps } from '../engine/types';

describe('Meta Tags Feature', () => {
  const siteUrl = 'https://example.com';
  const basicProps: MetaTagProps = {
    title: 'Test Page',
    description: 'This is a test page description that meets the minimum length requirements.',
    type: 'website'
  };

  const articleProps: ArticleProps = {
    title: 'Test Article',
    description: 'This is a test article description that meets the minimum length requirements.',
    type: 'article',
    publishedDate: new Date('2024-01-01'),
    author: 'Test Author',
    tags: ['test', 'article']
  };

  describe('Configuration Constants', () => {
    test('should have correct default configuration', () => {
      expect(DEFAULT_META_CONFIG.defaultImage).toBe('/images/og-default.webp');
      expect(DEFAULT_META_CONFIG.twitter.card).toBe('summary_large_image');
      expect(DEFAULT_META_CONFIG.openGraph.type).toBe('website');
      expect(DEFAULT_META_CONFIG.openGraph.locale).toBe('es_ES');
    });

    test('should have valid validation rules', () => {
      expect(DEFAULT_VALIDATION_RULES.maxTitleLength).toBe(60);
      expect(DEFAULT_VALIDATION_RULES.maxDescriptionLength).toBe(160);
      expect(DEFAULT_VALIDATION_RULES.minDescriptionLength).toBe(50);
    });

    test('should have valid image format configuration', () => {
      expect(DEFAULT_META_CONFIG.imageFormats.webp.mimeType).toBe('image/webp');
      expect(DEFAULT_META_CONFIG.imageFormats.jpeg.mimeType).toBe('image/jpeg');
    });
  });

  describe('MetaTagValidator Class', () => {
    let validator: MetaTagValidator;

    beforeEach(() => {
      validator = new MetaTagValidator();
    });

    test('should validate canonical URLs correctly', () => {
      const result = validator.validateCanonicalUrl('/test-page', siteUrl);
      
      expect(result.isValid).toBe(true);
      expect(result.normalizedUrl).toBe('https://example.com/test-page');
      expect(result.errors).toHaveLength(0);
    });

    test('should handle absolute URLs', () => {
      const result = validator.validateCanonicalUrl('https://example.com/page', siteUrl);
      
      expect(result.isValid).toBe(true);
      expect(result.normalizedUrl).toBe('https://example.com/page');
    });

    test('should correct legacy domain', () => {
      const result = validator.validateCanonicalUrl('https://matiascappato.com/page', siteUrl);

      expect(result.isValid).toBe(true);
      expect(result.normalizedUrl).toBe('https://cappato.dev/page');
    });

    test('should validate image configuration', () => {
      const image = {
        url: '/images/test.webp',
        alt: 'Test image',
        width: 1200,
        height: 630
      };
      
      const result = validator.validateImage(image, siteUrl);
      
      expect(result.isValid).toBe(true);
      expect(result.urls.webp).toBe('https://example.com/images/test.webp');
      expect(result.urls.jpeg).toContain('.jpeg');
    });

    test('should handle missing image with defaults', () => {
      const result = validator.validateImage(undefined, siteUrl);
      
      expect(result.isValid).toBe(true);
      expect(result.urls.webp).toContain(DEFAULT_META_CONFIG.defaultImage);
    });

    test('should validate dates correctly', () => {
      const publishedDate = new Date('2024-01-01');
      const modifiedDate = new Date('2024-01-02');
      
      const result = validator.validateDates(publishedDate, modifiedDate);
      
      expect(result.publishedDate).toEqual(publishedDate);
      expect(result.modifiedDate).toEqual(modifiedDate);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect invalid date order', () => {
      const publishedDate = new Date('2024-01-02');
      const modifiedDate = new Date('2024-01-01');
      
      const result = validator.validateDates(publishedDate, modifiedDate);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Modified date cannot be before published date');
    });

    test('should validate title length', () => {
      const shortTitle = 'Short';
      const longTitle = 'a'.repeat(70);
      const validTitle = 'Valid Title Length';
      
      expect(validator.validateTitle(shortTitle).isValid).toBe(false);
      expect(validator.validateTitle(longTitle).isValid).toBe(false);
      expect(validator.validateTitle(validTitle).isValid).toBe(true);
    });

    test('should validate description length', () => {
      const shortDesc = 'Too short';
      const longDesc = 'a'.repeat(200);
      const validDesc = 'This is a valid description that meets the minimum length requirements for SEO purposes.';
      
      expect(validator.validateDescription(shortDesc).isValid).toBe(false);
      expect(validator.validateDescription(longDesc).isValid).toBe(false);
      expect(validator.validateDescription(validDesc).isValid).toBe(true);
    });
  });

  describe('MetaTagGenerator Class', () => {
    let generator: MetaTagGenerator;

    beforeEach(() => {
      generator = new MetaTagGenerator({ siteUrl });
    });

    test('should generate basic SEO meta tags', () => {
      const result = generator.generateBasicSEO(basicProps);
      
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'title', content: 'Test Page' }),
          expect.objectContaining({ name: 'description', content: basicProps.description }),
          expect.objectContaining({ name: 'keywords' }),
          expect.objectContaining({ name: 'author' })
        ])
      );
    });

    test('should generate Open Graph meta tags', () => {
      const result = generator.generateOpenGraph(basicProps);
      
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ property: 'og:title', content: 'Test Page' }),
          expect.objectContaining({ property: 'og:description', content: basicProps.description }),
          expect.objectContaining({ property: 'og:type', content: 'website' }),
          expect.objectContaining({ property: 'og:url' }),
          expect.objectContaining({ property: 'og:image' })
        ])
      );
    });

    test('should generate Twitter Card meta tags', () => {
      const result = generator.generateTwitterCards(basicProps);
      
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'twitter:card' }),
          expect.objectContaining({ name: 'twitter:title', content: 'Test Page' }),
          expect.objectContaining({ name: 'twitter:description', content: basicProps.description }),
          expect.objectContaining({ name: 'twitter:image' })
        ])
      );
    });

    test('should generate article-specific meta tags', () => {
      const result = generator.generateArticleTags(articleProps);
      
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ property: 'article:published_time' }),
          expect.objectContaining({ property: 'article:author', content: 'Test Author' }),
          expect.objectContaining({ property: 'article:tag', content: 'test' }),
          expect.objectContaining({ property: 'article:tag', content: 'article' })
        ])
      );
    });

    test('should generate complete meta tags', () => {
      const result = generator.generateMetaTags(basicProps);
      
      expect(result.metaTags.length).toBeGreaterThan(10);
      expect(result.linkTags.length).toBeGreaterThan(0);
      expect(result.warnings).toBeDefined();
    });

    test('should handle custom image configuration', () => {
      const propsWithImage: MetaTagProps = {
        ...basicProps,
        image: {
          url: '/custom-image.webp',
          alt: 'Custom image',
          width: 1200,
          height: 630
        }
      };
      
      const result = generator.generateMetaTags(propsWithImage);
      const ogImage = result.metaTags.find(tag => tag.property === 'og:image');
      
      expect(ogImage?.content).toContain('custom-image.webp');
    });
  });

  describe('Utility Functions', () => {
    test('generateMetaTags should work with default configuration', () => {
      const result = generateMetaTags(basicProps, siteUrl);
      
      expect(result.metaTags.length).toBeGreaterThan(0);
      expect(result.linkTags.length).toBeGreaterThan(0);
    });

    test('generateArticleMetaTags should work for articles', () => {
      const result = generateArticleMetaTags(articleProps, siteUrl);
      
      const articleTags = result.metaTags.filter(tag => 
        tag.property?.startsWith('article:')
      );
      expect(articleTags.length).toBeGreaterThan(0);
    });

    test('extractMetaContent should find meta tag content', () => {
      const result = generateMetaTags(basicProps, siteUrl);
      const title = extractMetaContent(result.metaTags, 'title');
      
      expect(title).toBe('Test Page');
    });

    test('filterMetaTagsByType should filter correctly', () => {
      const result = generateMetaTags(basicProps, siteUrl);
      
      const ogTags = filterMetaTagsByType(result.metaTags, 'og');
      const twitterTags = filterMetaTagsByType(result.metaTags, 'twitter');
      const basicTags = filterMetaTagsByType(result.metaTags, 'basic');
      
      expect(ogTags.every(tag => tag.property?.startsWith('og:'))).toBe(true);
      expect(twitterTags.every(tag => tag.name?.startsWith('twitter:'))).toBe(true);
      expect(basicTags.every(tag => tag.name && !tag.property)).toBe(true);
    });

    test('validateSEORequirements should check required tags', () => {
      const result = generateMetaTags(basicProps, siteUrl);
      const validation = validateSEORequirements(result.metaTags);
      
      expect(validation.isValid).toBe(true);
      expect(validation.missing).toHaveLength(0);
    });

    test('createMetaTagSystem should create configured system', () => {
      const system = createMetaTagSystem(siteUrl);
      const result = system.generateMetaTags(basicProps);
      
      expect(result.metaTags.length).toBeGreaterThan(0);
      expect(typeof system.updateConfig).toBe('function');
      expect(typeof system.getConfig).toBe('function');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid URLs gracefully', () => {
      const validator = new MetaTagValidator();
      const result = validator.validateCanonicalUrl('invalid-url', siteUrl);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle missing required props', () => {
      const invalidProps = { title: '', description: '' } as MetaTagProps;
      const validator = new MetaTagValidator();
      const result = validator.validateProps(invalidProps);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle invalid dates', () => {
      const validator = new MetaTagValidator();
      const invalidDate = new Date('invalid');
      const result = validator.validateDates(invalidDate);
      
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle strict mode validation', () => {
      const generator = new MetaTagGenerator({ siteUrl, strict: true });
      const invalidProps = { title: '', description: '' } as MetaTagProps;
      
      expect(() => {
        generator.generateMetaTags(invalidProps);
      }).toThrow();
    });
  });

  describe('Backward Compatibility', () => {
    test('should maintain original API structure', () => {
      // Test that all original exports are available
      expect(typeof generateMetaTags).toBe('function');
      expect(typeof MetaTagGenerator).toBe('function');
      expect(typeof MetaTagValidator).toBe('function');
      expect(typeof DEFAULT_META_CONFIG).toBe('object');
    });

    test('should work with original usage patterns', () => {
      const result = generateMetaTags({
        title: 'Test',
        description: 'Test description that meets minimum length requirements for SEO.'
      }, siteUrl);
      
      expect(result.metaTags.length).toBeGreaterThan(0);
      expect(result.linkTags.length).toBeGreaterThan(0);
    });
  });
});
