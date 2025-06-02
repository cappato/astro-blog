/**
 * Content Pillars Feature - Configuration
 * 
 * Configuración de los pilares de contenido del blog
 * Define categorías estratégicas, colores, iconos y metadatos
 */

export interface ContentPillar {
  id: string;
  title: string;
  description: string;
  color: {
    primary: string;
    secondary: string;
    background: string;
  };
  icon: string;
  emoji: string;
  keywords: string[];
  tags: string[];
  priority: number;
  featured: boolean;
  seoMetadata: {
    title: string;
    description: string;
    keywords: string[];
  };
}

/**
 * Configuración principal de los pilares de contenido
 */
export const CONTENT_PILLARS: Record<string, ContentPillar> = {
  'astro-performance': {
    id: 'astro-performance',
    title: 'Astro & Performance',
    description: 'Desarrollo moderno con Astro, optimización de performance y arquitecturas escalables para la web del futuro.',
    color: {
      primary: '#FF5D01',
      secondary: '#FF8533',
      background: 'rgba(255, 93, 1, 0.1)'
    },
    icon: 'rocket',
    emoji: '🚀',
    keywords: ['astro', 'performance', 'web vitals', 'optimization', 'modern web'],
    tags: ['astro', 'performance', 'optimization', 'web-vitals', 'ssr', 'static-site'],
    priority: 1,
    featured: true,
    seoMetadata: {
      title: 'Astro & Performance - Desarrollo Web Moderno',
      description: 'Aprende Astro, optimización de performance y arquitecturas modernas para crear sitios web ultra-rápidos.',
      keywords: ['astro framework', 'web performance', 'optimización web', 'desarrollo moderno', 'static site generator']
    }
  },

  'typescript-architecture': {
    id: 'typescript-architecture',
    title: 'TypeScript & Architecture',
    description: 'TypeScript avanzado, patrones de diseño, arquitecturas escalables y mejores prácticas para proyectos enterprise.',
    color: {
      primary: '#3178C6',
      secondary: '#5B9BD5',
      background: 'rgba(49, 120, 198, 0.1)'
    },
    icon: 'code',
    emoji: '🏗️',
    keywords: ['typescript', 'architecture', 'design patterns', 'scalability', 'enterprise'],
    tags: ['typescript', 'architecture', 'design-patterns', 'scalability', 'enterprise', 'clean-code'],
    priority: 2,
    featured: true,
    seoMetadata: {
      title: 'TypeScript & Architecture - Desarrollo Enterprise',
      description: 'Domina TypeScript avanzado y arquitecturas escalables para proyectos enterprise de gran escala.',
      keywords: ['typescript avanzado', 'arquitectura software', 'patrones diseño', 'desarrollo enterprise', 'clean architecture']
    }
  },

  'automation-devops': {
    id: 'automation-devops',
    title: 'Automation & DevOps',
    description: 'Automatización de procesos, testing, CI/CD, deployment y herramientas DevOps para equipos de desarrollo.',
    color: {
      primary: '#00D8FF',
      secondary: '#33E0FF',
      background: 'rgba(0, 216, 255, 0.1)'
    },
    icon: 'cog',
    emoji: '⚙️',
    keywords: ['automation', 'devops', 'ci/cd', 'testing', 'deployment'],
    tags: ['automation', 'devops', 'ci-cd', 'testing', 'deployment', 'docker', 'github-actions'],
    priority: 3,
    featured: true,
    seoMetadata: {
      title: 'Automation & DevOps - Procesos Automatizados',
      description: 'Automatiza tu workflow de desarrollo con CI/CD, testing automatizado y mejores prácticas DevOps.',
      keywords: ['automatización desarrollo', 'devops', 'ci cd', 'testing automatizado', 'deployment automation']
    }
  },

  'seo-optimization': {
    id: 'seo-optimization',
    title: 'SEO & Optimization',
    description: 'SEO técnico, optimización automática, Schema.org, meta tags y estrategias para mejorar el ranking.',
    color: {
      primary: '#34A853',
      secondary: '#5CBF73',
      background: 'rgba(52, 168, 83, 0.1)'
    },
    icon: 'search',
    emoji: '🔍',
    keywords: ['seo', 'optimization', 'schema.org', 'meta tags', 'search ranking'],
    tags: ['seo', 'optimization', 'schema.org', 'meta-tags', 'search-ranking', 'google'],
    priority: 4,
    featured: false,
    seoMetadata: {
      title: 'SEO & Optimization - Posicionamiento Web',
      description: 'Domina el SEO técnico y optimización automática para mejorar el ranking de tus sitios web.',
      keywords: ['seo técnico', 'optimización web', 'schema.org', 'meta tags', 'posicionamiento google']
    }
  }
};

/**
 * Configuración del comportamiento del módulo
 */
export const PILLARS_CONFIG = {
  // Display settings
  display: {
    showInNavigation: true,
    showInFooter: true,
    showInSidebar: true,
    maxFeaturedPillars: 3,
    showPostCount: true,
    showDescription: true
  },

  // Layout settings
  layout: {
    gridColumns: {
      desktop: 3,
      tablet: 2,
      mobile: 1
    },
    cardStyle: 'modern', // 'modern' | 'minimal' | 'classic'
    showIcons: true,
    showEmojis: true
  },

  // SEO settings
  seo: {
    generatePillarPages: true,
    includeInSitemap: true,
    generateRSSFeeds: true,
    structuredData: true
  },

  // Analytics settings
  analytics: {
    trackPillarViews: true,
    trackPillarClicks: true,
    trackPostsByPillar: true
  }
};

/**
 * Mapeo de tags a pilares
 * Permite clasificar automáticamente posts en pilares basado en sus tags
 */
export const TAG_TO_PILLAR_MAPPING: Record<string, string> = {
  // Astro & Performance
  'astro': 'astro-performance',
  'performance': 'astro-performance',
  'optimization': 'astro-performance',
  'web-vitals': 'astro-performance',
  'ssr': 'astro-performance',
  'static-site': 'astro-performance',

  // TypeScript & Architecture
  'typescript': 'typescript-architecture',
  'architecture': 'typescript-architecture',
  'design-patterns': 'typescript-architecture',
  'scalability': 'typescript-architecture',
  'enterprise': 'typescript-architecture',
  'clean-code': 'typescript-architecture',

  // Automation & DevOps
  'automation': 'automation-devops',
  'devops': 'automation-devops',
  'testing': 'automation-devops',
  'ci-cd': 'automation-devops',
  'deployment': 'automation-devops',
  'docker': 'automation-devops',
  'github-actions': 'automation-devops',

  // SEO & Optimization
  'seo': 'seo-optimization',
  'meta-tags': 'seo-optimization',
  'schema.org': 'seo-optimization',
  'search-ranking': 'seo-optimization',
  'google': 'seo-optimization'
};

/**
 * Utilidad para obtener pilares featured
 */
export function getFeaturedPillars(): ContentPillar[] {
  return Object.values(CONTENT_PILLARS)
    .filter(pillar => pillar.featured)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Utilidad para obtener pilar por ID
 */
export function getPillarById(id: string): ContentPillar | undefined {
  return CONTENT_PILLARS[id];
}

/**
 * Utilidad para detectar pilar de un post basado en sus tags
 */
export function detectPostPillar(tags: string[]): string | undefined {
  for (const tag of tags) {
    const pillarId = TAG_TO_PILLAR_MAPPING[tag];
    if (pillarId) {
      return pillarId;
    }
  }
  return undefined;
}

/**
 * Utilidad para obtener todos los pilares ordenados por prioridad
 */
export function getAllPillars(): ContentPillar[] {
  return Object.values(CONTENT_PILLARS)
    .sort((a, b) => a.priority - b.priority);
}
