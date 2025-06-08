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
global.fetch = vi.fn();

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
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
