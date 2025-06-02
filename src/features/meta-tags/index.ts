/**
 * Meta Tags Feature - Public API
 * Framework-agnostic meta tag generation system with SEO optimization
 * 
 * @example
 * ```typescript
 * import { generateMetaTags, MetaTagGenerator } from '@features/meta-tags';
 * 
 * // Simple usage
 * const result = generateMetaTags({
 *   title: 'Page Title',
 *   description: 'Page description'
 * }, 'https://example.com');
 * 
 * // Advanced usage
 * const generator = new MetaTagGenerator({
 *   siteUrl: 'https://example.com',
 *   strict: true
 * });
 * ```
 */

// Type exports
export type {
  MetaTag,
  LinkTag,
  MetaImage,
  MetaTagProps,
  ArticleProps,
  MetaTagConfig,
  ValidationRules,
  GeneratedMetaTags,
  GeneratorOptions,
  UrlValidationResult,
  ImageValidationResult,
  DateValidationResult,
  ImageFormat
} from './engine/types';

export {
  DEFAULT_META_CONFIG,
  DEFAULT_VALIDATION_RULES,
  MetaTagType,
  FEATURE_INFO,
  isValidMetaTagType,
  validateMetaConfig,
  validateMetaProps as validateMetaPropsType,
  isBrowser
} from './engine/types';

// Core engine exports
export {
  MetaTagGenerator,
  generateMetaTags,
  generateArticleMetaTags,
  createMetaTagGenerator
} from './engine/generator';

// Import for internal use
import { createMetaTagGenerator } from './engine/generator';

export {
  MetaTagValidator,
  validateCanonicalUrl,
  validateImage,
  validateMetaProps,
  createValidator
} from './engine/validator';

/**
 * Backward compatibility exports
 * These maintain compatibility with the original MetaTags.astro component
 */

/**
 * Generate meta tags with site configuration
 */
export function createMetaTagsForSite(
  props: MetaTagProps,
  siteUrl: string = 'https://cappato.dev'
): GeneratedMetaTags {
  return generateMetaTags(props, siteUrl);
}

/**
 * Generate meta tags for blog posts
 */
export function createBlogPostMetaTags(
  props: ArticleProps,
  siteUrl: string = 'https://cappato.dev'
): GeneratedMetaTags {
  return generateArticleMetaTags(props, siteUrl);
}

/**
 * Create a configured meta tag system
 */
export function createMetaTagSystem(
  siteUrl: string,
  config: Partial<MetaTagConfig> = {},
  validation: Partial<ValidationRules> = {}
) {
  const generator = createMetaTagGenerator({
    siteUrl,
    config,
    validation,
    strict: false
  });
  
  return {
    generator,
    generateMetaTags: (props: MetaTagProps) => generator.generateMetaTags(props),
    generateArticleTags: (props: ArticleProps) => generator.generateMetaTags(props),
    updateConfig: (newConfig: Partial<MetaTagConfig>) => generator.updateConfig(newConfig),
    getConfig: () => generator.getConfig()
  };
}

/**
 * Utility functions for common meta tag operations
 */

/**
 * Extract meta tag content for testing/validation
 */
export function extractMetaContent(metaTags: MetaTag[], nameOrProperty: string): string | undefined {
  const tag = metaTags.find(tag => 
    tag.name === nameOrProperty || tag.property === nameOrProperty
  );
  return tag?.content;
}

/**
 * Filter meta tags by type
 */
export function filterMetaTagsByType(metaTags: MetaTag[], type: 'basic' | 'og' | 'twitter' | 'article'): MetaTag[] {
  switch (type) {
    case 'basic':
      return metaTags.filter(tag => tag.name && !tag.property);
    case 'og':
      return metaTags.filter(tag => tag.property?.startsWith('og:'));
    case 'twitter':
      return metaTags.filter(tag => tag.name?.startsWith('twitter:'));
    case 'article':
      return metaTags.filter(tag => tag.property?.startsWith('article:'));
    default:
      return metaTags;
  }
}

/**
 * Convert meta tags to HTML string (for testing)
 */
export function metaTagsToHTML(metaTags: MetaTag[], linkTags: LinkTag[] = []): string {
  const metaHTML = metaTags.map(tag => {
    const attrs = Object.entries(tag)
      .filter(([key, value]) => value !== undefined)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    return `<meta ${attrs} />`;
  }).join('\n');

  const linkHTML = linkTags.map(tag => {
    const attrs = Object.entries(tag)
      .filter(([key, value]) => value !== undefined)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    return `<link ${attrs} />`;
  }).join('\n');

  return [metaHTML, linkHTML].filter(Boolean).join('\n');
}

/**
 * Validate meta tags against common SEO requirements
 */
export function validateSEORequirements(metaTags: MetaTag[]): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Required meta tags
  const requiredTags = ['title', 'description', 'og:title', 'og:description', 'twitter:title'];
  
  requiredTags.forEach(tagName => {
    const exists = metaTags.some(tag => 
      tag.name === tagName || tag.property === tagName
    );
    if (!exists) {
      missing.push(tagName);
    }
  });

  // Check description length
  const description = extractMetaContent(metaTags, 'description');
  if (description) {
    if (description.length > 160) {
      warnings.push('Description too long (>160 chars)');
    }
    if (description.length < 50) {
      warnings.push('Description too short (<50 chars)');
    }
  }

  // Check title length
  const title = extractMetaContent(metaTags, 'title');
  if (title && title.length > 60) {
    warnings.push('Title too long (>60 chars)');
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Configuration constants for backward compatibility
 */
export { DEFAULT_META_CONFIG as META_TAGS_CONFIG } from './engine/types';
export { DEFAULT_VALIDATION_RULES as VALIDATION_CONFIG } from './engine/types';

/**
 * Feature metadata for documentation and tooling
 */
export const META_TAGS_SYSTEM_INFO = {
  name: 'Meta Tags System',
  version: '1.0.0',
  description: 'Framework-agnostic meta tag generation with SEO optimization',
  migrationStatus: 'complete',
  originalLocation: 'src/components/seo/MetaTags.astro',
  newLocation: 'src/features/meta-tags/',
  backwardCompatible: true,
  dependencies: [],
  exports: [
    'MetaTagGenerator',
    'MetaTagValidator',
    'generateMetaTags',
    'validateMetaTags',
    'META_TAGS_CONFIG'
  ],
  components: [
    'MetaTags'
  ],
  compatibility: {
    frameworks: ['Astro', 'React', 'Vue', 'Svelte', 'Vanilla JS'],
    environments: ['Browser', 'SSR', 'SSG']
  },
  features: [
    'SEO meta tags generation',
    'Open Graph tags',
    'Twitter Cards',
    'Article-specific tags',
    'URL validation',
    'Image validation',
    'Date validation',
    'TypeScript support',
    'Framework agnostic'
  ]
} as const;
