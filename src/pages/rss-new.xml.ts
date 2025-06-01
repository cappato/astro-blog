/**
 * RSS Feed Endpoint - Using New Modular Feature
 * Test endpoint to verify the new RSS feature works correctly
 */

import { getCollection } from 'astro:content';
import { quickHandleRSSRequest } from '../features/rss-feed';
import { CONFIG } from '../config';

export async function GET() {
  try {
    // Get blog posts
    const blogEntries = await getCollection('blog');
    
    // Use the new modular RSS feature
    const response = quickHandleRSSRequest(blogEntries, CONFIG, {
      maxItems: 20 // Limit to 20 most recent posts
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
    <link>${CONFIG.site.url}</link>
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
