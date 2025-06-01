/**
 * Blog Post Utilities
 * Centralized utilities for blog post handling with configuration-driven behavior
 * 
 * Features:
 * - Post filtering and validation
 * - URL generation
 * - Date formatting
 * - Image handling
 * - SEO utilities
 */

import type { CollectionEntry } from 'astro:content';
import { BLOG_POST_CONFIG } from '../config/site.ts';
import { shouldIncludePost, isValidPost } from './shared/post-filters.ts';

export type BlogPost = CollectionEntry<'blog'>;

export interface BlogPostImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface BlogPostCardData {
  title: string;
  description: string;
  date: Date;
  formattedDate: string;
  url: string;
  image: BlogPostImage | null;
  tags: string[];
  slug: string;
}

/**
 * Blog Post Manager Class
 * Handles all blog post-related operations with centralized configuration
 */
export class BlogPostManager {
  private config = BLOG_POST_CONFIG;

  /**
   * Filter posts based on environment and validation
   */
  public filterPosts(posts: BlogPost[]): BlogPost[] {
    return posts.filter(post => {
      if (!isValidPost(post)) {
        console.warn(`Skipping invalid post: ${post.slug || 'unknown'}`);
        return false;
      }
      return shouldIncludePost(post);
    });
  }

  /**
   * Filter posts by tag
   */
  public filterPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
    return this.filterPosts(posts).filter(post => 
      post.data.tags?.includes(tag)
    );
  }

  /**
   * Sort posts by date (newest first)
   */
  public sortPostsByDate(posts: BlogPost[]): BlogPost[] {
    return [...posts].sort((a, b) => 
      b.data.date.getTime() - a.data.date.getTime()
    );
  }

  /**
   * Get all unique tags from posts
   */
  public extractUniqueTags(posts: BlogPost[]): string[] {
    const validPosts = this.filterPosts(posts);
    return [...new Set(validPosts.flatMap(post => post.data.tags || []))];
  }

  /**
   * Generate post URL
   */
  public generatePostUrl(post: BlogPost): string {
    const slug = post.data.slug || post.slug;
    return `${this.config.urls.basePath}/${slug}`;
  }

  /**
   * Generate tag URL
   */
  public generateTagUrl(tag: string): string {
    return `${this.config.urls.tagBasePath}/${tag}`;
  }

  /**
   * Format post date
   */
  public formatPostDate(date: Date): string {
    return date.toLocaleDateString(
      this.config.dateFormat.locale,
      this.config.dateFormat.options
    );
  }

  /**
   * Get post image configuration
   */
  public getPostImage(post: BlogPost): BlogPostImage | null {
    const { postId, image, imageAlt, title } = post.data;

    if (postId) {
      // New image system
      return {
        url: `/images/${postId}/portada-thumb.${this.config.images.thumbnail.format}`,
        alt: imageAlt || title,
        width: this.config.images.thumbnail.width,
        height: this.config.images.thumbnail.height
      };
    } else if (image) {
      // Legacy image system
      return {
        url: image.url,
        alt: image.alt || title,
        width: this.config.images.thumbnail.width,
        height: this.config.images.thumbnail.height
      };
    }

    return null;
  }

  /**
   * Transform post to card data
   */
  public transformToCardData(post: BlogPost): BlogPostCardData {
    return {
      title: post.data.title,
      description: post.data.description,
      date: post.data.date,
      formattedDate: this.formatPostDate(post.data.date),
      url: this.generatePostUrl(post),
      image: this.getPostImage(post),
      tags: post.data.tags || [],
      slug: post.data.slug || post.slug
    };
  }

  /**
   * Generate SEO title for tag pages
   */
  public generateTagTitle(tag: string): string {
    return this.config.seo.tagTitleTemplate.replace('{tag}', tag);
  }

  /**
   * Generate SEO description for tag pages
   */
  public generateTagDescription(tag: string): string {
    return this.config.seo.tagDescriptionTemplate.replace('{tag}', tag);
  }

  /**
   * Get blog index SEO data
   */
  public getBlogIndexSeo() {
    return {
      title: this.config.seo.blogTitle,
      description: this.config.seo.blogDescription
    };
  }

  /**
   * Get configuration for external use
   */
  public getConfig() {
    return this.config;
  }
}

/**
 * Singleton instance for easy access
 */
export const blogPostManager = new BlogPostManager();

/**
 * Utility functions for direct use
 */

/**
 * Filter and sort posts for display
 */
export function getDisplayPosts(posts: BlogPost[]): BlogPost[] {
  return blogPostManager.sortPostsByDate(
    blogPostManager.filterPosts(posts)
  );
}

/**
 * Get posts filtered by tag
 */
export function getPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  return blogPostManager.sortPostsByDate(
    blogPostManager.filterPostsByTag(posts, tag)
  );
}

/**
 * Get all unique tags from posts
 */
export function getAllTags(posts: BlogPost[]): string[] {
  return blogPostManager.extractUniqueTags(posts);
}

/**
 * Transform posts to card data
 */
export function transformPostsToCardData(posts: BlogPost[]): BlogPostCardData[] {
  return posts.map(post => blogPostManager.transformToCardData(post));
}

/**
 * Generate post URL
 */
export function getPostUrl(post: BlogPost): string {
  return blogPostManager.generatePostUrl(post);
}

/**
 * Generate tag URL
 */
export function getTagUrl(tag: string): string {
  return blogPostManager.generateTagUrl(tag);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return blogPostManager.formatPostDate(date);
}

/**
 * Get post image
 */
export function getPostImage(post: BlogPost): BlogPostImage | null {
  return blogPostManager.getPostImage(post);
}

/**
 * Get SEO data for tag page
 */
export function getTagSeoData(tag: string) {
  return {
    title: blogPostManager.generateTagTitle(tag),
    description: blogPostManager.generateTagDescription(tag)
  };
}

/**
 * Get SEO data for blog index
 */
export function getBlogSeoData() {
  return blogPostManager.getBlogIndexSeo();
}
