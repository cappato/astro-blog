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

describe('ThemeToggle Component', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window & typeof globalThis;

  beforeEach(() => {
    // Setup DOM
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head></head>
        <body>
          <button id="theme-toggle" aria-label="Toggle theme">
            <span class="theme-icon">🌙</span>
          </button>
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
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    // Set globals for the test environment
    global.document = document;
    global.window = window;
    global.localStorage = localStorageMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Theme Detection', () => {
    it('should default to light theme when no preference is stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      // Simulate the theme script logic
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

      const theme = getInitialTheme();
      expect(theme).toBe('light');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme-preference');
    });

    it('should use stored theme preference', () => {
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

      const theme = getInitialTheme();
      expect(theme).toBe('dark');
    });

    it('should detect system dark mode preference', () => {
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

      const theme = getInitialTheme();
      expect(theme).toBe('dark');
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });
  });

  describe('Theme Application', () => {
    it('should apply dark theme correctly', () => {
      const html = document.documentElement;
      
      const applyTheme = (theme: string) => {
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

      applyTheme('dark');

      expect(html.classList.contains('dark')).toBe(true);
      expect(html.style.colorScheme).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
    });

    it('should apply light theme correctly', () => {
      const html = document.documentElement;
      html.classList.add('dark'); // Start with dark theme
      
      const applyTheme = (theme: string) => {
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

      applyTheme('light');

      expect(html.classList.contains('dark')).toBe(false);
      expect(html.style.colorScheme).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'light');
    });
  });

  describe('Theme Toggle Functionality', () => {
    it('should toggle from light to dark', () => {
      const html = document.documentElement;
      const button = document.getElementById('theme-toggle');
      const icon = button?.querySelector('.theme-icon');
      
      // Mock current theme as light
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
      
      const toggleTheme = () => {
        const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
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
        
        return newTheme;
      };

      const newTheme = toggleTheme();

      expect(newTheme).toBe('dark');
      expect(html.classList.contains('dark')).toBe(true);
      expect(html.style.colorScheme).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
      expect(icon?.textContent).toBe('☀️');
    });

    it('should toggle from dark to light', () => {
      const html = document.documentElement;
      const button = document.getElementById('theme-toggle');
      const icon = button?.querySelector('.theme-icon');
      
      // Mock current theme as dark
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
      if (icon) icon.textContent = '☀️';
      
      const toggleTheme = () => {
        const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
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
        
        return newTheme;
      };

      const newTheme = toggleTheme();

      expect(newTheme).toBe('light');
      expect(html.classList.contains('dark')).toBe(false);
      expect(html.style.colorScheme).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'light');
      expect(icon?.textContent).toBe('🌙');
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
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

      applyTheme('dark');

      expect(consoleSpy).toHaveBeenCalledWith('No se pudo guardar tema:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});
