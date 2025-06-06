/**
 * Breadcrumbs Feature - Tests
 *
 * Tests exhaustivos para el sistema de breadcrumbs
 */

import { describe, it, expect } from 'vitest';
import { generateBreadcrumbs, validateBreadcrumbs } from '../utils/breadcrumbs';
import type { BreadcrumbItem } from '../config/routes';

describe('Breadcrumbs System', () => {
  describe('generateBreadcrumbs', () => {
    it('should generate home breadcrumb for root path', () => {
      const breadcrumbs = generateBreadcrumbs('/');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', current: true, icon: '' }
      ]);
    });

    it('should generate breadcrumbs for blog path', () => {
      const breadcrumbs = generateBreadcrumbs('/blog');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '' },
        { label: 'Blog', current: true, icon: '' }
      ]);
    });

    it('should generate breadcrumbs for blog post with custom title', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/mi-post', 'Mi Post Increíble');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '' },
        { label: 'Blog', href: '/blog', icon: '' },
        { label: 'Mi Post Increíble', current: true, icon: '' }
      ]);
    });

    it('should generate breadcrumbs for blog post without custom title', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/mi-post');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '' },
        { label: 'Blog', href: '/blog', icon: '' },
        { label: 'Artículo', current: true, icon: '' }
      ]);
    });

    it('should generate breadcrumbs for pillars page', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/pillars');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '' },
        { label: 'Blog', href: '/blog', icon: '' },
        { label: 'Pilares de Contenido', current: true, icon: '' }
      ]);
    });

    it('should generate breadcrumbs for specific pillar with custom title', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/pillar/astro-performance', 'Rendimiento con Astro');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '' },
        { label: 'Blog', href: '/blog', icon: '' },
        { label: 'Pilares de Contenido', href: '/blog/pillars', icon: '' },
        { label: 'Rendimiento con Astro', current: true, icon: '' }
      ]);
    });

    it('should generate breadcrumbs for specific pillar without custom title', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/pillar/astro-performance');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '' },
        { label: 'Blog', href: '/blog', icon: '' },
        { label: 'Pilares de Contenido', href: '/blog/pillars', icon: '' },
        { label: 'Astro Performance', current: true, icon: '' }
      ]);
    });

    it('should generate breadcrumbs for tag page', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/tag/astro');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '' },
        { label: 'Blog', href: '/blog', icon: '' },
        { label: '#astro', current: true, icon: '️' }
      ]);
    });

    it('should handle trailing slashes correctly', () => {
      const breadcrumbs1 = generateBreadcrumbs('/blog/');
      const breadcrumbs2 = generateBreadcrumbs('/blog');
      expect(breadcrumbs1).toEqual(breadcrumbs2);
    });

    it('should return fallback for unknown routes', () => {
      const breadcrumbs = generateBreadcrumbs('/unknown/route');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '' }
      ]);
    });
  });

  describe('validateBreadcrumbs', () => {
    it('should validate correct breadcrumbs', () => {
      const validBreadcrumbs: BreadcrumbItem[] = [
        { label: 'Inicio', href: '/', icon: '' },
        { label: 'Blog', href: '/blog', icon: '' },
        { label: 'Post', current: true, icon: '' }
      ];
      expect(validateBreadcrumbs(validBreadcrumbs)).toBe(true);
    });

    it('should validate single home breadcrumb', () => {
      const validBreadcrumbs: BreadcrumbItem[] = [
        { label: 'Inicio', current: true, icon: '' }
      ];
      expect(validateBreadcrumbs(validBreadcrumbs)).toBe(true);
    });

    it('should reject empty array', () => {
      expect(validateBreadcrumbs([])).toBe(false);
    });

    it('should reject breadcrumbs with no current item', () => {
      const invalidBreadcrumbs: BreadcrumbItem[] = [
        { label: 'Inicio', href: '/', icon: '' },
        { label: 'Blog', href: '/blog', icon: '' }
      ];
      expect(validateBreadcrumbs(invalidBreadcrumbs)).toBe(false);
    });

    it('should reject breadcrumbs with multiple current items', () => {
      const invalidBreadcrumbs: BreadcrumbItem[] = [
        { label: 'Inicio', href: '/', current: true, icon: '' },
        { label: 'Blog', current: true, icon: '' }
      ];
      expect(validateBreadcrumbs(invalidBreadcrumbs)).toBe(false);
    });

    it('should reject breadcrumbs with missing href in non-current items', () => {
      const invalidBreadcrumbs: BreadcrumbItem[] = [
        { label: 'Inicio', icon: '' }, // Missing href
        { label: 'Blog', current: true, icon: '' }
      ];
      expect(validateBreadcrumbs(invalidBreadcrumbs)).toBe(false);
    });
  });
});
