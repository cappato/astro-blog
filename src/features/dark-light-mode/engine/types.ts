/**
 * Theme System Feature - Type Definitions
 * Framework-agnostic TypeScript interfaces for theme management
 */

/**
 * Supported theme types
 */
export type Theme = 'light' | 'dark';

/**
 * Theme configuration options
 */
export interface ThemeConfig {
  /** Default theme when no preference is stored */
  defaultTheme: Theme;
  /** localStorage key for theme preference */
  storageKey: string;
  /** CSS class applied to html element for dark theme */
  htmlClass: string;
  /** HTML attribute for theme identification */
  attribute: string;
}

/**
 * Theme colors for meta theme-color on mobile devices
 */
export interface ThemeColors {
  /** Dark theme color (hex) */
  dark: string;
  /** Light theme color (hex) */
  light: string;
}

/**
 * Theme change listener function
 */
export type ThemeListener = (theme: Theme) => void;

/**
 * Theme manager interface
 */
export interface IThemeManager {
  /** Get current theme */
  getTheme(): Theme;
  /** Set specific theme */
  setTheme(theme: Theme): void;
  /** Toggle between themes */
  toggleTheme(): void;
  /** Subscribe to theme changes */
  subscribe(listener: ThemeListener): () => void;
  /** Initialize theme system */
  init(): void;
}

/**
 * Theme hook return type
 */
export interface ThemeHook {
  /** Current theme */
  theme: Theme;
  /** Set specific theme */
  setTheme: (theme: Theme) => void;
  /** Toggle between themes */
  toggleTheme: () => void;
  /** Subscribe to theme changes */
  subscribe: (listener: ThemeListener) => () => void;
}

/**
 * Script generation options
 */
export interface ScriptOptions {
  /** Whether to minify the generated script */
  minify?: boolean;
  /** Custom theme configuration */
  config?: Partial<ThemeConfig>;
}

/**
 * DOM manipulation options
 */
export interface DOMOptions {
  /** Target document (for testing) */
  document?: Document;
  /** Target window (for testing) */
  window?: Window;
}

/**
 * Theme toggle component props
 */
export interface ThemeToggleProps {
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Show text label */
  showLabel?: boolean;
  /** Custom aria label */
  ariaLabel?: string;
}

/**
 * Default theme configuration
 */
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  defaultTheme: 'dark',
  storageKey: 'theme-preference',
  htmlClass: 'dark',
  attribute: 'data-theme'
} as const;

/**
 * Default theme colors for mobile meta theme-color
 * These values should match Tailwind's theme configuration
 */
export const DEFAULT_THEME_COLORS: ThemeColors = {
  dark: '#111827',   // matches theme-meta.dark in tailwind.config.js
  light: '#ffffff'   // matches theme-meta.light in tailwind.config.js
} as const;

/**
 * Theme toggle size configurations
 */
export const TOGGLE_SIZE_CONFIG = {
  sm: {
    padding: 'p-1.5',
    iconSize: 16
  },
  md: {
    padding: 'p-2',
    iconSize: 20
  },
  lg: {
    padding: 'p-3',
    iconSize: 24
  }
} as const;

/**
 * Validation functions
 */

/**
 * Check if value is a valid theme
 */
export function isValidTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/**
 * Validate theme configuration
 */
export function validateThemeConfig(config: Partial<ThemeConfig>): void {
  if (config.defaultTheme && !isValidTheme(config.defaultTheme)) {
    throw new Error(`Invalid default theme: ${config.defaultTheme}. Must be 'light' or 'dark'.`);
  }
  
  if (config.storageKey && typeof config.storageKey !== 'string') {
    throw new Error('Storage key must be a string');
  }
  
  if (config.htmlClass && typeof config.htmlClass !== 'string') {
    throw new Error('HTML class must be a string');
  }
  
  if (config.attribute && typeof config.attribute !== 'string') {
    throw new Error('Attribute must be a string');
  }
}

/**
 * Validate theme colors
 */
export function validateThemeColors(colors: Partial<ThemeColors>): void {
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  
  if (colors.dark && !hexColorRegex.test(colors.dark)) {
    throw new Error(`Invalid dark theme color: ${colors.dark}. Must be a valid hex color.`);
  }
  
  if (colors.light && !hexColorRegex.test(colors.light)) {
    throw new Error(`Invalid light theme color: ${colors.light}. Must be a valid hex color.`);
  }
}

/**
 * Environment detection utilities
 */

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  if (!isBrowser()) return false;
  
  try {
    const test = '__theme_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Feature metadata for documentation and tooling
 */
export const FEATURE_INFO = {
  name: 'Theme System',
  version: '1.0.0',
  description: 'Framework-agnostic theme management with anti-flicker support',
  dependencies: [],
  exports: [
    'ThemeManager',
    'useTheme',
    'initTheme',
    'getThemeInitScript',
    'ThemeScript',
    'ThemeToggle'
  ],
  compatibility: {
    frameworks: ['Astro', 'React', 'Vue', 'Svelte', 'Vanilla JS'],
    environments: ['Browser', 'SSR', 'SSG']
  }
} as const;
