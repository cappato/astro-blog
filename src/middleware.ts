/**
 * Astro Middleware for Smart 404 Handling
 * Redirects blog 404s to /blog and others to custom 404 page
 */

import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, redirect } = context;
  const pathname = url.pathname;

  // Let existing pages pass through
  const response = await next();
  
  // Only handle 404 responses
  if (response.status !== 404) {
    return response;
  }

  // Smart redirect logic for 404s
  if (pathname.startsWith('/blog/')) {
    // Blog-related 404s redirect to blog index
    console.log(`[404] Blog path not found: ${pathname} → redirecting to /blog`);
    return redirect('/blog', 301);
  } else if (pathname !== '/404' && pathname !== '/') {
    // Non-blog 404s go to custom 404 page
    console.log(`[404] General path not found: ${pathname} → showing 404 page`);
    return redirect('/404', 302);
  }

  // Let the default 404 handling work for root paths
  return response;
});

// Export for Astro
export default onRequest;
