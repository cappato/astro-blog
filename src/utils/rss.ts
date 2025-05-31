/**
 * Utilidades para generación de RSS Feed
 * Separado del endpoint para facilitar testing
 */

import type { CollectionEntry } from 'astro:content';
import { CONFIG } from '../config/index.ts';

/**
 * Genera el contenido XML del RSS feed
 * @param posts Array de posts del blog ordenados por fecha
 * @returns String con el XML del RSS feed
 */
export function generateRSSFeed(posts: CollectionEntry<'blog'>[]): string {
  const { site, blog } = CONFIG;
  const buildDate = new Date().toUTCString();
  const lastBuildDate = posts.length > 0 ? new Date(posts[0].data.date).toUTCString() : buildDate;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXML(site.title)}</title>
    <description>${escapeXML(site.description)}</description>
    <link>${site.url}</link>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>${site.language}</language>
    <managingEditor>${site.author}</managingEditor>
    <webMaster>${site.author}</webMaster>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <ttl>60</ttl>
    <generator>Astro v5.8.0</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>

    ${posts.map(post => generateRSSItem(post)).join('\n    ')}
  </channel>
</rss>`;
}

/**
 * Genera un item individual del RSS feed
 * @param post Post del blog
 * @returns String con el XML del item
 */
function generateRSSItem(post: CollectionEntry<'blog'>): string {
  const { site } = CONFIG;
  const postUrl = `${site.url}/blog/${post.data.slug || post.slug}`;
  const pubDate = new Date(post.data.date).toUTCString();

  // Generar descripción del post (excerpt o descripción)
  const description = post.data.description || generateExcerpt(post.body);

  return `<item>
      <title>${escapeXML(post.data.title)}</title>
      <description>${escapeXML(description)}</description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXML(post.data.author)}</author>
      <category>${escapeXML('Blog')}</category>
    </item>`;
}

/**
 * Genera un excerpt del contenido del post
 * @param content Contenido markdown del post
 * @returns Excerpt de máximo 160 caracteres
 */
function generateExcerpt(content: string): string {
  const { blog } = CONFIG;

  // Remover markdown básico y obtener texto plano
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/`(.*?)`/g, '$1') // Code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/\n+/g, ' ') // Newlines
    .trim();

  // Truncar a la longitud especificada
  if (plainText.length <= blog.excerptLength) {
    return plainText;
  }

  // Truncar en la palabra más cercana
  const truncated = plainText.substring(0, blog.excerptLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Escapa caracteres especiales para XML
 * @param text Texto a escapar
 * @returns Texto escapado para XML
 */
function escapeXML(text: string | undefined): string {
  if (!text) return '';

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Filtra posts según el entorno (producción vs desarrollo)
 * Reutiliza la misma lógica del sitemap
 * @param post Post a evaluar
 * @returns true si el post debe incluirse
 */
export function shouldIncludePost(post: CollectionEntry<'blog'>): boolean {
  // En producción, excluir drafts. En desarrollo, incluir todos
  return import.meta.env.PROD ? !post.data.draft : true;
}
