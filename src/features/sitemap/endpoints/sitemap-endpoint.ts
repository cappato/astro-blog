/**
 * Sitemap Feature - Endpoint Handler
 * Framework-agnostic endpoint logic for XML sitemap generation
 */

import type { BlogPost, SitemapConfig } from '../engine/types.ts';
import { generateSitemap } from '../engine/sitemap-generator.ts';
import { CONTENT_TYPES, HTTP_STATUS, CACHE_CONTROL } from '../engine/constants.ts';

/**
 * Sitemap endpoint response interface
 */
export interface SitemapEndpointResponse {
  body: string;
  headers: Record<string, string>;
  status: number;
}

/**
 * Sitemap endpoint options interface
 */
export interface SitemapEndpointOptions {
  /** Maximum number of URLs in sitemap */
  maxUrls?: number;
  /** Custom post filter function */
  postFilter?: (post: BlogPost) => boolean;
  /** Include full content URLs */
  includeFullContent?: boolean;
  /** Custom cache control header */
  cacheControl?: string;
  /** Additional static pages */
  additionalPages?: Array<{
    path: string;
    changefreq: string;
    priority: string;
    lastmod?: string;
  }>;
}

/**
 * Sitemap Endpoint Handler Class
 * Handles HTTP requests for XML sitemap generation
 */
export class SitemapEndpointHandler {
  private config: SitemapConfig;

  constructor(config: SitemapConfig) {
    this.config = config;
  }

  /**
   * Handles sitemap request
   * @param posts Array of blog posts
   * @param options Endpoint options
   * @returns Sitemap endpoint response
   */
  public handleRequest(
    posts: BlogPost[], 
    options: SitemapEndpointOptions = {}
  ): SitemapEndpointResponse {
    try {
      // Sort posts by date (newest first for better crawling)
      const sortedPosts = [...posts].sort((a, b) => 
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
      );

      // Generate sitemap
      const result = generateSitemap(sortedPosts, this.config, {
        maxUrls: options.maxUrls,
        postFilter: options.postFilter,
        includeFullContent: options.includeFullContent,
        additionalPages: options.additionalPages
      });

      if (!result.success) {
        console.error('Sitemap generation failed:', result.error);
        return this.createErrorResponse(result.error || 'Sitemap generation failed');
      }

      return this.createSuccessResponse(result.xml!, options.cacheControl);

    } catch (error) {
      console.error('Sitemap endpoint error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResponse(errorMessage);
    }
  }

  /**
   * Creates successful sitemap response
   * @param xml Sitemap XML content
   * @param cacheControl Custom cache control header
   * @returns Success response
   */
  private createSuccessResponse(
    xml: string, 
    cacheControl?: string
  ): SitemapEndpointResponse {
    return {
      body: xml,
      headers: {
        'Content-Type': CONTENT_TYPES.XML_UTF8,
        'Cache-Control': cacheControl || CACHE_CONTROL.MEDIUM, // Cache for 1 day
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex' // Prevent indexing of sitemap itself
      },
      status: HTTP_STATUS.OK
    };
  }

  /**
   * Creates error sitemap response
   * @param error Error message
   * @returns Error response
   */
  private createErrorResponse(error: string): SitemapEndpointResponse {
    const errorXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sitemap generation error: ${error} -->
</urlset>`;

    return {
      body: errorXML,
      headers: {
        'Content-Type': CONTENT_TYPES.XML_UTF8,
        'Cache-Control': CACHE_CONTROL.NO_CACHE
      },
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }

  /**
   * Gets sitemap statistics
   * @param posts Array of blog posts
   * @param options Endpoint options
   * @returns Sitemap statistics
   */
  public getStats(posts: BlogPost[], options: SitemapEndpointOptions = {}) {
    try {
      const { SitemapGenerator } = require('../engine/sitemap-generator.ts');
      const generator = new SitemapGenerator(this.config);
      return generator.getStats(posts, {
        maxUrls: options.maxUrls,
        postFilter: options.postFilter,
        additionalPages: options.additionalPages
      });
    } catch (error) {
      console.error('Error getting sitemap stats:', error);
      return null;
    }
  }

  /**
   * Updates sitemap configuration
   * @param newConfig New configuration
   */
  public updateConfig(newConfig: Partial<SitemapConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets current configuration
   * @returns Current sitemap configuration
   */
  public getConfig(): SitemapConfig {
    return { ...this.config };
  }

  /**
   * Validates current configuration
   * @returns Validation result
   */
  public validateConfig(): { valid: boolean; error?: string } {
    const { validateSitemapConfig } = require('../engine/utils.ts');
    return validateSitemapConfig(this.config);
  }
}

/**
 * Convenience function for handling sitemap requests
 * @param posts Array of blog posts
 * @param config Sitemap configuration
 * @param options Endpoint options
 * @returns Sitemap endpoint response
 */
export function handleSitemapRequest(
  posts: BlogPost[], 
  config: SitemapConfig, 
  options: SitemapEndpointOptions = {}
): SitemapEndpointResponse {
  const handler = new SitemapEndpointHandler(config);
  return handler.handleRequest(posts, options);
}

/**
 * Creates sitemap configuration from site config
 * @param siteConfig Site configuration object
 * @returns Sitemap configuration
 */
export function createSitemapConfig(siteConfig: any): SitemapConfig {
  return {
    site: {
      url: siteConfig.site?.url || siteConfig.url || '',
      title: siteConfig.site?.title || siteConfig.title || 'Website',
      description: siteConfig.site?.description || siteConfig.description || 'Website description',
      language: siteConfig.site?.language || siteConfig.language || 'en-US'
    },
    sitemap: {
      namespace: 'http://www.sitemaps.org/schemas/sitemap/0.9',
      blogPath: '/blog',
      maxUrls: 50000
    },
    urls: {
      changefreq: {
        home: 'weekly',
        blogIndex: 'daily',
        blogPost: 'monthly'
      },
      priority: {
        home: '1.0',
        blogIndex: '0.9',
        blogPost: '0.8'
      }
    },
    staticPages: [
      {
        path: '',
        changefreq: 'weekly',
        priority: '1.0'
      },
      {
        path: '/blog',
        changefreq: 'daily',
        priority: '0.9'
      }
    ]
  };
}

/**
 * Creates robots.txt content with sitemap reference
 * @param siteUrl Site base URL
 * @param sitemapPath Sitemap path (default: /sitemap.xml)
 * @returns Robots.txt content
 */
export function generateRobotsTxt(siteUrl: string, sitemapPath: string = '/sitemap.xml'): string {
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}${sitemapPath}
`;
}

/**
 * Validates sitemap XML content
 * @param xml XML content to validate
 * @returns Validation result
 */
export function validateSitemapXML(xml: string): { valid: boolean; error?: string } {
  try {
    // Basic XML structure validation
    if (!xml.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
      return { valid: false, error: 'Missing XML declaration' };
    }

    if (!xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
      return { valid: false, error: 'Missing or invalid urlset element' };
    }

    if (!xml.includes('</urlset>')) {
      return { valid: false, error: 'Missing closing urlset tag' };
    }

    // Count URLs (basic check)
    const urlCount = (xml.match(/<url>/g) || []).length;
    if (urlCount === 0) {
      console.warn('Sitemap contains no URLs');
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'XML validation failed'
    };
  }
}

/**
 * Create complete Sitemap endpoint handler following the AI Metadata pattern
 * @param siteConfig Site configuration object
 * @param options Sitemap endpoint options
 * @returns Astro endpoint handlers
 */
export function createSitemapEndpoint(siteConfig: any, options: SitemapEndpointOptions = {}) {
  return {
    /**
     * GET handler for Sitemap endpoint
     */
    GET: async () => {
      try {
        // Import getCollection dynamically to avoid issues in non-Astro environments
        const { getCollection } = await import('astro:content');

        // Get blog posts
        const blogEntries = await getCollection('blog');

        // Create Sitemap configuration
        const sitemapConfig = createSitemapConfig(siteConfig);

        // Generate Sitemap
        const response = handleSitemapRequest(blogEntries, sitemapConfig, {
          maxUrls: 1000,
          additionalPages: [],
          ...options
        });

        return new Response(response.body, {
          headers: response.headers,
          status: response.status
        });

      } catch (error) {
        console.error('Sitemap generation error:', error);

        // Return error sitemap
        const errorXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sitemap generation error: ${error instanceof Error ? error.message : 'Unknown error'} -->
  <url>
    <loc>${siteConfig.site?.url || siteConfig.url || ''}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

        return new Response(errorXML, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8'
          },
          status: 500
        });
      }
    }
  };
}

/**
 * Create Sitemap endpoint handler with posts provided (for testing)
 * @param siteConfig Site configuration object
 * @param posts Blog posts array
 * @param options Sitemap endpoint options
 * @returns Astro endpoint handlers
 */
export function createSitemapEndpointWithPosts(siteConfig: any, posts: BlogPost[], options: SitemapEndpointOptions = {}) {
  return {
    /**
     * GET handler for Sitemap endpoint
     */
    GET: () => {
      try {
        // Create Sitemap configuration
        const sitemapConfig = createSitemapConfig(siteConfig);

        // Generate Sitemap
        const response = handleSitemapRequest(posts, sitemapConfig, {
          maxUrls: 1000,
          additionalPages: [],
          ...options
        });

        return new Response(response.body, {
          headers: response.headers,
          status: response.status
        });

      } catch (error) {
        console.error('Sitemap generation error:', error);

        // Return error sitemap
        const errorXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sitemap generation error: ${error instanceof Error ? error.message : 'Unknown error'} -->
  <url>
    <loc>${siteConfig.site?.url || siteConfig.url || ''}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

        return new Response(errorXML, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8'
          },
          status: 500
        });
      }
    }
  };
}
