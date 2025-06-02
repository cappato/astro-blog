/**
 * Blog Enhancement Feature - Breadcrumbs Utilities
 * 
 * Generación automática de breadcrumbs basada en URL y contexto
 * Soporta blog posts, categorías, tags y páginas estáticas
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbConfig {
  homeLabel?: string;
  blogLabel?: string;
  tagLabel?: string;
  categoryLabel?: string;
}

/**
 * Configuración por defecto para breadcrumbs
 */
const DEFAULT_CONFIG: Required<BreadcrumbConfig> = {
  homeLabel: 'Inicio',
  blogLabel: 'Blog',
  tagLabel: 'Tag',
  categoryLabel: 'Categoría'
};

/**
 * Generar breadcrumbs para páginas del blog
 */
export function generateBlogBreadcrumbs(
  pathname: string,
  postTitle?: string,
  postTags?: string[],
  config: BreadcrumbConfig = {}
): BreadcrumbItem[] {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Siempre empezar con Home
  breadcrumbs.push({
    label: finalConfig.homeLabel,
    href: '/'
  });
  
  // Analizar la ruta
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) {
    // Homepage
    breadcrumbs[0].current = true;
    return breadcrumbs;
  }
  
  // Si estamos en el blog
  if (pathSegments[0] === 'blog') {
    breadcrumbs.push({
      label: finalConfig.blogLabel,
      href: '/blog'
    });
    
    if (pathSegments.length === 1) {
      // Página principal del blog
      breadcrumbs[breadcrumbs.length - 1].current = true;
      return breadcrumbs;
    }
    
    // Manejar diferentes tipos de páginas del blog
    if (pathSegments[1] === 'tag' && pathSegments[2]) {
      // Página de tag: /blog/tag/astro
      breadcrumbs.push({
        label: `${finalConfig.tagLabel}: ${formatTagName(pathSegments[2])}`,
        current: true
      });
    } else if (pathSegments[1] === 'category' && pathSegments[2]) {
      // Página de categoría: /blog/category/frontend
      breadcrumbs.push({
        label: `${finalConfig.categoryLabel}: ${formatCategoryName(pathSegments[2])}`,
        current: true
      });
    } else if (pathSegments.length === 2 && postTitle) {
      // Post individual: /blog/mi-post
      breadcrumbs.push({
        label: truncateTitle(postTitle),
        current: true
      });
    }
  } else {
    // Otras páginas
    const pageTitle = formatPageTitle(pathSegments[pathSegments.length - 1]);
    breadcrumbs.push({
      label: pageTitle,
      current: true
    });
  }
  
  return breadcrumbs;
}

/**
 * Generar breadcrumbs específicos para posts con contexto de tags
 */
export function generatePostBreadcrumbs(
  postSlug: string,
  postTitle: string,
  postTags: string[] = [],
  primaryTag?: string,
  config: BreadcrumbConfig = {}
): BreadcrumbItem[] {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Home
  breadcrumbs.push({
    label: finalConfig.homeLabel,
    href: '/'
  });
  
  // Blog
  breadcrumbs.push({
    label: finalConfig.blogLabel,
    href: '/blog'
  });
  
  // Si hay un tag principal, incluirlo en el breadcrumb
  if (primaryTag && postTags.includes(primaryTag)) {
    breadcrumbs.push({
      label: formatTagName(primaryTag),
      href: `/blog/tag/${primaryTag}`
    });
  }
  
  // Post actual
  breadcrumbs.push({
    label: truncateTitle(postTitle),
    current: true
  });
  
  return breadcrumbs;
}

/**
 * Generar breadcrumbs para páginas de archivo (tags, categorías)
 */
export function generateArchiveBreadcrumbs(
  type: 'tag' | 'category',
  value: string,
  config: BreadcrumbConfig = {}
): BreadcrumbItem[] {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Home
  breadcrumbs.push({
    label: finalConfig.homeLabel,
    href: '/'
  });
  
  // Blog
  breadcrumbs.push({
    label: finalConfig.blogLabel,
    href: '/blog'
  });
  
  // Archivo específico
  const label = type === 'tag' 
    ? `${finalConfig.tagLabel}: ${formatTagName(value)}`
    : `${finalConfig.categoryLabel}: ${formatCategoryName(value)}`;
    
  breadcrumbs.push({
    label,
    current: true
  });
  
  return breadcrumbs;
}

/**
 * Formatear nombre de tag para mostrar
 */
function formatTagName(tag: string): string {
  return tag
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formatear nombre de categoría para mostrar
 */
function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formatear título de página para mostrar
 */
function formatPageTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncar título si es muy largo para breadcrumbs
 */
function truncateTitle(title: string, maxLength: number = 50): string {
  if (title.length <= maxLength) {
    return title;
  }
  
  return title.substring(0, maxLength).trim() + '...';
}

/**
 * Detectar tag principal basado en frecuencia o importancia
 */
export function detectPrimaryTag(
  postTags: string[],
  tagPriority: string[] = ['astro', 'typescript', 'react', 'javascript', 'css']
): string | undefined {
  // Buscar tags en orden de prioridad
  for (const priorityTag of tagPriority) {
    if (postTags.includes(priorityTag)) {
      return priorityTag;
    }
  }
  
  // Si no hay tags prioritarios, usar el primero
  return postTags[0];
}

/**
 * Validar estructura de breadcrumbs
 */
export function validateBreadcrumbs(breadcrumbs: BreadcrumbItem[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (breadcrumbs.length === 0) {
    errors.push('Breadcrumbs array is empty');
  }
  
  if (breadcrumbs.length > 0 && breadcrumbs[0].href !== '/') {
    errors.push('First breadcrumb should be home (/)');
  }
  
  const currentItems = breadcrumbs.filter(item => item.current);
  if (currentItems.length !== 1) {
    errors.push('Exactly one breadcrumb should be marked as current');
  }
  
  if (currentItems.length > 0 && currentItems[0] !== breadcrumbs[breadcrumbs.length - 1]) {
    errors.push('Current breadcrumb should be the last item');
  }
  
  // Validar que no hay items vacíos
  breadcrumbs.forEach((item, index) => {
    if (!item.label || item.label.trim() === '') {
      errors.push(`Breadcrumb at index ${index} has empty label`);
    }
    
    if (!item.current && (!item.href || item.href.trim() === '')) {
      errors.push(`Breadcrumb at index ${index} has no href and is not current`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generar breadcrumbs automáticamente basado en contexto de Astro
 */
export function generateAutoBreadcrumbs(
  pathname: string,
  context: {
    postTitle?: string;
    postTags?: string[];
    pageType?: 'home' | 'blog' | 'post' | 'tag' | 'category' | 'page';
    tagName?: string;
    categoryName?: string;
  } = {},
  config: BreadcrumbConfig = {}
): BreadcrumbItem[] {
  const { postTitle, postTags = [], pageType, tagName, categoryName } = context;
  
  switch (pageType) {
    case 'home':
      return [{
        label: config.homeLabel || DEFAULT_CONFIG.homeLabel,
        current: true
      }];
      
    case 'blog':
      return generateBlogBreadcrumbs(pathname, undefined, [], config);
      
    case 'post':
      if (!postTitle) {
        throw new Error('postTitle is required for post breadcrumbs');
      }
      const primaryTag = detectPrimaryTag(postTags);
      return generatePostBreadcrumbs(pathname, postTitle, postTags, primaryTag, config);
      
    case 'tag':
      if (!tagName) {
        throw new Error('tagName is required for tag breadcrumbs');
      }
      return generateArchiveBreadcrumbs('tag', tagName, config);
      
    case 'category':
      if (!categoryName) {
        throw new Error('categoryName is required for category breadcrumbs');
      }
      return generateArchiveBreadcrumbs('category', categoryName, config);
      
    default:
      return generateBlogBreadcrumbs(pathname, postTitle, postTags, config);
  }
}
