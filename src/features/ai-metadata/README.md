# AI Metadata Feature

## Overview
Comprehensive AI metadata system with Schema.org support, designed for optimal AI assistant and search engine understanding. Provides both component-based and programmatic APIs for flexible integration.

## Features
- ✅ **AI-optimized metadata** generation
- ✅ **Schema.org structured data** with JSON-LD
- ✅ **Multi-platform compatibility** (OpenAI, Claude, etc.)
- ✅ **TypeScript type safety** with comprehensive interfaces
- ✅ **Validation system** with detailed error reporting
- ✅ **Endpoint generation** for AI metadata API
- ✅ **Cache optimization** with configurable headers
- ✅ **Error handling** with graceful fallbacks

## Quick Start

### Basic Component Usage
```astro
---
import { AIMetadata } from '../features/ai-metadata';
---
<AIMetadata
  title="Page Title"
  description="Page description for AI understanding"
  type="website"
  url="/page"
/>
```

### Blog Post Usage
```astro
---
import { AIMetadata } from '../features/ai-metadata';
---
<AIMetadata
  title={post.title}
  description={post.description}
  type="article"
  url={`/blog/${post.slug}`}
  datePublished={post.date}
  dateModified={post.updatedDate}
  tags={post.tags}
  author={post.author}
/>
```

### Programmatic Usage
```typescript
import { AIMetadataManager } from '../features/ai-metadata';

const manager = new AIMetadataManager({}, siteInfo);
const structuredData = manager.generateStructuredData({
  title: 'Article Title',
  description: 'Article description',
  type: 'article',
  url: '/article'
});
```

## API Reference

### Components

#### AIMetadata
Main component for generating AI metadata in Astro pages.

**Props:**
- `title: string` - Page/content title (required)
- `description: string` - Content description (required)
- `type: AIContentType` - Content type: 'website' | 'article' | 'profile' | 'blog' (required)
- `url: string` - Page URL (required)
- `datePublished?: Date` - Publication date (optional)
- `dateModified?: Date` - Last modification date (optional)
- `tags?: string[]` - Content tags/keywords (optional)
- `author?: string` - Content author (optional)
- `language?: string` - Content language (optional, defaults to site config)

### Classes

#### AIMetadataManager
Core manager class for programmatic AI metadata generation.

**Constructor:**
```typescript
new AIMetadataManager(config?: Partial<AIMetadataConfig>, siteInfo: SiteInfo)
```

**Methods:**
- `generateStructuredData(props: AIMetadataProps): StructuredData`
- `generateMetaTags(props: AIMetadataProps): MetaTagResult[]`
- `generateJsonLd(props: AIMetadataProps): string`
- `validateProps(props: Partial<AIMetadataProps>): ValidationResult`
- `getContentType(type: AIContentType): SchemaType`

### Utilities

#### Validation
```typescript
import { validateAIMetadataProps } from '../features/ai-metadata';

const result = validateAIMetadataProps(props);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

#### URL Processing
```typescript
import { makeAbsoluteUrl } from '../features/ai-metadata';

const absoluteUrl = makeAbsoluteUrl('/relative-path', siteInfo);
```

#### Tag Formatting
```typescript
import { formatTags } from '../features/ai-metadata';

const formattedTags = formatTags(['tag1', 'tag2', 'tag3']);
// Result: "tag1, tag2, tag3"
```

### Endpoint Generation

#### Create AI Metadata Endpoint
```typescript
// src/pages/ai-metadata.json.ts
import { createAIMetadataEndpoint } from '../features/ai-metadata';
import { SITE } from '../config/site.ts';

const siteInfo = {
  url: SITE.url,
  title: SITE.title,
  description: SITE.description,
  author: SITE.author
};

export const { GET, OPTIONS } = createAIMetadataEndpoint(siteInfo);
```

## Configuration

### Default Configuration
```typescript
export const AI_METADATA_CONFIG = {
  language: 'es',
  schemaContext: 'https://schema.org',
  isAccessibleForFree: true,
  metadataFilePath: '/ai-metadata.json',
  metaTagPrefix: 'ai:',
  author: {
    type: 'Person',
    name: 'Site Author',
    url: '/about'
  }
};
```

### Custom Configuration
```typescript
import { AIMetadataManager } from '../features/ai-metadata';

const customConfig = {
  language: 'en',
  metaTagPrefix: 'custom:',
  author: {
    type: 'Person',
    name: 'Custom Author',
    url: '/custom-about'
  }
};

const manager = new AIMetadataManager(customConfig, siteInfo);
```

## Types

### Core Types
```typescript
type AIContentType = 'website' | 'article' | 'profile' | 'blog';
type SchemaType = 'WebSite' | 'BlogPosting' | 'Person' | 'Blog';

interface AIMetadataProps {
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
```

## Generated Output

### Meta Tags
```html
<meta name="ai:description" content="Page description" />
<meta name="ai:type" content="article" />
<meta name="ai:author" content="Author Name" />
<meta name="ai:keywords" content="tag1, tag2, tag3" />
<meta name="ai:published" content="2024-01-01T00:00:00.000Z" />
<meta name="ai:modified" content="2024-01-02T00:00:00.000Z" />
```

### Structured Data (JSON-LD)
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "name": "Article Title",
  "description": "Article description",
  "url": "https://site.com/article",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://site.com/about"
  },
  "datePublished": "2024-01-01T00:00:00.000Z",
  "dateModified": "2024-01-02T00:00:00.000Z"
}
```

### AI Metadata Endpoint
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Site Name",
  "description": "Site description",
  "technicalInfo": {
    "framework": "Astro",
    "language": "TypeScript",
    "features": ["Static Site Generation", "Blog System", "SEO Optimization"]
  },
  "aiInstructions": {
    "preferredCitation": "Author Name - Site Name",
    "contentLicense": "All rights reserved",
    "crawlingPolicy": "Allowed for AI training with attribution"
  }
}
```

## Testing

### Run Tests
```bash
npm run test -- ai-metadata
```

### Test Coverage
- ✅ Validation functions
- ✅ URL processing utilities
- ✅ AIMetadataManager class
- ✅ Endpoint generation
- ✅ Error handling
- ✅ Type validation

## Integration

### In Layouts
```astro
---
// src/layouts/MainLayout.astro
import { AIMetadata } from '../features/ai-metadata';
---
<head>
  <AIMetadata
    title={title}
    description={description}
    type="website"
    url={Astro.url.pathname}
  />
</head>
```

### In Blog Posts
```astro
---
// src/layouts/PostLayout.astro
import { AIMetadata } from '../features/ai-metadata';
---
<head>
  <AIMetadata
    title={frontmatter.title}
    description={frontmatter.description}
    type="article"
    url={`/blog/${frontmatter.slug}`}
    datePublished={frontmatter.date}
    tags={frontmatter.tags}
  />
</head>
```

## Migration

### From Legacy System
```diff
- import AIMetadata from '../components/seo/AIMetadata.astro';
+ import { AIMetadata } from '../features/ai-metadata';

- import { AI_METADATA_CONFIG } from '../config/site.ts';
+ import { AI_METADATA_CONFIG } from '../features/ai-metadata';
```

## Error Handling

### Validation Errors
```typescript
try {
  const structuredData = manager.generateStructuredData(props);
} catch (error) {
  console.error('AI metadata generation failed:', error.message);
}
```

### Graceful Fallbacks
The system provides graceful fallbacks for:
- Invalid props → Validation errors with detailed messages
- Missing configuration → Default values
- Network errors → Cached responses
- Invalid dates → Current timestamp

## Performance

### Caching
- ✅ **Success responses**: 1 hour cache
- ✅ **Error responses**: 5 minutes cache
- ✅ **Public caching**: Enabled for CDN optimization
- ✅ **CORS headers**: Configured for cross-origin access

### Optimization
- ✅ **Lazy loading**: Components only render when needed
- ✅ **Validation caching**: Props validated once per render
- ✅ **JSON-LD minification**: Optimized structured data output
- ✅ **Header optimization**: Minimal response headers
