#!/usr/bin/env node

/**
 * PR Monitor Script
 * Monitors a PR in real-time and captures errors as they happen
 */

import { execSync } from 'child_process';
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

const prNumber = process.argv[2];
const intervalSeconds = parseInt(process.argv[3]) || 30;

if (!prNumber) {
  console.error('Usage: node monitor-pr.js <PR_NUMBER> [INTERVAL_SECONDS]');
  console.error('Example: node monitor-pr.js 84 30');
  process.exit(1);
}

const outputFile = `pr${prNumber}-monitor-${new Date().toISOString().split('T')[0]}.md`;
const outputPath = join(process.cwd(), outputFile);

console.log(`🔍 Monitoring PR #${prNumber} every ${intervalSeconds} seconds`);
console.log(`📝 Output file: ${outputFile}`);
console.log(`⏹️  Press Ctrl+C to stop monitoring\n`);

// Initialize markdown file
const initContent = `# PR #${prNumber} Real-Time Monitor

**Started**: ${new Date().toISOString()}
**Interval**: ${intervalSeconds} seconds
**PR**: https://github.com/cappato/astro-blog/pull/${prNumber}

---

`;

writeFileSync(outputPath, initContent);

let previousState = {};
let checkCount = 0;

function appendToFile(content) {
  appendFileSync(outputPath, content + '\n');
}

function logAndAppend(message, content = '') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  appendToFile(`## [${timestamp}] ${message}\n`);
  if (content) {
    appendToFile('```\n' + content + '\n```\n');
  }
  appendToFile('');
}

async function checkPR() {
  try {
    checkCount++;
    const token = process.env.GITHUB_TOKEN || execSync('gh auth token', { encoding: 'utf8' }).trim();
    
    // Get PR status
    const prResult = execSync(`curl -s -H "Authorization: token ${token}" "https://api.github.com/repos/cappato/astro-blog/pulls/${prNumber}"`, { encoding: 'utf8' });
    const pr = JSON.parse(prResult);
    
    // Get check runs
    const checksResult = execSync(`curl -s -H "Authorization: token ${token}" "https://api.github.com/repos/cappato/astro-blog/commits/${pr.head.sha}/check-runs"`, { encoding: 'utf8' });
    const checksData = JSON.parse(checksResult);
    const checks = checksData.check_runs || [];
    
    const currentState = {
      total: checks.length,
      failed: checks.filter(c => c.conclusion === 'failure').length,
      success: checks.filter(c => c.conclusion === 'success').length,
      pending: checks.filter(c => c.status === 'in_progress' || c.status === 'queued').length,
      skipped: checks.filter(c => c.conclusion === 'skipped').length
    };
    
    // Check for changes
    const hasChanges = JSON.stringify(currentState) !== JSON.stringify(previousState);
    
    if (checkCount === 1 || hasChanges) {
      logAndAppend(`Check #${checkCount} - Status Update`);
      
      const statusContent = `
**Total Checks**: ${currentState.total}
**Failed**: ${currentState.failed}
**Success**: ${currentState.success}
**Pending**: ${currentState.pending}
**Skipped**: ${currentState.skipped}
**PR State**: ${pr.state}
**Mergeable**: ${pr.mergeable}
`;
      
      appendToFile(statusContent);
      
      // Show changes if any
      if (hasChanges && checkCount > 1) {
        const changes = [];
        if (currentState.failed !== previousState.failed) {
          changes.push(`Failed: ${previousState.failed} → ${currentState.failed}`);
        }
        if (currentState.success !== previousState.success) {
          changes.push(`Success: ${previousState.success} → ${currentState.success}`);
        }
        if (currentState.pending !== previousState.pending) {
          changes.push(`Pending: ${previousState.pending} → ${currentState.pending}`);
        }
        
        if (changes.length > 0) {
          appendToFile(`**Changes**: ${changes.join(', ')}\n`);
        }
      }
      
      // Show new failures
      const newFailures = checks.filter(c => c.conclusion === 'failure');
      if (newFailures.length > 0 && (checkCount === 1 || currentState.failed > previousState.failed)) {
        appendToFile(`### New/Current Failures:\n`);
        newFailures.forEach(check => {
          const duration = calculateDuration(check.started_at, check.completed_at);
          appendToFile(`- **${check.name}**: ${check.conclusion} (${duration})`);
          appendToFile(`  - Details: ${check.details_url}`);
        });
        appendToFile('');
      }
      
      // Show completed successes
      const newSuccesses = checks.filter(c => c.conclusion === 'success');
      if (newSuccesses.length > 0 && currentState.success > previousState.success) {
        appendToFile(`### New Successes:\n`);
        newSuccesses.slice(previousState.success).forEach(check => {
          const duration = calculateDuration(check.started_at, check.completed_at);
          appendToFile(`- **${check.name}**: ✅ (${duration})`);
        });
        appendToFile('');
      }
      
      previousState = currentState;
    } else {
      // Just log to console, don't append to file
      console.log(`[${new Date().toISOString()}] Check #${checkCount} - No changes (${currentState.failed}F/${currentState.success}S/${currentState.pending}P)`);
    }
    
    // Check if all done
    if (currentState.pending === 0 && currentState.total > 0) {
      logAndAppend('🏁 All Checks Complete!');
      
      const finalSummary = `
**Final Results**:
- ✅ Success: ${currentState.success}
- ❌ Failed: ${currentState.failed}
- ⏭️ Skipped: ${currentState.skipped}
- 📊 Total: ${currentState.total}

**PR Status**: ${pr.state}
**Mergeable**: ${pr.mergeable}
**Auto-merge**: ${pr.auto_merge ? 'Enabled' : 'Disabled'}
`;
      
      appendToFile(finalSummary);
      
      if (currentState.failed > 0) {
        appendToFile(`\n**Next Steps**: Run \`node scripts/capture-ci-errors.js ${prNumber}\` for detailed error analysis.\n`);
      }
      
      console.log(`\n🏁 Monitoring complete! All checks finished.`);
      console.log(`📄 Full log saved to: ${outputFile}`);
      
      if (currentState.failed > 0) {
        console.log(`\n💡 Run detailed error analysis:`);
        console.log(`   node scripts/capture-ci-errors.js ${prNumber}`);
      }
      
      process.exit(0);
    }
    
  } catch (error) {
    console.error(`❌ Error during check #${checkCount}:`, error.message);
    appendToFile(`### ❌ Error during check #${checkCount}\n\n\`\`\`\n${error.message}\n\`\`\`\n`);
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

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(`\n\n⏹️  Monitoring stopped by user`);
  appendToFile(`\n---\n\n**Monitoring stopped by user at**: ${new Date().toISOString()}`);
  appendToFile(`**Total checks performed**: ${checkCount}`);
  console.log(`📄 Log saved to: ${outputFile}`);
  process.exit(0);
});

// Start monitoring
checkPR();
setInterval(checkPR, intervalSeconds * 1000);
