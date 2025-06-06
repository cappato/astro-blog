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
    image: {
      src: '/images/blog/darkmode-cover.webp',
      alt: 'Astro y optimización de performance'
    },
    icon: 'rocket',
    emoji: '',
    keywords: ['astro', 'performance', 'web vitals', 'optimization', 'modern web'],
    tags: ['astro', 'performance', 'optimization', 'web-vitals', 'ssr', 'static-site'],
    priority: 1,
    featured: true,
    seoMetadata: {
      title: 'Astro & Performance - Desarrollo Web Moderno',
      description: 'Aprende Astro, optimización de performance y arquitecturas modernas para crear sitios web advanced-rápidos.',
      keywords: ['astro framework', 'web performance', 'optimización web', 'desarrollo moderno', 'static site generator']
    }
  },

  'typescript-architecture': {
    id: 'typescript-architecture',
    title: 'TypeScript & Architecture',
    description: 'TypeScript avanzado, patrones de diseño, arquitecturas escalables y mejores prácticas para proyectos enterprise.',
    image: {
      src: '/images/blog/architecture-cover.webp',
      alt: 'TypeScript y arquitectura de software'
    },
    icon: 'code',
    emoji: '️',
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
    image: {
      src: '/images/blog/testing-cover.webp',
      alt: 'Automatización y DevOps'
    },
    icon: 'cog',
    emoji: '️',
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
    image: {
      src: '/images/blog/seo-cover.webp',
      alt: 'SEO y optimización web'
    },
    icon: 'search',
    emoji: '',
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
 * Solo incluye tags que realmente existen en los posts del blog
 */
export const TAG_TO_PILLAR_MAPPING: Record<string, string> = {
  // Astro & Performance
  'astro': 'astro-performance',
  'performance': 'astro-performance',
  'ssr': 'astro-performance',

  // TypeScript & Architecture
  'typescript': 'typescript-architecture',
  'arquitectura': 'typescript-architecture', // Nota: en español en los posts
  'modular': 'typescript-architecture',
  'features': 'typescript-architecture',

  // Automation & DevOps
  'automation': 'automation-devops',
  'testing': 'automation-devops',
  'vitest': 'automation-devops',
  'seo-testing': 'automation-devops',

  // SEO & Optimization
  'seo': 'seo-optimization',
  'meta-tags': 'seo-optimization',
  'schema.org': 'seo-optimization',

  // Theme & UI (podría ir en cualquier pilar, lo ponemos en Astro & Performance)
  'dark-mode': 'astro-performance',
  'css-variables': 'astro-performance',
  'theme-system': 'astro-performance',

  // General tags (sin pilar específico, pero necesarios para el mapeo)
  'blog': 'astro-performance', // Tag general, lo asignamos a Astro
  'bienvenida': 'astro-performance' // Tag de bienvenida, lo asignamos a Astro
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
  // Orden de prioridad para pilares (más específico primero)
  const pillarPriority = [
    'typescript-architecture',  // Más específico
    'automation-devops',
    'seo-optimization',
    'astro-performance'         // Más general
  ];

  // Buscar por orden de prioridad
  for (const priorityPillar of pillarPriority) {
    for (const tag of tags) {
      const pillarId = TAG_TO_PILLAR_MAPPING[tag];
      if (pillarId === priorityPillar) {
        return pillarId;
      }
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
