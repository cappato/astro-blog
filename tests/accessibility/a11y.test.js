/**
 * Accessibility Testing with axe-core
 * 
 * Replaces custom accessibility testing with industry-standard axe-core.
 * Provides comprehensive WCAG 2.1 AA compliance testing.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Test configuration
const PAGES_TO_TEST = [
  { name: 'Homepage', url: '/' },
  { name: 'Blog Index', url: '/blog' },
  { name: 'Blog Post', url: '/blog/dark-mode-perfecto-astro' },
  { name: 'About Page', url: '/about' }
];

// axe-core configuration
const AXE_CONFIG = {
  // WCAG 2.1 AA compliance
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  
  // Rules to include
  rules: {
    // Color contrast
    'color-contrast': { enabled: true },
    'color-contrast-enhanced': { enabled: true },
    
    // Images
    'image-alt': { enabled: true },
    'image-redundant-alt': { enabled: true },
    
    // Forms
    'label': { enabled: true },
    'label-title-only': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    
    // Headings
    'heading-order': { enabled: true },
    'empty-heading': { enabled: true },
    
    // Links
    'link-name': { enabled: true },
    'link-in-text-block': { enabled: true },
    
    // Keyboard navigation
    'focus-order-semantics': { enabled: true },
    'focusable-content': { enabled: true },
    
    // ARIA
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-attr': { enabled: true },
    
    // Language
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'valid-lang': { enabled: true }
  }
};

// Test each page for accessibility
for (const page of PAGES_TO_TEST) {
  test.describe(`Accessibility: ${page.name}`, () => {
    
    test('should not have any automatically detectable accessibility issues', async ({ page: playwright }) => {
      // Navigate to page
      await playwright.goto(page.url);
      
      // Wait for page to load completely
      await playwright.waitForLoadState('networkidle');
      
      // Run axe-core accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page: playwright })
        .withTags(AXE_CONFIG.tags)
        .analyze();
      
      // Assert no violations
      expect(accessibilityScanResults.violations).toEqual([]);
    });
    
    test('should have proper heading hierarchy', async ({ page: playwright }) => {
      await playwright.goto(page.url);
      await playwright.waitForLoadState('networkidle');
      
      // Check heading hierarchy
      const headings = await playwright.locator('h1, h2, h3, h4, h5, h6').all();
      const headingLevels = [];
      
      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const level = parseInt(tagName.charAt(1));
        headingLevels.push(level);
      }
      
      // Verify heading hierarchy (should start with h1 and not skip levels)
      if (headingLevels.length > 0) {
        expect(headingLevels[0]).toBe(1); // First heading should be h1
        
        for (let i = 1; i < headingLevels.length; i++) {
          const currentLevel = headingLevels[i];
          const previousLevel = headingLevels[i - 1];
          
          // Should not skip more than one level
          expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
        }
      }
    });
    
    test('should have proper alt text for images', async ({ page: playwright }) => {
      await playwright.goto(page.url);
      await playwright.waitForLoadState('networkidle');
      
      // Get all images
      const images = await playwright.locator('img').all();
      
      for (const image of images) {
        const alt = await image.getAttribute('alt');
        const src = await image.getAttribute('src');
        
        // Images should have alt text (can be empty for decorative images)
        expect(alt).not.toBeNull();
        
        // If image has meaningful src, alt should not be just the filename
        if (src && !src.includes('data:')) {
          const filename = src.split('/').pop()?.split('.')[0] || '';
          if (alt && filename) {
            expect(alt.toLowerCase()).not.toBe(filename.toLowerCase());
          }
        }
      }
    });
    
    test('should have proper form labels', async ({ page: playwright }) => {
      await playwright.goto(page.url);
      await playwright.waitForLoadState('networkidle');
      
      // Get all form inputs
      const inputs = await playwright.locator('input, textarea, select').all();
      
      for (const input of inputs) {
        const type = await input.getAttribute('type');
        
        // Skip hidden inputs
        if (type === 'hidden') continue;
        
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');
        
        // Input should have proper labeling
        const hasLabel = id && await playwright.locator(`label[for="${id}"]`).count() > 0;
        const hasAriaLabel = ariaLabel && ariaLabel.trim().length > 0;
        const hasAriaLabelledby = ariaLabelledby && ariaLabelledby.trim().length > 0;
        
        expect(hasLabel || hasAriaLabel || hasAriaLabelledby).toBe(true);
      }
    });
    
    test('should have proper keyboard navigation', async ({ page: playwright }) => {
      await playwright.goto(page.url);
      await playwright.waitForLoadState('networkidle');
      
      // Get all focusable elements
      const focusableElements = await playwright.locator(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      ).all();
      
      // Test tab navigation
      if (focusableElements.length > 0) {
        // Focus first element
        await focusableElements[0].focus();
        
        // Tab through elements
        for (let i = 1; i < Math.min(focusableElements.length, 5); i++) {
          await playwright.keyboard.press('Tab');
          
          // Verify focus is visible
          const focusedElement = await playwright.locator(':focus').first();
          await expect(focusedElement).toBeVisible();
        }
      }
    });
    
    test('should have proper color contrast', async ({ page: playwright }) => {
      await playwright.goto(page.url);
      await playwright.waitForLoadState('networkidle');
      
      // Run specific color contrast check
      const colorContrastResults = await new AxeBuilder({ page: playwright })
        .include('body')
        .withRules(['color-contrast'])
        .analyze();
      
      expect(colorContrastResults.violations).toEqual([]);
    });
    
    test('should have proper ARIA attributes', async ({ page: playwright }) => {
      await playwright.goto(page.url);
      await playwright.waitForLoadState('networkidle');
      
      // Run ARIA-specific checks
      const ariaResults = await new AxeBuilder({ page: playwright })
        .include('body')
        .withTags(['wcag2a', 'wcag2aa'])
        .withRules([
          'aria-allowed-attr',
          'aria-required-attr',
          'aria-valid-attr-value',
          'aria-valid-attr'
        ])
        .analyze();
      
      expect(ariaResults.violations).toEqual([]);
    });
  });
}

// Test for mobile accessibility
test.describe('Mobile Accessibility', () => {
  test('should be accessible on mobile devices', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test only runs on mobile');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Run accessibility scan for mobile
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('should have proper touch targets on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test only runs on mobile');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check touch target sizes (minimum 44x44px)
    const touchTargets = await page.locator('a, button, input[type="button"], input[type="submit"]').all();
    
    for (const target of touchTargets) {
      const box = await target.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
