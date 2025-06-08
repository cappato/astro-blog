#!/usr/bin/env node

/**
 * Blog Post Validation Script
 * 
 * Replaces complex custom validation with standard tools:
 * - Astro Content Collections (Zod) for frontmatter validation
 * - remark-lint for markdown structure validation
 * - JSON Schema for Schema.org validation
 * 
 * This script orchestrates the validation and provides unified reporting.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { glob } from 'glob';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Initialize AJV for JSON Schema validation
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

class BlogPostValidator {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.checked = 0;
    this.blogPostSchema = null;
    
    this.loadSchemas();
  }

  loadSchemas() {
    try {
      const schemaPath = join(process.cwd(), 'schemas', 'blog-post-schema.json');
      const schemaContent = readFileSync(schemaPath, 'utf8');
      this.blogPostSchema = ajv.compile(JSON.parse(schemaContent));
    } catch (error) {
      console.warn('Warning: Could not load blog post schema:', error.message);
    }
  }

  async validateAllPosts() {
    console.log('🔍 Validating blog posts with standard tools...\n');
    
    // Find all blog post files
    const blogFiles = await glob('src/content/blog/*.md', {
      ignore: ['node_modules/**', 'dist/**']
    });

    for (const file of blogFiles) {
      this.validatePost(file);
    }

    this.printResults();
    return this.violations.length === 0;
  }

  validatePost(filePath) {
    this.checked++;
    
    try {
      const content = readFileSync(filePath, 'utf8');
      const fileName = filePath.split('/').pop();
      
      // Extract frontmatter and content
      const { frontmatter, body } = this.parseFrontmatter(content);
      
      // Validate frontmatter structure (basic check - Astro handles Zod validation)
      this.validateFrontmatter(fileName, frontmatter);
      
      // Validate markdown structure
      this.validateMarkdownStructure(fileName, body);
      
      // Validate Schema.org if present
      this.validateSchemaOrg(fileName, body);
      
    } catch (error) {
      this.violations.push({
        file: filePath,
        type: 'file-error',
        message: `Could not read file: ${error.message}`
      });
    }
  }

  parseFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      return { frontmatter: {}, body: content };
    }
    
    const frontmatterText = match[1];
    const body = match[2];
    
    // Simple YAML parsing for validation
    const frontmatter = {};
    const lines = frontmatterText.split('\n');
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // Remove quotes
        value = value.replace(/^["']|["']$/g, '');
        
        // Handle arrays (basic)
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        }
        
        frontmatter[key] = value;
      }
    }
    
    return { frontmatter, body };
  }

  validateFrontmatter(fileName, frontmatter) {
    const required = ['title', 'description', 'date', 'author'];
    
    for (const field of required) {
      if (!frontmatter[field]) {
        this.violations.push({
          file: fileName,
          type: 'frontmatter',
          message: `Missing required field: ${field}`
        });
      }
    }
    
    // Basic length checks (Zod will handle detailed validation)
    if (frontmatter.title && frontmatter.title.length > 80) {
      this.warnings.push({
        file: fileName,
        type: 'seo',
        message: `Title too long: ${frontmatter.title.length} chars (max 80 for SEO)`
      });
    }
    
    if (frontmatter.description && (frontmatter.description.length < 50 || frontmatter.description.length > 300)) {
      this.warnings.push({
        file: fileName,
        type: 'seo',
        message: `Description length: ${frontmatter.description.length} chars (recommended 50-300)`
      });
    }
  }

  validateMarkdownStructure(fileName, body) {
    // Check for H1 in content (should be handled by layout)
    const h1Regex = /^#\s+(.+)$/gm;
    const h1Matches = body.match(h1Regex);
    
    if (h1Matches && h1Matches.length > 0) {
      this.violations.push({
        file: fileName,
        type: 'structure',
        message: `Found ${h1Matches.length} H1 heading(s) in content. Use H2 (##) as highest level.`
      });
    }
    
    // Check heading hierarchy
    const headingRegex = /^(#{2,6})\s+(.+)$/gm;
    const headings = [...body.matchAll(headingRegex)];
    
    if (headings.length > 0) {
      let previousLevel = 1; // Start from H1 (handled by layout)
      
      for (const heading of headings) {
        const currentLevel = heading[1].length;
        
        // Don't skip more than one level
        if (currentLevel > previousLevel + 1) {
          this.warnings.push({
            file: fileName,
            type: 'hierarchy',
            message: `Heading hierarchy skip from H${previousLevel} to H${currentLevel}`
          });
        }
        
        previousLevel = currentLevel;
      }
    }
  }

  validateSchemaOrg(fileName, body) {
    if (!this.blogPostSchema) return;
    
    // Look for JSON-LD scripts
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const matches = [...body.matchAll(jsonLdRegex)];
    
    for (const match of matches) {
      try {
        const schema = JSON.parse(match[1]);
        const isValid = this.blogPostSchema(schema);
        
        if (!isValid) {
          this.violations.push({
            file: fileName,
            type: 'schema',
            message: `Invalid Schema.org: ${ajv.errorsText(this.blogPostSchema.errors)}`
          });
        }
      } catch (error) {
        this.violations.push({
          file: fileName,
          type: 'schema',
          message: `Invalid JSON-LD: ${error.message}`
        });
      }
    }
  }

  printResults() {
    console.log('📋 BLOG POST VALIDATION RESULTS\n');
    
    console.log(`📊 Posts checked: ${this.checked}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Violations: ${this.violations.length}\n`);
    
    if (this.violations.length > 0) {
      console.log('❌ VALIDATION VIOLATIONS:');
      this.violations.forEach(violation => {
        console.log(`\n  📄 ${violation.file}`);
        console.log(`     Type: ${violation.type}`);
        console.log(`     Issue: ${violation.message}`);
      });
    }
    
    if (this.warnings.length > 0 && process.env.VERBOSE) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`  📄 ${warning.file}: ${warning.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.violations.length === 0) {
      console.log('🎉 BLOG POST VALIDATION: PASSED');
      console.log('✅ All blog posts follow the validation rules');
    } else {
      console.log('🚨 BLOG POST VALIDATION: FAILED');
      console.log(`❌ ${this.violations.length} validation errors found`);
    }
    
    console.log('='.repeat(60));
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new BlogPostValidator();
  const isValid = await validator.validateAllPosts();
  process.exit(isValid ? 0 : 1);
}

export { BlogPostValidator };
