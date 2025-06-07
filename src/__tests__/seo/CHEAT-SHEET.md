# SEO Tests - Cheat Sheet

## 🚀 Quick Commands

### Setup
```bash
# Navigate to project directory
cd /home/tato/repos/cappato.dev/blog
```

### Basic Tests (Start Here)
```bash
# Quick connectivity check (5 seconds)
npx vitest run src/__tests__/seo/basic-connectivity.test.ts
```

### Specific SEO Tests
```bash
# Meta tags validation (30 seconds)
npm run test:seo:meta

# Performance & Core Web Vitals (60 seconds)
npm run test:seo:performance

# Structured data Schema.org (45 seconds)
npm run test:seo:schema

# Overall SEO health (30-60 seconds)
npm run test:seo:production
```

### Complete Audit
```bash
# All SEO tests (2-3 minutes)
npm run test:seo
```

##  When to Use Each Test

| Scenario | Command | Time |
|----------|---------|------|
| **Daily check** | `npx vitest run src/__tests__/seo/basic-connectivity.test.ts` | 5s |
| **After blog post** | `npm run test:seo:meta` | 30s |
| **After optimization** | `npm run test:seo:performance` | 60s |
| **After schema changes** | `npm run test:seo:schema` | 45s |
| **Monthly audit** | `npm run test:seo` | 2-3m |
| **Before release** | `npm run test:seo` | 2-3m |

##  Debug Commands

```bash
# Verbose output
npm run test:seo:production -- --reporter=verbose

# Single test file
npx vitest run src/__tests__/seo/production.test.ts

# Specific test
npx vitest run src/__tests__/seo/production.test.ts -t "should have title tag"
```

##  What Each Test Checks

### Basic Connectivity
-  Site responds (200 status)
-  Returns HTML content
-  Contains site name
-  Reasonable response time

### Meta Tags
-  Title, description, keywords
-  Open Graph (Facebook)
-  Twitter Cards
-  Description length (50-160 chars)
-  No duplicate meta tags

### Performance
-  Response time < 3 seconds
-  Page size < 1MB
-  Image optimization
-  Resource count limits
-  Core Web Vitals indicators

### Schema.org
-  JSON-LD structured data
-  WebSite/Person schemas
-  Article schemas for blog posts
-  Rich snippets potential

### Production Health
-  All of the above combined
-  RSS/Sitemap accessibility
-  Cross-page consistency

##  Common Issues & Solutions

### Slow Response
```bash
# Check if it's a temporary issue
npx vitest run src/__tests__/seo/basic-connectivity.test.ts
```
**Solution**: Check Cloudflare, server status

### Meta Tag Errors
```bash
# Focus on meta tags
npm run test:seo:meta
```
**Solution**: Update meta tag components

### Performance Issues
```bash
# Check performance specifically
npm run test:seo:performance
```
**Solution**: Optimize images, check caching

### Schema Errors
```bash
# Check structured data
npm run test:seo:schema
```
**Solution**: Fix JSON-LD syntax, complete required fields

##  Pro Tips

1. **Start with basic test** - fastest way to check if site is working
2. **Use specific tests** - faster than running everything
3. **Run after changes** - catch issues early
4. **Monthly full audit** - comprehensive health check
5. **Check mobile separately** - performance can vary

##  Expected Results

###  Success
```
 should connect to production site
 should have proper meta description
 should have fast response time
 should have valid structured data

Test Files  1 passed (1)
Tests  X passed (X)
```

###  Failure
```
× should have proper meta description
  → Description too short: 45 chars (need 50-160)

× should have fast response time  
  → 4.2s exceeds 3s limit
```

##  Recommended Workflow

### Daily
```bash
npx vitest run src/__tests__/seo/basic-connectivity.test.ts
```

### After Content Changes
```bash
npm run test:seo:meta
```

### After Performance Work
```bash
npm run test:seo:performance
```

### Monthly/Before Releases
```bash
npm run test:seo
```

---

**Need help?** Check the full documentation in `src/__tests__/seo/README.md`
