# 📚 Documentation

## 🏗️ Modular Architecture

This project uses a **modular feature architecture** where each feature is completely self-contained with its own documentation, tests, and components.

### 📁 Feature Structure

Each feature follows this standard structure:

```
src/features/feature-name/
├── engine/              # Core TypeScript logic
├── components/          # Astro components (if needed)
├── __tests__/          # Comprehensive test suite
├── README.md           # Complete feature documentation
└── index.ts            # Public API exports
```

## 🚀 Available Features

### Core Features
- **[Meta Tags](../src/features/meta-tags/README.md)** - SEO-optimized meta tag generation
- **[AI Metadata](../src/features/ai-metadata/README.md)** - AI-optimized metadata system
- **[Schema](../src/features/schema/README.md)** - Schema.org structured data
- **[Dark Light Mode](../src/features/dark-light-mode/README.md)** - Theme management system

### Content Features  
- **[Reading Time](../src/features/reading-time/README.md)** - Article reading time calculation
- **[RSS Feed](../src/features/rss-feed/README.md)** - RSS feed generation
- **[Sitemap](../src/features/sitemap/README.md)** - XML sitemap generation
- **[Social Share](../src/features/social-share/README.md)** - Social media sharing

### Media Features
- **[Image Optimization](../src/features/image-optimization/README.md)** - Multi-format image processing

## 📖 General Documentation

### Project Standards (IMPORTANT)
- **[STANDARDS.md](./STANDARDS.md)** - **FUENTE ÚNICA DE VERDAD** para todos los estándares
- **[rules-essential.md](./rules-essential.md)** - Referencia rápida de estándares
- **[Tech Stack](./tech-stack.md)** - Technologies and tools used

### Project Documentation
- **[Testing Automation](./testing-automation.md)** - Testing strategy and automation
- **[Blog Post](./blog-post.md)** - Blog post structure and workflow
- **[Navigation](./navigation.md)** - Site navigation system
- **[Favicon](./favicon.md)** - Favicon system documentation

### Multi-Agent Coordination
- **[Multi-Agent Coordination Framework](./MULTI-AGENT-COORDINATION.md)** - Complete system for managing multiple AI agents working on the same project

### Development Tools
- **[PRT](./prt/)** - Project development tools and utilities

## 🎯 Quick Start

### Using Features
Each feature can be imported and used independently:

```typescript
// Import specific features
import { MetaTags } from '../features/meta-tags/components';
import { generateMetaTags } from '../features/meta-tags';
import { AIMetadata } from '../features/ai-metadata';
import { ThemeToggle } from '../features/dark-light-mode/components';
```

### Feature Documentation
For detailed usage, configuration, and examples, see each feature's README.md:

```bash
# Example: Meta Tags documentation
cat src/features/meta-tags/README.md

# Example: AI Metadata documentation  
cat src/features/ai-metadata/README.md
```

## 🧪 Testing

Each feature includes comprehensive tests. Run tests for specific features:

```bash
# Test specific feature
npm test -- src/features/meta-tags
npm test -- src/features/ai-metadata

# Test all features
npm run test:unit
```

## 🔧 Development

### Adding New Features
1. Create feature directory: `src/features/new-feature/`
2. Follow the standard structure
3. Include comprehensive tests
4. Document in README.md
5. Export public API in index.ts

### Modifying Features
Each feature is self-contained, so changes are isolated and safe.

## 📊 Benefits

### ✅ Modular Architecture
- **Self-contained**: Each feature includes everything it needs
- **Portable**: Features can be moved between projects
- **Testable**: Isolated testing for each feature
- **Maintainable**: Clear separation of concerns

### ✅ Documentation Co-location
- **Always up-to-date**: Docs live with the code
- **Developer-friendly**: Context available immediately
- **AI-optimized**: Structured for AI assistant understanding

### ✅ Zero Dependencies
- **Framework-agnostic**: Core engines work anywhere
- **Lightweight**: No external dependencies
- **Fast**: Optimized TypeScript implementations
