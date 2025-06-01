/**
 * RSS Feed Endpoint - Using Modular Feature
 * Main RSS endpoint that generates /rss.xml
 */

import { createRSSEndpoint } from '../features/rss-feed';
import { CONFIG } from '../config';

// Create endpoint using the modular feature
export const { GET } = createRSSEndpoint(CONFIG, {
  maxItems: 20 // Limit to 20 most recent posts
});
