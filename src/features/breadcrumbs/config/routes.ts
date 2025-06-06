/**
 * Breadcrumbs Feature - Route Configuration
 *
 * Configuración centralizada de rutas y sus breadcrumbs correspondientes
 * Sistema modular y escalable para navegación jerárquica
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  icon?: string;
}

export interface RoutePattern {
  pattern: RegExp;
  generator: (pathname: string, customTitle?: string) => BreadcrumbItem[];
}

/**
 * Iconos para diferentes tipos de páginas
 */
export const BREADCRUMB_ICONS = {
  home: '',
  blog: '',
  article: '',
  pillars: '',
  pillar: '',
  tag: '️',
  category: '',
} as const;

/**
 * Patrones de rutas y sus generadores de breadcrumbs
 * Orden importa: más específicos primero
 */
export const ROUTE_PATTERNS: RoutePattern[] = [
  // Home page
  {
    pattern: /^\/$/,
    generator: () => [
      { label: 'Inicio', current: true, icon: BREADCRUMB_ICONS.home }
    ]
  },

  // Blog pillars individual
  {
    pattern: /^\/blog\/pillar\/(.+)$/,
    generator: (pathname, customTitle) => {
      const pillarSlug = pathname.match(/^\/blog\/pillar\/(.+)$/)?.[1];
      const pillarName = customTitle || formatSlug(pillarSlug || '');

      return [
        { label: 'Inicio', href: '/', icon: BREADCRUMB_ICONS.home },
        { label: 'Blog', href: '/blog', icon: BREADCRUMB_ICONS.blog },
        { label: 'Pilares de Contenido', href: '/blog/pillars', icon: BREADCRUMB_ICONS.pillars },
        { label: pillarName, current: true, icon: BREADCRUMB_ICONS.pillar }
      ];
    }
  },

  // Blog pillars page
  {
    pattern: /^\/blog\/pillars$/,
    generator: () => [
      { label: 'Inicio', href: '/', icon: BREADCRUMB_ICONS.home },
      { label: 'Blog', href: '/blog', icon: BREADCRUMB_ICONS.blog },
      { label: 'Pilares de Contenido', current: true, icon: BREADCRUMB_ICONS.pillars }
    ]
  },

  // Blog tag pages
  {
    pattern: /^\/blog\/tag\/(.+)$/,
    generator: (pathname) => {
      const tagName = pathname.match(/^\/blog\/tag\/(.+)$/)?.[1];

      return [
        { label: 'Inicio', href: '/', icon: BREADCRUMB_ICONS.home },
        { label: 'Blog', href: '/blog', icon: BREADCRUMB_ICONS.blog },
        { label: `#${tagName}`, current: true, icon: BREADCRUMB_ICONS.tag }
      ];
    }
  },

  // Blog main page
  {
    pattern: /^\/blog$/,
    generator: () => [
      { label: 'Inicio', href: '/', icon: BREADCRUMB_ICONS.home },
      { label: 'Blog', current: true, icon: BREADCRUMB_ICONS.blog }
    ]
  },

  // Blog posts (cualquier otra ruta que empiece con /blog/)
  {
    pattern: /^\/blog\/(.+)$/,
    generator: (pathname, customTitle) => {
      const postTitle = customTitle || 'Artículo';

      return [
        { label: 'Inicio', href: '/', icon: BREADCRUMB_ICONS.home },
        { label: 'Blog', href: '/blog', icon: BREADCRUMB_ICONS.blog },
        { label: postTitle, current: true, icon: BREADCRUMB_ICONS.article }
      ];
    }
  }
];

/**
 * Utilidad para formatear slugs en títulos legibles
 */
function formatSlug(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Configuración general de breadcrumbs
 */
export const BREADCRUMB_CONFIG = {
  showIcons: true,
  maxItems: 5,
  separator: 'chevron' as const,
  homeLabel: 'Inicio'
} as const;
