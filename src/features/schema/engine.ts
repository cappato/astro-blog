/**
 * Schema.org Generation Engine
 * Simplified but modular approach for generating structured data
 */

import type { CollectionEntry } from 'astro:content';
import { SCHEMA_CONFIG, type PageType } from './config.ts';

/**
 * Context for schema generation
 */
export interface SchemaContext {
  url: string;
  post?: CollectionEntry<'blog'>;
  pageType?: PageType;
}

/**
 * Auto-detect page type from URL and context
 */
export function detectPageType(context: SchemaContext): PageType {
  const { url, post } = context;
  
  if (post) return 'blog-post';
  if (url.includes(SCHEMA_CONFIG.paths.blog)) return 'blog-index';
  return 'home';
}

/**
 * Generate absolute URL
 */
function toAbsoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const baseUrl = SCHEMA_CONFIG.site.url;
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Generate Person schema (reusable across all schemas)
 */
function generatePersonSchema() {
  return {
    "@type": "Person",
    "name": SCHEMA_CONFIG.site.author,
    "url": SCHEMA_CONFIG.site.url,
    "image": toAbsoluteUrl(SCHEMA_CONFIG.defaults.profileImage),
    "jobTitle": "Desarrollador Web Full Stack",
    "sameAs": [
      `https://github.com/${SCHEMA_CONFIG.social.github}`,
      `https://linkedin.com/in/${SCHEMA_CONFIG.social.linkedin}`,
      `https://twitter.com/${SCHEMA_CONFIG.social.twitter.replace('@', '')}`
    ]
  };
}

/**
 * Generate Organization schema (reusable across all schemas)
 */
function generateOrganizationSchema() {
  return {
    "@type": "Organization",
    "name": SCHEMA_CONFIG.site.name,
    "url": SCHEMA_CONFIG.site.url,
    "logo": toAbsoluteUrl(SCHEMA_CONFIG.defaults.logo),
    "sameAs": [
      `https://github.com/${SCHEMA_CONFIG.social.github}`,
      `https://linkedin.com/in/${SCHEMA_CONFIG.social.linkedin}`
    ]
  };
}

/**
 * Generate WebSite schema for home page
 */
export function getHomeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SCHEMA_CONFIG.site.name,
    "url": SCHEMA_CONFIG.site.url,
    "description": SCHEMA_CONFIG.site.description,
    "inLanguage": SCHEMA_CONFIG.site.language,
    "author": generatePersonSchema()
  };
}

/**
 * Generate Blog schema for blog index
 */
export function getBlogIndexSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": `Blog de ${SCHEMA_CONFIG.site.author}`,
    "url": toAbsoluteUrl(SCHEMA_CONFIG.paths.blog),
    "description": "Artículos sobre desarrollo web y tecnología",
    "inLanguage": SCHEMA_CONFIG.site.language,
    "author": generatePersonSchema()
  };
}

/**
 * Generate BlogPosting schema for individual posts
 */
export function getBlogPostSchema(post: CollectionEntry<'blog'>, postUrl: string) {
  const { title, description, date, author, image, tags } = post.data;
  const updatedDate = (post.data as any).updatedDate; // Optional field
  
  // Calculate word count automatically
  const wordCount = post.body
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  // Use post image if available, fallback to default
  const postImage = image
    ? toAbsoluteUrl(typeof image === 'string' ? image : image.url)
    : toAbsoluteUrl(SCHEMA_CONFIG.defaults.image);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": postImage,
    "datePublished": new Date(date).toISOString(),
    "dateModified": updatedDate 
      ? new Date(updatedDate).toISOString() 
      : new Date(date).toISOString(),
    "author": {
      ...generatePersonSchema(),
      "name": author || SCHEMA_CONFIG.site.author
    },
    "publisher": generateOrganizationSchema(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": toAbsoluteUrl(postUrl)
    },
    "url": toAbsoluteUrl(postUrl),
    "inLanguage": SCHEMA_CONFIG.site.language,
    "wordCount": wordCount,
    "keywords": tags?.join(', ') || ''
  };
}

/**
 * Main schema generation function
 */
export function generateSchema(context: SchemaContext) {
  const pageType = context.pageType || detectPageType(context);
  
  switch (pageType) {
    case 'home':
      return [getHomeSchema()];

    case 'blog-index':
      return [getBlogIndexSchema()];

    case 'blog-post':
      if (!context.post) {
        console.warn('Schema: blog-post type requires post data');
        return [];
      }
      return [getBlogPostSchema(context.post, context.url)];
      
    default:
      console.warn(`Schema: Unknown page type: ${pageType}`);
      return [];
  }
}

/**
 * Convert schemas to JSON-LD string
 */
export function toJsonLd(schemas: any[]): string {
  return JSON.stringify(schemas, null, 0);
}
