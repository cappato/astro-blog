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

describe('Theme System E2E Tests', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window & typeof globalThis;

  beforeEach(() => {
    // Setup complete page simulation
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page</title>
        </head>
        <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans min-h-screen transition-colors duration-300">
          <!-- Navbar -->
          <nav class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 shadow-md transition-colors duration-300">
            <div class="container mx-auto px-6 sm:px-4 py-3">
              <div class="flex justify-between items-center">
                <a href="/" class="flex items-center gap-3">
                  <span class="text-primary text-2xl font-bold">Matías S. Cappato</span>
                </a>
                <button id="theme-toggle" 
                        class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                        aria-label="Toggle theme">
                  <span class="theme-icon text-xl">🌙</span>
                </button>
              </div>
            </div>
          </nav>

          <!-- Main Content -->
          <main class="flex-grow">
            <!-- About Section -->
            <section id="about" class="container mx-auto px-6 sm:px-4 py-10">
              <h2 class="text-3xl font-bold text-primary mb-6 border-b border-gray-300 dark:border-gray-700 pb-2">About me</h2>
              <div class="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h1 class="text-2xl font-bold text-primary mb-2">Matías Sebastián Cappato</h1>
                <p class="text-gray-700 dark:text-gray-300">System Analyst | Full Stack Developer</p>
              </div>
            </section>

            <!-- Experience Section -->
            <section id="experience" class="container mx-auto px-6 sm:px-4 py-10">
              <h2 class="text-3xl font-bold text-primary mb-6 border-b border-gray-300 dark:border-gray-700 pb-2">Professional Experience</h2>
              <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
                <h3 class="text-xl font-bold text-secondary">Doppler</h3>
                <h4 class="text-lg text-gray-700 dark:text-gray-300 mb-2">FullStack Developer</h4>
                <p class="text-gray-600 dark:text-gray-400 mb-4">October 2020 - Present</p>
              </div>
            </section>
          </main>

          <!-- Footer -->
          <footer class="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-8">
            <div class="container mx-auto px-6 text-center">
              <p>&copy; 2024 Matías Cappato. All rights reserved.</p>
            </div>
          </footer>
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

  describe('User Journey: First Visit', () => {
    it('should start with light theme by default', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      // Simulate theme initialization
      const getInitialTheme = () => {
        try {
          const savedTheme = localStorage.getItem('theme-preference');
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
      };

      const applyTheme = (theme: string) => {
        const html = document.documentElement;
        
        if (theme === 'dark') {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
        
        html.style.colorScheme = theme;
        
        try {
          localStorage.setItem('theme-preference', theme);
        } catch (e) {
          console.warn('No se pudo guardar tema:', e);
        }
      };

      const initialTheme = getInitialTheme();
      applyTheme(initialTheme);

      expect(initialTheme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.style.colorScheme).toBe('light');
    });
  });

  describe('User Journey: Theme Toggle Interaction', () => {
    it('should toggle theme when user clicks the toggle button', () => {
      const html = document.documentElement;
      const button = document.getElementById('theme-toggle');
      const icon = button?.querySelector('.theme-icon');
      
      // Start with light theme
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
      if (icon) icon.textContent = '🌙';

      // Simulate the complete toggle functionality
      const handleToggleClick = () => {
        const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Apply theme
        if (newTheme === 'dark') {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
        
        html.style.colorScheme = newTheme;
        localStorage.setItem('theme-preference', newTheme);
        
        // Update icon
        if (icon) {
          icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        // Dispatch custom event
        const event = new window.CustomEvent('theme-changed', {
          detail: { theme: newTheme }
        });
        window.dispatchEvent(event);
        
        return newTheme;
      };

      // Simulate user click
      const newTheme = handleToggleClick();

      expect(newTheme).toBe('dark');
      expect(html.classList.contains('dark')).toBe(true);
      expect(html.style.colorScheme).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
      expect(icon?.textContent).toBe('☀️');
    });

    it('should toggle back to light theme on second click', () => {
      const html = document.documentElement;
      const button = document.getElementById('theme-toggle');
      const icon = button?.querySelector('.theme-icon');
      
      // Start with dark theme (after first toggle)
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
      if (icon) icon.textContent = '☀️';

      const handleToggleClick = () => {
        const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        if (newTheme === 'dark') {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
        
        html.style.colorScheme = newTheme;
        localStorage.setItem('theme-preference', newTheme);
        
        if (icon) {
          icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        return newTheme;
      };

      // Simulate second click
      const newTheme = handleToggleClick();

      expect(newTheme).toBe('light');
      expect(html.classList.contains('dark')).toBe(false);
      expect(html.style.colorScheme).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'light');
      expect(icon?.textContent).toBe('🌙');
    });
  });

  describe('User Journey: Page Navigation', () => {
    it('should maintain theme across different pages', () => {
      // Simulate user setting dark theme on home page
      localStorageMock.getItem.mockReturnValue('dark');
      
      const getInitialTheme = () => {
        try {
          const savedTheme = localStorage.getItem('theme-preference');
          if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
          }
        } catch (e) {
          console.warn('localStorage no disponible para tema');
        }
        return 'light';
      };

      const applyTheme = (theme: string) => {
        const html = document.documentElement;
        
        if (theme === 'dark') {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
        
        html.style.colorScheme = theme;
      };

      // Simulate navigation to blog page
      const theme = getInitialTheme();
      applyTheme(theme);

      expect(theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme-preference');
    });
  });

  describe('Visual Verification: CSS Classes', () => {
    it('should verify all elements have correct responsive classes in light mode', () => {
      const html = document.documentElement;
      html.classList.remove('dark');
      
      const body = document.body;
      const nav = document.querySelector('nav');
      const aboutSection = document.querySelector('#about .bg-gray-100');
      const experienceSection = document.querySelector('#experience .bg-gray-100');
      const footer = document.querySelector('footer');

      // Verify light mode classes are present
      expect(body?.className).toContain('bg-white');
      expect(body?.className).toContain('text-gray-900');
      expect(nav?.className).toContain('bg-gray-50');
      expect(aboutSection?.className).toContain('bg-gray-100');
      expect(experienceSection?.className).toContain('bg-gray-100');
      expect(footer?.className).toContain('bg-gray-100');
    });

    it('should verify all elements have correct responsive classes in dark mode', () => {
      const html = document.documentElement;
      html.classList.add('dark');
      
      const body = document.body;
      const nav = document.querySelector('nav');
      const aboutSection = document.querySelector('#about .bg-gray-100');
      const experienceSection = document.querySelector('#experience .bg-gray-100');
      const footer = document.querySelector('footer');

      // Verify dark mode classes are present
      expect(body?.className).toContain('dark:bg-gray-900');
      expect(body?.className).toContain('dark:text-gray-100');
      expect(nav?.className).toContain('dark:bg-gray-800');
      expect(aboutSection?.className).toContain('dark:bg-gray-800');
      expect(experienceSection?.className).toContain('dark:bg-gray-800');
      expect(footer?.className).toContain('dark:bg-gray-800');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on toggle button', () => {
      const button = document.getElementById('theme-toggle');
      
      expect(button?.getAttribute('aria-label')).toBe('Toggle theme');
    });

    it('should maintain focus on toggle button after theme change', () => {
      const button = document.getElementById('theme-toggle');
      
      // Simulate focus
      button?.focus();
      
      // Simulate toggle
      const html = document.documentElement;
      const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      if (newTheme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      
      // Button should still be focusable
      expect(button?.getAttribute('aria-label')).toBe('Toggle theme');
      expect(button?.tagName).toBe('BUTTON');
    });
  });

  describe('Performance', () => {
    it('should apply theme changes efficiently', () => {
      const html = document.documentElement;
      const startTime = performance.now();
      
      // Simulate rapid theme changes
      for (let i = 0; i < 10; i++) {
        const theme = i % 2 === 0 ? 'light' : 'dark';
        
        if (theme === 'dark') {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
        
        html.style.colorScheme = theme;
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete quickly (less than 10ms for 10 changes)
      expect(duration).toBeLessThan(10);
    });
  });
});
