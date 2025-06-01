/**
 * Sitemap Feature - Public API
 * Framework-agnostic XML sitemap generation feature
 * 
 * This feature provides complete XML sitemap generation capabilities that can be used
 * in any JavaScript/TypeScript project. It's completely framework-agnostic and
 * follows Sitemap 0.9 standards with comprehensive validation.
 * 
 * Features:
 * - Sitemap 0.9 standard compliance
 * - Framework-agnostic TypeScript engine
 * - Comprehensive validation and error handling
 * - XML escaping and security
 * - Static page and blog post URL generation
 * - Configurable sitemap settings
 * - HTTP endpoint handling
 * - Comprehensive test suite
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  BlogPost,
  SitemapConfig,
  SitemapUrl,
  SitemapGenerationResult,
  SitemapGenerationOptions,
  PostValidationResult,
  SitemapConfigValidationResult,
  StaticPage,
  SitemapStats,
  UrlGenerationContext,
  XmlGenerationContext
} from './engine/types.ts';

export type {
  SitemapEndpointResponse,
  SitemapEndpointOptions
} from './endpoints/sitemap-endpoint.ts';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  SITEMAP_CONFIG,
  XML_CONFIG,
  SITEMAP_ERRORS,
  DEFAULT_SITEMAP_CONFIG,
  VALIDATION_PATTERNS,
  CHANGEFREQ,
  PRIORITY,
  CONTENT_TYPES,
  HTTP_STATUS,
  CACHE_CONTROL,
  FEATURE_METADATA
} from './engine/constants.ts';

// ============================================================================
// ENGINE
// ============================================================================

export {
  SitemapGenerator,
  generateSitemap
} from './engine/sitemap-generator.ts';

export {
  escapeXML,
  validateSitemapConfig,
  validatePostData,
  validateAndFormatDate,
  getCurrentDate,
  isValidUrl,
  isValidPriority,
  isValidChangefreq,
  shouldIncludePost,
  isValidPost,
  getValidPosts,
  generateBlogPostUrl,
  generateStaticPageUrl,
  createSitemapUrl,
  isValidSitemapUrl,
  sortPostsByDate,
  estimateSitemapSize,
  wouldExceedLimits
} from './engine/utils.ts';

// ============================================================================
// ENDPOINTS
// ============================================================================

export {
  SitemapEndpointHandler,
  handleSitemapRequest,
  createSitemapConfig,
  generateRobotsTxt,
  validateSitemapXML
} from './endpoints/sitemap-endpoint.ts';

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

import type { BlogPost, SitemapConfig, SitemapGenerationOptions } from './engine/types.ts';
import type { SitemapEndpointOptions } from './endpoints/sitemap-endpoint.ts';
import { SitemapGenerator, generateSitemap } from './engine/sitemap-generator.ts';
import { SitemapEndpointHandler, handleSitemapRequest, createSitemapConfig } from './endpoints/sitemap-endpoint.ts';
import {
  getValidPosts,
  validateSitemapConfig,
  escapeXML,
  validatePostData,
  generateBlogPostUrl,
  generateStaticPageUrl
} from './engine/utils.ts';
import {
  SITEMAP_CONFIG,
  SITEMAP_ERRORS,
  XML_CONFIG,
  VALIDATION_PATTERNS,
  CHANGEFREQ,
  PRIORITY,
  DEFAULT_SITEMAP_CONFIG
} from './engine/constants.ts';

/**
 * Quick sitemap generation with default settings
 * @param posts Array of blog posts
 * @param siteConfig Site configuration object
 * @param options Generation options
 * @returns Sitemap XML string or null if failed
 */
export function quickGenerateSitemap(
  posts: BlogPost[],
  siteConfig: any,
  options: SitemapGenerationOptions = {}
): string | null {
  try {
    const sitemapConfig = createSitemapConfig(siteConfig);
    const result = generateSitemap(posts, sitemapConfig, options);
    return result.success ? result.xml! : null;
  } catch (error) {
    console.error('Quick sitemap generation failed:', error);
    return null;
  }
}

/**
 * Quick sitemap endpoint handling with default settings
 * @param posts Array of blog posts
 * @param siteConfig Site configuration object
 * @param options Endpoint options
 * @returns HTTP response object
 */
export function quickHandleSitemapRequest(
  posts: BlogPost[],
  siteConfig: any,
  options: SitemapEndpointOptions = {}
) {
  try {
    const sitemapConfig = createSitemapConfig(siteConfig);
    return handleSitemapRequest(posts, sitemapConfig, options);
  } catch (error) {
    console.error('Quick sitemap request handling failed:', error);
    return {
      body: '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><!-- Error generating sitemap --></urlset>',
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      status: 500
    };
  }
}

/**
 * Setup sitemap with configuration validation
 * @param siteConfig Site configuration object
 * @returns Sitemap configuration object
 */
export function setupSitemap(siteConfig: any): SitemapConfig {
  const sitemapConfig = createSitemapConfig(siteConfig);
  
  // Validate configuration
  const validation = validateSitemapConfig(sitemapConfig);
  
  if (!validation.valid) {
    throw new Error(`Sitemap setup failed: ${validation.error}`);
  }
  
  return sitemapConfig;
}

/**
 * Filter posts for sitemap (published only in production)
 * @param posts Array of blog posts
 * @returns Filtered and sorted posts
 */
export function preparePostsForSitemap(posts: BlogPost[]): BlogPost[] {
  const validPosts = getValidPosts(posts);
  
  // Sort by date (newest first)
  return validPosts.sort((a, b) => 
    new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );
}

/**
 * Generate robots.txt with sitemap reference
 * @param siteConfig Site configuration object
 * @param sitemapPath Custom sitemap path
 * @returns Robots.txt content
 */
export function quickGenerateRobotsTxt(siteConfig: any, sitemapPath: string = '/sitemap.xml'): string {
  const siteUrl = siteConfig.site?.url || siteConfig.url || '';
  const { generateRobotsTxt } = require('./endpoints/sitemap-endpoint.ts');
  return generateRobotsTxt(siteUrl, sitemapPath);
}

// ============================================================================
// FEATURE INFO
// ============================================================================

export const FEATURE_INFO = {
  name: 'sitemap',
  version: '1.0.0',
  description: 'Framework-agnostic XML sitemap generation with comprehensive validation and error handling',
  
  // Main exports for easy access
  engine: {
    SitemapGenerator: './engine/sitemap-generator.ts',
    utils: './engine/utils.ts',
    types: './engine/types.ts',
    constants: './engine/constants.ts'
  },
  
  endpoints: {
    SitemapEndpointHandler: './endpoints/sitemap-endpoint.ts'
  },
  
  // Quick start functions
  quickStart: {
    generateSitemap: quickGenerateSitemap,
    handleRequest: quickHandleSitemapRequest,
    setupSitemap: setupSitemap,
    preparePosts: preparePostsForSitemap,
    generateRobotsTxt: quickGenerateRobotsTxt
  },
  
  // Standards compliance
  standards: {
    sitemap: '0.9',
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
  SitemapGenerator,
  SitemapEndpointHandler,
  
  // Utility functions
  generateSitemap,
  handleSitemapRequest,
  createSitemapConfig,
  escapeXML,
  validateSitemapConfig,
  validatePostData,
  generateBlogPostUrl,
  generateStaticPageUrl,
  getValidPosts,
  
  // Quick start functions
  quickGenerateSitemap,
  quickHandleSitemapRequest,
  setupSitemap,
  preparePostsForSitemap,
  quickGenerateRobotsTxt,
  
  // Configuration
  FEATURE_INFO,
  SITEMAP_CONFIG,
  DEFAULT_SITEMAP_CONFIG,
  
  // Constants
  SITEMAP_ERRORS,
  XML_CONFIG,
  VALIDATION_PATTERNS,
  CHANGEFREQ,
  PRIORITY
};
