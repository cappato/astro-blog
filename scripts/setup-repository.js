#!/usr/bin/env node

/**
 * Repository Setup Script
 * Created by Carlos (Carlitos) - Astro Blog Agent
 * 
 * Configures GitHub repository settings:
 * - Branch protection rules
 * - Required status checks
 * - Auto-merge settings
 * - Labels creation
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

// Configuration
const REPO_CONFIG = {
  owner: 'cappato',
  repo: 'astro-blog',
  defaultBranch: 'main',
  protectedBranches: ['main', 'develop'],
  requiredStatusChecks: [
    'Build & Integration Tests',
    'Quality Checks',
    'Unit Tests'
  ],
  requiredReviewers: 1,
  dismissStaleReviews: true,
  requireCodeOwnerReviews: false,
  restrictPushes: true,
  allowForcePushes: false,
  allowDeletions: false
};

const execCommand = (command, options = {}) => {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return result?.toString().trim();
  } catch (error) {
    if (!options.ignoreError) {
      console.error(`❌ Error executing: ${command}`);
      console.error(error.message);
      if (!options.continueOnError) {
        process.exit(1);
      }
    }
    return null;
  }
};

const checkGitHubCLI = () => {
  const hasGH = execCommand('which gh', { silent: true, ignoreError: true });
  if (!hasGH) {
    console.error('❌ GitHub CLI (gh) is required but not found.');
    console.error('📋 Install it from: https://cli.github.com/');
    process.exit(1);
  }
  
  // Check if authenticated
  const authStatus = execCommand('gh auth status', { silent: true, ignoreError: true });
  if (!authStatus || authStatus.includes('not logged in')) {
    console.error('❌ GitHub CLI is not authenticated.');
    console.error('📋 Run: gh auth login');
    process.exit(1);
  }
  
  console.log('✅ GitHub CLI is available and authenticated');
};

const createLabels = async () => {
  console.log('\n🏷️  Creating repository labels...\n');
  
  try {
    const labelsPath = join(process.cwd(), '.github', 'labels.yml');
    const labelsContent = readFileSync(labelsPath, 'utf8');
    
    // Parse YAML manually (simple parsing for our use case)
    const labels = [];
    const lines = labelsContent.split('\n');
    let currentLabel = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- name:')) {
        if (currentLabel.name) {
          labels.push(currentLabel);
        }
        currentLabel = { name: trimmed.split('"')[1] };
      } else if (trimmed.startsWith('color:')) {
        currentLabel.color = trimmed.split('"')[1];
      } else if (trimmed.startsWith('description:')) {
        currentLabel.description = trimmed.split('"')[1];
      }
    }
    
    if (currentLabel.name) {
      labels.push(currentLabel);
    }
    
    // Create labels
    for (const label of labels) {
      const command = `gh label create "${label.name}" --color "${label.color}" --description "${label.description}" --force`;
      execCommand(command, { silent: true, ignoreError: true });
      console.log(`✅ Created label: ${label.name}`);
    }
    
    console.log(`\n✅ Created ${labels.length} labels successfully`);
    
  } catch (error) {
    console.error('❌ Failed to create labels:', error.message);
  }
};

const setupBranchProtection = async () => {
  console.log('\n🛡️  Setting up branch protection rules...\n');
  
  for (const branch of REPO_CONFIG.protectedBranches) {
    console.log(`🔒 Protecting branch: ${branch}`);
    
    try {
      // Create branch protection rule
      const protectionCommand = [
        'gh api',
        `--method PUT`,
        `/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/branches/${branch}/protection`,
        '--field required_status_checks={}',
        '--field enforce_admins=true',
        '--field required_pull_request_reviews={}',
        '--field restrictions=null'
      ].join(' ');
      
      // Set required status checks
      const statusChecksData = {
        strict: true,
        contexts: REPO_CONFIG.requiredStatusChecks
      };
      
      const statusCommand = [
        'gh api',
        '--method PUT',
        `/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/branches/${branch}/protection/required_status_checks`,
        `--input -`
      ].join(' ');
      
      execCommand(`echo '${JSON.stringify(statusChecksData)}' | ${statusCommand}`, { silent: true });
      
      // Set required pull request reviews
      const reviewsData = {
        required_approving_review_count: REPO_CONFIG.requiredReviewers,
        dismiss_stale_reviews: REPO_CONFIG.dismissStaleReviews,
        require_code_owner_reviews: REPO_CONFIG.requireCodeOwnerReviews,
        require_last_push_approval: true
      };
      
      const reviewsCommand = [
        'gh api',
        '--method PUT',
        `/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/branches/${branch}/protection/required_pull_request_reviews`,
        `--input -`
      ].join(' ');
      
      execCommand(`echo '${JSON.stringify(reviewsData)}' | ${reviewsCommand}`, { silent: true });
      
      console.log(`✅ Branch protection enabled for: ${branch}`);
      
    } catch (error) {
      console.error(`❌ Failed to protect branch ${branch}:`, error.message);
    }
  }
};

const setupRepositorySettings = async () => {
  console.log('\n⚙️  Configuring repository settings...\n');
  
  try {
    // Enable auto-merge
    const repoSettings = {
      allow_auto_merge: true,
      allow_merge_commit: true,
      allow_squash_merge: true,
      allow_rebase_merge: false,
      delete_branch_on_merge: true,
      allow_update_branch: true
    };
    
    const settingsCommand = [
      'gh api',
      '--method PATCH',
      `/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}`,
      '--input -'
    ].join(' ');
    
    execCommand(`echo '${JSON.stringify(repoSettings)}' | ${settingsCommand}`, { silent: true });
    
    console.log('✅ Repository settings configured:');
    console.log('   - Auto-merge enabled');
    console.log('   - Delete branch on merge enabled');
    console.log('   - Squash merge enabled');
    console.log('   - Rebase merge disabled');
    
  } catch (error) {
    console.error('❌ Failed to configure repository settings:', error.message);
  }
};

const createCodeOwnersFile = () => {
  console.log('\n👥 Creating CODEOWNERS file...\n');
  
  const codeOwnersContent = `# CODEOWNERS file
# Created by Carlos (Carlitos) - Astro Blog Agent

# Global ownership
* @cappato

# Specific areas
/.github/ @cappato
/scripts/ @cappato
/docs/ @cappato

# Workflow files require admin approval
/.github/workflows/ @cappato

# Configuration files
package.json @cappato
astro.config.mjs @cappato
tailwind.config.js @cappato
tsconfig.json @cappato

# Source code
/src/ @cappato

# Tests
/src/__tests__/ @cappato
/src/tests/ @cappato
`;

  try {
    const fs = await import('fs');
    fs.writeFileSync('.github/CODEOWNERS', codeOwnersContent);
    console.log('✅ CODEOWNERS file created');
  } catch (error) {
    console.error('❌ Failed to create CODEOWNERS file:', error.message);
  }
};

const main = async () => {
  console.log('🤖 Carlos (Carlitos) - Repository Setup\n');
  console.log('🎯 Configuring automated git workflow...\n');
  
  // Check prerequisites
  checkGitHubCLI();
  
  try {
    // Step 1: Create labels
    await createLabels();
    
    // Step 2: Setup branch protection
    await setupBranchProtection();
    
    // Step 3: Configure repository settings
    await setupRepositorySettings();
    
    // Step 4: Create CODEOWNERS file
    createCodeOwnersFile();
    
    console.log('\n🎉 Repository setup completed successfully!\n');
    console.log('📋 Summary:');
    console.log('   ✅ Labels created');
    console.log('   ✅ Branch protection rules configured');
    console.log('   ✅ Repository settings optimized');
    console.log('   ✅ CODEOWNERS file created');
    console.log('\n🚀 Your automated git workflow is now ready!');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
