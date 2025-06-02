/**
 * Theme System Feature - Theme Manager
 * Framework-agnostic theme management with persistence and reactivity
 */

import type { 
  Theme, 
  ThemeConfig, 
  ThemeColors, 
  ThemeListener, 
  IThemeManager,
  DOMOptions 
} from './types';
import { 
  DEFAULT_THEME_CONFIG, 
  DEFAULT_THEME_COLORS,
  validateThemeConfig,
  validateThemeColors,
  isBrowser 
} from './types';
import { ThemeDOMUtils } from './dom-utils';

/**
 * Main theme manager class
 */
export class ThemeManager implements IThemeManager {
  private currentTheme: Theme;
  private listeners: Set<ThemeListener> = new Set();
  private domUtils: ThemeDOMUtils;
  private config: ThemeConfig;
  private colors: ThemeColors;
  private systemThemeListener?: () => void;

  constructor(
    config: Partial<ThemeConfig> = {},
    colors: Partial<ThemeColors> = {},
    domOptions: DOMOptions = {}
  ) {
    // Validate and merge configuration
    validateThemeConfig(config);
    validateThemeColors(colors);
    
    this.config = { ...DEFAULT_THEME_CONFIG, ...config };
    this.colors = { ...DEFAULT_THEME_COLORS, ...colors };
    
    // Initialize DOM utilities
    this.domUtils = new ThemeDOMUtils(this.config, this.colors, domOptions);
    
    // Get initial theme
    this.currentTheme = this.getInitialTheme();
  }

  /**
   * Get initial theme based on stored preference or default
   */
  private getInitialTheme(): Theme {
    if (!isBrowser()) {
      return this.config.defaultTheme;
    }

    return this.domUtils.getInitialTheme();
  }

  /**
   * Get current theme
   */
  public getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Set specific theme
   */
  public setTheme(theme: Theme): void {
    if (this.currentTheme === theme) return;

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(theme);
    this.notifyListeners(theme);
  }

  /**
   * Toggle between light and dark theme
   */
  public toggleTheme(): void {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Subscribe to theme changes
   */
  public subscribe(listener: ThemeListener): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Initialize theme system
   */
  public init(): void {
    this.applyTheme(this.currentTheme);
    this.setupSystemThemeListener();
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(theme: Theme): void {
    this.domUtils.applyTheme(theme);
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: Theme): void {
    this.domUtils.saveTheme(theme);
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyListeners(theme: Theme): void {
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  /**
   * Setup system theme change listener
   */
  private setupSystemThemeListener(): void {
    if (this.systemThemeListener) return;

    this.systemThemeListener = this.domUtils.addSystemThemeListener((systemTheme) => {
      // Only auto-switch if no explicit preference is stored
      const storedTheme = this.domUtils.getStoredTheme();
      if (!storedTheme) {
        this.setTheme(systemTheme);
      }
    });
  }

  /**
   * Remove system theme listener
   */
  public destroy(): void {
    if (this.systemThemeListener) {
      this.systemThemeListener();
      this.systemThemeListener = undefined;
    }
    this.listeners.clear();
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ThemeConfig>): void {
    validateThemeConfig(newConfig);
    this.config = { ...this.config, ...newConfig };
    this.domUtils.updateConfig(this.config);
  }

  /**
   * Update colors
   */
  public updateColors(newColors: Partial<ThemeColors>): void {
    validateThemeColors(newColors);
    this.colors = { ...this.colors, ...newColors };
    this.domUtils.updateColors(this.colors);
    
    // Re-apply current theme to update colors
    this.applyTheme(this.currentTheme);
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
    return this.domUtils.isDOMAvailable();
  }

  /**
   * Check if localStorage is available
   */
  public isStorageAvailable(): boolean {
    return this.domUtils.isStorageAvailable();
  }

  /**
   * Get system theme preference
   */
  public getSystemTheme(): Theme {
    return this.domUtils.getSystemTheme();
  }

  /**
   * Reset theme to default
   */
  public resetTheme(): void {
    this.setTheme(this.config.defaultTheme);
  }

  /**
   * Clear stored theme preference
   */
  public clearStoredTheme(): void {
    if (!this.domUtils.isDOMAvailable()) return;

    try {
      // Use domUtils to access localStorage through mocked window
      if (this.domUtils.isStorageAvailable()) {
        const window = (this.domUtils as any).window;
        if (window && window.localStorage) {
          window.localStorage.removeItem(this.config.storageKey);
        }
      }
      // Reset to system preference or default
      const systemTheme = this.getSystemTheme();
      this.setTheme(systemTheme);
    } catch (error) {
      console.warn('Error clearing stored theme:', error);
    }
  }

  /**
   * Get theme statistics
   */
  public getStats(): {
    currentTheme: Theme;
    storedTheme: Theme | null;
    systemTheme: Theme;
    listenerCount: number;
    isDOMAvailable: boolean;
    isStorageAvailable: boolean;
  } {
    return {
      currentTheme: this.currentTheme,
      storedTheme: this.domUtils.getStoredTheme(),
      systemTheme: this.domUtils.getSystemTheme(),
      listenerCount: this.listeners.size,
      isDOMAvailable: this.isDOMAvailable(),
      isStorageAvailable: this.isStorageAvailable()
    };
  }
}

/**
 * Utility functions for theme management
 */

/**
 * Create a new theme manager instance
 */
export function createThemeManager(
  config: Partial<ThemeConfig> = {},
  colors: Partial<ThemeColors> = {},
  domOptions: DOMOptions = {}
): ThemeManager {
  return new ThemeManager(config, colors, domOptions);
}

/**
 * Create theme manager with default configuration
 */
export function createDefaultThemeManager(): ThemeManager {
  return new ThemeManager();
}

/**
 * Singleton theme manager instance (backward compatibility)
 */
export const themeManager = new ThemeManager();

/**
 * Initialize the global theme manager (backward compatibility)
 */
export function initTheme(): void {
  themeManager.init();
}
