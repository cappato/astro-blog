#!/usr/bin/env node

/**
 * Get CI Errors Script
 * Extract specific error information from CI failures
 */

import { execSync } from 'child_process';

const prNumber = process.argv[2] || '83';

console.log(`Getting CI error details for PR #${prNumber}`);
console.log('='.repeat(50));

try {
  const token = process.env.GITHUB_TOKEN || execSync('gh auth token', { encoding: 'utf8' }).trim();
  
  // Get PR info
  const prResult = execSync(`curl -s -H "Authorization: token ${token}" "https://api.github.com/repos/cappato/astro-blog/pulls/${prNumber}"`, { encoding: 'utf8' });
  const pr = JSON.parse(prResult);
  
  console.log(`PR: ${pr.title}`);
  console.log(`SHA: ${pr.head.sha}`);
  console.log('');

  // Get check runs
  const checksResult = execSync(`curl -s -H "Authorization: token ${token}" "https://api.github.com/repos/cappato/astro-blog/commits/${pr.head.sha}/check-runs"`, { encoding: 'utf8' });
  const checksData = JSON.parse(checksResult);
  const checks = checksData.check_runs || [];
  
  const failed = checks.filter(c => c.conclusion === 'failure');
  
  console.log(`Found ${failed.length} failed checks:`);
  console.log('');

  for (let i = 0; i < failed.length; i++) {
    const check = failed[i];
    console.log(`${i + 1}. ${check.name}`);
    console.log(`   Duration: ${calculateDuration(check.started_at, check.completed_at)}`);
    
    // Extract run ID from details URL
    const runIdMatch = check.details_url.match(/\/runs\/(\d+)/);
    if (runIdMatch) {
      const runId = runIdMatch[1];
      
      try {
        // Get jobs for this run
        const jobsResult = execSync(`curl -s -H "Authorization: token ${token}" "https://api.github.com/repos/cappato/astro-blog/actions/runs/${runId}/jobs"`, { encoding: 'utf8' });
        const jobsData = JSON.parse(jobsResult);
        
        if (jobsData.jobs && jobsData.jobs.length > 0) {
          const failedJob = jobsData.jobs.find(job => job.conclusion === 'failure') || jobsData.jobs[0];
          
          if (failedJob) {
            console.log(`   Job: ${failedJob.name}`);
            console.log(`   Job conclusion: ${failedJob.conclusion}`);
            
            if (failedJob.steps) {
              const failedSteps = failedJob.steps.filter(step => step.conclusion === 'failure');
              const completedSteps = failedJob.steps.filter(step => step.conclusion === 'success');
              
              console.log(`   Steps completed: ${completedSteps.length}`);
              console.log(`   Steps failed: ${failedSteps.length}`);
              
              if (failedSteps.length > 0) {
                console.log(`   Failed step(s):`);
                failedSteps.forEach(step => {
                  console.log(`     - ${step.name} (${calculateDuration(step.started_at, step.completed_at)})`);
                });
              }
              
              // Show last few steps to understand where it failed
              const lastSteps = failedJob.steps.slice(-3);
              console.log(`   Last steps executed:`);
              lastSteps.forEach(step => {
                const status = step.conclusion || step.status || 'unknown';
                console.log(`     - ${step.name}: ${status}`);
              });
            }
          }
        }
      } catch (jobError) {
        console.log(`   Could not get job details: ${jobError.message}`);
      }
    }
    
    console.log(`   View logs: ${check.details_url}`);
    console.log('');
  }

  // Analysis
  console.log('Analysis:');
  console.log('-'.repeat(30));
  
  const allQuickFailures = failed.every(check => {
    const duration = calculateDurationSeconds(check.started_at, check.completed_at);
    return duration <= 10;
  });
  
  if (allQuickFailures) {
    console.log('PATTERN: All failures are very quick (≤10s)');
    console.log('LIKELY CAUSE: Environment setup or dependency issue');
    console.log('');
    console.log('Common causes of quick CI failures:');
    console.log('1. Node.js version incompatibility');
    console.log('2. Missing or incompatible dependencies');
    console.log('3. Package.json or lock file issues');
    console.log('4. Environment variable problems');
    console.log('5. Workflow configuration errors');
    console.log('');
    console.log('Recommended investigation:');
    console.log('1. Check if npm install is failing');
    console.log('2. Verify Node.js version compatibility');
    console.log('3. Compare package-lock.json with working state');
    console.log('4. Check for missing environment variables');
  } else {
    console.log('PATTERN: Mixed failure durations');
    console.log('LIKELY CAUSE: Code or test issues');
  }

} catch (error) {
  console.error('Error:', error.message);
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
