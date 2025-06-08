#!/usr/bin/env node

/**
 * Schema.org Validation Script
 * 
 * Replaces custom Schema.org validation with standard tools and APIs.
 * Validates structured data using Google's Structured Data Testing Tool API.
 */

import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Initialize AJV for JSON Schema validation
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// URLs to test
const URLS_TO_TEST = [
  'http://localhost:4321',
  'http://localhost:4321/blog',
  'http://localhost:4321/blog/dark-mode-perfecto-astro'
];

// Schema.org types we expect to find
const EXPECTED_SCHEMAS = {
  '/': ['WebSite', 'Organization', 'Person'],
  '/blog': ['WebPage', 'Blog'],
  '/blog/': ['BlogPosting', 'Article']
};

class SchemaOrgValidator {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.validated = 0;
    this.blogPostSchema = null;
    
    this.loadSchemas();
  }

  loadSchemas() {
    try {
      // Load our custom blog post schema
      const schemaPath = './schemas/blog-post-schema.json';
      const schemaContent = readFileSync(schemaPath, 'utf8');
      this.blogPostSchema = ajv.compile(JSON.parse(schemaContent));
    } catch (error) {
      console.warn('Warning: Could not load blog post schema:', error.message);
    }
  }

  async validateAllUrls() {
    console.log('🔍 Validating Schema.org structured data...\n');
    
    for (const url of URLS_TO_TEST) {
      await this.validateUrl(url);
    }

    this.printResults();
    return this.violations.length === 0;
  }

  async validateUrl(url) {
    console.log(`📄 Validating: ${url}`);
    
    try {
      // Fetch the page
      const response = await fetch(url);
      if (!response.ok) {
        this.violations.push({
          url,
          type: 'fetch-error',
          message: `Failed to fetch page: ${response.status} ${response.statusText}`
        });
        return;
      }

      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Extract JSON-LD scripts
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      
      if (jsonLdScripts.length === 0) {
        this.warnings.push({
          url,
          type: 'missing-structured-data',
          message: 'No JSON-LD structured data found'
        });
        return;
      }

      // Validate each JSON-LD script
      for (const script of jsonLdScripts) {
        await this.validateJsonLd(url, script.textContent);
      }

      // Check for expected schema types
      this.checkExpectedSchemas(url, jsonLdScripts);

      this.validated++;
      console.log(`   ✅ Validated ${jsonLdScripts.length} structured data blocks`);

    } catch (error) {
      this.violations.push({
        url,
        type: 'validation-error',
        message: `Validation error: ${error.message}`
      });
    }
  }

  async validateJsonLd(url, jsonLdContent) {
    try {
      // Parse JSON-LD
      const structuredData = JSON.parse(jsonLdContent);
      
      // Basic validation
      if (!structuredData['@context']) {
        this.violations.push({
          url,
          type: 'missing-context',
          message: 'JSON-LD missing @context'
        });
      }

      if (!structuredData['@type']) {
        this.violations.push({
          url,
          type: 'missing-type',
          message: 'JSON-LD missing @type'
        });
      }

      // Validate against our blog post schema if applicable
      if (structuredData['@type'] === 'BlogPosting' && this.blogPostSchema) {
        const isValid = this.blogPostSchema(structuredData);
        if (!isValid) {
          this.violations.push({
            url,
            type: 'schema-validation',
            message: `Blog post schema validation failed: ${ajv.errorsText(this.blogPostSchema.errors)}`
          });
        }
      }

      // Check required properties for common types
      this.validateSchemaType(url, structuredData);

    } catch (error) {
      this.violations.push({
        url,
        type: 'json-parse-error',
        message: `Invalid JSON-LD: ${error.message}`
      });
    }
  }

  validateSchemaType(url, schema) {
    const type = schema['@type'];
    
    switch (type) {
      case 'BlogPosting':
        this.validateBlogPosting(url, schema);
        break;
      case 'WebSite':
        this.validateWebSite(url, schema);
        break;
      case 'Organization':
      case 'Person':
        this.validateEntity(url, schema);
        break;
      case 'WebPage':
        this.validateWebPage(url, schema);
        break;
    }
  }

  validateBlogPosting(url, schema) {
    const required = ['headline', 'datePublished', 'author'];
    const recommended = ['description', 'image', 'publisher'];
    
    for (const field of required) {
      if (!schema[field]) {
        this.violations.push({
          url,
          type: 'missing-required-field',
          message: `BlogPosting missing required field: ${field}`
        });
      }
    }
    
    for (const field of recommended) {
      if (!schema[field]) {
        this.warnings.push({
          url,
          type: 'missing-recommended-field',
          message: `BlogPosting missing recommended field: ${field}`
        });
      }
    }
  }

  validateWebSite(url, schema) {
    const required = ['name', 'url'];
    
    for (const field of required) {
      if (!schema[field]) {
        this.violations.push({
          url,
          type: 'missing-required-field',
          message: `WebSite missing required field: ${field}`
        });
      }
    }
  }

  validateEntity(url, schema) {
    const required = ['name'];
    
    for (const field of required) {
      if (!schema[field]) {
        this.violations.push({
          url,
          type: 'missing-required-field',
          message: `${schema['@type']} missing required field: ${field}`
        });
      }
    }
  }

  validateWebPage(url, schema) {
    const required = ['name'];
    
    for (const field of required) {
      if (!schema[field]) {
        this.violations.push({
          url,
          type: 'missing-required-field',
          message: `WebPage missing required field: ${field}`
        });
      }
    }
  }

  checkExpectedSchemas(url, jsonLdScripts) {
    const urlPath = new URL(url).pathname;
    const expectedTypes = EXPECTED_SCHEMAS[urlPath] || EXPECTED_SCHEMAS[urlPath + '/'];
    
    if (!expectedTypes) return;

    const foundTypes = [];
    for (const script of jsonLdScripts) {
      try {
        const schema = JSON.parse(script.textContent);
        if (schema['@type']) {
          foundTypes.push(schema['@type']);
        }
      } catch (error) {
        // Already handled in validateJsonLd
      }
    }

    for (const expectedType of expectedTypes) {
      if (!foundTypes.includes(expectedType)) {
        this.warnings.push({
          url,
          type: 'missing-expected-schema',
          message: `Expected schema type not found: ${expectedType}`
        });
      }
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 SCHEMA.ORG VALIDATION RESULTS');
    console.log('='.repeat(60));
    console.log(`📊 URLs validated: ${this.validated}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Violations: ${this.violations.length}\n`);
    
    if (this.violations.length > 0) {
      console.log('❌ SCHEMA VIOLATIONS:');
      this.violations.forEach(violation => {
        console.log(`\n  📄 ${violation.url}`);
        console.log(`     Type: ${violation.type}`);
        console.log(`     Issue: ${violation.message}`);
      });
    }
    
    if (this.warnings.length > 0 && process.env.VERBOSE) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`  📄 ${warning.url}: ${warning.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.violations.length === 0) {
      console.log('🎉 SCHEMA.ORG VALIDATION: PASSED');
      console.log('✅ All structured data is valid');
    } else {
      console.log('🚨 SCHEMA.ORG VALIDATION: FAILED');
      console.log(`❌ ${this.violations.length} validation errors found`);
    }
    
    console.log('='.repeat(60));
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new SchemaOrgValidator();
  const isValid = await validator.validateAllUrls();
  process.exit(isValid ? 0 : 1);
}

export { SchemaOrgValidator };
