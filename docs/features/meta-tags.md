# Meta Tags Feature

## Core Purpose
Framework-agnostic meta tag generation system with comprehensive SEO optimization, URL validation, and image processing capabilities.

## Architecture

### Modular Structure
```
src/features/meta-tags/
├── engine/
│   ├── types.ts          # TypeScript definitions and constants
│   ├── validator.ts      # URL, image, and content validation
│   └── generator.ts      # Meta tag generation engine
├── components/
│   ├── MetaTags.astro    # Astro component wrapper
│   └── index.ts          # Component exports
├── __tests__/
│   └── meta-tags.test.ts # Comprehensive test suite (30 tests)
└── index.ts              # Public API and utilities
```

### Core Components

#### MetaTagGenerator
- **Purpose**: Generate SEO-optimized meta tags
- **Features**: Basic SEO, Open Graph, Twitter Cards, Article tags
- **Validation**: Built-in content and URL validation
- **Configuration**: Customizable rules and defaults

#### MetaTagValidator  
- **Purpose**: Validate URLs, images, dates, and content
- **Features**: Legacy domain correction, image format handling
- **Rules**: Configurable length limits and requirements
- **Error Handling**: Detailed validation messages

## Specifications

### Meta Tag Types
- **Basic SEO**: title, description, keywords, author, robots
- **Open Graph**: og:title, og:description, og:image, og:url, og:type
- **Twitter Cards**: twitter:card, twitter:title, twitter:description, twitter:image
- **Article Tags**: article:published_time, article:author, article:tag

### Validation Rules
- **Title**: 10-60 characters
- **Description**: 50-160 characters  
- **URLs**: HTTPS enforcement, domain correction
- **Images**: WebP/JPEG format support, dimension validation
- **Dates**: Chronological validation, future date prevention

### Configuration Options
```typescript
interface MetaTagConfig {
  siteName: string;
  defaultAuthor: string;
  defaultImage: string;
  twitterHandle: string;
  imageFormats: { webp: string; jpeg: string };
}
```

## Components

### MetaTags.astro
```astro
---
import { generateMetaTags } from '../index';
const { metaTags, linkTags } = generateMetaTags(Astro.props, Astro.site);
---
{metaTags.map(tag => <meta {...tag} />)}
{linkTags.map(tag => <link {...tag} />)}
```

### Usage Examples
```typescript
// Simple usage
import { generateMetaTags } from '@features/meta-tags';
const result = generateMetaTags({
  title: 'Page Title',
  description: 'Page description'
}, 'https://example.com');

// Advanced usage with validation
import { MetaTagGenerator } from '@features/meta-tags';
const generator = new MetaTagGenerator({
  siteUrl: 'https://example.com',
  strict: true
});
```

## Error Handling

### Validation Errors
- **Invalid URLs**: Automatic correction or fallback to site URL
- **Missing Images**: Fallback to default image configuration
- **Invalid Dates**: Error messages with specific validation failures
- **Content Length**: Warnings for SEO-suboptimal lengths

### Strict Mode
- **Enabled**: Throws errors for validation failures
- **Disabled**: Returns warnings and applies fallbacks

## AI Context

### Purpose
Generate SEO-optimized meta tags for web pages with comprehensive validation and error handling.

### Key Functions
- `generateMetaTags()`: Main generation function
- `generateArticleMetaTags()`: Article-specific tags
- `validateCanonicalUrl()`: URL validation and normalization
- `validateImage()`: Image URL and format validation

### Migration Status
- **From**: `src/components/seo/MetaTags.astro`
- **To**: `src/features/meta-tags/`
- **Status**: Complete ✅
- **Tests**: 30/30 passing ✅
- **Build**: ✅ Successful
- **Dev**: ✅ Working
- **Preview**: ✅ Working
- **Imports Updated**: ✅ All layouts migrated
- **Backward Compatible**: Yes ✅

### Integration Points
- **Layouts**: MainLayout, PostLayout, BaseLayout (✅ Updated imports)
- **Pages**: All pages requiring SEO meta tags (✅ Updated imports)
- **Build**: Integrated with Astro build process (✅ Tested)
- **Testing**: Comprehensive test coverage with Vitest (✅ 30/30 passing)

### Updated Files
- `src/layouts/MainLayout.astro` - ✅ Import updated
- `src/layouts/PostLayout.astro` - ✅ Import updated
- `src/components/layout/BaseLayout.astro` - ✅ Import updated
- `src/pages/blog/index.astro` - ✅ Import updated
- `src/pages/blog/tag/[tag].astro` - ✅ Import updated
