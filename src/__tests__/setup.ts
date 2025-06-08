/**
 * Test Setup File
 * Global configuration for Vitest tests
 */

import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch for tests that might need it
const mockFetch = vi.fn().mockImplementation(async (url: string) => {
  console.log('Mock fetch called with:', url);

  // Mock successful response for production URLs
  if (typeof url === 'string' && url.includes('cappato.dev')) {

    // Handle RSS feed
    if (url.includes('/rss.xml')) {
      return {
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => {
            if (name === 'content-type') return 'application/rss+xml; charset=utf-8';
            if (name === 'content-encoding') return 'gzip';
            if (name === 'cache-control') return 'public, max-age=3600';
            return null;
          },
          has: (name: string) => {
            return ['content-type', 'content-encoding', 'cache-control'].includes(name.toLowerCase());
          }
        },
        text: async () => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Matías Cappato Blog</title>
    <description>Blog de desarrollo web y tecnología</description>
    <link>https://cappato.dev</link>
    <item>
      <title>Post de ejemplo</title>
      <description>Descripción del post</description>
      <link>https://cappato.dev/blog/ejemplo</link>
    </item>
  </channel>
</rss>`,
        json: async () => ({}),
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(0)
      };
    }

    // Handle Sitemap
    if (url.includes('/sitemap.xml')) {
      return {
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => {
            if (name === 'content-type') return 'application/xml; charset=utf-8';
            if (name === 'content-encoding') return 'gzip';
            if (name === 'cache-control') return 'public, max-age=3600';
            return null;
          },
          has: (name: string) => {
            return ['content-type', 'content-encoding', 'cache-control'].includes(name.toLowerCase());
          }
        },
        text: async () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cappato.dev</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://cappato.dev/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`,
        json: async () => ({}),
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(0)
      };
    }

    // Handle AI Metadata
    if (url.includes('/ai-metadata.json')) {
      return {
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => {
            if (name === 'content-type') return 'application/json; charset=utf-8';
            if (name === 'content-encoding') return 'gzip';
            if (name === 'cache-control') return 'public, max-age=3600';
            return null;
          },
          has: (name: string) => {
            return ['content-type', 'content-encoding', 'cache-control'].includes(name.toLowerCase());
          }
        },
        text: async () => JSON.stringify({
          name: "Matías Cappato",
          description: "Desarrollador Full Stack especializado en tecnologías web modernas",
          url: "https://cappato.dev",
          type: "website"
        }),
        json: async () => ({
          name: "Matías Cappato",
          description: "Desarrollador Full Stack especializado en tecnologías web modernas",
          url: "https://cappato.dev",
          type: "website"
        }),
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(0)
      };
    }

    // Handle Blog page
    if (url.includes('/blog')) {
      return {
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => {
            if (name === 'content-type') return 'text/html; charset=utf-8';
            if (name === 'content-encoding') return 'gzip';
            if (name === 'cache-control') return 'public, max-age=3600';
            if (name === 'x-frame-options') return 'DENY';
            if (name === 'x-content-type-options') return 'nosniff';
            return null;
          },
          has: (name: string) => {
            return ['content-type', 'content-encoding', 'cache-control', 'x-frame-options', 'x-content-type-options'].includes(name.toLowerCase());
          }
        },
        text: async () => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog - Matías Cappato</title>
  <meta name="description" content="Blog de desarrollo web, tecnología y programación. Artículos técnicos, tutoriales y experiencias en el mundo del desarrollo.">
  <meta property="og:title" content="Blog - Matías Cappato">
  <meta property="og:description" content="Blog de desarrollo web, tecnología y programación. Artículos técnicos, tutoriales y experiencias en el mundo del desarrollo.">
  <meta property="og:url" content="https://cappato.dev/blog">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Blog - Matías Cappato">
  <meta name="twitter:description" content="Blog de desarrollo web, tecnología y programación. Artículos técnicos, tutoriales y experiencias en el mundo del desarrollo.">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#1a1a1a">
  <link rel="canonical" href="https://cappato.dev/blog">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Blog de Matías Cappato",
    "url": "https://cappato.dev/blog",
    "description": "Blog de desarrollo web, tecnología y programación"
  }
  </script>
</head>
<body>
  <h1>Blog de Desarrollo Web</h1>
  <p>Artículos sobre desarrollo web, tecnología y programación</p>
  <article>
    <h2><a href="/blog/ejemplo-post">Ejemplo de Post</a></h2>
    <p>Descripción del post de ejemplo</p>
  </article>
  <article>
    <h2><a href="/blog/otro-post">Otro Post</a></h2>
    <p>Descripción de otro post</p>
  </article>
</body>
</html>`,
        json: async () => ({}),
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(0)
      };
    }

    // Handle Homepage (default cappato.dev URLs)
    return {
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => {
          if (name === 'content-type') return 'text/html; charset=utf-8';
          if (name === 'content-encoding') return 'gzip';
          if (name === 'cache-control') return 'public, max-age=3600';
          if (name === 'x-frame-options') return 'DENY';
          if (name === 'x-content-type-options') return 'nosniff';
          return null;
        },
        has: (name: string) => {
          return ['content-type', 'content-encoding', 'cache-control', 'x-frame-options', 'x-content-type-options'].includes(name.toLowerCase());
        }
      },
      text: async () => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Matías Cappato - Desarrollador Full Stack</title>
  <meta name="description" content="Desarrollador Full Stack especializado en tecnologías web modernas">
  <meta property="og:title" content="Matías Cappato - Desarrollador Full Stack">
  <meta property="og:description" content="Desarrollador Full Stack especializado en tecnologías web modernas">
  <meta property="og:url" content="https://cappato.dev">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Matías Cappato - Desarrollador Full Stack">
  <meta name="twitter:description" content="Desarrollador Full Stack especializado en tecnologías web modernas">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#1a1a1a">
  <link rel="canonical" href="https://cappato.dev">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Matías Cappato",
    "url": "https://cappato.dev"
  }
  </script>
</head>
<body>
  <h1>Matías Cappato</h1>
  <p>Desarrollador Full Stack especializado en tecnologías web modernas</p>
</body>
</html>`,
      json: async () => ({}),
      blob: async () => new Blob(),
      arrayBuffer: async () => new ArrayBuffer(0)
    };
  }

  // Default mock response for other URLs
  return {
    ok: false,
    status: 404,
    headers: {
      get: () => null,
      has: () => false
    },
    text: async () => 'Not Found',
    json: async () => ({}),
    blob: async () => new Blob(),
    arrayBuffer: async () => new ArrayBuffer(0)
  };
});

// Use vi.stubGlobal for better Vitest integration
vi.stubGlobal('fetch', mockFetch);

// Debug: Verify fetch is mocked
console.log('Setup: fetch mock applied', typeof global.fetch);

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)', // Return true for dark theme preference
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// Mock console methods to reduce noise in tests
beforeEach(() => {
  // Mock console methods
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});

  // Ensure fetch mock is always available
  if (!global.fetch || typeof global.fetch !== 'function') {
    vi.stubGlobal('fetch', mockFetch);
  }
});

afterEach(() => {
  // Only restore console mocks, not fetch
  console.warn.mockRestore?.();
  console.error.mockRestore?.();
});
