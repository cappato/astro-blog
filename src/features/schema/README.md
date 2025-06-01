# Schema.org Feature

Automatic Schema.org structured data generation for Astro projects with zero configuration.

## 🚀 Quick Start

### Basic Usage

```astro
---
import { AutoSchema } from '../features/schema';
---

<head>
  <!-- Other head content -->
  <AutoSchema />
</head>
```

### For Blog Posts

```astro
---
import { AutoSchema } from '../features/schema';
const { entry } = Astro.props;
---

<head>
  <!-- Other head content -->
  <AutoSchema post={entry} />
</head>
```

## 📋 Features

- **🔄 Automatic Detection**: Detects page type from URL and context
- **📝 Zero Config**: Works out of the box with sensible defaults
- **🎯 Frontmatter Integration**: Extracts data automatically from `.md` files
- **🌐 Absolute URLs**: Ensures all URLs are absolute for SEO
- **🧪 Well Tested**: Comprehensive test coverage
- **📦 Reusable**: Easy to copy to other Astro projects

## 🏗️ Architecture

```
src/features/schema/
├── config.ts              # Site configuration and mappings
├── engine.ts               # Schema generation logic
├── AutoSchema.astro        # Main component
├── index.ts                # Public API exports
├── scripts/
│   └── validate-schemas.js # Production validation script
├── __tests__/
│   └── schema.test.ts      # Test suite
└── README.md               # This file
```

## 📊 Generated Schemas

| Page Type | Schema Type | Auto-Detection |
|-----------|-------------|----------------|
| Home (`/`) | WebSite | ✅ URL-based |
| Blog Index (`/blog`) | Blog | ✅ URL-based |
| Blog Post (`/blog/[slug]`) | BlogPosting | ✅ Post data |

## 🔧 Configuration

Edit `config.ts` to customize for your site:

```typescript
export const SCHEMA_CONFIG = {
  site: {
    name: "Your Site Name",
    url: "https://yoursite.com",
    description: "Your site description",
    author: "Your Name",
    language: "en" // or "es", "fr", etc.
  },
  social: {
    github: "yourusername",
    linkedin: "yourprofile",
    twitter: "@yourusername"
  },
  defaults: {
    image: "/images/og-default.webp",
    logo: "/images/logo.webp",
    profileImage: "/images/profile.webp"
  }
};
```

## 📝 Blog Post Frontmatter

The feature automatically extracts data from your blog post frontmatter:

```markdown
---
title: "My Blog Post"           # → headline
description: "Post description" # → description  
date: 2025-01-15               # → datePublished
author: "Author Name"          # → author.name
image: "/images/post.webp"     # → image (absolute URL)
tags: ["tag1", "tag2"]         # → keywords
---

Your content here...
```

## 🧪 Testing & Validation

### Unit Tests
Run the test suite:

```bash
npm test -- schema.test.ts
npm run test:schemas              # Run schema-specific tests
```

### Production Validation
Validate schemas in production:

```bash
npm run validate:schemas          # Check production schemas
npm run validate:schemas:dev      # Check development schemas
npm run validate:schemas:auto     # Auto-discover URLs from sitemap
npm run test:schemas:full         # Run tests + validation
```

### Custom Validation
Check specific URLs:

```bash
npm run validate:schemas -- --url=https://yoursite.com/specific-page
```

### CI/CD Integration
Add to your GitHub Actions or CI pipeline:

```yaml
- name: Validate Schemas
  run: |
    npm run build
    npm run validate:schemas:dev
```

## 📦 Reusing in Other Projects

1. Copy the entire `features/schema/` folder
2. Update `config.ts` with your site details
3. Import and use `AutoSchema` in your layouts

```astro
---
import { AutoSchema } from './features/schema';
---
<AutoSchema />
```

## 🔍 Debugging

In development mode, the component logs helpful information:

- Schema generation success/failure
- Number of schemas generated per page
- Warnings for missing data

Check your browser console for debug information.

## 📈 SEO Benefits

- **Rich Snippets**: Better search result presentation
- **Knowledge Panels**: Enhanced Google understanding
- **Social Sharing**: Improved link previews
- **Voice Search**: Better voice assistant compatibility

## 🤝 Contributing

1. Add new schema types in `engine.ts`
2. Update `config.ts` mappings
3. Add tests in `__tests__/schema.test.ts`
4. Update this README
