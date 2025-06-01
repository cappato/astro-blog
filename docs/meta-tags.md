# Meta Tags

## Purpose
Unified meta tags management system that eliminates duplication between SEO components, centralizes Open Graph and Twitter Cards configuration, and provides consistent interface for all page types.

## Architecture
Single unified component that replaces SEOHead and SocialHead duplication with centralized META_TAGS_CONFIG.

## Files
- `src/components/seo/MetaTags.astro` - Unified meta tags component
- `src/config/site.ts` - META_TAGS_CONFIG centralized configuration
- `src/layouts/MainLayout.astro` - Home page integration
- `src/layouts/PostLayout.astro` - Blog post integration
- `src/components/layout/BaseLayout.astro` - Generic layout integration
- `src/pages/blog/index.astro` - Blog index integration
- `src/pages/blog/tag/[tag].astro` - Tag pages integration

## Usage

### Home Page
```astro
<MetaTags
  title={title}
  description={description}
  image={image ? { url: image, alt: imageAlt } : undefined}
  type={type}
  keywords={keywords}
  publishedDate={pubDate}
  modifiedDate={modDate}
/>
```

### Blog Posts
```astro
<MetaTags
  title={title}
  description={description}
  image={shareImage}
  type="article"
  publishedDate={date}
  modifiedDate={date}
  author={author}
  postId={postId}
/>
```

### Blog Index
```astro
<MetaTags
  title={title}
  description={description}
  image={{ url: "/images/blog-cover.webp", alt: "Blog de Matías Cappato" }}
  type="website"
  keywords={["blog", "desarrollo web", "programación"]}
/>
```

### Tag Pages
```astro
<MetaTags
  title={title}
  description={description}
  image={{ url: "/images/blog-cover.webp", alt: `Artículos sobre ${tag}` }}
  type="website"
  keywords={[tag, "blog", "desarrollo web"]}
/>
```

## Configuration

### META_TAGS_CONFIG
```typescript
export const META_TAGS_CONFIG = {
  defaultImage: '/images/og-default.webp',
  defaultImageAlt: 'Matías Cappato - Desarrollador Web',
  defaultKeywords: ['Matías Cappato', 'Desarrollador Web', 'Full Stack', ...],
  
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
    webp: { extension: '.webp', mimeType: 'image/webp' },
    jpeg: { extension: '-og-jpg.jpeg', mimeType: 'image/jpeg' }
  }
} as const;
```

### Props Interface
```typescript
interface Props {
  title: string;
  description: string;
  image?: { url: string; alt: string; width?: number; height?: number; };
  type?: 'website' | 'article';
  keywords?: string[];
  publishedDate?: Date;
  modifiedDate?: Date;
  author?: string;
  canonicalUrl?: string;
  twitterUsername?: string;
  postId?: string;
}
```

### Legacy Compatibility
```typescript
export const SEO_DEFAULTS = {
  defaultImage: META_TAGS_CONFIG.defaultImage,
  defaultImageAlt: META_TAGS_CONFIG.defaultImageAlt,
  defaultKeywords: META_TAGS_CONFIG.defaultKeywords,
  twitterCard: META_TAGS_CONFIG.twitter.card,
  ogType: META_TAGS_CONFIG.openGraph.type,
  ogSiteName: META_TAGS_CONFIG.openGraph.siteName
} as const;
```

## Generated Output

### Basic SEO Meta Tags
```html
<title>Page Title</title>
<meta name="description" content="Page description" />
<meta name="keywords" content="keyword1, keyword2, keyword3" />
<meta name="author" content="Matías Cappato" />
<link rel="canonical" href="https://cappato.dev/page" />
```

### Open Graph Meta Tags
```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://cappato.dev/page" />
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Page description" />
<meta property="og:site_name" content="Matías Cappato" />
<meta property="og:locale" content="es_ES" />
<meta property="og:image" content="https://cappato.dev/images/og-default.webp" />
<meta property="og:image:type" content="image/webp" />
<meta property="og:image:alt" content="Matías Cappato - Desarrollador Web" />
<meta property="og:image" content="https://cappato.dev/images/og-default-og-jpg.jpeg" />
<meta property="og:image:type" content="image/jpeg" />
```

### Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="https://cappato.dev/page" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Page description" />
<meta name="twitter:image" content="https://cappato.dev/images/og-default.webp" />
<meta name="twitter:image:alt" content="Matías Cappato - Desarrollador Web" />
<meta name="twitter:creator" content="@matiascappato" />
```

### Article-specific Meta Tags
```html
<meta property="article:published_time" content="2024-01-01T00:00:00.000Z" />
<meta property="article:modified_time" content="2024-01-01T00:00:00.000Z" />
<meta property="article:author" content="Matías Cappato" />
```

## Features

### Multiple Image Format Support
```typescript
// Automatic WebP + JPEG fallback generation
const jpegImageUrl = imageUrl.includes('-og.webp') 
  ? imageUrl.replace('-og.webp', META_TAGS_CONFIG.imageFormats.jpeg.extension)
  : imageUrl;
```

### URL Canonicalization
```typescript
// Automatic domain correction and canonical URL generation
const canonical = canonicalUrl 
  ? `${siteUrl}${canonicalUrl}` 
  : Astro.url.href.replace('matiascappato.com', 'cappato.dev');
```

### Image URL Validation
```typescript
// Secure image URL handling
const imageUrl = imageConfig.url.startsWith('http') 
  ? imageConfig.url 
  : new URL(imageConfig.url, siteUrl).toString();
```

## Extension

### Adding New Meta Tag Types
1. Extend the `Props` interface in `MetaTags.astro`
2. Add new meta tag generation logic
3. Update configuration in `META_TAGS_CONFIG` if needed

### Custom Image Formats
1. Add new format to `META_TAGS_CONFIG.imageFormats`
2. Update image URL generation logic
3. Add corresponding meta tags with proper MIME types

## AI Context
```yaml
feature_type: "meta_tags"
purpose: "seo_social_media_optimization"
input_sources: ["page_props", "site_config", "image_assets"]
output_formats: ["html_meta_tags", "open_graph", "twitter_cards"]
architecture: "unified_component_centralized_config"
eliminated_duplication: "SEOHead_SocialHead_merge"
security_features: ["url_canonicalization", "image_url_validation", "date_validation"]
backward_compatibility: "SEO_DEFAULTS_legacy"
dependencies: ["site_config", "social_links", "image_optimization"]
key_files: ["MetaTags.astro", "site.ts", "MainLayout.astro", "PostLayout.astro"]
```
