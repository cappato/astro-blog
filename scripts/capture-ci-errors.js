#!/usr/bin/env node

/**
 * CI Error Capture Script
 * Captures all CI errors and logs from a PR and saves them to markdown
 */

import { execSync } from 'child_process';
import { writeFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';

const prNumber = process.argv[2];
if (!prNumber) {
  console.error('Usage: node capture-ci-errors.js <PR_NUMBER>');
  process.exit(1);
}

const outputFile = `ci-errors-pr${prNumber}-${new Date().toISOString().split('T')[0]}.md`;
const outputPath = join(process.cwd(), outputFile);

console.log(`🔍 Capturing CI errors for PR #${prNumber}`);
console.log(`📝 Output file: ${outputFile}`);

// Initialize markdown file
const initContent = `# CI Error Analysis - PR #${prNumber}

**Generated**: ${new Date().toISOString()}
**PR**: https://github.com/cappato/astro-blog/pull/${prNumber}

---

`;

writeFileSync(outputPath, initContent);

function appendToFile(content) {
  appendFileSync(outputPath, content + '\n');
}

function logAndAppend(message, content = '') {
  console.log(message);
  appendToFile(`## ${message}\n`);
  if (content) {
    appendToFile('```\n' + content + '\n```\n');
  }
  appendToFile('');
}

try {
  const token = process.env.GITHUB_TOKEN || execSync('gh auth token', { encoding: 'utf8' }).trim();
  
  // Get PR info
  logAndAppend('📋 PR Information');
  const prResult = execSync(`curl -s -H "Authorization: token ${token}" "https://api.github.com/repos/cappato/astro-blog/pulls/${prNumber}"`, { encoding: 'utf8' });
  const pr = JSON.parse(prResult);
  
  const prInfo = `
**Title**: ${pr.title}
**State**: ${pr.state}
**SHA**: ${pr.head.sha}
**Created**: ${pr.created_at}
**Updated**: ${pr.updated_at}
**Author**: ${pr.user.login}
**Branch**: ${pr.head.ref}
**Base**: ${pr.base.ref}
`;
  
  appendToFile(prInfo);

  // Get check runs
  logAndAppend('🔍 Getting Check Runs');
  const checksResult = execSync(`curl -s -H "Authorization: token ${token}" "https://api.github.com/repos/cappato/astro-blog/commits/${pr.head.sha}/check-runs"`, { encoding: 'utf8' });
  const checksData = JSON.parse(checksResult);
  const checks = checksData.check_runs || [];
  
  appendToFile(`**Total Checks**: ${checks.length}\n`);
  
  const failed = checks.filter(c => c.conclusion === 'failure');
  const success = checks.filter(c => c.conclusion === 'success');
  const pending = checks.filter(c => c.status === 'in_progress' || c.status === 'queued');
  const skipped = checks.filter(c => c.conclusion === 'skipped');
  
  const summary = `
**Failed**: ${failed.length}
**Success**: ${success.length}
**Pending**: ${pending.length}
**Skipped**: ${skipped.length}
`;
  
  appendToFile(summary);

  // Process failed checks
  if (failed.length > 0) {
    logAndAppend('❌ Failed Checks Analysis');
    
    for (let i = 0; i < failed.length; i++) {
      const check = failed[i];
      const duration = calculateDuration(check.started_at, check.completed_at);
      
      appendToFile(`### ${i + 1}. ${check.name}\n`);
      appendToFile(`**Workflow**: ${check.app?.name || 'Unknown'}`);
      appendToFile(`**Status**: ${check.status}`);
      appendToFile(`**Conclusion**: ${check.conclusion}`);
      appendToFile(`**Duration**: ${duration}`);
      appendToFile(`**Started**: ${check.started_at}`);
      appendToFile(`**Completed**: ${check.completed_at}`);
      appendToFile(`**Details URL**: ${check.details_url}\n`);
      
      // Extract run ID and get job details
      const runIdMatch = check.details_url.match(/\/runs\/(\d+)/);
      if (runIdMatch) {
        const runId = runIdMatch[1];
        
        try {
          console.log(`  📊 Getting job details for ${check.name}...`);
          
          // Get jobs for this run
          const jobsResult = execSync(`curl -s -H "Authorization: token ${token}" "https://api.github.com/repos/cappato/astro-blog/actions/runs/${runId}/jobs"`, { encoding: 'utf8' });
          const jobsData = JSON.parse(jobsResult);
          
          if (jobsData.jobs && jobsData.jobs.length > 0) {
            appendToFile(`#### Job Details:\n`);
            
            for (const job of jobsData.jobs) {
              appendToFile(`**Job Name**: ${job.name}`);
              appendToFile(`**Job Status**: ${job.status}`);
              appendToFile(`**Job Conclusion**: ${job.conclusion}`);
              appendToFile(`**Job Duration**: ${calculateDuration(job.started_at, job.completed_at)}\n`);
              
              if (job.steps && job.steps.length > 0) {
                appendToFile(`**Steps**:`);
                
                const failedSteps = job.steps.filter(step => step.conclusion === 'failure');
                const lastSteps = job.steps.slice(-5); // Last 5 steps for context
                
                if (failedSteps.length > 0) {
                  appendToFile(`\n**Failed Steps**:`);
                  failedSteps.forEach(step => {
                    appendToFile(`- ❌ ${step.name} (${calculateDuration(step.started_at, step.completed_at)})`);
                  });
                }
                
                appendToFile(`\n**Last 5 Steps**:`);
                lastSteps.forEach(step => {
                  const status = step.conclusion || step.status || 'unknown';
                  const icon = status === 'success' ? '✅' : status === 'failure' ? '❌' : '⏳';
                  appendToFile(`- ${icon} ${step.name}: ${status} (${calculateDuration(step.started_at, step.completed_at)})`);
                });
              }
              
              appendToFile('');
            }
          }
          
          // Try to get logs (this might fail due to permissions)
          try {
            console.log(`  📜 Attempting to get logs for ${check.name}...`);
            const logsResult = execSync(`curl -s -H "Authorization: token ${token}" "https://api.github.com/repos/cappato/astro-blog/actions/runs/${runId}/logs"`, { encoding: 'utf8' });
            
            if (logsResult && logsResult.length > 0 && !logsResult.includes('Not Found')) {
              appendToFile(`#### Logs Preview:\n`);
              appendToFile('```');
              appendToFile(logsResult.substring(0, 2000) + (logsResult.length > 2000 ? '\n... (truncated)' : ''));
              appendToFile('```\n');
            } else {
              appendToFile(`#### Logs:\n`);
              appendToFile(`Logs not accessible via API. View at: ${check.details_url}\n`);
            }
          } catch (logError) {
            appendToFile(`#### Logs:\n`);
            appendToFile(`Logs not accessible via API. View at: ${check.details_url}\n`);
          }
          
        } catch (jobError) {
          appendToFile(`#### Error getting job details:\n`);
          appendToFile('```');
          appendToFile(jobError.message);
          appendToFile('```\n');
        }
      }
      
      appendToFile('---\n');
    }
  }

  // Process successful checks (summary only)
  if (success.length > 0) {
    logAndAppend('✅ Successful Checks');
    success.forEach((check, i) => {
      const duration = calculateDuration(check.started_at, check.completed_at);
      appendToFile(`${i + 1}. **${check.name}** - ${duration}`);
    });
    appendToFile('');
  }

  // Process pending checks
  if (pending.length > 0) {
    logAndAppend('⏳ Pending Checks');
    pending.forEach((check, i) => {
      appendToFile(`${i + 1}. **${check.name}** - ${check.status}`);
    });
    appendToFile('');
  }

  // Analysis and recommendations
  logAndAppend('🔬 Analysis & Recommendations');
  
  const allQuickFailures = failed.every(check => {
    const duration = calculateDurationSeconds(check.started_at, check.completed_at);
    return duration <= 10;
  });
  
  const analysisContent = `
**Pattern Analysis**:
- Quick failures (≤10s): ${allQuickFailures ? 'YES' : 'NO'}
- Total failed checks: ${failed.length}
- Average failure time: ${failed.length > 0 ? Math.round(failed.reduce((acc, check) => acc + calculateDurationSeconds(check.started_at, check.completed_at), 0) / failed.length) : 0}s

**Likely Causes**:
${allQuickFailures ? 
  `- Environment setup issues
- Node.js version problems
- Dependency conflicts
- Missing environment variables
- Workflow configuration errors` :
  `- Code or test failures
- Build issues
- Linting problems
- Test timeouts`}

**Next Steps**:
1. Review failed step details above
2. Check logs at provided URLs
3. Run failing tests locally
4. Compare with last successful run
5. Check for recent dependency changes
`;

  appendToFile(analysisContent);

  // Footer
  appendToFile(`\n---\n\n**Generated by**: CI Error Capture Script`);
  appendToFile(`**Timestamp**: ${new Date().toISOString()}`);
  appendToFile(`**Command**: \`node scripts/capture-ci-errors.js ${prNumber}\``);

  console.log(`\n✅ CI error analysis complete!`);
  console.log(`📄 Report saved to: ${outputFile}`);
  console.log(`📊 Summary: ${failed.length} failed, ${success.length} success, ${pending.length} pending`);

} catch (error) {
  console.error('❌ Error:', error.message);
  appendToFile(`\n## ❌ Script Error\n\n\`\`\`\n${error.message}\n\`\`\`\n`);
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
