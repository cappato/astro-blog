/**
 * Schema.org utility functions
 * Internal utilities for the schema feature
 */

import type { BaseSchema } from './types.ts';
import { SCHEMA_CONFIG } from './config.ts';

/**
 * Ensure URL is absolute
 */
export function ensureAbsoluteUrl(url: string, baseUrl?: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const base = baseUrl || SCHEMA_CONFIG.site.url;
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Validate required schema fields
 */
export function validateSchemaFields(schema: BaseSchema, requiredFields: string[]): boolean {
  const missing = requiredFields.filter(field => {
    const value = (schema as any)[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    console.warn(`Schema validation warning: Missing required fields: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}

/**
 * Sanitize and validate URL
 */
export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.href;
  } catch {
    // If invalid URL, try to make it absolute
    return ensureAbsoluteUrl(url);
  }
}

/**
 * Format date to ISO string
 */
export function formatDateToISO(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Calculate word count from text content
 */
export function calculateWordCount(content: string): number {
  return content
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0).length;
}

/**
 * Extract keywords from tags array
 */
export function formatKeywords(tags?: string[]): string {
  if (!tags || tags.length === 0) return '';
  return tags.join(', ');
}

/**
 * Generate search action for WebSite schema
 */
export function generateSearchAction(baseUrl: string) {
  return {
    '@type': 'SearchAction' as const,
    target: `${ensureAbsoluteUrl(baseUrl)}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  };
}

/**
 * Generate main entity of page for articles
 */
export function generateMainEntityOfPage(url: string) {
  return {
    '@type': 'WebPage' as const,
    '@id': ensureAbsoluteUrl(url)
  };
}

/**
 * Clean and validate schema object
 */
export function cleanSchema(schema: any): any {
  // Remove undefined/null values
  const cleaned = Object.entries(schema).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
  
  return cleaned;
}

/**
 * Merge multiple schemas into array
 */
export function mergeSchemas(...schemas: (BaseSchema | BaseSchema[])[]): BaseSchema[] {
  const result: BaseSchema[] = [];
  
  for (const schema of schemas) {
    if (Array.isArray(schema)) {
      result.push(...schema);
    } else {
      result.push(schema);
    }
  }
  
  return result;
}

/**
 * Validate schema type against known types
 */
export function isValidSchemaType(type: string): boolean {
  const validTypes = [
    'WebSite', 'Blog', 'BlogPosting', 'CreativeWork', 
    'SoftwareApplication', 'Course', 'Event', 'Product',
    'Organization', 'Person', 'Article'
  ];
  
  return validTypes.includes(type);
}

/**
 * Generate social media same-as array
 */
export function generateSameAsArray(social: {
  github?: string;
  linkedin?: string;
  twitter?: string;
}): string[] {
  const sameAs: string[] = [];
  
  if (social.github) {
    sameAs.push(`https://github.com/${social.github}`);
  }
  
  if (social.linkedin) {
    sameAs.push(`https://linkedin.com/in/${social.linkedin}`);
  }
  
  if (social.twitter) {
    const handle = social.twitter.replace('@', '');
    sameAs.push(`https://twitter.com/${handle}`);
  }
  
  return sameAs;
}

/**
 * Validate and format image URL
 */
export function validateImageUrl(imageUrl?: string, fallback?: string): string {
  if (!imageUrl) {
    return ensureAbsoluteUrl(fallback || SCHEMA_CONFIG.defaults.image);
  }
  
  // If it's already absolute, return as-is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Make relative URLs absolute
  return ensureAbsoluteUrl(imageUrl);
}

/**
 * Generate structured data script tag content
 */
export function generateJsonLdScript(schemas: BaseSchema[]): string {
  const cleanedSchemas = schemas.map(cleanSchema);
  return JSON.stringify(cleanedSchemas, null, 0);
}

/**
 * Debug schema generation
 */
export function debugSchema(schema: BaseSchema, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Schema Debug${context ? ` - ${context}` : ''}]:`, schema);
  }
}
