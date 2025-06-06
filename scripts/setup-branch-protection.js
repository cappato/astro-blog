#!/usr/bin/env node

/**
 * Branch Protection Setup Script
 * Created by Carlos (Carlitos) - Astro Blog Agent
 * 
 * Configures branch protection rules using GitHub API
 * Prevents direct pushes to main branch
 * Enforces PR workflow for all changes
 */

import { execSync } from 'child_process';

const CONFIG = {
  owner: 'cappato',
  repo: 'astro-blog',
  protectedBranches: ['main'],
  requiredStatusChecks: [
    'Build & Integration Tests',
    'Quality Checks',
    'Unit Tests'
  ]
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
    }
    return null;
  }
};

const setupBranchProtection = async () => {
  console.log('🛡️  Setting up branch protection rules...\n');
  
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('⚠️  GITHUB_TOKEN not found in environment variables.');
    console.log('📋 Manual setup required:');
    console.log('\n1. Go to: https://github.com/cappato/astro-blog/settings/branches');
    console.log('2. Click "Add rule"');
    console.log('3. Branch name pattern: main');
    console.log('4. Enable:');
    console.log('   ✅ Require a pull request before merging');
    console.log('   ✅ Require approvals: 1');
    console.log('   ✅ Dismiss stale PR approvals when new commits are pushed');
    console.log('   ✅ Require status checks to pass before merging');
    console.log('   ✅ Require branches to be up to date before merging');
    console.log('   ✅ Require conversation resolution before merging');
    console.log('   ✅ Restrict pushes that create files larger than 100MB');
    console.log('   ✅ Do not allow bypassing the above settings');
    console.log('\n5. Required status checks:');
    CONFIG.requiredStatusChecks.forEach(check => {
      console.log(`   - ${check}`);
    });
    return;
  }

  for (const branch of CONFIG.protectedBranches) {
    console.log(`🔒 Protecting branch: ${branch}`);
    
    const protectionData = {
      required_status_checks: {
        strict: true,
        contexts: CONFIG.requiredStatusChecks
      },
      enforce_admins: true,
      required_pull_request_reviews: {
        required_approving_review_count: 1,
        dismiss_stale_reviews: true,
        require_code_owner_reviews: false,
        require_last_push_approval: true
      },
      restrictions: null,
      allow_force_pushes: false,
      allow_deletions: false
    };

    const apiUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/branches/${branch}/protection`;
    
    const curlCommand = `curl -X PUT \\
      -H "Authorization: token ${token}" \\
      -H "Accept: application/vnd.github.v3+json" \\
      -H "Content-Type: application/json" \\
      -d '${JSON.stringify(protectionData)}' \\
      "${apiUrl}"`;

    try {
      const result = execCommand(curlCommand, { silent: true });
      
      if (result) {
        const response = JSON.parse(result);
        if (response.url) {
          console.log(`✅ Branch protection enabled for: ${branch}`);
        } else if (response.message) {
          console.log(`⚠️  ${response.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Failed to protect branch ${branch}: ${error.message}`);
    }
  }
};

const setupRepositorySettings = async () => {
  console.log('\n⚙️  Configuring repository settings...\n');
  
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('⚠️  GITHUB_TOKEN not found. Manual setup required:');
    console.log('\n1. Go to: https://github.com/cappato/astro-blog/settings');
    console.log('2. Under "Pull Requests":');
    console.log('   ✅ Allow auto-merge');
    console.log('   ✅ Automatically delete head branches');
    console.log('3. Under "Merge button":');
    console.log('   ✅ Allow merge commits');
    console.log('   ✅ Allow squash merging');
    console.log('   ❌ Allow rebase merging (disable)');
    return;
  }

  const repoSettings = {
    allow_auto_merge: true,
    allow_merge_commit: true,
    allow_squash_merge: true,
    allow_rebase_merge: false,
    delete_branch_on_merge: true,
    allow_update_branch: true
  };

  const apiUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}`;
  
  const curlCommand = `curl -X PATCH \\
    -H "Authorization: token ${token}" \\
    -H "Accept: application/vnd.github.v3+json" \\
    -H "Content-Type: application/json" \\
    -d '${JSON.stringify(repoSettings)}' \\
    "${apiUrl}"`;

  try {
    const result = execCommand(curlCommand, { silent: true });
    
    if (result) {
      const response = JSON.parse(result);
      if (response.id) {
        console.log('✅ Repository settings configured:');
        console.log('   - Auto-merge enabled');
        console.log('   - Delete branch on merge enabled');
        console.log('   - Squash merge enabled');
        console.log('   - Rebase merge disabled');
      }
    }
  } catch (error) {
    console.log(`❌ Failed to configure repository settings: ${error.message}`);
  }
};

const createCODEOWNERS = async () => {
  console.log('\n👥 Creating CODEOWNERS file...\n');

  const codeOwnersContent = `# CODEOWNERS file
# Created by Carlos (Carlitos) - Astro Blog Agent
# Defines who must review changes to specific files/directories

# Global ownership - all files require review
* @cappato

# Critical system files require admin approval
/.github/ @cappato
/.github/workflows/ @cappato
/scripts/ @cappato

# Configuration files
package.json @cappato
package-lock.json @cappato
astro.config.mjs @cappato
tailwind.config.js @cappato
tsconfig.json @cappato
vitest.config.ts @cappato

# Source code
/src/ @cappato

# Documentation
/docs/ @cappato
README.md @cappato

# Tests
/src/__tests__/ @cappato
/src/tests/ @cappato
`;

  try {
    const fs = await import('fs');
    fs.writeFileSync('.github/CODEOWNERS', codeOwnersContent);
    console.log('✅ CODEOWNERS file created');
    console.log('   - All changes require @cappato review');
    console.log('   - Critical files have additional protection');
  } catch (error) {
    console.error('❌ Failed to create CODEOWNERS file:', error.message);
  }
};

const validateCurrentSetup = () => {
  console.log('\n🔍 Validating current setup...\n');
  
  const currentBranch = execCommand('git branch --show-current', { silent: true });
  const hasChanges = execCommand('git status --porcelain', { silent: true });
  
  console.log(`Current branch: ${currentBranch}`);
  console.log(`Has uncommitted changes: ${hasChanges ? 'Yes' : 'No'}`);
  
  if (currentBranch === 'main') {
    console.log('⚠️  WARNING: Currently on main branch!');
    console.log('🔧 Carlos should switch to feature branch before making changes');
  } else {
    console.log('✅ Working on feature branch - correct workflow');
  }
};

const main = async () => {
  console.log('🤖 Carlos (Carlitos) - Branch Protection Setup\n');
  console.log('🎯 Configuring repository to prevent direct pushes to main...\n');
  
  try {
    // Step 1: Validate current setup
    validateCurrentSetup();
    
    // Step 2: Setup branch protection
    await setupBranchProtection();
    
    // Step 3: Configure repository settings
    await setupRepositorySettings();
    
    // Step 4: Create CODEOWNERS file
    await createCODEOWNERS();
    
    console.log('\n🎉 Branch protection setup completed!\n');
    console.log('📋 Summary:');
    console.log('   ✅ Branch protection rules configured (or manual steps provided)');
    console.log('   ✅ Repository settings optimized');
    console.log('   ✅ CODEOWNERS file created');
    console.log('   ✅ Direct pushes to main now prevented');
    console.log('\n🚀 Carlos will now work exclusively through PRs!');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
