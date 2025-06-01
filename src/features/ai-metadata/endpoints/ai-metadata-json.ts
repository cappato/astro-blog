/**
 * AI Metadata Feature - JSON Endpoint Logic
 * 
 * Generates AI metadata endpoint response with site information,
 * technical details, and AI instructions for crawlers.
 */

import type { 
  AIMetadataEndpointResponse, 
  SiteInfo,
  AIMetadataConfig 
} from '../engine/types.ts';
import { 
  TECHNICAL_INFO, 
  AI_INSTRUCTIONS, 
  CACHE_CONFIG,
  AI_METADATA_CONFIG 
} from '../engine/constants.ts';
import { 
  generateCacheControl,
  makeAbsoluteUrl,
  formatDateISO 
} from '../engine/utils.ts';

/**
 * Generate AI metadata endpoint response
 */
export function generateAIMetadataResponse(
  siteInfo: SiteInfo,
  config: Partial<AIMetadataConfig> = {}
): AIMetadataEndpointResponse {
  const mergedConfig = { ...AI_METADATA_CONFIG, ...config };
  
  try {
    const response: AIMetadataEndpointResponse = {
      '@context': mergedConfig.schemaContext,
      '@type': mergedConfig.contentTypes.website,
      name: siteInfo.title,
      description: siteInfo.description,
      url: siteInfo.url,
      author: {
        '@type': mergedConfig.author.type,
        name: siteInfo.author.name,
        url: makeAbsoluteUrl('/about', siteInfo)
      },
      inLanguage: mergedConfig.language,
      isAccessibleForFree: mergedConfig.isAccessibleForFree,
      dateModified: formatDateISO(new Date()),
      technicalInfo: {
        framework: TECHNICAL_INFO.framework,
        language: TECHNICAL_INFO.language,
        features: TECHNICAL_INFO.features
      },
      aiInstructions: {
        preferredCitation: `${siteInfo.author.name} - ${siteInfo.title}`,
        contentLicense: AI_INSTRUCTIONS.contentLicense,
        crawlingPolicy: AI_INSTRUCTIONS.crawlingPolicy,
        primaryTopics: AI_INSTRUCTIONS.primaryTopics
      }
    };

    return response;
  } catch (error) {
    return {
      '@context': mergedConfig.schemaContext,
      '@type': mergedConfig.contentTypes.website,
      name: 'Error',
      description: 'Failed to generate AI metadata',
      url: siteInfo.url,
      author: {
        '@type': mergedConfig.author.type,
        name: 'Unknown',
        url: siteInfo.url
      },
      inLanguage: mergedConfig.language,
      isAccessibleForFree: mergedConfig.isAccessibleForFree,
      dateModified: formatDateISO(new Date()),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate response headers for AI metadata endpoint
 */
export function generateAIMetadataHeaders(isError: boolean = false): Record<string, string> {
  const cacheMaxAge = isError 
    ? CACHE_CONFIG.ERROR_CACHE_DURATION 
    : CACHE_CONFIG.SUCCESS_CACHE_DURATION;

  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': generateCacheControl(cacheMaxAge, true),
    'Access-Control-Allow-Origin': CACHE_CONFIG.ACCESS_CONTROL_ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  };
}

/**
 * Create complete AI metadata endpoint handler
 */
export function createAIMetadataEndpoint(siteInfo: SiteInfo, config?: Partial<AIMetadataConfig>) {
  return {
    /**
     * GET handler for AI metadata endpoint
     */
    GET: () => {
      try {
        const response = generateAIMetadataResponse(siteInfo, config);
        const headers = generateAIMetadataHeaders(!!response.error);
        
        return new Response(
          JSON.stringify(response, null, 2),
          {
            status: response.error ? 500 : 200,
            headers
          }
        );
      } catch (error) {
        const errorResponse = {
          '@context': AI_METADATA_CONFIG.schemaContext,
          '@type': AI_METADATA_CONFIG.contentTypes.website,
          name: 'Error',
          description: 'Internal server error',
          url: siteInfo.url,
          author: {
            '@type': AI_METADATA_CONFIG.author.type,
            name: 'Unknown',
            url: siteInfo.url
          },
          inLanguage: AI_METADATA_CONFIG.language,
          isAccessibleForFree: AI_METADATA_CONFIG.isAccessibleForFree,
          dateModified: formatDateISO(new Date()),
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };

        const headers = generateAIMetadataHeaders(true);
        
        return new Response(
          JSON.stringify(errorResponse, null, 2),
          {
            status: 500,
            headers
          }
        );
      }
    },

    /**
     * OPTIONS handler for CORS preflight
     */
    OPTIONS: () => {
      const headers = generateAIMetadataHeaders();
      return new Response(null, {
        status: 204,
        headers
      });
    }
  };
}
