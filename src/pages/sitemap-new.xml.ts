/**
 * Sitemap Endpoint - Using New Modular Feature
 * Test endpoint to verify the new Sitemap feature works correctly
 */

import { getCollection } from 'astro:content';
import { quickHandleSitemapRequest } from '../features/sitemap';
import { CONFIG } from '../config';

export async function GET() {
  try {
    // Get blog posts
    const blogEntries = await getCollection('blog');
    
    // Use the new modular Sitemap feature
    const response = quickHandleSitemapRequest(blogEntries, CONFIG, {
      maxUrls: 1000, // Limit to 1000 URLs
      additionalPages: [
        // Add any additional static pages here
        // { path: '/about', changefreq: 'monthly', priority: '0.7' }
      ]
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
    <loc>${CONFIG.site.url}</loc>
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
