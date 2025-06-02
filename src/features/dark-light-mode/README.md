# Dark Light Mode Feature

## 🎯 Core Purpose

Framework-agnostic dark/light mode management system with anti-flicker support. Provides localStorage persistence, system theme detection, and reactive components for seamless user experience.

## 🏗️ Architecture

### Modular Structure
- **Location**: `src/features/dark-light-mode/`
- **Type**: Framework-agnostic TypeScript feature with Astro components
- **Dependencies**: Zero external dependencies
- **Tests**: 30+ comprehensive tests

### Design Principles
- ✅ **Anti-flicker**: SSR script prevents theme flash during page load
- ✅ **Framework Agnostic**: Core engine works with any JavaScript framework
- ✅ **Reactive**: Event-driven architecture with listener system
- ✅ **Persistent**: localStorage integration with graceful fallbacks
- ✅ **Accessible**: Mobile meta theme-color and ARIA support
- ✅ **Self-Contained**: All functionality within feature directory

## 📋 Specifications

### Core Functionality
- **Theme Management**: Light/dark mode switching with persistence
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
- ✅ **Modern Browsers**: Full feature support
- ✅ **Legacy Browsers**: Graceful degradation
- ✅ **SSR/SSG**: Server-side rendering compatible
- ✅ **Mobile**: iOS/Android theme-color support

## 🧩 Components

### 1. ThemeManager
**Purpose**: Core theme management engine
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
import { ThemeScript } from '@features/theme-system/components';
---
<head>
  <ThemeScript />
</head>
```

### 5. ThemeToggle (Astro Component)
**Purpose**: Theme toggle button
```astro
---
import { ThemeToggle } from '@features/theme-system/components';
---
<ThemeToggle size="md" showLabel={false} />
```

## 💡 Examples

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
import { ThemeManager, createThemeSystem } from '@features/theme-system';

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

### Script Generation
```typescript
import { generateThemeScript, generateSystemAwareScript } from '@features/dark-light-mode';

// Basic anti-flicker script
const script = generateThemeScript({
  defaultTheme: 'dark',
  storageKey: 'theme'
});

// System-aware script (respects OS preference)
const systemScript = generateSystemAwareScript();

// Custom colors
const colorScript = generateThemeScriptWithColors('#000', '#fff');
```

## 🔧 Integration

### Current Usage
The theme system is used throughout the application:

- **Layouts**: `MainLayout.astro`, `PostLayout.astro`
- **Components**: `BaseNavbar.astro`, `BlogNavbar.astro`
- **Pages**: All blog pages and main pages

### Migration Completed
- ✅ **Phase 1**: Feature modularized with enhanced architecture
- ✅ **Phase 2**: Components migrated to feature directory
- ✅ **Phase 3**: Tests migrated and expanded (30+ tests)
- ✅ **Phase 4**: Backward compatibility maintained

### Import Updates Required
```typescript
// OLD (still works for backward compatibility)
import { useTheme } from '../utils/theme';
import ThemeScript from '../components/layout/ThemeScript.astro';
import ThemeToggle from '../components/ui/ThemeToggle.astro';

// NEW (recommended)
import { useTheme } from '../features/theme-system';
import { ThemeScript, ThemeToggle } from '../features/theme-system/components';
```

## 🧪 Testing

### Test Coverage
- ✅ **30+ comprehensive tests** covering all functionality
- ✅ **Configuration validation**: Invalid configs and edge cases
- ✅ **DOM manipulation**: Theme application and meta updates
- ✅ **Storage handling**: localStorage with error scenarios
- ✅ **System integration**: OS theme preference detection
- ✅ **Script generation**: Anti-flicker script validation
- ✅ **Backward compatibility**: Original API preservation

### Test Commands
```bash
# Run theme system tests specifically
npx vitest run src/features/theme-system/__tests__/theme-system.test.ts

# Run all unit tests (includes theme system)
npm run test:unit
```

## 🚨 Error Handling

### Graceful Degradation
- **localStorage unavailable**: Falls back to default theme
- **DOM manipulation errors**: Continues without throwing
- **System detection failure**: Uses default theme
- **Invalid configuration**: Throws descriptive errors

### Error Scenarios
```typescript
// Invalid theme
new ThemeManager({ defaultTheme: 'invalid' }); // Throws error

// Storage errors (handled gracefully)
manager.setTheme('dark'); // Works even if localStorage fails

// DOM errors (handled gracefully)
manager.applyTheme('light'); // Works even if DOM manipulation fails
```

## 🎯 AI Context

### Feature Purpose
Complete theme management system for dark/light mode switching with anti-flicker support and mobile optimization.

### Key Integration Points
- **Layout Integration**: ThemeScript in all layout heads
- **Navigation**: ThemeToggle in navbar components
- **Mobile Support**: Meta theme-color updates
- **Performance**: Anti-flicker prevents layout shift

### Benefits Achieved
- ✅ **Modular Architecture**: Self-contained, reusable feature
- ✅ **Zero Dependencies**: No external packages required
- ✅ **Framework Agnostic**: Core engine works anywhere
- ✅ **Enhanced Testing**: 30+ tests vs original coverage
- ✅ **Better Architecture**: Separation of concerns with engine modules
- ✅ **Backward Compatible**: Existing code continues to work
- ✅ **Anti-flicker**: Prevents theme flash during page load
- ✅ **Mobile Optimized**: Theme-color meta tag updates

---

## 📊 Migration Summary

| Aspect | Before | After | Status |
|--------|--------|-------|--------|
| **Location** | `src/utils/theme.ts` | `src/features/theme-system/` | ✅ Migrated |
| **Components** | `src/components/layout/`, `src/components/ui/` | `src/features/theme-system/components/` | ✅ Migrated |
| **Tests** | `src/utils/__tests__/` | `src/features/theme-system/__tests__/` | ✅ Migrated |
| **API** | Basic functions | Enhanced classes + backward compatibility | ✅ Enhanced |
| **Dependencies** | Zero | Zero | ✅ Maintained |
| **Test Count** | 30 tests | 30+ tests | ✅ Maintained/Expanded |
| **Architecture** | Single file | Modular engine-based | ✅ Improved |

This feature is **production-ready** with complete backward compatibility and enhanced functionality!
