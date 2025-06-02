/**
 * Related Articles Feature - Similarity Engine
 * 
 * Motor de similitud para encontrar artículos relacionados
 * Implementa múltiples algoritmos y estrategias de matching
 */

import type { CollectionEntry } from 'astro:content';
import type { 
  RelatedArticle, 
  RelatedArticlesResult, 
  SimilarityContext,
  SimilarityAnalysis,
  RelationReason,
  RelatedFilters
} from '../types/related.types';
import { DEFAULT_RELATED_CONFIG, EXCLUSION_CONFIG } from '../config/related.config';
import { detectPostPillar } from '../../content-pillars/config/pillars.config';

/**
 * Motor principal de similitud
 */
export class SimilarityEngine {
  private cache = new Map<string, RelatedArticlesResult>();
  
  /**
   * Encontrar artículos relacionados para un post dado
   */
  async findRelatedArticles(
    currentPost: CollectionEntry<'blog'>,
    allPosts: CollectionEntry<'blog'>[],
    config = DEFAULT_RELATED_CONFIG,
    filters?: RelatedFilters
  ): Promise<RelatedArticlesResult> {
    const startTime = performance.now();
    
    // Generar clave de cache
    const cacheKey = this.generateCacheKey(currentPost.slug, config, filters);
    
    // Verificar cache
    if (config.performance.enableCaching && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return {
        ...cached,
        cacheHit: true
      };
    }
    
    // Filtrar posts candidatos
    const candidatePosts = this.filterCandidates(currentPost, allPosts, filters);
    
    // Crear contexto de similitud
    const context: SimilarityContext = {
      currentPost,
      candidatePosts,
      config,
      excludedSlugs: filters?.excludeSlugs
    };
    
    // Analizar similitud para cada candidato
    const analyses = candidatePosts.map(post => 
      this.analyzeSimilarity(currentPost, post, config)
    );
    
    // Filtrar por score mínimo
    const validAnalyses = analyses.filter(analysis => 
      analysis.scores.total >= config.algorithm.similarity.minSimilarityScore
    );
    
    // Ordenar por score total
    validAnalyses.sort((a, b) => b.scores.total - a.scores.total);
    
    // Limitar número de resultados
    const limitedAnalyses = validAnalyses.slice(0, config.display.maxArticles);
    
    // Convertir a RelatedArticle
    const relatedArticles: RelatedArticle[] = limitedAnalyses.map(analysis => ({
      post: analysis.post,
      similarityScore: analysis.scores.total,
      matchedTags: analysis.matchedTags,
      matchedCategory: analysis.matchedCategory,
      reasons: analysis.reasons
    }));
    
    const executionTime = performance.now() - startTime;
    
    const result: RelatedArticlesResult = {
      articles: relatedArticles,
      totalCandidates: candidatePosts.length,
      algorithmUsed: 'weighted_similarity',
      executionTime,
      cacheHit: false
    };
    
    // Guardar en cache
    if (config.performance.enableCaching) {
      this.cache.set(cacheKey, result);
      this.cleanupCache(config.performance.maxCacheSize);
    }
    
    return result;
  }
  
  /**
   * Analizar similitud entre dos posts
   */
  private analyzeSimilarity(
    currentPost: CollectionEntry<'blog'>,
    candidatePost: CollectionEntry<'blog'>,
    config = DEFAULT_RELATED_CONFIG
  ): SimilarityAnalysis {
    const scores = {
      tags: this.calculateTagSimilarity(currentPost, candidatePost, config),
      category: this.calculateCategorySimilarity(currentPost, candidatePost, config),
      readingTime: this.calculateReadingTimeSimilarity(currentPost, candidatePost, config),
      publishDate: this.calculateDateSimilarity(currentPost, candidatePost, config),
      author: this.calculateAuthorSimilarity(currentPost, candidatePost, config),
      total: 0
    };
    
    // Calcular score total ponderado
    scores.total = 
      scores.tags * config.algorithm.weights.tags +
      scores.category * config.algorithm.weights.category +
      scores.readingTime * config.algorithm.weights.readingTime +
      scores.publishDate * config.algorithm.weights.publishDate +
      scores.author * config.algorithm.weights.author;
    
    // Generar razones
    const reasons = this.generateReasons(scores, currentPost, candidatePost);
    
    // Encontrar tags coincidentes
    const currentTags = new Set(currentPost.data.tags || []);
    const candidateTags = candidatePost.data.tags || [];
    const matchedTags = candidateTags.filter(tag => currentTags.has(tag));
    
    // Encontrar categoría coincidente
    const currentCategory = detectPostPillar(currentPost.data.tags || []);
    const candidateCategory = detectPostPillar(candidatePost.data.tags || []);
    const matchedCategory = currentCategory === candidateCategory ? currentCategory : undefined;
    
    return {
      post: candidatePost,
      scores,
      matchedTags,
      matchedCategory,
      reasons
    };
  }
  
  /**
   * Calcular similitud basada en tags
   */
  private calculateTagSimilarity(
    currentPost: CollectionEntry<'blog'>,
    candidatePost: CollectionEntry<'blog'>,
    config = DEFAULT_RELATED_CONFIG
  ): number {
    const currentTags = new Set(currentPost.data.tags || []);
    const candidateTags = new Set(candidatePost.data.tags || []);
    
    // Intersección de tags
    const intersection = new Set([...currentTags].filter(tag => candidateTags.has(tag)));
    
    // Unión de tags
    const union = new Set([...currentTags, ...candidateTags]);
    
    if (union.size === 0) return 0;
    
    // Jaccard similarity
    const jaccardSimilarity = intersection.size / union.size;
    
    // Bonus por tags de alta prioridad
    const highPriorityMatches = [...intersection].filter(tag => 
      EXCLUSION_CONFIG.highPriorityTags.includes(tag)
    ).length;
    
    const bonus = highPriorityMatches * 0.1;
    
    return Math.min(jaccardSimilarity + bonus, 1);
  }
  
  /**
   * Calcular similitud basada en categoría/pilar
   */
  private calculateCategorySimilarity(
    currentPost: CollectionEntry<'blog'>,
    candidatePost: CollectionEntry<'blog'>,
    config = DEFAULT_RELATED_CONFIG
  ): number {
    const currentPillar = detectPostPillar(currentPost.data.tags || []);
    const candidatePillar = detectPostPillar(candidatePost.data.tags || []);
    
    if (!currentPillar || !candidatePillar) return 0;
    
    return currentPillar === candidatePillar ? 1 : 0;
  }
  
  /**
   * Calcular similitud basada en tiempo de lectura
   */
  private calculateReadingTimeSimilarity(
    currentPost: CollectionEntry<'blog'>,
    candidatePost: CollectionEntry<'blog'>,
    config = DEFAULT_RELATED_CONFIG
  ): number {
    // Estimar tiempo de lectura (200 palabras por minuto)
    const currentWordCount = (currentPost.body || '').split(/\s+/).length;
    const candidateWordCount = (candidatePost.body || '').split(/\s+/).length;

    const currentReadingTime = Math.ceil(currentWordCount / 200);
    const candidateReadingTime = Math.ceil(candidateWordCount / 200);

    const timeDiff = Math.abs(currentReadingTime - candidateReadingTime);

    if (timeDiff > config.algorithm.similarity.maxReadingTimeDiff) return 0;

    // Similitud inversa a la diferencia
    return 1 - (timeDiff / config.algorithm.similarity.maxReadingTimeDiff);
  }
  
  /**
   * Calcular similitud basada en fecha de publicación
   */
  private calculateDateSimilarity(
    currentPost: CollectionEntry<'blog'>,
    candidatePost: CollectionEntry<'blog'>,
    config = DEFAULT_RELATED_CONFIG
  ): number {
    const currentDate = new Date(currentPost.data.date);
    const candidateDate = new Date(candidatePost.data.date);
    
    const daysDiff = Math.abs(
      (currentDate.getTime() - candidateDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff > config.algorithm.similarity.maxDateDiff) return 0;
    
    // Similitud inversa a la diferencia
    return 1 - (daysDiff / config.algorithm.similarity.maxDateDiff);
  }
  
  /**
   * Calcular similitud basada en autor
   */
  private calculateAuthorSimilarity(
    currentPost: CollectionEntry<'blog'>,
    candidatePost: CollectionEntry<'blog'>,
    config = DEFAULT_RELATED_CONFIG
  ): number {
    const currentAuthor = currentPost.data.author || 'Matías Cappato';
    const candidateAuthor = candidatePost.data.author || 'Matías Cappato';
    
    return currentAuthor === candidateAuthor ? 1 : 0;
  }
  
  /**
   * Generar razones para la relación
   */
  private generateReasons(
    scores: any,
    currentPost: CollectionEntry<'blog'>,
    candidatePost: CollectionEntry<'blog'>
  ): RelationReason[] {
    const reasons: RelationReason[] = [];
    
    if (scores.tags > 0.3) {
      const currentTags = new Set(currentPost.data.tags || []);
      const candidateTags = candidatePost.data.tags || [];
      const matchedTags = candidateTags.filter(tag => currentTags.has(tag));
      
      reasons.push({
        type: 'tags',
        score: scores.tags,
        details: `Comparten ${matchedTags.length} tags: ${matchedTags.join(', ')}`
      });
    }
    
    if (scores.category > 0) {
      const pillar = detectPostPillar(currentPost.data.tags || []);
      reasons.push({
        type: 'category',
        score: scores.category,
        details: `Ambos pertenecen al pilar: ${pillar}`
      });
    }
    
    if (scores.readingTime > 0.5) {
      reasons.push({
        type: 'readingTime',
        score: scores.readingTime,
        details: 'Tiempo de lectura similar'
      });
    }
    
    if (scores.publishDate > 0.5) {
      reasons.push({
        type: 'publishDate',
        score: scores.publishDate,
        details: 'Publicados en fechas cercanas'
      });
    }
    
    return reasons;
  }
  
  /**
   * Filtrar posts candidatos
   */
  private filterCandidates(
    currentPost: CollectionEntry<'blog'>,
    allPosts: CollectionEntry<'blog'>[],
    filters?: RelatedFilters
  ): CollectionEntry<'blog'>[] {
    return allPosts.filter(post => {
      // Excluir el post actual
      if (post.slug === currentPost.slug) return false;
      
      // Excluir posts en la lista de exclusión
      if (EXCLUSION_CONFIG.excludedSlugs.includes(post.slug)) return false;
      
      // Aplicar filtros adicionales
      if (filters?.excludeSlugs?.includes(post.slug)) return false;
      
      if (filters?.includeTags) {
        const postTags = new Set(post.data.tags || []);
        const hasIncludedTag = filters.includeTags.some(tag => postTags.has(tag));
        if (!hasIncludedTag) return false;
      }
      
      if (filters?.excludeTags) {
        const postTags = new Set(post.data.tags || []);
        const hasExcludedTag = filters.excludeTags.some(tag => postTags.has(tag));
        if (hasExcludedTag) return false;
      }
      
      if (filters?.maxAge) {
        const daysDiff = Math.abs(
          (new Date().getTime() - new Date(post.data.date).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff > filters.maxAge) return false;
      }
      
      return true;
    });
  }
  
  /**
   * Generar clave de cache
   */
  private generateCacheKey(
    postSlug: string,
    config: any,
    filters?: RelatedFilters
  ): string {
    const configHash = JSON.stringify(config);
    const filtersHash = filters ? JSON.stringify(filters) : '';
    return `${postSlug}-${btoa(configHash + filtersHash)}`;
  }
  
  /**
   * Limpiar cache cuando excede el tamaño máximo
   */
  private cleanupCache(maxSize: number): void {
    if (this.cache.size <= maxSize) return;
    
    // Eliminar las entradas más antiguas
    const entries = Array.from(this.cache.entries());
    const toDelete = entries.slice(0, entries.length - maxSize);
    
    toDelete.forEach(([key]) => {
      this.cache.delete(key);
    });
  }
}

/**
 * Instancia singleton del motor de similitud
 */
export const similarityEngine = new SimilarityEngine();
