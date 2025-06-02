/**
 * Dark Light Mode Feature Tests
 * Comprehensive test suite for dark/light mode management system
 * Migrated from src/utils/__tests__/theme.test.ts
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ThemeManager,
  useTheme,
  initTheme,
  getThemeInitScript,
  themeManager,
  DEFAULT_THEME_CONFIG,
  DEFAULT_THEME_COLORS,
  createThemeManager,
  generateThemeScript,
  ThemeDOMUtils,
  ThemeScriptGenerator
} from '../index';

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
      toggle: vi.fn(),
    },
    setAttribute: vi.fn(),
    dataset: {},
  },
  querySelector: vi.fn(),
};

// Mock window
const windowMock = {
  localStorage: localStorageMock,
  matchMedia: vi.fn(),
};

// Setup global mocks
Object.defineProperty(global, 'window', {
  value: windowMock,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: documentMock,
  writable: true,
});

describe('Dark Light Mode Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    documentMock.documentElement.dataset = {};
    documentMock.querySelector.mockReset();

    // Reset localStorage mock to return null (no stored preference)
    localStorageMock.getItem.mockReturnValue(null);

    // Reset matchMedia mock to return false (light system preference)
    windowMock.matchMedia.mockReturnValue({
      matches: false, // false = light theme preference
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });
  });

  describe('Configuration Constants', () => {
    test('should have correct default configuration', () => {
      expect(DEFAULT_THEME_CONFIG.defaultTheme).toBe('dark');
      expect(DEFAULT_THEME_CONFIG.storageKey).toBe('theme-preference');
      expect(DEFAULT_THEME_CONFIG.htmlClass).toBe('dark');
      expect(DEFAULT_THEME_CONFIG.attribute).toBe('data-theme');
    });

    test('should have correct color values for mobile meta theme-color', () => {
      expect(DEFAULT_THEME_COLORS.dark).toBe('#111827');
      expect(DEFAULT_THEME_COLORS.light).toBe('#ffffff');
    });

    test('should have valid hex color format', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(DEFAULT_THEME_COLORS.dark).toMatch(hexColorRegex);
      expect(DEFAULT_THEME_COLORS.light).toMatch(hexColorRegex);
    });
  });

  describe('ThemeManager Class', () => {
    let manager: ThemeManager;

    beforeEach(() => {
      manager = new ThemeManager();
    });

    afterEach(() => {
      manager.destroy();
    });

    test('should create manager with default configuration', () => {
      const config = manager.getConfig();
      expect(config.defaultTheme).toBe('dark');
      expect(config.storageKey).toBe('theme-preference');
    });

    test('should create manager with custom configuration', () => {
      const customManager = new ThemeManager({
        defaultTheme: 'light',
        storageKey: 'custom-theme'
      });
      
      const config = customManager.getConfig();
      expect(config.defaultTheme).toBe('light');
      expect(config.storageKey).toBe('custom-theme');
      
      customManager.destroy();
    });

    test('should get initial theme', () => {
      // With no stored preference and light system preference, should use system
      expect(manager.getTheme()).toBe('light');
    });

    test('should set theme and apply to DOM', () => {
      // Start with light, change to dark
      manager.setTheme('dark');

      expect(manager.getTheme()).toBe('dark');
      expect(documentMock.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true);
      expect(documentMock.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
    });

    test('should toggle theme', () => {
      expect(manager.getTheme()).toBe('light'); // Initial is light due to system preference

      manager.toggleTheme();
      expect(manager.getTheme()).toBe('dark');

      manager.toggleTheme();
      expect(manager.getTheme()).toBe('light');
    });

    test('should subscribe to theme changes', () => {
      const listener = vi.fn();
      const unsubscribe = manager.subscribe(listener);

      // Change from light to dark (should trigger listener)
      manager.setTheme('dark');
      expect(listener).toHaveBeenCalledWith('dark');

      unsubscribe();
      manager.setTheme('light');
      expect(listener).toHaveBeenCalledTimes(1); // Should not be called again after unsubscribe
    });

    test('should initialize theme', () => {
      manager.init();
      // Should apply the current theme (light) to DOM
      expect(documentMock.documentElement.classList.toggle).toHaveBeenCalledWith('dark', false);
      expect(documentMock.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    test('should update meta theme-color for mobile devices', () => {
      const mockMetaElement = {
        setAttribute: vi.fn()
      };
      documentMock.querySelector.mockReturnValue(mockMetaElement);

      manager.setTheme('dark');
      expect(mockMetaElement.setAttribute).toHaveBeenCalledWith('content', '#111827');

      manager.setTheme('light');
      expect(mockMetaElement.setAttribute).toHaveBeenCalledWith('content', '#ffffff');
    });

    test('should handle missing meta theme-color gracefully', () => {
      documentMock.querySelector.mockReturnValue(null);

      expect(() => {
        manager.setTheme('dark');
      }).not.toThrow();
    });

    test('should get theme statistics', () => {
      const stats = manager.getStats();

      expect(stats.currentTheme).toBe('light'); // Initial theme is light
      expect(stats.listenerCount).toBe(0);
      expect(typeof stats.isDOMAvailable).toBe('boolean');
      expect(typeof stats.isStorageAvailable).toBe('boolean');
    });

    test('should reset theme to default', () => {
      manager.setTheme('light');
      expect(manager.getTheme()).toBe('light');
      
      manager.resetTheme();
      expect(manager.getTheme()).toBe('dark');
    });

    test('should clear stored theme', () => {
      // Create a manager with DOM options that use our mocks
      const testManager = new ThemeManager({}, {}, {
        document: documentMock as any,
        window: windowMock as any
      });

      testManager.clearStoredTheme();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('theme-preference');

      testManager.destroy();
    });
  });

  describe('ThemeDOMUtils Class', () => {
    let domUtils: ThemeDOMUtils;

    beforeEach(() => {
      domUtils = new ThemeDOMUtils();
    });

    test('should apply theme to DOM', () => {
      domUtils.applyTheme('dark');
      
      expect(documentMock.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true);
      expect(documentMock.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    test('should get stored theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('light');
      
      const theme = domUtils.getStoredTheme();
      expect(theme).toBe('light');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme-preference');
    });

    test('should save theme to localStorage', () => {
      domUtils.saveTheme('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
    });

    test('should get system theme preference', () => {
      windowMock.matchMedia.mockReturnValue({ matches: true });
      
      const theme = domUtils.getSystemTheme();
      expect(theme).toBe('dark');
    });

    test('should get initial theme with fallback logic', () => {
      // Test stored preference
      localStorageMock.getItem.mockReturnValue('light');
      expect(domUtils.getInitialTheme()).toBe('light');
      
      // Test system preference fallback
      localStorageMock.getItem.mockReturnValue(null);
      windowMock.matchMedia.mockReturnValue({ matches: true });
      expect(domUtils.getInitialTheme()).toBe('dark');
    });
  });

  describe('ThemeScriptGenerator Class', () => {
    let generator: ThemeScriptGenerator;

    beforeEach(() => {
      generator = new ThemeScriptGenerator();
    });

    test('should generate valid JavaScript string', () => {
      const script = generator.generateScript();
      
      expect(typeof script).toBe('string');
      expect(script.length).toBeGreaterThan(0);
    });

    test('should include theme configuration values', () => {
      const script = generator.generateScript({ minify: false });
      
      expect(script).toContain('theme-preference');
      expect(script).toContain('dark');
      expect(script).toContain('data-theme');
    });

    test('should generate minified script', () => {
      const minified = generator.generateScript({ minify: true });
      const unminified = generator.generateScript({ minify: false });
      
      expect(minified.length).toBeLessThan(unminified.length);
    });

    test('should generate script with custom colors', () => {
      const script = generator.generateScriptWithColors('#000000', '#ffffff');
      
      expect(script).toContain('#000000');
      expect(script).toContain('#ffffff');
    });

    test('should generate system-aware script', () => {
      const script = generator.generateSystemAwareScript({ minify: false });
      
      expect(script).toContain('prefers-color-scheme');
      expect(script).toContain('matchMedia');
    });
  });

  describe('Utility Functions', () => {
    test('useTheme hook should return theme utilities', () => {
      const themeUtils = useTheme();
      
      expect(themeUtils.theme).toBe('dark');
      expect(typeof themeUtils.setTheme).toBe('function');
      expect(typeof themeUtils.toggleTheme).toBe('function');
      expect(typeof themeUtils.subscribe).toBe('function');
    });

    test('initTheme should initialize global theme manager', () => {
      const initSpy = vi.spyOn(themeManager, 'init');
      
      initTheme();
      expect(initSpy).toHaveBeenCalled();
      
      initSpy.mockRestore();
    });

    test('getThemeInitScript should return valid script', () => {
      const script = getThemeInitScript();
      
      expect(typeof script).toBe('string');
      expect(script.length).toBeGreaterThan(0);
    });

    test('generateThemeScript should work with configuration', () => {
      const script = generateThemeScript({ defaultTheme: 'light' });
      
      expect(typeof script).toBe('string');
      expect(script).toContain('light');
    });

    test('createThemeManager should create new instance', () => {
      const manager = createThemeManager({ defaultTheme: 'light' });
      
      expect(manager.getTheme()).toBe('light');
      manager.destroy();
    });
  });

  describe('Error Handling', () => {
    test('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      expect(() => {
        const manager = new ThemeManager();
        manager.setTheme('light');
      }).not.toThrow();
    });

    test('should handle DOM manipulation errors gracefully', () => {
      documentMock.documentElement.classList.toggle.mockImplementation(() => {
        throw new Error('DOM error');
      });
      
      expect(() => {
        const manager = new ThemeManager();
        manager.setTheme('light');
      }).not.toThrow();
    });

    test('should validate theme configuration', () => {
      expect(() => {
        new ThemeManager({ defaultTheme: 'invalid' as any });
      }).toThrow();
    });

    test('should validate theme colors', () => {
      expect(() => {
        new ThemeManager({}, { dark: 'invalid-color' });
      }).toThrow();
    });
  });

  describe('Backward Compatibility', () => {
    test('should maintain original API structure', () => {
      // Test that all original exports are available
      expect(typeof useTheme).toBe('function');
      expect(typeof initTheme).toBe('function');
      expect(typeof getThemeInitScript).toBe('function');
      expect(typeof themeManager).toBe('object');
      expect(typeof DEFAULT_THEME_CONFIG).toBe('object');
      expect(typeof DEFAULT_THEME_COLORS).toBe('object');
    });

    test('should work with original usage patterns', () => {
      const { theme, setTheme, toggleTheme, subscribe } = useTheme();
      
      expect(theme).toBe('dark');
      
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);
      
      setTheme('light');
      expect(listener).toHaveBeenCalledWith('light');
      
      toggleTheme();
      expect(listener).toHaveBeenCalledWith('dark');
      
      unsubscribe();
    });
  });
});
