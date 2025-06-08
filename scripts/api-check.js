#!/usr/bin/env node

/**
 * API CI Check
 * Direct GitHub API analysis
 */

import { execSync } from 'child_process';
import fs from 'fs';

const prNumber = process.argv[2];

if (!prNumber) {
  console.log('Usage: node scripts/api-check.js [PR_NUMBER]');
  console.log('Example: node scripts/api-check.js 82');
  process.exit(1);
}

console.log(`Analyzing PR #${prNumber} via GitHub API`);
console.log('='.repeat(50));

try {
  // Get GitHub token
  const token = process.env.GITHUB_TOKEN || execSync('gh auth token', { encoding: 'utf8' }).trim();
  
  if (!token) {
    console.error('ERROR: No GitHub token found. Run: gh auth login');
    process.exit(1);
  }

  console.log('Token found, making API requests...');

  // Get PR info
  const prApiUrl = 'https://api.github.com/repos/cappato/astro-blog/pulls/' + prNumber;
  const prResult = execSync(`curl -s -H "Authorization: token ${token}" "${prApiUrl}"`, { encoding: 'utf8' });
  
  const pr = JSON.parse(prResult);
  
  if (pr.message) {
    console.error('ERROR:', pr.message);
    process.exit(1);
  }

  console.log('PR Information:');
  console.log('-'.repeat(30));
  console.log(`Title: ${pr.title}`);
  console.log(`Branch: ${pr.head.ref}`);
  console.log(`Author: ${pr.user.login}`);
  console.log(`State: ${pr.state}`);
  console.log(`Created: ${new Date(pr.created_at).toLocaleString()}`);
  console.log(`Updated: ${new Date(pr.updated_at).toLocaleString()}`);

  // Get check runs for the commit
  const checksApiUrl = `https://api.github.com/repos/cappato/astro-blog/commits/${pr.head.sha}/check-runs`;
  const checksResult = execSync(`curl -s -H "Authorization: token ${token}" "${checksApiUrl}"`, { encoding: 'utf8' });
  
  const checksData = JSON.parse(checksResult);
  
  if (checksData.message) {
    console.error('ERROR getting checks:', checksData.message);
    process.exit(1);
  }

  const checks = checksData.check_runs || [];
  
  console.log('\nCheck Runs Analysis:');
  console.log('-'.repeat(30));
  
  const failed = checks.filter(c => c.conclusion === 'failure');
  const success = checks.filter(c => c.conclusion === 'success');
  const skipped = checks.filter(c => c.conclusion === 'skipped');
  const pending = checks.filter(c => c.status === 'in_progress' || c.status === 'queued');
  
  console.log(`SUCCESS: ${success.length}`);
  console.log(`FAILED: ${failed.length}`);
  console.log(`SKIPPED: ${skipped.length}`);
  console.log(`PENDING: ${pending.length}`);
  console.log(`TOTAL: ${checks.length}`);

  if (failed.length > 0) {
    console.log('\nFailed Checks:');
    console.log('-'.repeat(30));

    for (let index = 0; index < failed.length; index++) {
      const check = failed[index];
      console.log(`\n${index + 1}. FAILED: ${check.name}`);
      console.log(`   Started: ${new Date(check.started_at).toLocaleString()}`);
      console.log(`   Completed: ${new Date(check.completed_at).toLocaleString()}`);
      console.log(`   Duration: ${calculateDuration(check.started_at, check.completed_at)}`);
      console.log(`   Details: ${check.details_url}`);

      // Try to get logs for this check
      await getCheckLogs(check, token, index + 1);
    }

    console.log('\nRecommended Actions:');
    console.log('-'.repeat(30));
    console.log('1. Run tests locally: npm run test:unit');
    console.log('2. Check build: npm run build');
    console.log('3. Review specific error logs above');
    console.log('4. Compare with local test results');

    // Run local comparison
    await runLocalComparison();
  }

  if (success.length > 0) {
    console.log('\nSuccessful Checks:');
    console.log('-'.repeat(30));
    success.forEach((check, index) => {
      const duration = calculateDuration(check.started_at, check.completed_at);
      console.log(`${index + 1}. SUCCESS: ${check.name} (${duration})`);
    });
  }

  // Generate simple report
  const report = {
    timestamp: new Date().toISOString(),
    pr: {
      number: prNumber,
      title: pr.title,
      branch: pr.head.ref,
      author: pr.user.login,
      sha: pr.head.sha
    },
    summary: {
      total: checks.length,
      success: success.length,
      failed: failed.length,
      skipped: skipped.length,
      pending: pending.length
    },
    failed_checks: failed.map(check => ({
      name: check.name,
      started_at: check.started_at,
      completed_at: check.completed_at,
      duration: calculateDuration(check.started_at, check.completed_at),
      details_url: check.details_url
    }))
  };

  const filename = `ci-report-pr${prNumber}.json`;
  fs.writeFileSync(filename, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: ${filename}`);

  // Show comparison with local vs CI
  console.log('\nLocal vs CI Comparison:');
  console.log('-'.repeat(30));
  console.log('To compare with local results:');
  console.log('1. Run: npm run test:unit');
  console.log('2. Run: npm run build');
  console.log('3. Compare outputs with CI failures above');

} catch (error) {
  console.error('ERROR:', error.message);
  process.exit(1);
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

async function getCheckLogs(check, token, checkNumber) {
  try {
    console.log(`   Getting logs for check ${checkNumber}...`);

    // Extract run ID from details URL
    const runIdMatch = check.details_url.match(/\/runs\/(\d+)/);
    if (!runIdMatch) {
      console.log(`   Could not extract run ID from: ${check.details_url}`);
      return;
    }

    const runId = runIdMatch[1];

    // Get workflow run details
    const runApiUrl = `https://api.github.com/repos/cappato/astro-blog/actions/runs/${runId}`;
    const runResult = execSync(`curl -s -H "Authorization: token ${token}" "${runApiUrl}"`, { encoding: 'utf8' });
    const runData = JSON.parse(runResult);

    if (runData.message) {
      console.log(`   Error getting run data: ${runData.message}`);
      return;
    }

    console.log(`   Workflow: ${runData.name}`);
    console.log(`   Conclusion: ${runData.conclusion}`);

    // Get jobs for this run
    const jobsApiUrl = `https://api.github.com/repos/cappato/astro-blog/actions/runs/${runId}/jobs`;
    const jobsResult = execSync(`curl -s -H "Authorization: token ${token}" "${jobsApiUrl}"`, { encoding: 'utf8' });
    const jobsData = JSON.parse(jobsResult);

    if (jobsData.jobs && jobsData.jobs.length > 0) {
      const failedJob = jobsData.jobs.find(job => job.conclusion === 'failure') || jobsData.jobs[0];

      if (failedJob && failedJob.steps) {
        console.log(`   Job: ${failedJob.name}`);

        const failedSteps = failedJob.steps.filter(step => step.conclusion === 'failure');
        if (failedSteps.length > 0) {
          console.log(`   Failed steps:`);
          failedSteps.forEach(step => {
            console.log(`     - ${step.name} (${step.conclusion})`);
          });
        }

        // Try to get logs (note: this requires additional permissions)
        try {
          const logsApiUrl = `https://api.github.com/repos/cappato/astro-blog/actions/runs/${runId}/logs`;
          console.log(`   Logs available at: ${logsApiUrl}`);
          console.log(`   Or view in browser: ${check.details_url}`);
        } catch (logError) {
          console.log(`   View logs at: ${check.details_url}`);
        }
      }
    }

  } catch (error) {
    console.log(`   Error getting logs: ${error.message}`);
    console.log(`   View logs manually at: ${check.details_url}`);
  }
}

async function runLocalComparison() {
  console.log('\nLocal vs CI Comparison:');
  console.log('='.repeat(50));

  try {
    console.log('Running local tests...');

    // Run unit tests locally
    console.log('\n1. Local Unit Tests:');
    console.log('-'.repeat(20));
    try {
      const testResult = execSync('npm run test:unit', {
        encoding: 'utf8',
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log('   SUCCESS: Local unit tests completed');

      // Parse test results
      const lines = testResult.split('\n');
      const summaryLine = lines.find(line => line.includes('Test Files') && line.includes('Tests'));
      if (summaryLine) {
        console.log(`   Result: ${summaryLine.trim()}`);
      }

    } catch (testError) {
      console.log('   FAILED: Local unit tests failed');
      const errorOutput = testError.stdout || testError.stderr || testError.message;
      const lines = errorOutput.split('\n');
      const summaryLine = lines.find(line => line.includes('Test Files') && line.includes('Tests'));
      if (summaryLine) {
        console.log(`   Result: ${summaryLine.trim()}`);
      }

      // Show first few error lines
      const errorLines = lines.filter(line => line.includes('FAIL') || line.includes('ERROR')).slice(0, 3);
      if (errorLines.length > 0) {
        console.log('   Sample errors:');
        errorLines.forEach(line => console.log(`     ${line.trim()}`));
      }
    }

    // Run build locally
    console.log('\n2. Local Build:');
    console.log('-'.repeat(20));
    try {
      const buildResult = execSync('npm run build', {
        encoding: 'utf8',
        timeout: 60000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log('   SUCCESS: Local build completed');
    } catch (buildError) {
      console.log('   FAILED: Local build failed');
      const errorOutput = buildError.stdout || buildError.stderr || buildError.message;
      const lines = errorOutput.split('\n').slice(0, 5);
      console.log('   Error preview:');
      lines.forEach(line => {
        if (line.trim()) console.log(`     ${line.trim()}`);
      });
    }

    console.log('\n3. Analysis:');
    console.log('-'.repeat(20));
    console.log('   Compare the results above with CI failures');
    console.log('   If local tests pass but CI fails, check:');
    console.log('   - Node.js version differences');
    console.log('   - Environment variables');
    console.log('   - Dependency installation issues');
    console.log('   - File permissions or paths');

  } catch (error) {
    console.log(`   Error running local comparison: ${error.message}`);
  }
}
