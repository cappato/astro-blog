/**
 * Theme System Feature - DOM Utilities
 * Framework-agnostic DOM manipulation utilities for theme management
 */

import type { Theme, ThemeConfig, ThemeColors, DOMOptions } from './types';
import { DEFAULT_THEME_CONFIG, DEFAULT_THEME_COLORS, isBrowser } from './types';

/**
 * DOM utilities class for theme management
 */
export class ThemeDOMUtils {
  private config: ThemeConfig;
  private colors: ThemeColors;
  private document: Document;
  private window: Window;

  constructor(
    config: Partial<ThemeConfig> = {},
    colors: Partial<ThemeColors> = {},
    options: DOMOptions = {}
  ) {
    this.config = { ...DEFAULT_THEME_CONFIG, ...config };
    this.colors = { ...DEFAULT_THEME_COLORS, ...colors };
    
    // Use provided document/window or global ones
    this.document = options.document || (isBrowser() ? document : null as any);
    this.window = options.window || (isBrowser() ? window : null as any);
  }

  /**
   * Apply theme to DOM elements
   */
  public applyTheme(theme: Theme): void {
    if (!this.document) return;

    const html = this.document.documentElement;
    if (!html) return;

    // Apply/remove dark class (primary method for Tailwind)
    html.classList.toggle(this.config.htmlClass, theme === 'dark');

    // Set data-theme attribute for additional CSS targeting
    html.setAttribute(this.config.attribute, theme);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);
  }

  /**
   * Update meta theme-color for mobile devices
   */
  public updateMetaThemeColor(theme: Theme): void {
    if (!this.document) return;

    const metaThemeColor = this.document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? this.colors.dark : this.colors.light;
      metaThemeColor.setAttribute('content', color);
    }
  }

  /**
   * Get theme from localStorage
   */
  public getStoredTheme(): Theme | null {
    if (!this.window || !this.window.localStorage) return null;

    try {
      const stored = this.window.localStorage.getItem(this.config.storageKey);
      if (stored === 'light' || stored === 'dark') {
        return stored as Theme;
      }
    } catch (error) {
      console.warn('Error accessing localStorage for theme:', error);
    }

    return null;
  }

  /**
   * Save theme to localStorage
   */
  public saveTheme(theme: Theme): void {
    if (!this.window || !this.window.localStorage) return;

    try {
      this.window.localStorage.setItem(this.config.storageKey, theme);
    } catch (error) {
      console.warn('Error saving theme to localStorage:', error);
    }
  }

  /**
   * Get system theme preference
   */
  public getSystemTheme(): Theme {
    if (!this.window || !this.window.matchMedia) {
      return this.config.defaultTheme;
    }

    try {
      const prefersDark = this.window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    } catch (error) {
      console.warn('Error detecting system theme:', error);
      return this.config.defaultTheme;
    }
  }

  /**
   * Get initial theme based on stored preference, system preference, or default
   */
  public getInitialTheme(): Theme {
    // First try stored preference
    const stored = this.getStoredTheme();
    if (stored) return stored;

    // Then try system preference
    return this.getSystemTheme();
  }

  /**
   * Add system theme change listener
   */
  public addSystemThemeListener(callback: (theme: Theme) => void): () => void {
    if (!this.window || !this.window.matchMedia) {
      return () => {}; // Return no-op function
    }

    const mediaQuery = this.window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };

    // Use addEventListener if available (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    
    // Fallback for older browsers
    if (mediaQuery.addListener) {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }

    return () => {}; // Return no-op function if no method available
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Update colors
   */
  public updateColors(newColors: Partial<ThemeColors>): void {
    this.colors = { ...this.colors, ...newColors };
  }

  /**
   * Get current configuration
   */
  public getConfig(): ThemeConfig {
    return { ...this.config };
  }

  /**
   * Get current colors
   */
  public getColors(): ThemeColors {
    return { ...this.colors };
  }

  /**
   * Check if DOM is available
   */
  public isDOMAvailable(): boolean {
    return !!this.document && !!this.window;
  }

  /**
   * Check if localStorage is available
   */
  public isStorageAvailable(): boolean {
    if (!this.window || !this.window.localStorage) return false;

    try {
      const test = '__theme_storage_test__';
      this.window.localStorage.setItem(test, test);
      this.window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Utility functions for quick DOM operations
 */

/**
 * Apply theme to document immediately (for SSR scripts)
 */
export function applyThemeImmediate(
  theme: Theme,
  config: Partial<ThemeConfig> = {}
): void {
  const utils = new ThemeDOMUtils(config);
  utils.applyTheme(theme);
}

/**
 * Get stored theme from localStorage
 */
export function getStoredTheme(storageKey?: string): Theme | null {
  const utils = new ThemeDOMUtils({ storageKey });
  return utils.getStoredTheme();
}

/**
 * Save theme to localStorage
 */
export function saveTheme(theme: Theme, storageKey?: string): void {
  const utils = new ThemeDOMUtils({ storageKey });
  utils.saveTheme(theme);
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): Theme {
  const utils = new ThemeDOMUtils();
  return utils.getSystemTheme();
}

/**
 * Get initial theme with fallback logic
 */
export function getInitialTheme(config: Partial<ThemeConfig> = {}): Theme {
  const utils = new ThemeDOMUtils(config);
  return utils.getInitialTheme();
}

/**
 * Create DOM utils instance with configuration
 */
export function createDOMUtils(
  config: Partial<ThemeConfig> = {},
  colors: Partial<ThemeColors> = {},
  options: DOMOptions = {}
): ThemeDOMUtils {
  return new ThemeDOMUtils(config, colors, options);
}
