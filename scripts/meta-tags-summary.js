#!/usr/bin/env node

/**
 * Meta Tags Issues Summary
 * Shows current status of meta tag fixes and remaining issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
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
        // Try to parse as number
        const cleanValue = value.replace(/"/g, '');
        const numValue = Number(cleanValue);
        if (!isNaN(numValue) && cleanValue.match(/^\d+$/)) {
          frontmatter[key.trim()] = numValue;
        } else {
          frontmatter[key.trim()] = cleanValue;
        }
      }
    }
  }
  
  return { frontmatter, body };
}

/**
 * Analyze meta tag issues in a blog post
 */
function analyzeBlogPost(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter } = parseFrontmatter(content);
  
  const issues = [];
  const warnings = [];
  
  // Check title length
  if (frontmatter.title) {
    if (frontmatter.title.length > MAX_TITLE_LENGTH) {
      issues.push(`Title too long: ${frontmatter.title.length} chars (max: ${MAX_TITLE_LENGTH})`);
    }
  } else {
    issues.push('Missing title');
  }
  
  // Check description length
  if (frontmatter.description) {
    if (frontmatter.description.length > MAX_DESCRIPTION_LENGTH) {
      issues.push(`Description too long: ${frontmatter.description.length} chars (max: ${MAX_DESCRIPTION_LENGTH})`);
    }
  } else {
    warnings.push('Missing description');
  }
  
  // Check keywords count
  if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
    if (frontmatter.tags.length > MAX_KEYWORDS) {
      issues.push(`Too many keywords: ${frontmatter.tags.length} tags (max: ${MAX_KEYWORDS})`);
    }
  }
  
  // Check series data types
  if (frontmatter.seriesOrder && typeof frontmatter.seriesOrder === 'string') {
    issues.push('seriesOrder should be number, not string');
  }
  
  if (frontmatter.seriesTotal && typeof frontmatter.seriesTotal === 'string') {
    issues.push('seriesTotal should be number, not string');
  }
  
  return { 
    issues, 
    warnings,
    title: frontmatter.title,
    postId: frontmatter.postId
  };
}

/**
 * Check for missing thumbnail images
 */
function checkMissingImages() {
  const blogFiles = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md'));
  const missingImages = [];
  
  for (const file of blogFiles) {
    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { frontmatter } = parseFrontmatter(content);
    
    if (frontmatter.postId) {
      const thumbPath = path.join('public/images', frontmatter.postId, 'portada-thumb.webp');
      if (!fs.existsSync(thumbPath)) {
        missingImages.push(frontmatter.postId);
      }
    }
  }
  
  return missingImages;
}

/**
 * Main analysis function
 */
function main() {
  log('🔍 Meta Tags Analysis Report', 'bold');
  log('=====================================\n', 'cyan');
  
  // Get all blog post files
  const blogFiles = fs.readdirSync(CONTENT_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(CONTENT_DIR, file));
  
  log(`📝 Analyzing ${blogFiles.length} blog posts...\n`, 'blue');
  
  let totalIssues = 0;
  let totalWarnings = 0;
  let postsWithIssues = 0;
  const issuesByType = {};
  
  // Analyze each blog post
  for (const filePath of blogFiles) {
    const fileName = path.basename(filePath, '.md');
    const result = analyzeBlogPost(filePath);
    
    if (result.issues.length > 0 || result.warnings.length > 0) {
      postsWithIssues++;
      
      log(`❌ ${fileName}:`, 'red');
      
      result.issues.forEach(issue => {
        log(`   🔴 ${issue}`, 'red');
        totalIssues++;
        
        // Count issue types
        const issueType = issue.split(':')[0];
        issuesByType[issueType] = (issuesByType[issueType] || 0) + 1;
      });
      
      result.warnings.forEach(warning => {
        log(`   🟡 ${warning}`, 'yellow');
        totalWarnings++;
      });
      
      console.log();
    }
  }
  
  // Check missing images
  const missingImages = checkMissingImages();
  
  // Summary
  log('=====================================', 'cyan');
  log('📊 Summary:', 'bold');
  log(`   - Posts analyzed: ${blogFiles.length}`, 'blue');
  log(`   - Posts with issues: ${postsWithIssues}`, postsWithIssues > 0 ? 'red' : 'green');
  log(`   - Total issues: ${totalIssues}`, totalIssues > 0 ? 'red' : 'green');
  log(`   - Total warnings: ${totalWarnings}`, totalWarnings > 0 ? 'yellow' : 'green');
  log(`   - Missing images: ${missingImages.length}`, missingImages.length > 0 ? 'red' : 'green');
  
  if (Object.keys(issuesByType).length > 0) {
    log('\n🔍 Issues by type:', 'blue');
    Object.entries(issuesByType).forEach(([type, count]) => {
      log(`   - ${type}: ${count}`, 'yellow');
    });
  }
  
  if (missingImages.length > 0) {
    log('\n🖼️ Missing thumbnail images:', 'red');
    missingImages.forEach(postId => {
      log(`   - ${postId}/portada-thumb.webp`, 'red');
    });
  }
  
  // Recommendations
  log('\n💡 Recommendations:', 'blue');
  
  if (totalIssues > 0) {
    log('   1. Run the meta tags fixer script to resolve issues:', 'yellow');
    log('      npm run fix-meta-tags', 'cyan');
  }
  
  if (missingImages.length > 0) {
    log('   2. Create missing thumbnail images or use placeholders', 'yellow');
  }
  
  if (totalIssues === 0 && missingImages.length === 0) {
    log('   ✅ All meta tags are properly configured!', 'green');
    log('   ✅ All thumbnail images exist!', 'green');
  }
  
  log('\n🚀 Next steps:', 'blue');
  log('   - Restart your dev server to see changes', 'cyan');
  log('   - Check browser console for any remaining warnings', 'cyan');
  log('   - Test meta tags with social media preview tools', 'cyan');
}

// Run the analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeBlogPost, checkMissingImages };
