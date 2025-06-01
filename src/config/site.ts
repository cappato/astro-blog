/**
 * Configuración central del sitio web
 * Todas las constantes relacionadas con información del sitio
 */

/** Información básica del sitio */
export const SITE_INFO = {
  /** URL principal del sitio */
  url: 'https://cappato.dev',
  
  /** Título del sitio */
  title: 'Matías Cappato',
  
  /** Descripción del sitio */
  description: 'Desarrollador Web Full Stack especializado en React, TypeScript y tecnologías modernas. Blog sobre desarrollo web, tutoriales y experiencias.',
  
  /** Autor principal */
  author: {
    name: 'Matías Cappato',
    email: 'matias@cappato.dev',
    bio: 'Desarrollador Web Full Stack especializado en React, TypeScript y tecnologías modernas.',
    location: 'Argentina',
    website: 'https://cappato.dev',
    avatar: '/images/avatar.webp'
  },
  
  /** Idioma principal */
  language: 'es',
  
  /** Zona horaria */
  timezone: 'America/Argentina/Buenos_Aires',
  
  /** Configuración de copyright */
  copyright: {
    year: new Date().getFullYear(),
    holder: 'Matías Cappato',
    message: `© ${new Date().getFullYear()} Matías Cappato. Todos los derechos reservados.`
  }
} as const;

/** URLs de redes sociales */
export const SOCIAL_LINKS = {
  twitter: {
    url: 'https://twitter.com/matiascappato',
    username: '@matiascappato',
    handle: 'matiascappato'
  },
  github: {
    url: 'https://github.com/cappato',
    username: 'cappato'
  },
  linkedin: {
    url: 'https://linkedin.com/in/matiascappato',
    username: 'matiascappato'
  },
  email: {
    url: 'mailto:matias@cappato.dev',
    address: 'matias@cappato.dev'
  }
} as const;

/** Configuración de navegación */
export const NAVIGATION = {
  /** Enlaces principales del menú */
  main: [
    { name: 'Inicio', href: '/', icon: 'home' },
    { name: 'Blog', href: '/blog', icon: 'blog' },
    { name: 'Sobre mí', href: '/#about', icon: 'user' },
    { name: 'Contacto', href: '/#contact', icon: 'email' }
  ],
  
  /** Enlaces del footer */
  footer: [
    { name: 'Política de Privacidad', href: '/privacy' },
    { name: 'Términos de Uso', href: '/terms' },
    { name: 'RSS', href: '/rss.xml' },
    { name: 'Sitemap', href: '/sitemap.xml' }
  ]
} as const;

/** Meta Tags Management Configuration */
export const META_TAGS_CONFIG = {
  /** Default image for Open Graph */
  defaultImage: '/images/og-default.webp',

  /** Default alt text for images */
  defaultImageAlt: 'Matías Cappato - Desarrollador Web',

  /** Default keywords */
  defaultKeywords: [
    'Matías Cappato',
    'Desarrollador Web',
    'Full Stack',
    'React',
    'TypeScript',
    'JavaScript',
    'Frontend',
    'Backend',
    'Blog',
    'Tutoriales',
    'Programación'
  ],

  /** Twitter Cards configuration */
  twitter: {
    card: 'summary_large_image',
    creator: SOCIAL_LINKS.twitter.username
  },

  /** Open Graph configuration */
  openGraph: {
    type: 'website',
    siteName: SITE_INFO.title,
    locale: 'es_ES'
  },

  /** Image format configuration */
  imageFormats: {
    webp: {
      extension: '.webp',
      mimeType: 'image/webp'
    },
    jpeg: {
      extension: '-og-jpg.jpeg',
      mimeType: 'image/jpeg'
    }
  }
} as const;

/** Legacy export for backward compatibility */
export const SEO_DEFAULTS = {
  defaultImage: META_TAGS_CONFIG.defaultImage,
  defaultImageAlt: META_TAGS_CONFIG.defaultImageAlt,
  defaultKeywords: META_TAGS_CONFIG.defaultKeywords,
  twitterCard: META_TAGS_CONFIG.twitter.card,
  ogType: META_TAGS_CONFIG.openGraph.type,
  ogSiteName: META_TAGS_CONFIG.openGraph.siteName
} as const;

/** Configuración del blog */
export const BLOG_CONFIG = {
  /** Número de posts por página */
  postsPerPage: 10,
  
  /** Formato de fecha para mostrar */
  dateFormat: 'dd/MM/yyyy',
  
  /** Configuración de excerpts */
  excerptLength: 160,
  
  /** Tags por defecto */
  defaultTags: ['blog', 'desarrollo', 'web'],
  
  /** Configuración de comentarios */
  comments: {
    enabled: false,
    provider: null // 'disqus' | 'giscus' | null
  },
  
  /** Configuración de RSS */
  rss: {
    enabled: true,
    title: `${SITE_INFO.title} - Blog`,
    description: 'Últimos artículos sobre desarrollo web y tecnología',
    feedUrl: `${SITE_INFO.url}/rss.xml`
  }
} as const;

/** Configuración de analytics y tracking */
export const ANALYTICS_CONFIG = {
  /** Google Analytics */
  googleAnalytics: {
    enabled: false,
    measurementId: '' // GA4 Measurement ID
  },
  
  /** Google Tag Manager */
  googleTagManager: {
    enabled: false,
    containerId: '' // GTM Container ID
  },
  
  /** Configuración de cookies */
  cookies: {
    enabled: true,
    consentRequired: true,
    categories: ['necessary', 'analytics', 'marketing']
  }
} as const;

/** Configuración de performance */
export const PERFORMANCE_CONFIG = {
  /** Configuración de imágenes */
  images: {
    formats: ['avif', 'webp', 'jpeg'],
    quality: 80,
    sizes: [400, 800, 1200, 1600],
    placeholder: 'blur'
  },
  
  /** Configuración de lazy loading */
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: '50px'
  },
  
  /** Configuración de prefetch */
  prefetch: {
    enabled: true,
    strategy: 'viewport'
  }
} as const;
