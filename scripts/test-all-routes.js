#!/usr/bin/env node

/**
 * Comprehensive Route Testing Script
 * Tests all routes in the Astro blog and reports issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:4323';
const CONTENT_DIR = 'src/content/blog';
const TIMEOUT = 10000; // 10 seconds

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Make HTTP request and return response details
 */
async function testRoute(url, description) {
  try {
    const startTime = Date.now();
    const response = await fetch(url);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      url,
      description,
      status: response.status,
      statusText: response.statusText,
      responseTime,
      success: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      url,
      description,
      status: 0,
      statusText: 'Network Error',
      responseTime: 0,
      success: false,
      error: error.message
    };
  }
}

/**
 * Parse frontmatter to get post slugs
 */
function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};
  
  const frontmatterText = frontmatterMatch[1];
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim().replace(/"/g, '');
      
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1);
        frontmatter[key.trim()] = arrayContent
          .split(',')
          .map(item => item.trim().replace(/"/g, ''))
          .filter(item => item.length > 0);
      } else {
        frontmatter[key.trim()] = value;
      }
    }
  }
  
  return frontmatter;
}

/**
 * Get all blog posts and their metadata
 */
function getBlogPosts() {
  const blogFiles = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md'));
  const posts = [];
  const tags = new Set();
  const pillars = new Set();
  
  for (const file of blogFiles) {
    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const frontmatter = parseFrontmatter(content);
    const slug = file.replace('.md', '');
    
    posts.push({
      slug,
      title: frontmatter.title || slug,
      tags: frontmatter.tags || [],
      pillar: frontmatter.pillar,
      draft: frontmatter.draft === true || frontmatter.draft === 'true'
    });
    
    // Collect tags
    if (frontmatter.tags) {
      frontmatter.tags.forEach(tag => tags.add(tag));
    }
    
    // Collect pillars
    if (frontmatter.pillar) {
      pillars.add(frontmatter.pillar);
    }
  }
  
  return { posts, tags: Array.from(tags), pillars: Array.from(pillars) };
}

/**
 * Main testing function
 */
async function main() {
  log('🧪 Comprehensive Route Testing', 'bold');
  log('=====================================\n', 'cyan');
  
  const { posts, tags, pillars } = getBlogPosts();
  const results = [];
  
  // Define all routes to test
  const routes = [
    // Core pages
    { url: `${BASE_URL}/`, description: 'Homepage' },
    { url: `${BASE_URL}/blog`, description: 'Blog listing' },
    { url: `${BASE_URL}/blog/pillars`, description: 'Blog pillars' },
    
    // RSS and Sitemap
    { url: `${BASE_URL}/rss.xml`, description: 'RSS feed' },
    { url: `${BASE_URL}/sitemap.xml`, description: 'Sitemap' },
    { url: `${BASE_URL}/sitemap-index.xml`, description: 'Sitemap index' },
    
    // Blog posts (published only)
    ...posts
      .filter(post => !post.draft)
      .slice(0, 10) // Test first 10 posts to avoid overwhelming
      .map(post => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        description: `Blog post: ${post.title}`
      })),
    
    // Tag pages (first 5 tags)
    ...tags.slice(0, 5).map(tag => ({
      url: `${BASE_URL}/blog/tag/${tag}`,
      description: `Tag page: ${tag}`
    })),
    
    // Pillar pages
    ...pillars.map(pillar => ({
      url: `${BASE_URL}/blog/pillar/${pillar}`,
      description: `Pillar page: ${pillar}`
    })),
    
    // Error cases
    { url: `${BASE_URL}/blog/non-existent-post`, description: '404 test: Non-existent post' },
    { url: `${BASE_URL}/blog/tag/non-existent-tag`, description: '404 test: Non-existent tag' },
    { url: `${BASE_URL}/non-existent-page`, description: '404 test: Non-existent page' }
  ];
  
  log(`🔍 Testing ${routes.length} routes...\n`, 'blue');
  
  // Test all routes
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    log(`[${i + 1}/${routes.length}] Testing: ${route.description}`, 'cyan');
    
    const result = await testRoute(route.url, route.description);
    results.push(result);
    
    // Log result
    if (result.success) {
      log(`  ✅ ${result.status} - ${result.responseTime}ms`, 'green');
    } else if (result.status === 404) {
      log(`  ⚠️  ${result.status} - ${result.responseTime}ms (Expected for error tests)`, 'yellow');
    } else {
      log(`  ❌ ${result.status} ${result.statusText} - ${result.responseTime}ms`, 'red');
      if (result.error) {
        log(`     Error: ${result.error}`, 'red');
      }
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Generate summary report
  log('\n=====================================', 'cyan');
  log('📊 Test Results Summary:', 'bold');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success && r.status !== 404);
  const notFound = results.filter(r => r.status === 404);
  const errors = results.filter(r => r.error);
  
  log(`   - Total routes tested: ${results.length}`, 'blue');
  log(`   - Successful (2xx): ${successful.length}`, 'green');
  log(`   - Not Found (404): ${notFound.length}`, 'yellow');
  log(`   - Failed (other): ${failed.length}`, failed.length > 0 ? 'red' : 'green');
  log(`   - Network errors: ${errors.length}`, errors.length > 0 ? 'red' : 'green');
  
  // Average response time
  const avgResponseTime = results
    .filter(r => r.responseTime > 0)
    .reduce((sum, r) => sum + r.responseTime, 0) / results.filter(r => r.responseTime > 0).length;
  
  log(`   - Average response time: ${avgResponseTime.toFixed(2)}ms`, 'blue');
  
  // Report failures
  if (failed.length > 0) {
    log('\n❌ Failed Routes:', 'red');
    failed.forEach(result => {
      log(`   - ${result.description}: ${result.status} ${result.statusText}`, 'red');
      log(`     URL: ${result.url}`, 'yellow');
    });
  }
  
  // Report network errors
  if (errors.length > 0) {
    log('\n🔌 Network Errors:', 'red');
    errors.forEach(result => {
      log(`   - ${result.description}: ${result.error}`, 'red');
      log(`     URL: ${result.url}`, 'yellow');
    });
  }
  
  // Performance insights
  const slowRoutes = results.filter(r => r.responseTime > 1000);
  if (slowRoutes.length > 0) {
    log('\n🐌 Slow Routes (>1s):', 'yellow');
    slowRoutes.forEach(result => {
      log(`   - ${result.description}: ${result.responseTime}ms`, 'yellow');
    });
  }
  
  log('\n🎯 Recommendations:', 'blue');
  if (failed.length === 0 && errors.length === 0) {
    log('   ✅ All routes are working correctly!', 'green');
  } else {
    log('   🔧 Check server logs for detailed error information', 'yellow');
    log('   🔍 Investigate failed routes for potential issues', 'yellow');
  }
  
  log('\n📝 Note: Check the Astro dev server console for additional warnings and errors.', 'cyan');
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testRoute, getBlogPosts };
