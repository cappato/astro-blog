# Blog Post

## Purpose
Unified system for blog post rendering and management with centralized BlogPostCard component, configurable utilities, and centralized configuration. Provides consistent interface for blog index, tag pages, and post rendering.

## Architecture
Unified component with configuration-driven styling and utility manager for post filtering, URL generation, and data transformation.

## Files
- `src/components/blog/BlogPostCard.astro` - Unified blog post card component
- `src/components/blog/TagList.astro` - Tag list component for posts
- `src/utils/blogPost.ts` - BlogPostManager class and utilities
- `src/config/site.ts` - BLOG_POST_CONFIG centralized configuration
- `src/pages/blog/index.astro` - Blog index page implementation
- `src/pages/blog/tag/[tag].astro` - Tag pages implementation

## Usage

### Blog Index Page
```astro
---
import BlogPostCard from '../../components/blog/BlogPostCard.astro';
import { 
  getDisplayPosts, 
  transformPostsToCardData,
  getBlogSeoData 
} from '../../utils/blogPost.ts';

const allPosts = await getCollection('blog');
const posts = getDisplayPosts(allPosts);
const postCards = transformPostsToCardData(posts);
---
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {postCards.map((postCard, index) => (
    <BlogPostCard 
      post={postCard} 
      loading={index < 3 ? 'eager' : 'lazy'}
    />
  ))}
</div>
```

### Tag Pages
```astro
---
import BlogPostCard from '../../../components/blog/BlogPostCard.astro';
import { 
  getPostsByTag, 
  transformPostsToCardData,
  getTagSeoData 
} from '../../../utils/blogPost.ts';

const allPosts = await getCollection('blog');
const posts = getPostsByTag(allPosts, tag);
const postCards = transformPostsToCardData(posts);
---
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {postCards.map((postCard, index) => (
    <BlogPostCard 
      post={postCard} 
      loading={index < 3 ? 'eager' : 'lazy'}
    />
  ))}
</div>
```

### Direct Utility Usage
```typescript
import { blogPostManager, getPostUrl, formatDate } from '../utils/blogPost.ts';

// Filter and transform posts
const displayPosts = blogPostManager.filterPosts(allPosts);
const cardData = displayPosts.map(post => blogPostManager.transformToCardData(post));

// Generate URLs
const postUrl = getPostUrl(post);
const tagUrl = getTagUrl('javascript');

// Format dates
const formattedDate = formatDate(new Date());
```

## Configuration

### BLOG_POST_CONFIG
```typescript
export const BLOG_POST_CONFIG = {
  postsPerPage: 10,
  dateFormat: {
    locale: 'es-ES',
    options: {
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const
    }
  },
  content: {
    excerptLength: 160,
    readingSpeed: 200, // words per minute
    defaultTags: ['blog', 'desarrollo', 'web']
  },
  urls: {
    basePath: '/blog',
    tagBasePath: '/blog/tag'
  },
  images: {
    thumbnail: { width: 600, height: 315, format: 'webp' },
    fallback: { text: 'Sin imagen', bgClass: 'bg-muted dark:bg-muted-dark' }
  },
  cardStyles: {
    base: 'card-base overflow-hidden shadow-theme-lg hover:shadow-xl transition-all duration-200',
    image: 'w-full h-48 object-cover',
    content: 'p-4',
    title: 'text-xl font-bold mb-2',
    titleLink: 'text-primary hover:underline',
    date: 'text-content text-sm mb-3 opacity-75',
    description: 'text-content mb-4 line-clamp-3 opacity-90',
    readMore: 'mt-4 inline-block text-primary hover:underline text-sm font-medium'
  },
  seo: {
    blogTitle: 'Blog | Matías Cappato',
    blogDescription: 'Artículos sobre desarrollo web, programación, tecnología y más por Matías Cappato.',
    tagTitleTemplate: 'Artículos sobre {tag} | Blog | Matías Cappato',
    tagDescriptionTemplate: 'Descubre todos los artículos sobre {tag} en el blog de Matías Cappato.'
  }
} as const;
```

### BlogPostCard Interface
```typescript
interface Props {
  post: BlogPostCardData;
  loading?: 'lazy' | 'eager';
  className?: string;
}

interface BlogPostCardData {
  title: string;
  description: string;
  date: Date;
  formattedDate: string;
  url: string;
  image?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  tags: string[];
  slug: string;
}
```

## BlogPostManager Class
```typescript
export class BlogPostManager {
  private config = BLOG_POST_CONFIG;

  public filterPosts(posts: BlogPost[]): BlogPost[] {
    return posts.filter(post => {
      if (!isValidPost(post)) return false;
      return shouldIncludePost(post);
    });
  }

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

  public generateTagTitle(tag: string): string {
    return this.config.seo.tagTitleTemplate.replace('{tag}', tag);
  }

  public generateTagDescription(tag: string): string {
    return this.config.seo.tagDescriptionTemplate.replace('{tag}', tag);
  }
}
```

## Extension

### Adding New Card Styles
1. Add styles to `BLOG_POST_CONFIG.cardStyles`
2. Update BlogPostCard component to use new styles
3. Customize per-page with `className` prop

### Custom Image Handling
1. Modify `getPostImage()` method in BlogPostManager
2. Add new image formats to `images.thumbnail`
3. Update fallback configuration

### SEO Customization
1. Modify templates in `seo` configuration
2. Add new SEO utilities to BlogPostManager
3. Update page-specific SEO data generation

### Dual Image System Support
```typescript
// New postId system
if (postId) {
  return {
    url: `/images/${postId}/portada-thumb.${format}`,
    alt: imageAlt || title,
    width: thumbnail.width,
    height: thumbnail.height
  };
}

// Legacy image system
else if (image) {
  return {
    url: image.url,
    alt: image.alt || title,
    width: thumbnail.width,
    height: thumbnail.height
  };
}
```

## AI Context
```yaml
feature_type: "blog_post_system"
purpose: "blog_content_management"
input_sources: ["content_collections", "blog_config", "post_metadata"]
output_formats: ["blog_cards", "post_lists", "tag_pages"]
architecture: "unified_component_manager"
configuration_driven: "BLOG_POST_CONFIG"
image_system: "dual_postId_legacy"
performance_optimization: ["lazy_loading", "eager_above_fold"]
seo_features: ["dynamic_titles", "template_descriptions", "structured_metadata"]
backward_compatibility: "BLOG_CONFIG_legacy"
dependencies: ["content_collections", "post_filters", "tag_list"]
key_files: ["BlogPostCard.astro", "blogPost.ts", "site.ts"]
```
