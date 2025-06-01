/**
 * RSS Feed Engine - Utilities
 * Framework-agnostic utility functions for RSS feed generation
 */

import type { BlogPost, RSSConfig, PostValidationResult } from './types.ts';
import { RSS_CONFIG, RSS_ERRORS, VALIDATION_PATTERNS } from './constants.ts';

/**
 * Escapes special characters for XML output
 * @param text Text to escape
 * @returns XML-safe escaped text
 */
export function escapeXML(text: string | undefined): string {
  if (!text) return '';

  return text
    // Must escape & first to avoid double-escaping
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    // Handle additional XML-unsafe characters
    .replace(VALIDATION_PATTERNS.XML_UNSAFE, ''); // Remove control characters
}

/**
 * Validates site configuration for RSS generation
 * @param config RSS configuration object
 * @returns Validation result
 */
export function validateRSSConfig(config: Partial<RSSConfig>): PostValidationResult {
  if (!config.site) {
    return { valid: false, error: RSS_ERRORS.INVALID_SITE_CONFIG };
  }

  const { site } = config;

  if (!site.url || typeof site.url !== 'string') {
    return { valid: false, error: RSS_ERRORS.INVALID_SITE_URL };
  }

  // Validate URL format
  try {
    new URL(site.url);
  } catch {
    return { valid: false, error: `${RSS_ERRORS.INVALID_SITE_URL}: ${site.url}` };
  }

  if (!site.title || typeof site.title !== 'string') {
    return { valid: false, error: 'Site title is required' };
  }

  if (!site.description || typeof site.description !== 'string') {
    return { valid: false, error: 'Site description is required' };
  }

  if (!site.author || typeof site.author !== 'string') {
    return { valid: false, error: 'Site author is required' };
  }

  return { valid: true };
}

/**
 * Validates post data for RSS generation
 * @param post Blog post entry
 * @returns Validation result
 */
export function validatePostData(post: BlogPost): PostValidationResult {
  if (!post.data.title || typeof post.data.title !== 'string') {
    return { 
      valid: false, 
      error: `${RSS_ERRORS.MISSING_TITLE}: ${post.slug}` 
    };
  }

  if (!post.data.date) {
    return { 
      valid: false, 
      error: `${RSS_ERRORS.MISSING_DATE}: ${post.slug}` 
    };
  }

  if (!post.slug || typeof post.slug !== 'string') {
    return { 
      valid: false, 
      error: `${RSS_ERRORS.MISSING_SLUG}: ${post.slug}` 
    };
  }

  return { valid: true };
}

/**
 * Validates and formats a date for RSS
 * @param date Date value from post
 * @param postSlug Post slug for error reporting
 * @returns Formatted date string (RFC 2822)
 */
export function validateAndFormatDate(date: any, postSlug: string): string {
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    throw new Error(`${RSS_ERRORS.INVALID_DATE}: ${postSlug} - ${date}`);
  }

  return parsedDate.toUTCString();
}

/**
 * Generates excerpt from content with word limit
 * @param content Full content text
 * @param maxLength Maximum length in characters
 * @param minLength Minimum length in characters
 * @returns Generated excerpt
 */
export function generateExcerpt(
  content: string, 
  maxLength: number = RSS_CONFIG.MAX_EXCERPT_LENGTH,
  minLength: number = RSS_CONFIG.MIN_EXCERPT_LENGTH
): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove HTML tags and normalize whitespace
  const cleanContent = content
    .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // Find the last complete word within the limit
  const truncated = cleanContent.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > minLength) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }

  // If we can't find a good break point, just truncate
  return truncated + '...';
}

/**
 * Gets the last build date from posts or current date
 * @param posts Array of blog posts
 * @param fallbackDate Fallback date string
 * @returns Last build date string
 */
export function getLastBuildDate(posts: BlogPost[], fallbackDate: string): string {
  if (!posts || posts.length === 0) {
    return fallbackDate;
  }

  // Find the most recent post date
  const mostRecentPost = posts.reduce((latest, current) => {
    const currentDate = new Date(current.data.date);
    const latestDate = new Date(latest.data.date);
    return currentDate > latestDate ? current : latest;
  });

  return new Date(mostRecentPost.data.date).toUTCString();
}

/**
 * Gets Astro version for generator field
 * @returns Astro version string or fallback
 */
export function getAstroVersion(): string {
  try {
    // Try to get Astro version from package.json or environment
    return 'Astro RSS Feed Generator';
  } catch {
    return 'RSS Feed Generator';
  }
}

/**
 * Filters posts based on environment (production vs development)
 * @param post Blog post to evaluate
 * @returns true if post should be included in feeds
 */
export function shouldIncludePost(post: BlogPost): boolean {
  // In production, exclude drafts. In development, include all posts
  return import.meta.env.PROD ? !post.data.draft : true;
}

/**
 * Validates basic post data structure
 * @param post Blog post to validate
 * @returns true if post has required fields
 */
export function isValidPost(post: BlogPost): boolean {
  return !!(
    post &&
    post.slug &&
    post.data &&
    post.data.title &&
    post.data.date
  );
}

/**
 * Filters and validates posts for RSS generation
 * @param posts Array of blog posts
 * @param postFilter Optional custom filter function
 * @returns Array of valid, includable posts
 */
export function getValidPosts(
  posts: BlogPost[], 
  postFilter?: (post: BlogPost) => boolean
): BlogPost[] {
  return posts.filter(post => {
    if (!isValidPost(post)) {
      console.warn(`Skipping invalid post: ${post.slug || 'unknown'}`);
      return false;
    }
    
    if (!shouldIncludePost(post)) {
      return false;
    }

    if (postFilter && !postFilter(post)) {
      return false;
    }

    return true;
  });
}
