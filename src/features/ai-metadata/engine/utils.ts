/**
 * AI Metadata Feature - Utility Functions
 * 
 * Pure utility functions for AI metadata processing,
 * validation, and URL handling.
 */

import type { 
  AIMetadataProps, 
  ValidationResult, 
  AIMetadataError,
  SiteInfo 
} from './types.ts';
import { 
  VALIDATION_RULES, 
  ERROR_CODES, 
  ERROR_MESSAGES 
} from './constants.ts';

/**
 * Validate AI metadata props
 */
export function validateAIMetadataProps(props: Partial<AIMetadataProps>): ValidationResult {
  const errors: string[] = [];

  // Validate required fields
  if (!props.title) {
    errors.push(ERROR_MESSAGES[ERROR_CODES.MISSING_REQUIRED_FIELD] + ': title');
  } else if (
    props.title.length < VALIDATION_RULES.MIN_TITLE_LENGTH ||
    props.title.length > VALIDATION_RULES.MAX_TITLE_LENGTH
  ) {
    errors.push(ERROR_MESSAGES[ERROR_CODES.INVALID_TITLE]);
  }

  if (!props.description) {
    errors.push(ERROR_MESSAGES[ERROR_CODES.MISSING_REQUIRED_FIELD] + ': description');
  } else if (
    props.description.length < VALIDATION_RULES.MIN_DESCRIPTION_LENGTH ||
    props.description.length > VALIDATION_RULES.MAX_DESCRIPTION_LENGTH
  ) {
    errors.push(ERROR_MESSAGES[ERROR_CODES.INVALID_DESCRIPTION]);
  }

  if (!props.url) {
    errors.push(ERROR_MESSAGES[ERROR_CODES.MISSING_REQUIRED_FIELD] + ': url');
  } else if (!VALIDATION_RULES.URL_PATTERN.test(props.url)) {
    errors.push(ERROR_MESSAGES[ERROR_CODES.INVALID_URL]);
  }

  if (!props.type) {
    errors.push(ERROR_MESSAGES[ERROR_CODES.MISSING_REQUIRED_FIELD] + ': type');
  } else if (!VALIDATION_RULES.VALID_CONTENT_TYPES.includes(props.type)) {
    errors.push(ERROR_MESSAGES[ERROR_CODES.INVALID_TYPE]);
  }

  // Validate optional fields
  if (props.datePublished && !(props.datePublished instanceof Date)) {
    errors.push(ERROR_MESSAGES[ERROR_CODES.INVALID_DATE] + ': datePublished');
  }

  if (props.dateModified && !(props.dateModified instanceof Date)) {
    errors.push(ERROR_MESSAGES[ERROR_CODES.INVALID_DATE] + ': dateModified');
  }

  if (props.tags) {
    if (!Array.isArray(props.tags)) {
      errors.push(ERROR_MESSAGES[ERROR_CODES.INVALID_TAGS] + ': must be array');
    } else if (props.tags.length > VALIDATION_RULES.MAX_TAGS_COUNT) {
      errors.push(ERROR_MESSAGES[ERROR_CODES.INVALID_TAGS] + ': too many tags');
    } else {
      for (const tag of props.tags) {
        if (typeof tag !== 'string' || tag.length > VALIDATION_RULES.MAX_TAG_LENGTH) {
          errors.push(ERROR_MESSAGES[ERROR_CODES.INVALID_TAGS] + ': invalid tag format');
          break;
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Convert relative URL to absolute URL
 */
export function makeAbsoluteUrl(url: string, siteInfo: SiteInfo): string {
  if (url.startsWith('http')) {
    return url;
  }
  
  const baseUrl = siteInfo.url.endsWith('/') ? siteInfo.url.slice(0, -1) : siteInfo.url;
  const path = url.startsWith('/') ? url : `/${url}`;
  
  return `${baseUrl}${path}`;
}

/**
 * Sanitize and format tags for metadata
 */
export function formatTags(tags: readonly string[]): string {
  return tags
    .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
    .map(tag => tag.trim())
    .join(', ');
}

/**
 * Generate meta tag name with prefix
 */
export function generateMetaTagName(suffix: string, prefix: string = 'ai:'): string {
  return `${prefix}${suffix}`;
}

/**
 * Sanitize title for metadata
 */
export function sanitizeTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, VALIDATION_RULES.MAX_TITLE_LENGTH);
}

/**
 * Sanitize description for metadata
 */
export function sanitizeDescription(description: string): string {
  return description
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, VALIDATION_RULES.MAX_DESCRIPTION_LENGTH);
}

/**
 * Format date for ISO string
 */
export function formatDateISO(date: Date): string {
  try {
    return date.toISOString();
  } catch (error) {
    throw new Error(`Invalid date: ${error}`);
  }
}

/**
 * Create AI metadata error
 */
export function createAIMetadataError(
  code: keyof typeof ERROR_CODES,
  message?: string,
  details?: Record<string, unknown>
): AIMetadataError {
  return {
    code: ERROR_CODES[code],
    message: message || ERROR_MESSAGES[ERROR_CODES[code]],
    details
  };
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  return VALIDATION_RULES.URL_PATTERN.test(url);
}

/**
 * Check if content type is valid
 */
export function isValidContentType(type: string): boolean {
  return VALIDATION_RULES.VALID_CONTENT_TYPES.includes(type as any);
}

/**
 * Generate cache control header
 */
export function generateCacheControl(maxAge: number, isPublic: boolean = true): string {
  const visibility = isPublic ? 'public' : 'private';
  return `${visibility}, max-age=${maxAge}`;
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Generate structured data ID
 */
export function generateStructuredDataId(url: string): string {
  return makeAbsoluteUrl(url, { url: '', title: '', description: '', author: { name: '', email: '' } });
}

/**
 * Merge AI metadata configurations
 */
export function mergeAIMetadataConfig<T extends Record<string, any>>(
  defaultConfig: T,
  userConfig: Partial<T>
): T {
  return {
    ...defaultConfig,
    ...userConfig,
    // Deep merge nested objects
    author: {
      ...defaultConfig.author,
      ...userConfig.author
    },
    actionTypes: {
      ...defaultConfig.actionTypes,
      ...userConfig.actionTypes
    },
    contentTypes: {
      ...defaultConfig.contentTypes,
      ...userConfig.contentTypes
    }
  } as T;
}
