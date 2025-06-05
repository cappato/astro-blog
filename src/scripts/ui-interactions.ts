/**
 * Consolidated UI Interactions Script
 * Handles collapsible content, keyboard navigation, and other UI interactions
 */

class UIInteractionsManager {
  private initialized = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.initialized) return;
    
    // Initialize all UI interactions
    this.initCollapsibleContent();
    this.initKeyboardNavigation();
    this.initAccessibilityFeatures();
    
    this.initialized = true;
    console.log('🎛️ UI interactions manager initialized');
  }

  private initCollapsibleContent(): void {
    // Experience cards collapsible functionality
    const toggleButtons = document.querySelectorAll('.collapsible-toggle');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const content = button.closest('.collapsible-content');
        if (!content) return;

        const items = content.querySelectorAll('.collapsible-item');
        const gradient = content.querySelector('.collapsible-gradient') as HTMLElement;
        const toggleText = button.querySelector('.toggle-text') as HTMLElement;
        const toggleIcon = button.querySelector('.toggle-icon') as HTMLElement;
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
          // Collapse
          items.forEach(item => item.classList.add('hidden'));
          if (gradient) gradient.classList.remove('hidden');
          if (toggleText) {
            const hiddenCount = items.length;
            toggleText.textContent = `Show more (${hiddenCount} more)`;
          }
          if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
          button.setAttribute('aria-expanded', 'false');
        } else {
          // Expand
          items.forEach(item => item.classList.remove('hidden'));
          if (gradient) gradient.classList.add('hidden');
          if (toggleText) toggleText.textContent = 'Show less';
          if (toggleIcon) toggleIcon.style.transform = 'rotate(180deg)';
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  private initKeyboardNavigation(): void {
    // Enhanced keyboard navigation for social links and interactive elements
    const socialLinks = document.querySelectorAll('.footer-social-link, [role="button"]');

    socialLinks.forEach((element) => {
      element.addEventListener('keydown', (e) => {
        if (e instanceof KeyboardEvent && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          if (element instanceof HTMLElement) {
            element.click();
          }
        }
      });
    });

    // Skip to content functionality
    const skipLink = document.querySelector('a[href="#main-content"]');
    const mainContent = document.getElementById('main-content');
    
    if (skipLink && mainContent) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  private initAccessibilityFeatures(): void {
    // Add focus indicators for better accessibility
    const interactiveElements = document.querySelectorAll('button, a, input, textarea, select');
    
    interactiveElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.classList.add('focus-visible');
      });
      
      element.addEventListener('blur', () => {
        element.classList.remove('focus-visible');
      });
    });

    // Announce dynamic content changes to screen readers
    this.setupAriaLiveRegions();
  }

  private setupAriaLiveRegions(): void {
    // Create aria-live region for dynamic announcements
    let liveRegion = document.getElementById('aria-live-region');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    // Function to announce messages
    (window as any).announceToScreenReader = (message: string) => {
      if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => {
          liveRegion!.textContent = '';
        }, 1000);
      }
    };
  }

  // Public method to handle dynamic content updates
  public handleContentUpdate(type: 'expand' | 'collapse', itemCount?: number): void {
    const message = type === 'expand' 
      ? `Content expanded, showing all items`
      : `Content collapsed, showing first 4 of ${itemCount} items`;
    
    (window as any).announceToScreenReader?.(message);
  }
}

// Lazy loading for non-critical interactions
function initUIInteractions(): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      new UIInteractionsManager();
    }, { timeout: 2000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      new UIInteractionsManager();
    }, 100);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUIInteractions);
} else {
  initUIInteractions();
}

// Export for potential external use
(window as any).__uiInteractionsManager = UIInteractionsManager;
