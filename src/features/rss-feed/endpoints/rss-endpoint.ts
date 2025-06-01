/**
 * RSS Feed Feature - Endpoint Handler
 * Framework-agnostic endpoint logic for RSS feed generation
 */

import type { BlogPost, RSSConfig } from '../engine/types.ts';
import { generateRSSFeed } from '../engine/rss-generator.ts';

/**
 * RSS endpoint response interface
 */
export interface RSSEndpointResponse {
  body: string;
  headers: Record<string, string>;
  status: number;
}

/**
 * RSS endpoint options interface
 */
export interface RSSEndpointOptions {
  /** Maximum number of items in feed */
  maxItems?: number;
  /** Custom post filter function */
  postFilter?: (post: BlogPost) => boolean;
  /** Include full content instead of excerpt */
  includeFullContent?: boolean;
  /** Custom category for all items */
  category?: string;
}

/**
 * RSS Endpoint Handler Class
 * Handles HTTP requests for RSS feed generation
 */
export class RSSEndpointHandler {
  private config: RSSConfig;

  constructor(config: RSSConfig) {
    this.config = config;
  }

  /**
   * Handles RSS feed request
   * @param posts Array of blog posts
   * @param options Endpoint options
   * @returns RSS endpoint response
   */
  public handleRequest(
    posts: BlogPost[], 
    options: RSSEndpointOptions = {}
  ): RSSEndpointResponse {
    try {
      // Sort posts by date (newest first)
      const sortedPosts = [...posts].sort((a, b) => 
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
      );

      // Generate RSS feed
      const result = generateRSSFeed(sortedPosts, this.config, {
        maxItems: options.maxItems,
        postFilter: options.postFilter,
        includeFullContent: options.includeFullContent,
        category: options.category
      });

      if (!result.success) {
        console.error('RSS generation failed:', result.error);
        return this.createErrorResponse(result.error || 'RSS generation failed');
      }

      return this.createSuccessResponse(result.xml!);

    } catch (error) {
      console.error('RSS endpoint error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResponse(errorMessage);
    }
  }

  /**
   * Creates successful RSS response
   * @param xml RSS XML content
   * @returns Success response
   */
  private createSuccessResponse(xml: string): RSSEndpointResponse {
    return {
      body: xml,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'X-Content-Type-Options': 'nosniff'
      },
      status: 200
    };
  }

  /**
   * Creates error RSS response
   * @param error Error message
   * @returns Error response
   */
  private createErrorResponse(error: string): RSSEndpointResponse {
    const errorXML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>RSS Feed Error</title>
    <description>Error generating RSS feed: ${error}</description>
    <link>/</link>
  </channel>
</rss>`;

    return {
      body: errorXML,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'no-cache'
      },
      status: 500
    };
  }

  /**
   * Updates RSS configuration
   * @param newConfig New configuration
   */
  public updateConfig(newConfig: Partial<RSSConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets current configuration
   * @returns Current RSS configuration
   */
  public getConfig(): RSSConfig {
    return { ...this.config };
  }
}

/**
 * Convenience function for handling RSS requests
 * @param posts Array of blog posts
 * @param config RSS configuration
 * @param options Endpoint options
 * @returns RSS endpoint response
 */
export function handleRSSRequest(
  posts: BlogPost[], 
  config: RSSConfig, 
  options: RSSEndpointOptions = {}
): RSSEndpointResponse {
  const handler = new RSSEndpointHandler(config);
  return handler.handleRequest(posts, options);
}

/**
 * Creates RSS configuration from site config
 * @param siteConfig Site configuration object
 * @returns RSS configuration
 */
export function createRSSConfig(siteConfig: any): RSSConfig {
  return {
    site: {
      url: siteConfig.site?.url || siteConfig.url || '',
      title: siteConfig.site?.title || siteConfig.title || 'RSS Feed',
      description: siteConfig.site?.description || siteConfig.description || 'RSS feed description',
      author: siteConfig.site?.author || siteConfig.author || 'RSS Author',
      language: siteConfig.site?.language || siteConfig.language || 'en-US'
    },
    feed: {
      version: '2.0',
      ttl: 60,
      path: '/rss.xml',
      maxItems: 50
    },
    content: {
      maxExcerptLength: 500,
      minExcerptLength: 50,
      defaultCategory: 'Blog'
    }
  };
}

/**
 * Create complete RSS endpoint handler following the AI Metadata pattern
 * @param siteConfig Site configuration object
 * @param options RSS endpoint options
 * @returns Astro endpoint handlers
 */
export function createRSSEndpoint(siteConfig: any, options: RSSEndpointOptions = {}) {
  return {
    /**
     * GET handler for RSS endpoint
     */
    GET: async () => {
      try {
        // Import getCollection dynamically to avoid issues in non-Astro environments
        const { getCollection } = await import('astro:content');

        // Get blog posts
        const blogEntries = await getCollection('blog');

        // Create RSS configuration
        const rssConfig = createRSSConfig(siteConfig);

        // Generate RSS feed
        const response = handleRSSRequest(blogEntries, rssConfig, {
          maxItems: 20,
          ...options
        });

        return new Response(response.body, {
          headers: response.headers,
          status: response.status
        });

      } catch (error) {
        console.error('RSS generation error:', error);

        // Return error RSS
        const errorXML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>RSS Error</title>
    <description>Error generating RSS feed</description>
    <link>${siteConfig.site?.url || siteConfig.url || ''}</link>
  </channel>
</rss>`;

        return new Response(errorXML, {
          headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8'
          },
          status: 500
        });
      }
    }
  };
}

/**
 * Create RSS endpoint handler with posts provided (for testing)
 * @param siteConfig Site configuration object
 * @param posts Blog posts array
 * @param options RSS endpoint options
 * @returns Astro endpoint handlers
 */
export function createRSSEndpointWithPosts(siteConfig: any, posts: BlogPost[], options: RSSEndpointOptions = {}) {
  return {
    /**
     * GET handler for RSS endpoint
     */
    GET: () => {
      try {
        // Create RSS configuration
        const rssConfig = createRSSConfig(siteConfig);

        // Generate RSS feed
        const response = handleRSSRequest(posts, rssConfig, {
          maxItems: 20,
          ...options
        });

        return new Response(response.body, {
          headers: response.headers,
          status: response.status
        });

      } catch (error) {
        console.error('RSS generation error:', error);

        // Return error RSS
        const errorXML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>RSS Error</title>
    <description>Error generating RSS feed</description>
    <link>${siteConfig.site?.url || siteConfig.url || ''}</link>
  </channel>
</rss>`;

        return new Response(errorXML, {
          headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8'
          },
          status: 500
        });
      }
    }
  };
}
