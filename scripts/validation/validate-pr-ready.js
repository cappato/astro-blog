#!/usr/bin/env node

/**
 * Validación Proactiva de PR
 * Valida ANTES de crear el PR para feedback inmediato
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { EmojiPolicyValidator } from './validate-emoji-policy.js';

class ProactiveValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  async validateAll() {
    console.log('🔍 PROACTIVE PR VALIDATION\n');
    console.log('⚡ Validating BEFORE creating PR for immediate feedback...\n');
    
    await this.validateGitStatus();
    await this.validatePRSize();
    await this.validateEmojiPolicy();
    await this.validateConventionalCommits();
    await this.validateFileNames();
    await this.validateTests();
    
    this.printResults();
    return this.errors.length === 0;
  }

  async validateGitStatus() {
    console.log('📋 Checking git status...');
    
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      
      if (!status.trim()) {
        this.addError('No changes to commit', 'Make some changes before creating a PR');
        return;
      }
      
      // Check for uncommitted changes
      const uncommitted = status.split('\n').filter(line => 
        line.trim() && !line.startsWith('??')
      );
      
      if (uncommitted.length > 0) {
        this.addWarning('Uncommitted changes detected', 'Consider committing changes before creating PR');
      }
      
      this.addInfo(`Changes detected: ${status.split('\n').filter(l => l.trim()).length} files`);
      
    } catch (error) {
      this.addError('Git status check failed', error.message);
    }
  }

  async validatePRSize() {
    console.log('📏 Checking PR size...');
    
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const baseBranch = 'main';
      
      // Get changed files
      const changedFiles = execSync(
        `git diff --name-only ${baseBranch}...${currentBranch}`, 
        { encoding: 'utf8' }
      ).split('\n').filter(f => f.trim());
      
      // Get line changes
      const diffStats = execSync(
        `git diff --stat ${baseBranch}...${currentBranch}`, 
        { encoding: 'utf8' }
      );
      
      const lineMatch = diffStats.match(/(\d+) insertions?\(\+\), (\d+) deletions?\(-\)/);
      const totalLines = lineMatch ? parseInt(lineMatch[1]) + parseInt(lineMatch[2]) : 0;
      
      // Detect PR type for intelligent limits
      const prType = this.detectPRType(changedFiles);
      const limits = this.getPRLimits(prType);
      
      this.addInfo(`PR Type: ${prType}`);
      this.addInfo(`Files changed: ${changedFiles.length}/${limits.files}`);
      this.addInfo(`Lines changed: ${totalLines}/${limits.lines}`);
      
      // Validate against limits
      if (changedFiles.length > limits.files) {
        this.addError(
          `Too many files changed: ${changedFiles.length} > ${limits.files}`,
          `Consider splitting into smaller PRs. Current type: ${prType}`
        );
      }
      
      if (totalLines > limits.lines) {
        this.addError(
          `Too many lines changed: ${totalLines} > ${limits.lines}`,
          `Consider splitting into smaller PRs. Current type: ${prType}`
        );
      }
      
      if (changedFiles.length > limits.files * 0.8 || totalLines > limits.lines * 0.8) {
        this.addWarning(
          'PR approaching size limits',
          'Consider if this can be split into smaller, more focused PRs'
        );
      }
      
    } catch (error) {
      this.addError('PR size validation failed', error.message);
    }
  }

  detectPRType(changedFiles) {
    const docFiles = changedFiles.filter(f => 
      f.startsWith('docs/') || f.includes('README') || f.includes('.md')
    ).length;
    
    const srcFiles = changedFiles.filter(f => 
      f.startsWith('src/') || f.includes('.ts') || f.includes('.js')
    ).length;
    
    const configFiles = changedFiles.filter(f => 
      f.includes('.json') || f.includes('.yml') || f.includes('config')
    ).length;
    
    const testFiles = changedFiles.filter(f => 
      f.includes('test') || f.includes('.spec.') || f.includes('.test.')
    ).length;
    
    if (docFiles > srcFiles && docFiles > 0) {
      if (srcFiles > 0) return 'docs+refactor';
      return 'docs';
    }
    
    if (testFiles > 0 && srcFiles > 0) return 'feature+tests';
    if (testFiles > 0) return 'tests';
    if (configFiles > 0 && srcFiles > 0) return 'config+feature';
    if (srcFiles > 0) return 'feature';
    if (configFiles > 0) return 'config';
    
    return 'default';
  }

  getPRLimits(prType) {
    const limits = {
      'docs': { files: 12, lines: 400 },
      'docs+refactor': { files: 15, lines: 500 },
      'feature+tests': { files: 12, lines: 350 },
      'config+feature': { files: 10, lines: 300 },
      'feature': { files: 8, lines: 250 },
      'tests': { files: 6, lines: 200 },
      'config': { files: 5, lines: 150 },
      'default': { files: 8, lines: 250 }
    };
    
    return limits[prType] || limits.default;
  }

  async validateEmojiPolicy() {
    console.log('😀 Checking emoji policy...');
    
    try {
      const validator = new EmojiPolicyValidator();
      const isCompliant = validator.validate();
      
      if (!isCompliant) {
        this.addError('Emoji policy violations detected', 'Run: node scripts/validate-emoji-policy.js for details');
      } else {
        this.addInfo('Emoji policy: compliant');
      }
      
    } catch (error) {
      this.addWarning('Emoji validation failed', error.message);
    }
  }

  async validateConventionalCommits() {
    console.log('📝 Checking conventional commits...');
    
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const commits = execSync(
        `git log main..${currentBranch} --pretty=format:"%s"`, 
        { encoding: 'utf8' }
      ).split('\n').filter(c => c.trim());
      
      const conventionalPattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+/;
      
      const invalidCommits = commits.filter(commit => !conventionalPattern.test(commit));
      
      if (invalidCommits.length > 0) {
        this.addError(
          `${invalidCommits.length} commits don't follow conventional format`,
          `Invalid: ${invalidCommits.slice(0, 3).join(', ')}${invalidCommits.length > 3 ? '...' : ''}`
        );
      } else {
        this.addInfo(`All ${commits.length} commits follow conventional format`);
      }
      
    } catch (error) {
      this.addWarning('Conventional commits check failed', error.message);
    }
  }

  async validateFileNames() {
    console.log('📁 Checking file names...');
    
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const changedFiles = execSync(
        `git diff --name-only main...${currentBranch}`, 
        { encoding: 'utf8' }
      ).split('\n').filter(f => f.trim());
      
      const problematicFiles = changedFiles.filter(file => {
        // Check for accented characters and special chars
        return /[áéíóúñüÁÉÍÓÚÑÜ]/.test(file) || /[^\w\-\.\/]/.test(file);
      });
      
      if (problematicFiles.length > 0) {
        this.addError(
          'Files with problematic names detected',
          `Files: ${problematicFiles.join(', ')}`
        );
      } else {
        this.addInfo('All file names are valid');
      }
      
    } catch (error) {
      this.addWarning('File name validation failed', error.message);
    }
  }

  async validateTests() {
    console.log('🧪 Running tests...');
    
    try {
      execSync('npm run test:blog', { encoding: 'utf8', stdio: 'pipe' });
      this.addInfo('All tests passed');
      
    } catch (error) {
      this.addError('Tests failed', 'Fix failing tests before creating PR');
    }
  }

  addError(message, details = '') {
    this.errors.push({ message, details });
    console.log(`  ❌ ${message}`);
    if (details) console.log(`     💡 ${details}`);
  }

  addWarning(message, details = '') {
    this.warnings.push({ message, details });
    console.log(`  ⚠️  ${message}`);
    if (details) console.log(`     💡 ${details}`);
  }

  addInfo(message) {
    this.info.push(message);
    console.log(`  ✅ ${message}`);
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('⚡ PROACTIVE VALIDATION RESULTS');
    console.log('='.repeat(60));
    
    if (this.errors.length === 0) {
      console.log('\n🎉 ALL VALIDATIONS PASSED!');
      console.log('✅ Ready to create PR');
      
      if (this.warnings.length > 0) {
        console.log(`\n⚠️  ${this.warnings.length} warnings (non-blocking):`);
        this.warnings.forEach(w => console.log(`  • ${w.message}`));
      }
      
    } else {
      console.log(`\n❌ ${this.errors.length} ERRORS DETECTED:`);
      this.errors.forEach(e => {
        console.log(`  • ${e.message}`);
        if (e.details) console.log(`    ${e.details}`);
      });
      
      console.log('\n🚫 NOT READY FOR PR');
      console.log('💡 Fix errors above before creating PR');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary: ${this.info.length} checks passed, ${this.warnings.length} warnings, ${this.errors.length} errors`);
    console.log('='.repeat(60));
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ProactiveValidator();
  const isReady = await validator.validateAll();
  process.exit(isReady ? 0 : 1);
}

export { ProactiveValidator };
