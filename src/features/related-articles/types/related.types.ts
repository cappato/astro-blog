/**
 * Related Articles Feature - Type Definitions
 * 
 * Tipos TypeScript para el sistema de artículos relacionados
 */

import type { CollectionEntry } from 'astro:content';

/**
 * Artículo relacionado con score de similitud
 */
export interface RelatedArticle {
  post: CollectionEntry<'blog'>;
  similarityScore: number;
  matchedTags: string[];
  matchedCategory?: string;
  reasons: RelationReason[];
}

/**
 * Razones por las que un artículo es considerado relacionado
 */
export interface RelationReason {
  type: 'tags' | 'category' | 'readingTime' | 'publishDate' | 'author';
  score: number;
  details: string;
}

/**
 * Resultado del algoritmo de artículos relacionados
 */
export interface RelatedArticlesResult {
  articles: RelatedArticle[];
  totalCandidates: number;
  algorithmUsed: string;
  executionTime: number;
  cacheHit: boolean;
}

/**
 * Configuración para el componente RelatedArticles
 */
export interface RelatedArticlesProps {
  currentPost: CollectionEntry<'blog'>;
  maxArticles?: number;
  variant?: 'grid' | 'list' | 'carousel';
  cardStyle?: 'minimal' | 'standard' | 'detailed';
  showReadingTime?: boolean;
  showPublishDate?: boolean;
  showTags?: boolean;
  showExcerpt?: boolean;
  showThumbnail?: boolean;
  className?: string;
  title?: string;
  customConfig?: Partial<RelatedArticlesConfig>;
}

/**
 * Configuración para el componente RelatedArticleCard
 */
export interface RelatedArticleCardProps {
  article: RelatedArticle;
  variant?: 'minimal' | 'standard' | 'detailed';
  showReadingTime?: boolean;
  showPublishDate?: boolean;
  showTags?: boolean;
  showExcerpt?: boolean;
  showThumbnail?: boolean;
  showSimilarityScore?: boolean;
  className?: string;
}

/**
 * Configuración del algoritmo de similitud
 */
export interface SimilarityAlgorithmConfig {
  weights: {
    tags: number;
    category: number;
    readingTime: number;
    publishDate: number;
    author: number;
  };
  similarity: {
    minTagOverlap: number;
    maxReadingTimeDiff: number;
    maxDateDiff: number;
    minSimilarityScore: number;
  };
}

/**
 * Configuración de display
 */
export interface RelatedDisplayConfig {
  maxArticles: number;
  showReadingTime: boolean;
  showPublishDate: boolean;
  showTags: boolean;
  showExcerpt: boolean;
  showAuthor: boolean;
  showThumbnail: boolean;
}

/**
 * Configuración de layout
 */
export interface RelatedLayoutConfig {
  variant: 'grid' | 'list' | 'carousel';
  columns: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  cardStyle: 'minimal' | 'standard' | 'detailed';
}

/**
 * Configuración de performance
 */
export interface RelatedPerformanceConfig {
  enableCaching: boolean;
  cacheTimeout: number;
  maxCacheSize: number;
}

/**
 * Configuración de analytics
 */
export interface RelatedAnalyticsConfig {
  trackViews: boolean;
  trackClicks: boolean;
  trackEngagement: boolean;
}

/**
 * Configuración completa del módulo
 */
export interface RelatedArticlesConfig {
  algorithm: SimilarityAlgorithmConfig;
  display: RelatedDisplayConfig;
  layout: RelatedLayoutConfig;
  performance: RelatedPerformanceConfig;
  analytics: RelatedAnalyticsConfig;
}

/**
 * Entrada de cache para artículos relacionados
 */
export interface RelatedCacheEntry {
  postSlug: string;
  articles: RelatedArticle[];
  timestamp: number;
  config: RelatedArticlesConfig;
  hash: string;
}

/**
 * Estadísticas del sistema de artículos relacionados
 */
export interface RelatedArticlesStats {
  totalQueries: number;
  cacheHitRate: number;
  averageExecutionTime: number;
  averageSimilarityScore: number;
  mostCommonReasons: Array<{
    reason: string;
    count: number;
  }>;
  topPerformingTags: Array<{
    tag: string;
    matchCount: number;
  }>;
}

/**
 * Contexto para el análisis de similitud
 */
export interface SimilarityContext {
  currentPost: CollectionEntry<'blog'>;
  candidatePosts: CollectionEntry<'blog'>[];
  config: RelatedArticlesConfig;
  excludedSlugs?: string[];
}

/**
 * Resultado del análisis de similitud individual
 */
export interface SimilarityAnalysis {
  post: CollectionEntry<'blog'>;
  scores: {
    tags: number;
    category: number;
    readingTime: number;
    publishDate: number;
    author: number;
    total: number;
  };
  matchedTags: string[];
  matchedCategory?: string;
  reasons: RelationReason[];
}

/**
 * Configuración de filtros para artículos relacionados
 */
export interface RelatedFilters {
  excludeSlugs?: string[];
  includeTags?: string[];
  excludeTags?: string[];
  minSimilarityScore?: number;
  maxAge?: number; // días
  sameAuthor?: boolean;
  sameCategory?: boolean;
}

/**
 * Evento de analytics para artículos relacionados
 */
export interface RelatedAnalyticsEvent {
  type: 'view' | 'click' | 'engagement';
  currentPostSlug: string;
  relatedPostSlug?: string;
  similarityScore?: number;
  position?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Configuración de fallback para cuando no hay suficientes artículos relacionados
 */
export interface RelatedFallbackConfig {
  strategies: Array<'same_category' | 'popular_tags' | 'recent_posts' | 'random_selection'>;
  minArticles: number;
  maxFallbackArticles: number;
}

/**
 * Resultado de estrategia de fallback
 */
export interface FallbackResult {
  articles: CollectionEntry<'blog'>[];
  strategy: string;
  reason: string;
}

/**
 * Configuración de A/B testing para artículos relacionados
 */
export interface RelatedABTestConfig {
  enabled: boolean;
  variants: Array<{
    name: string;
    config: Partial<RelatedArticlesConfig>;
    weight: number;
  }>;
  metrics: string[];
}

/**
 * Resultado de validación de configuración
 */
export interface RelatedConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
