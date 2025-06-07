/**
 * Schema.org TypeScript type definitions
 * Complete type safety for all supported schema types
 */

/**
 * Base schema interface
 */
export interface BaseSchema {
  '@context': 'https://schema.org';
  '@type': string;
}

/**
 * Person schema interface
 */
export interface PersonSchema extends BaseSchema {
  '@type': 'Person';
  name: string;
  url: string;
  image?: string;
  jobTitle?: string;
  worksFor?: OrganizationSchema;
  sameAs?: string[];
}

/**
 * Organization schema interface
 */
export interface OrganizationSchema extends BaseSchema {
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

/**
 * WebSite schema interface
 */
export interface WebSiteSchema extends BaseSchema {
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  inLanguage: string;
  publisher?: OrganizationSchema;
  author?: PersonSchema;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

/**
 * Blog schema interface
 */
export interface BlogSchema extends BaseSchema {
  '@type': 'Blog';
  name: string;
  url: string;
  description: string;
  inLanguage: string;
  publisher: OrganizationSchema;
  author: PersonSchema;
}

/**
 * BlogPosting schema interface
 */
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
  keywords?: string;
}

/**
 * CreativeWork schema interface (Portfolio)
 */
export interface CreativeWorkSchema extends BaseSchema {
  '@type': 'CreativeWork';
  name: string;
  url: string;
  description: string;
  author: PersonSchema;
  creator: PersonSchema;
  inLanguage: string;
}

/**
 * SoftwareApplication schema interface (Projects)
 */
export interface SoftwareApplicationSchema extends BaseSchema {
  '@type': 'SoftwareApplication';
  name: string;
  url: string;
  description: string;
  author: PersonSchema;
  applicationCategory: string;
  operatingSystem: string;
  inLanguage: string;
}

/**
 * Course schema interface
 */
export interface CourseSchema extends BaseSchema {
  '@type': 'Course';
  name: string;
  url: string;
  description: string;
  provider: OrganizationSchema;
  instructor: PersonSchema;
  inLanguage: string;
}

/**
 * Event schema interface
 */
export interface EventSchema extends BaseSchema {
  '@type': 'Event';
  name: string;
  url: string;
  description: string;
  organizer: PersonSchema;
  startDate: string;
  inLanguage: string;
}

/**
 * Product schema interface
 */
export interface ProductSchema extends BaseSchema {
  '@type': 'Product';
  name: string;
  url: string;
  description: string;
  brand: OrganizationSchema;
  manufacturer: PersonSchema;
}

/**
 * Article schema interface
 */
export interface ArticleSchema extends BaseSchema {
  '@type': 'Article';
  headline: string;
  url: string;
  description: string;
  author: PersonSchema;
  datePublished: string;
  dateModified: string;
  inLanguage: string;
}

/**
 * FAQ Question and Answer interfaces
 */
export interface FAQAnswer {
  '@type': 'Answer';
  text: string;
}

export interface FAQQuestion {
  '@type': 'Question';
  name: string;
  acceptedAnswer: FAQAnswer;
}

/**
 * FAQPage schema interface
 */
export interface FAQPageSchema extends BaseSchema {
  '@type': 'FAQPage';
  mainEntity: FAQQuestion[];
}

/**
 * Union type for all supported schemas
 */
export type SupportedSchema =
  | WebSiteSchema
  | BlogSchema
  | BlogPostingSchema
  | CreativeWorkSchema
  | SoftwareApplicationSchema
  | CourseSchema
  | EventSchema
  | ProductSchema
  | ArticleSchema
  | FAQPageSchema
  | PersonSchema
  | OrganizationSchema;

/**
 * Schema type mapping for validation
 */
export const SCHEMA_TYPE_MAP = {
  'WebSite': 'WebSiteSchema',
  'Blog': 'BlogSchema',
  'BlogPosting': 'BlogPostingSchema',
  'CreativeWork': 'CreativeWorkSchema',
  'SoftwareApplication': 'SoftwareApplicationSchema',
  'Course': 'CourseSchema',
  'Event': 'EventSchema',
  'Product': 'ProductSchema',
  'Article': 'ArticleSchema',
  'FAQPage': 'FAQPageSchema',
  'Person': 'PersonSchema',
  'Organization': 'OrganizationSchema'
} as const;
