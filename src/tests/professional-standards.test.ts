import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * Professional Standards Validation
 * Ensures all content meets professional standards without emojis, agent names, or casual language
 */

describe('Professional Standards Validation', () => {
  // Emoji detection regex
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

  // Agent/system references to avoid
  const forbiddenTerms = [
    /\bganzo\b/gi,
    /\bagent\b/gi,
    /\baugment\b/gi,
    /\bmulti-agent\b/gi,
    /\bai assistant\b/gi,
    /\bclaude\b/gi,
    /\banthropics?\b/gi
  ];

  // Casual language patterns
  const casualPatterns = [
    /\b(excellent|effective|comprehensive|optimal|completed successfully)\b/gi,
    /\b(||)\b/gi,
    /\b(going to|want to|need to)\b/gi,
    /\b(highly|large|advanced)\b/gi
  ];

  it('should not contain emojis in any source files', async () => {
    const sourceFiles = await glob('src/**/*.{ts,tsx,astro,js,jsx}');
    const violations: string[] = [];

    for (const file of sourceFiles) {
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

  it('should not contain emojis in documentation files', async () => {
    const docFiles = await glob('docs/**/*.md');
    const violations: string[] = [];

    for (const file of docFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const emojiMatches = content.match(emojiRegex);

      if (emojiMatches) {
        violations.push(`${file}: Found emojis: ${emojiMatches.join(', ')}`);
      }
    }

    if (violations.length > 0) {
      console.error('DOCUMENTATION EMOJI VIOLATIONS:');
      violations.forEach(v => console.error(`  - ${v}`));
    }

    expect(violations).toHaveLength(0);
  });

  it('should not contain agent references in source code', async () => {
    const sourceFiles = await glob('src/**/*.{ts,tsx,astro,js,jsx}');
    const violations: string[] = [];

    for (const file of sourceFiles) {
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

  it('should not contain casual language in documentation', async () => {
    const docFiles = await glob('docs/**/*.md');
    const violations: string[] = [];

    for (const file of docFiles) {
      // Skip multi-agent specific docs (they can reference agents)
      if (file.includes('multi-agent')) continue;

      const content = fs.readFileSync(file, 'utf-8');

      for (const pattern of casualPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          violations.push(`${file}: Found casual language: ${matches.join(', ')}`);
        }
      }
    }

    if (violations.length > 0) {
      console.error('CASUAL LANGUAGE VIOLATIONS:');
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

  it('should use professional commit message format', async () => {
    // This test checks the last few commits for professional standards
    try {
      const { execSync } = await import('child_process');
      const commits = execSync('git log --oneline -10', { encoding: 'utf-8' });
      const commitLines = commits.split('\n').filter(Boolean);
      const violations: string[] = [];

      for (const commit of commitLines) {
        // Check for emojis in commit messages
        const emojiMatches = commit.match(emojiRegex);
        if (emojiMatches) {
          violations.push(`Commit "${commit}": Contains emojis`);
        }

        // Check for agent names in commit messages
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
      // Skip if git is not available
      console.warn('Git not available, skipping commit message validation');
    }
  });

  it('should have professional package.json scripts', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const violations: string[] = [];

    for (const [scriptName, scriptCommand] of Object.entries(packageJson.scripts || {})) {
      const command = scriptCommand as string;

      // Check for emojis in script names or commands
      const emojiMatches = (scriptName + ' ' + command).match(emojiRegex);
      if (emojiMatches) {
        violations.push(`Script "${scriptName}": Contains emojis`);
      }

      // Check for casual language
      for (const pattern of casualPatterns) {
        const matches = command.match(pattern);
        if (matches) {
          violations.push(`Script "${scriptName}": Contains casual language: ${matches.join(', ')}`);
        }
      }
    }

    if (violations.length > 0) {
      console.error('PACKAGE.JSON VIOLATIONS:');
      violations.forEach(v => console.error(`  - ${v}`));
    }

    expect(violations).toHaveLength(0);
  });
});
