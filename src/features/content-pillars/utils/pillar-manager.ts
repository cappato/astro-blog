/**
 * Content Pillars Feature - Pillar Manager
 * 
 * Utilidades para gestionar pilares de contenido, clasificar posts
 * y generar estadísticas automáticamente
 */

import type { CollectionEntry } from 'astro:content';
import { 
  CONTENT_PILLARS, 
  TAG_TO_PILLAR_MAPPING,
  getFeaturedPillars,
  getPillarById,
  detectPostPillar,
  getAllPillars
} from '../config/pillars.config';
import type { 
  ContentPillar, 
  PostWithPillar, 
  PillarStats, 
  PostsByPillar,
  PillarFilters,
  PillarSearchResult
} from '../types/pillars.types';

/**
 * Clasificar un post en un pilar basado en sus tags
 */
export function classifyPostToPillar(post: CollectionEntry<'blog'>): PostWithPillar {
  const tags = post.data.tags || [];
  const pillarId = detectPostPillar(tags);
  const pillar = pillarId ? getPillarById(pillarId) : undefined;

  return {
    post,
    pillar,
    pillarId
  };
}

/**
 * Clasificar múltiples posts en pilares
 */
export function classifyPostsToPillars(posts: CollectionEntry<'blog'>[]): PostWithPillar[] {
  return posts.map(post => classifyPostToPillar(post));
}

/**
 * Agrupar posts por pilares
 */
export function groupPostsByPillars(posts: CollectionEntry<'blog'>[]): PostsByPillar {
  const result: PostsByPillar = {};
  
  // Inicializar todos los pilares
  Object.values(CONTENT_PILLARS).forEach(pillar => {
    result[pillar.id] = {
      pillar,
      posts: [],
      stats: generatePillarStats(pillar.id, [])
    };
  });

  // Clasificar posts
  const classifiedPosts = classifyPostsToPillars(posts);
  
  classifiedPosts.forEach(({ post, pillarId }) => {
    if (pillarId && result[pillarId]) {
      result[pillarId].posts.push(post);
    }
  });

  // Generar estadísticas actualizadas
  Object.keys(result).forEach(pillarId => {
    result[pillarId].stats = generatePillarStats(pillarId, result[pillarId].posts);
  });

  return result;
}

/**
 * Generar estadísticas para un pilar
 */
export function generatePillarStats(pillarId: string, posts: CollectionEntry<'blog'>[]): PillarStats {
  const pillar = getPillarById(pillarId);
  if (!pillar) {
    throw new Error(`Pillar with id "${pillarId}" not found`);
  }

  // Calcular tiempo de lectura total (asumiendo 200 palabras por minuto)
  const totalReadingTime = posts.reduce((total, post) => {
    const content = post.body || '';
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    return total + readingTime;
  }, 0);

  const averageReadingTime = posts.length > 0 ? Math.round(totalReadingTime / posts.length) : 0;

  // Recopilar todos los tags
  const allTags = posts.flatMap(post => post.data.tags || []);
  const uniqueTags = [...new Set(allTags)];

  // Contar frecuencia de tags
  const tagCounts = allTags.reduce((counts, tag) => {
    counts[tag] = (counts[tag] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const popularTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Fecha de última actualización
  const lastUpdated = posts.length > 0 
    ? new Date(Math.max(...posts.map(post => post.data.date.getTime())))
    : new Date();

  return {
    pillarId,
    postCount: posts.length,
    totalReadingTime,
    averageReadingTime,
    lastUpdated,
    tags: uniqueTags,
    popularTags
  };
}

/**
 * Obtener posts de un pilar específico
 */
export function getPostsByPillar(pillarId: string, posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  const classifiedPosts = classifyPostsToPillars(posts);
  return classifiedPosts
    .filter(({ pillarId: postPillarId }) => postPillarId === pillarId)
    .map(({ post }) => post);
}

/**
 * Obtener pilares relacionados basado en tags comunes
 */
export function getRelatedPillars(pillarId: string, limit: number = 3): ContentPillar[] {
  const currentPillar = getPillarById(pillarId);
  if (!currentPillar) return [];

  const allPillars = getAllPillars().filter(p => p.id !== pillarId);
  
  // Calcular score de similitud basado en tags comunes
  const pillarsWithScore = allPillars.map(pillar => {
    const commonTags = currentPillar.tags.filter(tag => pillar.tags.includes(tag));
    const score = commonTags.length;
    return { pillar, score };
  });

  return pillarsWithScore
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ pillar }) => pillar);
}

/**
 * Buscar pilares por keywords o tags
 */
export function searchPillars(query: string): PillarSearchResult[] {
  const queryLower = query.toLowerCase();
  const allPillars = getAllPillars();

  const results = allPillars.map(pillar => {
    let relevanceScore = 0;
    const matchedKeywords: string[] = [];
    const matchedTags: string[] = [];

    // Buscar en título
    if (pillar.title.toLowerCase().includes(queryLower)) {
      relevanceScore += 10;
    }

    // Buscar en descripción
    if (pillar.description.toLowerCase().includes(queryLower)) {
      relevanceScore += 5;
    }

    // Buscar en keywords
    pillar.keywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(queryLower)) {
        relevanceScore += 3;
        matchedKeywords.push(keyword);
      }
    });

    // Buscar en tags
    pillar.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        relevanceScore += 2;
        matchedTags.push(tag);
      }
    });

    return {
      pillar,
      relevanceScore,
      matchedKeywords,
      matchedTags
    };
  });

  return results
    .filter(result => result.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Filtrar pilares según criterios
 */
export function filterPillars(filters: PillarFilters): ContentPillar[] {
  let pillars = getAllPillars();

  // Filtrar por featured
  if (filters.featured !== undefined) {
    pillars = pillars.filter(pillar => pillar.featured === filters.featured);
  }

  // Filtrar por tags
  if (filters.tags && filters.tags.length > 0) {
    pillars = pillars.filter(pillar => 
      filters.tags!.some(tag => pillar.tags.includes(tag))
    );
  }

  // Filtrar por keywords
  if (filters.keywords && filters.keywords.length > 0) {
    pillars = pillars.filter(pillar =>
      filters.keywords!.some(keyword => 
        pillar.keywords.some(pk => pk.toLowerCase().includes(keyword.toLowerCase()))
      )
    );
  }

  // Ordenar
  if (filters.sortBy) {
    pillars.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'priority':
          comparison = a.priority - b.priority;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = a.priority - b.priority;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  return pillars;
}

/**
 * Validar configuración de pilar
 */
export function validatePillar(pillar: Partial<ContentPillar>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validaciones requeridas
  if (!pillar.id) errors.push('ID is required');
  if (!pillar.title) errors.push('Title is required');
  if (!pillar.description) errors.push('Description is required');
  if (!pillar.color?.primary) errors.push('Primary color is required');
  if (!pillar.icon) errors.push('Icon is required');
  if (!pillar.emoji) errors.push('Emoji is required');

  // Validaciones de formato
  if (pillar.id && !/^[a-z0-9-]+$/.test(pillar.id)) {
    errors.push('ID must contain only lowercase letters, numbers, and hyphens');
  }

  if (pillar.color?.primary && !/^#[0-9A-Fa-f]{6}$/.test(pillar.color.primary)) {
    errors.push('Primary color must be a valid hex color');
  }

  // Warnings
  if (pillar.description && pillar.description.length > 200) {
    warnings.push('Description is quite long, consider shortening it');
  }

  if (pillar.tags && pillar.tags.length === 0) {
    warnings.push('Consider adding some tags for better categorization');
  }

  if (pillar.keywords && pillar.keywords.length === 0) {
    warnings.push('Consider adding keywords for better SEO');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generar URL para página de pilar
 */
export function generatePillarUrl(pillarId: string): string {
  return `/blog/pillar/${pillarId}`;
}

/**
 * Generar breadcrumbs para página de pilar
 */
export function generatePillarBreadcrumbs(pillarId: string) {
  const pillar = getPillarById(pillarId);
  if (!pillar) return [];

  return [
    { label: 'Inicio', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Pilares', href: '/blog/pillars' },
    { label: pillar.title, current: true }
  ];
}
