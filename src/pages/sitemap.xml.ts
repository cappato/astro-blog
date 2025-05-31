import { getCollection, type CollectionEntry } from 'astro:content';
import { generateSitemap, shouldIncludePost } from '../utils/sitemap.ts';

export async function GET() {
  const blogEntries = await getCollection('blog', shouldIncludePost);

  return new Response(generateSitemap(blogEntries), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}