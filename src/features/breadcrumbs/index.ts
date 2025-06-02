/**
 * Breadcrumbs Feature - Main Export
 * 
 * Sistema modular de breadcrumbs para navegación jerárquica
 * Exporta todas las utilidades y tipos necesarios
 */

// Core utilities
export { generateBreadcrumbs, validateBreadcrumbs } from './utils/breadcrumbs';

// Configuration
export { ROUTE_PATTERNS, BREADCRUMB_ICONS, BREADCRUMB_CONFIG } from './config/routes';

// Types
export type { BreadcrumbItem, RoutePattern } from './config/routes';

// Component (for TypeScript imports)
export { default as Breadcrumbs } from './components/Breadcrumbs.astro';
