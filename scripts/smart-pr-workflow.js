#!/usr/bin/env node

/**
 * Smart PR Workflow
 * Automated workflow for creating high-quality PRs
 */

import { execSync } from 'child_process';
import { ProactiveValidator } from './validate-pr-ready.js';

class SmartPRWorkflow {
  constructor() {
    this.currentBranch = '';
  }

  async run() {
    console.log('🚀 SMART PR WORKFLOW\n');
    console.log('Automated workflow for creating high-quality PRs\n');
    
    try {
      await this.checkPrerequisites();
      await this.syncWithMain();
      await this.validateChanges();
      await this.createPR();
      
    } catch (error) {
      console.error('❌ Workflow failed:', error.message);
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    // Check if we're in a git repository
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Not in a git repository');
    }
    
    // Check if GitHub CLI is available
    try {
      execSync('gh --version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('GitHub CLI (gh) not found. Install: https://cli.github.com/');
    }
    
    // Get current branch
    this.currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    
    if (this.currentBranch === 'main') {
      throw new Error('Cannot create PR from main branch. Create a feature branch first.');
    }
    
    console.log(`✅ Prerequisites checked (branch: ${this.currentBranch})`);
  }

  async syncWithMain() {
    console.log('🔄 Syncing with main branch...');
    
    try {
      // Fetch latest changes
      console.log('  Fetching latest changes...');
      execSync('git fetch origin main', { stdio: 'pipe' });
      
      // Check if main needs updating
      const behindCount = execSync('git rev-list --count main..origin/main', { encoding: 'utf8' }).trim();
      
      if (parseInt(behindCount) > 0) {
        console.log(`  Main is ${behindCount} commits behind, updating...`);
        execSync('git checkout main', { stdio: 'pipe' });
        execSync('git pull origin main', { stdio: 'pipe' });
        execSync(`git checkout ${this.currentBranch}`, { stdio: 'pipe' });
        console.log('  ✅ Main updated and switched back to feature branch');
      } else {
        console.log('  ✅ Main is up to date');
      }
      
      // Check if current branch needs rebasing
      const branchBehind = execSync(`git rev-list --count ${this.currentBranch}..main`, { encoding: 'utf8' }).trim();
      
      if (parseInt(branchBehind) > 0) {
        console.log(`  Current branch is ${branchBehind} commits behind main`);
        console.log('  💡 Consider rebasing: git rebase main');
        console.log('  ⚠️  Proceeding without rebase (manual action required)');
      } else {
        console.log('  ✅ Current branch is up to date with main');
      }
      
    } catch (error) {
      console.warn('⚠️  Sync warning:', error.message);
      console.log('  Proceeding with PR creation...');
    }
  }

  async validateChanges() {
    console.log('🔍 Validating changes...');
    
    const validator = new ProactiveValidator();
    const isValid = await validator.validateAll();
    
    if (!isValid) {
      throw new Error('Validation failed. Fix errors above before creating PR.');
    }
    
    console.log('✅ All validations passed');
  }

  async createPR() {
    console.log('📝 Creating PR...');
    
    try {
      // Check if PR already exists
      const existingPR = execSync(
        `gh pr list --head ${this.currentBranch} --json number`, 
        { encoding: 'utf8' }
      );
      
      if (JSON.parse(existingPR).length > 0) {
        console.log('⚠️  PR already exists for this branch');
        const prNumber = JSON.parse(existingPR)[0].number;
        console.log(`🔗 PR #${prNumber}: https://github.com/cappato/astro-blog/pull/${prNumber}`);
        return;
      }
      
      // Create PR with auto-merge label
      console.log('  Creating PR with auto-merge label...');
      const result = execSync(
        'gh pr create --label "auto-merge" --fill', 
        { encoding: 'utf8' }
      );
      
      // Extract PR URL from result
      const prUrl = result.trim();
      console.log(`✅ PR created successfully: ${prUrl}`);
      
      // Report PR creation
      const prNumber = prUrl.split('/').pop();
      execSync(`npm run multi-agent:pr ${prUrl} "Smart PR Workflow"`, { stdio: 'inherit' });
      
    } catch (error) {
      throw new Error(`Failed to create PR: ${error.message}`);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const workflow = new SmartPRWorkflow();
  await workflow.run();
}

export { SmartPRWorkflow };
