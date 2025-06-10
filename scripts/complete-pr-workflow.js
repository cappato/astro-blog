#!/usr/bin/env node

/**
 * Complete PR Workflow - Unified Script
 * Executes the complete PR creation workflow without manual intervention
 * 
 * This script addresses the multiple conflicting workflows identified:
 * - AUTOMATION-GUIDE.md (deprecated git:* commands)
 * - pr-workflow.md (manual gh pr create sequence)
 * - git-workflow.js (git:complete but incomplete)
 * - validate-pr-ready.js (validation not automatic)
 */

const { execSync } = require('child_process');
const fs = require('fs');

class CompletePRWorkflow {
  constructor() {
    this.prUrl = null;
    this.prNumber = null;
    this.prTitle = null;
  }

  log(step, message) {
    console.log(`${step} ${message}`);
  }

  error(message) {
    console.error(`❌ ${message}`);
    process.exit(1);
  }

  execCommand(command, description) {
    try {
      this.log('⚡', `Executing: ${description}`);
      const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      return result;
    } catch (error) {
      this.error(`Failed to execute: ${description}\nCommand: ${command}\nError: ${error.message}`);
    }
  }

  async validatePRReadiness() {
    this.log('1️⃣', 'Validating PR readiness...');
    
    try {
      const validationResult = this.execCommand('npm run validate:pr', 'PR validation');
      
      // Check if validation passed
      if (validationResult.includes('ERROR') || validationResult.includes('FAILED')) {
        this.error('Validation failed. Fix issues before proceeding:\n' + validationResult);
      }
      
      this.log('✅', 'PR validation passed');
      return true;
    } catch (error) {
      // If validate:pr command doesn't exist, run basic checks
      this.log('⚠️', 'validate:pr command not found, running basic checks...');
      return this.runBasicValidation();
    }
  }

  runBasicValidation() {
    // Check if we're on a feature branch
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    if (currentBranch === 'main') {
      this.error('Cannot create PR from main branch. Create a feature branch first.');
    }

    // Check if there are changes to commit
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim() === '') {
        this.error('No changes to commit. Make some changes first.');
      }
    } catch (error) {
      this.error('Failed to check git status');
    }

    this.log('✅', 'Basic validation passed');
    return true;
  }

  async executeGitWorkflow() {
    this.log('2️⃣', 'Executing git workflow (commit + push + create PR)...');
    
    try {
      const gitResult = this.execCommand('npm run git:complete', 'Complete git workflow');
      
      // Extract PR URL from output
      const prUrlMatch = gitResult.match(/https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+\/pull\/\d+/);
      if (prUrlMatch) {
        this.prUrl = prUrlMatch[0];
        this.prNumber = this.prUrl.split('/').pop();
        this.log('✅', `PR created: ${this.prUrl}`);
        return true;
      }
      
      // If no URL found, try to get it from GitHub CLI
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const prList = execSync(`gh pr list --head ${currentBranch} --json url,number,title`, { encoding: 'utf8' });
      const prs = JSON.parse(prList);
      
      if (prs.length > 0) {
        this.prUrl = prs[0].url;
        this.prNumber = prs[0].number;
        this.prTitle = prs[0].title;
        this.log('✅', `Found existing PR: ${this.prUrl}`);
        return true;
      }
      
      this.error('Failed to create PR or find existing PR');
      
    } catch (error) {
      this.error(`Git workflow failed: ${error.message}`);
    }
  }

  async reportPR() {
    this.log('3️⃣', 'Reporting PR according to multi-agent protocol...');
    
    if (!this.prUrl) {
      this.log('⚠️', 'No PR URL available, skipping report');
      return;
    }

    try {
      const title = this.prTitle || 'PR Title';
      this.execCommand(
        `npm run multi-agent:pr "${this.prUrl}" "${title}"`,
        'Multi-agent PR report'
      );
      this.log('✅', 'PR reported successfully');
    } catch (error) {
      this.log('⚠️', `PR report failed (non-critical): ${error.message}`);
    }
  }

  async addAutoMergeLabel() {
    this.log('4️⃣', 'Adding auto-merge label...');
    
    if (!this.prNumber) {
      this.log('⚠️', 'No PR number available, skipping label');
      return;
    }

    try {
      this.execCommand(
        `gh pr edit ${this.prNumber} --add-label "auto-merge"`,
        'Add auto-merge label'
      );
      this.log('✅', 'Auto-merge label added');
    } catch (error) {
      this.log('⚠️', `Failed to add label (non-critical): ${error.message}`);
    }
  }

  async enableAutoMerge() {
    this.log('5️⃣', 'Enabling auto-merge...');
    
    if (!this.prNumber) {
      this.log('⚠️', 'No PR number available, skipping auto-merge');
      return;
    }

    try {
      this.execCommand(
        `gh pr merge ${this.prNumber} --auto --squash`,
        'Enable auto-merge'
      );
      this.log('✅', 'Auto-merge enabled');
    } catch (error) {
      this.log('⚠️', `Failed to enable auto-merge: ${error.message}`);
      this.log('ℹ️', 'You may need to enable auto-merge manually in the repository settings');
    }
  }

  async verifyFinalState() {
    this.log('6️⃣', 'Verifying final state...');
    
    if (!this.prNumber) {
      this.log('⚠️', 'No PR number available, skipping verification');
      return;
    }

    try {
      const prInfo = this.execCommand(
        `gh pr view ${this.prNumber} --json labels,autoMergeRequest,mergeable`,
        'Get PR info'
      );
      
      const pr = JSON.parse(prInfo);
      
      // Check labels
      const hasAutoMergeLabel = pr.labels.some(label => label.name === 'auto-merge');
      if (hasAutoMergeLabel) {
        this.log('✅', 'Auto-merge label confirmed');
      } else {
        this.log('⚠️', 'Auto-merge label not found');
      }
      
      // Check auto-merge status
      if (pr.autoMergeRequest) {
        this.log('✅', 'Auto-merge is enabled');
      } else {
        this.log('⚠️', 'Auto-merge is not enabled');
      }
      
      // Check if mergeable
      if (pr.mergeable === 'MERGEABLE') {
        this.log('✅', 'PR is mergeable');
      } else {
        this.log('⚠️', `PR mergeable status: ${pr.mergeable}`);
      }
      
    } catch (error) {
      this.log('⚠️', `Verification failed: ${error.message}`);
    }
  }

  async run() {
    console.log('🚀 Starting Complete PR Workflow...\n');
    console.log('📋 This workflow will:');
    console.log('   1. Validate PR readiness');
    console.log('   2. Execute git workflow (commit + push + create PR)');
    console.log('   3. Report PR according to multi-agent protocol');
    console.log('   4. Add auto-merge label');
    console.log('   5. Enable auto-merge');
    console.log('   6. Verify final state\n');

    try {
      await this.validatePRReadiness();
      await this.executeGitWorkflow();
      await this.reportPR();
      await this.addAutoMergeLabel();
      await this.enableAutoMerge();
      await this.verifyFinalState();

      console.log('\n🎉 Complete PR workflow finished successfully!');
      if (this.prUrl) {
        console.log(`🔗 PR URL: ${this.prUrl}`);
      }
      
    } catch (error) {
      this.error(`Workflow failed: ${error.message}`);
    }
  }
}

// Run the workflow
if (require.main === module) {
  const workflow = new CompletePRWorkflow();
  workflow.run();
}

module.exports = CompletePRWorkflow;
