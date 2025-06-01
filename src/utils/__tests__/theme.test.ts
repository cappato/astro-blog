/**
 * Tests para el sistema de gestión de temas
 * Valida la funcionalidad de cambio de tema, persistencia y DOM manipulation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeManager, THEME_CONFIG, THEME_COLORS, themeManager, useTheme, initTheme, getThemeInitScript } from '../theme';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock DOM
const documentMock = {
  documentElement: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(), // Add toggle method for new implementation
    },
    setAttribute: vi.fn(),
    dataset: {},
  },
  querySelector: vi.fn(),
};

// Setup global mocks
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(global, 'document', {
  value: documentMock,
  writable: true,
});

// Mock global document.querySelector specifically
global.document.querySelector = documentMock.querySelector;

describe('THEME_CONFIG', () => {
  it('should have correct default configuration', () => {
    expect(THEME_CONFIG.DEFAULT_THEME).toBe('dark');
    expect(THEME_CONFIG.STORAGE_KEY).toBe('theme-preference');
    expect(THEME_CONFIG.HTML_CLASS).toBe('dark');
    expect(THEME_CONFIG.ATTRIBUTE).toBe('data-theme');
  });
});

describe('THEME_COLORS', () => {
  it('should have correct color values for mobile meta theme-color', () => {
    expect(THEME_COLORS.DARK).toBe('#111827');
    expect(THEME_COLORS.LIGHT).toBe('#ffffff');
  });

  it('should be valid hex color format', () => {
    // Test hex color format (# followed by 6 hex digits)
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

    expect(THEME_COLORS.DARK).toMatch(hexColorRegex);
    expect(THEME_COLORS.LIGHT).toMatch(hexColorRegex);
  });
});

describe('ThemeManager', () => {
  let manager: ThemeManager;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset dataset
    documentMock.documentElement.dataset = {};
    // Reset querySelector mock
    documentMock.querySelector.mockReset();
    manager = new ThemeManager();
  });

  describe('constructor', () => {
    it('should initialize with default theme when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const newManager = new ThemeManager();
      expect(newManager.getTheme()).toBe('dark');
    });

    it('should initialize with stored theme when available', () => {
      localStorageMock.getItem.mockReturnValue('light');

      const newManager = new ThemeManager();
      expect(newManager.getTheme()).toBe('light');
    });

    it('should fallback to default theme when localStorage throws error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const newManager = new ThemeManager();

      expect(newManager.getTheme()).toBe('dark');
      expect(consoleSpy).toHaveBeenCalledWith('Error accessing localStorage for theme:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('getTheme', () => {
    it('should return current theme', () => {
      expect(manager.getTheme()).toBe('dark');
    });
  });

  describe('setTheme', () => {
    it('should change theme and apply to DOM', () => {
      manager.setTheme('light');

      expect(manager.getTheme()).toBe('light');
      expect(documentMock.documentElement.classList.toggle).toHaveBeenCalledWith('dark', false);
      expect(documentMock.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'light');
    });

    it('should add dark class for dark theme', () => {
      manager.setTheme('light'); // First change to light
      vi.clearAllMocks();

      manager.setTheme('dark');

      expect(documentMock.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true);
      expect(documentMock.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should not change if theme is the same', () => {
      manager.setTheme('dark'); // Same as current

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(documentMock.documentElement.classList.add).not.toHaveBeenCalled();
    });

    it('should notify listeners when theme changes', () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      manager.setTheme('light');

      expect(listener).toHaveBeenCalledWith('light');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from dark to light', () => {
      expect(manager.getTheme()).toBe('dark');

      manager.toggleTheme();

      expect(manager.getTheme()).toBe('light');
    });

    it('should toggle from light to dark', () => {
      manager.setTheme('light');

      manager.toggleTheme();

      expect(manager.getTheme()).toBe('dark');
    });
  });

  describe('subscribe/unsubscribe', () => {
    it('should add and remove listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = manager.subscribe(listener1);
      const unsubscribe2 = manager.subscribe(listener2);

      manager.setTheme('light');

      expect(listener1).toHaveBeenCalledWith('light');
      expect(listener2).toHaveBeenCalledWith('light');

      // Unsubscribe first listener
      unsubscribe1();
      vi.clearAllMocks();

      manager.setTheme('dark');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith('dark');

      // Unsubscribe second listener
      unsubscribe2();
    });
  });

  describe('init', () => {
    it('should apply initial theme to DOM', () => {
      manager.init();

      expect(documentMock.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true);
      expect(documentMock.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });

  describe('enhanced DOM manipulation', () => {

    it('should update meta theme-color for mobile devices', () => {
      const mockMetaElement = {
        setAttribute: vi.fn()
      };

      // Spy on document.querySelector directly BEFORE creating manager
      const querySelectorSpy = vi.spyOn(document, 'querySelector').mockReturnValue(mockMetaElement as any);

      // Clear any previous calls from constructor
      querySelectorSpy.mockClear();
      mockMetaElement.setAttribute.mockClear();

      // Now test the actual functionality - change to light first (different from default)
      manager.setTheme('light');

      expect(querySelectorSpy).toHaveBeenCalledWith('meta[name="theme-color"]');
      expect(mockMetaElement.setAttribute).toHaveBeenCalledWith('content', THEME_COLORS.LIGHT);

      // Then change to dark
      manager.setTheme('dark');
      expect(mockMetaElement.setAttribute).toHaveBeenCalledWith('content', THEME_COLORS.DARK);

      // Restore the spy
      querySelectorSpy.mockRestore();
    });

    it('should handle missing meta theme-color gracefully', () => {
      const querySelectorSpy = vi.spyOn(document, 'querySelector').mockReturnValue(null);

      expect(() => {
        manager.setTheme('dark');
      }).not.toThrow();

      querySelectorSpy.mockRestore();
    });
  });
});

describe('useTheme hook', () => {
  it('should return theme utilities', () => {
    const themeUtils = useTheme();

    expect(themeUtils.theme).toBe('dark');
    expect(typeof themeUtils.setTheme).toBe('function');
    expect(typeof themeUtils.toggleTheme).toBe('function');
    expect(typeof themeUtils.subscribe).toBe('function');
  });
});

describe('initTheme function', () => {
  it('should initialize the global theme manager', () => {
    const initSpy = vi.spyOn(themeManager, 'init');

    initTheme();

    expect(initSpy).toHaveBeenCalled();

    initSpy.mockRestore();
  });
});

describe('getThemeInitScript function', () => {
  it('should return a valid JavaScript string', () => {
    const script = getThemeInitScript();

    expect(typeof script).toBe('string');
    expect(script.length).toBeGreaterThan(0);
  });

  it('should include theme configuration values', () => {
    const script = getThemeInitScript();

    expect(script).toContain(THEME_CONFIG.STORAGE_KEY);
    expect(script).toContain(THEME_CONFIG.DEFAULT_THEME);
    expect(script).toContain(THEME_CONFIG.HTML_CLASS);
    expect(script).toContain(THEME_CONFIG.ATTRIBUTE);
  });

  it('should include localStorage access logic', () => {
    const script = getThemeInitScript();

    expect(script).toContain('localStorage.getItem');
    expect(script).toContain('document.documentElement');
    expect(script).toContain('classList.add');
    expect(script).toContain('setAttribute');
  });

  it('should be wrapped in an IIFE', () => {
    const script = getThemeInitScript();

    expect(script).toContain('(function()');
    expect(script).toContain('})();');
  });

  it('should handle browser environment checks', () => {
    const script = getThemeInitScript();

    expect(script).toContain('typeof window');
    expect(script).toContain('typeof document');
  });

  it('should work in SSR environment without localStorage', () => {
    const script = getThemeInitScript();

    // Simulate SSR environment (no window/document/localStorage)
    const ssrEnvironment = `
      const window = undefined;
      const document = undefined;
      const localStorage = undefined;
      ${script}
    `;

    // Should not throw in SSR environment
    expect(() => {
      new Function(ssrEnvironment)();
    }).not.toThrow();
  });

  it('should validate script syntax at build time', () => {
    const script = getThemeInitScript();

    // Validate that generated script has valid JavaScript syntax
    expect(() => {
      new Function(script);
    }).not.toThrow();
  });

  it('should support minification option', () => {
    const minified = getThemeInitScript(true);
    const unminified = getThemeInitScript(false);

    // Minified should be shorter
    expect(minified.length).toBeLessThan(unminified.length);

    // Both should be valid JavaScript
    expect(() => new Function(minified)).not.toThrow();
    expect(() => new Function(unminified)).not.toThrow();
  });

  it('should escape quotes in configuration values', () => {
    const script = getThemeInitScript();

    // Should contain the storage key value but properly escaped
    expect(script).toContain('theme-preference');
    // Should be valid JavaScript (no syntax errors from unescaped quotes)
    expect(() => new Function(script)).not.toThrow();
  });
});

describe('Error handling', () => {
  let errorManager: ThemeManager;

  beforeEach(() => {
    errorManager = new ThemeManager();
  });

  it('should handle localStorage errors gracefully when saving', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    errorManager.setTheme('light');

    expect(consoleSpy).toHaveBeenCalledWith('Error saving theme to localStorage:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle missing document gracefully', () => {
    // Temporarily remove document
    const originalDocument = global.document;
    // @ts-ignore
    delete global.document;

    expect(() => {
      errorManager.setTheme('light');
    }).not.toThrow();

    // Restore document
    global.document = originalDocument;
  });
});
