/**
 * Mock for astro:content module
 * Provides test data for RSS and Sitemap tests
 */

export interface BlogPost {
  id: string;
  slug: string;
  body: string;
  collection: string;
  data: {
    title: string;
    description: string;
    date: Date;
    author: string;
    tags?: string[];
    draft?: boolean;
    postId?: string;
    imageAlt?: string;
    image?: {
      url: string;
      alt: string;
    };
  };
}

// Mock blog posts for testing
const mockBlogPosts: BlogPost[] = [
  {
    id: 'optimizacion-performance-astro-tecnicas-avanzadas.md',
    slug: 'optimizacion-performance-astro-tecnicas-avanzadas',
    body: 'Mock content for performance optimization post',
    collection: 'blog',
    data: {
      title: 'Optimización de Performance en Astro: Técnicas Avanzadas',
      description: 'Guía completa para optimizar el rendimiento de sitios web con Astro',
      date: new Date('2024-01-15'),
      author: 'Matías Cappato',
      tags: ['astro', 'performance', 'optimization'],
      draft: false,
      postId: 'optimizacion-performance-astro-tecnicas-avanzadas',
    },
  },
  {
    id: 'bienvenida-a-mi-blog.md',
    slug: 'bienvenida-a-mi-blog',
    body: 'Mock content for welcome post',
    collection: 'blog',
    data: {
      title: 'Bienvenida a mi Blog',
      description: 'Primer post del blog técnico de desarrollo web',
      date: new Date('2024-01-01'),
      author: 'Matías Cappato',
      tags: ['bienvenida', 'blog'],
      draft: false,
      postId: 'bienvenida-a-mi-blog',
    },
  },
  {
    id: 'arquitectura-modular-astro.md',
    slug: 'arquitectura-modular-astro',
    body: 'Mock content for modular architecture post',
    collection: 'blog',
    data: {
      title: 'Arquitectura Modular en Astro',
      description: 'Cómo estructurar proyectos Astro de forma modular y escalable',
      date: new Date('2024-01-10'),
      author: 'Matías Cappato',
      tags: ['astro', 'arquitectura', 'modular'],
      draft: false,
      postId: 'arquitectura-modular-astro',
    },
  },
];

/**
 * Mock implementation of getCollection function
 */
export async function getCollection(collection: string): Promise<BlogPost[]> {
  if (collection === 'blog') {
    // Filter out draft posts
    return mockBlogPosts.filter(post => !post.data.draft);
  }
  
  return [];
}

/**
 * Mock implementation of getEntry function
 */
export async function getEntry(collection: string, id: string): Promise<BlogPost | undefined> {
  if (collection === 'blog') {
    return mockBlogPosts.find(post => post.id === id || post.slug === id);
  }
  
  return undefined;
}

/**
 * Mock implementation of getEntries function
 */
export async function getEntries(entries: Array<{ collection: string; id: string }>): Promise<BlogPost[]> {
  const results: BlogPost[] = [];
  
  for (const entry of entries) {
    const post = await getEntry(entry.collection, entry.id);
    if (post) {
      results.push(post);
    }
  }
  
  return results;
}

// Default export for compatibility
export default {
  getCollection,
  getEntry,
  getEntries,
};
