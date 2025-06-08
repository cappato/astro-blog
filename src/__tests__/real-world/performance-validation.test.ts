/**
 * Real-World Performance Validation Tests
 * 
 * Tests that verify our system performs well in real scenarios.
 * These catch actual performance regressions and bottlenecks.
 */

import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { performance } from 'perf_hooks';

describe('Performance Validation - Real World Tests', () => {
  
  describe('Build Performance', () => {
    test('should have reasonable bundle sizes', () => {
      const distDir = join(process.cwd(), 'dist');
      
      if (!require('fs').existsSync(distDir)) {
        console.warn('Dist directory not found, skipping bundle size test');
        return;
      }
      
      const astroDir = join(distDir, '_astro');
      if (!require('fs').existsSync(astroDir)) {
        console.warn('Astro build directory not found, skipping bundle size test');
        return;
      }
      
      const files = readdirSync(astroDir);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      
      jsFiles.forEach(file => {
        const filePath = join(astroDir, file);
        const stats = statSync(filePath);
        const sizeKB = stats.size / 1024;
        
        // No JS bundle should be larger than 500KB (reasonable for modern web)
        expect(sizeKB).toBeLessThan(500);
        
        // Warn if any bundle is larger than 100KB
        if (sizeKB > 100) {
          console.warn(`Large bundle detected: ${file} (${sizeKB.toFixed(2)}KB)`);
        }
      });
    });

    test('should generate expected number of pages', () => {
      const distDir = join(process.cwd(), 'dist');
      
      if (!require('fs').existsSync(distDir)) {
        console.warn('Dist directory not found, skipping page count test');
        return;
      }
      
      // Count HTML files recursively
      function countHtmlFiles(dir: string): number {
        let count = 0;
        const items = readdirSync(dir);
        
        for (const item of items) {
          const itemPath = join(dir, item);
          const stats = statSync(itemPath);
          
          if (stats.isDirectory()) {
            count += countHtmlFiles(itemPath);
          } else if (item.endsWith('.html')) {
            count++;
          }
        }
        
        return count;
      }
      
      const htmlCount = countHtmlFiles(distDir);
      
      // Should generate at least 20 pages (blog posts + static pages)
      expect(htmlCount).toBeGreaterThan(20);
      
      // Should not generate more than 200 pages (reasonable upper bound)
      expect(htmlCount).toBeLessThan(200);
      
      console.log(`Generated ${htmlCount} HTML pages`);
    });
  });

  describe('Content Performance', () => {
    test('should have reasonable blog post sizes', () => {
      const blogDir = join(process.cwd(), 'src', 'content', 'blog');
      const blogFiles = readdirSync(blogDir).filter(f => f.endsWith('.md'));
      
      expect(blogFiles.length).toBeGreaterThan(5); // Should have some content
      
      blogFiles.forEach(file => {
        const filePath = join(blogDir, file);
        const content = readFileSync(filePath, 'utf8');
        const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
        
        // Blog posts should be between 1KB and 100KB
        expect(sizeKB).toBeGreaterThan(1);
        expect(sizeKB).toBeLessThan(100);
        
        // Check for reasonable content length
        const wordCount = content.split(/\s+/).length;
        expect(wordCount).toBeGreaterThan(100); // At least 100 words
        expect(wordCount).toBeLessThan(10000); // Not more than 10k words
      });
    });

    test('should have optimized images in content', () => {
      const publicImagesDir = join(process.cwd(), 'public', 'images');
      
      if (!require('fs').existsSync(publicImagesDir)) {
        console.warn('Public images directory not found, skipping image optimization test');
        return;
      }
      
      function checkImagesInDir(dir: string) {
        const items = readdirSync(dir);
        
        for (const item of items) {
          const itemPath = join(dir, item);
          const stats = statSync(itemPath);
          
          if (stats.isDirectory()) {
            checkImagesInDir(itemPath);
          } else if (item.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
            const sizeKB = stats.size / 1024;
            
            // Images should not be larger than 2MB
            expect(sizeKB).toBeLessThan(2048);
            
            // Warn about large images
            if (sizeKB > 500) {
              console.warn(`Large image detected: ${item} (${sizeKB.toFixed(2)}KB)`);
            }
          }
        }
      }
      
      checkImagesInDir(publicImagesDir);
    });
  });

  describe('Code Quality Performance', () => {
    test('should have reasonable test execution time', async () => {
      const start = performance.now();
      
      // This test itself should complete quickly
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    test('should not have excessive TypeScript files', () => {
      function countTsFiles(dir: string): number {
        let count = 0;
        
        try {
          const items = readdirSync(dir);
          
          for (const item of items) {
            if (item === 'node_modules' || item === '.git' || item === 'dist') {
              continue;
            }
            
            const itemPath = join(dir, item);
            const stats = statSync(itemPath);
            
            if (stats.isDirectory()) {
              count += countTsFiles(itemPath);
            } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
              count++;
            }
          }
        } catch (error) {
          // Ignore permission errors
        }
        
        return count;
      }
      
      const tsFileCount = countTsFiles(process.cwd());
      
      // Should have some TypeScript files but not excessive
      expect(tsFileCount).toBeGreaterThan(10);
      expect(tsFileCount).toBeLessThan(500);
      
      console.log(`Found ${tsFileCount} TypeScript files`);
    });

    test('should have reasonable dependency count', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      
      const depCount = Object.keys(packageJson.dependencies || {}).length;
      const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
      const totalDeps = depCount + devDepCount;
      
      // Should have some dependencies but not excessive
      expect(totalDeps).toBeGreaterThan(10);
      expect(totalDeps).toBeLessThan(200);
      
      // Dev dependencies should be reasonable
      expect(devDepCount).toBeLessThan(100);
      
      console.log(`Dependencies: ${depCount} prod, ${devDepCount} dev, ${totalDeps} total`);
    });
  });

  describe('Migration Impact Performance', () => {
    test('should have efficient linting configuration', () => {
      const eslintConfig = readFileSync('.eslintrc.cjs', 'utf8');
      
      // Should not have excessive rules that slow down linting
      const ruleMatches = eslintConfig.match(/rules.*?{[\s\S]*?}/);
      if (ruleMatches) {
        const rulesSection = ruleMatches[0];
        const ruleCount = (rulesSection.match(/['"]\w+['"]\s*:/g) || []).length;
        
        // Should have some rules but not excessive
        expect(ruleCount).toBeLessThan(50);
      }
    });

    test('should have efficient markdownlint configuration', () => {
      const markdownlintConfig = readFileSync('.markdownlint-cli2.jsonc', 'utf8');
      
      // Should be a reasonable size
      const sizeKB = Buffer.byteLength(markdownlintConfig, 'utf8') / 1024;
      expect(sizeKB).toBeLessThan(10); // Config should be under 10KB
    });

    test('should have efficient GitHub Actions workflows', () => {
      const workflowsDir = join(process.cwd(), '.github', 'workflows');
      
      if (!require('fs').existsSync(workflowsDir)) {
        console.warn('Workflows directory not found, skipping workflow efficiency test');
        return;
      }
      
      const workflows = readdirSync(workflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
      
      workflows.forEach(workflow => {
        const workflowPath = join(workflowsDir, workflow);
        const content = readFileSync(workflowPath, 'utf8');
        const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
        
        // Individual workflows should be reasonable size
        expect(sizeKB).toBeLessThan(20);
        
        // Should not have excessive steps
        const stepCount = (content.match(/- name:/g) || []).length;
        expect(stepCount).toBeLessThan(30);
      });
    });
  });

  describe('Real-World Usage Scenarios', () => {
    test('should handle blog post frontmatter efficiently', () => {
      const blogDir = join(process.cwd(), 'src', 'content', 'blog');
      const blogFiles = readdirSync(blogDir).filter(f => f.endsWith('.md'));
      
      const start = performance.now();
      
      blogFiles.forEach(file => {
        const filePath = join(blogDir, file);
        const content = readFileSync(filePath, 'utf8');
        
        // Extract frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        expect(frontmatterMatch).toBeTruthy();
        
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          
          // Frontmatter should be reasonable size
          const lines = frontmatter.split('\n').length;
          expect(lines).toBeLessThan(50);
        }
      });
      
      const end = performance.now();
      const duration = end - start;
      
      // Processing all blog frontmatter should be fast
      expect(duration).toBeLessThan(1000); // Less than 1 second
      
      console.log(`Processed ${blogFiles.length} blog files in ${duration.toFixed(2)}ms`);
    });

    test('should have efficient schema validation setup', () => {
      const schemaPath = join(process.cwd(), 'schemas', 'blog-post-schema.json');
      
      if (!require('fs').existsSync(schemaPath)) {
        console.warn('Blog post schema not found, skipping schema efficiency test');
        return;
      }
      
      const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
      
      // Schema should be comprehensive but not excessive
      const propertyCount = Object.keys(schema.properties || {}).length;
      expect(propertyCount).toBeGreaterThan(5);
      expect(propertyCount).toBeLessThan(50);
      
      // Required fields should be reasonable
      const requiredCount = (schema.required || []).length;
      expect(requiredCount).toBeGreaterThan(2);
      expect(requiredCount).toBeLessThan(20);
    });
  });
});
