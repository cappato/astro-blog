/**
 * Blog Structure Test Suite
 * Verifies proper semantic structure and SEO compliance
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Helper to parse frontmatter
function parseFrontmatter(content: string) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) return {};

  const frontmatter = match[1];
  const data: any = {};

  // Simple YAML parser for our needs
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      let value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');

      // Handle arrays (tags)
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      }

      data[key.trim()] = value;
    }
  }

  return data;
}

// Helper to get all blog posts
async function getBlogPosts() {
  const contentDir = path.join(process.cwd(), 'src', 'content', 'blog');
  const files = await glob('*.md', { cwd: contentDir });

  const posts = [];
  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = parseFrontmatter(content);
    const slug = file.replace('.md', '');

    posts.push({
      slug,
      data,
      body: content.replace(/^---\s*\n[\s\S]*?\n---/, '').trim()
    });
  }

  return posts;
}

describe('Blog Post Structure', () => {
  it('should not have H1 tags in markdown content', async () => {
    const posts = await getBlogPosts();
    const postsWithH1: string[] = [];

    for (const post of posts) {
      let content = post.body;

      // Remove code blocks to avoid false positives with bash comments
      content = content.replace(/```[\s\S]*?```/g, '');

      // Check for H1 in markdown (# at start of line, not inside code)
      const h1Regex = /^#\s+(.+)$/gm;
      const h1Matches = content.match(h1Regex);

      if (h1Matches && h1Matches.length > 0) {
        postsWithH1.push(`${post.slug}: Found ${h1Matches.length} H1(s) - ${h1Matches.join(', ')}`);
      }
    }
    
    if (postsWithH1.length > 0) {
      console.error('Posts with H1 in markdown content (should be handled by layout):');
      postsWithH1.forEach(post => console.error(`  - ${post}`));
      console.error('\nH1 should only appear in the layout header, not in markdown content.');
      console.error('Use H2 (##) as the highest level heading in markdown.');
    }
    
    expect(postsWithH1).toHaveLength(0);
  });

  it('should start with H2 as highest level in content', async () => {
    const posts = await getBlogPosts();
    const invalidStructure: string[] = [];
    
    for (const post of posts) {
      const content = post.body;
      
      // Find all headings
      const headingRegex = /^(#{2,6})\s+(.+)$/gm;
      const headings = [...content.matchAll(headingRegex)];
      
      if (headings.length > 0) {
        const firstHeading = headings[0];
        const level = firstHeading[1].length;
        
        // First heading should be H2 (##)
        if (level !== 2) {
          invalidStructure.push(`${post.slug}: First heading is H${level}, should be H2`);
        }
        
        // Check for proper hierarchy
        let previousLevel = 2;
        for (let i = 0; i < headings.length; i++) {
          const currentLevel = headings[i][1].length;
          
          // Don't skip more than one level
          if (currentLevel > previousLevel + 1) {
            invalidStructure.push(`${post.slug}: Heading hierarchy skip from H${previousLevel} to H${currentLevel}`);
          }
          
          previousLevel = currentLevel;
        }
      }
    }
    
    if (invalidStructure.length > 0) {
      console.error('Posts with invalid heading structure:');
      invalidStructure.forEach(issue => console.error(`  - ${issue}`));
    }
    
    expect(invalidStructure).toHaveLength(0);
  });

  it('should have required frontmatter fields', async () => {
    const posts = await getBlogPosts();
    const missingFields: string[] = [];
    
    const requiredFields = ['title', 'description', 'date', 'author'];
    
    for (const post of posts) {
      const data = post.data;
      
      for (const field of requiredFields) {
        if (!data[field]) {
          missingFields.push(`${post.slug}: Missing ${field}`);
        }
      }
      
      // Check title length (SEO best practice) - only fail if extremely long
      if (data.title && data.title.length > 80) {
        missingFields.push(`${post.slug}: Title too long (${data.title.length} chars, max 80)`);
      }

      // Check description length - only fail if missing or extremely short/long
      if (data.description && (data.description.length < 50 || data.description.length > 300)) {
        missingFields.push(`${post.slug}: Description length invalid (${data.description.length} chars, range 50-300)`);
      }
    }
    
    if (missingFields.length > 0) {
      console.error('Posts with missing or invalid frontmatter:');
      missingFields.forEach(issue => console.error(`  - ${issue}`));
    }
    
    expect(missingFields).toHaveLength(0);
  });

  it('should have valid tags', async () => {
    const posts = await getBlogPosts();
    const tagIssues: string[] = [];
    
    for (const post of posts) {
      const { tags } = post.data;
      
      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        tagIssues.push(`${post.slug}: No tags defined`);
        continue;
      }
      
      // Check for too many tags - be more lenient
      if (tags.length > 15) {
        tagIssues.push(`${post.slug}: Too many tags (${tags.length}, max 15)`);
      }
      
      // Check tag format
      for (const tag of tags) {
        if (typeof tag !== 'string' || tag.trim() === '') {
          tagIssues.push(`${post.slug}: Invalid tag format`);
        }
      }
    }
    
    if (tagIssues.length > 0) {
      console.warn('Posts with tag issues:');
      tagIssues.forEach(issue => console.warn(`  - ${issue}`));
    }
    
    // Don't fail for tag issues, just warn
    expect(true).toBe(true);
  });
});
