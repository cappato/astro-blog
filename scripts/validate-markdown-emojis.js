#!/usr/bin/env node

/**
 * Markdown Emoji Validator
 * Validates that markdown files don't contain emojis (professional standards)
 * 
 * This replaces the emoji validation part of validate-emoji-policy.js
 * for markdown files specifically.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { glob } from 'glob';

// Same emoji regex as the original script
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

// Files/directories where emojis are allowed in markdown
const ALLOWED_MARKDOWN_PATHS = [
  'README.md',
  'CHANGELOG.md',
  'docs/',
  'scripts/',
  '.github/',
];

class MarkdownEmojiValidator {
  constructor() {
    this.violations = [];
    this.allowed = [];
    this.checked = 0;
  }

  async validateMarkdownFiles() {
    console.log('🔍 Validating emojis in markdown files...\n');
    
    // Find all markdown files
    const markdownFiles = await glob('**/*.md', {
      ignore: ['node_modules/**', 'dist/**', '.git/**']
    });

    for (const file of markdownFiles) {
      this.validateFile(file);
    }

    this.printResults();
    return this.violations.length === 0;
  }

  validateFile(filePath) {
    this.checked++;
    
    try {
      const content = readFileSync(filePath, 'utf8');
      const emojis = content.match(EMOJI_REGEX);
      
      if (!emojis) return; // No emojis found
      
      const isAllowed = this.isEmojiAllowed(filePath);
      
      if (isAllowed) {
        this.allowed.push({
          file: filePath,
          count: emojis.length,
          emojis: [...new Set(emojis)]
        });
      } else {
        this.violations.push({
          file: filePath,
          count: emojis.length,
          emojis: [...new Set(emojis)],
          lines: this.findEmojiLines(content, emojis)
        });
      }
      
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}`);
    }
  }

  isEmojiAllowed(filePath) {
    // Check if file is in allowed paths
    return ALLOWED_MARKDOWN_PATHS.some(allowedPath => 
      filePath.startsWith(allowedPath) || filePath === allowedPath
    );
  }

  findEmojiLines(content, emojis) {
    const lines = content.split('\n');
    const emojiLines = [];
    
    lines.forEach((line, index) => {
      if (emojis.some(emoji => line.includes(emoji))) {
        emojiLines.push(index + 1);
      }
    });
    
    return emojiLines;
  }

  printResults() {
    console.log('📋 MARKDOWN EMOJI VALIDATION RESULTS\n');
    
    console.log(`📊 Markdown files checked: ${this.checked}`);
    console.log(`✅ Files with allowed emojis: ${this.allowed.length}`);
    console.log(`❌ Policy violations: ${this.violations.length}\n`);
    
    if (this.violations.length > 0) {
      console.log('❌ EMOJI POLICY VIOLATIONS IN MARKDOWN:');
      this.violations.forEach(violation => {
        console.log(`\n  📄 ${violation.file}`);
        console.log(`     Emojis: ${violation.emojis.join(' ')} (${violation.count} total)`);
        console.log(`     Lines: ${violation.lines.join(', ')}`);
      });
      console.log('\n💡 Fix: Remove emojis from blog posts and technical documentation');
      console.log('💡 Note: Emojis are allowed in README.md, docs/, and scripts/');
    }
    
    if (this.allowed.length > 0 && process.env.VERBOSE) {
      console.log('\n✅ ALLOWED EMOJI USAGE IN MARKDOWN:');
      this.allowed.forEach(allowed => {
        console.log(`  📄 ${allowed.file}: ${allowed.emojis.join(' ')} (${allowed.count})`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.violations.length === 0) {
      console.log('🎉 MARKDOWN EMOJI POLICY: COMPLIANT');
      console.log('✅ All markdown files follow the emoji policy');
    } else {
      console.log('🚨 MARKDOWN EMOJI POLICY: VIOLATIONS DETECTED');
      console.log(`❌ ${this.violations.length} markdown files violate the emoji policy`);
    }
    
    console.log('='.repeat(60));
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new MarkdownEmojiValidator();
  const isCompliant = await validator.validateMarkdownFiles();
  process.exit(isCompliant ? 0 : 1);
}

export { MarkdownEmojiValidator };
