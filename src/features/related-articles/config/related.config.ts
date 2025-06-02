/**
 * Related Articles Feature - Configuration
 * 
 * Configuración para el sistema de artículos relacionados
 * Define algoritmos, pesos y comportamiento del sistema
 */

export interface RelatedArticlesConfig {
  // Algoritmo de recomendación
  algorithm: {
    // Pesos para diferentes factores de similitud
    weights: {
      tags: number;           // Peso de tags comunes
      category: number;       // Peso de categoría/pilar común
      readingTime: number;    // Peso de tiempo de lectura similar
      publishDate: number;    // Peso de fecha de publicación cercana
      author: number;         // Peso de mismo autor
    };
    
    // Configuración de similitud
    similarity: {
      minTagOverlap: number;      // Mínimo de tags en común
      maxReadingTimeDiff: number; // Máxima diferencia en tiempo de lectura (minutos)
      maxDateDiff: number;        // Máxima diferencia en días
      minSimilarityScore: number; // Score mínimo para considerar relacionado
    };
  };
  
  // Configuración de display
  display: {
    maxArticles: number;        // Máximo número de artículos relacionados
    showReadingTime: boolean;   // Mostrar tiempo de lectura
    showPublishDate: boolean;   // Mostrar fecha de publicación
    showTags: boolean;          // Mostrar tags
    showExcerpt: boolean;       // Mostrar extracto
    showAuthor: boolean;        // Mostrar autor
    showThumbnail: boolean;     // Mostrar imagen thumbnail
  };
  
  // Configuración de layout
  layout: {
    variant: 'grid' | 'list' | 'carousel';
    columns: {
      desktop: number;
      tablet: number;
      mobile: number;
    };
    cardStyle: 'minimal' | 'standard' | 'detailed';
  };
  
  // Configuración de performance
  performance: {
    enableCaching: boolean;     // Habilitar cache de resultados
    cacheTimeout: number;       // Timeout del cache en segundos
    maxCacheSize: number;       // Máximo número de entradas en cache
  };
  
  // Configuración de analytics
  analytics: {
    trackViews: boolean;        // Trackear visualizaciones
    trackClicks: boolean;       // Trackear clicks
    trackEngagement: boolean;   // Trackear engagement
  };
}

/**
 * Configuración por defecto del sistema de artículos relacionados
 */
export const DEFAULT_RELATED_CONFIG: RelatedArticlesConfig = {
  algorithm: {
    weights: {
      tags: 0.4,           // 40% - Tags son muy importantes
      category: 0.3,       // 30% - Categoría/pilar es importante
      readingTime: 0.15,   // 15% - Tiempo de lectura similar
      publishDate: 0.1,    // 10% - Fecha de publicación
      author: 0.05         // 5% - Mismo autor (menos importante en blog personal)
    },
    similarity: {
      minTagOverlap: 1,           // Al menos 1 tag en común
      maxReadingTimeDiff: 10,     // Máximo 10 minutos de diferencia
      maxDateDiff: 365,           // Máximo 1 año de diferencia
      minSimilarityScore: 0.2     // Score mínimo del 20%
    }
  },
  
  display: {
    maxArticles: 3,         // Mostrar máximo 3 artículos relacionados
    showReadingTime: true,
    showPublishDate: true,
    showTags: true,
    showExcerpt: true,
    showAuthor: false,      // No mostrar autor en blog personal
    showThumbnail: true
  },
  
  layout: {
    variant: 'grid',
    columns: {
      desktop: 3,
      tablet: 2,
      mobile: 1
    },
    cardStyle: 'standard'
  },
  
  performance: {
    enableCaching: true,
    cacheTimeout: 3600,     // 1 hora
    maxCacheSize: 100       // 100 entradas máximo
  },
  
  analytics: {
    trackViews: true,
    trackClicks: true,
    trackEngagement: true
  }
};

/**
 * Configuraciones predefinidas para diferentes contextos
 */
export const RELATED_PRESETS = {
  // Para posts largos y técnicos
  technical: {
    ...DEFAULT_RELATED_CONFIG,
    algorithm: {
      ...DEFAULT_RELATED_CONFIG.algorithm,
      weights: {
        tags: 0.5,
        category: 0.35,
        readingTime: 0.1,
        publishDate: 0.05,
        author: 0
      }
    },
    display: {
      ...DEFAULT_RELATED_CONFIG.display,
      maxArticles: 4,
      showExcerpt: false,
      showTags: true
    }
  },
  
  // Para posts cortos y noticias
  news: {
    ...DEFAULT_RELATED_CONFIG,
    algorithm: {
      ...DEFAULT_RELATED_CONFIG.algorithm,
      weights: {
        tags: 0.3,
        category: 0.2,
        readingTime: 0.1,
        publishDate: 0.4,
        author: 0
      },
      similarity: {
        ...DEFAULT_RELATED_CONFIG.algorithm.similarity,
        maxDateDiff: 90  // Solo 3 meses para noticias
      }
    }
  },
  
  // Para tutoriales y guías
  tutorial: {
    ...DEFAULT_RELATED_CONFIG,
    algorithm: {
      ...DEFAULT_RELATED_CONFIG.algorithm,
      weights: {
        tags: 0.45,
        category: 0.4,
        readingTime: 0.15,
        publishDate: 0,
        author: 0
      }
    },
    display: {
      ...DEFAULT_RELATED_CONFIG.display,
      maxArticles: 5,
      showReadingTime: true,
      showExcerpt: true
    }
  }
};

/**
 * Configuración de exclusiones
 */
export const EXCLUSION_CONFIG = {
  // Posts que nunca deben aparecer como relacionados
  excludedSlugs: [
    'bienvenida-a-mi-blog',  // Post de bienvenida
    'about',                 // Página about
    'contact'                // Página de contacto
  ],
  
  // Tags que reducen la relevancia
  lowPriorityTags: [
    'bienvenida',
    'meta',
    'announcement'
  ],
  
  // Tags que aumentan la relevancia
  highPriorityTags: [
    'tutorial',
    'guide',
    'advanced',
    'tips'
  ]
};

/**
 * Configuración de fallbacks
 */
export const FALLBACK_CONFIG = {
  // Si no hay suficientes artículos relacionados, usar estos criterios
  fallbackStrategies: [
    'same_category',     // Misma categoría/pilar
    'popular_tags',      // Tags populares
    'recent_posts',      // Posts recientes
    'random_selection'   // Selección aleatoria
  ],
  
  // Mínimo número de artículos a mostrar
  minArticles: 2,
  
  // Máximo número de artículos de fallback
  maxFallbackArticles: 1
};

/**
 * Utilidad para obtener configuración por tipo de post
 */
export function getConfigForPostType(postType: 'technical' | 'news' | 'tutorial' | 'default'): RelatedArticlesConfig {
  switch (postType) {
    case 'technical':
      return RELATED_PRESETS.technical;
    case 'news':
      return RELATED_PRESETS.news;
    case 'tutorial':
      return RELATED_PRESETS.tutorial;
    default:
      return DEFAULT_RELATED_CONFIG;
  }
}

/**
 * Utilidad para detectar tipo de post basado en tags
 */
export function detectPostType(tags: string[]): 'technical' | 'news' | 'tutorial' | 'default' {
  const tagSet = new Set(tags.map(tag => tag.toLowerCase()));
  
  // Detectar tutorial
  if (tagSet.has('tutorial') || tagSet.has('guide') || tagSet.has('how-to')) {
    return 'tutorial';
  }
  
  // Detectar técnico
  if (tagSet.has('advanced') || tagSet.has('architecture') || tagSet.has('performance')) {
    return 'technical';
  }
  
  // Detectar noticias
  if (tagSet.has('news') || tagSet.has('announcement') || tagSet.has('release')) {
    return 'news';
  }
  
  return 'default';
}
