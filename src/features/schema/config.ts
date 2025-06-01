/**
 * Schema.org Feature Configuration
 * Self-contained configuration for plug & play portability
 * Can be overridden by importing site config if available
 */

/**
 * Default schema configuration - completely self-contained
 * Override these values when copying to other projects
 */
export const DEFAULT_SCHEMA_CONFIG = {
  /** Site information for schemas */
  site: {
    name: 'Your Site Name',
    url: 'https://yoursite.com',
    description: 'Your site description',
    author: 'Your Name',
    language: 'en',
    type: 'WebSite'
  },

  /** Social media profiles */
  social: {
    github: 'yourusername',
    linkedin: 'yourusername',
    twitter: '@yourusername'
  },

  /** Default images and assets */
  defaults: {
    image: '/images/og-default.webp',
    logo: '/images/logo.webp',
    profileImage: '/images/profile.webp',
    fallbackImage: '/images/fallback.webp'
  },

  /** URL paths for auto-detection */
  paths: {
    home: '/',
    blog: '/blog',
    portfolio: '/portfolio',
    projects: '/projects',
    courses: '/courses',
    events: '/events',
    about: '/about'
  },

  /** Schema.org content type mappings */
  contentTypes: {
    website: 'WebSite',
    blog: 'Blog',
    'blog-post': 'BlogPosting',
    'blog-index': 'Blog',
    portfolio: 'CreativeWork',
    project: 'SoftwareApplication',
    course: 'Course',
    event: 'Event',
    product: 'Product',
    organization: 'Organization',
    person: 'Person',
    article: 'Article'
  },

  /** Schema.org action types */
  actionTypes: {
    read: 'ReadAction',
    view: 'ViewAction',
    search: 'SearchAction',
    download: 'DownloadAction',
    subscribe: 'SubscribeAction'
  },

  /** Required fields for each schema type */
  requiredFields: {
    'WebSite': ['name', 'url', 'description'],
    'Blog': ['name', 'url', 'description'],
    'BlogPosting': ['headline', 'description', 'datePublished', 'author'],
    'CreativeWork': ['name', 'description', 'author'],
    'SoftwareApplication': ['name', 'description', 'applicationCategory'],
    'Course': ['name', 'description', 'provider'],
    'Event': ['name', 'description', 'startDate'],
    'Product': ['name', 'description', 'brand'],
    'Organization': ['name', 'url'],
    'Person': ['name'],
    'Article': ['headline', 'description', 'datePublished', 'author']
  },

  /** Auto-detection patterns */
  autoDetection: {
    patterns: {
      'home': ['^/$', '^https?://[^/]+/$'],
      'blog-post': ['/blog/', '/posts/'],
      'blog-index': ['/blog$', '/posts$'],
      'portfolio': ['/portfolio/', '/work/'],
      'project': ['/projects/', '/project/'],
      'course': ['/courses/', '/course/'],
      'event': ['/events/', '/event/'],
      'about': ['/about', '/bio', '/profile']
    },
    priority: ['blog-post', 'home', 'portfolio', 'project', 'course', 'event', 'blog-index', 'about', 'website']
  }
} as const;

/**
 * Configuration: Import site config directly
 * For plug & play: copy this feature and update this import path
 */
import { SCHEMA_CONFIG as SITE_SCHEMA_CONFIG } from '../../config/site.ts';

// Use site config if available, fallback to defaults
export const SCHEMA_CONFIG = SITE_SCHEMA_CONFIG || DEFAULT_SCHEMA_CONFIG;

/**
 * Type definitions for schema configuration
 */
export type SchemaConfig = typeof SCHEMA_CONFIG;

/**
 * Expanded page types with new content types
 */
export type PageType =
  | 'home'
  | 'blog-index'
  | 'blog-post'
  | 'portfolio'
  | 'project'
  | 'course'
  | 'event'
  | 'product'
  | 'organization'
  | 'person'
  | 'article'
  | 'website';

/**
 * Schema field mappings for different page types
 * Now uses the expanded configuration from site.ts
 */
export const SCHEMA_MAPPINGS = {
  'home': {
    schemaType: SCHEMA_CONFIG.contentTypes.website,
    requiredFields: SCHEMA_CONFIG.requiredFields.WebSite
  },
  'blog-index': {
    schemaType: SCHEMA_CONFIG.contentTypes['blog-index'],
    requiredFields: SCHEMA_CONFIG.requiredFields.Blog
  },
  'blog-post': {
    schemaType: SCHEMA_CONFIG.contentTypes['blog-post'],
    requiredFields: SCHEMA_CONFIG.requiredFields.BlogPosting
  },
  'portfolio': {
    schemaType: SCHEMA_CONFIG.contentTypes.portfolio,
    requiredFields: SCHEMA_CONFIG.requiredFields.CreativeWork
  },
  'project': {
    schemaType: SCHEMA_CONFIG.contentTypes.project,
    requiredFields: SCHEMA_CONFIG.requiredFields.SoftwareApplication
  },
  'course': {
    schemaType: SCHEMA_CONFIG.contentTypes.course,
    requiredFields: SCHEMA_CONFIG.requiredFields.Course
  },
  'event': {
    schemaType: SCHEMA_CONFIG.contentTypes.event,
    requiredFields: SCHEMA_CONFIG.requiredFields.Event
  },
  'product': {
    schemaType: SCHEMA_CONFIG.contentTypes.product,
    requiredFields: SCHEMA_CONFIG.requiredFields.Product
  },
  'organization': {
    schemaType: SCHEMA_CONFIG.contentTypes.organization,
    requiredFields: SCHEMA_CONFIG.requiredFields.Organization
  },
  'person': {
    schemaType: SCHEMA_CONFIG.contentTypes.person,
    requiredFields: SCHEMA_CONFIG.requiredFields.Person
  },
  'article': {
    schemaType: SCHEMA_CONFIG.contentTypes.article,
    requiredFields: SCHEMA_CONFIG.requiredFields.Article
  },
  'website': {
    schemaType: SCHEMA_CONFIG.contentTypes.website,
    requiredFields: SCHEMA_CONFIG.requiredFields.WebSite
  }
} as const;
