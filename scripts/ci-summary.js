#!/usr/bin/env node

/**
 * CI Summary Script
 * Quick analysis of CI status and recommendations
 */

import { execSync } from 'child_process';

const prNumber = process.argv[2] || '82';

console.log(`CI Analysis Summary for PR #${prNumber}`);
console.log('='.repeat(50));

function runQuickCommand(cmd) {
  try {
    const result = execSync(cmd, { 
      encoding: 'utf8', 
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result.trim();
  } catch (error) {
    return null;
  }
}

// Get CI status using the API approach that worked
console.log('Getting CI status...');

try {
  const token = process.env.GITHUB_TOKEN || execSync('gh auth token', { encoding: 'utf8' }).trim();
  
  // Get PR info
  const prResult = execSync(`curl -s -H "Authorization: token ${token}" "https://api.github.com/repos/cappato/astro-blog/pulls/${prNumber}"`, { encoding: 'utf8' });
  const pr = JSON.parse(prResult);
  
  console.log('\nPR Information:');
  console.log('-'.repeat(30));
  console.log(`Title: ${pr.title}`);
  console.log(`Branch: ${pr.head.ref}`);
  console.log(`Author: ${pr.user.login}`);
  console.log(`Updated: ${new Date(pr.updated_at).toLocaleString()}`);

  // Get check runs
  const checksResult = execSync(`curl -s -H "Authorization: token ${token}" "https://api.github.com/repos/cappato/astro-blog/commits/${pr.head.sha}/check-runs"`, { encoding: 'utf8' });
  const checksData = JSON.parse(checksResult);
  const checks = checksData.check_runs || [];
  
  const failed = checks.filter(c => c.conclusion === 'failure');
  const success = checks.filter(c => c.conclusion === 'success');
  const skipped = checks.filter(c => c.conclusion === 'skipped');
  
  console.log('\nCI Check Summary:');
  console.log('-'.repeat(30));
  console.log(`SUCCESS: ${success.length}`);
  console.log(`FAILED: ${failed.length}`);
  console.log(`SKIPPED: ${skipped.length}`);
  console.log(`TOTAL: ${checks.length}`);

  if (failed.length > 0) {
    console.log('\nFailed Checks:');
    console.log('-'.repeat(30));
    failed.forEach((check, i) => {
      const duration = calculateDuration(check.started_at, check.completed_at);
      console.log(`${i + 1}. ${check.name} (${duration})`);
    });
  }

  // Analysis based on failure patterns
  console.log('\nFailure Analysis:');
  console.log('-'.repeat(30));
  
  const hasUnitTestFailure = failed.some(c => c.name.toLowerCase().includes('unit'));
  const hasBuildFailure = failed.some(c => c.name.toLowerCase().includes('build'));
  const hasValidationFailure = failed.some(c => c.name.toLowerCase().includes('commit') || c.name.toLowerCase().includes('pr'));
  const shortDurations = failed.filter(c => calculateDurationSeconds(c.started_at, c.completed_at) < 10);
  
  if (shortDurations.length === failed.length && failed.length > 0) {
    console.log('PATTERN: All failures are very quick (< 10s)');
    console.log('LIKELY CAUSE: Environment or setup issue in CI');
    console.log('RECOMMENDATION: Check CI configuration, not code issues');
  } else if (hasUnitTestFailure && hasBuildFailure) {
    console.log('PATTERN: Both unit tests and build failing');
    console.log('LIKELY CAUSE: Code or dependency issues');
    console.log('RECOMMENDATION: Fix code issues locally first');
  } else if (hasValidationFailure) {
    console.log('PATTERN: Validation checks failing');
    console.log('LIKELY CAUSE: PR format or commit message issues');
    console.log('RECOMMENDATION: Check commit format and PR size');
  }

  console.log('\nRecommended Actions:');
  console.log('-'.repeat(30));
  
  if (shortDurations.length === failed.length && failed.length > 0) {
    console.log('1. Check CI environment setup');
    console.log('2. Verify Node.js version in CI matches local');
    console.log('3. Check for missing environment variables');
    console.log('4. Review CI workflow configuration');
  } else {
    console.log('1. Run tests locally: npm run test:unit');
    console.log('2. Run build locally: npm run build');
    console.log('3. Fix any local issues first');
    console.log('4. Check commit message format');
  }

  console.log('\nQuick Commands:');
  console.log('-'.repeat(30));
  console.log('npm run test:unit           # Test locally');
  console.log('npm run build               # Build locally');
  console.log(`gh pr view ${prNumber}      # View PR details`);
  console.log('node scripts/ci-summary.js  # Run this script again');

  // Save summary to file
  const summary = {
    timestamp: new Date().toISOString(),
    pr: {
      number: prNumber,
      title: pr.title,
      branch: pr.head.ref
    },
    ci_status: {
      total: checks.length,
      success: success.length,
      failed: failed.length,
      skipped: skipped.length
    },
    failed_checks: failed.map(c => ({
      name: c.name,
      duration: calculateDuration(c.started_at, c.completed_at),
      url: c.details_url
    })),
    analysis: {
      quick_failures: shortDurations.length === failed.length,
      has_unit_test_failure: hasUnitTestFailure,
      has_build_failure: hasBuildFailure,
      has_validation_failure: hasValidationFailure
    }
  };

  const filename = `ci-summary-pr${prNumber}.json`;
  require('fs').writeFileSync(filename, JSON.stringify(summary, null, 2));
  console.log(`\nSummary saved to: ${filename}`);

} catch (error) {
  console.error('Error:', error.message);
  console.log('\nFallback: Try these commands manually:');
  console.log(`gh pr view ${prNumber}`);
  console.log('npm run test:unit');
  console.log('npm run build');
}

function calculateDuration(start, end) {
  if (!start || !end) return 'unknown';
  const duration = new Date(end) - new Date(start);
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function calculateDurationSeconds(start, end) {
  if (!start || !end) return 0;
  const duration = new Date(end) - new Date(start);
  return Math.floor(duration / 1000);
}
