import { getCollection, type CollectionEntry } from 'astro:content';
import { generateSitemap } from '../utils/sitemap.ts';
import { shouldIncludePost } from '../utils/shared/post-filters.ts';

export async function GET() {
  const blogEntries = await getCollection('blog', shouldIncludePost);

  return new Response(generateSitemap(blogEntries), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}