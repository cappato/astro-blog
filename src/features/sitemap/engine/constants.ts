/**
 * Sitemap Feature - Constants and Configuration
 * Framework-agnostic constants for XML sitemap generation
 */

/**
 * Sitemap protocol configuration
 */
export const SITEMAP_CONFIG = {
  /** XML namespace for sitemaps */
  NAMESPACE: 'http://www.sitemaps.org/schemas/sitemap/0.9',
  /** Sitemap protocol specification URL */
  SPEC_URL: 'https://www.sitemaps.org/protocol.html',
  /** Maximum URLs per sitemap (recommended limit) */
  MAX_URLS: 50000,
  /** Maximum file size in bytes (50MB) */
  MAX_FILE_SIZE: 52428800,
  /** Default blog path */
  DEFAULT_BLOG_PATH: '/blog'
} as const;

/**
 * XML generation configuration
 */
export const XML_CONFIG = {
  /** XML declaration */
  DECLARATION: '<?xml version="1.0" encoding="UTF-8"?>',
  /** Urlset opening tag */
  URLSET_OPEN: '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  /** Urlset closing tag */
  URLSET_CLOSE: '</urlset>',
  /** URL opening tag */
  URL_OPEN: '<url>',
  /** URL closing tag */
  URL_CLOSE: '</url>',
  /** Indentation settings */
  INDENT: {
    BASE: '  ',
    URL: '  ',
    FIELD: '    '
  }
} as const;

/**
 * Default change frequency values
 */
export const CHANGEFREQ = {
  ALWAYS: 'always',
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  NEVER: 'never'
} as const;

/**
 * Default priority values
 */
export const PRIORITY = {
  HIGHEST: '1.0',
  HIGH: '0.9',
  MEDIUM_HIGH: '0.8',
  MEDIUM: '0.7',
  MEDIUM_LOW: '0.6',
  LOW: '0.5',
  LOWEST: '0.1'
} as const;

/**
 * Default sitemap configuration
 */
export const DEFAULT_SITEMAP_CONFIG = {
  site: {
    url: '',
    title: 'Website',
    description: 'Website description',
    language: 'en-US'
  },
  sitemap: {
    namespace: SITEMAP_CONFIG.NAMESPACE,
    blogPath: SITEMAP_CONFIG.DEFAULT_BLOG_PATH,
    maxUrls: SITEMAP_CONFIG.MAX_URLS
  },
  urls: {
    changefreq: {
      home: CHANGEFREQ.WEEKLY,
      blogIndex: CHANGEFREQ.DAILY,
      blogPost: CHANGEFREQ.MONTHLY
    },
    priority: {
      home: PRIORITY.HIGHEST,
      blogIndex: PRIORITY.HIGH,
      blogPost: PRIORITY.MEDIUM_HIGH
    }
  },
  staticPages: [
    {
      path: '',
      changefreq: CHANGEFREQ.WEEKLY,
      priority: PRIORITY.HIGHEST
    },
    {
      path: '/blog',
      changefreq: CHANGEFREQ.DAILY,
      priority: PRIORITY.HIGH
    }
  ]
} as const;

/**
 * Error messages for sitemap generation
 */
export const SITEMAP_ERRORS = {
  // Configuration errors
  INVALID_SITE_CONFIG: 'Site configuration is invalid for sitemap generation',
  INVALID_SITE_URL: 'Site URL is not a valid URL',
  MISSING_SITE_URL: 'Site URL is required for sitemap generation',
  
  // Post validation errors
  MISSING_TITLE: 'Post is missing required title',
  MISSING_DATE: 'Post is missing required date',
  MISSING_SLUG: 'Post is missing required slug',
  INVALID_DATE: 'Post has invalid date',
  INVALID_SLUG: 'Post has invalid slug',
  
  // Generation errors
  GENERATION_FAILED: 'Sitemap generation failed',
  XML_GENERATION_FAILED: 'XML generation failed',
  URL_GENERATION_FAILED: 'URL generation failed',
  VALIDATION_FAILED: 'Sitemap validation failed',
  
  // URL errors
  INVALID_URL_FORMAT: 'Invalid URL format',
  URL_TOO_LONG: 'URL exceeds maximum length',
  DUPLICATE_URL: 'Duplicate URL detected',
  
  // File size errors
  SITEMAP_TOO_LARGE: 'Sitemap exceeds maximum file size',
  TOO_MANY_URLS: 'Too many URLs for single sitemap'
} as const;

/**
 * Validation patterns
 */
export const VALIDATION_PATTERNS = {
  /** URL validation pattern */
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
  /** Date validation pattern (YYYY-MM-DD) */
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  /** Priority validation pattern (0.0 to 1.0) */
  PRIORITY: /^(0(\.\d)?|1(\.0)?)$/,
  /** Slug validation pattern */
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
} as const;

/**
 * Content type mappings
 */
export const CONTENT_TYPES = {
  XML: 'application/xml',
  XML_UTF8: 'application/xml; charset=utf-8',
  TEXT_XML: 'text/xml',
  TEXT_XML_UTF8: 'text/xml; charset=utf-8'
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

/**
 * Cache control settings
 */
export const CACHE_CONTROL = {
  /** Cache for 1 hour */
  SHORT: 'public, max-age=3600',
  /** Cache for 1 day */
  MEDIUM: 'public, max-age=86400',
  /** Cache for 1 week */
  LONG: 'public, max-age=604800',
  /** No cache */
  NO_CACHE: 'no-cache, no-store, must-revalidate'
} as const;

/**
 * Feature metadata
 */
export const FEATURE_METADATA = {
  NAME: 'sitemap',
  VERSION: '1.0.0',
  DESCRIPTION: 'Framework-agnostic XML sitemap generation with comprehensive validation',
  STANDARDS: {
    SITEMAP: '0.9',
    XML: '1.0'
  },
  COMPATIBILITY: {
    FRAMEWORK: 'agnostic',
    RUNTIME: ['node', 'browser', 'edge'],
    TYPESCRIPT: true
  }
} as const;
