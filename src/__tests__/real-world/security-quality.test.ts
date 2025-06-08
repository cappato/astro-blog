/**
 * Real-World Security and Quality Tests
 * 
 * Tests that verify our system is secure and maintains quality standards.
 * These catch real security issues and quality regressions.
 */

import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

describe('Security and Quality Validation - Real World Tests', () => {
  
  describe('Security Validations', () => {
    test('should not expose sensitive information in public files', () => {
      const sensitivePatterns = [
        /password\s*[:=]\s*['"]\w+['"]/i,
        /api[_-]?key\s*[:=]\s*['"]\w+['"]/i,
        /secret\s*[:=]\s*['"]\w+['"]/i,
        /token\s*[:=]\s*['"]\w+['"]/i,
        /private[_-]?key\s*[:=]/i
      ];
      
      const publicFiles = [
        'package.json',
        'astro.config.mjs',
        'tsconfig.json',
        '.eslintrc.cjs'
      ];
      
      publicFiles.forEach(file => {
        if (existsSync(file)) {
          const content = readFileSync(file, 'utf8');
          
          sensitivePatterns.forEach(pattern => {
            expect(content).not.toMatch(pattern);
          });
        }
      });
    });

    test('should have secure GitHub Actions workflows', () => {
      const workflowsDir = join(process.cwd(), '.github', 'workflows');
      
      if (!existsSync(workflowsDir)) {
        console.warn('Workflows directory not found, skipping security test');
        return;
      }
      
      const workflows = readdirSync(workflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
      
      workflows.forEach(workflow => {
        const workflowPath = join(workflowsDir, workflow);
        const content = readFileSync(workflowPath, 'utf8');
        
        // Should use pinned action versions (security best practice)
        const actionMatches = content.match(/uses:\s*[\w-]+\/[\w-]+@/g);
        if (actionMatches) {
          actionMatches.forEach(action => {
            // Should not use @main or @master (unpinned)
            expect(action).not.toMatch(/@(main|master)$/);
          });
        }
        
        // Should not contain hardcoded secrets
        expect(content).not.toMatch(/password\s*:\s*['"]\w+['"]/i);
        expect(content).not.toMatch(/token\s*:\s*['"]\w+['"]/i);
        
        // Should use secrets properly
        if (content.includes('token') || content.includes('secret')) {
          expect(content).toMatch(/\$\{\{\s*secrets\./);
        }
      });
    });

    test('should not have executable files in inappropriate locations', () => {
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh'];
      
      function checkDirectory(dir: string, depth = 0) {
        if (depth > 3) return; // Limit recursion depth
        
        try {
          const items = readdirSync(dir);
          
          for (const item of items) {
            if (item === 'node_modules' || item === '.git') continue;
            
            const itemPath = join(dir, item);
            
            try {
              const stats = require('fs').statSync(itemPath);
              
              if (stats.isDirectory()) {
                checkDirectory(itemPath, depth + 1);
              } else {
                const ext = item.toLowerCase().substring(item.lastIndexOf('.'));
                
                // .sh files are only allowed in scripts/ and .husky/
                if (ext === '.sh') {
                  const isInScripts = itemPath.includes('/scripts/') || itemPath.includes('\scripts\\');
                  const isInHusky = itemPath.includes('/.husky/') || itemPath.includes('\\.husky\\');
                  expect(isInScripts || isInHusky).toBe(true);
                }
                
                // Other dangerous extensions should not exist
                if (dangerousExtensions.includes(ext) && ext !== '.sh') {
                  throw new Error(`Dangerous executable found: ${itemPath}`);
                }
              }
            } catch (error) {
              if (error instanceof Error && error.message.includes('Dangerous executable')) {
                throw error;
              }
              // Ignore permission errors
            }
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('Dangerous executable')) {
            throw error;
          }
          // Ignore permission errors
        }
      }
      
      checkDirectory(process.cwd());
    });

    test('should have secure package.json configuration', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      
      // Should not have postinstall scripts (security risk)
      if (packageJson.scripts && packageJson.scripts.postinstall) {
        // If postinstall exists, it should be safe
        const postinstall = packageJson.scripts.postinstall;
        expect(postinstall).not.toMatch(/curl|wget|bash|sh/);
      }
      
      // Should have proper repository configuration
      if (packageJson.repository) {
        expect(packageJson.repository.type).toBe('git');
        expect(packageJson.repository.url).toMatch(/^https?:\/\//);
      }
      
      // Should not have suspicious dependencies
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      Object.keys(allDeps).forEach(dep => {
        // Should not have suspicious package names
        expect(dep).not.toMatch(/^(test|temp|tmp|debug|hack)/);
        expect(dep).not.toMatch(/[0-9]{10,}/); // Suspicious numeric names
      });
    });
  });

  describe('Code Quality Validations', () => {
    test('should have proper TypeScript configuration', () => {
      const tsConfig = JSON.parse(readFileSync('tsconfig.json', 'utf8'));
      
      // Should have strict mode enabled
      expect(tsConfig.compilerOptions.strict).toBe(true);
      
      // Should have proper module resolution
      expect(tsConfig.compilerOptions.moduleResolution).toBeDefined();
      
      // Should have proper target
      expect(tsConfig.compilerOptions.target).toBeDefined();
      expect(['ES2020', 'ES2021', 'ES2022', 'ESNext']).toContain(tsConfig.compilerOptions.target);
    });

    test('should have consistent code formatting configuration', () => {
      // Check if Prettier config exists
      const prettierConfigs = [
        '.prettierrc',
        '.prettierrc.json',
        '.prettierrc.js',
        'prettier.config.js'
      ];
      
      const hasPrettierConfig = prettierConfigs.some(config => existsSync(config));
      
      if (hasPrettierConfig) {
        // If Prettier is configured, package.json should have format scripts
        const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
        const hasFormatScript = Object.keys(packageJson.scripts || {}).some(script => 
          script.includes('format') || script.includes('prettier')
        );
        expect(hasFormatScript).toBe(true);
      }
    });

    test('should have proper ESLint configuration', () => {
      const eslintConfig = readFileSync('.eslintrc.cjs', 'utf8');
      
      // Should extend recommended configurations
      expect(eslintConfig).toMatch(/@typescript-eslint\/recommended|eslint:recommended/);
      
      // Should have parser configuration for TypeScript
      expect(eslintConfig).toMatch(/@typescript-eslint\/parser/);
      
      // Should have proper environment configuration
      expect(eslintConfig).toMatch(/env.*node.*true|env.*browser.*true/);
    });

    test('should have reasonable test coverage', () => {
      const testDir = join(process.cwd(), 'src', '__tests__');
      const realWorldTestDir = join(process.cwd(), 'src', '__tests__', 'real-world');
      
      if (existsSync(testDir)) {
        function countTestFiles(dir: string): number {
          let count = 0;
          const items = readdirSync(dir);
          
          for (const item of items) {
            const itemPath = join(dir, item);
            const stats = require('fs').statSync(itemPath);
            
            if (stats.isDirectory()) {
              count += countTestFiles(itemPath);
            } else if (item.endsWith('.test.ts') || item.endsWith('.test.js')) {
              count++;
            }
          }
          
          return count;
        }
        
        const testFileCount = countTestFiles(testDir);
        
        // Should have reasonable number of test files
        expect(testFileCount).toBeGreaterThan(5);
        expect(testFileCount).toBeLessThan(100);
        
        console.log(`Found ${testFileCount} test files`);
      }
    });
  });

  describe('Content Quality Validations', () => {
    test('should have proper blog post structure', () => {
      const blogDir = join(process.cwd(), 'src', 'content', 'blog');
      
      if (!existsSync(blogDir)) {
        console.warn('Blog directory not found, skipping content quality test');
        return;
      }
      
      const blogFiles = readdirSync(blogDir).filter(f => f.endsWith('.md'));
      
      blogFiles.forEach(file => {
        const filePath = join(blogDir, file);
        const content = readFileSync(filePath, 'utf8');
        
        // Should have frontmatter
        expect(content).toMatch(/^---\n[\s\S]*?\n---/);
        
        // Should have title in frontmatter
        expect(content).toMatch(/title:\s*['"]/);
        
        // Should have description in frontmatter
        expect(content).toMatch(/description:\s*['"]/);
        
        // Should have date in frontmatter
        expect(content).toMatch(/date:\s*['"]/);
        
        // Should have reasonable content after frontmatter
        const contentAfterFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
        expect(contentAfterFrontmatter.trim().length).toBeGreaterThan(100);
      });
    });

    test('should have proper image alt text', () => {
      const blogDir = join(process.cwd(), 'src', 'content', 'blog');
      
      if (!existsSync(blogDir)) {
        console.warn('Blog directory not found, skipping image alt test');
        return;
      }
      
      const blogFiles = readdirSync(blogDir).filter(f => f.endsWith('.md'));
      
      blogFiles.forEach(file => {
        const filePath = join(blogDir, file);
        const content = readFileSync(filePath, 'utf8');
        
        // Find all image references
        const imageMatches = content.match(/!\[([^\]]*)\]\([^)]+\)/g);
        
        if (imageMatches) {
          imageMatches.forEach(imageMatch => {
            const altTextMatch = imageMatch.match(/!\[([^\]]*)\]/);
            if (altTextMatch) {
              const altText = altTextMatch[1];
              
              // Alt text should not be empty
              expect(altText.trim().length).toBeGreaterThan(0);
              
              // Alt text should not be just the filename
              expect(altText).not.toMatch(/\.(jpg|jpeg|png|gif|webp|avif)$/i);
            }
          });
        }
      });
    });

    test('should have consistent heading structure', () => {
      const blogDir = join(process.cwd(), 'src', 'content', 'blog');
      
      if (!existsSync(blogDir)) {
        console.warn('Blog directory not found, skipping heading structure test');
        return;
      }
      
      const blogFiles = readdirSync(blogDir).filter(f => f.endsWith('.md'));
      
      blogFiles.forEach(file => {
        const filePath = join(blogDir, file);
        const content = readFileSync(filePath, 'utf8');
        
        // Remove frontmatter for analysis
        const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
        
        // Find all headings
        const headingMatches = contentWithoutFrontmatter.match(/^#{1,6}\s+.+$/gm);
        
        if (headingMatches) {
          const headingLevels = headingMatches.map(heading => {
            const match = heading.match(/^(#{1,6})/);
            return match ? match[1].length : 0;
          });
          
          // Should not start with H1 (handled by layout)
          if (headingLevels.length > 0) {
            expect(headingLevels[0]).not.toBe(1);
          }
          
          // Should not skip heading levels
          for (let i = 1; i < headingLevels.length; i++) {
            const currentLevel = headingLevels[i];
            const previousLevel = headingLevels[i - 1];
            
            // Should not jump more than one level
            expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
          }
        }
      });
    });
  });

  describe('Performance and Accessibility Quality', () => {
    test('should have proper meta tag configuration', () => {
      // Check if there's a base layout or meta component
      const possibleMetaFiles = [
        'src/layouts/BaseLayout.astro',
        'src/components/BaseHead.astro',
        'src/components/Meta.astro'
      ];
      
      const metaFile = possibleMetaFiles.find(file => existsSync(file));
      
      if (metaFile) {
        const content = readFileSync(metaFile, 'utf8');
        
        // Should have viewport meta tag
        expect(content).toMatch(/viewport.*width=device-width/);
        
        // Should have charset
        expect(content).toMatch(/charset.*utf-8/i);
        
        // Should have description meta tag
        expect(content).toMatch(/<meta.*name=["']description["']/);
      }
    });

    test('should have proper accessibility attributes', () => {
      const componentDirs = [
        'src/components',
        'src/layouts'
      ];
      
      componentDirs.forEach(dir => {
        if (!existsSync(dir)) return;
        
        const files = readdirSync(dir).filter(f => f.endsWith('.astro'));
        
        files.forEach(file => {
          const filePath = join(dir, file);
          const content = readFileSync(filePath, 'utf8');
          
          // If there are images, they should have alt attributes
          const imgMatches = content.match(/<img[^>]*>/g);
          if (imgMatches) {
            imgMatches.forEach(img => {
              expect(img).toMatch(/alt\s*=/);
            });
          }
          
          // If there are buttons, they should have proper labels
          const buttonMatches = content.match(/<button[^>]*>/g);
          if (buttonMatches) {
            buttonMatches.forEach(button => {
              const hasAriaLabel = button.includes('aria-label');
              const hasText = !button.includes('/>'); // Not self-closing
              expect(hasAriaLabel || hasText).toBe(true);
            });
          }
        });
      });
    });
  });
});
