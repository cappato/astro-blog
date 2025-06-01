/**
 * RSS Feed Engine - Main Generator
 * Framework-agnostic RSS 2.0 feed generation engine
 */

import type { 
  BlogPost, 
  RSSConfig, 
  RSSItem, 
  RSSFeedData, 
  RSSGenerationResult,
  RSSGenerationOptions 
} from './types.ts';
import { RSS_CONFIG, XML_CONFIG, RSS_ERRORS } from './constants.ts';
import {
  escapeXML,
  validateRSSConfig,
  validatePostData,
  validateAndFormatDate,
  generateExcerpt,
  getLastBuildDate,
  getAstroVersion,
  getValidPosts
} from './utils.ts';

/**
 * RSS Feed Generator Class
 * Main engine for generating RSS 2.0 feeds
 */
export class RSSGenerator {
  private config: RSSConfig;

  constructor(config: RSSConfig) {
    const validation = validateRSSConfig(config);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    this.config = config;
  }

  /**
   * Generates complete RSS feed XML
   * @param posts Array of blog posts
   * @param options Generation options
   * @returns RSS generation result
   */
  public generateFeed(
    posts: BlogPost[], 
    options: RSSGenerationOptions = {}
  ): RSSGenerationResult {
    try {
      // Filter and validate posts
      const validPosts = getValidPosts(posts, options.postFilter);
      
      // Limit posts if specified
      const limitedPosts = options.maxItems 
        ? validPosts.slice(0, options.maxItems)
        : validPosts.slice(0, this.config.feed.maxItems || RSS_CONFIG.MAX_ITEMS);

      // Generate RSS items
      const rssItems: RSSItem[] = [];
      let skippedCount = 0;

      for (const post of limitedPosts) {
        try {
          const item = this.generateRSSItem(post, options);
          rssItems.push(item);
        } catch (error) {
          console.warn(`Skipping invalid post ${post.slug}:`, error);
          skippedCount++;
        }
      }

      // Generate feed data
      const feedData = this.generateFeedData(rssItems);

      // Generate XML
      const xml = this.generateXML(feedData);

      return {
        success: true,
        xml,
        itemCount: rssItems.length,
        skippedCount
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : RSS_ERRORS.GENERATION_FAILED
      };
    }
  }

  /**
   * Generates RSS item from blog post
   * @param post Blog post
   * @param options Generation options
   * @returns RSS item
   */
  private generateRSSItem(post: BlogPost, options: RSSGenerationOptions = {}): RSSItem {
    // Validate post data
    const validation = validatePostData(post);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const { site } = this.config;
    const slug = post.data.slug || post.slug;
    const postUrl = `${site.url}/blog/${slug}`;
    const pubDate = validateAndFormatDate(post.data.date, post.slug);

    // Generate description
    let description = post.data.description;
    if (!description && post.body) {
      description = generateExcerpt(
        post.body,
        this.config.content.maxExcerptLength,
        this.config.content.minExcerptLength
      );
    }

    if (!description || !description.trim()) {
      throw new Error(`${RSS_ERRORS.EMPTY_DESCRIPTION}: ${post.slug}`);
    }

    return {
      title: escapeXML(post.data.title),
      description: escapeXML(description),
      link: postUrl,
      guid: postUrl,
      pubDate,
      author: escapeXML(site.author),
      category: options.category || this.config.content.defaultCategory
    };
  }

  /**
   * Generates feed metadata
   * @param items RSS items
   * @returns RSS feed data
   */
  private generateFeedData(items: RSSItem[]): RSSFeedData {
    const { site, feed } = this.config;
    const buildDate = new Date().toUTCString();
    
    // Create mock posts for getLastBuildDate (we only need the dates)
    const mockPosts = items.map(item => ({
      data: { date: new Date(item.pubDate) }
    })) as BlogPost[];

    const lastBuildDate = getLastBuildDate(mockPosts, buildDate);

    return {
      title: escapeXML(site.title),
      description: escapeXML(site.description),
      link: site.url,
      language: site.language,
      managingEditor: escapeXML(site.author),
      webMaster: escapeXML(site.author),
      lastBuildDate,
      pubDate: buildDate,
      ttl: feed.ttl,
      generator: getAstroVersion(),
      items
    };
  }

  /**
   * Generates XML from feed data
   * @param feedData RSS feed data
   * @returns XML string
   */
  private generateXML(feedData: RSSFeedData): string {
    const { site, feed } = this.config;

    const channelElements = [
      `<title>${feedData.title}</title>`,
      `<description>${feedData.description}</description>`,
      `<link>${feedData.link}</link>`,
      `<atom:link href="${site.url}${feed.path}" rel="self" type="application/rss+xml"/>`,
      `<language>${feedData.language}</language>`,
      `<managingEditor>${feedData.managingEditor}</managingEditor>`,
      `<webMaster>${feedData.webMaster}</webMaster>`,
      `<lastBuildDate>${feedData.lastBuildDate}</lastBuildDate>`,
      `<pubDate>${feedData.pubDate}</pubDate>`,
      `<ttl>${feedData.ttl}</ttl>`,
      `<generator>${feedData.generator}</generator>`,
      `<docs>${RSS_CONFIG.SPEC_URL}</docs>`
    ].join('\n    ');

    const itemsXML = feedData.items.map(item => 
      `    ${XML_CONFIG.ITEM_OPEN}
      <title>${item.title}</title>
      <description>${item.description}</description>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <author>${item.author}</author>
      <category>${escapeXML(item.category || '')}</category>
    ${XML_CONFIG.ITEM_CLOSE}`
    ).join('\n');

    return `${XML_CONFIG.DECLARATION}
${XML_CONFIG.RSS_OPEN}
  ${XML_CONFIG.CHANNEL_OPEN}
    ${channelElements}

${itemsXML}
  ${XML_CONFIG.CHANNEL_CLOSE}
${XML_CONFIG.RSS_CLOSE}`;
  }

  /**
   * Updates RSS configuration
   * @param newConfig New configuration
   */
  public updateConfig(newConfig: Partial<RSSConfig>): void {
    const mergedConfig = { ...this.config, ...newConfig };
    const validation = validateRSSConfig(mergedConfig);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    this.config = mergedConfig;
  }

  /**
   * Gets current configuration
   * @returns Current RSS configuration
   */
  public getConfig(): RSSConfig {
    return { ...this.config };
  }
}

/**
 * Convenience function for generating RSS feed
 * @param posts Array of blog posts
 * @param config RSS configuration
 * @param options Generation options
 * @returns RSS generation result
 */
export function generateRSSFeed(
  posts: BlogPost[], 
  config: RSSConfig, 
  options: RSSGenerationOptions = {}
): RSSGenerationResult {
  const generator = new RSSGenerator(config);
  return generator.generateFeed(posts, options);
}
