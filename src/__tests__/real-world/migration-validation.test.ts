/**
 * Real-World Migration Validation Tests
 * 
 * Tests that verify our 7 migrations are working correctly in practice.
 * These are real, useful tests that catch actual problems.
 */

import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Migration Validation - Real World Tests', () => {
  
  describe('Migration 1: Safe PR Workflow → Husky + lint-staged', () => {
    test('should have Husky pre-commit hooks configured', () => {
      const huskyPath = join(process.cwd(), '.husky', 'pre-commit');
      expect(existsSync(huskyPath)).toBe(true);
      
      const preCommitContent = readFileSync(huskyPath, 'utf8');
      expect(preCommitContent).toContain('lint-staged');
    });

    test('should have lint-staged configuration in package.json', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      expect(packageJson['lint-staged']).toBeDefined();
      expect(packageJson['lint-staged']['*.{js,ts,astro}']).toContain('eslint');
      expect(packageJson['lint-staged']['*.md']).toContain('markdownlint');
    });

    test('should have removed old safe-pr-workflow script', () => {
      const oldScriptPath = join(process.cwd(), 'scripts', 'safe-pr-workflow.sh');
      expect(existsSync(oldScriptPath)).toBe(false);
    });
  });

  describe('Migration 2: Auto-merge System → GitHub native', () => {
    test('should have GitHub Actions workflow for auto-merge', () => {
      const workflowPath = join(process.cwd(), '.github', 'workflows', 'auto-merge.yml');
      expect(existsSync(workflowPath)).toBe(true);
      
      const workflowContent = readFileSync(workflowPath, 'utf8');
      expect(workflowContent).toContain('auto-merge');
      expect(workflowContent).toContain('github.event.pull_request');
    });

    test('should not have custom auto-merge scripts', () => {
      const customAutoMergePath = join(process.cwd(), 'scripts', 'auto-merge.js');
      expect(existsSync(customAutoMergePath)).toBe(false);
    });
  });

  describe('Migration 3: PR Size Validation → GitHub Action marketplace', () => {
    test('should have PR size validation workflow', () => {
      const workflowPath = join(process.cwd(), '.github', 'workflows', 'pr-size-validation.yml');
      expect(existsSync(workflowPath)).toBe(true);
      
      const workflowContent = readFileSync(workflowPath, 'utf8');
      expect(workflowContent).toContain('pascalgn/size-label-action');
    });

    test('should have size limits configured', () => {
      const workflowPath = join(process.cwd(), '.github', 'workflows', 'pr-size-validation.yml');
      const workflowContent = readFileSync(workflowPath, 'utf8');
      expect(workflowContent).toContain('400'); // Max lines
    });
  });

  describe('Migration 4: Professional Standards → ESLint + markdownlint', () => {
    test('should have ESLint configuration for emoji detection', () => {
      const eslintConfig = readFileSync('.eslintrc.cjs', 'utf8');
      expect(eslintConfig).toContain('no-restricted-syntax');
    });

    test('should have markdownlint configuration', () => {
      const markdownlintPath = join(process.cwd(), '.markdownlint-cli2.jsonc');
      expect(existsSync(markdownlintPath)).toBe(true);
      
      const config = readFileSync(markdownlintPath, 'utf8');
      expect(config).toContain('MD033'); // HTML elements
    });

    test('should have npm scripts for linting', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      expect(packageJson.scripts['lint:md']).toBeDefined();
      expect(packageJson.scripts['lint:md']).toContain('markdownlint');
    });
  });

  describe('Migration 5: Blog Post Validation → Zod + remark-lint', () => {
    test('should have Zod schema for blog posts', () => {
      const schemaPath = join(process.cwd(), 'schemas', 'blog-post-schema.json');
      expect(existsSync(schemaPath)).toBe(true);
      
      const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
      expect(schema.properties.title).toBeDefined();
      expect(schema.properties.description).toBeDefined();
      expect(schema.required).toContain('title');
    });

    test('should have remark-lint configuration', () => {
      const remarkPath = join(process.cwd(), '.remarkrc.js');
      expect(existsSync(remarkPath)).toBe(true);
      
      const remarkConfig = readFileSync(remarkPath, 'utf8');
      expect(remarkConfig).toContain('remark-lint');
    });

    test('should have blog validation script', () => {
      const scriptPath = join(process.cwd(), 'scripts', 'validate-blog-posts.js');
      expect(existsSync(scriptPath)).toBe(true);
      
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      expect(packageJson.scripts['validate:blog']).toBeDefined();
    });
  });

  describe('Migration 6: Image Optimization → imagemin + GitHub Actions', () => {
    test('should have imagemin configuration', () => {
      const configPath = join(process.cwd(), 'imagemin.config.js');
      expect(existsSync(configPath)).toBe(true);
      
      const config = readFileSync(configPath, 'utf8');
      expect(config).toContain('imagemin-webp');
      expect(config).toContain('imagemin-avif');
      expect(config).toContain('PRESETS');
    });

    test('should have standard optimization script', () => {
      const scriptPath = join(process.cwd(), 'scripts', 'optimize-images-standard.js');
      expect(existsSync(scriptPath)).toBe(true);
      
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      expect(packageJson.scripts['optimize:images']).toBeDefined();
    });

    test('should have GitHub Actions workflow for image optimization', () => {
      const workflowPath = join(process.cwd(), '.github', 'workflows', 'image-optimization.yml');
      expect(existsSync(workflowPath)).toBe(true);
      
      const workflow = readFileSync(workflowPath, 'utf8');
      expect(workflow).toContain('optimize-images-standard.js');
    });

    test('should have marked old system as deprecated', () => {
      const readmePath = join(process.cwd(), 'src', 'features', 'image-optimization', 'README.md');
      expect(existsSync(readmePath)).toBe(true);
      
      const readme = readFileSync(readmePath, 'utf8');
      expect(readme).toContain('DEPRECATED');
    });
  });

  describe('Migration 7: SEO Testing → Lighthouse CI + standard tools', () => {
    test('should have Lighthouse CI configuration', () => {
      const configPath = join(process.cwd(), 'lighthouserc.js');
      expect(existsSync(configPath)).toBe(true);
      
      const config = readFileSync(configPath, 'utf8');
      expect(config).toContain('collect');
      expect(config).toContain('assert');
      expect(config).toContain('categories:seo');
    });

    test('should have Playwright accessibility configuration', () => {
      const configPath = join(process.cwd(), 'playwright-a11y.config.js');
      expect(existsSync(configPath)).toBe(true);
      
      const config = readFileSync(configPath, 'utf8');
      expect(config).toContain('@playwright/test');
      expect(config).toContain('accessibility');
    });

    test('should have accessibility tests', () => {
      const testPath = join(process.cwd(), 'tests', 'accessibility', 'a11y.test.js');
      expect(existsSync(testPath)).toBe(true);
      
      const tests = readFileSync(testPath, 'utf8');
      expect(tests).toContain('axe-core');
      expect(tests).toContain('accessibility issues');
    });

    test('should have Schema.org validation script', () => {
      const scriptPath = join(process.cwd(), 'scripts', 'validate-schema-org.js');
      expect(existsSync(scriptPath)).toBe(true);
      
      const script = readFileSync(scriptPath, 'utf8');
      expect(script).toContain('SchemaOrgValidator');
      expect(script).toContain('JSON-LD');
    });

    test('should have SEO testing workflow', () => {
      const workflowPath = join(process.cwd(), '.github', 'workflows', 'seo-testing.yml');
      expect(existsSync(workflowPath)).toBe(true);
      
      const workflow = readFileSync(workflowPath, 'utf8');
      expect(workflow).toContain('lighthouse-ci');
      expect(workflow).toContain('accessibility-audit');
    });

    test('should have marked old SEO system as deprecated', () => {
      const readmePath = join(process.cwd(), 'src', '__tests__', 'seo', 'README.md');
      expect(existsSync(readmePath)).toBe(true);
      
      const readme = readFileSync(readmePath, 'utf8');
      expect(readme).toContain('DEPRECATED');
    });
  });

  describe('Overall Migration Health', () => {
    test('should have all new npm scripts available', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const scripts = packageJson.scripts;
      
      // Check key scripts from migrations
      expect(scripts['lint:md']).toBeDefined();
      expect(scripts['validate:blog']).toBeDefined();
      expect(scripts['optimize:images']).toBeDefined();
      expect(scripts['test:seo']).toBeDefined();
      expect(scripts['test:a11y']).toBeDefined();
      expect(scripts['test:schema']).toBeDefined();
    });

    test('should have all required dependencies installed', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const devDeps = packageJson.devDependencies;
      
      // Check key dependencies from migrations
      expect(devDeps['husky']).toBeDefined();
      expect(devDeps['lint-staged']).toBeDefined();
      expect(devDeps['markdownlint-cli2']).toBeDefined();
      expect(devDeps['@lhci/cli']).toBeDefined();
      expect(devDeps['@axe-core/playwright']).toBeDefined();
      expect(devDeps['imagemin']).toBeDefined();
    });

    test('should have GitHub Actions workflows in place', () => {
      const workflowsDir = join(process.cwd(), '.github', 'workflows');
      expect(existsSync(workflowsDir)).toBe(true);
      
      const expectedWorkflows = [
        'auto-merge.yml',
        'pr-size-validation.yml',
        'image-optimization.yml',
        'seo-testing.yml'
      ];
      
      expectedWorkflows.forEach(workflow => {
        const workflowPath = join(workflowsDir, workflow);
        expect(existsSync(workflowPath)).toBe(true);
      });
    });

    test('should have configuration files for all tools', () => {
      const expectedConfigs = [
        '.eslintrc.cjs',
        '.markdownlint-cli2.jsonc',
        '.remarkrc.js',
        'lighthouserc.js',
        'playwright-a11y.config.js',
        'imagemin.config.js'
      ];
      
      expectedConfigs.forEach(config => {
        const configPath = join(process.cwd(), config);
        expect(existsSync(configPath)).toBe(true);
      });
    });
  });
});
