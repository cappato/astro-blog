/**
 * RSS Feed generation utilities
 * Separated from endpoint for easier testing and maintainability
 */

import type { CollectionEntry } from 'astro:content';
import { CONFIG } from '../config/index.ts';
import { shouldIncludePost } from './shared/post-filters.ts';

/**
 * RSS Feed configuration constants
 */
const RSS_CONFIG = {
  /** RSS version */
  VERSION: '2.0',
  /** Time to live in minutes */
  TTL: 60,
  /** Default category for blog posts */
  DEFAULT_CATEGORY: 'Blog',
  /** RSS specification URL */
  SPEC_URL: 'https://www.rssboard.org/rss-specification',
  /** Atom namespace */
  ATOM_NAMESPACE: 'http://www.w3.org/2005/Atom',
  /** RSS feed path */
  FEED_PATH: '/rss.xml',
  /** Maximum excerpt length for safety */
  MAX_EXCERPT_LENGTH: 500,
  /** Minimum excerpt length to avoid too short descriptions */
  MIN_EXCERPT_LENGTH: 50
} as const;

/**
 * Get Astro version for generator field
 */
function getAstroVersion(): string {
  // Try to get version from import.meta.env or fallback
  return `Astro v${import.meta.env.ASTRO_VERSION || '5.8.0'}`;
}

/**
 * Generates RSS feed XML content with validation and error handling
 * @param posts Array of blog posts sorted by date (newest first)
 * @returns Valid RSS 2.0 XML string
 * @throws Error if site configuration is invalid
 */
export function generateRSSFeed(posts: CollectionEntry<'blog'>[]): string {
  const { site, blog } = CONFIG;

  // Validate site configuration
  validateSiteConfig(site);

  const buildDate = new Date().toUTCString();
  const lastBuildDate = getLastBuildDate(posts, buildDate);

  // Generate RSS items with validation
  const rssItems = posts
    .map(post => {
      try {
        return generateRSSItem(post);
      } catch (error) {
        console.warn(`Skipping invalid post ${post.slug}:`, error);
        return null;
      }
    })
    .filter(Boolean)
    .join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="${RSS_CONFIG.VERSION}" xmlns:atom="${RSS_CONFIG.ATOM_NAMESPACE}">
  <channel>
    <title>${escapeXML(site.title)}</title>
    <description>${escapeXML(site.description)}</description>
    <link>${site.url}</link>
    <atom:link href="${site.url}${RSS_CONFIG.FEED_PATH}" rel="self" type="application/rss+xml"/>
    <language>${site.language}</language>
    <managingEditor>${escapeXML(site.author)}</managingEditor>
    <webMaster>${escapeXML(site.author)}</webMaster>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <ttl>${RSS_CONFIG.TTL}</ttl>
    <generator>${getAstroVersion()}</generator>
    <docs>${RSS_CONFIG.SPEC_URL}</docs>

    ${rssItems}
  </channel>
</rss>`;
}

/**
 * Validates site configuration for RSS generation
 * @param site Site configuration object
 * @throws Error if configuration is invalid
 */
function validateSiteConfig(site: any): void {
  if (!site.title || typeof site.title !== 'string') {
    throw new Error('Site title is required and must be a string');
  }
  if (!site.description || typeof site.description !== 'string') {
    throw new Error('Site description is required and must be a string');
  }
  if (!site.url || typeof site.url !== 'string') {
    throw new Error('Site URL is required and must be a string');
  }
  // Validate URL format
  try {
    new URL(site.url);
  } catch {
    throw new Error(`Site URL is not a valid URL: ${site.url}`);
  }
  if (!site.author || typeof site.author !== 'string') {
    throw new Error('Site author is required and must be a string');
  }
  if (!site.language || typeof site.language !== 'string') {
    throw new Error('Site language is required and must be a string');
  }
}

/**
 * Gets the last build date from posts or fallback to current date
 * @param posts Array of blog posts
 * @param fallbackDate Fallback date string
 * @returns UTC string of the most recent post date or fallback
 */
function getLastBuildDate(posts: CollectionEntry<'blog'>[], fallbackDate: string): string {
  if (posts.length === 0) return fallbackDate;

  const mostRecentPost = posts[0];
  const date = new Date(mostRecentPost.data.date);

  if (isNaN(date.getTime())) {
    console.warn(`Invalid date for post ${mostRecentPost.slug}, using fallback`);
    return fallbackDate;
  }

  return date.toUTCString();
}

/**
 * Generates an individual RSS item with validation
 * @param post Blog post entry
 * @returns RSS item XML string
 * @throws Error if post data is invalid
 */
function generateRSSItem(post: CollectionEntry<'blog'>): string {
  const { site } = CONFIG;

  // Validate required post fields
  validatePostData(post);

  const postUrl = `${site.url}/blog/${post.data.slug || post.slug}`;
  const pubDate = validateAndFormatDate(post.data.date, post.slug);

  // Generate description with fallback and validation
  const description = post.data.description || generateExcerpt(post.body);
  if (!description.trim()) {
    throw new Error(`Post ${post.slug} has no description and empty content`);
  }

  // Get author with fallback
  const author = post.data.author || site.author;

  // Get category with fallback
  const category = post.data.category || RSS_CONFIG.DEFAULT_CATEGORY;

  return `<item>
      <title>${escapeXML(post.data.title)}</title>
      <description>${escapeXML(description)}</description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXML(author)}</author>
      <category>${escapeXML(category)}</category>
    </item>`;
}

/**
 * Validates post data for RSS generation
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
 * Validates and formats a date for RSS
 * @param date Date value from post
 * @param postSlug Post slug for error reporting
 * @returns Formatted UTC date string
 * @throws Error if date is invalid
 */
function validateAndFormatDate(date: any, postSlug: string): string {
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Post ${postSlug} has invalid date: ${date}`);
  }

  return parsedDate.toUTCString();
}

/**
 * Generates excerpt from post content with improved markdown parsing
 * @param content Markdown content of the post
 * @returns Clean excerpt with maximum configured length
 */
function generateExcerpt(content: string): string {
  const { blog } = CONFIG;
  const excerptLength = blog.excerptLength || 160;

  // Comprehensive markdown cleaning with better regex patterns
  const plainText = content
    // Remove frontmatter if present
    .replace(/^---[\s\S]*?---\n?/m, '')
    // Remove headers (all levels)
    .replace(/^#{1,6}\s+.*$/gm, '')
    // Remove code blocks (fenced and indented)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^    .+$/gm, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove bold and italic (preserve content)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove links (preserve text)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove lists (preserve content)
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove blockquotes
    .replace(/^\s*>\s*/gm, '')
    // Remove tables
    .replace(/\|.*\|/g, '')
    .replace(/^\s*[-:]+\s*$/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Clean up whitespace
    .replace(/\n\s*\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Validate excerpt length
  if (plainText.length < RSS_CONFIG.MIN_EXCERPT_LENGTH) {
    console.warn(`Generated excerpt is too short (${plainText.length} chars): "${plainText.slice(0, 50)}..."`);
  }

  if (plainText.length <= excerptLength) {
    return plainText;
  }

  // Truncate at word boundary for better readability
  const truncated = plainText.slice(0, excerptLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > RSS_CONFIG.MIN_EXCERPT_LENGTH
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...';
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
