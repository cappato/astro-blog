#!/usr/bin/env node

/**
 * Fix Series Numbers Script
 * Converts string values to numbers for seriesOrder and seriesTotal
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONTENT_DIR = 'src/content/blog';

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Fix series numbers in a blog post
 */
function fixSeriesNumbers(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let hasChanges = false;
  
  // Fix seriesOrder: "number" -> seriesOrder: number
  let newContent = content.replace(/seriesOrder:\s*"(\d+)"/g, (match, number) => {
    hasChanges = true;
    return `seriesOrder: ${number}`;
  });
  
  // Fix seriesTotal: "number" -> seriesTotal: number
  newContent = newContent.replace(/seriesTotal:\s*"(\d+)"/g, (match, number) => {
    hasChanges = true;
    return `seriesTotal: ${number}`;
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, newContent);
    const fileName = path.basename(filePath, '.md');
    log(`✅ Fixed ${fileName}`, 'green');
  }
  
  return hasChanges;
}

/**
 * Main function
 */
function main() {
  log('🔧 Series Numbers Fixer - Starting...', 'bold');
  log('=====================================\n', 'cyan');
  
  // Get all blog post files
  const blogFiles = fs.readdirSync(CONTENT_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(CONTENT_DIR, file));
  
  log(`📝 Processing ${blogFiles.length} blog posts...\n`, 'blue');
  
  let totalFixed = 0;
  
  // Process each blog post
  for (const filePath of blogFiles) {
    if (fixSeriesNumbers(filePath)) {
      totalFixed++;
    }
  }
  
  // Summary
  log('\n=====================================', 'cyan');
  log('📊 Summary:', 'bold');
  log(`   - Posts processed: ${blogFiles.length}`, 'blue');
  log(`   - Posts fixed: ${totalFixed}`, totalFixed > 0 ? 'green' : 'blue');
  
  if (totalFixed > 0) {
    log('\n✅ Series numbers have been fixed!', 'green');
    log('🔄 Content schema errors should be resolved.', 'yellow');
  } else {
    log('\n✅ No series number issues found!', 'green');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixSeriesNumbers };
