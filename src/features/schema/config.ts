/**
 * Schema.org Feature Configuration
 * Centralized configuration for easy reuse across projects
 */

import { CONFIG } from '../../config/index.ts';

export const SCHEMA_CONFIG = {
  site: {
    name: CONFIG.site.title,
    url: CONFIG.site.url,
    description: CONFIG.site.description,
    author: CONFIG.site.author,
    language: "es"
  },
  social: {
    github: CONFIG.social.github,
    linkedin: CONFIG.social.linkedin,
    twitter: CONFIG.social.twitter
  },
  defaults: {
    image: "/images/og-default.webp",
    logo: "/images/logo.webp",
    profileImage: "/images/profile.webp"
  },
  paths: {
    blog: "/blog",
    home: "/"
  }
} as const;

/**
 * Type definitions for schema configuration
 */
export type SchemaConfig = typeof SCHEMA_CONFIG;
export type PageType = 'home' | 'blog-index' | 'blog-post';

/**
 * Schema field mappings for different page types
 */
export const SCHEMA_MAPPINGS = {
  'home': {
    schemaType: 'WebSite',
    requiredFields: ['name', 'url', 'description']
  },
  'blog-index': {
    schemaType: 'Blog', 
    requiredFields: ['name', 'url', 'description']
  },
  'blog-post': {
    schemaType: 'BlogPosting',
    requiredFields: ['headline', 'description', 'datePublished', 'author']
  }
} as const;
