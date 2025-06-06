/**
 * Main Application Script - Optimized Loading
 * Coordinates all JavaScript functionality with performance optimization
 */

import { initNavigation } from '../utils/navigation.ts';

// Critical scripts that need to load immediately
const CRITICAL_SCRIPTS = [
  'navigation'
];

// Non-critical scripts that can be deferred
const DEFERRED_SCRIPTS = [
  'social-share',
  'ui-interactions',
  'prefetch',
  'accessibility'
];

class AppManager {
  private loadedScripts = new Set<string>();

  constructor() {
    this.initCriticalScripts();
    this.scheduleDeferredScripts();
  }

  private initCriticalScripts(): void {
    try {
      // Initialize navigation immediately
      const navigationManager = initNavigation();
      this.loadedScripts.add('navigation');

      // Store reference globally for debugging (development only)
      if (import.meta.env.DEV) {
        (window as any).__navigationManager = navigationManager;
        console.log('🧭 Navigation manager initialized');
      }
    } catch (error) {
      console.error('Failed to initialize critical scripts:', error);
    }
  }

  private scheduleDeferredScripts(): void {
    // Use requestIdleCallback for non-critical scripts
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadDeferredScripts();
      }, { timeout: 3000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.loadDeferredScripts();
      }, 1000);
    }
  }

  private async loadDeferredScripts(): Promise<void> {
    const scriptPromises = DEFERRED_SCRIPTS.map(async (scriptName) => {
      try {
        switch (scriptName) {
          case 'social-share':
            await import('./social-share.ts');
            break;
          case 'ui-interactions':
            await import('./ui-interactions.ts');
            break;
          case 'prefetch':
            await import('./prefetch.ts');
            break;
          case 'accessibility':
            await import('./accessibility.ts');
            break;
        }
        this.loadedScripts.add(scriptName);
        console.log(` Loaded deferred script: ${scriptName}`);
      } catch (error) {
        console.warn(`Failed to load script ${scriptName}:`, error);
      }
    });

    await Promise.allSettled(scriptPromises);
    console.log(' All deferred scripts loaded');
  }

  public getLoadedScripts(): string[] {
    return Array.from(this.loadedScripts);
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new AppManager();

    // Store reference globally for debugging
    if (import.meta.env.DEV) {
      (window as any).__appManager = app;
    }
  });
} else {
  const app = new AppManager();

  if (import.meta.env.DEV) {
    (window as any).__appManager = app;
  }
}