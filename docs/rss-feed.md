# RSS Feed

## Purpose
Complete RSS feed system for Astro that generates valid XML feeds with automatic draft filtering, excerpt generation, and autodiscovery. Provides content distribution for blog through RSS 2.0 standards with full feed reader support.

## Architecture
Endpoint with testable utilities, configuration-driven generation, and comprehensive validation.

## Files
- `src/pages/rss.xml.ts` - RSS endpoint with minimal delegation
- `src/utils/rss.ts` - Core RSS generation logic and utilities
- `src/utils/__tests__/rss.test.ts` - Comprehensive test suite (16 tests)
- `src/components/layout/BaseLayout.astro` - RSS autodiscovery link
- `src/config/site.ts` - RSS configuration and metadata

## Usage

### RSS Endpoint
```typescript
// src/pages/rss.xml.ts
import { getCollection } from 'astro:content';
import { generateRSSFeed, shouldIncludePost } from '../utils/rss.ts';

export async function GET() {
  const blogEntries = await getCollection('blog', shouldIncludePost);
  const sortedEntries = blogEntries.sort((a, b) => 
    new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return new Response(generateRSSFeed(sortedEntries), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
  });
}
```

### Autodiscovery Setup
```astro
<!-- In BaseLayout.astro <head> -->
<link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
```

### Manual RSS Generation
```typescript
import { generateRSSFeed, generateRSSItem, shouldIncludePost } from '../utils/rss.ts';

// Filter posts for production
const validPosts = allPosts.filter(shouldIncludePost);

// Generate full feed
const rssFeed = generateRSSFeed(validPosts);

// Generate single item
const rssItem = generateRSSItem(post);
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
feature_type: "content_syndication"
purpose: "rss_feed_generation"
input_sources: ["astro_content_collections", "blog_posts", "site_config"]
output_format: "rss_xml"
architecture: "endpoint_utilities_tests"
standards_compliance: "rss_2.0_spec"
security_features: ["xml_injection_protection", "url_validation", "character_sanitization"]
performance_impact: "minimal_on_demand"
test_coverage: "16_comprehensive_tests"
dependencies: ["astro:content", "site_config"]
key_files: ["rss.xml.ts", "rss.ts", "rss.test.ts", "BaseLayout.astro", "site.ts"]
```
