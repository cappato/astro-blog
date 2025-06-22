#!/usr/bin/env node

/**
 * Fix Meta Tags Script
 * Automatically fixes common meta tag issues:
 * - Titles too long (max 60 chars)
 * - Descriptions too long (max 160 chars)
 * - Too many keywords (max 10)
 * - Missing thumbnail images
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - Match the exact validation rules from the system
const CONTENT_DIR = 'src/content/blog';
const IMAGES_DIR = 'public/images';
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
        frontmatter[key.trim()] = value.replace(/"/g, '');
      }
    }
  }
  
  return { frontmatter, body };
}

/**
 * Generate frontmatter string from object
 */
function generateFrontmatter(frontmatter) {
  let result = '---\n';
  
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      result += `${key}: [${value.map(v => `"${v}"`).join(', ')}]\n`;
    } else {
      result += `${key}: "${value}"\n`;
    }
  }
  
  result += '---';
  return result;
}

/**
 * Shorten text while preserving meaning
 */
function shortenText(text, maxLength, type = 'title') {
  if (text.length <= maxLength) {
    return text;
  }

  // For titles, try to cut at word boundaries
  if (type === 'title') {
    const words = text.split(' ');
    let shortened = '';
    
    for (const word of words) {
      if ((shortened + ' ' + word).length <= maxLength) {
        shortened += (shortened ? ' ' : '') + word;
      } else {
        break;
      }
    }
    
    return shortened || text.slice(0, maxLength - 3) + '...';
  }
  
  // For descriptions, cut at sentence boundaries if possible
  if (type === 'description') {
    const sentences = text.split('. ');
    let shortened = '';
    
    for (const sentence of sentences) {
      const withSentence = shortened + (shortened ? '. ' : '') + sentence;
      if (withSentence.length <= maxLength) {
        shortened = withSentence;
      } else {
        break;
      }
    }
    
    if (shortened.length < maxLength * 0.7) {
      // If we lost too much, try word-based cutting
      const words = text.split(' ');
      shortened = '';
      
      for (const word of words) {
        if ((shortened + ' ' + word).length <= maxLength - 3) {
          shortened += (shortened ? ' ' : '') + word;
        } else {
          break;
        }
      }
      shortened += '...';
    }
    
    return shortened || text.slice(0, maxLength - 3) + '...';
  }
  
  return text.slice(0, maxLength);
}

/**
 * Fix meta tag issues in a blog post
 */
function fixBlogPost(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);
  
  let hasChanges = false;
  const issues = [];
  
  // Fix title length
  if (frontmatter.title && frontmatter.title.length > MAX_TITLE_LENGTH) {
    const originalTitle = frontmatter.title;
    frontmatter.title = shortenText(frontmatter.title, MAX_TITLE_LENGTH, 'title');
    issues.push(`Title shortened: ${originalTitle.length} → ${frontmatter.title.length} chars`);
    hasChanges = true;
  }
  
  // Fix description length
  if (frontmatter.description && frontmatter.description.length > MAX_DESCRIPTION_LENGTH) {
    const originalDesc = frontmatter.description;
    frontmatter.description = shortenText(frontmatter.description, MAX_DESCRIPTION_LENGTH, 'description');
    issues.push(`Description shortened: ${originalDesc.length} → ${frontmatter.description.length} chars`);
    hasChanges = true;
  }
  
  // Fix keywords count
  if (frontmatter.tags && Array.isArray(frontmatter.tags) && frontmatter.tags.length > MAX_KEYWORDS) {
    const originalCount = frontmatter.tags.length;
    frontmatter.tags = frontmatter.tags.slice(0, MAX_KEYWORDS);
    issues.push(`Keywords reduced: ${originalCount} → ${frontmatter.tags.length} tags`);
    hasChanges = true;
  }
  
  // Write changes if any
  if (hasChanges) {
    const newContent = generateFrontmatter(frontmatter) + body;
    fs.writeFileSync(filePath, newContent);
    
    const fileName = path.basename(filePath, '.md');
    log(`✅ Fixed ${fileName}:`, 'green');
    issues.forEach(issue => log(`   - ${issue}`, 'yellow'));
  }
  
  return { hasChanges, issues: issues.length };
}

/**
 * Create missing thumbnail images
 */
function createMissingThumbnails() {
  log('\n🖼️ Checking for missing thumbnail images...', 'blue');
  
  const blogFiles = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md'));
  const missingImages = [];
  
  for (const file of blogFiles) {
    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { frontmatter } = parseFrontmatter(content);
    
    if (frontmatter.postId) {
      const thumbPath = path.join(IMAGES_DIR, `${frontmatter.postId}/portada-thumb.webp`);
      if (!fs.existsSync(thumbPath)) {
        missingImages.push(frontmatter.postId);
      }
    }
  }
  
  if (missingImages.length > 0) {
    log(`Found ${missingImages.length} missing thumbnail images:`, 'yellow');
    missingImages.forEach(postId => {
      log(`   - ${postId}/portada-thumb.webp`, 'red');
      
      // Create directory if it doesn't exist
      const imageDir = path.join(IMAGES_DIR, postId);
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }
      
      // Copy placeholder image
      const placeholderPath = path.join(IMAGES_DIR, 'og-default.webp');
      const targetPath = path.join(imageDir, 'portada-thumb.webp');
      
      if (fs.existsSync(placeholderPath)) {
        fs.copyFileSync(placeholderPath, targetPath);
        log(`   ✅ Created placeholder for ${postId}`, 'green');
      }
    });
  } else {
    log('✅ All thumbnail images exist', 'green');
  }
}

/**
 * Main function
 */
function main() {
  log('🔧 Meta Tags Fixer - Starting...', 'bold');
  log('=====================================\n', 'cyan');
  
  // Get all blog post files
  const blogFiles = fs.readdirSync(CONTENT_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(CONTENT_DIR, file));
  
  log(`📝 Found ${blogFiles.length} blog posts to check\n`, 'blue');
  
  let totalFixed = 0;
  let totalIssues = 0;
  
  // Process each blog post
  for (const filePath of blogFiles) {
    const result = fixBlogPost(filePath);
    if (result.hasChanges) {
      totalFixed++;
      totalIssues += result.issues;
    }
  }
  
  // Handle missing images
  createMissingThumbnails();
  
  // Summary
  log('\n=====================================', 'cyan');
  log('📊 Summary:', 'bold');
  log(`   - Posts processed: ${blogFiles.length}`, 'blue');
  log(`   - Posts fixed: ${totalFixed}`, totalFixed > 0 ? 'green' : 'blue');
  log(`   - Total issues resolved: ${totalIssues}`, totalIssues > 0 ? 'green' : 'blue');
  
  if (totalFixed > 0) {
    log('\n✅ Meta tag issues have been fixed!', 'green');
    log('🔄 Restart your dev server to see the changes.', 'yellow');
  } else {
    log('\n✅ No meta tag issues found!', 'green');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixBlogPost, createMissingThumbnails };
