/**
 * RSS Feed Feature - Public API
 * Framework-agnostic RSS 2.0 feed generation feature
 * 
 * This feature provides complete RSS feed generation capabilities that can be used
 * in any JavaScript/TypeScript project. It's completely framework-agnostic and
 * follows RSS 2.0 standards with Atom namespace support.
 * 
 * Features:
 * - RSS 2.0 standard compliance
 * - Framework-agnostic TypeScript engine
 * - Comprehensive validation and error handling
 * - XML escaping and security
 * - Excerpt generation
 * - Post filtering (draft/published)
 * - Configurable feed settings
 * - HTTP endpoint handling
 * - Comprehensive test suite
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  BlogPost,
  RSSConfig,
  RSSItem,
  RSSFeedData,
  RSSGenerationResult,
  RSSGenerationOptions,
  PostValidationResult
} from './engine/types.ts';

export type {
  RSSEndpointResponse,
  RSSEndpointOptions
} from './endpoints/rss-endpoint.ts';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  RSS_CONFIG,
  XML_CONFIG,
  RSS_ERRORS,
  DEFAULT_RSS_CONFIG,
  VALIDATION_PATTERNS
} from './engine/constants.ts';

// ============================================================================
// ENGINE
// ============================================================================

export {
  RSSGenerator,
  generateRSSFeed
} from './engine/rss-generator.ts';

export {
  escapeXML,
  validateRSSConfig,
  validatePostData,
  validateAndFormatDate,
  generateExcerpt,
  getLastBuildDate,
  getAstroVersion,
  shouldIncludePost,
  isValidPost,
  getValidPosts
} from './engine/utils.ts';

// ============================================================================
// ENDPOINTS
// ============================================================================

export {
  RSSEndpointHandler,
  handleRSSRequest,
  createRSSConfig
} from './endpoints/rss-endpoint.ts';

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

import type { BlogPost, RSSConfig, RSSGenerationOptions } from './engine/types.ts';
import type { RSSEndpointOptions } from './endpoints/rss-endpoint.ts';
import { RSSGenerator, generateRSSFeed } from './engine/rss-generator.ts';
import { RSSEndpointHandler, handleRSSRequest, createRSSConfig } from './endpoints/rss-endpoint.ts';
import {
  getValidPosts,
  validateRSSConfig,
  escapeXML,
  validatePostData,
  generateExcerpt
} from './engine/utils.ts';
import { RSS_CONFIG, RSS_ERRORS, XML_CONFIG, VALIDATION_PATTERNS, DEFAULT_RSS_CONFIG } from './engine/constants.ts';

/**
 * Quick RSS feed generation with default settings
 * @param posts Array of blog posts
 * @param siteConfig Site configuration object
 * @param options Generation options
 * @returns RSS XML string or null if failed
 */
export function quickGenerateRSS(
  posts: BlogPost[],
  siteConfig: any,
  options: RSSGenerationOptions = {}
): string | null {
  try {
    const rssConfig = createRSSConfig(siteConfig);
    const result = generateRSSFeed(posts, rssConfig, options);
    return result.success ? result.xml! : null;
  } catch (error) {
    console.error('Quick RSS generation failed:', error);
    return null;
  }
}

/**
 * Quick RSS endpoint handling with default settings
 * @param posts Array of blog posts
 * @param siteConfig Site configuration object
 * @param options Endpoint options
 * @returns HTTP response object
 */
export function quickHandleRSSRequest(
  posts: BlogPost[],
  siteConfig: any,
  options: RSSEndpointOptions = {}
) {
  try {
    const rssConfig = createRSSConfig(siteConfig);
    return handleRSSRequest(posts, rssConfig, options);
  } catch (error) {
    console.error('Quick RSS request handling failed:', error);
    return {
      body: '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title><description>RSS generation failed</description></channel></rss>',
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
      status: 500
    };
  }
}

/**
 * Setup RSS feed with configuration validation
 * @param siteConfig Site configuration object
 * @returns RSS configuration object
 */
export function setupRSSFeed(siteConfig: any): RSSConfig {
  const rssConfig = createRSSConfig(siteConfig);

  // Validate configuration
  const validation = validateRSSConfig(rssConfig);

  if (!validation.valid) {
    throw new Error(`RSS setup failed: ${validation.error}`);
  }

  return rssConfig;
}

/**
 * Filter posts for RSS feed (published only in production)
 * @param posts Array of blog posts
 * @returns Filtered and sorted posts
 */
export function preparePostsForRSS(posts: BlogPost[]): BlogPost[] {
  const validPosts = getValidPosts(posts);
  
  // Sort by date (newest first)
  return validPosts.sort((a, b) => 
    new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );
}

// ============================================================================
// FEATURE INFO
// ============================================================================

export const FEATURE_INFO = {
  name: 'rss-feed',
  version: '1.0.0',
  description: 'Framework-agnostic RSS 2.0 feed generation with comprehensive validation and error handling',
  
  // Main exports for easy access
  engine: {
    RSSGenerator: './engine/rss-generator.ts',
    utils: './engine/utils.ts',
    types: './engine/types.ts',
    constants: './engine/constants.ts'
  },
  
  endpoints: {
    RSSEndpointHandler: './endpoints/rss-endpoint.ts'
  },
  
  // Quick start functions
  quickStart: {
    generateRSS: quickGenerateRSS,
    handleRequest: quickHandleRSSRequest,
    setupFeed: setupRSSFeed,
    preparePosts: preparePostsForRSS
  },
  
  // Standards compliance
  standards: {
    rss: '2.0',
    atom: '1.0',
    xml: '1.0'
  },
  
  // Framework compatibility
  compatibility: {
    framework: 'agnostic',
    runtime: ['node', 'browser', 'edge'],
    typescript: true,
    testing: 'vitest'
  }
} as const;

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Main classes
  RSSGenerator,
  RSSEndpointHandler,
  
  // Utility functions
  generateRSSFeed,
  handleRSSRequest,
  createRSSConfig,
  escapeXML,
  validateRSSConfig,
  validatePostData,
  generateExcerpt,
  getValidPosts,
  
  // Quick start functions
  quickGenerateRSS,
  quickHandleRSSRequest,
  setupRSSFeed,
  preparePostsForRSS,
  
  // Configuration
  FEATURE_INFO,
  RSS_CONFIG,
  DEFAULT_RSS_CONFIG,
  
  // Constants
  RSS_ERRORS,
  XML_CONFIG,
  VALIDATION_PATTERNS
};
