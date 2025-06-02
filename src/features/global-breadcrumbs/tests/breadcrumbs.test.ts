/**
 * Tests para el sistema de breadcrumbs globales
 */

import { describe, it, expect } from 'vitest';
import { generateBreadcrumbs, type BreadcrumbItem } from '../utils/breadcrumbs';

describe('Global Breadcrumbs System', () => {
  describe('generateBreadcrumbs', () => {
    it('should generate home breadcrumb for root path', () => {
      const breadcrumbs = generateBreadcrumbs('/');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', current: true, icon: '🏠' }
      ]);
    });

    it('should generate breadcrumbs for blog path', () => {
      const breadcrumbs = generateBreadcrumbs('/blog');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '🏠' },
        { label: 'Blog', current: true, icon: '📝' }
      ]);
    });

    it('should generate breadcrumbs for blog post', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/mi-post');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '🏠' },
        { label: 'Blog', href: '/blog', icon: '📝' },
        { label: 'Artículo', current: true, icon: '📄' }
      ]);
    });

    it('should generate breadcrumbs for pillars page', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/pillars');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '🏠' },
        { label: 'Blog', href: '/blog', icon: '📝' },
        { label: 'Pilares de Contenido', current: true, icon: '📚' }
      ]);
    });

    it('should generate breadcrumbs for specific pillar', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/pillar/astro-performance');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '🏠' },
        { label: 'Blog', href: '/blog', icon: '📝' },
        { label: 'Pilares de Contenido', href: '/blog/pillars', icon: '📚' },
        { label: 'Pilar', current: true, icon: '📖' }
      ]);
    });

    it('should generate breadcrumbs for tag page', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/tag/astro');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '🏠' },
        { label: 'Blog', href: '/blog', icon: '📝' },
        { label: '#astro', current: true, icon: '🏷️' }
      ]);
    });

    it('should handle custom title for pillar pages', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/pillar/astro-performance', 'Rendimiento con Astro');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '🏠' },
        { label: 'Blog', href: '/blog', icon: '📝' },
        { label: 'Pilares de Contenido', href: '/blog/pillars', icon: '📚' },
        { label: 'Rendimiento con Astro', current: true, icon: '📖' }
      ]);
    });

    it('should handle nested paths correctly', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/category/subcategory');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '🏠' },
        { label: 'Blog', href: '/blog', icon: '📝' },
        { label: 'Artículo', current: true, icon: '📄' }
      ]);
    });

    it('should handle paths with trailing slash', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '🏠' },
        { label: 'Blog', current: true, icon: '📝' }
      ]);
    });

    it('should handle custom title for blog posts', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/mi-post', 'Mi Post Personalizado');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '🏠' },
        { label: 'Blog', href: '/blog', icon: '📝' },
        { label: 'Mi Post Personalizado', current: true, icon: '📄' }
      ]);
    });
  });

  describe('BreadcrumbItem interface', () => {
    it('should have correct structure', () => {
      const breadcrumb: BreadcrumbItem = {
        label: 'Test',
        href: '/test',
        icon: '🧪'
      };

      expect(breadcrumb).toHaveProperty('label');
      expect(breadcrumb).toHaveProperty('href');
      expect(breadcrumb).toHaveProperty('icon');
      expect(typeof breadcrumb.label).toBe('string');
      expect(typeof breadcrumb.href).toBe('string');
      expect(typeof breadcrumb.icon).toBe('string');
    });

    it('should support current breadcrumb', () => {
      const breadcrumb: BreadcrumbItem = {
        label: 'Current Page',
        current: true,
        icon: '📄'
      };

      expect(breadcrumb).toHaveProperty('label');
      expect(breadcrumb).toHaveProperty('current');
      expect(breadcrumb).toHaveProperty('icon');
      expect(breadcrumb.current).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long paths', () => {
      const longPath = '/blog/very/long/path/with/many/segments/that/should/be/handled/correctly';
      const breadcrumbs = generateBreadcrumbs(longPath);
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '🏠' },
        { label: 'Blog', href: '/blog', icon: '📝' },
        { label: 'Artículo', current: true, icon: '📄' }
      ]);
    });

    it('should handle special characters in paths', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/post-with-special-chars-123');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '🏠' },
        { label: 'Blog', href: '/blog', icon: '📝' },
        { label: 'Artículo', current: true, icon: '📄' }
      ]);
    });

    it('should handle tag with special characters', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/tag/javascript-es6');
      expect(breadcrumbs).toEqual([
        { label: 'Inicio', href: '/', icon: '🏠' },
        { label: 'Blog', href: '/blog', icon: '📝' },
        { label: '#javascript-es6', current: true, icon: '🏷️' }
      ]);
    });
  });
});
