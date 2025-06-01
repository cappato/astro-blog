/**
 * Navigation Script - Entry Point
 * Uses the centralized NavigationManager for all navigation functionality
 */

import { initNavigation } from '../utils/navigation.ts';

// Initialize navigation when DOM is ready
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