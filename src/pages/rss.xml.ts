import { getCollection } from 'astro:content';
import { generateRSSFeed, shouldIncludePost } from '../utils/rss.ts';

export async function GET() {
  const blogEntries = await getCollection('blog', shouldIncludePost);
  
  // Ordenar por fecha (más recientes primero)
  const sortedEntries = blogEntries.sort((a, b) => 
    new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return new Response(generateRSSFeed(sortedEntries), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
