/**
 * Global Breadcrumbs Feature - Configuration
 * 
 * Sistema de breadcrumbs modular y global para todo el sitio
 * Configuración centralizada de rutas, labels y comportamiento
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  icon?: string;
}

export interface BreadcrumbConfig {
  homeLabel: string;
  separator: 'arrow' | 'slash' | 'chevron';
  showIcons: boolean;
  showHome: boolean;
  maxItems: number;
  truncateLength: number;
}

export interface RouteConfig {
  pattern: string;
  label: string;
  icon?: string;
  parent?: string;
  dynamic?: boolean;
  generator?: (params: Record<string, string>) => string;
}

/**
 * Configuración por defecto de breadcrumbs
 */
export const DEFAULT_BREADCRUMB_CONFIG: BreadcrumbConfig = {
  homeLabel: 'Inicio',
  separator: 'chevron',
  showIcons: true,
  showHome: true,
  maxItems: 5,
  truncateLength: 30
};

/**
 * Configuración de rutas del sitio
 * Define cómo generar breadcrumbs para cada ruta
 */
export const SITE_ROUTES: RouteConfig[] = [
  // Páginas principales
  {
    pattern: '/',
    label: 'Inicio',
    icon: '🏠'
  },
  {
    pattern: '/blog',
    label: 'Blog',
    icon: '📝',
    parent: '/'
  },
  {
    pattern: '/blog/pillars',
    label: 'Pilares de Contenido',
    icon: '📚',
    parent: '/blog'
  },
  {
    pattern: '/blog/tags',
    label: 'Tags',
    icon: '🏷️',
    parent: '/blog'
  },
  {
    pattern: '/about',
    label: 'Acerca de',
    icon: '👤',
    parent: '/'
  },
  {
    pattern: '/contact',
    label: 'Contacto',
    icon: '📧',
    parent: '/'
  },
  {
    pattern: '/projects',
    label: 'Proyectos',
    icon: '🚀',
    parent: '/'
  },
  
  // Rutas dinámicas del blog
  {
    pattern: '/blog/pillar/:pillarId',
    label: 'Pilar',
    icon: '📖',
    parent: '/blog/pillars',
    dynamic: true,
    generator: (params) => {
      const pillarNames: Record<string, string> = {
        'astro-performance': 'Astro & Performance',
        'typescript-architecture': 'TypeScript & Architecture',
        'automation-devops': 'Automation & DevOps',
        'seo-optimization': 'SEO & Optimization'
      };
      return pillarNames[params.pillarId] || params.pillarId;
    }
  },
  {
    pattern: '/blog/tag/:tagName',
    label: 'Tag',
    icon: '🏷️',
    parent: '/blog/tags',
    dynamic: true,
    generator: (params) => `#${params.tagName}`
  },
  {
    pattern: '/blog/:slug',
    label: 'Artículo',
    icon: '📄',
    parent: '/blog',
    dynamic: true,
    generator: (params) => {
      // Este será sobrescrito por el título real del post
      return params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }
];

/**
 * Configuración de exclusiones
 */
export const BREADCRUMB_EXCLUSIONS = {
  // Rutas donde no mostrar breadcrumbs
  excludedPaths: [
    '/404',
    '/500',
    '/api/*'
  ],
  
  // Rutas donde mostrar breadcrumbs simplificados
  simplifiedPaths: [
    '/'
  ]
};

/**
 * Configuración de iconos
 */
export const BREADCRUMB_ICONS = {
  home: '🏠',
  blog: '📝',
  article: '📄',
  pillar: '📖',
  tag: '🏷️',
  category: '📂',
  about: '👤',
  contact: '📧',
  projects: '🚀',
  default: '📄'
};

/**
 * Utilidad para encontrar configuración de ruta
 */
export function findRouteConfig(pathname: string): RouteConfig | undefined {
  // Buscar coincidencia exacta primero
  const exactMatch = SITE_ROUTES.find(route => route.pattern === pathname);
  if (exactMatch) return exactMatch;
  
  // Buscar coincidencia con parámetros dinámicos
  return SITE_ROUTES.find(route => {
    if (!route.dynamic) return false;
    
    const pattern = route.pattern.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
}

/**
 * Utilidad para extraer parámetros de ruta dinámica
 */
export function extractRouteParams(pathname: string, pattern: string): Record<string, string> {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  const params: Record<string, string> = {};
  
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    if (patternPart.startsWith(':')) {
      const paramName = patternPart.slice(1);
      params[paramName] = pathParts[i] || '';
    }
  }
  
  return params;
}

/**
 * Utilidad para verificar si una ruta debe mostrar breadcrumbs
 */
export function shouldShowBreadcrumbs(pathname: string): boolean {
  // Verificar exclusiones
  for (const excludedPath of BREADCRUMB_EXCLUSIONS.excludedPaths) {
    if (excludedPath.endsWith('*')) {
      const basePath = excludedPath.slice(0, -1);
      if (pathname.startsWith(basePath)) return false;
    } else if (pathname === excludedPath) {
      return false;
    }
  }
  
  return true;
}

/**
 * Utilidad para verificar si una ruta debe usar breadcrumbs simplificados
 */
export function shouldUseSimplifiedBreadcrumbs(pathname: string): boolean {
  return BREADCRUMB_EXCLUSIONS.simplifiedPaths.includes(pathname);
}

/**
 * Utilidad para truncar texto de breadcrumb
 */
export function truncateBreadcrumbText(text: string, maxLength: number = 30): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Utilidad para generar breadcrumbs desde configuración
 */
export function generateBreadcrumbsFromConfig(
  pathname: string,
  config: BreadcrumbConfig = DEFAULT_BREADCRUMB_CONFIG,
  customTitle?: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Verificar si debe mostrar breadcrumbs
  if (!shouldShowBreadcrumbs(pathname)) {
    return [];
  }
  
  // Verificar si debe usar breadcrumbs simplificados
  if (shouldUseSimplifiedBreadcrumbs(pathname)) {
    return [{
      label: config.homeLabel,
      current: true,
      icon: config.showIcons ? BREADCRUMB_ICONS.home : undefined
    }];
  }
  
  // Construir breadcrumbs paso a paso
  const pathParts = pathname.split('/').filter(Boolean);
  let currentPath = '';
  
  // Agregar home si está configurado
  if (config.showHome && pathname !== '/') {
    breadcrumbs.push({
      label: config.homeLabel,
      href: '/',
      icon: config.showIcons ? BREADCRUMB_ICONS.home : undefined
    });
  }
  
  // Procesar cada parte de la ruta
  for (let i = 0; i < pathParts.length; i++) {
    currentPath += '/' + pathParts[i];
    const isLast = i === pathParts.length - 1;
    
    const routeConfig = findRouteConfig(currentPath);
    
    if (routeConfig) {
      let label = routeConfig.label;
      
      // Si es una ruta dinámica, generar label personalizado
      if (routeConfig.dynamic && routeConfig.generator) {
        const params = extractRouteParams(currentPath, routeConfig.pattern);
        label = routeConfig.generator(params);
      }
      
      // Si es el último elemento y tenemos un título personalizado, usarlo
      if (isLast && customTitle) {
        label = customTitle;
      }
      
      // Truncar si es necesario
      if (config.truncateLength > 0) {
        label = truncateBreadcrumbText(label, config.truncateLength);
      }
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        current: isLast,
        icon: config.showIcons ? routeConfig.icon : undefined
      });
    }
  }
  
  // Limitar número de items si está configurado
  if (config.maxItems > 0 && breadcrumbs.length > config.maxItems) {
    const start = breadcrumbs.slice(0, 1); // Home
    const end = breadcrumbs.slice(-2); // Últimos 2
    const middle = [{ label: '...', current: false }];
    return [...start, ...middle, ...end];
  }
  
  return breadcrumbs;
}
