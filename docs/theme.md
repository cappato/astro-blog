# Theme

## Purpose
Complete dark/light theme system for Astro + Tailwind with anti-flicker, localStorage persistence, and reactive components. Solves content flash problem through SSR script and centralized state management.

## Architecture
Singleton ThemeManager with anti-flicker SSR script and Tailwind CSS class integration.

## Files
- `src/utils/theme.ts` - ThemeManager class and core logic
- `src/utils/__tests__/theme.test.ts` - Comprehensive test suite (30 tests)
- `src/components/layout/ThemeScript.astro` - Anti-flicker SSR script
- `src/components/ui/ThemeToggle.astro` - Theme toggle button component
- `src/styles/theme.css` - Semantic CSS classes
- `tailwind.config.js` - Theme color configuration

## Usage

### Layout Integration
```astro
---
import ThemeScript from '../components/layout/ThemeScript.astro';
import { ThemeToggle } from '../components/ui/ThemeToggle.astro';
---
<head>
  <ThemeScript /> <!-- CRITICAL: Must be early in head -->
</head>
<body>
  <ThemeToggle size="md" />
</body>
```

### Component Usage
```typescript
import { useTheme } from '../utils/theme.ts';

const { theme, setTheme, toggleTheme, subscribe } = useTheme();

// Set specific theme
setTheme('dark');

// Toggle between themes
toggleTheme();

// Subscribe to theme changes
const unsubscribe = subscribe((newTheme) => {
  console.log('Theme changed to:', newTheme);
});
```

### Manual ThemeManager Usage
```typescript
import { ThemeManager } from '../utils/theme.ts';

const themeManager = new ThemeManager();
themeManager.init();

// Get current theme
const currentTheme = themeManager.getTheme();

// Set theme
themeManager.setTheme('light');

// Subscribe to changes
themeManager.subscribe((theme) => {
  console.log('Theme changed:', theme);
});
```

## Configuration

### THEME_CONFIG
```typescript
export const THEME_CONFIG = {
  DEFAULT_THEME: 'dark' as Theme,
  STORAGE_KEY: 'theme-preference',
  HTML_CLASS: 'dark',
  ATTRIBUTE: 'data-theme'
} as const;

export type Theme = 'light' | 'dark';
```

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable dark mode by CSS class
  theme: {
    extend: {
      colors: {
        background: { DEFAULT: '#f8fafc', dark: '#0f172a' },
        foreground: { DEFAULT: '#1e293b', dark: '#f8fafc' },
        primary: { DEFAULT: '#3b82f6', dark: '#60a5fa' },
        secondary: { DEFAULT: '#64748b', dark: '#94a3b8' }
      }
    }
  }
}
```

### Semantic CSS Classes
```css
/* Semantic classes that adapt automatically */
.text-primary { @apply text-slate-900 dark:text-slate-100; }
.bg-card { @apply bg-white/70 dark:bg-slate-800; }
.border-theme { @apply border-slate-200 dark:border-slate-700; }
.shadow-theme { @apply shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50; }
```

## ThemeManager Class

### Core Architecture
```typescript
export class ThemeManager {
  private currentTheme: Theme;
  private listeners: Set<ThemeListener> = new Set();

  setTheme(theme: Theme): void {
    if (this.currentTheme === theme) return;
    
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(theme);
    this.notifyListeners(theme);
  }

  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;
    
    const html = document.documentElement;
    html.classList.toggle('dark', theme === 'dark');
    html.setAttribute('data-theme', theme);
  }

  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(THEME_CONFIG.STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Error saving theme to localStorage:', error);
    }
  }
}
```

### Anti-flicker SSR Script
```typescript
// Executes immediately in <head> before render
const script = `(function() {
  const STORAGE_KEY = 'theme-preference';
  const DEFAULT_THEME = 'dark';
  const HTML_CLASS = 'dark';
  
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
  html.setAttribute('data-theme', theme);
})();`;
```

### Theme Toggle Component
```astro
---
// ThemeToggle.astro
interface Props {
  size?: 'sm' | 'md' | 'lg';
  class?: string;
}

const { size = 'md', class: className = '' } = Astro.props;
---

<button
  id="theme-toggle"
  class={`theme-toggle ${className}`}
  aria-label="Toggle theme"
  data-size={size}
>
  <span class="theme-icon theme-icon-light">☀️</span>
  <span class="theme-icon theme-icon-dark">🌙</span>
</button>

<script>
  import { useTheme } from '../../utils/theme.ts';
  
  const { toggleTheme, subscribe } = useTheme();
  
  const button = document.getElementById('theme-toggle');
  if (button) {
    button.addEventListener('click', toggleTheme);
    
    // Update button state on theme change
    subscribe((theme) => {
      button.setAttribute('data-theme', theme);
      button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    });
  }
</script>
```

## Extension

### Adding New Theme
1. Extend type: `export type Theme = 'light' | 'dark' | 'auto';`
2. Update `THEME_COLORS` with new values
3. Add CSS classes in `theme.css`
4. Modify `applyTheme()` to handle new theme

### Custom Theme Colors
1. Add colors to Tailwind config
2. Create semantic CSS classes
3. Update theme application logic if needed

### Theme Persistence
```typescript
// Custom storage implementation
class CustomThemeStorage {
  save(theme: Theme): void {
    // Custom save logic (e.g., API call)
  }
  
  load(): Theme | null {
    // Custom load logic
    return null;
  }
}
```

## AI Context
```yaml
feature_type: "theme_system"
purpose: "ui_theming"
input_sources: ["localStorage", "user_interaction", "system_preference"]
output_format: "css_classes"
architecture: "singleton_manager_ssr_script"
anti_flicker: "ssr_inline_script"
performance_impact: "minimal_2kb_minified"
accessibility: "full_support"
dependencies: ["tailwindcss", "astro", "typescript"]
key_files: ["theme.ts", "ThemeScript.astro", "ThemeToggle.astro", "tailwind.config.js"]
```
