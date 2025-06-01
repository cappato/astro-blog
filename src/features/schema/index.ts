/**
 * Schema.org Feature - Main Export
 * 
 * This feature provides automatic Schema.org structured data generation
 * for Astro projects with zero configuration required.
 * 
 * @example Basic usage in layouts:
 * ```astro
 * ---
 * import { AutoSchema } from '../features/schema';
 * ---
 * <AutoSchema />
 * ```
 * 
 * @example For blog posts:
 * ```astro
 * ---
 * import { AutoSchema } from '../features/schema';
 * const { entry } = Astro.props;
 * ---
 * <AutoSchema post={entry} />
 * ```
 */

// Main component export
export { default as AutoSchema } from './AutoSchema.astro';

// Engine exports for advanced usage
export {
  generateSchema,
  generateValidatedSchema,
  toJsonLd,
  detectPageType,
  validateSchema,
  getHomeSchema,
  getBlogIndexSchema,
  getBlogPostSchema,
  getPortfolioSchema,
  getProjectSchema,
  getCourseSchema,
  getEventSchema,
  getProductSchema,
  getOrganizationSchema,
  getPersonSchema,
  getArticleSchema
} from './engine.ts';
export type { SchemaContext } from './engine.ts';

// Configuration exports for customization
export { SCHEMA_CONFIG, DEFAULT_SCHEMA_CONFIG, SCHEMA_MAPPINGS } from './config.ts';
export type { SchemaConfig, PageType } from './config.ts';

// Type exports for TypeScript users
export type * from './types.ts';

// Utility exports for advanced usage
export * from './utils.ts';

/**
 * Enhanced feature metadata
 */
export const SCHEMA_FEATURE = {
  name: 'Schema.org Auto-Generator Enhanced',
  version: '2.0.0',
  description: 'Enhanced automatic Schema.org structured data generation with expanded content types, intelligent auto-detection, and validation',
  author: 'Matías Cappato',
  reusable: true,
  plugAndPlay: true,
  selfContained: true,
  features: [
    'Intelligent auto-detection',
    'Expanded content types (12+ types)',
    'Automatic validation',
    'Self-contained configuration',
    'Error handling with fallbacks',
    'TypeScript type safety',
    'Plug & play portability',
    'Utility functions included'
  ],
  supportedTypes: [
    'WebSite', 'Blog', 'BlogPosting', 'CreativeWork',
    'SoftwareApplication', 'Course', 'Event', 'Product',
    'Organization', 'Person', 'Article'
  ],
  exports: {
    components: ['AutoSchema'],
    functions: ['generateSchema', 'detectPageType', 'validateSchema'],
    types: ['PersonSchema', 'WebSiteSchema', 'BlogPostingSchema'],
    utilities: ['ensureAbsoluteUrl', 'validateSchemaFields', 'formatDateToISO'],
    configuration: ['SCHEMA_CONFIG', 'DEFAULT_SCHEMA_CONFIG']
  }
} as const;
