#!/usr/bin/env node

/**
 * Schema Validation Script - Part of Schema.org Feature
 * Automatically validates schemas in production and development
 * 
 * Features:
 * - Auto-discovery of URLs from sitemap
 * - Development and production validation
 * - JSON-LD syntax validation
 * - Schema.org compliance checking
 * - CI/CD integration ready
 * 
 * Usage:
 *   npm run validate:schemas              # Check production
 *   npm run validate:schemas -- --dev     # Check development (localhost:4321)
 *   npm run validate:schemas -- --url=... # Check specific URL
 *   npm run validate:schemas -- --auto    # Auto-discover URLs from sitemap
 */

import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load configuration from schema feature
const configPath = join(__dirname, '../config.ts');
let SCHEMA_CONFIG;

try {
  // In a real implementation, you'd use a proper TS loader
  // For now, we'll define the config inline
  SCHEMA_CONFIG = {
    site: {
      url: 'https://cappato.dev',
      devUrl: 'http://localhost:4321'
    }
  };
} catch (error) {
  console.warn('Could not load schema config, using defaults');
  SCHEMA_CONFIG = {
    site: {
      url: 'https://cappato.dev',
      devUrl: 'http://localhost:4321'
    }
  };
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const isAuto = args.includes('--auto');
const customUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1];

// Determine base URL
const baseUrl = isDev ? SCHEMA_CONFIG.site.devUrl : SCHEMA_CONFIG.site.url;

// Default URLs to check
const DEFAULT_URLS = [
  '/',
  '/blog',
  '/blog/bienvenida-a-mi-blog'
];

/**
 * Auto-discover URLs from sitemap
 */
async function discoverUrls() {
  try {
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    console.log(`️  Discovering URLs from ${sitemapUrl}`);
    
    const response = await fetch(sitemapUrl);
    const sitemap = await response.text();
    
    // Extract URLs from sitemap XML
    const urlMatches = sitemap.match(/<loc>(.*?)<\/loc>/g);
    if (urlMatches) {
      const urls = urlMatches
        .map(match => match.replace(/<\/?loc>/g, ''))
        .map(url => url.replace(baseUrl, ''))
        .filter(url => url.length > 0);
      
      console.log(` Found ${urls.length} URLs in sitemap`);
      return urls;
    }
  } catch (error) {
    console.warn('️  Could not fetch sitemap, using default URLs');
  }
  
  return DEFAULT_URLS;
}

/**
 * Validate JSON-LD syntax and structure
 */
function validateJsonLd(jsonContent, url) {
  const issues = [];
  
  try {
    const parsed = JSON.parse(jsonContent);
    const schemas = Array.isArray(parsed) ? parsed : [parsed];
    
    schemas.forEach((schema, index) => {
      // Check required fields
      if (!schema['@context']) {
        issues.push(`Schema ${index + 1}: Missing @context`);
      } else if (schema['@context'] !== 'https://schema.org') {
        issues.push(`Schema ${index + 1}: Invalid @context (should be https://schema.org)`);
      }
      
      if (!schema['@type']) {
        issues.push(`Schema ${index + 1}: Missing @type`);
      }
      
      // Type-specific validations
      if (schema['@type'] === 'BlogPosting') {
        if (!schema.headline) issues.push(`Schema ${index + 1}: BlogPosting missing headline`);
        if (!schema.datePublished) issues.push(`Schema ${index + 1}: BlogPosting missing datePublished`);
        if (!schema.author) issues.push(`Schema ${index + 1}: BlogPosting missing author`);
      }
      
      if (schema['@type'] === 'WebSite') {
        if (!schema.name) issues.push(`Schema ${index + 1}: WebSite missing name`);
        if (!schema.url) issues.push(`Schema ${index + 1}: WebSite missing url`);
      }
      
      if (schema['@type'] === 'Blog') {
        if (!schema.name) issues.push(`Schema ${index + 1}: Blog missing name`);
        if (!schema.url) issues.push(`Schema ${index + 1}: Blog missing url`);
      }
      
      // Check for absolute URLs
      const urlFields = ['url', 'image', 'logo'];
      urlFields.forEach(field => {
        if (schema[field] && typeof schema[field] === 'string') {
          if (!schema[field].startsWith('http')) {
            issues.push(`Schema ${index + 1}: ${field} should be absolute URL`);
          }
        }
      });
    });
    
  } catch (error) {
    issues.push(`Invalid JSON: ${error.message}`);
  }
  
  return issues;
}

/**
 * Check schemas for a single URL
 */
async function checkUrl(url) {
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  try {
    console.log(` Checking: ${fullUrl}`);
    
    const response = await fetch(fullUrl);
    if (!response.ok) {
      console.log(` HTTP ${response.status}: ${response.statusText}`);
      return { url: fullUrl, success: false, error: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    
    // Look for JSON-LD scripts
    const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
    
    if (!jsonLdMatches || jsonLdMatches.length === 0) {
      console.log(' No JSON-LD schemas found');
      return { url: fullUrl, success: false, error: 'No schemas found' };
    }
    
    console.log(` Found ${jsonLdMatches.length} JSON-LD script(s)`);
    
    const results = [];
    let hasErrors = false;
    
    jsonLdMatches.forEach((match, index) => {
      try {
        // Extract JSON content
        const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
        const parsed = JSON.parse(jsonContent);
        
        // Validate content
        const issues = validateJsonLd(jsonContent, fullUrl);
        
        if (Array.isArray(parsed)) {
          parsed.forEach((schema, schemaIndex) => {
            const schemaType = schema['@type'] || 'Unknown';
            console.log(`   Schema ${index + 1}.${schemaIndex + 1}: ${schemaType}`);
            results.push({ type: schemaType, issues: [] });
          });
        } else {
          const schemaType = parsed['@type'] || 'Unknown';
          console.log(`   Schema ${index + 1}: ${schemaType}`);
          results.push({ type: schemaType, issues: [] });
        }
        
        // Report issues
        if (issues.length > 0) {
          hasErrors = true;
          console.log(`   ️  Issues found:`);
          issues.forEach(issue => console.log(`      - ${issue}`));
        }
        
      } catch (e) {
        hasErrors = true;
        console.log(`    Schema ${index + 1}: Invalid JSON - ${e.message}`);
        results.push({ type: 'Invalid', issues: [e.message] });
      }
    });
    
    console.log('');
    
    return { 
      url: fullUrl, 
      success: !hasErrors, 
      schemas: results,
      count: jsonLdMatches.length 
    };
    
  } catch (error) {
    console.error(` Error checking ${fullUrl}:`, error.message);
    console.log('');
    return { url: fullUrl, success: false, error: error.message };
  }
}

/**
 * Main validation function
 */
async function validateSchemas() {
  console.log(' Schema Validation Tool');
  console.log(` Environment: ${isDev ? 'Development' : 'Production'}`);
  console.log(` Base URL: ${baseUrl}\n`);
  
  let urlsToCheck;
  
  if (customUrl) {
    urlsToCheck = [customUrl];
  } else if (isAuto) {
    urlsToCheck = await discoverUrls();
  } else {
    urlsToCheck = DEFAULT_URLS;
  }
  
  console.log(` Checking ${urlsToCheck.length} URL(s):\n`);
  
  const results = [];
  
  for (const url of urlsToCheck) {
    const result = await checkUrl(url);
    results.push(result);
  }
  
  // Summary
  console.log(' Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(` Successful: ${successful}`);
  console.log(` Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n Failed URLs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.url}: ${r.error || 'Unknown error'}`);
    });
    process.exit(1);
  } else {
    console.log('\n All schemas are valid!');
  }
}

// Run validation
validateSchemas().catch(error => {
  console.error(' Validation failed:', error);
  process.exit(1);
});
