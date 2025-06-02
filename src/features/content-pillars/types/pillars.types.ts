/**
 * Content Pillars Feature - Type Definitions
 * 
 * Tipos TypeScript para el sistema de pilares de contenido
 */

import type { CollectionEntry } from 'astro:content';

/**
 * Interfaz principal para un pilar de contenido
 */
export interface ContentPillar {
  id: string;
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
  icon: string;
  emoji: string;
  keywords: string[];
  tags: string[];
  priority: number;
  featured: boolean;
  seoMetadata: PillarSEOMetadata;
}

/**
 * Configuración de colores para un pilar
 */
export interface PillarColor {
  primary: string;
  secondary: string;
  background: string;
}

/**
 * Metadatos SEO específicos del pilar
 */
export interface PillarSEOMetadata {
  title: string;
  description: string;
  keywords: string[];
}

/**
 * Post con información de pilar asociado
 */
export interface PostWithPillar {
  post: CollectionEntry<'blog'>;
  pillar?: ContentPillar;
  pillarId?: string;
}

/**
 * Estadísticas de un pilar
 */
export interface PillarStats {
  pillarId: string;
  postCount: number;
  totalReadingTime: number;
  averageReadingTime: number;
  lastUpdated: Date;
  tags: string[];
  popularTags: Array<{
    tag: string;
    count: number;
  }>;
}

/**
 * Configuración de visualización de pilares
 */
export interface PillarDisplayConfig {
  showInNavigation: boolean;
  showInFooter: boolean;
  showInSidebar: boolean;
  maxFeaturedPillars: number;
  showPostCount: boolean;
  showDescription: boolean;
}

/**
 * Configuración de layout de pilares
 */
export interface PillarLayoutConfig {
  gridColumns: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  cardStyle: 'modern' | 'minimal' | 'classic';
  showIcons: boolean;
  showEmojis: boolean;
}

/**
 * Configuración SEO de pilares
 */
export interface PillarSEOConfig {
  generatePillarPages: boolean;
  includeInSitemap: boolean;
  generateRSSFeeds: boolean;
  structuredData: boolean;
}

/**
 * Configuración de analytics de pilares
 */
export interface PillarAnalyticsConfig {
  trackPillarViews: boolean;
  trackPillarClicks: boolean;
  trackPostsByPillar: boolean;
}

/**
 * Configuración completa del módulo de pilares
 */
export interface PillarsModuleConfig {
  display: PillarDisplayConfig;
  layout: PillarLayoutConfig;
  seo: PillarSEOConfig;
  analytics: PillarAnalyticsConfig;
}

/**
 * Resultado de agrupación de posts por pilares
 */
export interface PostsByPillar {
  [pillarId: string]: {
    pillar: ContentPillar;
    posts: CollectionEntry<'blog'>[];
    stats: PillarStats;
  };
}

/**
 * Opciones para el componente PillarCard
 */
export interface PillarCardProps {
  pillar: ContentPillar;
  postCount?: number;
  variant?: 'default' | 'compact' | 'featured';
  showDescription?: boolean;
  showPostCount?: boolean;
  showIcon?: boolean;
  className?: string;
}

/**
 * Opciones para el componente PillarGrid
 */
export interface PillarGridProps {
  pillars: ContentPillar[];
  variant?: 'default' | 'compact' | 'featured';
  columns?: {
    desktop?: number;
    tablet?: number;
    mobile?: number;
  };
  showStats?: boolean;
  className?: string;
}

/**
 * Opciones para el componente PillarNavigation
 */
export interface PillarNavigationProps {
  currentPillar?: string;
  variant?: 'horizontal' | 'vertical' | 'dropdown';
  showCounts?: boolean;
  maxItems?: number;
  className?: string;
}

/**
 * Resultado de búsqueda de pilares
 */
export interface PillarSearchResult {
  pillar: ContentPillar;
  relevanceScore: number;
  matchedKeywords: string[];
  matchedTags: string[];
}

/**
 * Filtros para pilares
 */
export interface PillarFilters {
  featured?: boolean;
  tags?: string[];
  keywords?: string[];
  minPostCount?: number;
  sortBy?: 'priority' | 'postCount' | 'title' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Contexto de pilar para páginas
 */
export interface PillarPageContext {
  pillar: ContentPillar;
  posts: CollectionEntry<'blog'>[];
  stats: PillarStats;
  relatedPillars: ContentPillar[];
  breadcrumbs: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
}

/**
 * Evento de analytics de pilar
 */
export interface PillarAnalyticsEvent {
  type: 'view' | 'click' | 'post_view';
  pillarId: string;
  postId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Configuración de cache para pilares
 */
export interface PillarCacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  invalidateOnPostUpdate: boolean;
  cacheKey: string;
}

/**
 * Resultado de validación de pilar
 */
export interface PillarValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  pillar?: ContentPillar;
}

/**
 * Opciones para generar páginas de pilares
 */
export interface PillarPageGenerationOptions {
  generateIndex: boolean;
  generateIndividualPages: boolean;
  generateRSSFeeds: boolean;
  generateSitemapEntries: boolean;
  customTemplates?: {
    index?: string;
    individual?: string;
  };
}
