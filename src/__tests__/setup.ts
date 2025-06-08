/**
 * Vitest setup file for Astro project
 * Configures global mocks and test environment
 */

import { vi } from 'vitest';

// Mock astro:content module globally
vi.mock('astro:content', async () => {
  const mockModule = await import('./mocks/astro-content.ts');
  return mockModule;
});

// Mock global objects that might be used in tests
global.console = {
  ...console,
  // Keep console.log for debugging but suppress in tests if needed
  log: vi.fn(console.log),
  error: vi.fn(console.error),
  warn: vi.fn(console.warn),
  info: vi.fn(console.info),
};

// Mock fetch for tests that might need it
global.fetch = vi.fn().mockImplementation(async (url: string) => {
  // Mock successful response for production URLs
  if (typeof url === 'string' && url.includes('cappato.dev')) {
    return {
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => {
          if (name === 'content-type') return 'text/html; charset=utf-8';
          if (name === 'content-encoding') return 'gzip';
          if (name === 'cache-control') return 'public, max-age=3600';
          return null;
        }
      },
      text: async () => `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Matías Cappato - Desarrollador Full Stack</title>
          <meta name="description" content="Desarrollador Full Stack especializado en tecnologías web modernas">
          <meta property="og:title" content="Matías Cappato - Desarrollador Full Stack">
          <meta property="og:description" content="Desarrollador Full Stack especializado en tecnologías web modernas">
          <meta name="twitter:card" content="summary_large_image">
          <meta name="robots" content="index, follow">
          <meta name="theme-color" content="#1a1a1a">
          <link rel="canonical" href="https://cappato.dev">
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
          <p>Desarrollador Full Stack</p>
        </body>
        </html>
      `
    };
  }

  // Default mock response for other URLs
  return {
    ok: false,
    status: 404,
    headers: {
      get: () => null
    },
    text: async () => 'Not Found'
  };
});

// Mock window object for browser-specific code
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://cappato.dev',
    origin: 'https://cappato.dev',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock localStorage for theme tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
  writable: true,
});

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
