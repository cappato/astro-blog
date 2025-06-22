/**
 * Sitemap Index Endpoint
 * Generates /sitemap-index.xml that references all sitemaps
 */

import type { APIRoute } from 'astro';
import { SITE_INFO } from '../config/site';

export const GET: APIRoute = async () => {
  const baseUrl = SITE_INFO.url;
  const currentDate = new Date().toISOString();

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new Response(sitemapIndex, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};
