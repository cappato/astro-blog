# RSS Feed Feature

## Purpose
Framework-agnostic RSS 2.0 feed generation engine with comprehensive validation, error handling, and HTTP endpoint support. Provides complete RSS feed capabilities that can be used in any JavaScript/TypeScript project.

## Architecture
Pure TypeScript/JavaScript engine with plug & play portability. Completely framework-agnostic - works with any JavaScript project. Self-contained feature with comprehensive testing and standards compliance.

## Files
- `index.ts` - Public API exports and feature metadata
- `engine/` - Core RSS generation engine with TypeScript classes
  - `types.ts` - Complete TypeScript type definitions
  - `constants.ts` - RSS configuration constants and error codes
  - `rss-generator.ts` - Main RSS 2.0 generation engine
  - `utils.ts` - Utility functions for validation and processing
- `endpoints/` - HTTP endpoint handling
  - `rss-endpoint.ts` - Framework-agnostic endpoint handler
- `__tests__/rss-feed.test.ts` - Comprehensive test suite (50+ tests)
- `README.md` - Feature documentation

**Note**: This is a pure TypeScript/JavaScript engine. No framework-specific components included for maximum portability. All files are self-contained within the feature directory.

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

### RSS Configuration Interface
```typescript
interface RSSConfig {
  site: {
    url: string;           // Site URL (required)
    title: string;         // Site title (required)
    description: string;   // Site description (required)
    author: string;        // Author name (required)
    language: string;      // Language code (e.g., 'en-US')
  };
  feed: {
    version: string;       // RSS version (default: '2.0')
    ttl: number;          // Time to live in minutes (default: 60)
    path: string;         // Feed path (default: '/rss.xml')
    maxItems?: number;    // Max items in feed (default: 50)
  };
  content: {
    maxExcerptLength: number;  // Max excerpt length (default: 500)
    minExcerptLength: number;  // Min excerpt length (default: 50)
    defaultCategory: string;   // Default category (default: 'Blog')
  };
}
```

### Generation Options
```typescript
interface RSSGenerationOptions {
  postFilter?: (post: BlogPost) => boolean;  // Custom post filter
  maxItems?: number;                         // Override max items
  includeFullContent?: boolean;              // Include full content
  category?: string;                         // Custom category
}
```

## Generated Output

### RSS 2.0 XML Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Site Title</title>
    <description>Site Description</description>
    <link>https://example.com</link>
    <atom:link href="https://example.com/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-US</language>
    <managingEditor>Author Name</managingEditor>
    <webMaster>Author Name</webMaster>
    <lastBuildDate>Wed, 01 Jan 2024 12:00:00 GMT</lastBuildDate>
    <pubDate>Wed, 01 Jan 2024 12:00:00 GMT</pubDate>
    <ttl>60</ttl>
    <generator>Astro RSS Feed Generator</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>

    <item>
      <title>Post Title</title>
      <description>Post description or excerpt</description>
      <link>https://example.com/blog/post-slug</link>
      <guid isPermaLink="true">https://example.com/blog/post-slug</guid>
      <pubDate>Wed, 01 Jan 2024 12:00:00 GMT</pubDate>
      <author>Author Name</author>
      <category>Blog</category>
    </item>
  </channel>
</rss>
```

## Engine Classes

### Core Processing Classes
Framework-agnostic TypeScript classes for RSS generation.

### RSSGenerator
Main RSS generation engine with validation and error handling.

**Methods:**
- `generateFeed(posts, options)` - Generate complete RSS feed
- `updateConfig(config)` - Update RSS configuration
- `getConfig()` - Get current configuration

### RSSEndpointHandler
HTTP endpoint handler for RSS requests.

**Methods:**
- `handleRequest(posts, options)` - Handle RSS HTTP request
- `updateConfig(config)` - Update configuration
- `getConfig()` - Get current configuration

### Utility Functions
- `escapeXML(text)` - Escape XML special characters
- `validateRSSConfig(config)` - Validate RSS configuration
- `validatePostData(post)` - Validate blog post data
- `generateExcerpt(content, maxLength, minLength)` - Generate post excerpt
- `shouldIncludePost(post)` - Filter posts by environment
- `getValidPosts(posts, filter)` - Get valid, filtered posts

## Error Handling

### Validation Errors
- Invalid site configuration
- Missing required fields (title, date, URL)
- Invalid URL format
- Invalid date format

### Generation Errors
- Empty content handling
- XML escaping failures
- Post processing errors

### HTTP Errors
- 500 status for generation failures
- Error XML response with details
- Proper error logging

## Testing

### Test Coverage
- **50+ comprehensive tests** covering all functionality
- **Engine tests**: RSS generation, validation, utilities
- **Endpoint tests**: HTTP handling, error responses
- **Utility tests**: XML escaping, excerpt generation, post filtering
- **Integration tests**: End-to-end RSS generation scenarios
- **Framework-agnostic**: Pure TypeScript testing without UI dependencies

### Running Tests
```bash
npm run test:run -- rss-feed
```

### Test Results
```
✓ 50+ tests passing (100% success rate)
✓ All engine classes tested
✓ All utility functions validated
✓ HTTP endpoint scenarios covered
✓ Error handling scenarios verified
```

## Standards Compliance

### RSS 2.0 Specification
- Complete RSS 2.0 compliance
- Atom namespace support
- Proper XML structure and encoding
- Valid RSS elements and attributes

### Security Features
- XML special character escaping
- Control character removal
- URL validation
- Input sanitization

## Performance Features

### Optimization
- Efficient post filtering
- Lazy evaluation
- Memory-conscious processing
- Configurable limits

### Caching
- HTTP cache headers
- Conditional generation
- Build-time optimization

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
test_coverage: "50_plus_comprehensive_tests_framework_agnostic"
dependencies: ["none_pure_typescript"]
key_files: ["index.ts", "engine_directory", "endpoints_directory", "tests_directory"]
performance_features: ["efficient_filtering", "configurable_limits", "memory_conscious"]
security_features: ["xml_escaping", "input_validation", "url_validation"]
```
