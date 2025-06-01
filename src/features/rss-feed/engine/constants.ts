/**
 * RSS Feed Engine - Constants
 * Framework-agnostic constants for RSS feed generation
 */

/**
 * RSS Feed configuration constants
 */
export const RSS_CONFIG = {
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
  MIN_EXCERPT_LENGTH: 50,
  /** Maximum items in feed */
  MAX_ITEMS: 50,
  /** Default language */
  DEFAULT_LANGUAGE: 'en-US'
} as const;

/**
 * XML constants for RSS generation
 */
export const XML_CONFIG = {
  /** XML declaration */
  DECLARATION: '<?xml version="1.0" encoding="UTF-8"?>',
  /** RSS opening tag */
  RSS_OPEN: `<rss version="${RSS_CONFIG.VERSION}" xmlns:atom="${RSS_CONFIG.ATOM_NAMESPACE}">`,
  /** RSS closing tag */
  RSS_CLOSE: '</rss>',
  /** Channel opening tag */
  CHANNEL_OPEN: '<channel>',
  /** Channel closing tag */
  CHANNEL_CLOSE: '</channel>',
  /** Item opening tag */
  ITEM_OPEN: '<item>',
  /** Item closing tag */
  ITEM_CLOSE: '</item>'
} as const;

/**
 * Error messages for RSS generation
 */
export const RSS_ERRORS = {
  INVALID_SITE_CONFIG: 'Site configuration is invalid for RSS generation',
  INVALID_SITE_URL: 'Site URL is required and must be a valid URL',
  INVALID_POST_DATA: 'Post data is invalid',
  MISSING_TITLE: 'Post is missing required title',
  MISSING_DATE: 'Post is missing required date',
  INVALID_DATE: 'Post has invalid date',
  MISSING_SLUG: 'Post has invalid slug',
  EMPTY_DESCRIPTION: 'Post has no description and empty content',
  GENERATION_FAILED: 'RSS feed generation failed'
} as const;

/**
 * Default RSS configuration
 */
export const DEFAULT_RSS_CONFIG = {
  site: {
    url: '',
    title: 'RSS Feed',
    description: 'RSS feed description',
    author: 'RSS Author',
    language: RSS_CONFIG.DEFAULT_LANGUAGE
  },
  feed: {
    version: RSS_CONFIG.VERSION,
    ttl: RSS_CONFIG.TTL,
    path: RSS_CONFIG.FEED_PATH,
    maxItems: RSS_CONFIG.MAX_ITEMS
  },
  content: {
    maxExcerptLength: RSS_CONFIG.MAX_EXCERPT_LENGTH,
    minExcerptLength: RSS_CONFIG.MIN_EXCERPT_LENGTH,
    defaultCategory: RSS_CONFIG.DEFAULT_CATEGORY
  }
} as const;

/**
 * Validation patterns
 */
export const VALIDATION_PATTERNS = {
  /** URL validation pattern */
  URL: /^https?:\/\/.+/,
  /** Email validation pattern */
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** XML-unsafe characters pattern */
  XML_UNSAFE: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g
} as const;
