/**
 * Accessibility Enhancement Script
 * Improves keyboard navigation, screen reader support, and WCAG compliance
 */

interface AccessibilityConfig {
  enableKeyboardTraps: boolean;
  enableFocusManagement: boolean;
  enableAriaLiveRegions: boolean;
  enableSkipLinks: boolean;
  announcePageChanges: boolean;
}

class AccessibilityManager {
  private config: AccessibilityConfig;
  private liveRegion: HTMLElement | null = null;
  private skipLinks: HTMLElement[] = [];
  private focusableElements: string = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

  constructor(config: Partial<AccessibilityConfig> = {}) {
    this.config = {
      enableKeyboardTraps: true,
      enableFocusManagement: true,
      enableAriaLiveRegions: true,
      enableSkipLinks: true,
      announcePageChanges: true,
      ...config
    };

    this.init();
  }

  private init(): void {
    if (this.config.enableAriaLiveRegions) {
      this.setupAriaLiveRegions();
    }

    if (this.config.enableSkipLinks) {
      this.enhanceSkipLinks();
    }

    if (this.config.enableFocusManagement) {
      this.setupFocusManagement();
    }

    if (this.config.enableKeyboardTraps) {
      this.setupKeyboardTraps();
    }

    this.setupKeyboardNavigation();
    this.enhanceFormAccessibility();
    this.setupReducedMotion();

    console.log('♿ Accessibility manager initialized');
  }

  private setupAriaLiveRegions(): void {
    // Create main live region for announcements
    this.liveRegion = document.createElement('div');
    this.liveRegion.id = 'aria-live-region';
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    document.body.appendChild(this.liveRegion);

    // Create assertive live region for urgent announcements
    const assertiveRegion = document.createElement('div');
    assertiveRegion.id = 'aria-live-assertive';
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'sr-only';
    document.body.appendChild(assertiveRegion);
  }

  private enhanceSkipLinks(): void {
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    
    skipLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const targetId = href.substring(1);
      const target = document.getElementById(targetId);

      if (target) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Make target focusable if it isn't already
          if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
          }

          // Focus the target
          target.focus();

          // Scroll to target with smooth behavior
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });

          // Announce the navigation
          this.announce(`Navigated to ${target.textContent?.trim() || targetId}`);
        });

        this.skipLinks.push(link as HTMLElement);
      }
    });
  }

  private setupFocusManagement(): void {
    // Enhanced focus indicators
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      if (target) {
        target.classList.add('focus-visible');
      }
    });

    document.addEventListener('focusout', (e) => {
      const target = e.target as HTMLElement;
      if (target) {
        target.classList.remove('focus-visible');
      }
    });

    // Focus management for dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              
              // Auto-focus first focusable element in new content
              const firstFocusable = element.querySelector(this.focusableElements) as HTMLElement;
              if (firstFocusable && element.hasAttribute('data-auto-focus')) {
                setTimeout(() => firstFocusable.focus(), 100);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private setupKeyboardTraps(): void {
    // Modal/dialog keyboard trap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const modal = document.querySelector('[role="dialog"]:not(.hidden)') as HTMLElement;
        if (modal) {
          this.trapFocus(e, modal);
        }
      }
    });
  }

  private trapFocus(e: KeyboardEvent, container: HTMLElement): void {
    const focusableElements = container.querySelectorAll(this.focusableElements) as NodeListOf<HTMLElement>;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  private setupKeyboardNavigation(): void {
    // Enhanced keyboard navigation for custom components
    document.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement;

      // Arrow key navigation for card grids
      if (target.closest('.pillar-grid, .blog-grid')) {
        this.handleGridNavigation(e, target);
      }

      // Enter/Space activation for custom buttons
      if ((e.key === 'Enter' || e.key === ' ') && target.hasAttribute('role') && target.getAttribute('role') === 'button') {
        e.preventDefault();
        target.click();
      }
    });
  }

  private handleGridNavigation(e: KeyboardEvent, target: HTMLElement): void {
    const grid = target.closest('.pillar-grid, .blog-grid');
    if (!grid) return;

    const items = Array.from(grid.querySelectorAll('a, button')) as HTMLElement[];
    const currentIndex = items.indexOf(target);

    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
        newIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
        // Assume 3 columns for grid navigation
        newIndex = Math.min(currentIndex + 3, items.length - 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - 3, 0);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      e.preventDefault();
      items[newIndex].focus();
    }
  }

  private enhanceFormAccessibility(): void {
    // Auto-enhance form fields
    const forms = document.querySelectorAll('form');
    
    forms.forEach((form) => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach((input) => {
        // Add required indicator to labels
        if (input.hasAttribute('required')) {
          const label = form.querySelector(`label[for="${input.id}"]`);
          if (label && !label.querySelector('.required-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'required-indicator sr-only';
            indicator.textContent = ' (required)';
            label.appendChild(indicator);
          }
        }

        // Enhanced error handling
        input.addEventListener('invalid', (e) => {
          const target = e.target as HTMLInputElement;
          this.announce(`Error in ${target.labels?.[0]?.textContent || 'form field'}: ${target.validationMessage}`);
        });
      });
    });
  }

  private setupReducedMotion(): void {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMotionPreference = (mediaQuery: MediaQueryList) => {
      if (mediaQuery.matches) {
        document.documentElement.classList.add('reduce-motion');
        this.announce('Reduced motion enabled');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    };

    handleMotionPreference(prefersReducedMotion);
    prefersReducedMotion.addEventListener('change', handleMotionPreference);
  }

  // Public method to announce messages to screen readers
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const regionId = priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-region';
    const region = document.getElementById(regionId);
    
    if (region) {
      region.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }

  // Public method to enhance dynamic content
  public enhanceContent(container: HTMLElement): void {
    // Add focus management to new content
    const focusableElements = container.querySelectorAll(this.focusableElements);
    
    focusableElements.forEach((element) => {
      if (!element.hasAttribute('tabindex') && element.tagName !== 'A' && element.tagName !== 'BUTTON') {
        element.setAttribute('tabindex', '0');
      }
    });

    this.announce(`New content loaded: ${container.getAttribute('aria-label') || 'content updated'}`);
  }
}

// Initialize accessibility manager
function initAccessibility(): void {
  const accessibilityManager = new AccessibilityManager({
    enableKeyboardTraps: true,
    enableFocusManagement: true,
    enableAriaLiveRegions: true,
    enableSkipLinks: true,
    announcePageChanges: true
  });

  // Store globally for external use
  (window as any).__accessibilityManager = accessibilityManager;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAccessibility);
} else {
  initAccessibility();
}

export { AccessibilityManager };
