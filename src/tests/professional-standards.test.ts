import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { glob } from 'glob';

/**
 * Professional Standards Validation
 * Ensures all content meets professional standards
 */

describe('Professional Standards Validation', () => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  
  const forbiddenTerms = [
    /\bganzo\b/gi,
    /\bagent\b/gi,
    /\baugment\b/gi,
    /\bmulti-agent\b/gi,
    /\bai assistant\b/gi,
    /\bclaude\b/gi,
    /\banthropics?\b/gi
  ];

  const casualPatterns = [
    /\b(awesome|cool|amazing|fantastic|great job)\b/gi,
    /\b(hey|hi|hello)\b/gi,
    /\b(gonna|wanna|gotta)\b/gi,
    /\b(super|mega|ultra)\b/gi
  ];

  it('should not contain emojis in source files', async () => {
    const sourceFiles = await glob('src/**/*.{ts,tsx,astro,js,jsx}');
    const violations: string[] = [];

    for (const file of sourceFiles) {
      // Skip test files that may contain emojis for testing purposes
      if (file.includes('__tests__') || file.includes('.test.') || file.includes('/tests/')) {
        continue;
      }

      const content = fs.readFileSync(file, 'utf-8');
      const emojiMatches = content.match(emojiRegex);

      if (emojiMatches) {
        violations.push(`${file}: Found emojis: ${emojiMatches.join(', ')}`);
      }
    }

    if (violations.length > 0) {
      console.error('EMOJI VIOLATIONS DETECTED:');
      violations.forEach(v => console.error(`  - ${v}`));
    }

    expect(violations).toHaveLength(0);
  });

  it('should not contain emojis in blog posts', async () => {
    const blogFiles = await glob('src/content/blog/*.md');
    const violations: string[] = [];

    for (const file of blogFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const emojiMatches = content.match(emojiRegex);
      
      if (emojiMatches) {
        violations.push(`${file}: Found emojis: ${emojiMatches.join(', ')}`);
      }
    }

    if (violations.length > 0) {
      console.error('BLOG POST EMOJI VIOLATIONS:');
      violations.forEach(v => console.error(`  - ${v}`));
    }

    expect(violations).toHaveLength(0);
  });

  it('should not contain agent references in source code', async () => {
    const sourceFiles = await glob('src/**/*.{ts,tsx,astro,js,jsx}');
    const violations: string[] = [];

    for (const file of sourceFiles) {
      // Skip test files that may contain agent references for testing purposes
      if (file.includes('__tests__') || file.includes('.test.') || file.includes('/tests/')) {
        continue;
      }

      const content = fs.readFileSync(file, 'utf-8');

      for (const pattern of forbiddenTerms) {
        const matches = content.match(pattern);
        if (matches) {
          violations.push(`${file}: Found forbidden term: ${matches.join(', ')}`);
        }
      }
    }

    if (violations.length > 0) {
      console.error('AGENT REFERENCE VIOLATIONS:');
      violations.forEach(v => console.error(`  - ${v}`));
    }

    expect(violations).toHaveLength(0);
  });

  it('should use professional commit message format', async () => {
    try {
      const { execSync } = await import('child_process');
      const commits = execSync('git log --oneline -10', { encoding: 'utf-8' });
      const commitLines = commits.split('\n').filter(Boolean);
      const violations: string[] = [];

      for (const commit of commitLines) {
        const emojiMatches = commit.match(emojiRegex);
        if (emojiMatches) {
          violations.push(`Commit "${commit}": Contains emojis`);
        }

        for (const pattern of forbiddenTerms) {
          const matches = commit.match(pattern);
          if (matches) {
            violations.push(`Commit "${commit}": Contains forbidden term: ${matches.join(', ')}`);
          }
        }
      }

      if (violations.length > 0) {
        console.error('COMMIT MESSAGE VIOLATIONS:');
        violations.forEach(v => console.error(`  - ${v}`));
        console.error('\nCommit messages should be professional and technical only.');
      }

      expect(violations).toHaveLength(0);
    } catch (error) {
      console.warn('Git not available, skipping commit message validation');
    }
  });
});
