#!/usr/bin/env node

/**
 * Git Workflow Automation Script
 * Created by Carlos (Carlitos) - Astro Blog Agent
 * 
 * Automated git workflow management:
 * - Create feature branches automatically
 * - Conventional commit messages
 * - Auto-push and PR creation
 * - Branch cleanup and management
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import readline from 'readline';

// Configuration
const CONFIG = {
  branchTypes: {
    feat: 'New feature',
    fix: 'Bug fix',
    docs: 'Documentation',
    style: 'Code style changes',
    refactor: 'Code refactoring',
    test: 'Tests',
    chore: 'Maintenance'
  },
  conventionalCommits: true,
  autoCreatePR: true,
  autoMergePR: true,
  carlosMode: true, // Carlos works fully automated
  defaultBaseBranch: 'main',
  requireDescription: true
};

// Utility functions
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

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
      process.exit(1);
    }
    return null;
  }
};

const getCurrentBranch = () => {
  return execCommand('git branch --show-current', { silent: true });
};

const getBranchExists = (branchName) => {
  const result = execCommand(`git branch --list ${branchName}`, { silent: true, ignoreError: true });
  return result && result.trim().length > 0;
};

const getGitStatus = () => {
  return execCommand('git status --porcelain', { silent: true });
};

const hasUncommittedChanges = () => {
  const status = getGitStatus();
  return status && status.length > 0;
};

// Main workflow functions
async function createBranch() {
  console.log('\n🌿 Creating new branch...\n');
  
  // Check if we're on main/develop
  const currentBranch = getCurrentBranch();
  if (currentBranch !== 'main' && currentBranch !== 'develop') {
    console.log(`⚠️  Currently on branch: ${currentBranch}`);
    const switchToMain = await question('Switch to main branch first? (y/n): ');
    if (switchToMain.toLowerCase() === 'y') {
      execCommand('git checkout main');
      execCommand('git pull origin main');
    }
  }
  
  // Check for uncommitted changes
  if (hasUncommittedChanges()) {
    console.log('⚠️  You have uncommitted changes.');
    const stash = await question('Stash changes? (y/n): ');
    if (stash.toLowerCase() === 'y') {
      execCommand('git stash');
    } else {
      console.log('❌ Please commit or stash your changes first.');
      return;
    }
  }
  
  // Select branch type
  console.log('📋 Select branch type:');
  Object.entries(CONFIG.branchTypes).forEach(([key, desc], index) => {
    console.log(`${index + 1}. ${key} - ${desc}`);
  });
  
  const typeChoice = await question('\nEnter choice (1-7): ');
  const typeIndex = parseInt(typeChoice) - 1;
  const branchTypes = Object.keys(CONFIG.branchTypes);
  
  if (typeIndex < 0 || typeIndex >= branchTypes.length) {
    console.log('❌ Invalid choice');
    return;
  }
  
  const branchType = branchTypes[typeIndex];
  
  // Get branch description
  const description = await question(`Enter ${branchType} description: `);
  if (!description.trim()) {
    console.log('❌ Description is required');
    return;
  }
  
  // Create branch name
  const branchName = `${branchType}/${description.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}`;
  
  // Check if branch exists
  if (getBranchExists(branchName)) {
    console.log(`❌ Branch ${branchName} already exists`);
    return;
  }
  
  // Create and switch to branch
  console.log(`\n🚀 Creating branch: ${branchName}`);
  execCommand(`git checkout -b ${branchName}`);
  
  // Push branch to remote
  execCommand(`git push -u origin ${branchName}`);
  
  console.log(`✅ Branch ${branchName} created and pushed to remote`);
  
  // Save branch info for later use
  const branchInfo = {
    name: branchName,
    type: branchType,
    description: description,
    created: new Date().toISOString(),
    baseBranch: getCurrentBranch()
  };
  
  writeFileSync('.git/branch-info.json', JSON.stringify(branchInfo, null, 2));
  
  return branchName;
}

async function commitChanges() {
  console.log('\n📝 Committing changes...\n');
  
  // Check for changes
  if (!hasUncommittedChanges()) {
    console.log('ℹ️  No changes to commit');
    return;
  }
  
  // Show status
  console.log('📊 Current status:');
  execCommand('git status --short');
  
  // Get commit message
  const message = await question('\nEnter commit message: ');
  if (!message.trim()) {
    console.log('❌ Commit message is required');
    return;
  }
  
  // Add all changes
  execCommand('git add .');
  
  // Create conventional commit if enabled
  let commitMessage = message;
  if (CONFIG.conventionalCommits) {
    const branchInfo = getBranchInfo();
    if (branchInfo && branchInfo.type) {
      commitMessage = `${branchInfo.type}: ${message}`;
    }
  }
  
  // Commit
  execCommand(`git commit -m "${commitMessage}"`);
  
  console.log('✅ Changes committed successfully');
  return commitMessage;
}

function getBranchInfo() {
  const infoPath = '.git/branch-info.json';
  if (existsSync(infoPath)) {
    try {
      return JSON.parse(readFileSync(infoPath, 'utf8'));
    } catch (error) {
      return null;
    }
  }
  return null;
}

async function pushChanges() {
  console.log('\n🚀 Pushing changes...\n');

  const currentBranch = getCurrentBranch();

  // Push to remote
  execCommand(`git push origin ${currentBranch}`);

  console.log('✅ Changes pushed to remote');
}

async function createPullRequest() {
  console.log('\n🔄 Creating Pull Request...\n');

  const currentBranch = getCurrentBranch();
  const branchInfo = getBranchInfo();

  if (!branchInfo) {
    console.log('⚠️  No branch info found. Creating basic PR...');
  }

  // Check if GitHub CLI is available
  const hasGHCLI = execCommand('which gh', { silent: true, ignoreError: true });

  if (!hasGHCLI) {
    console.log('⚠️  GitHub CLI (gh) not found.');
    console.log('📋 Manual PR creation required:');
    console.log(`   Branch: ${currentBranch}`);
    console.log(`   Base: ${CONFIG.defaultBaseBranch}`);
    console.log(`   URL: https://github.com/cappato/astro-blog/compare/${CONFIG.defaultBaseBranch}...${currentBranch}`);
    return;
  }

  // Prepare PR details
  const title = branchInfo ?
    `${branchInfo.type}: ${branchInfo.description}` :
    `Update from ${currentBranch}`;

  const template = branchInfo?.type === 'feat' ? 'feature' :
                   branchInfo?.type === 'fix' ? 'bugfix' :
                   'default';

  // Create PR with GitHub CLI
  try {
    const prCommand = [
      'gh pr create',
      `--title "${title}"`,
      `--base ${CONFIG.defaultBaseBranch}`,
      `--head ${currentBranch}`,
      template !== 'default' ? `--template .github/PULL_REQUEST_TEMPLATE/${template}.md` : '',
      '--draft' // Create as draft initially
    ].filter(Boolean).join(' ');

    console.log(`🚀 Creating PR: ${title}`);
    const result = execCommand(prCommand, { silent: true });

    if (result) {
      console.log('✅ Pull Request created successfully!');
      console.log(`🔗 PR URL: ${result}`);

      // Add labels based on branch type
      if (branchInfo?.type) {
        const label = `type:${branchInfo.type}`;
        execCommand(`gh pr edit --add-label "${label}"`, { silent: true, ignoreError: true });
      }

      return result;
    }
  } catch (error) {
    console.log('❌ Failed to create PR with GitHub CLI');
    console.log('📋 Manual PR creation required:');
    console.log(`   URL: https://github.com/cappato/astro-blog/compare/${CONFIG.defaultBaseBranch}...${currentBranch}`);
  }
}

async function completeWorkflow() {
  console.log('\n🎯 Completing full workflow...\n');

  // Step 1: Commit changes
  const commitMessage = await commitChanges();
  if (!commitMessage) {
    console.log('❌ No changes to commit. Workflow stopped.');
    return;
  }

  // Step 2: Push changes
  await pushChanges();

  // Step 3: Create PR automatically (Carlos mode)
  if (CONFIG.autoCreatePR) {
    if (CONFIG.carlosMode) {
      console.log('🤖 Carlos mode: Creating PR automatically...');
      await createPullRequest();
    } else {
      const createPR = await question('Create Pull Request? (y/n): ');
      if (createPR.toLowerCase() === 'y') {
        await createPullRequest();
      }
    }
  }

  console.log('\n✅ Workflow completed successfully!');
}

// Export for use in other scripts
export {
  createBranch,
  commitChanges,
  pushChanges,
  createPullRequest,
  completeWorkflow,
  getCurrentBranch,
  hasUncommittedChanges,
  getBranchInfo
};

// CLI interface
async function main() {
  console.log('🤖 Carlos (Carlitos) - Git Workflow Automation\n');
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Available commands:');
    console.log('  create-branch  - Create new feature branch');
    console.log('  commit        - Commit current changes');
    console.log('  push          - Push changes to remote');
    console.log('  create-pr     - Create Pull Request');
    console.log('  status        - Show current status');
    console.log('  complete      - Complete workflow (commit + push + PR)');
    console.log('\nUsage: node scripts/git-workflow.js <command>');
    return;
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'create-branch':
        await createBranch();
        break;
      case 'commit':
        await commitChanges();
        break;
      case 'push':
        await pushChanges();
        break;
      case 'create-pr':
        await createPullRequest();
        break;
      case 'complete':
        await completeWorkflow();
        break;
      case 'status':
        console.log(`Current branch: ${getCurrentBranch()}`);
        console.log(`Has changes: ${hasUncommittedChanges() ? 'Yes' : 'No'}`);
        const info = getBranchInfo();
        if (info) {
          console.log(`Branch type: ${info.type}`);
          console.log(`Description: ${info.description}`);
        }
        break;
      default:
        console.log(`❌ Unknown command: ${command}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
