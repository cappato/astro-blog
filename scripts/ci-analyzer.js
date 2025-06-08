#!/usr/bin/env node

/**
 * CI Analyzer - Main script for CI error analysis
 * Provides multiple modes: capture, monitor, and analyze
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = process.argv[2];
const prNumber = process.argv[3];

function showHelp() {
  console.log(`
🔍 CI Analyzer - Comprehensive CI Error Analysis Tool

Usage:
  node scripts/ci-analyzer.js <command> <pr_number> [options]

Commands:
  capture <pr>          Capture current CI errors and logs
  monitor <pr> [interval] Monitor PR in real-time (default: 30s)
  analyze <pr>          Quick analysis of current status
  help                  Show this help

Examples:
  node scripts/ci-analyzer.js capture 84
  node scripts/ci-analyzer.js monitor 84 30
  node scripts/ci-analyzer.js analyze 84

Files generated:
  - ci-errors-pr{N}-{date}.md    (capture command)
  - pr{N}-monitor-{date}.md      (monitor command)
  - pr{N}-analysis-{date}.md     (analyze command)

💡 Tips:
  - Use 'monitor' to watch CI in real-time
  - Use 'capture' for detailed error analysis after CI completes
  - Use 'analyze' for quick status checks
`);
}

function runCapture(pr) {
  console.log(`🔍 Capturing CI errors for PR #${pr}...`);
  try {
    execSync(`node scripts/capture-ci-errors.js ${pr}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Error running capture:', error.message);
  }
}

function runMonitor(pr, interval = 30) {
  console.log(`👀 Starting real-time monitoring for PR #${pr}...`);
  try {
    execSync(`node scripts/monitor-pr.js ${pr} ${interval}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Error running monitor:', error.message);
  }
}

function runAnalyze(pr) {
  console.log(`📊 Quick analysis for PR #${pr}...`);
  
  try {
    const token = process.env.GITHUB_TOKEN || execSync('gh auth token', { encoding: 'utf8' }).trim();
    
    // Get PR info
    const prResult = execSync(`curl -s -H "Authorization: token ${token}" "https://api.github.com/repos/cappato/astro-blog/pulls/${pr}"`, { encoding: 'utf8' });
    const prData = JSON.parse(prResult);
    
    // Get check runs
    const checksResult = execSync(`curl -s -H "Authorization: token ${token}" "https://api.github.com/repos/cappato/astro-blog/commits/${prData.head.sha}/check-runs"`, { encoding: 'utf8' });
    const checksData = JSON.parse(checksResult);
    const checks = checksData.check_runs || [];
    
    const failed = checks.filter(c => c.conclusion === 'failure');
    const success = checks.filter(c => c.conclusion === 'success');
    const pending = checks.filter(c => c.status === 'in_progress' || c.status === 'queued');
    const skipped = checks.filter(c => c.conclusion === 'skipped');
    
    console.log(`\n📋 PR #${pr}: ${prData.title}`);
    console.log(`🔗 ${prData.html_url}`);
    console.log(`📊 Status: ${prData.state} | Mergeable: ${prData.mergeable}`);
    console.log(`\n📈 Check Summary:`);
    console.log(`   ✅ Success: ${success.length}`);
    console.log(`   ❌ Failed: ${failed.length}`);
    console.log(`   ⏳ Pending: ${pending.length}`);
    console.log(`   ⏭️  Skipped: ${skipped.length}`);
    console.log(`   📊 Total: ${checks.length}`);
    
    if (failed.length > 0) {
      console.log(`\n❌ Failed Checks:`);
      failed.forEach((check, i) => {
        const duration = calculateDuration(check.started_at, check.completed_at);
        console.log(`   ${i + 1}. ${check.name} (${duration})`);
      });
      
      console.log(`\n💡 Next steps:`);
      console.log(`   📸 Detailed analysis: node scripts/ci-analyzer.js capture ${pr}`);
      console.log(`   👀 Real-time monitor: node scripts/ci-analyzer.js monitor ${pr}`);
    }
    
    if (pending.length > 0) {
      console.log(`\n⏳ Still Running:`);
      pending.forEach((check, i) => {
        console.log(`   ${i + 1}. ${check.name} (${check.status})`);
      });
      
      console.log(`\n💡 Monitor in real-time: node scripts/ci-analyzer.js monitor ${pr}`);
    }
    
    if (failed.length === 0 && pending.length === 0 && success.length > 0) {
      console.log(`\n🎉 All checks passed! PR is ready for merge.`);
    }
    
  } catch (error) {
    console.error('❌ Error running analysis:', error.message);
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

// Main execution
if (!command || command === 'help') {
  showHelp();
  process.exit(0);
}

if (!prNumber) {
  console.error('❌ Error: PR number is required');
  console.error('💡 Usage: node scripts/ci-analyzer.js <command> <pr_number>');
  process.exit(1);
}

// Check if required scripts exist
const scriptsDir = join(process.cwd(), 'scripts');
const captureScript = join(scriptsDir, 'capture-ci-errors.js');
const monitorScript = join(scriptsDir, 'monitor-pr.js');

if (!existsSync(captureScript) || !existsSync(monitorScript)) {
  console.error('❌ Error: Required scripts not found in scripts/ directory');
  process.exit(1);
}

switch (command) {
  case 'capture':
    runCapture(prNumber);
    break;
    
  case 'monitor':
    const interval = process.argv[4] || 30;
    runMonitor(prNumber, interval);
    break;
    
  case 'analyze':
    runAnalyze(prNumber);
    break;
    
  default:
    console.error(`❌ Unknown command: ${command}`);
    console.error('💡 Run "node scripts/ci-analyzer.js help" for usage information');
    process.exit(1);
}
