# RSS Feed

## Purpose
Framework-agnostic RSS 2.0 feed generation engine with comprehensive validation, error handling, and HTTP endpoint support. Provides complete RSS feed capabilities that can be used in any JavaScript/TypeScript project. Achieves RSS 2.0 standards compliance with Atom namespace support.

## Architecture
Modular TypeScript feature with plug & play portability. Completely framework-agnostic - works with any JavaScript project. Self-contained feature with comprehensive testing and standards compliance.

## Files
- `src/features/rss-feed/` - Complete modular feature
  - `index.ts` - Public API exports and feature metadata
  - `engine/` - Core RSS generation engine with TypeScript classes
    - `types.ts` - Complete TypeScript type definitions
    - `constants.ts` - RSS configuration constants and error codes
    - `rss-generator.ts` - Main RSS 2.0 generation engine
    - `utils.ts` - Utility functions for validation and processing
  - `endpoints/` - HTTP endpoint handling
    - `rss-endpoint.ts` - Framework-agnostic endpoint handler
  - `__tests__/rss-feed.test.ts` - Comprehensive test suite (30 tests)
  - `README.md` - Feature documentation
- `src/pages/rss.xml.ts` - RSS endpoint using legacy system
- `src/pages/rss-new.xml.ts` - RSS endpoint using modular feature (demo)

## Usage

### Framework-Agnostic Engine
This is a pure TypeScript/JavaScript RSS generation engine. Use it programmatically or via HTTP endpoints - no framework dependencies.

### Quick Start
```typescript
import { quickGenerateRSS, setupRSSFeed } from './features/rss-feed';

// Setup RSS configuration
const rssConfig = setupRSSFeed({
  site: {
    url: 'https://example.com',
    title: 'My Blog',
    description: 'My awesome blog',
    author: 'John Doe',
    language: 'en-US'
  }
});

// Generate RSS feed
const rssXML = quickGenerateRSS(blogPosts, rssConfig);
```

### Advanced Usage
```typescript
import { RSSGenerator, RSSEndpointHandler } from './features/rss-feed';

// Create RSS generator
const generator = new RSSGenerator(rssConfig);

// Generate feed with options
const result = generator.generateFeed(posts, {
  maxItems: 20,
  category: 'Technology',
  postFilter: (post) => !post.data.draft
});

// Handle HTTP requests
const handler = new RSSEndpointHandler(rssConfig);
const response = handler.handleRequest(posts);
```

### Astro Integration Example
```typescript
// src/pages/rss.xml.ts
import { getCollection } from 'astro:content';
import { quickHandleRSSRequest } from '../features/rss-feed';
import { CONFIG } from '../config';

export async function GET() {
  const posts = await getCollection('blog');
  const response = quickHandleRSSRequest(posts, CONFIG);

  return new Response(response.body, {
    headers: response.headers,
    status: response.status
  });
}
```

## Configuration

### RSS Configuration
```typescript
export const BLOG_CONFIG = {
  excerptLength: 160,
  rss: {
    enabled: true,
    title: `${SITE_INFO.title} - Blog`,
    description: 'Últimos artículos sobre desarrollo web y tecnología',
    feedUrl: `${SITE_INFO.url}/rss.xml`
  }
} as const;

const RSS_CONFIG = {
  FEED_PATH: '/rss.xml',
  TTL: 60, // minutes
  GENERATOR: `Astro v${process.env.npm_package_dependencies_astro || '5.8.0'}`,
  LANGUAGE: 'es'
} as const;
```

### Post Filtering
```typescript
// Environment-aware filtering (same as sitemap)
export function shouldIncludePost(post: CollectionEntry<'blog'>): boolean {
  return import.meta.env.PROD ? !post.data.draft : true;
}
```

## RSS Generation

### Main Generation Pipeline
```typescript
export function generateRSSFeed(posts: CollectionEntry<'blog'>[]): string {
  const buildDate = new Date().toUTCString();
  const lastBuildDate = posts.length > 0 ? new Date(posts[0].data.date).toUTCString() : buildDate;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXML(BLOG_CONFIG.rss.title)}</title>
    <description>${escapeXML(BLOG_CONFIG.rss.description)}</description>
    <link>${SITE_INFO.url}</link>
    <language>${RSS_CONFIG.LANGUAGE}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <ttl>${RSS_CONFIG.TTL}</ttl>
    <generator>${RSS_CONFIG.GENERATOR}</generator>
    <atom:link href="${BLOG_CONFIG.rss.feedUrl}" rel="self" type="application/rss+xml" />
    
    ${posts.map(post => generateRSSItem(post)).join('\n')}
  </channel>
</rss>`;
}
```

### RSS Item Generation
```typescript
export function generateRSSItem(post: CollectionEntry<'blog'>): string {
  const postUrl = `${SITE_INFO.url}/blog/${post.slug}`;
  const pubDate = new Date(post.data.date).toUTCString();
  const description = post.data.description || generateExcerpt(post.body);
  
  return `    <item>
      <title>${escapeXML(post.data.title)}</title>
      <description>${escapeXML(description)}</description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXML(SITE_INFO.author.email)} (${escapeXML(SITE_INFO.author.name)})</author>
      <category>${escapeXML(post.data.tags?.[0] || 'General')}</category>
    </item>`;
}
```

### Automatic Excerpt Generation
```typescript
function generateExcerpt(content: string): string {
  const plainText = content
    .replace(/^---[\s\S]*?---/, '') // Remove frontmatter
    .replace(/#{1,6}\s+/g, '') // Headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/`(.*?)`/g, '$1') // Inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/!\[.*?\]\(.*?\)/g, '') // Images
    .replace(/\n+/g, ' ') // Multiple newlines to space
    .trim();
  
  return plainText.length <= BLOG_CONFIG.excerptLength 
    ? plainText 
    : plainText.slice(0, BLOG_CONFIG.excerptLength - 3) + '...';
}
```

### XML Security
```typescript
function escapeXML(text: string | undefined): string {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')     // Must be first
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Control chars
}
```

## Generated Output

### RSS Feed Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Matías Cappato - Blog</title>
    <description>Últimos artículos sobre desarrollo web y tecnología</description>
    <link>https://cappato.dev</link>
    <language>es</language>
    <lastBuildDate>Mon, 01 Jan 2024 00:00:00 GMT</lastBuildDate>
    <ttl>60</ttl>
    <generator>Astro v5.8.0</generator>
    <atom:link href="https://cappato.dev/rss.xml" rel="self" type="application/rss+xml" />
    
    <item>
      <title>My Blog Post</title>
      <description>Post description or auto-generated excerpt...</description>
      <link>https://cappato.dev/blog/my-post</link>
      <guid isPermaLink="true">https://cappato.dev/blog/my-post</guid>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
      <author>matias@cappato.dev (Matías Cappato)</author>
      <category>Web Development</category>
    </item>
  </channel>
</rss>
```

## Extension

### Adding Custom Fields
1. Extend `generateRSSItem()` function in `src/utils/rss.ts`
2. Add new XML elements (categories, enclosures, etc.)
3. Update tests in `src/utils/__tests__/rss.test.ts`

### Multiple Feed Types
1. Create new endpoint: `src/pages/atom.xml.ts`
2. Implement `generateAtomFeed()` utility
3. Add autodiscovery links for both formats

### Custom Excerpt Logic
```typescript
// Custom excerpt generation
function generateCustomExcerpt(post: CollectionEntry<'blog'>): string {
  // Custom logic for specific post types
  if (post.data.type === 'tutorial') {
    return `Tutorial: ${post.data.description}`;
  }
  
  return generateExcerpt(post.body);
}
```

### Feed Validation
```typescript
// URL validation
function validateSiteUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new Error(`Site URL is not valid: ${url}`);
  }
}
```

## AI Context
```yaml
feature_type: "rss_feed_engine"
purpose: "framework_agnostic_rss_2_0_feed_generation"
input_sources: ["blog_posts", "site_configuration", "generation_options"]
output_formats: ["rss_xml", "http_response"]
processing_engine: "typescript_with_validation"
architecture: "pure_typescript_engine_plug_and_play"
framework_compatibility: "agnostic_works_with_any_javascript_project"
validation: ["rss_config_validation", "post_data_validation", "xml_escaping"]
standards_compliance: ["rss_2_0", "atom_namespace", "xml_1_0"]
test_coverage: "30_comprehensive_tests_framework_agnostic"
dependencies: ["none_pure_typescript"]
key_files: ["src/features/rss-feed/index.ts", "engine_directory", "endpoints_directory", "tests_directory"]
performance_features: ["efficient_filtering", "configurable_limits", "memory_conscious"]
security_features: ["xml_escaping", "input_validation", "url_validation"]
migration_status: "legacy_endpoint_maintained_for_backward_compatibility"
```
