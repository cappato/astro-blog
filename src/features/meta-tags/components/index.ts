/**
 * Meta Tags Components - Public Exports
 * Astro components for meta tags integration
 */

// Export Astro components
export { default as MetaTags } from './MetaTags.astro';

/**
 * Component metadata for documentation
 */
export const META_TAGS_COMPONENTS_INFO = {
  components: [
    {
      name: 'MetaTags',
      path: './MetaTags.astro',
      description: 'Comprehensive meta tags component with SEO optimization',
      usage: 'Must be placed in <head> section',
      props: {
        title: 'string - Page title (required)',
        description: 'string - Page description (required)',
        image: 'object - Page image with url, alt, width, height',
        type: "'website' | 'article' - Page type (default: 'website')",
        keywords: 'string[] - Page keywords',
        publishedDate: 'Date - Published date (for articles)',
        modifiedDate: 'Date - Modified date (for articles)',
        author: 'string - Author name',
        canonicalUrl: 'string - Canonical URL',
        twitterUsername: 'string - Twitter username',
        postId: 'string - Post ID for articles'
      },
      features: [
        'SEO meta tags generation',
        'Open Graph tags for social sharing',
        'Twitter Cards support',
        'Article-specific meta tags',
        'Image format handling (WebP + JPEG)',
        'URL validation and canonicalization',
        'Date validation',
        'Development warnings'
      ]
    }
  ]
} as const;
