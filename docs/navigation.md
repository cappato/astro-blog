# Navigation

## Purpose
Unified navigation system with mobile menu, smooth scroll, and active section detection. Centralizes configuration, eliminates magic numbers, and provides modular architecture with performance optimization.

## Architecture
Configuration-driven NavigationManager class with debounced scroll detection and centralized behavior settings.

## Files
- `src/utils/navigation.ts` - NavigationManager class and utilities
- `src/scripts/navigation.ts` - Navigation initialization script
- `src/config/site.ts` - NAVIGATION_CONFIG centralized configuration
- `src/components/layout/navbar/HomeNavbar.astro` - Home navigation component
- `src/components/layout/navbar/BaseNavbar.astro` - Base navbar component
- `src/components/layout/navigation/NavLink.astro` - Navigation link component

## Usage

### Home Navigation
```astro
---
import { NAVIGATION_CONFIG } from '../../../config/site.ts';

const navItems = NAVIGATION_CONFIG.homeNavItems;
---
<BaseNavbar>
  <div slot="navigation" class="hidden md:block">
    <nav class="flex space-x-8">
      {navItems.map(item => (
        <NavLink href={item.href} class="nav-link">
          {item.label}
        </NavLink>
      ))}
    </nav>
  </div>
</BaseNavbar>
```

### Navigation Script
```typescript
import { initNavigation } from '../utils/navigation.ts';

document.addEventListener('DOMContentLoaded', () => {
  try {
    const navigationManager = initNavigation();
    
    // Store reference globally for debugging (development only)
    if (import.meta.env.DEV) {
      (window as any).__navigationManager = navigationManager;
    }
  } catch (error) {
    console.error('Failed to initialize navigation:', error);
  }
});
```

### Manual Usage
```typescript
import { NavigationManager } from '../utils/navigation.ts';

// Create and initialize
const navManager = new NavigationManager();
navManager.init();

// Get current state (for debugging)
const state = navManager.getState();
console.log('Active section:', state.activeSection);

// Cleanup when needed
navManager.destroy();
```

## Configuration

### NAVIGATION_CONFIG
```typescript
export const NAVIGATION_CONFIG = {
  homeNavItems: [
    { href: "#about", label: "About me", section: "about" },
    { href: "#experience", label: "Experience", section: "experience" },
    { href: "#education", label: "Education", section: "education" },
    { href: "#skills", label: "Skills", section: "skills" },
    { href: "#achievements", label: "Achievements", section: "achievements" },
    { href: "#hobbies", label: "Hobbies", section: "hobbies" },
    { href: "#contact", label: "Contact", section: "contact" }
  ],
  
  behavior: {
    navbarHeight: 80,
    sectionOffsets: {
      about: 20,    // About section needs extra offset
      default: 0    // Default offset for other sections
    },
    scrollThresholds: {
      minScroll: 300,        // Minimum scroll to activate section detection
      sectionDetection: 100, // Section detection viewport offset
      bottomDetection: 100   // Bottom detection offset
    },
    performance: {
      detectionInterval: 100, // Section detection interval (ms)
      scrollDebounce: 16     // Scroll debounce delay (ms) - ~60fps
    }
  }
} as const;
```

### Legacy Compatibility
```typescript
export const NAVIGATION = {
  main: NAVIGATION_CONFIG.mainNavItems,
  footer: NAVIGATION_CONFIG.footerNavItems
} as const;
```

## NavigationManager Class

### Core Architecture
```typescript
export class NavigationManager {
  private state: NavigationState;
  private elements: NavigationElements;
  private config = NAVIGATION_CONFIG.behavior;
  
  public init(): void {
    this.initMobileMenu();
    this.initSmoothScroll();
    this.initSectionDetection();
  }
  
  private scrollToSection(sectionId: string, element: HTMLElement): void {
    const baseOffset = this.config.navbarHeight;
    const sectionOffset = this.config.sectionOffsets[sectionId] || this.config.sectionOffsets.default;
    const totalOffset = baseOffset + sectionOffset;
    
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY - totalOffset,
      behavior: 'smooth'
    });
  }
}
```

### Performance Optimized Detection
```typescript
private initSectionDetection(): void {
  const handleScroll = () => {
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    this.scrollTimeout = window.setTimeout(() => {
      this.updateScrollDirection();
      this.updateActiveSection();
    }, this.config.performance.scrollDebounce);
  };

  this.detectionInterval = window.setInterval(() => {
    this.updateActiveSection();
  }, this.config.performance.detectionInterval);

  window.addEventListener('scroll', handleScroll);
}
```

### Mobile Menu Management
```typescript
private openMobileMenu(): void {
  mobileMenu.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  this.state.isMenuOpen = true;
  
  // Focus management for accessibility
  const firstLink = mobileMenu.querySelector('.nav-link-mobile') as HTMLElement;
  firstLink?.focus();
}

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && this.state.isMenuOpen) {
    this.closeMobileMenu();
  }
});
```

### Smart Section Detection
```typescript
// Bottom-of-page detection
const isAtBottom = (window.innerHeight + window.scrollY) >= 
  document.body.offsetHeight - scrollThresholds.bottomDetection;

if (isAtBottom) {
  currentSection = 'contact';
} else {
  // Viewport-based section detection
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= scrollThresholds.sectionDetection && rect.bottom > 0) {
      currentSection = section.id;
    }
  });
}
```

## Extension

### Adding New Navigation Items
1. Add items to `NAVIGATION_CONFIG.homeNavItems`
2. Ensure corresponding sections exist with matching IDs
3. Configure custom offsets in `sectionOffsets` if needed

### Custom Scroll Behavior
1. Modify `behavior.navbarHeight` for different navbar heights
2. Add section-specific offsets in `sectionOffsets`
3. Adjust `scrollThresholds` for different detection sensitivity

### Performance Tuning
1. Adjust `detectionInterval` for detection frequency
2. Modify `scrollDebounce` for scroll responsiveness
3. Customize `scrollThresholds` for viewport behavior

## AI Context
```yaml
feature_type: "navigation"
purpose: "navigation_management"
input_sources: ["navigation_config", "dom_elements", "scroll_events"]
output_formats: ["active_links", "smooth_scroll", "mobile_menu"]
architecture: "class_based_manager"
configuration_driven: "NAVIGATION_CONFIG"
performance_optimization: ["debounced_scroll", "interval_detection"]
accessibility_features: ["keyboard_navigation", "focus_management", "aria_support"]
eliminated_magic_numbers: ["scroll_offsets", "detection_thresholds", "performance_timings"]
backward_compatibility: "NAVIGATION_legacy"
dependencies: ["site_config", "navbar_components", "navigation_links"]
key_files: ["navigation.ts", "navigation.ts", "site.ts", "HomeNavbar.astro"]
```
