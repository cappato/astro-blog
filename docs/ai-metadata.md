# AI Metadata

## Purpose
Comprehensive metadata system for AI assistants with automatic JSON-LD generation, AI-specific meta tags, and ai-metadata.json endpoint. Provides structured information about site content and configuration for AI crawlers and assistants.

## Architecture
Configuration-driven system that generates AI-optimized metadata through component integration and API endpoint.

## Files
- `src/components/seo/AIMetadata.astro` - Main AI metadata component with AIMetadataManager class
- `src/pages/ai-metadata.json.ts` - Comprehensive AI metadata endpoint with site statistics
- `src/config/site.ts` - AI_METADATA_CONFIG centralized configuration

## Usage

### Basic Page
```astro
---
import AIMetadata from '../components/seo/AIMetadata.astro';
---
<head>
  <AIMetadata
    title="My Page Title"
    description="Page description for AI"
    type="website"
    url="/my-page"
  />
</head>
```

### Blog Post
```astro
---
import AIMetadata from '../components/seo/AIMetadata.astro';
---
<head>
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
</head>
```

### Profile Page
```astro
---
import AIMetadata from '../components/seo/AIMetadata.astro';
---
<head>
  <AIMetadata
    title="About John Doe"
    description="Software developer and blogger"
    type="profile"
    url="/about"
    author="John Doe"
  />
</head>
```

## Configuration

### AI_METADATA_CONFIG
```typescript
export const AI_METADATA_CONFIG = {
  language: 'es',
  schemaContext: 'https://schema.org',
  isAccessibleForFree: true,
  metadataFilePath: '/ai-metadata.json',
  metaTagPrefix: 'ai:',
  author: {
    type: 'Person',
    name: SITE_INFO.author.name,
    url: `${SITE_INFO.url}/about`
  },
  actionTypes: {
    read: 'ReadAction',
    view: 'ViewAction',
    search: 'SearchAction'
  },
  contentTypes: {
    website: 'WebSite',
    article: 'BlogPosting',
    profile: 'Person',
    blog: 'Blog'
  }
} as const;
```

### Content Types
```typescript
interface Props {
  title: string;
  description: string;
  type: 'website' | 'article' | 'profile' | 'blog';
  url: string;
  datePublished?: Date;
  dateModified?: Date;
  tags?: string[];
  author?: string;
}
```

## Generated Output

### Meta Tags
```html
<meta name="ai:description" content="Page description for AI" />
<meta name="ai:keywords" content="javascript, web-dev" />
<meta name="ai:type" content="article" />
<meta name="ai:author" content="John Doe" />
<link rel="ai-metadata" href="/ai-metadata.json" />
```

### JSON-LD Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "name": "My Blog Post",
  "description": "Post description",
  "url": "https://example.com/blog/my-post",
  "keywords": "javascript, web-dev",
  "author": {
    "@type": "Person",
    "name": "John Doe",
    "url": "https://example.com/about"
  },
  "inLanguage": "es",
  "isAccessibleForFree": true,
  "datePublished": "2024-01-01T00:00:00.000Z",
  "dateModified": "2024-01-01T00:00:00.000Z",
  "potentialAction": {
    "@type": "ReadAction",
    "target": "https://example.com/blog/my-post"
  }
}
```

### AI Metadata Endpoint (/ai-metadata.json)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Site Name",
  "description": "Site description",
  "url": "https://example.com",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://example.com/about"
  },
  "inLanguage": "es",
  "isAccessibleForFree": true,
  "technicalInfo": {
    "framework": "Astro",
    "language": "TypeScript",
    "features": ["Static Site Generation", "Blog System", "SEO Optimization"]
  },
  "aiInstructions": {
    "preferredCitation": "Author Name - Site Name",
    "contentLicense": "All rights reserved",
    "crawlingPolicy": "Allowed for AI training with attribution",
    "primaryTopics": ["Web Development", "JavaScript", "TypeScript"]
  }
}
```

## Extension

### Adding New Content Types
1. Add to `AI_METADATA_CONFIG.contentTypes`
2. Update Props interface in AIMetadata.astro
3. Add specific handling in generateStructuredData() method

### Custom AI Instructions
```typescript
export const AI_METADATA_CONFIG = {
  // ... existing config
  customInstructions: {
    "crawlingFrequency": "weekly",
    "preferredSummaryLength": "150-200 words",
    "keywordDensity": "2-3%",
    "citationFormat": "APA"
  }
} as const;
```

### Multi-language Support
```astro
---
const language = Astro.currentLocale || 'es';
const aiConfig = {
  ...AI_METADATA_CONFIG,
  language: language
};
---
<AIMetadata 
  title={title}
  description={description}
  type="website"
  url={url}
  language={language}
/>
```

## AI Context
```yaml
feature_type: "ai_metadata_system"
purpose: "ai_optimization"
input_sources: ["site_config", "blog_posts", "page_metadata"]
output_formats: ["json_ld", "meta_tags", "ai_metadata_json"]
content_types: ["website", "article", "profile", "blog"]
architecture: "configuration_driven_manager"
schema_compliance: "schema_org_standard"
ai_optimization: ["structured_data", "semantic_markup", "crawling_instructions"]
caching_strategy: "1_hour_public_cache"
error_handling: "graceful_degradation"
dependencies: ["site_config", "blog_post_system"]
key_files: ["AIMetadata.astro", "ai-metadata.json.ts", "site.ts"]
```
