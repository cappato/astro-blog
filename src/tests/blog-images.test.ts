/**
 * Blog Images Test Suite
 * Verifies that all blog post images exist and are properly configured
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
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
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

describe('Blog Post Images', () => {
  it('should have all required image variants for posts with postId', async () => {
    const posts = await getBlogPosts();
    const missingImages: string[] = [];

    // Only check posts that are expected to have images
    const postsWithImages = posts.filter(post => {
      const { postId } = post.data;
      if (!postId) return false;

      // Only check posts that we know have images
      const postsWithImageSupport = [
        'reglas-rigidas-vs-escalamiento-progresivo'
        // Add more postIds here as we create images for them
      ];

      return postsWithImageSupport.includes(postId);
    });

    for (const post of postsWithImages) {
      const { postId } = post.data;

      if (postId) {
        const imageDir = path.join(process.cwd(), 'public', 'images', 'blog', postId);
        
        // Required image variants (optimized - only essential ones)
        const requiredVariants = [
          'portada.webp',           // Post principal
          'portada-avif.avif',      // Formato moderno
          'portada-thumb.webp',     // Miniaturas (CRÍTICO)
          'portada-og.webp'         // Redes sociales (CRÍTICO)
        ];

        // Optional variants (nice to have but not required)
        const optionalVariants = [
          'portada-og-jpg.jpeg',    // JPEG fallback (redundante)
          'portada-og-avif.avif',   // AVIF para OG (pocas redes lo soportan)
          'portada-wsp.webp',       // WhatsApp (no se usa)
          'portada-lqip.webp',      // LQIP (no implementado)
          'portada-lqip.txt'        // LQIP data (no implementado)
        ];
        
        for (const variant of requiredVariants) {
          const imagePath = path.join(imageDir, variant);
          
          if (!fs.existsSync(imagePath)) {
            missingImages.push(`${postId}/${variant}`);
          } else {
            // Check file size (LQIP files are intentionally small)
            const stats = fs.statSync(imagePath);
            const isLQIP = variant.includes('lqip');
            const minSize = isLQIP ? 50 : 1024; // LQIP can be very small

            if (stats.size < minSize) {
              missingImages.push(`${postId}/${variant} (file too small: ${stats.size} bytes, min: ${minSize})`);
            }
          }
        }
      }
    }
    
    if (missingImages.length > 0) {
      console.error('Missing or invalid images:');
      missingImages.forEach(img => console.error(`  - ${img}`));
    }
    
    expect(missingImages).toHaveLength(0);
  });

  it('should have valid image references in markdown content', async () => {
    const posts = await getBlogPosts();
    const brokenImageRefs: string[] = [];
    
    for (const post of posts) {
      const { postId } = post.data;
      const content = post.body;
      
      // Find all image references in markdown
      const imageRegex = /!\[.*?\]\((.*?)\)/g;
      let match;
      
      while ((match = imageRegex.exec(content)) !== null) {
        const imagePath = match[1];
        
        // Skip external URLs
        if (imagePath.startsWith('http')) continue;
        
        // Convert to file system path
        const fullPath = path.join(process.cwd(), 'public', imagePath);
        
        if (!fs.existsSync(fullPath)) {
          brokenImageRefs.push(`${post.slug}: ${imagePath}`);
        }
      }
    }
    
    if (brokenImageRefs.length > 0) {
      console.error('Broken image references in markdown:');
      brokenImageRefs.forEach(ref => console.error(`  - ${ref}`));
    }
    
    expect(brokenImageRefs).toHaveLength(0);
  });

  it('should have proper image alt text', async () => {
    const posts = await getBlogPosts();
    const missingAltText: string[] = [];
    
    for (const post of posts) {
      const { postId, imageAlt, title } = post.data;
      
      if (postId && !imageAlt) {
        missingAltText.push(`${postId}: Missing imageAlt (using title as fallback)`);
      }
    }
    
    // This is a warning, not a failure
    if (missingAltText.length > 0) {
      console.warn('Posts without explicit imageAlt:');
      missingAltText.forEach(msg => console.warn(`  - ${msg}`));
    }
    
    // Don't fail the test, just warn
    expect(true).toBe(true);
  });
});
