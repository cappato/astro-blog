/**
 * Migration 5: Blog Post Validation → Zod + remark-lint
 * Tests to validate that blog post validation is properly implemented
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Migration 5: Blog Post Validation → Zod + remark-lint', () => {
  describe('Zod Schema Implementation', () => {
    it('should have Zod schema for blog posts', () => {
      // Check that content config exists
      const configPath = path.join(process.cwd(), 'src/content/config.ts');
      expect(fs.existsSync(configPath)).toBe(true);

      // Read the config file content to verify Zod schema structure
      const configContent = fs.readFileSync(configPath, 'utf-8');

      // Verify it imports Zod
      expect(configContent).toContain('import { defineCollection, z } from \'astro:content\'');

      // Verify it defines a blog collection with Zod schema
      expect(configContent).toContain('const blogCollection = defineCollection');
      expect(configContent).toContain('schema: z.object');

      // Verify it has required field validations
      expect(configContent).toContain('title: z.string()');
      expect(configContent).toContain('description: z.string()');
      expect(configContent).toContain('date: z.string()');
      expect(configContent).toContain('author: z.string()');
      expect(configContent).toContain('tags: z.array');

      // Verify it has validation constraints
      expect(configContent).toContain('.min(10'); // Title min length
      expect(configContent).toContain('.max(80'); // Title max length
      expect(configContent).toContain('.min(50'); // Description min length
      expect(configContent).toContain('.max(300'); // Description max length
      expect(configContent).toContain('regex(/^\\d{4}-\\d{2}-\\d{2}$/'); // Date format

      // Verify it exports collections
      expect(configContent).toContain('export const collections');
      expect(configContent).toContain('blog: blogCollection');
    });

    it('should have proper Zod validation constraints', () => {
      const configPath = path.join(process.cwd(), 'src/content/config.ts');
      const configContent = fs.readFileSync(configPath, 'utf-8');

      // Verify title constraints
      expect(configContent).toContain('.min(10'); // Title min length
      expect(configContent).toContain('.max(80'); // Title max length
      expect(configContent).toContain('Title must be at least 10 characters');
      expect(configContent).toContain('Title must be at most 80 characters for SEO');

      // Verify description constraints
      expect(configContent).toContain('.min(50'); // Description min length
      expect(configContent).toContain('.max(300'); // Description max length
      expect(configContent).toContain('Description must be at least 50 characters');
      expect(configContent).toContain('Description must be at most 300 characters for SEO');

      // Verify date format validation
      expect(configContent).toContain('regex(/^\\d{4}-\\d{2}-\\d{2}$/');
      expect(configContent).toContain('Date must be in YYYY-MM-DD format');

      // Verify author validation
      expect(configContent).toContain('author: z.string()');
      expect(configContent).toContain('.min(2'); // Author min length

      // Verify tags validation
      expect(configContent).toContain('tags: z.array');
      expect(configContent).toContain('.min(1'); // At least one tag
      expect(configContent).toContain('.max(15'); // Max 15 tags
    });
  });

  describe('remark-lint Dependencies', () => {
    it('should have remark-lint dependencies installed', () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Check for remark-lint related packages
      const remarkLintPackages = Object.keys(allDeps).filter(pkg => 
        pkg.includes('remark-lint') || pkg === 'remark'
      );
      
      expect(remarkLintPackages.length).toBeGreaterThan(0);
    });
  });

  describe('Blog Validation Scripts', () => {
    it('should have blog validation functionality', () => {
      // Check that blog structure tests exist
      const blogTestPath = path.join(process.cwd(), 'src/tests/blog-structure.test.ts');
      expect(fs.existsSync(blogTestPath)).toBe(true);
      
      // Check that blog images tests exist
      const blogImagesTestPath = path.join(process.cwd(), 'src/tests/blog-images.test.ts');
      expect(fs.existsSync(blogImagesTestPath)).toBe(true);
    });
  });
});
