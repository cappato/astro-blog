#!/usr/bin/env node

/**
 * Simple CI Check
 * Basic analysis of PR status
 */

import { execSync } from 'child_process';

const prNumber = process.argv[2];

if (!prNumber) {
  console.log('Usage: node scripts/simple-check.js [PR_NUMBER]');
  console.log('Example: node scripts/simple-check.js 82');
  process.exit(1);
}

console.log(`Analyzing PR #${prNumber}`);
console.log('='.repeat(40));

try {
  // Get PR status using basic gh command
  console.log('Getting PR status...');
  
  const result = execSync(`gh pr view ${prNumber}`, { 
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' }
  });
  
  console.log('PR Information:');
  console.log('-'.repeat(20));
  
  // Parse basic info from output
  const lines = result.split('\n');
  const titleLine = lines[0];
  console.log(`Title: ${titleLine}`);
  
  // Look for status information
  const statusLines = lines.filter(line => 
    line.includes('✓') || 
    line.includes('✗') || 
    line.includes('×') ||
    line.includes('pending') ||
    line.includes('success') ||
    line.includes('failure')
  );
  
  if (statusLines.length > 0) {
    console.log('\nCheck Status:');
    console.log('-'.repeat(20));
    statusLines.forEach(line => {
      console.log(line.trim());
    });
  }
  
  // Count checks
  const successCount = statusLines.filter(line => line.includes('✓')).length;
  const failureCount = statusLines.filter(line => line.includes('✗') || line.includes('×')).length;
  
  console.log('\nSummary:');
  console.log('-'.repeat(20));
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
  console.log(`Total visible: ${statusLines.length}`);
  
  if (failureCount > 0) {
    console.log('\nRecommended Actions:');
    console.log('- Run: npm run test:unit');
    console.log('- Run: npm run build');
    console.log('- Check GitHub Actions logs');
  } else if (successCount > 0) {
    console.log('\nStatus: Checks are passing!');
  }
  
} catch (error) {
  console.error('Error:', error.message);
  
  // Try alternative approach
  console.log('\nTrying alternative approach...');
  try {
    const altResult = execSync(`gh pr status`, { 
      encoding: 'utf8',
      env: { ...process.env, NO_COLOR: '1' }
    });
    console.log('Current PR status:');
    console.log(altResult);
  } catch (altError) {
    console.error('Alternative approach also failed:', altError.message);
  }
}
