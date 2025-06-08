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
const originalConsole = { ...console };
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});
