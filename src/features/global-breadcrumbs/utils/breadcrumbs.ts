/**
 * Utilidades para el sistema de breadcrumbs globales
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  icon?: string;
}

/**
 * Genera breadcrumbs basados en la ruta actual
 * @param pathname - Ruta actual de la página
 * @param customTitle - Título personalizado para el último breadcrumb
 * @returns Array de breadcrumbs
 */
export function generateBreadcrumbs(pathname: string, customTitle?: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];

  // Home
  if (pathname !== '/') {
    breadcrumbs.push({ label: 'Inicio', href: '/', icon: '🏠' });
  }

  // Blog routes - LÓGICA CORREGIDA CON PILARES
  if (pathname.startsWith('/blog')) {
    // Primero manejar casos específicos
    if (pathname === '/blog' || pathname === '/blog/') {
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
    } else if (pathname.startsWith('/blog/') && pathname !== '/blog' && pathname !== '/blog/' && pathname !== '/blog/pillars') {
      // Posts individuales (cualquier otra ruta que empiece con /blog/)
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

/**
 * Obtiene el título de la página actual basado en la ruta
 * @param pathname - Ruta actual
 * @param customTitle - Título personalizado
 * @returns Título de la página
 */
export function getCurrentPageTitle(pathname: string, customTitle?: string): string {
  if (customTitle) {
    return customTitle;
  }

  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return 'Inicio';
  }

  if (segments[0] === 'blog') {
    if (segments.length === 1) {
      return 'Blog';
    }

    if (segments[1] === 'pillars') {
      return 'Pilares';
    }

    if (segments[1] === 'pillar') {
      return 'Pilar';
    }

    if (segments[1] === 'tag') {
      return 'Tag';
    }

    // Post individual
    return 'Post';
  }

  return 'Página';
}

/**
 * Verifica si una ruta debe mostrar breadcrumbs
 * @param pathname - Ruta actual
 * @returns true si debe mostrar breadcrumbs
 */
export function shouldShowBreadcrumbs(pathname: string): boolean {
  // No mostrar en la página de inicio
  if (pathname === '/') {
    return false;
  }

  // Mostrar en todas las demás páginas
  return true;
}
