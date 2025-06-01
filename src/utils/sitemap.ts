/**
 * Sitemap XML generation utilities
 * Separated from endpoint for easier testing and maintainability
 */

import type { CollectionEntry } from 'astro:content';
import { CONFIG } from '../config/index.ts';
import { shouldIncludePost } from './shared/post-filters.ts';

/**
 * Sitemap configuration constants
 */
const SITEMAP_CONFIG = {
  /** XML namespace for sitemaps */
  NAMESPACE: 'http://www.sitemaps.org/schemas/sitemap/0.9',
  /** Change frequency options */
  CHANGEFREQ: {
    HOME: 'weekly',
    BLOG_INDEX: 'daily',
    BLOG_POST: 'monthly'
  },
  /** Priority values */
  PRIORITY: {
    HOME: '1.0',
    BLOG_INDEX: '0.9',
    BLOG_POST: '0.8'
  },
  /** Blog path configuration */
  BLOG_PATH: '/blog',
  /** Static pages configuration */
  STATIC_PAGES: [
    { path: '', changefreq: 'weekly', priority: '1.0' },
    { path: '/blog', changefreq: 'daily', priority: '0.9' }
  ]
} as const;

/**
 * Generates sitemap XML content with validation and error handling
 * @param posts Array of blog posts
 * @returns Valid sitemap XML string
 * @throws Error if site configuration is invalid
 */
export function generateSitemap(posts: CollectionEntry<'blog'>[]): string {
  const { site } = CONFIG;

  // Validate site configuration
  validateSiteConfig(site);

  // Generate static pages
  const staticPages = generateStaticPages(site.url);

  // Generate blog post URLs with validation
  const blogUrls = posts
    .map(post => {
      try {
        return generateBlogUrl(post, site.url);
      } catch (error) {
        console.warn(`Skipping invalid post ${post.slug}:`, error);
        return null;
      }
    })
    .filter(Boolean)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${SITEMAP_CONFIG.NAMESPACE}">
${staticPages}${blogUrls}</urlset>`;
}

/**
 * Validates site configuration for sitemap generation
 * @param site Site configuration object
 * @throws Error if configuration is invalid
 */
function validateSiteConfig(site: any): void {
  if (!site.url || typeof site.url !== 'string') {
    throw new Error('Site URL is required and must be a string');
  }

  // Validate URL format
  try {
    new URL(site.url);
  } catch {
    throw new Error(`Site URL is not a valid URL: ${site.url}`);
  }
}

/**
 * Generates static pages for sitemap
 * @param siteUrl Base site URL
 * @returns XML string for static pages
 */
function generateStaticPages(siteUrl: string): string {
  const currentDate = new Date().toISOString().split('T')[0];

  return SITEMAP_CONFIG.STATIC_PAGES
    .map(page => {
      const url = escapeXML(`${siteUrl}${page.path}`);
      return `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    })
    .join('');
}

/**
 * Generates a blog post URL entry for sitemap
 * @param post Blog post entry
 * @param siteUrl Base site URL
 * @returns XML string for blog post URL
 * @throws Error if post data is invalid
 */
function generateBlogUrl(post: CollectionEntry<'blog'>, siteUrl: string): string {
  // Validate required post fields
  validatePostData(post);

  const slug = post.data.slug || post.slug;
  const url = escapeXML(`${siteUrl}${SITEMAP_CONFIG.BLOG_PATH}/${slug}`);
  const lastmod = validateAndFormatDate(post.data.date, post.slug);

  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${SITEMAP_CONFIG.CHANGEFREQ.BLOG_POST}</changefreq>
    <priority>${SITEMAP_CONFIG.PRIORITY.BLOG_POST}</priority>
  </url>
`;
}

/**
 * Validates post data for sitemap generation
 * @param post Blog post entry
 * @throws Error if post data is invalid
 */
function validatePostData(post: CollectionEntry<'blog'>): void {
  if (!post.data.title || typeof post.data.title !== 'string') {
    throw new Error(`Post ${post.slug} is missing required title`);
  }
  if (!post.data.date) {
    throw new Error(`Post ${post.slug} is missing required date`);
  }
  if (!post.slug || typeof post.slug !== 'string') {
    throw new Error(`Post has invalid slug: ${post.slug}`);
  }
}

/**
 * Validates and formats a date for sitemap
 * @param date Date value from post
 * @param postSlug Post slug for error reporting
 * @returns Formatted date string (YYYY-MM-DD)
 * @throws Error if date is invalid
 */
function validateAndFormatDate(date: any, postSlug: string): string {
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Post ${postSlug} has invalid date: ${date}`);
  }

  return parsedDate.toISOString().split('T')[0];
}

/**
 * Escapes special characters for XML output
 * @param text Text to escape
 * @returns XML-safe escaped text
 */
function escapeXML(text: string | undefined): string {
  if (!text) return '';

  return text
    // Must escape & first to avoid double-escaping
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    // Handle additional XML-unsafe characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
}

// shouldIncludePost is now imported from shared/post-filters.ts
// This eliminates duplication between RSS and sitemap systems
