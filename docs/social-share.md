# Social Share

## Purpose
Comprehensive social sharing system with mobile support, accessibility features, and TypeScript integration. Provides multi-platform sharing (Facebook, Twitter, LinkedIn, WhatsApp, Copy), mobile-optimized sharing with native app support, and complete UI components with toast notifications.

## Architecture
Modular feature system with plug & play portability, self-contained components, engine utilities, and comprehensive TypeScript type safety.

## Files
- `src/features/social-share/index.ts` - Public API exports and feature metadata
- `src/features/social-share/components/` - Astro components (ShareButtons, ShareButton, ShareMessage, CopyToast)
- `src/features/social-share/engine/` - TypeScript engine (types, constants, utils, shareScript)
- `src/features/social-share/__tests__/` - Comprehensive test suite (22 tests)
- `src/layouts/PostLayout.astro` - Integration in blog posts

## Usage

### Basic Usage
```astro
---
import { ShareButtons } from '../features/social-share';
---
<ShareButtons url={Astro.url.href} title="Page Title" />
```

### Blog Posts with Full Functionality
```astro
---
import { ShareButtons, ShareMessage, CopyToast } from '../features/social-share';
---
<ShareButtons 
  url={postUrl} 
  title={title} 
  description={description}
  hashtags={tags}
/>
<ShareMessage 
  title={title} 
  description={description} 
  url={postUrl} 
  tags={tags} 
/>
<CopyToast />
```

### Compact Variant
```astro
---
import { ShareButtons } from '../features/social-share';
---
<ShareButtons 
  url={url} 
  title={title} 
  compact={true}
  platforms={['copy', 'facebook', 'twitter']}
/>
```

### Individual Share Button
```astro
---
import { ShareButton } from '../features/social-share';
import { SocialPlatform } from '../features/social-share';
---
<ShareButton 
  platform={SocialPlatform.FACEBOOK}
  shareData={{ url, title, description }}
  variant="compact"
  size="sm"
/>
```

## Components

### ShareButtons (Main Component)
**Props:**
- `url: string` - URL to share (required)
- `title: string` - Title for sharing (required)
- `description?: string` - Optional description
- `hashtags?: string[]` - Optional hashtags array
- `compact?: boolean` - Compact layout (default: false)
- `showTitle?: boolean` - Show component title (default: true)
- `platforms?: SocialPlatform[]` - Platforms to show (default: all)

### ShareButton (Individual Button)
**Props:**
- `platform: SocialPlatform` - Platform to share to (required)
- `shareData: ShareData` - Share data object (required)
- `variant?: 'compact' | 'full'` - Button variant (default: 'full')
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `showLabel?: boolean` - Show platform label (default: true)
- `className?: string` - Additional CSS classes

### ShareMessage (Suggested Message)
**Props:**
- `title: string` - Post title (required)
- `description: string` - Post description (required)
- `url: string` - Post URL (required)
- `tags?: string[]` - Optional tags for hashtags

### CopyToast (Toast Notifications)
No props required. Listens for 'show-toast' custom events.

## Engine Functions

### Core Utilities
```typescript
// Generate share URL for specific platform
generateShareUrl(platform: SocialPlatform, data: ShareData): string

// Convert relative URL to absolute
makeAbsoluteUrl(url: string, baseUrl?: string): string

// Copy text to clipboard with result
copyToClipboard(text: string): Promise<ShareResult>

// Validate share data
validateShareData(data: Partial<ShareData>): data is ShareData

// Get device information
getDeviceInfo(): DeviceInfo

// Handle Facebook sharing with mobile support
handleFacebookShare(data: ShareData): void
```

### Client-side Scripts
```typescript
// Initialize share button event listeners
initializeShareButtons(): void

// Handle copy button clicks
handleCopyClick(event: Event): Promise<void>

// Handle Facebook button clicks
handleFacebookClick(event: Event): void
```

## Types

### Core Types
```typescript
enum SocialPlatform {
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  WHATSAPP = 'whatsapp',
  COPY = 'copy'
}

interface ShareData {
  readonly url: string;
  readonly title: string;
  readonly description?: string;
  readonly hashtags?: readonly string[];
}

interface ShareResult {
  readonly success: boolean;
  readonly platform: SocialPlatform;
  readonly message?: string;
  readonly error?: string;
}
```

## Configuration

### Default Platforms
```typescript
const DEFAULT_PLATFORMS = [
  SocialPlatform.COPY,
  SocialPlatform.FACEBOOK,
  SocialPlatform.TWITTER,
  SocialPlatform.LINKEDIN,
  SocialPlatform.WHATSAPP
];
```

### Platform Configuration
```typescript
const SOCIAL_CONFIGS: Record<SocialPlatform, SocialConfig> = {
  facebook: {
    name: 'Facebook',
    colors: { bg: '#699CF9', hover: '#5A8AE0', text: '#FFFFFF' },
    iconName: 'facebook',
    ariaLabel: 'Compartir en Facebook'
  },
  // ... other platforms
};
```

## Features

### Multi-platform Support
- **Facebook**: Web + mobile app integration
- **Twitter**: Text + hashtags + URL
- **LinkedIn**: Professional sharing
- **WhatsApp**: Mobile-optimized messaging
- **Copy**: Clipboard with toast feedback

### Mobile Optimization
- Native app detection and fallback
- Mobile-specific URLs for Facebook
- Touch-friendly button sizes
- Responsive layout

### Accessibility
- ARIA labels for all buttons
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast support

### TypeScript Integration
- Complete type safety
- Exported interfaces and enums
- Generic utility functions
- Strict null checks

## Testing

### Test Coverage
- **22 comprehensive tests** covering all functionality
- Unit tests for all utility functions
- Mock browser APIs (clipboard, navigator)
- Device detection testing
- URL generation validation
- Error handling scenarios

### Running Tests
```bash
npm run test -- social-share
```

## Error Handling

### Graceful Fallbacks
- Clipboard API unavailable → Show error toast
- Mobile app not installed → Fallback to web
- Invalid share data → Console warning
- Network errors → User notification

### Client-side Error Recovery
```typescript
try {
  await copyToClipboard(url);
  showSuccessToast('¡Enlace copiado!');
} catch (error) {
  showErrorToast('Error al copiar enlace');
}
```

## Migration Guide

### From Legacy System
```diff
- import ShareButtons from '../components/blog/share/ShareButtons.astro';
+ import { ShareButtons } from '../features/social-share';

- import { generateShareUrl } from '../components/blog/share/utils';
+ import { generateShareUrl } from '../features/social-share';
```

### Compatibility
All imports now use the new modular feature system. Legacy system has been fully migrated.

## AI Context
```yaml
feature_type: "social_share_system"
purpose: "multi_platform_content_sharing"
input_sources: ["post_metadata", "page_urls", "user_interactions"]
output_formats: ["share_urls", "native_app_intents", "clipboard_content"]
architecture: "modular_feature_plug_and_play"
mobile_optimization: "native_app_detection_fallback"
accessibility: "aria_labels_keyboard_navigation"
testing: "comprehensive_unit_integration_tests"
typescript_integration: "complete_type_safety"
dependencies: ["astro_components", "browser_apis", "social_platform_apis"]
key_files: ["index.ts", "components_directory", "engine_directory", "tests_directory"]
```
