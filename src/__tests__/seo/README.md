# SEO Production Tests

## 🎯 Overview

Comprehensive SEO validation suite for the live production site at **https://cappato.dev**. These tests verify that all SEO optimizations are working correctly in the real environment.

## 🚀 Quick Start

### Basic Usage
```bash
# Navigate to project directory
cd /home/tato/repos/cappato.dev/blog

# Test básico de conectividad (más rápido - 5 segundos)
npx vitest run src/__tests__/seo/basic-connectivity.test.ts

# Test completo de SEO en producción (30-60 segundos)
npm run test:seo:production

# Test específico de meta tags (30 segundos)
npm run test:seo:meta

# Test de datos estructurados Schema.org (45 segundos)
npm run test:seo:schema

# Test de performance y Core Web Vitals (60 segundos)
npm run test:seo:performance

# TODOS los tests SEO juntos (2-3 minutos)
npm run test:seo
```

### Recommended Workflow
```bash
# 1. Quick health check (start here)
npx vitest run src/__tests__/seo/basic-connectivity.test.ts

# 2. If basic test passes, run specific areas as needed
npm run test:seo:meta          # After content changes
npm run test:seo:performance   # After optimization work
npm run test:seo:schema        # After structured data changes

# 3. Full audit (monthly or before major releases)
npm run test:seo
```

## 📋 Test Coverage

### 🏠 Homepage Tests (`production.test.ts`)
- ✅ HTTP status and response validation
- ✅ Title and meta description optimization
- ✅ Open Graph and Twitter Card tags
- ✅ Canonical URLs and language declarations
- ✅ Structured data presence
- ✅ Favicon and viewport configuration
- ✅ RSS/Sitemap/AI Metadata accessibility

### 🏷️ Meta Tags Tests (`meta-tags.test.ts`)
- ✅ Essential meta tags validation
- ✅ Open Graph protocol compliance
- ✅ Twitter Cards implementation
- ✅ Meta description length optimization (50-160 chars)
- ✅ Title consistency across platforms
- ✅ Blog post meta tags validation
- ✅ Duplicate meta tags detection

### 📊 Schema.org Tests (`schema.test.ts`)
- ✅ JSON-LD structured data validation
- ✅ WebSite and Person/Organization schemas
- ✅ Blog and Article schema implementation
- ✅ Rich snippets potential verification
- ✅ Schema consistency and nesting validation
- ✅ Search action implementation

### ⚡ Performance Tests (`performance.test.ts`)
- ✅ Response time validation (< 3 seconds)
- ✅ Page size optimization (< 1MB)
- ✅ Resource count limits (scripts, CSS, fonts)
- ✅ Image optimization (alt tags, dimensions, lazy loading)
- ✅ Core Web Vitals indicators
- ✅ Mobile performance validation
- ✅ Compression and caching headers

## 🎯 What Gets Validated

### Technical SEO
- **Response Times**: < 3 seconds for all pages
- **Page Sizes**: Optimized for fast loading
- **Resource Optimization**: Limited external dependencies
- **Mobile Friendliness**: Responsive design validation
- **Security**: HTTPS and security headers

### Content SEO
- **Meta Tags**: Proper title, description, keywords
- **Structured Data**: Schema.org JSON-LD implementation
- **Open Graph**: Social media optimization
- **Image SEO**: Alt tags, dimensions, optimization
- **Heading Structure**: Proper H1-H6 hierarchy

### Performance SEO
- **Core Web Vitals**: CLS, LCP, FID indicators
- **Resource Loading**: Async/defer scripts, font optimization
- **Compression**: Gzip/Brotli compression
- **Caching**: Proper cache headers
- **Modern Formats**: WebP/AVIF image support

## 📄 Pages Tested

### Static Pages
- 🏠 **Homepage**: https://cappato.dev
- 📝 **Blog Section**: https://cappato.dev/blog

### Dynamic Discovery
- 📄 **Blog Posts**: Automatically discovers and tests individual posts
- 🔗 **Endpoints**: RSS, Sitemap, AI Metadata validation

### Resource Endpoints
- 📡 **RSS Feed**: `/rss.xml` - XML validation and content quality
- 🗺️ **Sitemap**: `/sitemap.xml` - Structure and URL validation
- 🤖 **AI Metadata**: `/ai-metadata.json` - JSON structure and content

## 🔧 Configuration

### Performance Thresholds
```typescript
const PERFORMANCE_THRESHOLDS = {
  RESPONSE_TIME: 3000,      // 3 seconds max
  CONTENT_SIZE: 1024 * 1024, // 1MB max page size
  IMAGE_SIZE: 500 * 1024,    // 500KB max single image
  SCRIPT_COUNT: 10,          // Max external scripts
  CSS_COUNT: 5,              // Max external CSS files
  FONT_COUNT: 4              // Max font files
};
```

### Test Environment
- **Target**: Production site (https://cappato.dev)
- **User Agent**: SEO-Test-Bot/1.0
- **Timeout**: 15-20 seconds per test suite
- **Dependencies**: JSDOM for HTML parsing

## 📊 Expected Results

### ✅ Passing Criteria
- All HTTP responses return 200 status
- Meta descriptions between 50-160 characters
- Structured data validates against Schema.org
- Response times under 3 seconds
- Page sizes under 1MB
- All images have alt attributes
- Proper Open Graph and Twitter Card implementation

### ⚠️ Common Issues
- **Slow Response Times**: Check server performance
- **Missing Meta Tags**: Verify meta tag generation
- **Invalid Structured Data**: Check JSON-LD syntax
- **Large Page Sizes**: Optimize images and resources
- **Missing Alt Tags**: Add alt attributes to images

## 🚨 When to Run

### Manual Execution (Recommended)
- **After SEO changes**: Verify optimizations work
- **Before major releases**: Ensure no SEO regressions
- **Performance monitoring**: Check Core Web Vitals
- **Content updates**: Validate new blog posts
- **Monthly audits**: Regular SEO health checks

### Real-World Usage Scenarios

#### 📝 **Scenario 1: After Adding a Blog Post**
```bash
# Quick check that new post has proper SEO
npm run test:seo:meta
```

#### ⚡ **Scenario 2: After Performance Optimizations**
```bash
# Verify speed improvements
npm run test:seo:performance
```

#### 🔍 **Scenario 3: Monthly SEO Audit**
```bash
# Complete health check
npm run test:seo
```

#### 🚀 **Scenario 4: Quick Daily Check**
```bash
# Fast verification everything works
npx vitest run src/__tests__/seo/basic-connectivity.test.ts
```

#### 🛠️ **Scenario 5: After Meta Tags Changes**
```bash
# Verify title, description, Open Graph updates
npm run test:seo:meta
```

#### 📊 **Scenario 6: After Adding Structured Data**
```bash
# Check Schema.org implementation
npm run test:seo:schema
```

## 🔍 Troubleshooting

### Common Failures

**Network Issues**:
```bash
# Check site accessibility
curl -I https://cappato.dev
```

**Meta Tag Issues**:
- Verify meta tag generation in components
- Check dynamic content rendering
- Validate Open Graph image URLs

**Performance Issues**:
- Check Cloudflare caching settings
- Verify image optimization
- Review resource loading strategy

**Structured Data Issues**:
- Validate JSON-LD syntax
- Check Schema.org compliance
- Verify dynamic data generation

### Debug Mode
```bash
# Run with verbose output
npm run test:seo -- --reporter=verbose

# Run single test file
npx vitest run src/__tests__/seo/production.test.ts
```

## 📈 Benefits

### SEO Assurance
- **Automated validation** of SEO best practices
- **Regression prevention** for SEO optimizations
- **Performance monitoring** for Core Web Vitals
- **Content quality** verification

### Development Workflow
- **Pre-deployment checks** ensure SEO health
- **Continuous monitoring** of production site
- **Performance benchmarking** over time
- **Issue detection** before users notice

---

## 💡 Pro Tips

1. **Run after deployments** to verify everything works in production
2. **Monitor trends** by running tests regularly
3. **Focus on failures** - they indicate real SEO issues
4. **Use specific tests** when debugging particular areas
5. **Check mobile performance** separately if needed

These tests ensure your SEO optimizations are working correctly in the real world! 🚀
