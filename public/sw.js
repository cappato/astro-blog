/**
 * Service Worker - Strategic Caching for Performance
 * Implements intelligent caching strategies for different resource types
 */

const CACHE_NAME = 'cappato-blog-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/blog',
  '/blog/pillars',
  '/_astro/main.css', // Adjust based on actual build output
  '/images/logo/logo-modern.webp',
  '/favicon.ico'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Static assets - Cache first, network fallback
  static: [
    /\/_astro\/.+\.(js|css)$/,
    /\/images\/.+\.(webp|avif|jpg|jpeg|png|svg)$/,
    /\/fonts\/.+\.(woff2|woff|ttf)$/,
    /\/(favicon|android-chrome|apple-touch-icon)/
  ],
  
  // HTML pages - Network first, cache fallback
  pages: [
    /\/$/,
    /\/blog/,
    /\.html$/
  ],
  
  // API and feeds - Network only
  network: [
    /\/api\//,
    /\/rss\.xml$/,
    /\/sitemap\.xml$/
  ]
};

// Install event - Cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - Clean old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - Implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Determine strategy based on URL
  const strategy = getStrategy(url.pathname);
  
  switch (strategy) {
    case 'static':
      event.respondWith(cacheFirst(request));
      break;
    case 'pages':
      event.respondWith(networkFirst(request));
      break;
    case 'network':
      // Network only - no caching
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// Cache first strategy - for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(getAppropriateCache(request.url));
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy - for HTML pages
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback for HTML pages
    if (request.headers.get('accept').includes('text/html')) {
      const fallback = await caches.match('/');
      if (fallback) {
        return fallback;
      }
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Determine caching strategy for URL
function getStrategy(pathname) {
  for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
    if (patterns.some(pattern => pattern.test(pathname))) {
      return strategy;
    }
  }
  return 'pages'; // Default strategy
}

// Get appropriate cache for resource type
function getAppropriateCache(url) {
  if (url.includes('/images/')) {
    return IMAGE_CACHE;
  }
  if (url.includes('/_astro/') || url.includes('/fonts/')) {
    return STATIC_CACHE;
  }
  return DYNAMIC_CACHE;
}

// Background sync for failed requests (if supported)
if ('sync' in self.registration) {
  self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
      console.log('[SW] Background sync triggered');
      // Implement background sync logic if needed
    }
  });
}

console.log('[SW] Service worker script loaded');
