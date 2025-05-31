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
export { generateSchema, toJsonLd, detectPageType } from './engine.ts';
export type { SchemaContext } from './engine.ts';

// Configuration exports for customization
export { SCHEMA_CONFIG, SCHEMA_MAPPINGS } from './config.ts';
export type { SchemaConfig, PageType } from './config.ts';

/**
 * Feature metadata
 */
export const SCHEMA_FEATURE = {
  name: 'Schema.org Auto-Generator',
  version: '1.0.0',
  description: 'Automatic Schema.org structured data generation for Astro',
  author: 'Matías Cappato',
  reusable: true
} as const;
