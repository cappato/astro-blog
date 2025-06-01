# Favicon

## Purpose
Centralized favicon system with unified configuration for all devices and browsers. Provides complete support for Apple Touch Icons, Android Chrome, desktop browsers, and mobile theme colors.

## Architecture
Configuration-driven component that generates device-specific favicon links and meta tags from centralized FAVICON_CONFIG.

## Files
- `src/components/seo/Favicons.astro` - Main favicon component
- `src/config/site.ts` - FAVICON_CONFIG centralized configuration
- `public/` - Physical favicon files directory (apple-touch-icon.png, favicon-32x32.png, etc.)

## Usage

### Basic Usage
```astro
---
import Favicons from '../components/seo/Favicons.astro';
---
<head>
  <Favicons />
</head>
```

### Custom Theme Colors
```astro
---
import Favicons from '../components/seo/Favicons.astro';
---
<head>
  <Favicons 
    themeColor="#FF5733" 
    msApplicationTileColor="#FF5733" 
  />
</head>
```

### Dynamic Theme Colors
```astro
---
import Favicons from '../components/seo/Favicons.astro';
import { FAVICON_CONFIG } from '../config/site.ts';

const isDarkMode = false; // From theme system
const themeColor = isDarkMode ? FAVICON_CONFIG.themeColor.dark : FAVICON_CONFIG.themeColor.light;
---
<head>
  <Favicons themeColor={themeColor} />
</head>
```

## Configuration

### FAVICON_CONFIG
```typescript
export const FAVICON_CONFIG = {
  themeColor: {
    light: '#699CF9',
    dark: '#699CF9'
  },
  msApplicationTileColor: '#699CF9',
  paths: {
    appleTouchIcon: '/apple-touch-icon.png',
    favicon32: '/favicon-32x32.png',
    favicon16: '/favicon-16x16.png',
    manifest: '/site.webmanifest',
    shortcutIcon: '/favicon.ico',
    androidChrome192: '/android-chrome-192x192.png',
    androidChrome512: '/android-chrome-512x512.png'
  },
  sizes: {
    appleTouchIcon: '180x180',
    favicon32: '32x32',
    favicon16: '16x16',
    androidChrome192: '192x192',
    androidChrome512: '512x512'
  },
  mimeTypes: {
    png: 'image/png',
    ico: 'image/x-icon'
  }
} as const;
```

### Required Files
```
public/
├── apple-touch-icon.png          # 180x180 PNG for iOS
├── favicon-32x32.png             # 32x32 PNG for modern browsers
├── favicon-16x16.png             # 16x16 PNG for older browsers
├── favicon.ico                   # ICO fallback for legacy browsers
├── android-chrome-192x192.png    # 192x192 PNG for Android
├── android-chrome-512x512.png    # 512x512 PNG for Android
└── site.webmanifest              # Web app manifest
```

## Generated Output
```html
<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Standard Favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- Android Chrome Icons -->
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">

<!-- Web App Manifest -->
<link rel="manifest" href="/site.webmanifest">

<!-- Shortcut Icon -->
<link rel="shortcut icon" href="/favicon.ico">

<!-- Theme Colors -->
<meta name="theme-color" content="#699CF9">
<meta name="msapplication-TileColor" content="#699CF9">
```

## Extension

### Adding New Icon Sizes
1. Add path to `FAVICON_CONFIG.paths`
2. Add size to `FAVICON_CONFIG.sizes`
3. Update Favicons.astro component
4. Add physical file to public/

### Per-page Theme Colors
```astro
---
const blogThemeColor = '#FF6B6B';
const portfolioThemeColor = '#4ECDC4';
---
<Favicons themeColor={blogThemeColor} />
```

### Theme System Integration
```astro
---
import { FAVICON_CONFIG } from '../config/site.ts';

const currentTheme = 'dark'; // From theme system
const themeColor = FAVICON_CONFIG.themeColor[currentTheme];
---
<Favicons themeColor={themeColor} />
```

## AI Context
```yaml
feature_type: "favicon_system"
purpose: "device_specific_icons"
input_sources: ["favicon_config", "theme_colors"]
output_format: "html_link_meta_tags"
device_support: ["ios_safari", "android_chrome", "desktop_browsers", "legacy_browsers"]
architecture: "configuration_driven_component"
theme_integration: "dynamic_colors"
dependencies: ["theme_system", "site_config"]
key_files: ["Favicons.astro", "site.ts", "public_directory"]
```
