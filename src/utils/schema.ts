/**
 * Schema.org structured data utilities
 * Simplified and centralized approach for SEO
 */

import type { CollectionEntry } from 'astro:content';
import { CONFIG } from '../config/index.ts';

/**
 * Base schema types for type safety
 */
export interface BaseSchema {
  '@context': 'https://schema.org';
  '@type': string;
}

export interface PersonSchema extends BaseSchema {
  '@type': 'Person';
  name: string;
  url: string;
  image?: string;
  jobTitle?: string;
  worksFor?: OrganizationSchema;
  sameAs?: string[];
}

export interface OrganizationSchema extends BaseSchema {
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

export interface WebSiteSchema extends BaseSchema {
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  inLanguage: string;
  publisher?: OrganizationSchema;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export interface BlogSchema extends BaseSchema {
  '@type': 'Blog';
  name: string;
  url: string;
  description: string;
  inLanguage: string;
  publisher: OrganizationSchema;
  author: PersonSchema;
}

export interface BlogPostingSchema extends BaseSchema {
  '@type': 'BlogPosting';
  headline: string;
  description: string;
  image: string;
  author: PersonSchema;
  publisher: OrganizationSchema;
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  url: string;
  inLanguage: string;
  wordCount?: number;
  keywords?: string[];
}

/**
 * Ensure URL is absolute
 */
function ensureAbsoluteUrl(url: string, baseUrl: string = CONFIG.site.url): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Validate required schema fields
 */
function validateSchemaFields(schema: BaseSchema, requiredFields: string[]): void {
  const missing = requiredFields.filter(field => {
    const value = (schema as any)[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    console.warn(`Schema validation warning: Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Generate Person schema for the site author
 */
export function getPersonSchema(): PersonSchema {
  const { site, social } = CONFIG;

  const schema: PersonSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.author,
    url: ensureAbsoluteUrl(site.url),
    image: ensureAbsoluteUrl('/images/profile.webp'),
    jobTitle: 'Desarrollador Web Full Stack',
    worksFor: getOrganizationSchema(),
    sameAs: [
      `https://github.com/${social.github}`,
      `https://linkedin.com/in/${social.linkedin}`,
      `https://twitter.com/${social.twitter.replace('@', '')}`
    ]
  };

  validateSchemaFields(schema, ['name', 'url']);
  return schema;
}

/**
 * Generate Organization schema for the site
 */
export function getOrganizationSchema(): OrganizationSchema {
  const { site, social } = CONFIG;

  const schema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.title,
    url: ensureAbsoluteUrl(site.url),
    logo: ensureAbsoluteUrl('/images/logo.webp'),
    sameAs: [
      `https://github.com/${social.github}`,
      `https://linkedin.com/in/${social.linkedin}`
    ]
  };

  validateSchemaFields(schema, ['name', 'url']);
  return schema;
}

/**
 * Generate WebSite schema for home page
 */
export function getHomeSchema(): WebSiteSchema[] {
  const { site } = CONFIG;

  const websiteSchema: WebSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.title,
    url: ensureAbsoluteUrl(site.url),
    description: site.description,
    inLanguage: 'es',
    publisher: getOrganizationSchema(),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${ensureAbsoluteUrl(site.url)}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  validateSchemaFields(websiteSchema, ['name', 'url', 'description']);

  return [
    websiteSchema,
    getPersonSchema(),
    getOrganizationSchema()
  ];
}

/**
 * Generate Blog schema for blog index page
 */
export function getBlogIndexSchema(): (WebSiteSchema | BlogSchema | PersonSchema)[] {
  const { site } = CONFIG;

  const websiteSchema: WebSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${site.title} - Blog`,
    url: ensureAbsoluteUrl('/blog'),
    description: `Blog de ${site.author} sobre desarrollo web y tecnología`,
    inLanguage: 'es',
    publisher: getOrganizationSchema()
  };

  const blogSchema: BlogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `Blog de ${site.author}`,
    url: ensureAbsoluteUrl('/blog'),
    description: `Artículos sobre desarrollo web, JavaScript, TypeScript y tecnología`,
    inLanguage: 'es',
    publisher: getOrganizationSchema(),
    author: getPersonSchema()
  };

  validateSchemaFields(websiteSchema, ['name', 'url', 'description']);
  validateSchemaFields(blogSchema, ['name', 'url', 'description']);

  return [
    websiteSchema,
    blogSchema,
    getPersonSchema()
  ];
}

/**
 * Generate BlogPosting schema for individual blog posts
 */
export function getBlogPostSchema(data: {
  post: CollectionEntry<'blog'>;
  postUrl: string;
  imageUrl?: string;
}): (BlogPostingSchema | PersonSchema | OrganizationSchema)[] {
  const { post, postUrl, imageUrl } = data;
  const { site } = CONFIG;

  // Validate required fields
  if (!post.data.title || !post.data.description || !post.data.date) {
    throw new Error('BlogPosting schema requires title, description, and date');
  }

  const publishedDate = new Date(post.data.date).toISOString();
  const modifiedDate = post.data.updatedDate
    ? new Date(post.data.updatedDate).toISOString()
    : publishedDate;

  // Calculate word count from content
  const wordCount = post.body
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  const blogPostSchema: BlogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.title,
    description: post.data.description,
    image: ensureAbsoluteUrl(imageUrl || '/images/og-default.webp'),
    author: getPersonSchema(),
    publisher: getOrganizationSchema(),
    datePublished: publishedDate,
    dateModified: modifiedDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': ensureAbsoluteUrl(postUrl)
    },
    url: ensureAbsoluteUrl(postUrl),
    inLanguage: 'es',
    wordCount,
    keywords: post.data.tags
  };

  validateSchemaFields(blogPostSchema, ['headline', 'description', 'datePublished', 'author', 'publisher']);

  return [
    blogPostSchema,
    getPersonSchema(),
    getOrganizationSchema()
  ];
}

/**
 * Convert schemas to JSON-LD string
 */
export function schemasToJsonLd(schemas: BaseSchema[]): string {
  return JSON.stringify(schemas, null, 0);
}
