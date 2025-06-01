/**
 * Shared post filtering utilities
 * Used by RSS feed, sitemap, and other content generation systems
 */

import type { CollectionEntry } from 'astro:content';

/**
 * Filters posts based on environment (production vs development)
 * Shared logic between RSS feed and sitemap generation
 * @param post Blog post to evaluate
 * @returns true if post should be included in feeds/sitemaps
 */
export function shouldIncludePost(post: CollectionEntry<'blog'>): boolean {
  // In production, exclude drafts. In development, include all posts
  return import.meta.env.PROD ? !post.data.draft : true;
}

/**
 * Validates basic post data structure
 * @param post Blog post to validate
 * @returns true if post has required fields
 */
export function isValidPost(post: CollectionEntry<'blog'>): boolean {
  return !!(
    post &&
    post.slug &&
    post.data &&
    post.data.title &&
    post.data.date
  );
}

/**
 * Filters and validates posts for content generation
 * Combines environment filtering with data validation
 * @param posts Array of blog posts
 * @returns Array of valid, includable posts
 */
export function getValidPosts(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return posts.filter(post => {
    if (!isValidPost(post)) {
      console.warn(`Skipping invalid post: ${post.slug || 'unknown'}`);
      return false;
    }
    
    return shouldIncludePost(post);
  });
}
