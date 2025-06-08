#!/usr/bin/env node

/**
 * Compare CI vs Local Results
 * Quick comparison of CI failures with local test results
 */

import { execSync } from 'child_process';

const prNumber = process.argv[2] || '82';

console.log(`Comparing CI vs Local for PR #${prNumber}`);
console.log('='.repeat(50));

// Function to run command safely
function runCommand(cmd, description) {
  try {
    console.log(`Running: ${description}...`);
    const result = execSync(cmd, { 
      encoding: 'utf8', 
      timeout: 60000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout || error.stderr || error.message 
    };
  }
}

async function main() {
  // 1. Get CI status
  console.log('\n1. CI Status:');
  console.log('-'.repeat(30));
  
  const ciStatus = runCommand(
    `gh pr view ${prNumber} --json statusCheckRollup --jq '.statusCheckRollup | map(select(.conclusion == "FAILURE")) | length'`,
    'Getting CI failures'
  );
  
  if (ciStatus.success) {
    const failedCount = parseInt(ciStatus.output.trim()) || 0;
    console.log(`   CI Failed Checks: ${failedCount}`);
  } else {
    console.log('   Could not get CI status');
  }

  // 2. Run local unit tests
  console.log('\n2. Local Unit Tests:');
  console.log('-'.repeat(30));
  
  const localTests = runCommand('npm run test:unit', 'Local unit tests');
  
  if (localTests.success) {
    console.log('   LOCAL TESTS: PASSED');
    // Try to extract summary
    const lines = localTests.output.split('\n');
    const summaryLine = lines.find(line => line.includes('Test Files') && line.includes('Tests'));
    if (summaryLine) {
      console.log(`   Summary: ${summaryLine.trim()}`);
    }
  } else {
    console.log('   LOCAL TESTS: FAILED');
    // Extract key error info
    const lines = localTests.output.split('\n');
    const summaryLine = lines.find(line => line.includes('Test Files') && line.includes('Tests'));
    if (summaryLine) {
      console.log(`   Summary: ${summaryLine.trim()}`);
    }
    
    // Show first few failures
    const failLines = lines.filter(line => 
      line.includes('FAIL') || 
      line.includes('Error:') ||
      line.includes('AssertionError')
    ).slice(0, 3);
    
    if (failLines.length > 0) {
      console.log('   Key failures:');
      failLines.forEach(line => console.log(`     ${line.trim()}`));
    }
  }

  // 3. Run local build
  console.log('\n3. Local Build:');
  console.log('-'.repeat(30));
  
  const localBuild = runCommand('npm run build', 'Local build');
  
  if (localBuild.success) {
    console.log('   LOCAL BUILD: PASSED');
  } else {
    console.log('   LOCAL BUILD: FAILED');
    // Show build errors
    const lines = localBuild.output.split('\n');
    const errorLines = lines.filter(line => 
      line.includes('error') || 
      line.includes('Error') ||
      line.includes('failed')
    ).slice(0, 5);
    
    if (errorLines.length > 0) {
      console.log('   Build errors:');
      errorLines.forEach(line => console.log(`     ${line.trim()}`));
    }
  }

  // 4. Analysis and recommendations
  console.log('\n4. Analysis:');
  console.log('-'.repeat(30));
  
  if (ciStatus.success) {
    const ciFailures = parseInt(ciStatus.output.trim()) || 0;
    
    if (ciFailures > 0 && localTests.success && localBuild.success) {
      console.log('   ISSUE: CI failing but local tests/build pass');
      console.log('   Possible causes:');
      console.log('   - Environment differences (Node version, dependencies)');
      console.log('   - Missing environment variables in CI');
      console.log('   - File path or permission issues');
      console.log('   - CI-specific configuration problems');
      
    } else if (ciFailures > 0 && (!localTests.success || !localBuild.success)) {
      console.log('   CONSISTENT: Both CI and local have issues');
      console.log('   Fix local issues first, then push changes');
      
    } else if (ciFailures === 0) {
      console.log('   SUCCESS: CI checks are passing');
      
    } else {
      console.log('   MIXED: Some issues detected');
    }
  }

  console.log('\n5. Next Steps:');
  console.log('-'.repeat(30));
  
  if (!localTests.success) {
    console.log('   1. Fix local test failures first');
    console.log('   2. Focus on mock configuration issues');
    console.log('   3. Check test setup files');
  }
  
  if (!localBuild.success) {
    console.log('   1. Fix local build issues');
    console.log('   2. Check TypeScript errors');
    console.log('   3. Verify dependencies');
  }
  
  if (localTests.success && localBuild.success && ciStatus.success) {
    const ciFailures = parseInt(ciStatus.output.trim()) || 0;
    if (ciFailures > 0) {
      console.log('   1. Check CI logs for environment-specific issues');
      console.log('   2. Compare Node.js versions');
      console.log('   3. Verify CI configuration files');
      console.log(`   4. View detailed logs: gh pr view ${prNumber}`);
    }
  }

  console.log('\n6. Quick Commands:');
  console.log('-'.repeat(30));
  console.log(`   gh pr view ${prNumber}                    # View PR details`);
  console.log('   npm run test:unit                        # Run unit tests');
  console.log('   npm run build                            # Test build');
  console.log('   node scripts/compare-ci-local.js         # Run this script again');
}

main().catch(error => {
  console.error('Script error:', error.message);
  process.exit(1);
});
