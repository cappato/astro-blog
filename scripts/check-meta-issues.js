#!/usr/bin/env node

/**
 * Check Meta Issues Script
 * Shows which posts have meta tag issues that need fixing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - Match the exact validation rules from the system
const CONTENT_DIR = 'src/content/blog';
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;
const MAX_KEYWORDS = 10;

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
 * Parse frontmatter from markdown file
 */
function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterText = frontmatterMatch[1];
  const body = content.slice(frontmatterMatch[0].length);
  
  // Simple YAML parser for our needs
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      if (value.startsWith('"') && value.endsWith('"')) {
        frontmatter[key.trim()] = value.slice(1, -1);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Parse array
        const arrayContent = value.slice(1, -1);
        frontmatter[key.trim()] = arrayContent
          .split(',')
          .map(item => item.trim().replace(/"/g, ''))
          .filter(item => item.length > 0);
      } else {
        frontmatter[key.trim()] = value.replace(/"/g, '');
      }
    }
  }
  
  return { frontmatter, body };
}

/**
 * Check meta tag issues in a blog post
 */
function checkBlogPost(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter } = parseFrontmatter(content);
  
  const issues = [];
  
  // Check title length
  if (frontmatter.title) {
    if (frontmatter.title.length > MAX_TITLE_LENGTH) {
      issues.push({
        type: 'title',
        message: `Title too long: ${frontmatter.title.length} chars (max: ${MAX_TITLE_LENGTH})`,
        current: frontmatter.title,
        length: frontmatter.title.length
      });
    }
  }
  
  // Check description length
  if (frontmatter.description) {
    if (frontmatter.description.length > MAX_DESCRIPTION_LENGTH) {
      issues.push({
        type: 'description',
        message: `Description too long: ${frontmatter.description.length} chars (max: ${MAX_DESCRIPTION_LENGTH})`,
        current: frontmatter.description,
        length: frontmatter.description.length
      });
    }
  }
  
  // Check keywords count
  if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
    if (frontmatter.tags.length > MAX_KEYWORDS) {
      issues.push({
        type: 'keywords',
        message: `Too many keywords: ${frontmatter.tags.length} tags (max: ${MAX_KEYWORDS})`,
        current: frontmatter.tags,
        count: frontmatter.tags.length
      });
    }
  }
  
  return { 
    issues,
    title: frontmatter.title,
    postId: frontmatter.postId
  };
}

/**
 * Main function
 */
function main() {
  log('🔍 Meta Tags Issues Checker', 'bold');
  log('=====================================\n', 'cyan');
  
  // Get all blog post files
  const blogFiles = fs.readdirSync(CONTENT_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(CONTENT_DIR, file));
  
  log(`📝 Checking ${blogFiles.length} blog posts...\n`, 'blue');
  
  let totalIssues = 0;
  let postsWithIssues = 0;
  
  // Check each blog post
  for (const filePath of blogFiles) {
    const fileName = path.basename(filePath, '.md');
    const result = checkBlogPost(filePath);
    
    if (result.issues.length > 0) {
      postsWithIssues++;
      
      log(`❌ ${fileName}:`, 'red');
      log(`   Title: "${result.title}"`, 'blue');
      
      result.issues.forEach(issue => {
        log(`   🔴 ${issue.message}`, 'red');
        if (issue.type === 'title' || issue.type === 'description') {
          log(`      Current: "${issue.current}"`, 'yellow');
        } else if (issue.type === 'keywords') {
          log(`      Current: [${issue.current.join(', ')}]`, 'yellow');
        }
      });
      
      totalIssues += result.issues.length;
      console.log();
    }
  }
  
  // Summary
  log('=====================================', 'cyan');
  log('📊 Summary:', 'bold');
  log(`   - Posts checked: ${blogFiles.length}`, 'blue');
  log(`   - Posts with issues: ${postsWithIssues}`, postsWithIssues > 0 ? 'red' : 'green');
  log(`   - Total issues: ${totalIssues}`, totalIssues > 0 ? 'red' : 'green');
  
  if (totalIssues === 0) {
    log('\n✅ All meta tags are within limits!', 'green');
  } else {
    log('\n💡 To fix these issues:', 'blue');
    log('   1. Shorten titles to 60 characters or less', 'yellow');
    log('   2. Shorten descriptions to 160 characters or less', 'yellow');
    log('   3. Reduce keywords to 10 or fewer', 'yellow');
  }
}

// Run the checker
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkBlogPost };
