# Schema

## Purpose
Automatic Schema.org structured data generation for SEO optimization. Intelligently detects page types and generates appropriate JSON-LD markup with validation and error handling.

## Architecture
- **Auto-detection**: URL pattern matching with priority system
- **Content types**: 12+ supported schema types (WebSite, Blog, BlogPosting, CreativeWork, etc.)
- **Validation**: Required field checking with graceful fallbacks
- **Configuration**: Centralized in SCHEMA_CONFIG with intelligent site integration

## Files
- `src/features/schema/AutoSchema.astro` - Main component with auto-detection
- `src/features/schema/engine.ts` - Schema generation logic and validation
- `src/features/schema/config.ts` - Feature configuration with fallbacks
- `src/features/schema/types.ts` - TypeScript interfaces for all schemas
- `src/features/schema/utils.ts` - Internal utilities (URL handling, validation)
- `src/features/schema/index.ts` - Public API exports
- `src/features/schema/__tests__/schema.test.ts` - Comprehensive test suite (15 tests)
- `src/features/schema/scripts/validate-schemas.js` - Production validation script
- `src/features/schema/README.md` - Feature-specific documentation
- `src/config/site.ts` - SCHEMA_CONFIG centralized configuration

## Usage

### Basic (Auto-detection)
```astro
---
import { AutoSchema } from '../features/schema';
---
<head>
  <AutoSchema />
</head>
```

### Blog Posts
```astro
---
import { AutoSchema } from '../features/schema';
const { entry } = Astro.props;
---
<head>
  <AutoSchema post={entry} />
</head>
```

### Explicit Type
```astro
---
import { AutoSchema } from '../features/schema';
---
<head>
  <AutoSchema type="portfolio" />
</head>
```

### Advanced Usage
```astro
---
import { generateValidatedSchema, toJsonLd } from '../features/schema';

const schemas = generateValidatedSchema({
  url: Astro.url.href,
  post: entry,
  pageType: 'blog-post'
});
---
<script type="application/ld+json" is:inline set:html={toJsonLd(schemas)}></script>
```

## Configuration

### Supported Types
```typescript
const contentTypes = {
  website: 'WebSite',           // Home pages
  blog: 'Blog',                 // Blog index
  'blog-post': 'BlogPosting',   // Individual posts
  portfolio: 'CreativeWork',    // Portfolio items
  project: 'SoftwareApplication', // Software projects
  course: 'Course',             // Educational content
  event: 'Event',               // Events/workshops
  product: 'Product',           // Products/services
  organization: 'Organization', // Company pages
  person: 'Person',             // About/profile pages
  article: 'Article'            // General articles
};
```

### Auto-detection Patterns
```typescript
const patterns = {
  'home': ['^/$', '^https?://[^/]+/$'],
  'blog-post': ['/blog/', '/posts/'],
  'blog-index': ['/blog$', '/posts$'],
  'portfolio': ['/portfolio/', '/work/'],
  'project': ['/projects/', '/project/'],
  'course': ['/courses/', '/course/'],
  'event': ['/events/', '/event/'],
  'about': ['/about', '/bio', '/profile']
};
```

### Priority Order
```typescript
const priority = [
  'blog-post',    // Highest (has post data)
  'home',         // Home page patterns
  'portfolio',    // Portfolio patterns
  'project',      // Project patterns
  'course',       // Course patterns
  'event',        // Event patterns
  'blog-index',   // Blog index patterns
  'about',        // About page patterns
  'website'       // Default fallback
];
```

## Extension

### Adding New Types
1. Add to `SCHEMA_CONFIG.contentTypes`
2. Define required fields in `SCHEMA_CONFIG.requiredFields`
3. Add detection pattern to `SCHEMA_CONFIG.autoDetection.patterns`
4. Create generator function in `engine.ts`
5. Add case to `generateSchema()` switch

### Custom Patterns
```typescript
autoDetection: {
  patterns: {
    'custom-type': ['/custom/', '/special/'],
    'landing-page': ['/landing/', '/lp/']
  },
  priority: ['blog-post', 'custom-type', 'landing-page', 'home', ...]
}
```

## AI Context
```yaml
feature_type: "schema_generation"
purpose: "seo_structured_data"
input_sources: ["url_patterns", "post_data", "page_context"]
output_format: "json_ld"
content_types: ["website", "blog", "blog_post", "portfolio", "project", "course", "event", "product", "organization", "person", "article"]
architecture: "auto_detection_with_validation"
configuration: "centralized_with_fallbacks"
validation: "required_fields_automatic"
error_handling: "graceful_degradation"
dependencies: ["astro_content_collections", "typescript"]
key_files: ["AutoSchema.astro", "engine.ts", "config.ts", "types.ts", "utils.ts"]
```
