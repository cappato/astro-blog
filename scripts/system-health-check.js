#!/usr/bin/env node

/**
 * Sistema de Health Check Completo
 * Valida que todo esté funcionando ANTES del refactor
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const HEALTH_CHECKS = {
  // Scripts existentes
  scripts: [
    'scripts/simple-multi-agent.js',
    'scripts/create-pr.js', 
    'scripts/git-workflow.js',
    'scripts/install-git-hooks.js'
  ],
  
  // GitHub Actions
  workflows: [
    '.github/workflows/pr-automation.yml',
    '.github/workflows/pr-size-check.yml',
    '.github/workflows/automated-testing.yml'
  ],
  
  // Git Hooks
  hooks: [
    '.githooks/pre-push',
    '.git/hooks/pre-push',
    '.git/hooks/commit-msg'
  ],
  
  // Templates
  templates: [
    '.github/pull_request_template.md',
    '.github/PULL_REQUEST_TEMPLATE/feature.md',
    '.github/PULL_REQUEST_TEMPLATE/bugfix.md'
  ],
  
  // Package.json scripts
  npmScripts: [
    'test:blog',
    'multi-agent:pr',
    'multi-agent:workflow'
  ]
};

class SystemHealthChecker {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async runAllChecks() {
    console.log('🔍 SYSTEM HEALTH CHECK - Pre-Refactor Validation\n');
    
    await this.checkFileExistence();
    await this.checkScriptExecutability();
    await this.checkGitHooks();
    await this.checkGitHubActions();
    await this.checkNpmScripts();
    await this.checkPRCreation();
    await this.checkValidationRules();
    
    this.printResults();
    return this.results.failed.length === 0;
  }

  async checkFileExistence() {
    console.log('📁 Checking file existence...');
    
    const allFiles = [
      ...HEALTH_CHECKS.scripts,
      ...HEALTH_CHECKS.workflows,
      ...HEALTH_CHECKS.templates
    ];
    
    for (const file of allFiles) {
      if (existsSync(file)) {
        this.results.passed.push(`✅ File exists: ${file}`);
      } else {
        this.results.failed.push(`❌ Missing file: ${file}`);
      }
    }
  }

  async checkScriptExecutability() {
    console.log('🔧 Checking script executability...');
    
    for (const script of HEALTH_CHECKS.scripts) {
      try {
        // Test if script can be imported/executed
        const result = execSync(`node -c ${script}`, { encoding: 'utf8' });
        this.results.passed.push(`✅ Script syntax OK: ${script}`);
      } catch (error) {
        this.results.failed.push(`❌ Script syntax error: ${script} - ${error.message}`);
      }
    }
  }

  async checkGitHooks() {
    console.log('🪝 Checking Git hooks...');
    
    // Check if hooks are installed
    const hookFiles = ['.git/hooks/pre-push', '.git/hooks/commit-msg'];
    
    for (const hook of hookFiles) {
      if (existsSync(hook)) {
        try {
          const content = readFileSync(hook, 'utf8');
          if (content.includes('#!/bin/bash') || content.includes('#!/bin/sh')) {
            this.results.passed.push(`✅ Git hook active: ${hook}`);
          } else {
            this.results.warnings.push(`⚠️  Git hook exists but may not be executable: ${hook}`);
          }
        } catch (error) {
          this.results.failed.push(`❌ Cannot read git hook: ${hook}`);
        }
      } else {
        this.results.warnings.push(`⚠️  Git hook not installed: ${hook}`);
      }
    }
  }

  async checkGitHubActions() {
    console.log('⚙️  Checking GitHub Actions...');
    
    for (const workflow of HEALTH_CHECKS.workflows) {
      if (existsSync(workflow)) {
        try {
          const content = readFileSync(workflow, 'utf8');
          
          // Basic YAML validation
          if (content.includes('name:') && content.includes('on:')) {
            this.results.passed.push(`✅ Workflow syntax OK: ${workflow}`);
          } else {
            this.results.failed.push(`❌ Invalid workflow syntax: ${workflow}`);
          }
          
          // Check for common issues
          if (content.includes('CLOUDFLARE_API_TOKEN') && !content.includes('workflow_dispatch')) {
            this.results.warnings.push(`⚠️  Workflow may have secret issues: ${workflow}`);
          }
          
        } catch (error) {
          this.results.failed.push(`❌ Cannot read workflow: ${workflow}`);
        }
      }
    }
  }

  async checkNpmScripts() {
    console.log('📦 Checking npm scripts...');
    
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const scripts = packageJson.scripts || {};
      
      for (const scriptName of HEALTH_CHECKS.npmScripts) {
        if (scripts[scriptName]) {
          this.results.passed.push(`✅ npm script exists: ${scriptName}`);
        } else {
          this.results.failed.push(`❌ Missing npm script: ${scriptName}`);
        }
      }
    } catch (error) {
      this.results.failed.push(`❌ Cannot read package.json: ${error.message}`);
    }
  }

  async checkPRCreation() {
    console.log('🔄 Testing PR creation capability...');
    
    try {
      // Check if we can access GitHub CLI
      execSync('gh --version', { encoding: 'utf8' });
      this.results.passed.push('✅ GitHub CLI available');
      
      // Check authentication
      const authStatus = execSync('gh auth status', { encoding: 'utf8' });
      if (authStatus.includes('Logged in')) {
        this.results.passed.push('✅ GitHub CLI authenticated');
      } else {
        this.results.failed.push('❌ GitHub CLI not authenticated');
      }
      
    } catch (error) {
      this.results.failed.push('❌ GitHub CLI not available or not authenticated');
    }
  }

  async checkValidationRules() {
    console.log('📏 Checking validation rules...');
    
    // Check if PR size validation is working
    const prSizeWorkflow = '.github/workflows/pr-size-check.yml';
    if (existsSync(prSizeWorkflow)) {
      const content = readFileSync(prSizeWorkflow, 'utf8');
      if (content.includes('lines') && content.includes('files')) {
        this.results.passed.push('✅ PR size validation configured');
      } else {
        this.results.warnings.push('⚠️  PR size validation may be incomplete');
      }
    }
    
    // Check emoji validation
    const standards = 'docs/STANDARDS.md';
    if (existsSync(standards)) {
      const content = readFileSync(standards, 'utf8');
      if (content.includes('emoji')) {
        this.results.passed.push('✅ Emoji standards documented');
      } else {
        this.results.warnings.push('⚠️  Emoji standards not clearly documented');
      }
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SYSTEM HEALTH CHECK RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n✅ PASSED (${this.results.passed.length}):`);
    this.results.passed.forEach(item => console.log(`  ${item}`));
    
    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.results.warnings.length}):`);
      this.results.warnings.forEach(item => console.log(`  ${item}`));
    }
    
    if (this.results.failed.length > 0) {
      console.log(`\n❌ FAILED (${this.results.failed.length}):`);
      this.results.failed.forEach(item => console.log(`  ${item}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.results.failed.length === 0) {
      console.log('🎉 SYSTEM HEALTH: GOOD - Safe to proceed with refactor');
    } else {
      console.log('🚨 SYSTEM HEALTH: ISSUES DETECTED - Fix before refactoring');
      console.log('\n💡 Recommendation: Address failed checks before starting refactor');
    }
    
    console.log('='.repeat(60));
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new SystemHealthChecker();
  const isHealthy = await checker.runAllChecks();
  process.exit(isHealthy ? 0 : 1);
}

export { SystemHealthChecker };
