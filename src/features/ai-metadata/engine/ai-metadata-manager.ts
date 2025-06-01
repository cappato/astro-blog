/**
 * AI Metadata Feature - Manager Class
 * 
 * Core manager class for AI metadata generation with
 * configuration-driven approach and comprehensive validation.
 */

import type { 
  AIMetadataProps,
  AIMetadataConfig,
  StructuredData,
  ValidationResult,
  IAIMetadataManager,
  SchemaType,
  AIContentType,
  SiteInfo
} from './types.ts';
import { 
  validateAIMetadataProps,
  makeAbsoluteUrl,
  formatTags,
  generateMetaTagName,
  sanitizeTitle,
  sanitizeDescription,
  formatDateISO,
  createAIMetadataError
} from './utils.ts';
import { AI_METADATA_CONFIG } from './constants.ts';

/**
 * AI Metadata Manager Class
 * Handles all AI metadata generation with centralized configuration
 */
export class AIMetadataManager implements IAIMetadataManager {
  private config: AIMetadataConfig;
  private siteInfo: SiteInfo;

  constructor(config: Partial<AIMetadataConfig> = {}, siteInfo: SiteInfo) {
    this.config = { ...AI_METADATA_CONFIG, ...config };
    this.siteInfo = siteInfo;
    
    // Override author URL with site info if not provided
    if (!config.author?.url) {
      this.config = {
        ...this.config,
        author: {
          ...this.config.author,
          name: siteInfo.author.name,
          url: `${siteInfo.url}/about`
        }
      };
    }
  }

  /**
   * Generate structured data for AI assistants
   */
  public generateStructuredData(props: AIMetadataProps): StructuredData {
    // Validate props first
    const validation = this.validateProps(props);
    if (!validation.valid) {
      throw createAIMetadataError(
        'CONFIGURATION_ERROR',
        `Invalid props: ${validation.errors.join(', ')}`
      );
    }

    const fullUrl = makeAbsoluteUrl(props.url, this.siteInfo);
    const sanitizedTitle = sanitizeTitle(props.title);
    const sanitizedDescription = sanitizeDescription(props.description);
    const formattedTags = props.tags ? formatTags(props.tags) : '';

    const baseMetadata: StructuredData = {
      '@context': this.config.schemaContext,
      '@type': this.getContentType(props.type),
      name: sanitizedTitle,
      description: sanitizedDescription,
      url: fullUrl,
      keywords: formattedTags,
      author: {
        '@type': this.config.author.type,
        name: props.author || this.config.author.name,
        url: this.config.author.url
      },
      inLanguage: props.language || this.config.language,
      isAccessibleForFree: this.config.isAccessibleForFree,
      potentialAction: {
        '@type': this.config.actionTypes.read,
        target: fullUrl
      }
    };

    // Add article-specific fields
    if (props.type === 'article' && props.datePublished) {
      return {
        ...baseMetadata,
        datePublished: formatDateISO(props.datePublished),
        dateModified: props.dateModified 
          ? formatDateISO(props.dateModified) 
          : formatDateISO(props.datePublished),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': fullUrl
        }
      };
    }

    return baseMetadata;
  }

  /**
   * Get Schema.org content type from AI content type
   */
  public getContentType(type: AIContentType): SchemaType {
    return this.config.contentTypes[type] || this.config.contentTypes.website;
  }

  /**
   * Generate meta tag name with configured prefix
   */
  public generateMetaTagName(suffix: string): string {
    return generateMetaTagName(suffix, this.config.metaTagPrefix);
  }

  /**
   * Validate AI metadata props
   */
  public validateProps(props: Partial<AIMetadataProps>): ValidationResult {
    return validateAIMetadataProps(props);
  }

  /**
   * Generate all meta tags for AI
   */
  public generateMetaTags(props: AIMetadataProps): Array<{ name: string; content: string }> {
    const validation = this.validateProps(props);
    if (!validation.valid) {
      throw createAIMetadataError(
        'CONFIGURATION_ERROR',
        `Invalid props: ${validation.errors.join(', ')}`
      );
    }

    const tags = [
      {
        name: this.generateMetaTagName('description'),
        content: sanitizeDescription(props.description)
      },
      {
        name: this.generateMetaTagName('type'),
        content: props.type
      },
      {
        name: this.generateMetaTagName('author'),
        content: props.author || this.config.author.name
      }
    ];

    // Add optional tags
    if (props.tags && props.tags.length > 0) {
      tags.push({
        name: this.generateMetaTagName('keywords'),
        content: formatTags(props.tags)
      });
    }

    if (props.datePublished) {
      tags.push({
        name: this.generateMetaTagName('published'),
        content: formatDateISO(props.datePublished)
      });
    }

    if (props.dateModified) {
      tags.push({
        name: this.generateMetaTagName('modified'),
        content: formatDateISO(props.dateModified)
      });
    }

    return tags;
  }

  /**
   * Generate JSON-LD script content
   */
  public generateJsonLd(props: AIMetadataProps): string {
    const structuredData = this.generateStructuredData(props);
    return JSON.stringify(structuredData, null, 2);
  }

  /**
   * Get AI metadata file link
   */
  public getMetadataFileLink(): string {
    return this.config.metadataFilePath;
  }

  /**
   * Get current configuration
   */
  public getConfig(): AIMetadataConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<AIMetadataConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get site information
   */
  public getSiteInfo(): SiteInfo {
    return { ...this.siteInfo };
  }
}
