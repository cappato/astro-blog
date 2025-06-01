/**
 * AI Metadata JSON Generator
 * Generates comprehensive metadata file for AI assistants and crawlers
 * Provides structured information about the site and its content
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_INFO, AI_METADATA_CONFIG, BLOG_POST_CONFIG, SOCIAL_LINKS } from '../config/site.ts';
import { getDisplayPosts, transformPostsToCardData } from '../utils/blogPost.ts';

export const GET: APIRoute = async () => {
  try {
    // Simple metadata first to test
    const aiMetadata = {
      "@context": AI_METADATA_CONFIG.schemaContext,
      "@type": "WebSite",
      "name": SITE_INFO.title,
      "description": SITE_INFO.description,
      "url": SITE_INFO.url,
      "author": {
        "@type": AI_METADATA_CONFIG.author.type,
        "name": AI_METADATA_CONFIG.author.name,
        "url": AI_METADATA_CONFIG.author.url
      },
      "inLanguage": AI_METADATA_CONFIG.language,
      "isAccessibleForFree": AI_METADATA_CONFIG.isAccessibleForFree,
      "dateModified": new Date().toISOString(),
      "status": "simplified_version"
    };

    return new Response(JSON.stringify(aiMetadata, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error generating AI metadata:', error);
    
    // Return minimal metadata on error
    const fallbackMetadata = {
      "@context": AI_METADATA_CONFIG.schemaContext,
      "@type": "WebSite",
      "name": SITE_INFO.title,
      "description": SITE_INFO.description,
      "url": SITE_INFO.url,
      "author": {
        "@type": AI_METADATA_CONFIG.author.type,
        "name": AI_METADATA_CONFIG.author.name,
        "url": AI_METADATA_CONFIG.author.url
      },
      "inLanguage": AI_METADATA_CONFIG.language,
      "error": "Failed to generate complete metadata"
    };

    return new Response(JSON.stringify(fallbackMetadata, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes on error
      }
    });
  }
};
