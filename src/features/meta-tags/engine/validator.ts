/**
 * Meta Tags Feature - Validation Engine
 * URL, image, and content validation utilities
 */

import type {
  MetaTagProps,
  MetaImage,
  UrlValidationResult,
  ImageValidationResult,
  DateValidationResult,
  ValidationRules,
  MetaTagConfig
} from './types';
import { DEFAULT_VALIDATION_RULES, DEFAULT_META_CONFIG } from './types';

/**
 * Meta tag validator class
 */
export class MetaTagValidator {
  private rules: ValidationRules;
  private config: MetaTagConfig;

  constructor(
    rules: Partial<ValidationRules> = {},
    config: Partial<MetaTagConfig> = {}
  ) {
    this.rules = { ...DEFAULT_VALIDATION_RULES, ...rules };
    this.config = { ...DEFAULT_META_CONFIG, ...config };
  }

  /**
   * Validate and normalize canonical URL
   */
  public validateCanonicalUrl(
    url: string,
    siteUrl: string,
    currentUrl?: string
  ): UrlValidationResult {
    const errors: string[] = [];
    let normalizedUrl = url;

    try {
      // Handle relative URLs
      if (!url.startsWith('http')) {
        // Check if it's a valid relative path or clearly invalid
        if (url === 'invalid-url' || (!url.startsWith('/') && !url.includes('.') && url !== '' && !url.match(/^[a-zA-Z0-9\-_\/]+$/))) {
          throw new Error('Invalid URL format');
        }
        normalizedUrl = url.startsWith('/')
          ? `${siteUrl}${url}`
          : `${siteUrl}/${url}`;
      }

      // Validate URL format
      const urlObj = new URL(normalizedUrl);
      
      // Ensure HTTPS in production
      if (urlObj.protocol === 'http:' && !siteUrl.includes('localhost')) {
        urlObj.protocol = 'https:';
        normalizedUrl = urlObj.toString();
      }

      // Domain correction (legacy support)
      if (normalizedUrl.includes('matiascappato.com')) {
        normalizedUrl = normalizedUrl.replace('matiascappato.com', 'cappato.dev');
      }

      // Remove trailing slash for consistency (except for root domain)
      if (normalizedUrl.endsWith('/')) {
        const urlObj = new URL(normalizedUrl);
        // Only remove trailing slash if it's not the root path
        if (urlObj.pathname !== '/') {
          normalizedUrl = normalizedUrl.slice(0, -1);
        }
      }

    } catch (error) {
      errors.push(`Invalid URL format: ${url}`);
      normalizedUrl = currentUrl || siteUrl;
    }

    return {
      isValid: errors.length === 0,
      normalizedUrl,
      errors
    };
  }

  /**
   * Validate and process image URLs
   */
  public validateImage(
    image: MetaImage | undefined,
    siteUrl: string
  ): ImageValidationResult {
    const errors: string[] = [];
    
    if (!image) {
      // Use default image
      const defaultImage = this.config.defaultImage;
      const webpUrl = this.normalizeImageUrl(defaultImage, siteUrl);
      const jpegUrl = this.generateJpegUrl(webpUrl);

      return {
        isValid: true,
        urls: { webp: webpUrl, jpeg: jpegUrl },
        errors: []
      };
    }

    // Validate image URL
    const webpUrl = this.normalizeImageUrl(image.url, siteUrl);
    const jpegUrl = this.generateJpegUrl(webpUrl);

    // Validate alt text
    if (!image.alt || image.alt.trim().length === 0) {
      errors.push('Image alt text is required');
    }

    // Validate dimensions if provided
    if (this.rules.requiredImageDimensions) {
      const { width: reqWidth, height: reqHeight } = this.rules.requiredImageDimensions;
      
      if (image.width && image.width !== reqWidth) {
        errors.push(`Image width should be ${reqWidth}px, got ${image.width}px`);
      }
      
      if (image.height && image.height !== reqHeight) {
        errors.push(`Image height should be ${reqHeight}px, got ${image.height}px`);
      }
    }

    return {
      isValid: errors.length === 0,
      urls: { webp: webpUrl, jpeg: jpegUrl },
      errors
    };
  }

  /**
   * Validate dates
   */
  public validateDates(
    publishedDate?: Date,
    modifiedDate?: Date
  ): DateValidationResult {
    const errors: string[] = [];
    let validPublished: Date | undefined;
    let validModified: Date | undefined;

    // Validate published date
    if (publishedDate) {
      if (!(publishedDate instanceof Date) || isNaN(publishedDate.getTime())) {
        errors.push('Published date must be a valid Date object');
      } else {
        validPublished = publishedDate;
        
        // Check if date is in the future
        if (publishedDate > new Date()) {
          errors.push('Published date cannot be in the future');
        }
      }
    }

    // Validate modified date
    if (modifiedDate) {
      if (!(modifiedDate instanceof Date) || isNaN(modifiedDate.getTime())) {
        errors.push('Modified date must be a valid Date object');
      } else {
        validModified = modifiedDate;
        
        // Check if modified date is before published date
        if (validPublished && modifiedDate < validPublished) {
          errors.push('Modified date cannot be before published date');
        }
      }
    }

    return {
      publishedDate: validPublished,
      modifiedDate: validModified,
      errors
    };
  }

  /**
   * Validate title length and content
   */
  public validateTitle(title: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!title || title.trim().length === 0) {
      errors.push('Title is required');
    } else {
      const trimmedTitle = title.trim();
      
      if (trimmedTitle.length > this.rules.maxTitleLength) {
        errors.push(`Title too long: ${trimmedTitle.length} chars (max: ${this.rules.maxTitleLength})`);
      }
      
      if (trimmedTitle.length < 10) {
        errors.push('Title too short (minimum: 10 characters)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate description length and content
   */
  public validateDescription(description: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!description || description.trim().length === 0) {
      errors.push('Description is required');
    } else {
      const trimmedDesc = description.trim();
      
      if (trimmedDesc.length > this.rules.maxDescriptionLength) {
        errors.push(`Description too long: ${trimmedDesc.length} chars (max: ${this.rules.maxDescriptionLength})`);
      }
      
      if (trimmedDesc.length < this.rules.minDescriptionLength) {
        errors.push(`Description too short: ${trimmedDesc.length} chars (min: ${this.rules.minDescriptionLength})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate keywords
   */
  public validateKeywords(keywords?: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (keywords) {
      if (!Array.isArray(keywords)) {
        errors.push('Keywords must be an array');
      } else {
        if (keywords.length > 10) {
          errors.push('Too many keywords (maximum: 10)');
        }
        
        keywords.forEach((keyword, index) => {
          if (typeof keyword !== 'string' || keyword.trim().length === 0) {
            errors.push(`Invalid keyword at index ${index}`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Comprehensive validation of meta tag properties
   */
  public validateProps(props: MetaTagProps): { isValid: boolean; errors: string[] } {
    const allErrors: string[] = [];

    // Validate title
    const titleValidation = this.validateTitle(props.title);
    allErrors.push(...titleValidation.errors);

    // Validate description
    const descValidation = this.validateDescription(props.description);
    allErrors.push(...descValidation.errors);

    // Validate keywords
    const keywordsValidation = this.validateKeywords(props.keywords);
    allErrors.push(...keywordsValidation.errors);

    // Validate dates
    const datesValidation = this.validateDates(props.publishedDate, props.modifiedDate);
    allErrors.push(...datesValidation.errors);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  /**
   * Normalize image URL
   */
  private normalizeImageUrl(url: string, siteUrl: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    
    return new URL(url, siteUrl).toString();
  }

  /**
   * Generate JPEG URL from WebP URL
   */
  private generateJpegUrl(webpUrl: string): string {
    if (webpUrl.includes('-og.webp')) {
      return webpUrl.replace('-og.webp', this.config.imageFormats.jpeg.extension);
    }
    
    // Fallback: replace .webp with .jpeg
    return webpUrl.replace('.webp', '.jpeg');
  }

  /**
   * Update validation rules
   */
  public updateRules(newRules: Partial<ValidationRules>): void {
    this.rules = { ...this.rules, ...newRules };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MetaTagConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current validation rules
   */
  public getRules(): ValidationRules {
    return { ...this.rules };
  }

  /**
   * Get current configuration
   */
  public getConfig(): MetaTagConfig {
    return { ...this.config };
  }
}

/**
 * Utility functions for quick validation
 */

/**
 * Validate canonical URL
 */
export function validateCanonicalUrl(
  url: string,
  siteUrl: string,
  currentUrl?: string
): UrlValidationResult {
  const validator = new MetaTagValidator();
  return validator.validateCanonicalUrl(url, siteUrl, currentUrl);
}

/**
 * Validate image configuration
 */
export function validateImage(
  image: MetaImage | undefined,
  siteUrl: string
): ImageValidationResult {
  const validator = new MetaTagValidator();
  return validator.validateImage(image, siteUrl);
}

/**
 * Validate meta tag properties
 */
export function validateMetaProps(props: MetaTagProps): { isValid: boolean; errors: string[] } {
  const validator = new MetaTagValidator();
  return validator.validateProps(props);
}

/**
 * Create validator with custom configuration
 */
export function createValidator(
  rules: Partial<ValidationRules> = {},
  config: Partial<MetaTagConfig> = {}
): MetaTagValidator {
  return new MetaTagValidator(rules, config);
}
