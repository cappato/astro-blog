/**
 * Navigation System Utilities
 * Centralized navigation logic with configuration-driven behavior
 * 
 * Features:
 * - Mobile menu management
 * - Smooth scroll with configurable offsets
 * - Active section detection
 * - Performance optimized with debouncing
 * - TypeScript strict typing
 */

import { NAVIGATION_CONFIG } from '../config/site.ts';

export type NavigationSection = string;
export type ScrollDirection = 'up' | 'down';

export interface NavigationState {
  activeSection: NavigationSection | null;
  isMenuOpen: boolean;
  scrollDirection: ScrollDirection;
  lastScrollY: number;
}

export interface NavigationElements {
  mobileMenuButton: HTMLElement | null;
  mobileMenu: HTMLElement | null;
  closeMenuButton: HTMLElement | null;
  mobileMenuLinks: NodeListOf<Element>;
  navLinks: NodeListOf<Element>;
  sections: NodeListOf<Element>;
}

/**
 * Navigation Manager Class
 * Handles all navigation-related functionality with centralized configuration
 */
export class NavigationManager {
  private state: NavigationState;
  private elements: NavigationElements;
  private config = NAVIGATION_CONFIG.behavior;
  private scrollTimeout: number | null = null;
  private detectionInterval: number | null = null;

  constructor() {
    this.state = {
      activeSection: null,
      isMenuOpen: false,
      scrollDirection: 'down',
      lastScrollY: 0
    };

    this.elements = this.getNavigationElements();
  }

  /**
   * Initialize all navigation functionality
   */
  public init(): void {
    this.initMobileMenu();
    this.initSmoothScroll();
    this.initSectionDetection();
  }

  /**
   * Get all navigation-related DOM elements
   */
  private getNavigationElements(): NavigationElements {
    return {
      mobileMenuButton: document.getElementById('mobile-menu-button'),
      mobileMenu: document.getElementById('mobile-menu'),
      closeMenuButton: document.getElementById('close-menu'),
      mobileMenuLinks: document.querySelectorAll('.nav-link-mobile'),
      navLinks: document.querySelectorAll('.nav-link, .nav-link-mobile'),
      sections: document.querySelectorAll('section[id]')
    };
  }

  /**
   * Initialize mobile menu functionality
   */
  private initMobileMenu(): void {
    const { mobileMenuButton, mobileMenu, closeMenuButton, mobileMenuLinks } = this.elements;

    if (!mobileMenuButton || !mobileMenu || !closeMenuButton) {
      console.warn('NavigationManager: Mobile menu elements not found');
      return;
    }

    // Open menu
    mobileMenuButton.addEventListener('click', () => this.openMobileMenu());

    // Close menu
    closeMenuButton.addEventListener('click', () => this.closeMobileMenu());

    // Close menu when clicking on links
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  /**
   * Open mobile menu
   */
  private openMobileMenu(): void {
    const { mobileMenu } = this.elements;
    if (!mobileMenu) return;

    mobileMenu.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    this.state.isMenuOpen = true;

    // Focus management for accessibility
    const firstLink = mobileMenu.querySelector('.nav-link-mobile') as HTMLElement;
    firstLink?.focus();
  }

  /**
   * Close mobile menu
   */
  private closeMobileMenu(): void {
    const { mobileMenu } = this.elements;
    if (!mobileMenu) return;

    mobileMenu.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    this.state.isMenuOpen = false;
  }

  /**
   * Initialize smooth scroll functionality
   */
  private initSmoothScroll(): void {
    const { navLinks } = this.elements;

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href?.startsWith('#')) {
        link.addEventListener('click', (e) => this.handleSmoothScroll(e));
      }
    });
  }

  /**
   * Handle smooth scroll to section
   */
  private handleSmoothScroll(e: Event): void {
    e.preventDefault();
    const target = e.currentTarget as HTMLAnchorElement;
    const href = target.getAttribute('href');

    if (!href?.startsWith('#')) return;

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      this.scrollToSection(targetId, targetElement);

      // Update URL without hash to keep it clean
      const url = new URL(window.location.href);
      url.hash = '';
      window.history.replaceState({}, '', url.toString());
    }
  }

  /**
   * Scroll to specific section with configured offset
   */
  private scrollToSection(sectionId: string, element: HTMLElement): void {
    const baseOffset = this.config.navbarHeight;
    const sectionOffset = this.config.sectionOffsets[sectionId as keyof typeof this.config.sectionOffsets] 
      || this.config.sectionOffsets.default;
    
    const totalOffset = baseOffset + sectionOffset;
    const targetPosition = element.getBoundingClientRect().top + window.scrollY - totalOffset;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    // Close mobile menu if open
    if (this.state.isMenuOpen) {
      this.closeMobileMenu();
    }
  }

  /**
   * Initialize section detection for active link highlighting
   */
  private initSectionDetection(): void {
    // Debounced scroll handler
    const handleScroll = () => {
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }

      this.scrollTimeout = window.setTimeout(() => {
        this.updateScrollDirection();
        this.updateActiveSection();
      }, this.config.performance.scrollDebounce);
    };

    // Regular interval for precise detection
    this.detectionInterval = window.setInterval(() => {
      this.updateActiveSection();
    }, this.config.performance.detectionInterval);

    window.addEventListener('scroll', handleScroll);
    
    // Initial detection
    this.updateActiveSection();
  }

  /**
   * Update scroll direction tracking
   */
  private updateScrollDirection(): void {
    const currentScrollY = window.scrollY;
    this.state.scrollDirection = currentScrollY > this.state.lastScrollY ? 'down' : 'up';
    this.state.lastScrollY = currentScrollY;
  }

  /**
   * Update active section based on scroll position
   */
  private updateActiveSection(): void {
    const { sections } = this.elements;
    const { scrollThresholds } = this.config;
    
    let currentSection = '';

    // Check if at bottom of page
    const isAtBottom = (window.innerHeight + window.scrollY) >= 
      document.body.offsetHeight - scrollThresholds.bottomDetection;

    if (isAtBottom) {
      currentSection = 'contact';
    } else {
      // Find current section based on viewport position
      sections.forEach(section => {
        const sectionId = section.getAttribute('id');
        if (!sectionId) return;

        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionBottom = sectionTop + (section as HTMLElement).offsetHeight;

        if (sectionTop <= scrollThresholds.sectionDetection && sectionBottom > 0) {
          currentSection = sectionId;
        }
      });

      // Default to 'about' if near top
      if (window.scrollY < scrollThresholds.minScroll) {
        currentSection = 'about';
      }
    }

    // Update active state if changed
    if (currentSection !== this.state.activeSection) {
      this.state.activeSection = currentSection;
      this.updateActiveLinks(currentSection);
    }
  }

  /**
   * Update active link styling
   */
  private updateActiveLinks(activeSection: string): void {
    const { navLinks } = this.elements;

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href?.startsWith('#')) return;

      const linkTarget = href.substring(1);
      
      if (linkTarget === activeSection) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Get current navigation state (for debugging/testing)
   */
  public getState(): NavigationState {
    return { ...this.state };
  }

  /**
   * Cleanup event listeners and intervals
   */
  public destroy(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
  }
}

/**
 * Initialize navigation system
 * Call this function when DOM is ready
 */
export function initNavigation(): NavigationManager {
  const manager = new NavigationManager();
  manager.init();
  return manager;
}
