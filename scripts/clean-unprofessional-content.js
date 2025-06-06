#!/usr/bin/env node

/**
 * Professional Content Cleanup
 * Removes emojis, agent references, and casual language from codebase
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Emoji detection and removal
const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

// Agent references to remove
const agentReferences = [
  { pattern: /\bganzo\b/gi, replacement: '' },
  { pattern: /\[GANZO\]/gi, replacement: '' },
  { pattern: /\bagent:\s*\w+/gi, replacement: '' },
  { pattern: /\baugment agent\b/gi, replacement: '' },
  { pattern: /\bmulti-agent system\b/gi, replacement: 'automated system' },
  { pattern: /\bai assistant\b/gi, replacement: 'system' },
  { pattern: /\bclaude\b/gi, replacement: '' },
  { pattern: /\banthropics?\b/gi, replacement: '' }
];

// Casual language replacements
const casualReplacements = [
  { pattern: /\bawesome\b/gi, replacement: 'excellent' },
  { pattern: /\bcool\b/gi, replacement: 'effective' },
  { pattern: /\bamazing\b/gi, replacement: 'comprehensive' },
  { pattern: /\bfantastic\b/gi, replacement: 'optimal' },
  { pattern: /\bgreat job\b/gi, replacement: 'completed successfully' },
  { pattern: /\bhey\b/gi, replacement: '' },
  { pattern: /\bhi\b/gi, replacement: '' },
  { pattern: /\bhello\b/gi, replacement: '' },
  { pattern: /\bgonna\b/gi, replacement: 'going to' },
  { pattern: /\bwanna\b/gi, replacement: 'want to' },
  { pattern: /\bgotta\b/gi, replacement: 'need to' },
  { pattern: /\bsuper\b/gi, replacement: 'highly' },
  { pattern: /\bmega\b/gi, replacement: 'large' },
  { pattern: /\bultra\b/gi, replacement: 'advanced' }
];

async function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    const originalContent = content;

    // Remove emojis
    const emojiMatches = content.match(emojiRegex);
    if (emojiMatches) {
      content = content.replace(emojiRegex, '');
      modified = true;
      console.log(`  Removed ${emojiMatches.length} emojis`);
    }

    // Remove agent references
    for (const { pattern, replacement } of agentReferences) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        modified = true;
        console.log(`  Removed agent reference: ${matches[0]}`);
      }
    }

    // Replace casual language
    for (const { pattern, replacement } of casualReplacements) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        modified = true;
        console.log(`  Replaced casual language: ${matches[0]} -> ${replacement}`);
      }
    }

    // Clean up extra whitespace
    content = content
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple empty lines
      .replace(/[ \t]+$/gm, '') // Trailing whitespace
      .replace(/^\s*\n/gm, '\n'); // Leading empty lines

    if (modified) {
      fs.writeFileSync(filePath, content);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function cleanDirectory(pattern, description) {
  console.log(`\nCleaning ${description}...`);
  
  const files = await glob(pattern);
  let cleanedCount = 0;

  for (const file of files) {
    // Skip certain files
    if (file.includes('node_modules') || 
        file.includes('.git') || 
        file.includes('dist') ||
        file.includes('clean-unprofessional-content.js')) {
      continue;
    }

    console.log(`Processing: ${file}`);
    const wasCleaned = await cleanFile(file);
    if (wasCleaned) {
      cleanedCount++;
    }
  }

  console.log(`${description}: ${cleanedCount} files cleaned`);
  return cleanedCount;
}

async function runCleanup() {
  console.log('PROFESSIONAL CONTENT CLEANUP');
  console.log('=============================');
  console.log('Removing emojis, agent references, and casual language...\n');

  let totalCleaned = 0;

  // Clean source files
  totalCleaned += await cleanDirectory('src/**/*.{ts,tsx,astro,js,jsx}', 'Source files');

  // Clean documentation (except multi-agent docs)
  totalCleaned += await cleanDirectory('docs/**/!(multi-agent)*.md', 'Documentation');

  // Clean blog posts
  totalCleaned += await cleanDirectory('src/content/blog/*.md', 'Blog posts');

  // Clean scripts (except this one)
  totalCleaned += await cleanDirectory('scripts/*.{js,ts}', 'Scripts');

  // Clean configuration files
  totalCleaned += await cleanDirectory('*.{json,md,yml,yaml}', 'Configuration files');

  console.log('\n=============================');
  console.log(`CLEANUP COMPLETE: ${totalCleaned} files modified`);
  
  if (totalCleaned > 0) {
    console.log('\nNext steps:');
    console.log('1. Review changes with: git diff');
    console.log('2. Run tests: npm run test');
    console.log('3. Commit changes if satisfied');
  } else {
    console.log('\nNo unprofessional content found. Codebase is clean.');
  }
}

// Run cleanup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCleanup().catch(console.error);
}

export { cleanFile, runCleanup };
