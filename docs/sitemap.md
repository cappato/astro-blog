# Sitemap

## Purpose
Complete XML sitemap generation system for Astro that produces valid sitemaps with automatic draft filtering, robust validation, and centralized configuration. Provides SEO indexing through sitemap 0.9 standards with full search engine support.

## Architecture
Endpoint with testable utilities, shared filtering logic, and comprehensive validation.

## Files
- `src/pages/sitemap.xml.ts` - Sitemap endpoint with minimal delegation
- `src/utils/sitemap.ts` - Core sitemap generation logic and utilities
- `src/utils/shared/post-filters.ts` - Shared filtering logic (RSS + Sitemap)
- `src/pages/__tests__/sitemap.test.ts` - Comprehensive test suite (12 tests)
- `src/config/index.ts` - Site configuration and metadata
- `public/robots.txt` - Robots.txt with sitemap reference

## Usage

### Sitemap Endpoint
```typescript
// src/pages/sitemap.xml.ts
import { getCollection } from 'astro:content';
import { generateSitemap } from '../utils/sitemap.ts';
import { shouldIncludePost } from '../utils/shared/post-filters.ts';

export async function GET() {
  const blogEntries = await getCollection('blog', shouldIncludePost);

  return new Response(generateSitemap(blogEntries), {
    headers: { 'Content-Type': 'application/xml' }
  });
}
```

### Robots.txt Integration
```txt
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://cappato.dev/sitemap.xml
```

### Manual Sitemap Generation
```typescript
import { generateSitemap, validateSiteConfig } from '../utils/sitemap.ts';

// Validate configuration
validateSiteConfig(CONFIG.site);

// Generate sitemap
const sitemapXML = generateSitemap(validPosts);
```

## Configuration

### Sitemap Configuration
```typescript
const SITEMAP_CONFIG = {
  NAMESPACE: 'http://www.sitemaps.org/schemas/sitemap/0.9',
  CHANGEFREQ: {
    HOME: 'weekly',
    BLOG_INDEX: 'daily', 
    BLOG_POST: 'monthly'
  },
  PRIORITY: {
    HOME: '1.0',
    BLOG_INDEX: '0.9',
    BLOG_POST: '0.8'
  },
  BLOG_PATH: '/blog',
  STATIC_PAGES: [
    { path: '', changefreq: 'weekly', priority: '1.0' },
    { path: '/blog', changefreq: 'daily', priority: '0.9' }
  ]
} as const;
```

### Site Configuration
```typescript
export const CONFIG = {
  site: {
    url: 'https://cappato.dev',
    title: 'Matías Cappato',
    description: 'Desarrollador Web Full Stack...',
    author: 'Matías Cappato',
    language: 'es'
  }
} as const;
```

### Shared Post Filtering
```typescript
// Unified filtering logic (shared with RSS)
export function shouldIncludePost(post: CollectionEntry<'blog'>): boolean {
  return import.meta.env.PROD ? !post.data.draft : true;
}
```

## Sitemap Generation

### Main Generation Pipeline
```typescript
export function generateSitemap(posts: CollectionEntry<'blog'>[]): string {
  const { site } = CONFIG;
  
  // Validate site configuration
  validateSiteConfig(site);
  
  // Generate static pages and blog URLs with error handling
  const staticPages = generateStaticPages(site.url);
  const blogUrls = posts
    .map(post => {
      try {
        return generateBlogUrl(post, site.url);
      } catch (error) {
        console.warn(`Skipping invalid post ${post.slug}:`, error);
        return null;
      }
    })
    .filter(Boolean)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${SITEMAP_CONFIG.NAMESPACE}">
${staticPages}${blogUrls}</urlset>`;
}
```

### Static Pages Generation
```typescript
function generateStaticPages(siteUrl: string): string {
  const currentDate = new Date().toISOString().split('T')[0];

  return SITEMAP_CONFIG.STATIC_PAGES
    .map(page => {
      const url = escapeXML(`${siteUrl}${page.path}`);
      return `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    })
    .join('');
}
```

### Blog URL Generation
```typescript
function generateBlogUrl(post: CollectionEntry<'blog'>, siteUrl: string): string {
  // Validate required post fields
  validatePostData(post);

  const slug = post.data.slug || post.slug;
  const url = escapeXML(`${siteUrl}${SITEMAP_CONFIG.BLOG_PATH}/${slug}`);
  const lastmod = validateAndFormatDate(post.data.date, post.slug);

  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${SITEMAP_CONFIG.CHANGEFREQ.BLOG_POST}</changefreq>
    <priority>${SITEMAP_CONFIG.PRIORITY.BLOG_POST}</priority>
  </url>
`;
}
```

### Validation Functions
```typescript
// Site configuration validation
function validateSiteConfig(site: any): void {
  if (!site.url || typeof site.url !== 'string') {
    throw new Error('Site URL is required and must be a string');
  }
  
  try {
    new URL(site.url);
  } catch {
    throw new Error(`Site URL is not a valid URL: ${site.url}`);
  }
}

// Post data validation
function validatePostData(post: CollectionEntry<'blog'>): void {
  if (!post.data.title || typeof post.data.title !== 'string') {
    throw new Error(`Post ${post.slug} is missing required title`);
  }
  if (!post.data.date) {
    throw new Error(`Post ${post.slug} is missing required date`);
  }
  if (!post.slug || typeof post.slug !== 'string') {
    throw new Error(`Post has invalid slug: ${post.slug}`);
  }
}

// Date validation and formatting
function validateAndFormatDate(date: any, postSlug: string): string {
  const parsedDate = new Date(date);
  
  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Post ${postSlug} has invalid date: ${date}`);
  }
  
  return parsedDate.toISOString().split('T')[0];
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

### Sitemap XML Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cappato.dev</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://cappato.dev/blog</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://cappato.dev/blog/my-post</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## Extension

### Adding New Static Pages
1. Extend `SITEMAP_CONFIG.STATIC_PAGES` in `src/utils/sitemap.ts`
2. Add new page objects with path, changefreq, priority
3. Update tests in `src/pages/__tests__/sitemap.test.ts`

### Custom URL Patterns
1. Modify `generateBlogUrl()` function for custom slug patterns
2. Add validation for new URL formats
3. Update XML escaping if needed

### Dynamic Priority Calculation
```typescript
// Custom priority based on post metadata
function calculatePostPriority(post: CollectionEntry<'blog'>): string {
  if (post.data.featured) return '0.9';
  if (post.data.tags?.includes('tutorial')) return '0.8';
  return '0.7';
}
```

### Multiple Content Types
```typescript
// Support for different content collections
export async function generateFullSitemap() {
  const blogPosts = await getCollection('blog', shouldIncludePost);
  const projects = await getCollection('projects');
  
  return generateSitemap([...blogPosts, ...projects]);
}
```

## AI Context
```yaml
feature_type: "seo_automation"
purpose: "sitemap_generation"
input_sources: ["astro_content_collections", "blog_posts", "site_config"]
output_format: "sitemap_xml"
architecture: "endpoint_utilities_shared_filters"
standards_compliance: "sitemap_0.9_spec"
security_features: ["xml_injection_protection", "url_validation", "character_sanitization"]
performance_impact: "minimal_on_demand"
test_coverage: "12_comprehensive_tests"
shared_logic: "shouldIncludePost_with_rss"
dependencies: ["astro:content", "site_config", "shared_post_filters"]
key_files: ["sitemap.xml.ts", "sitemap.ts", "post-filters.ts", "sitemap.test.ts", "index.ts"]
```
