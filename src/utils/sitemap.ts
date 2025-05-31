/**
 * Utilidades para generación de sitemap XML
 * Separado del endpoint para facilitar testing
 */

import type { CollectionEntry } from 'astro:content';

/**
 * Genera el contenido XML del sitemap
 * @param posts Array de posts del blog
 * @returns String con el XML del sitemap
 */
export function generateSitemap(posts: CollectionEntry<'blog'>[]): string {
  const siteUrl = 'https://cappato.dev';

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${posts.map(post => `
  <url>
    <loc>${siteUrl}/blog/${post.data.slug || post.slug}</loc>
    <lastmod>${post.data.date.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
</urlset>`;
}

/**
 * Filtra posts según el entorno (producción vs desarrollo)
 * @param post Post a evaluar
 * @returns true si el post debe incluirse
 */
export function shouldIncludePost(post: CollectionEntry<'blog'>): boolean {
  // En producción, excluir drafts. En desarrollo, incluir todos
  return import.meta.env.PROD ? !post.data.draft : true;
}
