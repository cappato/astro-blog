#!/usr/bin/env node

/**
 * Validador de Política de Emojis
 * Implementa la nueva política balanceada de emojis
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

const ALLOWED_PATHS = [
  '.github/',
  'docs/',
  'scripts/',
  '.githooks/',
  'README.md',
  'CHANGELOG.md'
];

const PROHIBITED_PATHS = [
  'src/',
  'tests/',
  'test/'
];

const PROHIBITED_EXTENSIONS = [
  '.json',
  '.yml',
  '.yaml',
  '.ts',
  '.js',
  '.jsx',
  '.tsx',
  '.vue',
  '.svelte'
];

class EmojiPolicyValidator {
  constructor() {
    this.violations = [];
    this.allowed = [];
    this.checked = 0;
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
      // Skip files that can't be read
    }
  }

  isEmojiAllowed(filePath) {
    // Check if file is in allowed paths
    const isInAllowedPath = ALLOWED_PATHS.some(path => 
      filePath.startsWith(path)
    );
    
    if (isInAllowedPath) return true;
    
    // Check if file is in prohibited paths
    const isInProhibitedPath = PROHIBITED_PATHS.some(path => 
      filePath.startsWith(path)
    );
    
    if (isInProhibitedPath) return false;
    
    // Check file extension
    const ext = extname(filePath);
    const isProhibitedExtension = PROHIBITED_EXTENSIONS.includes(ext);
    
    if (isProhibitedExtension) return false;
    
    // Special cases for console.log in scripts
    if (filePath.startsWith('scripts/') && (ext === '.js' || ext === '.mjs')) {
      const content = readFileSync(filePath, 'utf8');
      // Allow emojis only in console.log statements
      const lines = content.split('\n');
      const emojiLines = this.findEmojiLines(content, content.match(EMOJI_REGEX) || []);
      
      return emojiLines.every(lineNum => {
        const line = lines[lineNum - 1];
        return line.includes('console.log') || line.includes('console.error') || line.includes('console.warn');
      });
    }
    
    // Default: allow for other files not explicitly prohibited
    return true;
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

  scanDirectory(dir = '.', depth = 0) {
    if (depth > 5) return; // Prevent infinite recursion
    
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        
        // Skip hidden files and node_modules
        if (item.startsWith('.') && item !== '.github' && item !== '.githooks') continue;
        if (item === 'node_modules') continue;
        if (item === 'dist') continue;
        if (item === 'build') continue;
        
        try {
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            this.scanDirectory(fullPath, depth + 1);
          } else if (stat.isFile()) {
            this.validateFile(fullPath);
          }
        } catch (error) {
          // Skip files/dirs that can't be accessed
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }

  printResults() {
    console.log('🔍 EMOJI POLICY VALIDATION RESULTS\n');
    
    console.log(`📊 Files checked: ${this.checked}`);
    console.log(`✅ Files with allowed emojis: ${this.allowed.length}`);
    console.log(`❌ Policy violations: ${this.violations.length}\n`);
    
    if (this.violations.length > 0) {
      console.log('❌ POLICY VIOLATIONS:');
      this.violations.forEach(violation => {
        console.log(`\n  📄 ${violation.file}`);
        console.log(`     Emojis: ${violation.emojis.join(' ')} (${violation.count} total)`);
        console.log(`     Lines: ${violation.lines.join(', ')}`);
      });
      console.log('\n💡 Fix: Remove emojis from prohibited files or move to allowed locations');
    }
    
    if (this.allowed.length > 0 && process.env.VERBOSE) {
      console.log('\n✅ ALLOWED EMOJI USAGE:');
      this.allowed.forEach(allowed => {
        console.log(`  📄 ${allowed.file}: ${allowed.emojis.join(' ')} (${allowed.count})`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.violations.length === 0) {
      console.log('🎉 EMOJI POLICY: COMPLIANT');
      console.log('✅ All emoji usage follows the established policy');
    } else {
      console.log('🚨 EMOJI POLICY: VIOLATIONS DETECTED');
      console.log(`❌ ${this.violations.length} files violate the emoji policy`);
    }
    
    console.log('='.repeat(60));
  }

  validate() {
    console.log('🔍 Validating emoji policy...\n');
    console.log('📋 Policy: Emojis allowed in documentation/tools, prohibited in source code\n');
    
    this.scanDirectory();
    this.printResults();
    
    return this.violations.length === 0;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new EmojiPolicyValidator();
  const isCompliant = validator.validate();
  process.exit(isCompliant ? 0 : 1);
}

export { EmojiPolicyValidator };
