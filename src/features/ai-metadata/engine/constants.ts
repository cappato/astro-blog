/**
 * AI Metadata Feature - Constants and Configuration
 * 
 * Centralized configuration for AI metadata system
 * with default values and validation rules.
 */

import type { AIMetadataConfig } from './types.ts';

/** Default AI metadata configuration */
export const AI_METADATA_CONFIG: AIMetadataConfig = {
  /** Language configuration */
  language: 'es',

  /** Schema.org context */
  schemaContext: 'https://schema.org',

  /** Default accessibility */
  isAccessibleForFree: true,

  /** AI metadata file path */
  metadataFilePath: '/ai-metadata.json',

  /** Meta tag prefixes */
  metaTagPrefix: 'ai:',

  /** Author configuration - will be overridden by site config */
  author: {
    type: 'Person',
    name: 'Site Author',
    url: '/about'
  },

  /** Action types for Schema.org */
  actionTypes: {
    read: 'ReadAction',
    view: 'ViewAction',
    search: 'SearchAction'
  },

  /** Content types mapping to Schema.org types */
  contentTypes: {
    website: 'WebSite',
    article: 'BlogPosting',
    profile: 'Person',
    blog: 'Blog'
  }
} as const;

/** Default meta tag names */
export const META_TAG_NAMES = {
  DESCRIPTION: 'description',
  KEYWORDS: 'keywords',
  TYPE: 'type',
  PUBLISHED: 'published',
  MODIFIED: 'modified',
  AUTHOR: 'author'
} as const;

/** Validation rules */
export const VALIDATION_RULES = {
  /** Minimum title length */
  MIN_TITLE_LENGTH: 1,
  
  /** Maximum title length */
  MAX_TITLE_LENGTH: 200,
  
  /** Minimum description length */
  MIN_DESCRIPTION_LENGTH: 1,
  
  /** Maximum description length */
  MAX_DESCRIPTION_LENGTH: 500,
  
  /** Maximum tags count */
  MAX_TAGS_COUNT: 20,
  
  /** Maximum tag length */
  MAX_TAG_LENGTH: 50,
  
  /** Valid URL pattern */
  URL_PATTERN: /^(https?:\/\/|\/)/,
  
  /** Valid content types */
  VALID_CONTENT_TYPES: ['website', 'article', 'profile', 'blog'] as const
} as const;

/** Error codes */
export const ERROR_CODES = {
  INVALID_TITLE: 'INVALID_TITLE',
  INVALID_DESCRIPTION: 'INVALID_DESCRIPTION',
  INVALID_URL: 'INVALID_URL',
  INVALID_TYPE: 'INVALID_TYPE',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_TAGS: 'INVALID_TAGS',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
} as const;

/** Error messages */
export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_TITLE]: 'Title must be between 1 and 200 characters',
  [ERROR_CODES.INVALID_DESCRIPTION]: 'Description must be between 1 and 500 characters',
  [ERROR_CODES.INVALID_URL]: 'URL must be a valid HTTP/HTTPS URL or relative path',
  [ERROR_CODES.INVALID_TYPE]: 'Content type must be one of: website, article, profile, blog',
  [ERROR_CODES.INVALID_DATE]: 'Date must be a valid Date object',
  [ERROR_CODES.INVALID_TAGS]: 'Tags must be an array of strings with max 20 items',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Required field is missing',
  [ERROR_CODES.CONFIGURATION_ERROR]: 'AI metadata configuration error'
} as const;

/** Cache configuration */
export const CACHE_CONFIG = {
  /** Default cache duration for successful responses (1 hour) */
  SUCCESS_CACHE_DURATION: 3600,
  
  /** Cache duration for error responses (5 minutes) */
  ERROR_CACHE_DURATION: 300,
  
  /** Cache control header for public caching */
  PUBLIC_CACHE_CONTROL: 'public',
  
  /** Access control headers */
  ACCESS_CONTROL_ALLOW_ORIGIN: '*'
} as const;

/** Technical information for AI metadata endpoint */
export const TECHNICAL_INFO = {
  framework: 'Astro',
  language: 'TypeScript',
  features: [
    'Static Site Generation',
    'Blog System',
    'SEO Optimization',
    'AI Metadata',
    'Schema.org Structured Data',
    'Multi-format Image Optimization',
    'Dark/Light Theme System'
  ]
} as const;

/** AI instructions for crawlers */
export const AI_INSTRUCTIONS = {
  preferredCitation: 'Author Name - Site Name',
  contentLicense: 'All rights reserved',
  crawlingPolicy: 'Allowed for AI training with attribution',
  primaryTopics: [
    'Web Development',
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Full Stack Development',
    'Software Engineering'
  ]
} as const;

/** Feature metadata */
export const FEATURE_METADATA = {
  name: 'ai-metadata',
  version: '1.0.0',
  description: 'AI-optimized metadata system with Schema.org support',
  author: 'Augment Agent',
  dependencies: ['astro', 'typescript'],
  exports: ['AIMetadata', 'AIMetadataManager', 'generateAIMetadataEndpoint']
} as const;
