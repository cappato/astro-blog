/**
 * AI Metadata Feature - Type Definitions
 * 
 * Comprehensive TypeScript types for AI metadata system
 * with strict typing and validation support.
 */

/** Supported content types for AI metadata */
export type AIContentType = 'website' | 'article' | 'profile' | 'blog';

/** Supported action types for Schema.org */
export type AIActionType = 'ReadAction' | 'ViewAction' | 'SearchAction';

/** Supported Schema.org types */
export type SchemaType = 'WebSite' | 'BlogPosting' | 'Person' | 'Blog';

/** AI Metadata component props */
export interface AIMetadataProps {
  readonly title: string;
  readonly description: string;
  readonly type: AIContentType;
  readonly url: string;
  readonly datePublished?: Date;
  readonly dateModified?: Date;
  readonly tags?: readonly string[];
  readonly author?: string;
  readonly language?: string;
}

/** AI Metadata configuration interface */
export interface AIMetadataConfig {
  readonly language: string;
  readonly schemaContext: string;
  readonly isAccessibleForFree: boolean;
  readonly metadataFilePath: string;
  readonly metaTagPrefix: string;
  readonly author: {
    readonly type: string;
    readonly name: string;
    readonly url: string;
  };
  readonly actionTypes: {
    readonly read: AIActionType;
    readonly view: AIActionType;
    readonly search: AIActionType;
  };
  readonly contentTypes: {
    readonly website: SchemaType;
    readonly article: SchemaType;
    readonly profile: SchemaType;
    readonly blog: SchemaType;
  };
}

/** Schema.org structured data interface */
export interface StructuredData {
  readonly '@context': string;
  readonly '@type': SchemaType;
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly keywords?: string;
  readonly author: {
    readonly '@type': string;
    readonly name: string;
    readonly url: string;
  };
  readonly inLanguage: string;
  readonly isAccessibleForFree: boolean;
  readonly potentialAction: {
    readonly '@type': AIActionType;
    readonly target: string;
  };
  readonly datePublished?: string;
  readonly dateModified?: string;
  readonly mainEntityOfPage?: {
    readonly '@type': string;
    readonly '@id': string;
  };
}

/** AI metadata endpoint response interface */
export interface AIMetadataEndpointResponse {
  readonly '@context': string;
  readonly '@type': SchemaType;
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly author: {
    readonly '@type': string;
    readonly name: string;
    readonly url: string;
  };
  readonly inLanguage: string;
  readonly isAccessibleForFree: boolean;
  readonly dateModified: string;
  readonly technicalInfo?: {
    readonly framework: string;
    readonly language: string;
    readonly features: readonly string[];
  };
  readonly aiInstructions?: {
    readonly preferredCitation: string;
    readonly contentLicense: string;
    readonly crawlingPolicy: string;
    readonly primaryTopics: readonly string[];
  };
  readonly status?: string;
  readonly error?: string;
}

/** Validation result interface */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/** AI Metadata Manager interface */
export interface IAIMetadataManager {
  generateStructuredData(props: AIMetadataProps): StructuredData;
  getContentType(type: AIContentType): SchemaType;
  generateMetaTagName(suffix: string): string;
  validateProps(props: Partial<AIMetadataProps>): ValidationResult;
}

/** Site information interface for AI metadata */
export interface SiteInfo {
  readonly url: string;
  readonly title: string;
  readonly description: string;
  readonly author: {
    readonly name: string;
    readonly email: string;
  };
}

/** Error handling interface */
export interface AIMetadataError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

/** Meta tag generation result */
export interface MetaTagResult {
  readonly name: string;
  readonly content: string;
}

/** JSON-LD generation result */
export interface JsonLdResult {
  readonly success: boolean;
  readonly data?: StructuredData;
  readonly error?: AIMetadataError;
}
