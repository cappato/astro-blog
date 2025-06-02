/**
 * Dark Light Mode Feature - Public API
 * Framework-agnostic dark/light mode management system with anti-flicker support
 * 
 * @example
 * ```typescript
 * import { useTheme, ThemeManager } from '@features/dark-light-mode';
 * 
 * // Simple usage
 * const { theme, setTheme, toggleTheme } = useTheme();
 * 
 * // Advanced usage
 * const manager = new ThemeManager({ defaultTheme: 'light' });
 * manager.init();
 * ```
 */

// Type exports
export type {
  Theme,
  ThemeConfig,
  ThemeColors,
  ThemeListener,
  IThemeManager,
  ThemeHook,
  ScriptOptions,
  DOMOptions,
  ThemeToggleProps
} from './engine/types';

export {
  DEFAULT_THEME_CONFIG,
  DEFAULT_THEME_COLORS,
  TOGGLE_SIZE_CONFIG,
  FEATURE_INFO,
  isValidTheme,
  validateThemeConfig,
  validateThemeColors,
  isBrowser,
  isLocalStorageAvailable
} from './engine/types';

// Core engine exports
export {
  ThemeManager,
  createThemeManager,
  createDefaultThemeManager,
  themeManager,
  initTheme
} from './engine/manager';

export {
  ThemeDOMUtils,
  applyThemeImmediate,
  getStoredTheme,
  saveTheme,
  getSystemTheme,
  getInitialTheme,
  createDOMUtils
} from './engine/dom-utils';

export {
  ThemeScriptGenerator,
  generateThemeScript,
  generateThemeScriptWithColors,
  generateSystemAwareScript,
  createScriptGenerator,
  getThemeInitScript
} from './engine/script-generator';

// Import types and manager for the hook
import type { Theme, ThemeListener } from './engine/types';
import { themeManager } from './engine/manager';

/**
 * Hook for components that need to react to theme changes
 * Provides backward compatibility with original API
 */
export function useTheme() {
  return {
    theme: themeManager.getTheme(),
    setTheme: (theme: Theme) => themeManager.setTheme(theme),
    toggleTheme: () => themeManager.toggleTheme(),
    subscribe: (listener: ThemeListener) => themeManager.subscribe(listener)
  };
}

/**
 * Advanced theme hook with custom manager
 */
export function useThemeManager(manager: ThemeManager) {
  return {
    theme: manager.getTheme(),
    setTheme: (theme: Theme) => manager.setTheme(theme),
    toggleTheme: () => manager.toggleTheme(),
    subscribe: (listener: ThemeListener) => manager.subscribe(listener),
    manager
  };
}

/**
 * Create a configured theme system
 */
export function createThemeSystem(
  config: Partial<ThemeConfig> = {},
  colors: Partial<ThemeColors> = {}
) {
  const manager = new ThemeManager(config, colors);
  
  return {
    manager,
    useTheme: () => useThemeManager(manager),
    init: () => manager.init(),
    destroy: () => manager.destroy()
  };
}

/**
 * Backward compatibility exports
 * These maintain the exact same API as the original theme.ts
 */

// Re-export types with original names for backward compatibility
export type { Theme as ThemeType } from './engine/types';

// Configuration constants (backward compatibility)
export { DEFAULT_THEME_CONFIG as THEME_CONFIG } from './engine/types';
export { DEFAULT_THEME_COLORS as THEME_COLORS } from './engine/types';

/**
 * Feature metadata for documentation and tooling
 */
export const THEME_SYSTEM_INFO = {
  name: 'Theme System',
  version: '1.0.0',
  description: 'Framework-agnostic theme management with anti-flicker support',
  migrationStatus: 'complete',
  originalLocation: 'src/utils/theme.ts',
  newLocation: 'src/features/theme-system/',
  backwardCompatible: true,
  dependencies: [],
  exports: [
    'ThemeManager',
    'useTheme',
    'initTheme',
    'getThemeInitScript',
    'THEME_CONFIG',
    'THEME_COLORS'
  ],
  components: [
    'ThemeScript',
    'ThemeToggle'
  ],
  compatibility: {
    frameworks: ['Astro', 'React', 'Vue', 'Svelte', 'Vanilla JS'],
    environments: ['Browser', 'SSR', 'SSG']
  },
  features: [
    'Anti-flicker SSR script',
    'localStorage persistence',
    'System theme detection',
    'Reactive listeners',
    'Mobile meta theme-color',
    'TypeScript support',
    'Framework agnostic'
  ]
} as const;
