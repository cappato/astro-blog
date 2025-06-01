/**
 * Theme Management System for Astro + Tailwind CSS
 * Handles dark/light theme switching with persistence and anti-flicker
 *
 * FEATURES:
 * - ✅ Anti-flicker: SSR script applies theme before render
 * - ✅ Persistence: Saves preference in localStorage
 * - ✅ Reactive: Listener system for theme changes
 * - ✅ Accessible: Updates meta theme-color for mobile
 * - ✅ TypeScript: Strict typing and validation
 *
 * LAYOUT USAGE:
 * ```astro
 * ---
 * import ThemeScript from '../components/layout/ThemeScript.astro';
 * ---
 * <head>
 *   <!-- IMPORTANT: Must be early in <head> to prevent flicker -->
 *   <ThemeScript />
 * </head>
 * ```
 *
 * COMPONENT USAGE:
 * ```typescript
 * import { useTheme } from '../utils/theme.ts';
 *
 * const { theme, setTheme, toggleTheme, subscribe } = useTheme();
 * ```
 *
 * @author Matías Cappato
 * @version 3.0.0 - Refactored and standardized
 */

export type Theme = 'light' | 'dark';

export const THEME_CONFIG = {
  DEFAULT_THEME: 'dark' as Theme,
  STORAGE_KEY: 'theme-preference',
  HTML_CLASS: 'dark',
  ATTRIBUTE: 'data-theme'
} as const;

/**
 * Theme colors for meta theme-color on mobile devices
 * These values should match Tailwind's theme-meta colors
 */
export const THEME_COLORS = {
  DARK: '#111827',   // matches theme-meta.dark in tailwind.config.js
  LIGHT: '#ffffff',  // matches theme-meta.light in tailwind.config.js
} as const;

/**
 * Main class for managing the theme system
 */
export class ThemeManager {
  private currentTheme: Theme;
  private listeners: Set<(theme: Theme) => void> = new Set();

  constructor() {
    this.currentTheme = this.getInitialTheme();
  }

  /**
   * Gets initial theme based on localStorage or default theme
   */
  private getInitialTheme(): Theme {
    if (typeof window === 'undefined') {
      return THEME_CONFIG.DEFAULT_THEME;
    }

    try {
      const stored = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
      if (stored && (stored === 'light' || stored === 'dark')) {
        return stored as Theme;
      }
    } catch (error) {
      console.warn('Error accessing localStorage for theme:', error);
    }

    return THEME_CONFIG.DEFAULT_THEME;
  }

  /**
   * Gets current theme
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Sets a new theme
   */
  setTheme(theme: Theme): void {
    if (this.currentTheme === theme) return;

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(theme);
    this.notifyListeners(theme);
  }

  /**
   * Toggles between light and dark theme
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Applies theme to DOM - simplified to avoid redundancy
   */
  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;

    // Apply/remove dark class (primary method for Tailwind)
    html.classList.toggle(THEME_CONFIG.HTML_CLASS, theme === 'dark');

    // Set data-theme attribute for additional CSS targeting
    html.setAttribute(THEME_CONFIG.ATTRIBUTE, theme);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);
  }

  /**
   * Updates meta theme-color for mobile devices
   */
  private updateMetaThemeColor(theme: Theme): void {
    if (typeof document === 'undefined') return;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? THEME_COLORS.DARK : THEME_COLORS.LIGHT;
      metaThemeColor.setAttribute('content', color);
    }
  }

  /**
   * Saves theme to localStorage
   */
  private saveTheme(theme: Theme): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(THEME_CONFIG.STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Error saving theme to localStorage:', error);
    }
  }

  /**
   * Initializes theme in DOM (call on page load)
   */
  init(): void {
    this.applyTheme(this.currentTheme);
  }

  /**
   * Subscribes a listener for theme changes
   */
  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifies all listeners about theme change
   */
  private notifyListeners(theme: Theme): void {
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        console.error('Error in theme listener:', error);
      }
    });
  }
}

// Singleton instance of theme manager
export const themeManager = new ThemeManager();

/**
 * Hook for components that need to react to theme changes
 */
export function useTheme() {
  return {
    theme: themeManager.getTheme(),
    setTheme: (theme: Theme) => themeManager.setTheme(theme),
    toggleTheme: () => themeManager.toggleTheme(),
    subscribe: (listener: (theme: Theme) => void) => themeManager.subscribe(listener)
  };
}

/**
 * Function to initialize theme (call in main script)
 */
export function initTheme(): void {
  themeManager.init();
}

/**
 * Anti-flicker script that must run in <head>
 * Applies theme immediately to prevent content flash
 *
 * @param minify - If true, minifies script for better performance
 */
export function getThemeInitScript(minify: boolean = true): string {
  const script = `
    (function() {
      const STORAGE_KEY = '${THEME_CONFIG.STORAGE_KEY.replace(/'/g, "\\'")}';
      const DEFAULT_THEME = '${THEME_CONFIG.DEFAULT_THEME}';
      const HTML_CLASS = '${THEME_CONFIG.HTML_CLASS}';

      if (typeof window === 'undefined' || typeof document === 'undefined') return;

      let theme = DEFAULT_THEME;

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          theme = stored;
        }
      } catch (error) {
        console.warn('Theme init: localStorage not available');
      }

      const html = document.documentElement;

      if (theme === 'dark') {
        html.classList.add(HTML_CLASS);
      } else {
        html.classList.remove(HTML_CLASS);
      }

      html.setAttribute('${THEME_CONFIG.ATTRIBUTE}', theme);
    })();
  `;

  if (minify) {
    return script
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, ';}')
      .replace(/{\s*/g, '{')
      .replace(/\s*}/g, '}')
      .trim();
  }

  return script;
}
