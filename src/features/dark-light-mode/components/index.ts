/**
 * Theme System Components - Public Exports
 * Astro components for theme system integration
 */

// Export Astro components
export { default as ThemeScript } from './ThemeScript.astro';
export { default as ThemeToggle } from './ThemeToggle.astro';

/**
 * Component metadata for documentation
 */
export const THEME_COMPONENTS_INFO = {
  components: [
    {
      name: 'ThemeScript',
      path: './ThemeScript.astro',
      description: 'Anti-flicker script component for theme initialization',
      usage: 'Must be placed early in <head> section',
      props: {
        minify: 'boolean - Whether to minify the script (default: true)',
        storageKey: 'string - Custom storage key for theme preference',
        defaultTheme: "'light' | 'dark' - Default theme when no preference is stored",
        htmlClass: 'string - CSS class for dark theme',
        attribute: 'string - HTML attribute for theme identification'
      }
    },
    {
      name: 'ThemeToggle',
      path: './ThemeToggle.astro',
      description: 'Theme toggle button component',
      usage: 'Can be placed anywhere in the UI',
      props: {
        size: "'sm' | 'md' | 'lg' - Button size (default: 'md')",
        className: 'string - Additional CSS classes',
        showLabel: 'boolean - Show text label (default: false)',
        ariaLabel: 'string - Custom aria label'
      }
    }
  ]
} as const;
