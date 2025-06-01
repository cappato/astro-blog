/**
 * Sitemap Feature - Type Definitions
 * Framework-agnostic TypeScript types for XML sitemap generation
 */

/**
 * Blog post interface for sitemap generation
 * Framework-agnostic representation of blog content
 */
export interface BlogPost {
  /** Post slug/identifier */
  slug: string;
  /** Post metadata */
  data: {
    /** Post title */
    title: string;
    /** Publication date */
    date: Date;
    /** Draft status */
    draft?: boolean;
    /** Custom slug override */
    slug?: string;
    /** Post description */
    description?: string;
    /** Post tags */
    tags?: string[];
    /** Featured status */
    featured?: boolean;
  };
  /** Post content body */
  body?: string;
}

/**
 * Sitemap configuration interface
 */
export interface SitemapConfig {
  /** Site configuration */
  site: {
    /** Site base URL (required) */
    url: string;
    /** Site title */
    title?: string;
    /** Site description */
    description?: string;
    /** Site language */
    language?: string;
  };
  /** Sitemap generation settings */
  sitemap: {
    /** XML namespace */
    namespace?: string;
    /** Blog path prefix */
    blogPath?: string;
    /** Maximum URLs per sitemap */
    maxUrls?: number;
  };
  /** URL priority and frequency settings */
  urls: {
    /** Change frequency settings */
    changefreq: {
      home: string;
      blogIndex: string;
      blogPost: string;
    };
    /** Priority settings */
    priority: {
      home: string;
      blogIndex: string;
      blogPost: string;
    };
  };
  /** Static pages configuration */
  staticPages: StaticPage[];
}

/**
 * Static page configuration
 */
export interface StaticPage {
  /** Page path relative to site root */
  path: string;
  /** Change frequency */
  changefreq: string;
  /** Priority value */
  priority: string;
  /** Last modification date override */
  lastmod?: string;
}

/**
 * Sitemap URL entry
 */
export interface SitemapUrl {
  /** Full URL */
  loc: string;
  /** Last modification date (YYYY-MM-DD) */
  lastmod: string;
  /** Change frequency */
  changefreq: string;
  /** Priority value */
  priority: string;
}

/**
 * Sitemap generation result
 */
export interface SitemapGenerationResult {
  /** Generation success status */
  success: boolean;
  /** Generated XML content (if successful) */
  xml?: string;
  /** Number of URLs included */
  urlCount?: number;
  /** Number of URLs skipped due to errors */
  skippedCount?: number;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Sitemap generation options
 */
export interface SitemapGenerationOptions {
  /** Custom post filter function */
  postFilter?: (post: BlogPost) => boolean;
  /** Maximum number of URLs to include */
  maxUrls?: number;
  /** Include full content URLs */
  includeFullContent?: boolean;
  /** Custom static pages to add */
  additionalPages?: StaticPage[];
  /** Override last modification date */
  lastModOverride?: string;
}

/**
 * Post validation result
 */
export interface PostValidationResult {
  /** Validation success status */
  valid: boolean;
  /** Error message (if validation failed) */
  error?: string;
}

/**
 * Sitemap configuration validation result
 */
export interface SitemapConfigValidationResult {
  /** Validation success status */
  valid: boolean;
  /** Error message (if validation failed) */
  error?: string;
}

/**
 * URL generation context
 */
export interface UrlGenerationContext {
  /** Base site URL */
  siteUrl: string;
  /** Blog path prefix */
  blogPath: string;
  /** Current date for lastmod */
  currentDate: string;
}

/**
 * Sitemap statistics
 */
export interface SitemapStats {
  /** Total URLs generated */
  totalUrls: number;
  /** Static page URLs */
  staticUrls: number;
  /** Blog post URLs */
  blogUrls: number;
  /** Skipped URLs due to errors */
  skippedUrls: number;
  /** Generation timestamp */
  generatedAt: string;
}

/**
 * XML generation context
 */
export interface XmlGenerationContext {
  /** XML namespace */
  namespace: string;
  /** XML declaration */
  declaration: string;
  /** Indentation settings */
  indent: {
    /** Base indentation */
    base: string;
    /** URL entry indentation */
    url: string;
    /** URL field indentation */
    field: string;
  };
}
