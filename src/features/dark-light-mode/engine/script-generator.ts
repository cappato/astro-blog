/**
 * Theme System Feature - Script Generator
 * Anti-flicker script generation for SSR/SSG environments
 */

import type { ThemeConfig, ScriptOptions } from './types';
import { DEFAULT_THEME_CONFIG, validateThemeConfig } from './types';

/**
 * Script generator class for anti-flicker theme initialization
 */
export class ThemeScriptGenerator {
  private config: ThemeConfig;

  constructor(config: Partial<ThemeConfig> = {}) {
    validateThemeConfig(config);
    this.config = { ...DEFAULT_THEME_CONFIG, ...config };
  }

  /**
   * Generate the anti-flicker script
   */
  public generateScript(options: ScriptOptions = {}): string {
    const { minify = true } = options;
    const config = { ...this.config, ...options.config };

    const script = this.createScriptContent(config);
    
    return minify ? this.minifyScript(script) : script;
  }

  /**
   * Create the main script content
   */
  private createScriptContent(config: ThemeConfig): string {
    return `
(function() {
  // Theme configuration
  const STORAGE_KEY = '${this.escapeString(config.storageKey)}';
  const DEFAULT_THEME = '${config.defaultTheme}';
  const HTML_CLASS = '${this.escapeString(config.htmlClass)}';
  const ATTRIBUTE = '${this.escapeString(config.attribute)}';

  // Early exit for non-browser environments
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  let theme = DEFAULT_THEME;

  // Try to get stored theme preference
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    }
  } catch (error) {
    console.warn('Theme init: localStorage not available');
  }

  // Apply theme immediately to prevent flicker
  const html = document.documentElement;
  if (html) {
    // Apply/remove dark class
    if (theme === 'dark') {
      html.classList.add(HTML_CLASS);
    } else {
      html.classList.remove(HTML_CLASS);
    }
    
    // Set data attribute
    html.setAttribute(ATTRIBUTE, theme);
  }

  // Update meta theme-color if present
  try {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? '#111827' : '#ffffff';
      metaThemeColor.setAttribute('content', color);
    }
  } catch (error) {
    // Silently fail if meta element manipulation fails
  }
})();`;
  }

  /**
   * Minify script by removing unnecessary whitespace and comments
   */
  private minifyScript(script: string): string {
    return script
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace around operators and punctuation
      .replace(/\s*([{}();,=])\s*/g, '$1')
      // Remove leading/trailing whitespace
      .trim();
  }

  /**
   * Escape string for safe inclusion in JavaScript
   */
  private escapeString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Generate script with custom theme colors
   */
  public generateScriptWithColors(
    darkColor: string = '#111827',
    lightColor: string = '#ffffff',
    options: ScriptOptions = {}
  ): string {
    const { minify = true } = options;
    const config = { ...this.config, ...options.config };

    const script = `
(function() {
  const STORAGE_KEY = '${this.escapeString(config.storageKey)}';
  const DEFAULT_THEME = '${config.defaultTheme}';
  const HTML_CLASS = '${this.escapeString(config.htmlClass)}';
  const ATTRIBUTE = '${this.escapeString(config.attribute)}';
  const DARK_COLOR = '${this.escapeString(darkColor)}';
  const LIGHT_COLOR = '${this.escapeString(lightColor)}';

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

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
  if (html) {
    if (theme === 'dark') {
      html.classList.add(HTML_CLASS);
    } else {
      html.classList.remove(HTML_CLASS);
    }
    html.setAttribute(ATTRIBUTE, theme);
  }

  try {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? DARK_COLOR : LIGHT_COLOR;
      metaThemeColor.setAttribute('content', color);
    }
  } catch (error) {
    // Silently fail
  }
})();`;

    return minify ? this.minifyScript(script) : script;
  }

  /**
   * Generate script for system theme detection
   */
  public generateSystemAwareScript(options: ScriptOptions = {}): string {
    const { minify = true } = options;
    const config = { ...this.config, ...options.config };

    const script = `
(function() {
  const STORAGE_KEY = '${this.escapeString(config.storageKey)}';
  const DEFAULT_THEME = '${config.defaultTheme}';
  const HTML_CLASS = '${this.escapeString(config.htmlClass)}';
  const ATTRIBUTE = '${this.escapeString(config.attribute)}';

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  let theme = DEFAULT_THEME;

  // Try stored preference first
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    } else {
      // Fall back to system preference
      try {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
      } catch (error) {
        theme = DEFAULT_THEME;
      }
    }
  } catch (error) {
    console.warn('Theme init: localStorage not available');
  }

  const html = document.documentElement;
  if (html) {
    if (theme === 'dark') {
      html.classList.add(HTML_CLASS);
    } else {
      html.classList.remove(HTML_CLASS);
    }
    html.setAttribute(ATTRIBUTE, theme);
  }

  try {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? '#111827' : '#ffffff';
      metaThemeColor.setAttribute('content', color);
    }
  } catch (error) {
    // Silently fail
  }
})();`;

    return minify ? this.minifyScript(script) : script;
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ThemeConfig>): void {
    validateThemeConfig(newConfig);
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): ThemeConfig {
    return { ...this.config };
  }
}

/**
 * Utility functions for quick script generation
 */

/**
 * Generate basic anti-flicker script
 */
export function generateThemeScript(
  config: Partial<ThemeConfig> = {},
  minify: boolean = true
): string {
  const generator = new ThemeScriptGenerator(config);
  return generator.generateScript({ minify });
}

/**
 * Generate script with custom colors
 */
export function generateThemeScriptWithColors(
  darkColor: string,
  lightColor: string,
  config: Partial<ThemeConfig> = {},
  minify: boolean = true
): string {
  const generator = new ThemeScriptGenerator(config);
  return generator.generateScriptWithColors(darkColor, lightColor, { minify });
}

/**
 * Generate system-aware script
 */
export function generateSystemAwareScript(
  config: Partial<ThemeConfig> = {},
  minify: boolean = true
): string {
  const generator = new ThemeScriptGenerator(config);
  return generator.generateSystemAwareScript({ minify });
}

/**
 * Create script generator with configuration
 */
export function createScriptGenerator(config: Partial<ThemeConfig> = {}): ThemeScriptGenerator {
  return new ThemeScriptGenerator(config);
}

/**
 * Backward compatibility function (matches original API)
 */
export function getThemeInitScript(minify: boolean = true): string {
  return generateThemeScript({}, minify);
}
