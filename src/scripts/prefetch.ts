/**
 * Intelligent Prefetching System
 * Preloads critical resources based on user behavior and viewport
 */

interface PrefetchConfig {
  hoverDelay: number;
  viewportThreshold: number;
  maxConcurrentPrefetches: number;
  enableViewportPrefetch: boolean;
  enableHoverPrefetch: boolean;
}

class PrefetchManager {
  private config: PrefetchConfig;
  private prefetchedUrls = new Set<string>();
  private activePrefetches = new Set<string>();
  private intersectionObserver?: IntersectionObserver;
  private hoverTimeouts = new Map<string, number>();

  constructor(config: Partial<PrefetchConfig> = {}) {
    this.config = {
      hoverDelay: 100, // ms
      viewportThreshold: 0.1,
      maxConcurrentPrefetches: 3,
      enableViewportPrefetch: true,
      enableHoverPrefetch: true,
      ...config
    };

    this.init();
  }

  private init(): void {
    if (this.config.enableViewportPrefetch) {
      this.initViewportPrefetch();
    }

    if (this.config.enableHoverPrefetch) {
      this.initHoverPrefetch();
    }

    console.log(' Prefetch manager initialized');
  }

  private initViewportPrefetch(): void {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, skipping viewport prefetch');
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            const href = link.getAttribute('href');

            if (href && this.shouldPrefetch(href)) {
              this.prefetchUrl(href, 'viewport');
              this.intersectionObserver?.unobserve(link);
            }
          }
        });
      },
      {
        rootMargin: '100px 0px',
        threshold: this.config.viewportThreshold
      }
    );

    // Observe all internal links
    this.observeLinks();
  }

  private initHoverPrefetch(): void {
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;

      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || !this.shouldPrefetch(href)) return;

      // Clear any existing timeout for this URL
      const existingTimeout = this.hoverTimeouts.get(href);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout
      const timeoutId = window.setTimeout(() => {
        this.prefetchUrl(href, 'hover');
        this.hoverTimeouts.delete(href);
      }, this.config.hoverDelay);

      this.hoverTimeouts.set(href, timeoutId);
    });

    document.addEventListener('mouseout', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;

      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Clear timeout if user moves away quickly
      const timeoutId = this.hoverTimeouts.get(href);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.hoverTimeouts.delete(href);
      }
    });
  }

  private observeLinks(): void {
    const links = document.querySelectorAll('a[href^="/blog/"], a[href^="/"]');
    links.forEach((link) => {
      if (this.intersectionObserver) {
        this.intersectionObserver.observe(link);
      }
    });
  }

  private shouldPrefetch(href: string): boolean {
    // Skip if already prefetched
    if (this.prefetchedUrls.has(href)) return false;

    // Skip if currently prefetching
    if (this.activePrefetches.has(href)) return false;

    // Skip if too many concurrent prefetches
    if (this.activePrefetches.size >= this.config.maxConcurrentPrefetches) return false;

    // Skip external links
    if (href.startsWith('http') && !href.includes(window.location.hostname)) return false;

    // Skip anchors and fragments
    if (href.startsWith('#')) return false;

    // Skip current page
    if (href === window.location.pathname) return false;

    // Skip non-HTML resources
    if (/\.(pdf|jpg|jpeg|png|gif|webp|avif|svg|mp4|mp3|zip|doc|docx)$/i.test(href)) return false;

    return true;
  }

  private async prefetchUrl(href: string, trigger: 'hover' | 'viewport'): Promise<void> {
    if (!this.shouldPrefetch(href)) return;

    this.activePrefetches.add(href);

    try {
      // Check if link element already exists
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink) {
        this.prefetchedUrls.add(href);
        return;
      }

      // Create prefetch link
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.as = 'document';

      // Add to head
      document.head.appendChild(link);

      // Track success
      link.addEventListener('load', () => {
        this.prefetchedUrls.add(href);
        console.log(` Prefetched (${trigger}): ${href}`);
      });

      link.addEventListener('error', () => {
        console.warn(` Failed to prefetch: ${href}`);
      });

    } catch (error) {
      console.error(`Error prefetching ${href}:`, error);
    } finally {
      this.activePrefetches.delete(href);
    }
  }

  // Public method to manually prefetch a URL
  public prefetch(href: string): void {
    if (this.shouldPrefetch(href)) {
      this.prefetchUrl(href, 'hover');
    }
  }

  // Public method to get prefetch stats
  public getStats(): { prefetched: number; active: number } {
    return {
      prefetched: this.prefetchedUrls.size,
      active: this.activePrefetches.size
    };
  }

  // Clean up resources
  public destroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    this.hoverTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.hoverTimeouts.clear();
  }
}

// Initialize prefetch manager when DOM is ready
function initPrefetch(): void {
  // Only enable on fast connections
  const connection = (navigator as any).connection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.saveData
  );

  if (isSlowConnection) {
    console.log(' Slow connection detected, disabling prefetch');
    return;
  }

  const prefetchManager = new PrefetchManager({
    enableViewportPrefetch: true,
    enableHoverPrefetch: true,
    hoverDelay: 150,
    maxConcurrentPrefetches: 2
  });

  // Store globally for debugging
  if (import.meta.env.DEV) {
    (window as any).__prefetchManager = prefetchManager;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPrefetch);
} else {
  initPrefetch();
}

export { PrefetchManager };
