/**
 * AI Metadata JSON Endpoint
 *
 * Uses the modular AI Metadata feature to generate comprehensive
 * metadata for AI assistants and crawlers.
 */

import type { APIRoute } from 'astro';
import { createAIMetadataEndpoint } from '../features/ai-metadata';
import { SITE_INFO } from '../config/site.ts';

// Create site info object for the AI metadata feature
const siteInfo = {
  url: SITE_INFO.url,
  title: SITE_INFO.title,
  description: SITE_INFO.description,
  author: {
    name: SITE_INFO.author.name,
    email: SITE_INFO.author.email
  }
};

// Create endpoint using the modular feature
export const { GET, OPTIONS } = createAIMetadataEndpoint(siteInfo);
