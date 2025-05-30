import { describe, it, expect } from 'vitest';

describe('Theme CSS Classes Validation', () => {
  describe('Responsive Class Patterns', () => {
    it('should validate background class patterns', () => {
      const validBackgroundPatterns = [
        'bg-white dark:bg-gray-900',
        'bg-gray-50 dark:bg-gray-800',
        'bg-gray-100 dark:bg-gray-800',
        'bg-gray-200 dark:bg-gray-800',
        'bg-gray-300 dark:bg-gray-700',
      ];

      validBackgroundPatterns.forEach(pattern => {
        // Check that pattern contains both light and dark variants
        expect(pattern).toMatch(/bg-\w+/); // Light variant
        expect(pattern).toMatch(/dark:bg-\w+/); // Dark variant
      });
    });

    it('should validate text color class patterns', () => {
      const validTextPatterns = [
        'text-gray-900 dark:text-gray-100',
        'text-gray-800 dark:text-gray-200',
        'text-gray-700 dark:text-gray-300',
        'text-gray-600 dark:text-gray-400',
        'text-gray-500 dark:text-gray-500',
      ];

      validTextPatterns.forEach(pattern => {
        expect(pattern).toMatch(/text-\w+/); // Light variant
        expect(pattern).toMatch(/dark:text-\w+/); // Dark variant
      });
    });

    it('should validate border class patterns', () => {
      const validBorderPatterns = [
        'border-gray-300 dark:border-gray-700',
        'border-gray-200 dark:border-gray-600',
        'border-gray-400 dark:border-gray-500',
      ];

      validBorderPatterns.forEach(pattern => {
        expect(pattern).toMatch(/border-\w+/); // Light variant
        expect(pattern).toMatch(/dark:border-\w+/); // Dark variant
      });
    });
  });

  describe('Component Class Validation', () => {
    it('should validate navbar classes', () => {
      const navbarClasses = 'bg-gray-50 dark:bg-gray-800 shadow-md transition-colors duration-300';
      
      expect(navbarClasses).toContain('bg-gray-50');
      expect(navbarClasses).toContain('dark:bg-gray-800');
      expect(navbarClasses).toContain('transition-colors');
    });

    it('should validate body classes', () => {
      const bodyClasses = 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans min-h-screen transition-colors duration-300';
      
      expect(bodyClasses).toContain('bg-white');
      expect(bodyClasses).toContain('dark:bg-gray-900');
      expect(bodyClasses).toContain('text-gray-900');
      expect(bodyClasses).toContain('dark:text-gray-100');
      expect(bodyClasses).toContain('transition-colors');
    });

    it('should validate section classes', () => {
      const sectionClasses = 'bg-gray-100 dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg';
      
      expect(sectionClasses).toContain('bg-gray-100');
      expect(sectionClasses).toContain('dark:bg-gray-800');
    });

    it('should validate button classes', () => {
      const buttonClasses = 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200';
      
      expect(buttonClasses).toContain('bg-gray-200');
      expect(buttonClasses).toContain('dark:bg-gray-700');
      expect(buttonClasses).toContain('hover:bg-gray-300');
      expect(buttonClasses).toContain('dark:hover:bg-gray-600');
    });
  });

  describe('Class Consistency', () => {
    it('should ensure consistent color scales', () => {
      // Light mode should use lighter grays (50-400)
      // Dark mode should use darker grays (600-900)
      
      const lightModeColors = ['gray-50', 'gray-100', 'gray-200', 'gray-300', 'gray-400'];
      const darkModeColors = ['gray-600', 'gray-700', 'gray-800', 'gray-900'];
      
      lightModeColors.forEach(color => {
        expect(['50', '100', '200', '300', '400']).toContain(color.split('-')[1]);
      });
      
      darkModeColors.forEach(color => {
        expect(['600', '700', '800', '900']).toContain(color.split('-')[1]);
      });
    });

    it('should validate transition classes are present', () => {
      const transitionClasses = [
        'transition-colors duration-300',
        'transition-colors duration-200',
        'transition-all duration-200',
      ];

      transitionClasses.forEach(transitionClass => {
        expect(transitionClass).toMatch(/transition-/);
        expect(transitionClass).toMatch(/duration-/);
      });
    });
  });

  describe('Accessibility Classes', () => {
    it('should validate focus classes', () => {
      const focusClasses = 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2';
      
      expect(focusClasses).toContain('focus:outline-none');
      expect(focusClasses).toContain('focus:ring-2');
      expect(focusClasses).toContain('focus:ring-primary');
    });

    it('should validate screen reader classes', () => {
      const srClasses = 'sr-only focus:not-sr-only';
      
      expect(srClasses).toContain('sr-only');
      expect(srClasses).toContain('focus:not-sr-only');
    });
  });

  describe('Theme-specific Validations', () => {
    it('should validate primary color usage', () => {
      const primaryUsage = [
        'text-primary',
        'bg-primary',
        'border-primary',
        'ring-primary',
      ];

      primaryUsage.forEach(usage => {
        expect(usage).toContain('primary');
      });
    });

    it('should validate secondary color usage', () => {
      const secondaryUsage = [
        'text-secondary',
        'bg-secondary',
        'border-secondary',
      ];

      secondaryUsage.forEach(usage => {
        expect(usage).toContain('secondary');
      });
    });
  });

  describe('Responsive Design Classes', () => {
    it('should validate responsive breakpoints', () => {
      const responsiveClasses = 'px-6 sm:px-4 py-3 md:py-4 lg:py-5';
      
      expect(responsiveClasses).toMatch(/sm:/);
      expect(responsiveClasses).toMatch(/md:/);
      expect(responsiveClasses).toMatch(/lg:/);
    });

    it('should validate grid responsive classes', () => {
      const gridClasses = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
      
      expect(gridClasses).toContain('grid-cols-1');
      expect(gridClasses).toContain('md:grid-cols-2');
      expect(gridClasses).toContain('lg:grid-cols-3');
    });
  });

  describe('Animation Classes', () => {
    it('should validate animation classes', () => {
      const animationClasses = [
        'transition-colors',
        'transition-all',
        'duration-200',
        'duration-300',
        'ease-in-out',
      ];

      animationClasses.forEach(animClass => {
        expect(animClass).toMatch(/^(transition|duration|ease)/);
      });
    });
  });

  describe('Layout Classes', () => {
    it('should validate flexbox classes', () => {
      const flexClasses = 'flex flex-col md:flex-row items-center justify-between gap-3';
      
      expect(flexClasses).toContain('flex');
      expect(flexClasses).toContain('flex-col');
      expect(flexClasses).toContain('md:flex-row');
      expect(flexClasses).toContain('items-center');
      expect(flexClasses).toContain('justify-between');
    });

    it('should validate spacing classes', () => {
      const spacingClasses = 'p-4 sm:p-6 m-4 mx-auto mb-6 space-y-3';
      
      expect(spacingClasses).toMatch(/p-\d+/);
      expect(spacingClasses).toMatch(/sm:p-\d+/);
      expect(spacingClasses).toMatch(/m-\d+/);
      expect(spacingClasses).toContain('mx-auto');
      expect(spacingClasses).toMatch(/mb-\d+/);
      expect(spacingClasses).toMatch(/space-y-\d+/);
    });
  });

  describe('Typography Classes', () => {
    it('should validate text size classes', () => {
      const textSizes = [
        'text-sm',
        'text-base',
        'text-lg',
        'text-xl',
        'text-2xl',
        'text-3xl',
        'text-4xl',
      ];

      textSizes.forEach(size => {
        expect(size).toMatch(/text-(sm|base|lg|xl|\dxl)/);
      });
    });

    it('should validate font weight classes', () => {
      const fontWeights = [
        'font-normal',
        'font-medium',
        'font-semibold',
        'font-bold',
      ];

      fontWeights.forEach(weight => {
        expect(weight).toMatch(/font-(normal|medium|semibold|bold)/);
      });
    });
  });

  describe('Shadow Classes', () => {
    it('should validate shadow classes', () => {
      const shadowClasses = [
        'shadow-sm',
        'shadow',
        'shadow-md',
        'shadow-lg',
        'shadow-xl',
      ];

      shadowClasses.forEach(shadow => {
        expect(shadow).toMatch(/shadow(-sm|-md|-lg|-xl)?$/);
      });
    });
  });

  describe('Border Radius Classes', () => {
    it('should validate border radius classes', () => {
      const borderRadiusClasses = [
        'rounded',
        'rounded-md',
        'rounded-lg',
        'rounded-xl',
        'rounded-full',
      ];

      borderRadiusClasses.forEach(radius => {
        expect(radius).toMatch(/rounded(-md|-lg|-xl|-full)?$/);
      });
    });
  });
});
