/**
 * RSS Feed Engine - Type Definitions
 * Framework-agnostic TypeScript types for RSS feed generation
 */

import type { CollectionEntry } from 'astro:content';

/**
 * Blog post type alias for better readability
 */
export type BlogPost = CollectionEntry<'blog'>;

/**
 * RSS feed configuration interface
 */
export interface RSSConfig {
  /** Site information */
  site: {
    url: string;
    title: string;
    description: string;
    author: string;
    language: string;
  };
  
  /** Feed configuration */
  feed: {
    /** RSS version */
    version: string;
    /** Time to live in minutes */
    ttl: number;
    /** RSS feed path */
    path: string;
    /** Maximum number of items in feed */
    maxItems?: number;
  };
  
  /** Content configuration */
  content: {
    /** Maximum excerpt length for safety */
    maxExcerptLength: number;
    /** Minimum excerpt length to avoid too short descriptions */
    minExcerptLength: number;
    /** Default category for blog posts */
    defaultCategory: string;
  };
}

/**
 * RSS item data interface
 */
export interface RSSItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: string;
  author: string;
  category?: string;
}

/**
 * RSS feed data interface
 */
export interface RSSFeedData {
  title: string;
  description: string;
  link: string;
  language: string;
  managingEditor: string;
  webMaster: string;
  lastBuildDate: string;
  pubDate: string;
  ttl: number;
  generator: string;
  items: RSSItem[];
}

/**
 * RSS generation result interface
 */
export interface RSSGenerationResult {
  success: boolean;
  xml?: string;
  error?: string;
  itemCount?: number;
  skippedCount?: number;
}

/**
 * Post validation result interface
 */
export interface PostValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * RSS generation options interface
 */
export interface RSSGenerationOptions {
  /** Filter function for posts */
  postFilter?: (post: BlogPost) => boolean;
  /** Maximum number of items to include */
  maxItems?: number;
  /** Include full content instead of excerpt */
  includeFullContent?: boolean;
  /** Custom category for all items */
  category?: string;
}
