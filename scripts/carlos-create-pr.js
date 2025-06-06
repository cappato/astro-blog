#!/usr/bin/env node

/**
 * Carlos Auto PR Creator
 * Created by Carlos (Carlitos) - Astro Blog Agent
 * 
 * Creates Pull Requests automatically using GitHub API
 * No user interaction required - fully automated
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const CONFIG = {
  owner: 'cappato',
  repo: 'astro-blog',
  defaultBaseBranch: 'main'
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

const getCurrentBranch = () => {
  return execCommand('git branch --show-current', { silent: true });
};

const getBranchInfo = () => {
  const infoPath = '.git/branch-info.json';
  if (existsSync(infoPath)) {
    try {
      return JSON.parse(readFileSync(infoPath, 'utf8'));
    } catch (error) {
      return null;
    }
  }
  return null;
};

const createPRWithCurl = async () => {
  const currentBranch = getCurrentBranch();
  const branchInfo = getBranchInfo();
  
  console.log(`🤖 Carlos creating PR for branch: ${currentBranch}`);
  
  // Determine PR type and template
  const branchType = currentBranch.split('/')[0];
  const isFeature = branchType === 'feat';
  const isFix = branchType === 'fix';
  
  // Create PR title
  const title = branchInfo ? 
    `${branchInfo.type}: ${branchInfo.description}` : 
    `${branchType}: ${currentBranch.split('/').slice(1).join(' ')}`;
  
  // Create PR body
  const prBody = `## 🤖 Automated PR by Carlos (Carlitos)

**Branch:** \`${currentBranch}\`
**Type:** ${branchType}
**Base:** ${CONFIG.defaultBaseBranch}

### 📋 Changes:
${branchInfo ? branchInfo.description : 'Automated changes by Carlos'}

### 🧪 Testing:
- [x] Automated tests will run
- [x] CI/CD pipeline will validate
- [x] Quality checks included

### 🔄 Automation:
- [x] Created automatically by Carlos
- [x] Will auto-merge when tests pass
- [x] Branch will be deleted after merge

---

**🤖 This PR was created automatically by Carlos (Carlitos) - Astro Blog Agent**
**⚡ Auto-merge enabled when all checks pass**`;

  // Prepare labels
  const labels = ['carlos:automated'];
  if (isFeature) labels.push('type:feature');
  if (isFix) labels.push('type:bugfix');
  labels.push('auto-merge');

  // Create PR data
  const prData = {
    title: title,
    body: prBody,
    head: currentBranch,
    base: CONFIG.defaultBaseBranch,
    draft: false
  };

  // Try to create PR with curl (GitHub API)
  const apiUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/pulls`;
  
  try {
    // First, check if we have a GitHub token
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.log('⚠️  No GITHUB_TOKEN found. Manual PR creation required.');
      console.log(`📋 PR URL: https://github.com/${CONFIG.owner}/${CONFIG.repo}/compare/${CONFIG.defaultBaseBranch}...${currentBranch}`);
      return;
    }

    // Create PR with curl
    const curlCommand = `curl -X POST \\
      -H "Authorization: token ${token}" \\
      -H "Accept: application/vnd.github.v3+json" \\
      -d '${JSON.stringify(prData)}' \\
      "${apiUrl}"`;

    const result = execCommand(curlCommand, { silent: true });
    
    if (result) {
      const prResponse = JSON.parse(result);
      if (prResponse.html_url) {
        console.log(`✅ PR created successfully: ${prResponse.html_url}`);
        
        // Add labels
        const labelsUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/issues/${prResponse.number}/labels`;
        const labelsCommand = `curl -X POST \\
          -H "Authorization: token ${token}" \\
          -H "Accept: application/vnd.github.v3+json" \\
          -d '${JSON.stringify(labels)}' \\
          "${labelsUrl}"`;
        
        execCommand(labelsCommand, { silent: true, ignoreError: true });
        console.log(`🏷️  Labels added: ${labels.join(', ')}`);
        
        return prResponse.html_url;
      }
    }
  } catch (error) {
    console.log('❌ Failed to create PR with API');
  }
  
  // Fallback: provide manual URL
  console.log('📋 Manual PR creation required:');
  console.log(`   URL: https://github.com/${CONFIG.owner}/${CONFIG.repo}/compare/${CONFIG.defaultBaseBranch}...${currentBranch}`);
  console.log(`   Title: ${title}`);
  console.log(`   Labels: ${labels.join(', ')}`);
};

const main = async () => {
  console.log('🤖 Carlos (Carlitos) - Automatic PR Creator\n');
  
  try {
    await createPRWithCurl();
    console.log('\n✅ PR creation process completed');
  } catch (error) {
    console.error('❌ Error creating PR:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createPRWithCurl };
