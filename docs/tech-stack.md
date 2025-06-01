# Tech Stack

## Purpose
Technical documentation of the technology stack, architecture decisions, and best practices implemented in the Astro blog project. Provides context for development decisions and guidelines for future improvements.

## Architecture
Static site generation with modular features, centralized configuration, and TypeScript-first development approach.

## Files
- `package.json` - Dependencies and scripts configuration
- `tsconfig.json` - TypeScript configuration with strict mode
- `tailwind.config.js` - Tailwind CSS configuration and theme
- `astro.config.mjs` - Astro framework configuration
- `vitest.config.ts` - Testing framework configuration
- `src/config/` - Centralized configuration files

## Technology Stack

### Core Framework
- **Astro 5.8.0** - Static Site Generator with islands architecture
- **TypeScript** - Static typing with strict configuration
- **Tailwind CSS** - Utility-first CSS framework

### Integrations
- **@astrojs/tailwind** - Official Tailwind integration
- **Astro Content Collections** - Typed content system
- **Vitest** - Testing framework for TypeScript

### Build & Deploy
- **Cloudflare Pages** - Hosting and automatic deployment
- **Static Output** - Static site generation
- **Vite** - Bundler with advanced optimizations

## Project Structure

### Directory Architecture
```
src/
├── components/          # Reusable components
│   ├── layout/         # Layouts and navigation
│   ├── seo/           # SEO and metadata
│   ├── ui/            # Base components (buttons, cards)
│   ├── blog/          # Blog-specific components
│   └── media/         # Media and image components
├── features/          # Self-contained modular features
│   └── schema/        # Schema.org feature (example)
├── layouts/           # Main page layouts
├── pages/             # Site routes and endpoints
├── content/           # Typed content (blog posts)
├── config/            # Centralized configuration
├── utils/             # Shared utilities
├── scripts/           # Build and automation scripts
└── styles/            # Global styles and themes
```

### Feature Modularity
```typescript
// Example: Self-contained schema feature
src/features/schema/
├── AutoSchema.astro     # Main component
├── engine.ts           # Core logic
├── config.ts           # Feature configuration
├── types.ts            # TypeScript interfaces
├── utils.ts            # Internal utilities
├── index.ts            # Public exports
└── __tests__/          # Feature tests
```

## Configuration

### TypeScript Configuration
```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#3b82f6', dark: '#60a5fa' },
        background: { DEFAULT: '#f8fafc', dark: '#0f172a' }
      }
    }
  }
}
```

### Content Collections Schema
```typescript
// src/content/config.ts
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string().transform((val) => new Date(val)),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional()
  })
});
```

### Centralized Site Configuration
```typescript
// src/config/site.ts
export const SITE_INFO = {
  title: 'Matías Cappato',
  url: 'https://cappato.dev',
  description: 'Desarrollador Web Full Stack...',
  author: {
    name: 'Matías Cappato',
    email: 'matias@cappato.dev'
  },
  language: 'es'
} as const;
```

## Best Practices

### Component Development
```astro
---
// Typed props interface
interface Props {
  title: string;
  description?: string;
  className?: string;
}

const { title, description, className = '' } = Astro.props;
---

<div class={`component-base ${className}`}>
  <h2>{title}</h2>
  {description && <p>{description}</p>}
</div>
```

### Utility Functions
```typescript
// Typed utility functions
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

### Testing Strategy
```typescript
// Feature testing example
import { describe, it, expect } from 'vitest';
import { generateSchema } from '../features/schema/engine.ts';

describe('Schema Generation', () => {
  it('should generate valid WebSite schema', () => {
    const schema = generateSchema({ type: 'website', url: 'https://example.com' });
    expect(schema['@type']).toBe('WebSite');
    expect(schema.url).toBe('https://example.com');
  });
});
```

## Performance Optimizations

### Build Optimizations
- **Static Generation**: Pre-rendered HTML for optimal performance
- **CSS Purging**: Automatic removal of unused Tailwind classes
- **Image Optimization**: Custom scripts for WebP/AVIF generation
- **Code Splitting**: Automatic by Astro's islands architecture

### Runtime Optimizations
- **Lazy Loading**: Images and components loaded on demand
- **Prefetching**: Strategic prefetching of critical resources
- **Minimal JavaScript**: Only essential client-side code
- **CDN Delivery**: Cloudflare Pages global distribution

## Quality Metrics

### Code Quality
- **TypeScript Strict Mode**: Enabled for type safety
- **Test Coverage**: Comprehensive testing for utilities and features
- **Linting**: ESLint and Prettier for code consistency
- **Documentation**: Comprehensive feature documentation

### SEO Optimization
- **Schema.org Markup**: Automatic structured data generation
- **RSS Feed**: Dynamic feed generation for content syndication
- **Sitemap**: Automatic XML sitemap generation
- **Meta Tags**: Optimized meta tags and Open Graph data

### Developer Experience
- **Hot Reload**: Fast development with instant updates
- **Type Safety**: Full TypeScript integration
- **Modular Architecture**: Self-contained features
- **Automated Testing**: Vitest integration with CI/CD

## Architectural Decisions

### Technology Choices
1. **Astro over Next.js**: Better for content-focused sites with minimal interactivity
2. **Tailwind over CSS-in-JS**: Utility-first approach with better performance
3. **TypeScript Strict**: Enhanced type safety and developer experience
4. **Content Collections**: Type-safe content management with validation

### Design Patterns
1. **Feature Modules**: Self-contained features with clear boundaries
2. **Configuration Centralization**: Single source of truth for settings
3. **Utility-First CSS**: Tailwind utilities with semantic class abstractions
4. **Static Generation**: Pre-rendered content for optimal performance

## Extension Guidelines

### Adding New Features
1. Create self-contained feature in `src/features/`
2. Include types, tests, and documentation
3. Export public API through `index.ts`
4. Add configuration to centralized config files

### Component Development
1. Use TypeScript interfaces for props
2. Follow Astro component conventions
3. Implement responsive design with Tailwind
4. Add appropriate accessibility attributes

### Testing Requirements
1. Unit tests for utility functions
2. Integration tests for features
3. Type checking with TypeScript
4. Manual testing for UI components

## AI Context
```yaml
feature_type: "tech_stack_documentation"
purpose: "development_guidelines"
input_sources: ["package_json", "config_files", "project_structure"]
output_format: "technical_documentation"
architecture: "static_site_generation"
framework: "astro_typescript_tailwind"
deployment: "cloudflare_pages"
testing: "vitest_comprehensive"
performance_optimization: "static_generation_image_optimization"
code_quality: "typescript_strict_linting"
dependencies: ["astro", "typescript", "tailwindcss", "vitest"]
key_files: ["package.json", "tsconfig.json", "tailwind.config.js", "astro.config.mjs"]
```
