import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window.matchMedia
const matchMediaMock = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe('Theme System Integration', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window & typeof globalThis;

  beforeEach(() => {
    // Setup DOM with complete theme system
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            // Theme script simulation
            (function() {
              'use strict';
              const STORAGE_KEY = 'theme-preference';
              
              function getInitialTheme() {
                try {
                  const savedTheme = localStorage.getItem(STORAGE_KEY);
                  if (savedTheme === 'light' || savedTheme === 'dark') {
                    return savedTheme;
                  }
                } catch (e) {
                  console.warn('localStorage no disponible para tema');
                }
                
                if (typeof window !== 'undefined' && window.matchMedia) {
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    return 'dark';
                  }
                }
                
                return 'light';
              }
              
              function applyTheme(theme) {
                const html = document.documentElement;
                
                if (theme === 'dark') {
                  html.classList.add('dark');
                } else {
                  html.classList.remove('dark');
                }
                
                html.style.colorScheme = theme;
                
                try {
                  localStorage.setItem(STORAGE_KEY, theme);
                } catch (e) {
                  console.warn('No se pudo guardar tema:', e);
                }
              }
              
              // Make functions available globally for testing
              window.__getInitialTheme = getInitialTheme;
              window.__applyTheme = applyTheme;
              
              // Apply initial theme
              const initialTheme = getInitialTheme();
              applyTheme(initialTheme);
              window.__THEME_INITIAL__ = initialTheme;
            })();
          </script>
        </head>
        <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <nav class="bg-gray-50 dark:bg-gray-800">
            <button id="theme-toggle" aria-label="Toggle theme">
              <span class="theme-icon">🌙</span>
            </button>
          </nav>
          <main>
            <section class="bg-gray-100 dark:bg-gray-800">
              <h1 class="text-gray-900 dark:text-gray-100">Test Content</h1>
            </section>
          </main>
        </body>
      </html>
    `);

    document = dom.window.document;
    window = dom.window as Window & typeof globalThis;

    // Setup global mocks
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock,
      writable: true,
    });

    // Reset mocks
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    // Set globals for the test environment
    global.document = document;
    global.window = window;
    global.localStorage = localStorageMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Theme Persistence', () => {
    it('should persist theme across page reloads', () => {
      // Simulate first visit - user chooses dark theme
      localStorageMock.getItem.mockReturnValue(null);
      
      const getInitialTheme = window.__getInitialTheme;
      const applyTheme = window.__applyTheme;
      
      // Initial theme should be light
      let theme = getInitialTheme();
      expect(theme).toBe('light');
      
      // User toggles to dark
      applyTheme('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
      
      // Simulate page reload - localStorage now returns 'dark'
      localStorageMock.getItem.mockReturnValue('dark');
      
      theme = getInitialTheme();
      expect(theme).toBe('dark');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme-preference');
    });

    it('should handle multiple theme changes', () => {
      const applyTheme = window.__applyTheme;
      const html = document.documentElement;
      
      // Start with light
      applyTheme('light');
      expect(html.classList.contains('dark')).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'light');
      
      // Switch to dark
      applyTheme('dark');
      expect(html.classList.contains('dark')).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
      
      // Switch back to light
      applyTheme('light');
      expect(html.classList.contains('dark')).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'light');
      
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('System Theme Detection', () => {
    it('should respect system dark mode preference when no stored preference', () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const getInitialTheme = window.__getInitialTheme;
      const theme = getInitialTheme();
      
      expect(theme).toBe('dark');
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should prefer stored preference over system preference', () => {
      localStorageMock.getItem.mockReturnValue('light');
      matchMediaMock.mockReturnValue({
        matches: true, // System prefers dark
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const getInitialTheme = window.__getInitialTheme;
      const theme = getInitialTheme();
      
      // Should use stored preference (light) despite system preference (dark)
      expect(theme).toBe('light');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme-preference');
    });
  });

  describe('DOM Class Application', () => {
    it('should apply dark classes correctly to html element', () => {
      const applyTheme = window.__applyTheme;
      const html = document.documentElement;
      
      applyTheme('dark');
      
      expect(html.classList.contains('dark')).toBe(true);
      expect(html.style.colorScheme).toBe('dark');
    });

    it('should remove dark classes when switching to light', () => {
      const applyTheme = window.__applyTheme;
      const html = document.documentElement;
      
      // Start with dark
      applyTheme('dark');
      expect(html.classList.contains('dark')).toBe(true);
      
      // Switch to light
      applyTheme('light');
      expect(html.classList.contains('dark')).toBe(false);
      expect(html.style.colorScheme).toBe('light');
    });
  });

  describe('Theme Toggle Button Integration', () => {
    it('should update button icon when theme changes', () => {
      const button = document.getElementById('theme-toggle');
      const icon = button?.querySelector('.theme-icon');
      const applyTheme = window.__applyTheme;
      
      // Mock the toggle functionality
      const toggleTheme = () => {
        const html = document.documentElement;
        const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        applyTheme(newTheme);
        
        // Update icon
        if (icon) {
          icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        return newTheme;
      };
      
      // Start with light theme
      applyTheme('light');
      if (icon) icon.textContent = '🌙';
      
      // Toggle to dark
      const newTheme = toggleTheme();
      
      expect(newTheme).toBe('dark');
      expect(icon?.textContent).toBe('☀️');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage unavailable gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const getInitialTheme = window.__getInitialTheme;
      const theme = getInitialTheme();
      
      // Should fallback to light theme
      expect(theme).toBe('light');
      expect(consoleSpy).toHaveBeenCalledWith('localStorage no disponible para tema');
      
      consoleSpy.mockRestore();
    });

    it('should handle invalid stored theme values', () => {
      localStorageMock.getItem.mockReturnValue('invalid-theme');
      
      const getInitialTheme = window.__getInitialTheme;
      const theme = getInitialTheme();
      
      // Should fallback to light theme for invalid values
      expect(theme).toBe('light');
    });
  });

  describe('CSS Classes Validation', () => {
    it('should verify that responsive classes are present in DOM', () => {
      const body = document.body;
      const nav = document.querySelector('nav');
      const section = document.querySelector('section');
      const h1 = document.querySelector('h1');
      
      // Check that elements have the correct responsive classes
      expect(body?.className).toContain('bg-white dark:bg-gray-900');
      expect(body?.className).toContain('text-gray-900 dark:text-gray-100');
      expect(nav?.className).toContain('bg-gray-50 dark:bg-gray-800');
      expect(section?.className).toContain('bg-gray-100 dark:bg-gray-800');
      expect(h1?.className).toContain('text-gray-900 dark:text-gray-100');
    });
  });
});
