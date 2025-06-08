#!/usr/bin/env node

/**
 * CI Check Script
 * Analyzes GitHub Actions check failures
 */

import { execSync } from 'child_process';
import fs from 'fs';

function cleanOutput(output) {
  // Remove ANSI escape sequences and control characters
  return output.replace(/\x1b\[[0-9;]*[mGKH]/g, '').replace(/[^\x20-\x7E\n]/g, '').trim();
}

function runCommand(cmd) {
  try {
    const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return cleanOutput(result);
  } catch (error) {
    console.error(`ERROR: Command failed: ${cmd}`);
    console.error(`ERROR: ${error.message}`);
    return null;
  }
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

function categorizeFailure(checkName) {
  const name = checkName.toLowerCase();
  
  if (name.includes('unit') || name.includes('test')) return 'Unit Tests';
  if (name.includes('build')) return 'Build';
  if (name.includes('commit') || name.includes('pr') || name.includes('size')) return 'Validation';
  if (name.includes('deploy')) return 'Deployment';
  if (name.includes('lint')) return 'Linting';
  
  return 'Other';
}

async function analyzePR(prNumber) {
  console.log(`\nAnalyzing PR #${prNumber}`);
  console.log('='.repeat(50));

  // Get basic PR info using simpler commands
  console.log('Getting PR information...');

  // Use the command we know works
  const prInfoRaw = runCommand(`gh pr view ${prNumber}`);
  if (prInfoRaw) {
    const lines = prInfoRaw.split('\n');
    const titleLine = lines.find(line => line.includes('#' + prNumber));
    if (titleLine) {
      console.log(`Title: ${titleLine.split('#')[0].trim()}`);
    }
  }

  // Get check status using the working command
  console.log('\nGetting check status...');
  const checksRaw = runCommand(`gh pr view ${prNumber} --json statusCheckRollup --jq '.statusCheckRollup'`);
  
  if (!checksRaw) {
    console.log('ERROR: Could not get check status');
    return;
  }

  try {
    const checks = JSON.parse(checksRaw) || [];
    
    console.log(`\nCheck Summary:`);
    console.log('-'.repeat(30));
    
    const failed = checks.filter(c => c.conclusion === 'FAILURE');
    const success = checks.filter(c => c.conclusion === 'SUCCESS');
    const skipped = checks.filter(c => c.conclusion === 'SKIPPED');
    const pending = checks.filter(c => c.status === 'IN_PROGRESS' || c.status === 'QUEUED');
    
    console.log(`SUCCESS: ${success.length}`);
    console.log(`FAILED: ${failed.length}`);
    console.log(`SKIPPED: ${skipped.length}`);
    console.log(`PENDING: ${pending.length}`);
    console.log(`TOTAL: ${checks.length}`);

    if (failed.length > 0) {
      console.log(`\nFailed Checks (${failed.length}):`);
      console.log('-'.repeat(40));
      
      failed.forEach((check, index) => {
        console.log(`\n${index + 1}. FAILED: ${check.name}`);
        console.log(`   Workflow: ${check.workflowName || 'Unknown'}`);
        console.log(`   Started: ${new Date(check.startedAt).toLocaleString()}`);
        console.log(`   Completed: ${new Date(check.completedAt).toLocaleString()}`);
        console.log(`   Duration: ${calculateDuration(check.startedAt, check.completedAt)}`);
        if (check.detailsUrl) {
          console.log(`   Details: ${check.detailsUrl}`);
        }
      });

      // Analyze failure patterns
      console.log(`\nFailure Analysis:`);
      console.log('-'.repeat(30));
      
      const failureTypes = {};
      failed.forEach(check => {
        const type = categorizeFailure(check.name);
        failureTypes[type] = (failureTypes[type] || 0) + 1;
      });

      console.log('Failure Categories:');
      Object.entries(failureTypes).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count} failure(s)`);
      });

      console.log('\nRecommended Actions:');
      
      if (failureTypes['Unit Tests']) {
        console.log('  1. Run unit tests locally: npm run test:unit');
        console.log('  2. Check test mocks and setup files');
      }
      
      if (failureTypes['Build']) {
        console.log('  1. Run build locally: npm run build');
        console.log('  2. Check for TypeScript errors');
      }
      
      if (failureTypes['Validation']) {
        console.log('  1. Check commit message format');
        console.log('  2. Verify PR size limits');
      }

      console.log('\nQuick Commands:');
      console.log('  - npm run test:unit    # Run unit tests');
      console.log('  - npm run build        # Test build');
      console.log('  - npm run test:ci      # Run CI test suite');

    } else {
      console.log('\nSUCCESS: All checks are passing!');
    }

    if (success.length > 0) {
      console.log(`\nSuccessful Checks (${success.length}):`);
      console.log('-'.repeat(40));
      success.forEach((check, index) => {
        const duration = calculateDuration(check.startedAt, check.completedAt);
        console.log(`${index + 1}. SUCCESS: ${check.name} (${duration})`);
      });
    }

    if (skipped.length > 0) {
      console.log(`\nSkipped Checks (${skipped.length}):`);
      console.log('-'.repeat(40));
      skipped.forEach((check, index) => {
        console.log(`${index + 1}. SKIPPED: ${check.name}`);
      });
    }

    // Generate report
    await generateReport(prNumber, {
      title: prTitle?.replace(/"/g, '') || 'Unknown',
      branch: prBranch?.replace(/"/g, '') || 'Unknown',
      author: prAuthor?.replace(/"/g, '') || 'Unknown'
    }, checks);

  } catch (error) {
    console.error('ERROR: Error parsing check data:', error.message);
    console.log('Raw data preview:', checksRaw.substring(0, 200) + '...');
  }
}

async function generateReport(prNumber, prInfo, checks) {
  const timestamp = new Date().toISOString();
  
  const report = {
    timestamp,
    pr: {
      number: prNumber,
      title: prInfo.title,
      branch: prInfo.branch,
      author: prInfo.author
    },
    summary: {
      total: checks.length,
      success: checks.filter(c => c.conclusion === 'SUCCESS').length,
      failed: checks.filter(c => c.conclusion === 'FAILURE').length,
      skipped: checks.filter(c => c.conclusion === 'SKIPPED').length,
      pending: checks.filter(c => c.status === 'IN_PROGRESS' || c.status === 'QUEUED').length
    },
    checks: checks.map(check => ({
      name: check.name,
      conclusion: check.conclusion,
      status: check.status,
      workflowName: check.workflowName,
      startedAt: check.startedAt,
      completedAt: check.completedAt,
      duration: calculateDuration(check.startedAt, check.completedAt),
      detailsUrl: check.detailsUrl
    }))
  };

  // Save JSON report
  const jsonFilename = `ci-report-pr${prNumber}-${Date.now()}.json`;
  fs.writeFileSync(jsonFilename, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: ${jsonFilename}`);
  
  // Generate markdown report
  const mdFilename = jsonFilename.replace('.json', '.md');
  await generateMarkdownReport(report, mdFilename);
}

async function generateMarkdownReport(report, filename) {
  const failed = report.checks.filter(c => c.conclusion === 'FAILURE');
  const success = report.checks.filter(c => c.conclusion === 'SUCCESS');
  
  const md = `# CI Analysis Report - PR #${report.pr.number}

**Generated:** ${new Date(report.timestamp).toLocaleString()}  
**PR:** ${report.pr.title}  
**Branch:** \`${report.pr.branch}\`  
**Author:** ${report.pr.author}

## Summary

- **Successful:** ${report.summary.success}
- **Failed:** ${report.summary.failed}
- **Skipped:** ${report.summary.skipped}
- **Pending:** ${report.summary.pending}
- **Total:** ${report.summary.total}

## Status

${report.summary.failed === 0 ? '**All checks passing!**' : `**${report.summary.failed} check(s) failing**`}

## Failed Checks

${failed.length === 0 ? '_No failed checks_' : ''}

${failed.map((check, i) => `
### ${i + 1}. FAILED: ${check.name}

- **Workflow:** ${check.workflowName || 'Unknown'}
- **Duration:** ${check.duration}
- **Started:** ${new Date(check.startedAt).toLocaleString()}
- **Completed:** ${new Date(check.completedAt).toLocaleString()}
- **Details:** [View logs](${check.detailsUrl})

`).join('')}

## Successful Checks

${success.map(check => `- **${check.name}** (${check.duration})`).join('\n')}

## Recommended Actions

${failed.length > 0 ? `
1. Run tests locally: \`npm run test:unit\`
2. Check build: \`npm run build\`
3. Review GitHub Actions logs for specific errors
4. Fix issues and push new commit
` : 'All checks are passing - ready to merge!'}

---
*Generated by CI Check Script - ${new Date().toLocaleString()}*
`;

  fs.writeFileSync(filename, md);
  console.log(`Markdown report saved to: ${filename}`);
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log(`
CI Check Script

Usage:
  node scripts/ci-check.js [PR_NUMBER]     # Analyze specific PR
  node scripts/ci-check.js --latest       # Analyze latest open PR
  node scripts/ci-check.js --help         # Show this help

Examples:
  node scripts/ci-check.js 82
  node scripts/ci-check.js --latest
`);
} else {
  try {
    if (args[0] === '--latest') {
      const latestPR = runCommand('gh pr list --state open --limit 1 --json number --jq ".[0].number"');
      if (latestPR) {
        await analyzePR(parseInt(latestPR.replace(/"/g, '')));
      } else {
        console.log('ERROR: No open PRs found');
      }
    } else if (!isNaN(args[0])) {
      await analyzePR(parseInt(args[0]));
    } else {
      console.error('ERROR: Invalid arguments. Use --help for usage information.');
    }
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}
