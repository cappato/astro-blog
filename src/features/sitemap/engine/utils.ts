/**
 * Sitemap Feature - Utility Functions
 * Framework-agnostic utilities for XML sitemap generation
 */

import type { 
  BlogPost, 
  SitemapConfig, 
  PostValidationResult, 
  SitemapConfigValidationResult,
  StaticPage,
  SitemapUrl
} from './types.ts';
import { SITEMAP_ERRORS, VALIDATION_PATTERNS, SITEMAP_CONFIG } from './constants.ts';

/**
 * Escapes XML special characters in text content
 * @param text Text to escape
 * @returns XML-safe text
 */
export function escapeXML(text: string | undefined): string {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')     // Must be first
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Validates sitemap configuration
 * @param config Sitemap configuration to validate
 * @returns Validation result
 */
export function validateSitemapConfig(config: any): SitemapConfigValidationResult {
  if (!config || typeof config !== 'object') {
    return { valid: false, error: SITEMAP_ERRORS.INVALID_SITE_CONFIG };
  }

  if (!config.site || typeof config.site !== 'object') {
    return { valid: false, error: SITEMAP_ERRORS.INVALID_SITE_CONFIG };
  }

  if (!config.site.url || typeof config.site.url !== 'string') {
    return { valid: false, error: SITEMAP_ERRORS.MISSING_SITE_URL };
  }

  // Validate URL format
  if (!VALIDATION_PATTERNS.URL.test(config.site.url)) {
    return { valid: false, error: `${SITEMAP_ERRORS.INVALID_SITE_URL}: ${config.site.url}` };
  }

  // Validate URL is accessible
  try {
    new URL(config.site.url);
  } catch {
    return { valid: false, error: `${SITEMAP_ERRORS.INVALID_SITE_URL}: ${config.site.url}` };
  }

  return { valid: true };
}

/**
 * Validates blog post data for sitemap generation
 * @param post Blog post to validate
 * @returns Validation result
 */
export function validatePostData(post: BlogPost): PostValidationResult {
  if (!post || typeof post !== 'object') {
    return { valid: false, error: 'Post data is invalid' };
  }

  if (!post.slug || typeof post.slug !== 'string') {
    return { valid: false, error: `${SITEMAP_ERRORS.MISSING_SLUG}: ${post.slug}` };
  }

  if (!post.data || typeof post.data !== 'object') {
    return { valid: false, error: `Post ${post.slug} is missing data object` };
  }

  if (!post.data.title || typeof post.data.title !== 'string') {
    return { valid: false, error: `${SITEMAP_ERRORS.MISSING_TITLE}: ${post.slug}` };
  }

  if (!post.data.date) {
    return { valid: false, error: `${SITEMAP_ERRORS.MISSING_DATE}: ${post.slug}` };
  }

  return { valid: true };
}

/**
 * Validates and formats a date for sitemap
 * @param date Date value from post
 * @param postSlug Post slug for error reporting
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function validateAndFormatDate(date: any, postSlug: string): string {
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    throw new Error(`${SITEMAP_ERRORS.INVALID_DATE}: ${postSlug} - ${date}`);
  }

  return parsedDate.toISOString().split('T')[0];
}

/**
 * Generates current date in YYYY-MM-DD format
 * @returns Current date string
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Validates URL format and length
 * @param url URL to validate
 * @returns true if URL is valid
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Check length (URLs should be under 2048 characters)
  if (url.length > 2048) return false;
  
  // Check format
  return VALIDATION_PATTERNS.URL.test(url);
}

/**
 * Validates priority value
 * @param priority Priority value to validate
 * @returns true if priority is valid
 */
export function isValidPriority(priority: string): boolean {
  return VALIDATION_PATTERNS.PRIORITY.test(priority);
}

/**
 * Validates change frequency value
 * @param changefreq Change frequency to validate
 * @returns true if change frequency is valid
 */
export function isValidChangefreq(changefreq: string): boolean {
  const validValues = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
  return validValues.includes(changefreq);
}

/**
 * Filters posts based on environment (production vs development)
 * @param post Blog post to evaluate
 * @returns true if post should be included in sitemap
 */
export function shouldIncludePost(post: BlogPost): boolean {
  // In production, exclude drafts. In development, include all posts
  return import.meta.env.PROD ? !post.data.draft : true;
}

/**
 * Validates if a post should be included in sitemap
 * @param post Blog post to validate
 * @returns true if post is valid and should be included
 */
export function isValidPost(post: BlogPost): boolean {
  const validation = validatePostData(post);
  return validation.valid;
}

/**
 * Filters and validates posts for sitemap generation
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

/**
 * Generates a blog post URL
 * @param post Blog post
 * @param siteUrl Base site URL
 * @param blogPath Blog path prefix
 * @returns Full blog post URL
 */
export function generateBlogPostUrl(post: BlogPost, siteUrl: string, blogPath: string): string {
  const slug = post.data.slug || post.slug;
  return `${siteUrl}${blogPath}/${slug}`;
}

/**
 * Generates a static page URL
 * @param page Static page configuration
 * @param siteUrl Base site URL
 * @returns Full static page URL
 */
export function generateStaticPageUrl(page: StaticPage, siteUrl: string): string {
  return `${siteUrl}${page.path}`;
}

/**
 * Creates a sitemap URL entry
 * @param loc URL location
 * @param lastmod Last modification date
 * @param changefreq Change frequency
 * @param priority Priority value
 * @returns Sitemap URL entry
 */
export function createSitemapUrl(
  loc: string, 
  lastmod: string, 
  changefreq: string, 
  priority: string
): SitemapUrl {
  return {
    loc: escapeXML(loc),
    lastmod,
    changefreq,
    priority
  };
}

/**
 * Validates a complete sitemap URL entry
 * @param url Sitemap URL entry to validate
 * @returns true if URL entry is valid
 */
export function isValidSitemapUrl(url: SitemapUrl): boolean {
  return (
    isValidUrl(url.loc) &&
    VALIDATION_PATTERNS.DATE.test(url.lastmod) &&
    isValidChangefreq(url.changefreq) &&
    isValidPriority(url.priority)
  );
}

/**
 * Sorts posts by date (newest first)
 * @param posts Array of blog posts
 * @returns Sorted posts array
 */
export function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => 
    new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );
}

/**
 * Calculates sitemap file size estimate
 * @param urlCount Number of URLs
 * @returns Estimated file size in bytes
 */
export function estimateSitemapSize(urlCount: number): number {
  // Rough estimate: ~200 bytes per URL entry
  const baseSize = 200; // XML declaration and urlset tags
  const urlSize = 200; // Average size per URL entry
  return baseSize + (urlCount * urlSize);
}

/**
 * Checks if sitemap would exceed size limits
 * @param urlCount Number of URLs
 * @returns true if sitemap would be too large
 */
export function wouldExceedLimits(urlCount: number): boolean {
  return urlCount > SITEMAP_CONFIG.MAX_URLS || 
         estimateSitemapSize(urlCount) > SITEMAP_CONFIG.MAX_FILE_SIZE;
}
