/**
 * Breadcrumbs Feature - Core Utilities
 * 
 * Lógica principal para generar breadcrumbs basada en configuración de rutas
 * Sistema limpio y escalable
 */

import { ROUTE_PATTERNS, type BreadcrumbItem } from '../config/routes';

/**
 * Genera breadcrumbs para una ruta dada
 * @param pathname - Ruta actual de la página
 * @param customTitle - Título personalizado para el último breadcrumb
 * @returns Array de breadcrumbs
 */
export function generateBreadcrumbs(pathname: string, customTitle?: string): BreadcrumbItem[] {
  // Normalizar pathname
  const normalizedPath = pathname.endsWith('/') && pathname !== '/' 
    ? pathname.slice(0, -1) 
    : pathname;

  // Buscar el primer patrón que coincida
  for (const routePattern of ROUTE_PATTERNS) {
    if (routePattern.pattern.test(normalizedPath)) {
      return routePattern.generator(normalizedPath, customTitle);
    }
  }

  // Fallback: si no hay coincidencia, mostrar solo Home
  return [
    { label: 'Inicio', href: '/', icon: '🏠' }
  ];
}

/**
 * Valida que los breadcrumbs generados sean correctos
 * @param breadcrumbs - Array de breadcrumbs a validar
 * @returns true si son válidos
 */
export function validateBreadcrumbs(breadcrumbs: BreadcrumbItem[]): boolean {
  if (!Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
    return false;
  }

  // Debe haber exactamente un item marcado como current
  const currentItems = breadcrumbs.filter(item => item.current);
  if (currentItems.length !== 1) {
    return false;
  }

  // El último item debe ser el current
  const lastItem = breadcrumbs[breadcrumbs.length - 1];
  if (!lastItem.current) {
    return false;
  }

  // Todos los items excepto el último deben tener href
  for (let i = 0; i < breadcrumbs.length - 1; i++) {
    if (!breadcrumbs[i].href) {
      return false;
    }
  }

  return true;
}

/**
 * Exportar tipos para uso externo
 */
export type { BreadcrumbItem } from '../config/routes';
