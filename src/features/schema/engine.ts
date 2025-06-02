/**
 * Schema.org Generation Engine
 * Simplified but modular approach for generating structured data
 */

import type { CollectionEntry } from 'astro:content';
import { SCHEMA_CONFIG, type PageType } from './config.ts';

/**
 * Context for schema generation
 */
export interface SchemaContext {
  url: string;
  post?: CollectionEntry<'blog'>;
  pageType?: PageType;
}

/**
 * Enhanced auto-detection with intelligent pattern matching
 */
export function detectPageType(context: SchemaContext): PageType {
  const { url, post, pageType } = context;

  // If explicit type is provided, use it
  if (pageType) return pageType;

  // If post data is provided, it's a blog post
  if (post) return 'blog-post';

  // Use intelligent pattern matching based on URL
  const patterns = SCHEMA_CONFIG.autoDetection.patterns;
  const priority = SCHEMA_CONFIG.autoDetection.priority;

  for (const type of priority) {
    if (patterns[type as keyof typeof patterns]) {
      const typePatterns = patterns[type as keyof typeof patterns];
      for (const pattern of typePatterns) {
        const regex = new RegExp(pattern);
        if (regex.test(url)) {
          return type as PageType;
        }
      }
    }
  }

  // Default fallback to generic website for unknown URLs
  return 'website';
}

/**
 * Generate absolute URL
 */
function toAbsoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const baseUrl = SCHEMA_CONFIG.site.url;

  // Handle root path
  if (path === '/' || path === '') {
    return baseUrl;
  }

  // Ensure path starts with / and construct URL
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Generate Person schema (reusable across all schemas)
 */
function generatePersonSchema() {
  return {
    "@type": "Person",
    "name": SCHEMA_CONFIG.site.author,
    "url": SCHEMA_CONFIG.site.url,
    "image": toAbsoluteUrl(SCHEMA_CONFIG.defaults.profileImage),
    "jobTitle": "Desarrollador Web Full Stack",
    "sameAs": [
      `https://github.com/${SCHEMA_CONFIG.social.github}`,
      `https://linkedin.com/in/${SCHEMA_CONFIG.social.linkedin}`,
      `https://twitter.com/${SCHEMA_CONFIG.social.twitter.replace('@', '')}`
    ]
  };
}

/**
 * Generate Organization schema (reusable across all schemas)
 */
function generateOrganizationSchema() {
  return {
    "@type": "Organization",
    "name": SCHEMA_CONFIG.site.name,
    "url": SCHEMA_CONFIG.site.url,
    "logo": toAbsoluteUrl(SCHEMA_CONFIG.defaults.logo),
    "sameAs": [
      `https://github.com/${SCHEMA_CONFIG.social.github}`,
      `https://linkedin.com/in/${SCHEMA_CONFIG.social.linkedin}`
    ]
  };
}

/**
 * Generate WebSite schema for home page
 */
export function getHomeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SCHEMA_CONFIG.site.name,
    "url": SCHEMA_CONFIG.site.url,
    "description": SCHEMA_CONFIG.site.description,
    "inLanguage": SCHEMA_CONFIG.site.language,
    "author": generatePersonSchema()
  };
}

/**
 * Generate Blog schema for blog index
 */
export function getBlogIndexSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": `Blog de ${SCHEMA_CONFIG.site.author}`,
    "url": toAbsoluteUrl(SCHEMA_CONFIG.paths.blog),
    "description": "Artículos sobre desarrollo web y tecnología",
    "inLanguage": SCHEMA_CONFIG.site.language,
    "author": generatePersonSchema()
  };
}

/**
 * Generate BlogPosting schema for individual posts
 */
export function getBlogPostSchema(post: CollectionEntry<'blog'>, postUrl: string) {
  const { title, description, date, author, image, tags } = post.data;
  const updatedDate = (post.data as any).updatedDate; // Optional field
  
  // Calculate word count automatically
  const wordCount = post.body
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  // Use post image if available, fallback to default
  const postImage = image
    ? toAbsoluteUrl(typeof image === 'string' ? image : image.url)
    : toAbsoluteUrl(SCHEMA_CONFIG.defaults.image);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": postImage,
    "datePublished": new Date(date).toISOString(),
    "dateModified": updatedDate 
      ? new Date(updatedDate).toISOString() 
      : new Date(date).toISOString(),
    "author": {
      ...generatePersonSchema(),
      "name": author || SCHEMA_CONFIG.site.author
    },
    "publisher": generateOrganizationSchema(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": toAbsoluteUrl(postUrl)
    },
    "url": toAbsoluteUrl(postUrl),
    "inLanguage": SCHEMA_CONFIG.site.language,
    "wordCount": wordCount,
    "keywords": tags?.join(', ') || ''
  };
}

/**
 * Enhanced schema generation with support for all content types
 */
export function generateSchema(context: SchemaContext) {
  const pageType = context.pageType || detectPageType(context);

  try {
    switch (pageType) {
      case 'home':
      case 'website':
        return [getHomeSchema()];

      case 'blog-index':
        return [getBlogIndexSchema()];

      case 'blog-post':
        if (!context.post) {
          console.warn('Schema: blog-post type requires post data');
          return [];
        }
        return [getBlogPostSchema(context.post, context.url)];

      case 'portfolio':
        return [getPortfolioSchema(context.url)];

      case 'project':
        return [getProjectSchema(context.url)];

      case 'course':
        return [getCourseSchema(context.url)];

      case 'event':
        return [getEventSchema(context.url)];

      case 'product':
        return [getProductSchema(context.url)];

      case 'organization':
        return [getOrganizationSchema()];

      case 'person':
        return [getPersonSchema()];

      case 'article':
        return [getArticleSchema(context.url)];

      default:
        console.warn(`Schema: Unknown page type: ${pageType}, falling back to generic WebSite schema`);
        return [getHomeSchema()];
    }
  } catch (error) {
    console.error('Schema: Error generating schemas:', error);
    return [];
  }
}

/**
 * Generate Portfolio schema for creative work pages
 */
export function getPortfolioSchema(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": `Portfolio - ${SCHEMA_CONFIG.site.author}`,
    "url": toAbsoluteUrl(url),
    "description": "Portfolio showcasing creative and technical projects",
    "author": generatePersonSchema(),
    "inLanguage": SCHEMA_CONFIG.site.language,
    "creator": generatePersonSchema()
  };
}

/**
 * Generate Project schema for software projects
 */
export function getProjectSchema(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Project",
    "url": toAbsoluteUrl(url),
    "description": "Software development project",
    "author": generatePersonSchema(),
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "inLanguage": SCHEMA_CONFIG.site.language
  };
}

/**
 * Generate Course schema for educational content
 */
export function getCourseSchema(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Course",
    "url": toAbsoluteUrl(url),
    "description": "Educational course content",
    "provider": generateOrganizationSchema(),
    "instructor": generatePersonSchema(),
    "inLanguage": SCHEMA_CONFIG.site.language
  };
}

/**
 * Generate Event schema for events and workshops
 */
export function getEventSchema(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Event",
    "url": toAbsoluteUrl(url),
    "description": "Event or workshop",
    "organizer": generatePersonSchema(),
    "startDate": new Date().toISOString(),
    "inLanguage": SCHEMA_CONFIG.site.language
  };
}

/**
 * Generate Product schema for products or services
 */
export function getProductSchema(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Product",
    "url": toAbsoluteUrl(url),
    "description": "Product or service offering",
    "brand": generateOrganizationSchema(),
    "manufacturer": generatePersonSchema()
  };
}

/**
 * Generate Article schema for general articles
 */
export function getArticleSchema(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Article",
    "url": toAbsoluteUrl(url),
    "description": "Article content",
    "author": generatePersonSchema(),
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "inLanguage": SCHEMA_CONFIG.site.language
  };
}

/**
 * Convert schemas to JSON-LD string
 */
export function toJsonLd(schemas: any[]): string {
  return JSON.stringify(schemas, null, 0);
}

/**
 * Validate schema against required fields
 */
export function validateSchema(schema: any, schemaType: string): boolean {
  const requiredFields = SCHEMA_CONFIG.requiredFields[schemaType as keyof typeof SCHEMA_CONFIG.requiredFields];

  if (!requiredFields) {
    console.warn(`Schema: No required fields defined for type: ${schemaType}`);
    return true;
  }

  for (const field of requiredFields) {
    if (!schema[field]) {
      console.warn(`Schema: Missing required field '${field}' for type '${schemaType}'`);
      return false;
    }
  }

  return true;
}

/**
 * Enhanced schema generation with validation
 */
export function generateValidatedSchema(context: SchemaContext) {
  const schemas = generateSchema(context);
  const pageType = context.pageType || detectPageType(context);
  const schemaType = SCHEMA_CONFIG.contentTypes[pageType as keyof typeof SCHEMA_CONFIG.contentTypes];

  // Validate each schema
  const validatedSchemas = schemas.filter(schema => {
    const isValid = validateSchema(schema, schemaType);
    if (!isValid) {
      console.warn(`Schema: Validation failed for ${schemaType} schema`);
    }
    return isValid;
  });

  return validatedSchemas;
}
