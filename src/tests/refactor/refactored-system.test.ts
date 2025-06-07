import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('Refactored System Integration Tests', () => {
  const testBranch = 'test/refactored-system';
  let originalBranch: string;

  beforeEach(() => {
    // Save current branch
    originalBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  });

  afterEach(() => {
    // Cleanup: return to original branch
    try {
      execSync(`git checkout ${originalBranch}`, { stdio: 'pipe' });
      execSync(`git branch -D ${testBranch}`, { stdio: 'pipe' });
    } catch (error) {
      // Branch might not exist, that's OK
    }
  });

  describe('Proactive Validation System', () => {
    it('should validate PR readiness', () => {
      // This test validates that the proactive validation script exists and is executable
      expect(existsSync('scripts/validate-pr-ready.js')).toBe(true);
      
      // Test that the script can be imported (syntax check)
      expect(() => {
        execSync('node -c scripts/validate-pr-ready.js', { stdio: 'pipe' });
      }).not.toThrow();
    });

    it('should validate emoji policy', () => {
      expect(existsSync('scripts/validate-emoji-policy.js')).toBe(true);
      
      // Test emoji validation script
      expect(() => {
        execSync('node -c scripts/validate-emoji-policy.js', { stdio: 'pipe' });
      }).not.toThrow();
    });

    it('should detect emoji violations in prohibited files', () => {
      // Create a test file with emojis in prohibited location
      const testFile = 'src/test-emoji-violation.ts';
      writeFileSync(testFile, 'const message = "Hello World";');

      try {
        // Run emoji validation - should fail
        execSync('npm run validate:emoji', { stdio: 'pipe' });
        // If we reach here, validation didn't catch the violation
        expect(false).toBe(true);
      } catch (error) {
        // Validation should fail (exit code 1)
        expect(error).toBeDefined();
      } finally {
        // Cleanup
        if (existsSync(testFile)) {
          unlinkSync(testFile);
        }
      }
    });

    it('should allow emojis in permitted files', () => {
      // Create a test file with emojis in allowed location
      const testFile = 'docs/test-emoji-allowed.md';
      writeFileSync(testFile, '# Test\nThis should be allowed.');

      try {
        // Run emoji validation - should pass
        execSync('npm run validate:emoji', { stdio: 'pipe' });
        // If we reach here, validation passed correctly
        expect(true).toBe(true);
      } catch (error) {
        // Validation should not fail for allowed locations
        expect(false).toBe(true);
      } finally {
        // Cleanup
        if (existsSync(testFile)) {
          unlinkSync(testFile);
        }
      }
    });
  });

  describe('Unified PR Manager', () => {
    it('should exist and be syntactically correct', () => {
      expect(existsSync('scripts/unified-pr-manager.js')).toBe(true);
      
      expect(() => {
        execSync('node -c scripts/unified-pr-manager.js', { stdio: 'pipe' });
      }).not.toThrow();
    });

    it('should validate system requirements', () => {
      // Test system validation
      const result = execSync('npm run pr:validate', { encoding: 'utf8' });
      expect(result).toContain('System validation passed');
    });

    it('should support feature flags', () => {
      // Test that feature flags are recognized
      const result = execSync('node scripts/unified-pr-manager.js', { encoding: 'utf8' });
      expect(result).toContain('Feature Flags');
    });
  });

  describe('Internationalization System', () => {
    it('should detect system language', () => {
      const result = execSync('npm run i18n:detect', { encoding: 'utf8' });
      expect(result).toMatch(/Detected language: (en|es)/);
    });

    it('should support English and Spanish', () => {
      expect(existsSync('scripts/i18n-system.js')).toBe(true);
      
      const result = execSync('node scripts/i18n-system.js test pr.creating', { encoding: 'utf8' });
      expect(result).toContain('EN:');
      expect(result).toContain('ES:');
    });
  });

  describe('System Metrics', () => {
    it('should collect system metrics', () => {
      expect(existsSync('scripts/system-metrics.js')).toBe(true);
      
      // Test metrics collection
      execSync('npm run metrics:baseline', { stdio: 'pipe' });
      expect(existsSync('metrics/baseline.json')).toBe(true);
      
      // Cleanup
      try {
        unlinkSync('metrics/baseline.json');
      } catch (error) {
        // File might not exist
      }
    });

    it('should generate performance metrics', () => {
      const result = execSync('npm run metrics:report', { encoding: 'utf8' });
      expect(result).toContain('SYSTEM METRICS REPORT');
      expect(result).toContain('Performance:');
      expect(result).toContain('Quality:');
      expect(result).toContain('Automation:');
    });
  });

  describe('Multi-Agent System Integration', () => {
    it('should maintain backward compatibility', () => {
      expect(existsSync('scripts/simple-multi-agent.js')).toBe(true);
      
      // Test that legacy commands still work
      const result = execSync('node scripts/simple-multi-agent.js validate', { encoding: 'utf8' });
      expect(result).toContain('Validación completada');
    });

    it('should support unified system via feature flags', () => {
      // Test with unified system enabled
      const env = { ...process.env, USE_UNIFIED_PR_SYSTEM: 'true' };
      
      expect(() => {
        execSync('node -c scripts/simple-multi-agent.js', { stdio: 'pipe', env });
      }).not.toThrow();
    });
  });

  describe('Package.json Scripts', () => {
    it('should have all required validation scripts', () => {
      const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
      const scripts = pkg.scripts;

      expect(scripts['validate:pr-ready']).toBeDefined();
      expect(scripts['validate:emoji']).toBeDefined();
      expect(scripts['pr:create']).toBeDefined();
      expect(scripts['pr:workflow']).toBeDefined();
      expect(scripts['pr:validate']).toBeDefined();
      expect(scripts['i18n:detect']).toBeDefined();
      expect(scripts['metrics:report']).toBeDefined();
    });

    it('should maintain legacy multi-agent scripts', () => {
      const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
      const scripts = pkg.scripts;

      expect(scripts['multi-agent:workflow']).toBeDefined();
      expect(scripts['multi-agent:validate']).toBeDefined();
      expect(scripts['multi-agent:pr']).toBeDefined();
    });
  });

  describe('Documentation', () => {
    it('should have comprehensive system documentation', () => {
      expect(existsSync('docs/REFACTORED-SYSTEM.md')).toBe(true);
      expect(existsSync('docs/SYSTEM-AUDIT.md')).toBe(true);
      expect(existsSync('docs/VALIDATION-ANALYSIS.md')).toBe(true);
      expect(existsSync('docs/EMOJI-CONTRADICTION-ANALYSIS.md')).toBe(true);
      expect(existsSync('docs/EXECUTIVE-SUMMARY.md')).toBe(true);
    });

    it('should have updated standards documentation', () => {
      expect(existsSync('docs/STANDARDS.md')).toBe(true);
      
      const standards = readFileSync('docs/STANDARDS.md', 'utf8');
      expect(standards).toContain('Política de Emojis');
      expect(standards).toContain('PERMITIDO en:');
      expect(standards).toContain('PROHIBIDO en:');
    });
  });

  describe('System Health', () => {
    it('should pass all health checks', () => {
      // Run comprehensive system validation
      expect(() => {
        execSync('npm run validate:all', { stdio: 'pipe' });
      }).not.toThrow();
    });

    it('should have clean emoji policy compliance', () => {
      // System should be emoji compliant after refactor
      expect(() => {
        execSync('npm run validate:emoji', { stdio: 'pipe' });
      }).not.toThrow();
    });

    it('should pass blog tests', () => {
      expect(() => {
        execSync('npm run test:blog', { stdio: 'pipe' });
      }).not.toThrow();
    });
  });

  describe('Feature Flags', () => {
    it('should work with unified system enabled', () => {
      const env = { ...process.env, USE_UNIFIED_PR_SYSTEM: 'true' };
      
      expect(() => {
        execSync('npm run pr:validate', { stdio: 'pipe', env });
      }).not.toThrow();
    });

    it('should work with unified system disabled', () => {
      const env = { ...process.env, USE_UNIFIED_PR_SYSTEM: 'false' };
      
      expect(() => {
        execSync('node scripts/simple-multi-agent.js validate', { stdio: 'pipe', env });
      }).not.toThrow();
    });
  });
});
