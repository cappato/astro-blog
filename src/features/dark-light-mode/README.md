# Dark Light Mode Feature

##  Core Purpose

Framework-agnostic dark/light mode management system with anti-flicker support. Provides localStorage persistence, system theme detection, and reactive components for seamless user experience without theme flash during page load.

## ️ Architecture

### Modular Structure
- **Location**: `src/features/dark-light-mode/`
- **Type**: Framework-agnostic TypeScript feature with Astro components
- **Dependencies**: Zero external dependencies
- **Tests**: 36 comprehensive tests

### Design Principles
-  **Anti-flicker**: SSR script prevents theme flash during page load
-  **Framework Agnostic**: Core engine works with any JavaScript framework
-  **Reactive**: Event-driven architecture with listener system
-  **Persistent**: localStorage integration with graceful fallbacks
-  **Accessible**: Mobile meta theme-color and ARIA support
-  **Self-Contained**: All functionality within feature directory

##  Specifications

### Core Functionality
- **Dark/Light Toggle**: Seamless switching between color schemes
- **Anti-flicker Script**: SSR-compatible script prevents theme flash
- **System Detection**: Automatic system theme preference detection
- **Reactive Updates**: Event-driven theme change notifications
- **Mobile Support**: Meta theme-color updates for mobile browsers

### Configuration Options
```typescript
interface ThemeConfig {
  defaultTheme: 'light' | 'dark';     // Default: 'dark'
  storageKey: string;                 // Default: 'theme-preference'
  htmlClass: string;                  // Default: 'dark'
  attribute: string;                  // Default: 'data-theme'
}

interface ThemeColors {
  dark: string;                       // Default: '#111827'
  light: string;                      // Default: '#ffffff'
}
```

### Browser Support
-  **Modern Browsers**: Full feature support
-  **Legacy Browsers**: Graceful degradation
-  **SSR/SSG**: Server-side rendering compatible
-  **Mobile**: iOS/Android theme-color support

## 🧩 Components

### 1. ThemeManager
**Purpose**: Core dark/light mode management engine
```typescript
const manager = new ThemeManager({
  defaultTheme: 'dark',
  storageKey: 'theme-preference'
});

manager.init();
manager.setTheme('light');
manager.toggleTheme();
```

### 2. ThemeDOMUtils
**Purpose**: DOM manipulation and storage utilities
```typescript
const domUtils = new ThemeDOMUtils();
domUtils.applyTheme('dark');
const stored = domUtils.getStoredTheme();
const system = domUtils.getSystemTheme();
```

### 3. ThemeScriptGenerator
**Purpose**: Anti-flicker script generation
```typescript
const generator = new ThemeScriptGenerator();
const script = generator.generateScript({ minify: true });
```

### 4. ThemeScript (Astro Component)
**Purpose**: Anti-flicker script injection
```astro
---
import { ThemeScript } from '@features/dark-light-mode/components';
---
<head>
  <ThemeScript />
</head>
```

### 5. ThemeToggle (Astro Component)
**Purpose**: Theme toggle button
```astro
---
import { ThemeToggle } from '@features/dark-light-mode/components';
---
<ThemeToggle size="md" showLabel={false} />
```

##  Examples

### Basic Usage (Backward Compatible)
```typescript
import { useTheme, initTheme } from '@features/dark-light-mode';

// Initialize theme system
initTheme();

// Use theme hook
const { theme, setTheme, toggleTheme, subscribe } = useTheme();

// Set specific theme
setTheme('dark');

// Toggle between themes
toggleTheme();

// Subscribe to changes
const unsubscribe = subscribe((newTheme) => {
  console.log('Theme changed to:', newTheme);
});
```

### Advanced Usage
```typescript
import { ThemeManager, createThemeSystem } from '@features/dark-light-mode';

// Custom theme system
const themeSystem = createThemeSystem({
  defaultTheme: 'light',
  storageKey: 'my-app-theme'
}, {
  dark: '#1a1a1a',
  light: '#f5f5f5'
});

themeSystem.init();

// Use custom system
const { theme, setTheme } = themeSystem.useTheme();
```

### Component Integration
```astro
---
// Layout.astro
import { ThemeScript, ThemeToggle } from '@features/dark-light-mode/components';
---
<html>
  <head>
    <!-- CRITICAL: Must be early in head -->
    <ThemeScript />
  </head>
  <body>
    <nav>
      <ThemeToggle size="md" />
    </nav>
  </body>
</html>
```

##  Integration

### Current Usage
The dark/light mode system is used throughout the application:

- **Layouts**: `MainLayout.astro`, `PostLayout.astro`
- **Components**: `BaseNavbar.astro`, `BlogNavbar.astro`
- **Pages**: All blog pages and main pages

### Migration Completed
-  **Phase 1**: Feature modularized with enhanced architecture
-  **Phase 2**: Components migrated to feature directory
-  **Phase 3**: Tests migrated and expanded (36 tests)
-  **Phase 4**: Backward compatibility maintained
-  **Phase 5**: Renamed from "theme-system" to "dark-light-mode"

### Import Updates Completed
```typescript
// OLD (removed)
import { useTheme } from '../utils/theme';
import ThemeScript from '../components/layout/ThemeScript.astro';
import ThemeToggle from '../components/ui/ThemeToggle.astro';

// NEW (current)
import { useTheme } from '../features/dark-light-mode';
import { ThemeScript, ThemeToggle } from '../features/dark-light-mode/components';
```

## 🧪 Testing

### Test Coverage
-  **36 comprehensive tests** covering all functionality
-  **Configuration validation**: Invalid configs and edge cases
-  **DOM manipulation**: Theme application and meta updates
-  **Storage handling**: localStorage with error scenarios
-  **System integration**: OS theme preference detection
-  **Script generation**: Anti-flicker script validation
-  **Backward compatibility**: Original API preservation

### Test Commands
```bash
# Run dark/light mode tests specifically
npx vitest run src/features/dark-light-mode/__tests__/theme-system.test.ts

# Run all unit tests (includes dark/light mode)
npm run test:unit
```

##  Error Handling

### Graceful Degradation
- **localStorage unavailable**: Falls back to default theme
- **DOM manipulation errors**: Continues without throwing
- **System detection failure**: Uses default theme
- **Invalid configuration**: Throws descriptive errors

##  AI Context

### Feature Purpose
Complete dark/light mode management system with anti-flicker support and mobile optimization for seamless user experience.

### Key Integration Points
- **Layout Integration**: ThemeScript in all layout heads
- **Navigation**: ThemeToggle in navbar components
- **Mobile Support**: Meta theme-color updates
- **Performance**: Anti-flicker prevents layout shift

### Benefits Achieved
-  **Modular Architecture**: Self-contained, reusable feature
-  **Zero Dependencies**: No external packages required
-  **Framework Agnostic**: Core engine works anywhere
-  **Enhanced Testing**: 36 tests vs original 30
-  **Better Architecture**: Separation of concerns with engine modules
-  **Backward Compatible**: Existing code continues to work
-  **Anti-flicker**: Prevents theme flash during page load
-  **Mobile Optimized**: Theme-color meta tag updates
-  **Clear Naming**: "dark-light-mode" vs confusing "theme-system"

---

##  Migration Summary

| Aspect | Before | After | Status |
|--------|--------|-------|--------|
| **Location** | `src/utils/theme.ts` | `src/features/dark-light-mode/` |  Migrated |
| **Components** | `src/components/layout/`, `src/components/ui/` | `src/features/dark-light-mode/components/` |  Migrated |
| **Tests** | `src/utils/__tests__/` | `src/features/dark-light-mode/__tests__/` |  Migrated |
| **API** | Basic functions | Enhanced classes + backward compatibility |  Enhanced |
| **Dependencies** | Zero | Zero |  Maintained |
| **Test Count** | 30 tests | 36 tests |  Expanded |
| **Architecture** | Single file | Modular engine-based |  Improved |
| **Naming** | "theme-system" (confusing) | "dark-light-mode" (clear) |  Clarified |

This feature is **production-ready** with complete backward compatibility, enhanced functionality, and clear naming!
