/**
 * AI Metadata Feature - Public API
 * 
 * Centralized exports for AI metadata system with
 * plug & play architecture and comprehensive TypeScript support.
 * 
 * @example Basic usage:
 * ```typescript
 * import { AIMetadata, AIMetadataManager } from '../features/ai-metadata';
 * ```
 * 
 * @example Advanced usage:
 * ```typescript
 * import { 
 *   AIMetadata, 
 *   AIMetadataManager,
 *   generateAIMetadataEndpoint,
 *   type AIMetadataProps 
 * } from '../features/ai-metadata';
 * ```
 */

// ============================================================================
// COMPONENTS
// ============================================================================

/** Main AI metadata component for Astro */
export { default as AIMetadata } from './components/AIMetadata.astro';

// ============================================================================
// ENGINE CLASSES
// ============================================================================

/** AI metadata manager class for programmatic usage */
export { AIMetadataManager } from './engine/ai-metadata-manager.ts';

// ============================================================================
// UTILITIES
// ============================================================================

export {
  validateAIMetadataProps,
  makeAbsoluteUrl,
  formatTags,
  generateMetaTagName,
  sanitizeTitle,
  sanitizeDescription,
  formatDateISO,
  createAIMetadataError,
  isValidUrl,
  isValidContentType,
  generateCacheControl,
  extractDomain,
  generateStructuredDataId,
  mergeAIMetadataConfig
} from './engine/utils.ts';

// ============================================================================
// ENDPOINT UTILITIES
// ============================================================================

export {
  generateAIMetadataResponse,
  generateAIMetadataHeaders,
  createAIMetadataEndpoint
} from './endpoints/ai-metadata-json.ts';

// ============================================================================
// TYPES
// ============================================================================

export type {
  AIContentType,
  AIActionType,
  SchemaType,
  AIMetadataProps,
  AIMetadataConfig,
  StructuredData,
  AIMetadataEndpointResponse,
  ValidationResult,
  IAIMetadataManager,
  SiteInfo,
  AIMetadataError,
  MetaTagResult,
  JsonLdResult
} from './engine/types.ts';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  AI_METADATA_CONFIG,
  META_TAG_NAMES,
  VALIDATION_RULES,
  ERROR_CODES,
  ERROR_MESSAGES,
  CACHE_CONFIG,
  TECHNICAL_INFO,
  AI_INSTRUCTIONS,
  FEATURE_METADATA
} from './engine/constants.ts';

// ============================================================================
// FEATURE METADATA
// ============================================================================

/** Feature information for documentation and tooling */
export const AI_METADATA_FEATURE = {
  name: 'ai-metadata',
  version: '1.0.0',
  description: 'AI-optimized metadata system with Schema.org support',
  author: 'system developer',
  
  /** Main exports for easy access */
  exports: {
    components: ['AIMetadata'],
    classes: ['AIMetadataManager'],
    utilities: [
      'validateAIMetadataProps',
      'generateAIMetadataResponse',
      'createAIMetadataEndpoint'
    ],
    types: [
      'AIMetadataProps',
      'AIMetadataConfig',
      'StructuredData'
    ]
  },
  
  /** Dependencies */
  dependencies: ['astro', 'typescript'],
  
  /** Peer dependencies */
  peerDependencies: [],
  
  /** Feature capabilities */
  capabilities: [
    'AI-optimized metadata generation',
    'Schema.org structured data',
    'Multi-platform compatibility',
    'TypeScript type safety',
    'Comprehensive validation',
    'Endpoint generation',
    'Cache optimization',
    'Error handling'
  ],
  
  /** Integration points */
  integrations: {
    layouts: ['MainLayout', 'PostLayout'],
    endpoints: ['/ai-metadata.json'],
    components: ['AIMetadata.astro']
  },
  
  /** Configuration */
  configuration: {
    required: ['title', 'description', 'type', 'url'],
    optional: ['datePublished', 'dateModified', 'tags', 'author', 'language'],
    configurable: ['AI_METADATA_CONFIG']
  }
} as const;
