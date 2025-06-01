/**
 * Sitemap Endpoint - Using Modular Feature
 * Main sitemap endpoint that generates /sitemap.xml
 */

import { createSitemapEndpoint } from '../features/sitemap';
import { CONFIG } from '../config';

// Create endpoint using the modular feature
export const { GET } = createSitemapEndpoint(CONFIG, {
  maxUrls: 1000, // Limit to 1000 URLs
  additionalPages: [
    // Add any additional static pages here
    // { path: '/about', changefreq: 'monthly', priority: '0.7' }
  ]
});