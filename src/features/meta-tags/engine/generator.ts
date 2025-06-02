/**
 * Meta Tags Feature - Generation Engine
 * Framework-agnostic meta tag generation with SEO optimization
 */

import type {
  MetaTag,
  LinkTag,
  MetaTagProps,
  ArticleProps,
  GeneratedMetaTags,
  GeneratorOptions,
  MetaTagConfig,
  ValidationRules
} from './types';
import { DEFAULT_META_CONFIG, DEFAULT_VALIDATION_RULES, MetaTagType } from './types';
import { MetaTagValidator } from './validator';

/**
 * Meta tag generator class
 */
export class MetaTagGenerator {
  private config: MetaTagConfig;
  private validator: MetaTagValidator;
  private siteUrl: string;
  private strict: boolean;

  constructor(options: GeneratorOptions) {
    this.siteUrl = options.siteUrl;
    this.config = { ...DEFAULT_META_CONFIG, ...options.config };
    this.strict = options.strict ?? false;
    
    const validationRules = { ...DEFAULT_VALIDATION_RULES, ...options.validation };
    this.validator = new MetaTagValidator(validationRules, this.config);
  }

  /**
   * Generate all meta tags for a page
   */
  public generateMetaTags(props: MetaTagProps): GeneratedMetaTags {
    const warnings: string[] = [];
    
    // Validate props if in strict mode
    if (this.strict) {
      const validation = this.validator.validateProps(props);
      if (!validation.isValid) {
        throw new Error(`Meta tag validation failed: ${validation.errors.join(', ')}`);
      }
    } else {
      // Collect warnings in non-strict mode
      const validation = this.validator.validateProps(props);
      warnings.push(...validation.errors);
    }

    // Generate all meta tag types
    const metaTags: MetaTag[] = [
      ...this.generateBasicSEO(props),
      ...this.generateOpenGraph(props),
      ...this.generateTwitterCards(props),
      ...(props.type === 'article' ? this.generateArticleTags(props as ArticleProps) : []),
      ...this.generateTechnicalTags(props)
    ];

    // Generate link tags
    const linkTags: LinkTag[] = [
      ...this.generateCanonicalLink(props),
      ...this.generateAIMetadataLink()
    ];

    return {
      metaTags,
      linkTags,
      warnings
    };
  }

  /**
   * Generate basic SEO meta tags
   */
  public generateBasicSEO(props: MetaTagProps): MetaTag[] {
    const keywords = props.keywords || this.config.defaultKeywords;
    const author = props.author || 'Matías Cappato';

    return [
      { name: 'title', content: props.title },
      { name: 'description', content: props.description },
      { name: 'keywords', content: keywords.join(', ') },
      { name: 'author', content: author }
    ];
  }

  /**
   * Generate Open Graph meta tags
   */
  public generateOpenGraph(props: MetaTagProps): MetaTag[] {
    const canonicalUrl = this.generateCanonicalUrl(props);
    const imageValidation = this.validator.validateImage(props.image, this.siteUrl);
    const type = props.type || this.config.openGraph.type;

    const ogTags: MetaTag[] = [
      { property: 'og:type', content: type },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:title', content: props.title },
      { property: 'og:description', content: props.description },
      { property: 'og:site_name', content: this.config.openGraph.siteName },
      { property: 'og:locale', content: this.config.openGraph.locale }
    ];

    // Add image tags
    const imageUrls = imageValidation.urls;
    const imageAlt = props.image?.alt || this.config.defaultImageAlt;

    // WebP image (primary)
    ogTags.push(
      { property: 'og:image', content: imageUrls.webp },
      { property: 'og:image:type', content: this.config.imageFormats.webp.mimeType },
      { property: 'og:image:alt', content: imageAlt }
    );

    // Add dimensions if available
    if (props.image?.width) {
      ogTags.push({ property: 'og:image:width', content: props.image.width.toString() });
    }
    if (props.image?.height) {
      ogTags.push({ property: 'og:image:height', content: props.image.height.toString() });
    }

    // JPEG image (fallback)
    ogTags.push(
      { property: 'og:image', content: imageUrls.jpeg },
      { property: 'og:image:type', content: this.config.imageFormats.jpeg.mimeType },
      { property: 'og:image:alt', content: imageAlt }
    );

    // Add dimensions for fallback too
    if (props.image?.width) {
      ogTags.push({ property: 'og:image:width', content: props.image.width.toString() });
    }
    if (props.image?.height) {
      ogTags.push({ property: 'og:image:height', content: props.image.height.toString() });
    }

    return ogTags;
  }

  /**
   * Generate Twitter Card meta tags
   */
  public generateTwitterCards(props: MetaTagProps): MetaTag[] {
    const canonicalUrl = this.generateCanonicalUrl(props);
    const imageValidation = this.validator.validateImage(props.image, this.siteUrl);
    const imageAlt = props.image?.alt || this.config.defaultImageAlt;
    const twitterUsername = props.twitterUsername || this.config.twitter.creator;

    const twitterTags: MetaTag[] = [
      { name: 'twitter:card', content: this.config.twitter.card },
      { name: 'twitter:url', content: canonicalUrl },
      { name: 'twitter:title', content: props.title },
      { name: 'twitter:description', content: props.description },
      { name: 'twitter:image', content: imageValidation.urls.webp },
      { name: 'twitter:image:alt', content: imageAlt }
    ];

    // Add creator if available
    if (twitterUsername) {
      twitterTags.push({ name: 'twitter:creator', content: twitterUsername });
    }

    return twitterTags;
  }

  /**
   * Generate article-specific meta tags
   */
  public generateArticleTags(props: ArticleProps): MetaTag[] {
    const dateValidation = this.validator.validateDates(props.publishedDate, props.modifiedDate);
    const articleTags: MetaTag[] = [];

    // Published time
    if (dateValidation.publishedDate) {
      articleTags.push({
        property: 'article:published_time',
        content: dateValidation.publishedDate.toISOString()
      });
    }

    // Modified time
    if (dateValidation.modifiedDate) {
      articleTags.push({
        property: 'article:modified_time',
        content: dateValidation.modifiedDate.toISOString()
      });
    }

    // Author
    if (props.author) {
      articleTags.push({
        property: 'article:author',
        content: props.author
      });
    }

    // Tags
    if (props.tags && props.tags.length > 0) {
      props.tags.forEach(tag => {
        articleTags.push({
          property: 'article:tag',
          content: tag
        });
      });
    }

    return articleTags;
  }

  /**
   * Generate technical meta tags
   */
  public generateTechnicalTags(props: MetaTagProps): MetaTag[] {
    return [
      { name: 'robots', content: 'index, follow' },
      { name: 'googlebot', content: 'index, follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
    ];
  }

  /**
   * Generate canonical link
   */
  public generateCanonicalLink(props: MetaTagProps): LinkTag[] {
    const canonicalUrl = this.generateCanonicalUrl(props);
    
    return [
      {
        rel: 'canonical',
        href: canonicalUrl
      }
    ];
  }

  /**
   * Generate AI metadata link
   */
  public generateAIMetadataLink(): LinkTag[] {
    return [
      {
        rel: 'ai-metadata',
        href: '/ai-metadata.json'
      }
    ];
  }

  /**
   * Generate canonical URL
   */
  private generateCanonicalUrl(props: MetaTagProps): string {
    if (props.canonicalUrl) {
      const validation = this.validator.validateCanonicalUrl(
        props.canonicalUrl,
        this.siteUrl
      );
      return validation.normalizedUrl;
    }

    // Default to site URL for homepage
    return this.siteUrl;
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MetaTagConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.validator.updateConfig(this.config);
  }

  /**
   * Update site URL
   */
  public updateSiteUrl(newSiteUrl: string): void {
    this.siteUrl = newSiteUrl;
  }

  /**
   * Get current configuration
   */
  public getConfig(): MetaTagConfig {
    return { ...this.config };
  }

  /**
   * Get site URL
   */
  public getSiteUrl(): string {
    return this.siteUrl;
  }

  /**
   * Enable/disable strict mode
   */
  public setStrictMode(strict: boolean): void {
    this.strict = strict;
  }
}

/**
 * Utility functions for quick meta tag generation
 */

/**
 * Generate meta tags with default configuration
 */
export function generateMetaTags(
  props: MetaTagProps,
  siteUrl: string,
  config?: Partial<MetaTagConfig>
): GeneratedMetaTags {
  const generator = new MetaTagGenerator({
    siteUrl,
    config,
    strict: false
  });
  
  return generator.generateMetaTags(props);
}

/**
 * Generate meta tags for articles
 */
export function generateArticleMetaTags(
  props: ArticleProps,
  siteUrl: string,
  config?: Partial<MetaTagConfig>
): GeneratedMetaTags {
  const generator = new MetaTagGenerator({
    siteUrl,
    config,
    strict: false
  });
  
  return generator.generateMetaTags(props);
}

/**
 * Create meta tag generator with configuration
 */
export function createMetaTagGenerator(options: GeneratorOptions): MetaTagGenerator {
  return new MetaTagGenerator(options);
}
