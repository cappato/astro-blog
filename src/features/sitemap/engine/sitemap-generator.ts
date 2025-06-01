/**
 * Sitemap Feature - Main Generator
 * Framework-agnostic XML sitemap generation engine
 */

import type { 
  BlogPost, 
  SitemapConfig, 
  SitemapUrl,
  SitemapGenerationResult,
  SitemapGenerationOptions,
  SitemapStats
} from './types.ts';
import { SITEMAP_CONFIG, XML_CONFIG, SITEMAP_ERRORS } from './constants.ts';
import {
  escapeXML,
  validateSitemapConfig,
  validatePostData,
  validateAndFormatDate,
  getCurrentDate,
  getValidPosts,
  generateBlogPostUrl,
  generateStaticPageUrl,
  createSitemapUrl,
  isValidSitemapUrl,
  wouldExceedLimits
} from './utils.ts';

/**
 * Sitemap Generator Class
 * Main engine for generating XML sitemaps
 */
export class SitemapGenerator {
  private config: SitemapConfig;

  constructor(config: SitemapConfig) {
    const validation = validateSitemapConfig(config);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    this.config = config;
  }

  /**
   * Generates complete XML sitemap
   * @param posts Array of blog posts
   * @param options Generation options
   * @returns Sitemap generation result
   */
  public generateSitemap(
    posts: BlogPost[], 
    options: SitemapGenerationOptions = {}
  ): SitemapGenerationResult {
    try {
      // Filter and validate posts
      const validPosts = getValidPosts(posts, options.postFilter);
      
      // Limit posts if specified
      const limitedPosts = options.maxUrls 
        ? validPosts.slice(0, options.maxUrls)
        : validPosts.slice(0, this.config.sitemap.maxUrls || SITEMAP_CONFIG.MAX_URLS);

      // Generate sitemap URLs
      const sitemapUrls: SitemapUrl[] = [];
      let skippedCount = 0;

      // Add static pages
      const staticUrls = this.generateStaticUrls(options);
      sitemapUrls.push(...staticUrls);

      // Add blog post URLs
      for (const post of limitedPosts) {
        try {
          const url = this.generateBlogUrl(post, options);
          if (isValidSitemapUrl(url)) {
            sitemapUrls.push(url);
          } else {
            console.warn(`Invalid sitemap URL generated for post ${post.slug}`);
            skippedCount++;
          }
        } catch (error) {
          console.warn(`Skipping invalid post ${post.slug}:`, error);
          skippedCount++;
        }
      }

      // Check size limits
      if (wouldExceedLimits(sitemapUrls.length)) {
        console.warn(`Sitemap may exceed recommended limits: ${sitemapUrls.length} URLs`);
      }

      // Generate XML
      const xml = this.generateXML(sitemapUrls);

      return {
        success: true,
        xml,
        urlCount: sitemapUrls.length,
        skippedCount
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : SITEMAP_ERRORS.GENERATION_FAILED
      };
    }
  }

  /**
   * Generates static page URLs for sitemap
   * @param options Generation options
   * @returns Array of static page URLs
   */
  private generateStaticUrls(options: SitemapGenerationOptions): SitemapUrl[] {
    const currentDate = options.lastModOverride || getCurrentDate();
    const staticPages = [...this.config.staticPages];
    
    // Add additional pages if specified
    if (options.additionalPages) {
      staticPages.push(...options.additionalPages);
    }

    return staticPages.map(page => {
      const url = generateStaticPageUrl(page, this.config.site.url);
      return createSitemapUrl(
        url,
        page.lastmod || currentDate,
        page.changefreq,
        page.priority
      );
    });
  }

  /**
   * Generates blog post URL for sitemap
   * @param post Blog post
   * @param options Generation options
   * @returns Sitemap URL entry
   */
  private generateBlogUrl(post: BlogPost, options: SitemapGenerationOptions): SitemapUrl {
    // Validate post data
    const validation = validatePostData(post);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const { site, sitemap, urls } = this.config;
    const blogPath = sitemap.blogPath || SITEMAP_CONFIG.DEFAULT_BLOG_PATH;
    const url = generateBlogPostUrl(post, site.url, blogPath);
    const lastmod = validateAndFormatDate(post.data.date, post.slug);

    return createSitemapUrl(
      url,
      lastmod,
      urls.changefreq.blogPost,
      urls.priority.blogPost
    );
  }

  /**
   * Generates XML from sitemap URLs
   * @param urls Array of sitemap URLs
   * @returns XML string
   */
  private generateXML(urls: SitemapUrl[]): string {
    const { namespace } = this.config.sitemap;
    const xmlNamespace = namespace || SITEMAP_CONFIG.NAMESPACE;

    const urlsXML = urls.map(url => 
      `${XML_CONFIG.INDENT.URL}${XML_CONFIG.URL_OPEN}
${XML_CONFIG.INDENT.FIELD}<loc>${url.loc}</loc>
${XML_CONFIG.INDENT.FIELD}<lastmod>${url.lastmod}</lastmod>
${XML_CONFIG.INDENT.FIELD}<changefreq>${url.changefreq}</changefreq>
${XML_CONFIG.INDENT.FIELD}<priority>${url.priority}</priority>
${XML_CONFIG.INDENT.URL}${XML_CONFIG.URL_CLOSE}`
    ).join('\n');

    return `${XML_CONFIG.DECLARATION}
<urlset xmlns="${xmlNamespace}">
${urlsXML}
</urlset>`;
  }

  /**
   * Gets sitemap statistics
   * @param posts Array of blog posts
   * @param options Generation options
   * @returns Sitemap statistics
   */
  public getStats(posts: BlogPost[], options: SitemapGenerationOptions = {}): SitemapStats {
    const validPosts = getValidPosts(posts, options.postFilter);
    const staticUrls = this.config.staticPages.length + (options.additionalPages?.length || 0);
    const blogUrls = validPosts.length;
    const totalUrls = staticUrls + blogUrls;

    return {
      totalUrls,
      staticUrls,
      blogUrls,
      skippedUrls: posts.length - validPosts.length,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Updates sitemap configuration
   * @param newConfig New configuration
   */
  public updateConfig(newConfig: Partial<SitemapConfig>): void {
    const mergedConfig = { ...this.config, ...newConfig };
    const validation = validateSitemapConfig(mergedConfig);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    this.config = mergedConfig;
  }

  /**
   * Gets current configuration
   * @returns Current sitemap configuration
   */
  public getConfig(): SitemapConfig {
    return { ...this.config };
  }

  /**
   * Validates configuration without throwing
   * @returns Validation result
   */
  public validateConfig(): { valid: boolean; error?: string } {
    return validateSitemapConfig(this.config);
  }

  /**
   * Estimates sitemap size
   * @param posts Array of blog posts
   * @param options Generation options
   * @returns Estimated size in bytes
   */
  public estimateSize(posts: BlogPost[], options: SitemapGenerationOptions = {}): number {
    const stats = this.getStats(posts, options);
    return 200 + (stats.totalUrls * 200); // Rough estimate
  }

  /**
   * Checks if sitemap would exceed limits
   * @param posts Array of blog posts
   * @param options Generation options
   * @returns true if would exceed limits
   */
  public wouldExceedLimits(posts: BlogPost[], options: SitemapGenerationOptions = {}): boolean {
    const stats = this.getStats(posts, options);
    return wouldExceedLimits(stats.totalUrls);
  }
}

/**
 * Convenience function for generating sitemap
 * @param posts Array of blog posts
 * @param config Sitemap configuration
 * @param options Generation options
 * @returns Sitemap generation result
 */
export function generateSitemap(
  posts: BlogPost[], 
  config: SitemapConfig, 
  options: SitemapGenerationOptions = {}
): SitemapGenerationResult {
  const generator = new SitemapGenerator(config);
  return generator.generateSitemap(posts, options);
}
