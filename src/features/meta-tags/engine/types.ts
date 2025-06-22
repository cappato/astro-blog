/**
 * Meta Tags Feature - Type Definitions
 * Framework-agnostic TypeScript interfaces for meta tag management
 */

/**
 * Basic meta tag structure
 */
export interface MetaTag {
  /** Meta tag name attribute */
  name?: string;
  /** Meta tag property attribute (for Open Graph) */
  property?: string;
  /** Meta tag content */
  content: string;
  /** Additional attributes */
  [key: string]: string | undefined;
}

/**
 * Link tag structure (for canonical, etc.)
 */
export interface LinkTag {
  /** Link relationship */
  rel: string;
  /** Link href */
  href: string;
  /** Link type */
  type?: string;
  /** Additional attributes */
  [key: string]: string | undefined;
}

/**
 * Image configuration for meta tags
 */
export interface MetaImage {
  /** Image URL */
  url: string;
  /** Image alt text */
  alt: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
}

/**
 * Meta tags input properties
 */
export interface MetaTagProps {
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Page image */
  image?: MetaImage;
  /** Page type */
  type?: 'website' | 'article';
  /** Page keywords */
  keywords?: string[];
  /** Published date */
  publishedDate?: Date;
  /** Modified date */
  modifiedDate?: Date;
  /** Author name */
  author?: string;
  /** Canonical URL */
  canonicalUrl?: string;
  /** Twitter username */
  twitterUsername?: string;
  /** Post ID for articles */
  postId?: string;
}

/**
 * Article-specific properties
 */
export interface ArticleProps extends MetaTagProps {
  type: 'article';
  publishedDate: Date;
  author: string;
  postId?: string;
  tags?: string[];
}

/**
 * Meta tags configuration
 */
export interface MetaTagConfig {
  /** Default image configuration */
  defaultImage: string;
  /** Default image alt text */
  defaultImageAlt: string;
  /** Default keywords */
  defaultKeywords: string[];
  /** Twitter configuration */
  twitter: {
    card: string;
    creator: string;
  };
  /** Open Graph configuration */
  openGraph: {
    type: string;
    siteName: string;
    locale: string;
  };
  /** Image format configuration */
  imageFormats: {
    webp: ImageFormat;
    jpeg: ImageFormat;
  };
}

/**
 * Image format configuration
 */
export interface ImageFormat {
  extension: string;
  mimeType: string;
}

/**
 * Validation rules
 */
export interface ValidationRules {
  /** Maximum title length */
  maxTitleLength: number;
  /** Maximum description length */
  maxDescriptionLength: number;
  /** Minimum description length */
  minDescriptionLength: number;
  /** Required image dimensions */
  requiredImageDimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Generated meta tags result
 */
export interface GeneratedMetaTags {
  /** Meta tags */
  metaTags: MetaTag[];
  /** Link tags */
  linkTags: LinkTag[];
  /** Validation warnings */
  warnings: string[];
}

/**
 * Meta tag generator options
 */
export interface GeneratorOptions {
  /** Site base URL */
  siteUrl: string;
  /** Custom configuration */
  config?: Partial<MetaTagConfig>;
  /** Validation rules */
  validation?: Partial<ValidationRules>;
  /** Enable strict validation */
  strict?: boolean;
}

/**
 * URL validation result
 */
export interface UrlValidationResult {
  /** Is URL valid */
  isValid: boolean;
  /** Normalized URL */
  normalizedUrl: string;
  /** Validation errors */
  errors: string[];
}

/**
 * Image validation result
 */
export interface ImageValidationResult {
  /** Is image valid */
  isValid: boolean;
  /** Processed image URLs */
  urls: {
    webp: string;
    jpeg: string;
  };
  /** Validation errors */
  errors: string[];
}

/**
 * Date validation result
 */
export interface DateValidationResult {
  /** Validated published date */
  publishedDate?: Date;
  /** Validated modified date */
  modifiedDate?: Date;
  /** Validation errors */
  errors: string[];
}

/**
 * Default meta tag configuration
 */
export const DEFAULT_META_CONFIG: MetaTagConfig = {
  defaultImage: '/images/og-default.webp',
  defaultImageAlt: 'Matías Cappato - Desarrollador Web',
  defaultKeywords: [
    'Matías Cappato',
    'Desarrollador Web',
    'Full Stack',
    'React',
    'TypeScript',
    'JavaScript',
    'Frontend',
    'Backend',
    'Blog',
    'Tutoriales',
    'Programación'
  ],
  twitter: {
    card: 'summary_large_image',
    creator: '@matiascappato'
  },
  openGraph: {
    type: 'website',
    siteName: 'Matías Cappato',
    locale: 'es_ES'
  },
  imageFormats: {
    webp: {
      extension: '.webp',
      mimeType: 'image/webp'
    },
    jpeg: {
      extension: '-og-jpg.jpeg',
      mimeType: 'image/jpeg'
    }
  }
} as const;

/**
 * Default validation rules
 * Note: maxTitleLength accounts for branding suffix ` | Matías Cappato` (18 chars)
 * So effective title limit is 78 - 18 = 60 chars for the base title
 */
export const DEFAULT_VALIDATION_RULES: ValidationRules = {
  maxTitleLength: 78, // Increased to accommodate branding suffix
  maxDescriptionLength: 160,
  minDescriptionLength: 50,
  requiredImageDimensions: {
    width: 1200,
    height: 630
  }
} as const;

/**
 * Meta tag types for categorization
 */
export enum MetaTagType {
  BASIC_SEO = 'basic_seo',
  OPEN_GRAPH = 'open_graph',
  TWITTER = 'twitter',
  ARTICLE = 'article',
  TECHNICAL = 'technical'
}

/**
 * Validation functions
 */

/**
 * Check if value is a valid meta tag type
 */
export function isValidMetaTagType(value: unknown): value is 'website' | 'article' {
  return value === 'website' || value === 'article';
}

/**
 * Validate meta tag configuration
 */
export function validateMetaConfig(config: Partial<MetaTagConfig>): void {
  if (config.defaultImage && typeof config.defaultImage !== 'string') {
    throw new Error('Default image must be a string');
  }
  
  if (config.defaultKeywords && !Array.isArray(config.defaultKeywords)) {
    throw new Error('Default keywords must be an array');
  }
  
  if (config.twitter?.card && typeof config.twitter.card !== 'string') {
    throw new Error('Twitter card must be a string');
  }
}

/**
 * Validate meta tag properties
 */
export function validateMetaProps(props: MetaTagProps): void {
  if (!props.title || typeof props.title !== 'string') {
    throw new Error('Title is required and must be a string');
  }
  
  if (!props.description || typeof props.description !== 'string') {
    throw new Error('Description is required and must be a string');
  }
  
  if (props.type && !isValidMetaTagType(props.type)) {
    throw new Error('Type must be "website" or "article"');
  }
}

/**
 * Environment detection utilities
 */

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Feature metadata for documentation and tooling
 */
export const FEATURE_INFO = {
  name: 'Meta Tags System',
  version: '1.0.0',
  description: 'Framework-agnostic meta tag generation with SEO optimization',
  dependencies: [],
  exports: [
    'MetaTagGenerator',
    'MetaTagValidator',
    'generateMetaTags',
    'validateMetaTags',
    'MetaTags'
  ],
  compatibility: {
    frameworks: ['Astro', 'React', 'Vue', 'Svelte', 'Vanilla JS'],
    environments: ['Browser', 'SSR', 'SSG']
  }
} as const;
