#!/usr/bin/env node

/**
 * Local validation script for pre-PR checks
 * Runs all validations that would run in CI/CD locally
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running local validation checks...\n');

let hasErrors = false;

// Helper function to run commands
function runCommand(command, description) {
  try {
    console.log(`📋 ${description}...`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} passed\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed:`);
    console.log(error.stdout || error.message);
    console.log('');
    hasErrors = true;
    return false;
  }
}

// Helper function to validate commit messages
function validateCommitMessages() {
  try {
    console.log('📋 Validating commit messages...');
    
    // Get commits since main
    const commits = execSync('git log --oneline origin/main..HEAD', { encoding: 'utf8' })
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.substring(8)); // Remove commit hash
    
    if (commits.length === 0) {
      console.log('ℹ️  No new commits to validate\n');
      return true;
    }
    
    const validPrefixes = ['feat:', 'fix:', 'docs:', 'style:', 'refactor:', 'test:', 'chore:', 'perf:', 'ci:', 'build:'];
    const genericMessages = ['fix: changes', 'feat: updates', 'docs: update', 'chore: misc'];
    
    let allValid = true;
    
    commits.forEach((commit, index) => {
      const hasValidPrefix = validPrefixes.some(prefix => commit.toLowerCase().startsWith(prefix));
      const isGeneric = genericMessages.some(generic => commit.toLowerCase() === generic);
      
      if (!hasValidPrefix) {
        console.log(`❌ Commit ${index + 1}: "${commit}" - Invalid format`);
        allValid = false;
      } else if (isGeneric) {
        console.log(`❌ Commit ${index + 1}: "${commit}" - Too generic`);
        allValid = false;
      } else {
        console.log(`✅ Commit ${index + 1}: "${commit}"`);
      }
    });
    
    if (allValid) {
      console.log(`✅ All ${commits.length} commit(s) follow conventional format\n`);
    } else {
      console.log(`❌ Some commits don't follow conventional format\n`);
      hasErrors = true;
    }
    
    return allValid;
  } catch (error) {
    console.log(`❌ Failed to validate commits: ${error.message}\n`);
    hasErrors = true;
    return false;
  }
}

// Helper function to check if we're in a git repository
function checkGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    return true;
  } catch {
    console.log('❌ Not in a git repository\n');
    hasErrors = true;
    return false;
  }
}

// Main validation function
async function runValidation() {
  console.log('🚀 Local Pre-PR Validation\n');
  
  // Check if we're in a git repo
  if (!checkGitRepo()) {
    return;
  }
  
  // Validate commit messages
  validateCommitMessages();
  
  // Check if package.json exists for Node.js projects
  if (fs.existsSync('package.json')) {
    // Run linting if available
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (packageJson.scripts?.lint) {
        runCommand('npm run lint', 'Linting code');
      }
      
      if (packageJson.scripts?.test) {
        runCommand('npm test', 'Running tests');
      }
      
      if (packageJson.scripts?.build) {
        runCommand('npm run build', 'Building project');
      }
    } catch (error) {
      console.log(`⚠️  Could not read package.json: ${error.message}\n`);
    }
  }
  
  // Check for common issues
  console.log('📋 Checking for common issues...');
  
  // Check for large files
  try {
    const largeFiles = execSync('find . -type f -size +10M -not -path "./.git/*" -not -path "./node_modules/*"', { encoding: 'utf8' })
      .split('\n')
      .filter(line => line.trim());
    
    if (largeFiles.length > 0) {
      console.log('⚠️  Large files detected (>10MB):');
      largeFiles.forEach(file => console.log(`   - ${file}`));
      console.log('');
    } else {
      console.log('✅ No large files detected');
    }
  } catch (error) {
    // Ignore errors for this check
  }
  
  // Summary
  console.log('📊 Validation Summary');
  console.log('='.repeat(50));
  
  if (hasErrors) {
    console.log('❌ Validation failed! Please fix the issues above before creating a PR.');
    process.exit(1);
  } else {
    console.log('✅ All validations passed! Ready to create PR.');
    console.log('\nNext steps:');
    console.log('1. git push origin <branch-name>');
    console.log('2. node scripts/create-pr.js');
  }
}

// Run validation
runValidation().catch(error => {
  console.error('❌ Validation script failed:', error);
  process.exit(1);
});
