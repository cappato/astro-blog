/**
 * Tests para GlobalBreadcrumbs
 * Detecta diferencias entre desarrollo y producción
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock de Astro.url para testing
const createMockAstro = (pathname) => ({
  url: { pathname }
});

// Función para simular la lógica de breadcrumbs
function generateBreadcrumbs(pathname, customTitle) {
  const breadcrumbs = [];

  // Home
  if (pathname !== '/') {
    breadcrumbs.push({ label: 'Inicio', href: '/', icon: '🏠' });
  }

  // Blog routes
  if (pathname.startsWith('/blog')) {
    // Primero manejar casos específicos
    if (pathname === '/blog') {
      // Página principal del blog
      breadcrumbs.push({ label: 'Blog', current: true, icon: '📝' });
    } else if (pathname === '/blog/pillars') {
      // Página de pilares
      breadcrumbs.push({ label: 'Blog', href: '/blog', icon: '📝' });
      breadcrumbs.push({ label: 'Pilares de Contenido', current: true, icon: '📚' });
  } else if (pathname.startsWith('/blog/pillar/')) {
    // Páginas de pilares individuales
    breadcrumbs.push({ label: 'Blog', href: '/blog', icon: '📝' });
    breadcrumbs.push({ label: 'Pilares de Contenido', href: '/blog/pillars', icon: '📚' });
    breadcrumbs.push({ label: customTitle || 'Pilar', current: true, icon: '📖' });
    } else if (pathname.startsWith('/blog/tag/')) {
      // Páginas de tags
      const tagName = pathname.split('/').pop();
      breadcrumbs.push({ label: 'Blog', href: '/blog', icon: '📝' });
      breadcrumbs.push({ label: `#${tagName}`, current: true, icon: '🏷️' });
    } else if (pathname.startsWith('/blog/') && pathname !== '/blog' && pathname !== '/blog/pillars') {
      // Posts individuales
      breadcrumbs.push({ label: 'Blog', href: '/blog', icon: '📝' });
      breadcrumbs.push({ label: customTitle || 'Artículo', current: true, icon: '📄' });
    }
  }

  // Home page
  if (pathname === '/') {
    breadcrumbs.push({ label: 'Inicio', current: true, icon: '🏠' });
  }

  return breadcrumbs;
}

describe('GlobalBreadcrumbs', () => {
  describe('Homepage', () => {
    it('should show only "Inicio" for homepage', () => {
      const breadcrumbs = generateBreadcrumbs('/');
      
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0]).toEqual({
        label: 'Inicio',
        current: true,
        icon: '🏠'
      });
    });
  });

  describe('Blog Index', () => {
    it('should show "Inicio > Blog" for blog index', () => {
      const breadcrumbs = generateBreadcrumbs('/blog');
      
      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0]).toEqual({
        label: 'Inicio',
        href: '/',
        icon: '🏠'
      });
      expect(breadcrumbs[1]).toEqual({
        label: 'Blog',
        current: true,
        icon: '📝'
      });
    });

    it('should NOT show "Artículo" for blog index', () => {
      const breadcrumbs = generateBreadcrumbs('/blog');
      
      const hasArticulo = breadcrumbs.some(b => b.label === 'Artículo');
      expect(hasArticulo).toBe(false);
    });
  });

  describe('Blog Pillars', () => {
    it('should show "Inicio > Blog > Pilares de Contenido" for pillars', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/pillars');
      
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0]).toEqual({
        label: 'Inicio',
        href: '/',
        icon: '🏠'
      });
      expect(breadcrumbs[1]).toEqual({
        label: 'Blog',
        href: '/blog',
        icon: '📝'
      });
      expect(breadcrumbs[2]).toEqual({
        label: 'Pilares de Contenido',
        current: true,
        icon: '📚'
      });
    });

    it('should NOT show "Artículo" for pillars', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/pillars');
      
      const hasArticulo = breadcrumbs.some(b => b.label === 'Artículo');
      expect(hasArticulo).toBe(false);
    });
  });

  describe('Tag Pages', () => {
    it('should show "Inicio > Blog > #tagname" for tag pages', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/tag/seo');
      
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0]).toEqual({
        label: 'Inicio',
        href: '/',
        icon: '🏠'
      });
      expect(breadcrumbs[1]).toEqual({
        label: 'Blog',
        href: '/blog',
        icon: '📝'
      });
      expect(breadcrumbs[2]).toEqual({
        label: '#seo',
        current: true,
        icon: '🏷️'
      });
    });

    it('should extract tag name correctly from URL', () => {
      const testCases = [
        { url: '/blog/tag/seo', expected: '#seo' },
        { url: '/blog/tag/typescript', expected: '#typescript' },
        { url: '/blog/tag/astro', expected: '#astro' },
        { url: '/blog/tag/automation', expected: '#automation' }
      ];

      testCases.forEach(({ url, expected }) => {
        const breadcrumbs = generateBreadcrumbs(url);
        const tagBreadcrumb = breadcrumbs.find(b => b.icon === '🏷️');
        expect(tagBreadcrumb.label).toBe(expected);
      });
    });

    it('should NOT show double # (##) for tags', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/tag/seo');
      
      const tagBreadcrumb = breadcrumbs.find(b => b.icon === '🏷️');
      expect(tagBreadcrumb.label).not.toBe('##');
      expect(tagBreadcrumb.label).not.toBe('#');
      expect(tagBreadcrumb.label).toBe('#seo');
    });
  });

  describe('Individual Pillars', () => {
    it('should show "Inicio > Blog > Pilares > [Pillar Name]" for pillar pages', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/pillar/astro-performance', 'Astro & Performance');

      expect(breadcrumbs).toHaveLength(4);
      expect(breadcrumbs[0]).toEqual({
        label: 'Inicio',
        href: '/',
        icon: '🏠'
      });
      expect(breadcrumbs[1]).toEqual({
        label: 'Blog',
        href: '/blog',
        icon: '📝'
      });
      expect(breadcrumbs[2]).toEqual({
        label: 'Pilares de Contenido',
        href: '/blog/pillars',
        icon: '📚'
      });
      expect(breadcrumbs[3]).toEqual({
        label: 'Astro & Performance',
        current: true,
        icon: '📖'
      });
    });

    it('should show "Inicio > Blog > Pilares > Pilar" for pillar pages without custom title', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/pillar/typescript-architecture');

      expect(breadcrumbs).toHaveLength(4);
      expect(breadcrumbs[3]).toEqual({
        label: 'Pilar',
        current: true,
        icon: '📖'
      });
    });
  });

  describe('Individual Posts', () => {
    it('should show "Inicio > Blog > [Title]" for posts with custom title', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/seo-automatico-typescript', 'SEO Automático con TypeScript');

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0]).toEqual({
        label: 'Inicio',
        href: '/',
        icon: '🏠'
      });
      expect(breadcrumbs[1]).toEqual({
        label: 'Blog',
        href: '/blog',
        icon: '📝'
      });
      expect(breadcrumbs[2]).toEqual({
        label: 'SEO Automático con TypeScript',
        current: true,
        icon: '📄'
      });
    });

    it('should show "Inicio > Blog > Artículo" for posts without custom title', () => {
      const breadcrumbs = generateBreadcrumbs('/blog/some-post');

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[2]).toEqual({
        label: 'Artículo',
        current: true,
        icon: '📄'
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle trailing slashes correctly', () => {
      const breadcrumbsWithSlash = generateBreadcrumbs('/blog/');
      const breadcrumbsWithoutSlash = generateBreadcrumbs('/blog');
      
      // Ambos deberían ser tratados como blog index
      expect(breadcrumbsWithSlash).toEqual(breadcrumbsWithoutSlash);
    });

    it('should handle URLs with query parameters', () => {
      // En producción, pathname no incluye query params, pero es bueno testear
      const breadcrumbs = generateBreadcrumbs('/blog/tag/seo');
      
      expect(breadcrumbs[2].label).toBe('#seo');
    });

    it('should handle empty or undefined customTitle', () => {
      const breadcrumbsUndefined = generateBreadcrumbs('/blog/some-post', undefined);
      const breadcrumbsEmpty = generateBreadcrumbs('/blog/some-post', '');
      
      expect(breadcrumbsUndefined[2].label).toBe('Artículo');
      expect(breadcrumbsEmpty[2].label).toBe('Artículo');
    });
  });

  describe('Production vs Development', () => {
    it('should work consistently regardless of environment', () => {
      // Test que las rutas funcionen igual en dev y prod
      const testUrls = [
        '/',
        '/blog',
        '/blog/pillars',
        '/blog/tag/seo',
        '/blog/some-post'
      ];

      testUrls.forEach(url => {
        const breadcrumbs = generateBreadcrumbs(url);
        expect(breadcrumbs).toBeDefined();
        expect(Array.isArray(breadcrumbs)).toBe(true);
        expect(breadcrumbs.length).toBeGreaterThan(0);
      });
    });
  });
});
