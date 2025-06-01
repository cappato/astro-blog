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

/** Navigation System Configuration */
export const NAVIGATION_CONFIG = {
  /** Home page navigation items */
  homeNavItems: [
    { href: "#about", label: "About me", section: "about" },
    { href: "#experience", label: "Experience", section: "experience" },
    { href: "#education", label: "Education", section: "education" },
    { href: "#skills", label: "Skills", section: "skills" },
    { href: "#achievements", label: "Achievements", section: "achievements" },
    { href: "#hobbies", label: "Hobbies", section: "hobbies" },
    { href: "#contact", label: "Contact", section: "contact" }
  ],

  /** Main navigation links */
  mainNavItems: [
    { name: 'Inicio', href: '/', icon: 'home' },
    { name: 'Blog', href: '/blog', icon: 'blog' },
    { name: 'Sobre mí', href: '/#about', icon: 'user' },
    { name: 'Contacto', href: '/#contact', icon: 'email' }
  ],

  /** Footer navigation links */
  footerNavItems: [
    { name: 'Política de Privacidad', href: '/privacy' },
    { name: 'Términos de Uso', href: '/terms' },
    { name: 'RSS', href: '/rss.xml' },
    { name: 'Sitemap', href: '/sitemap.xml' }
  ],

  /** Navigation behavior configuration */
  behavior: {
    /** Navbar height for scroll offset calculations */
    navbarHeight: 80,

    /** Additional offset for specific sections */
    sectionOffsets: {
      about: 20,
      default: 0
    },

    /** Scroll detection thresholds */
    scrollThresholds: {
      /** Minimum scroll to activate section detection */
      minScroll: 300,
      /** Section detection viewport offset */
      sectionDetection: 100,
      /** Bottom detection offset */
      bottomDetection: 100
    },

    /** Performance settings */
    performance: {
      /** Section detection interval (ms) */
      detectionInterval: 100,
      /** Scroll debounce delay (ms) */
      scrollDebounce: 16
    }
  }
} as const;

/** Legacy export for backward compatibility */
export const NAVIGATION = {
  main: NAVIGATION_CONFIG.mainNavItems,
  footer: NAVIGATION_CONFIG.footerNavItems
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

/** Blog Post Configuration */
export const BLOG_POST_CONFIG = {
  /** Posts per page for pagination */
  postsPerPage: 10,

  /** Date formatting configuration */
  dateFormat: {
    locale: 'es-ES',
    options: {
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const
    }
  },

  /** Content configuration */
  content: {
    excerptLength: 160,
    readingSpeed: 200, // words per minute
    defaultTags: ['blog', 'desarrollo', 'web']
  },

  /** URL configuration */
  urls: {
    basePath: '/blog',
    tagBasePath: '/blog/tag'
  },

  /** Image configuration */
  images: {
    thumbnail: {
      width: 600,
      height: 315,
      format: 'webp'
    },
    fallback: {
      text: 'Sin imagen',
      bgClass: 'bg-muted dark:bg-muted-dark'
    }
  },

  /** Card styling configuration */
  cardStyles: {
    base: 'card-base overflow-hidden shadow-theme-lg hover:shadow-xl transition-all duration-200',
    image: 'w-full h-48 object-cover',
    content: 'p-4',
    title: 'text-xl font-bold mb-2',
    titleLink: 'text-primary hover:underline',
    date: 'text-content text-sm mb-3 opacity-75',
    description: 'text-content mb-4 line-clamp-3 opacity-90',
    readMore: 'mt-4 inline-block text-primary hover:underline text-sm font-medium'
  },

  /** SEO configuration */
  seo: {
    blogTitle: 'Blog | Matías Cappato',
    blogDescription: 'Artículos sobre desarrollo web, programación, tecnología y más por Matías Cappato. Aprende sobre JavaScript, React, Node.js y las últimas tendencias en desarrollo.',
    tagTitleTemplate: 'Artículos sobre {tag} | Blog | Matías Cappato',
    tagDescriptionTemplate: 'Descubre todos los artículos sobre {tag} en el blog de Matías Cappato. Aprende sobre desarrollo web, programación y tecnología.'
  },

  /** Comments configuration */
  comments: {
    enabled: false,
    provider: null // 'disqus' | 'giscus' | null
  },

  /** RSS configuration */
  rss: {
    enabled: true,
    title: `${SITE_INFO.title} - Blog`,
    description: 'Últimos artículos sobre desarrollo web y tecnología',
    feedUrl: `${SITE_INFO.url}/rss.xml`
  }
} as const;

/** Legacy export for backward compatibility */
export const BLOG_CONFIG = {
  postsPerPage: BLOG_POST_CONFIG.postsPerPage,
  dateFormat: 'dd/MM/yyyy',
  excerptLength: BLOG_POST_CONFIG.content.excerptLength,
  defaultTags: BLOG_POST_CONFIG.content.defaultTags,
  comments: BLOG_POST_CONFIG.comments,
  rss: BLOG_POST_CONFIG.rss
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

/** Favicon System Configuration */
export const FAVICON_CONFIG = {
  /** Theme colors for mobile browsers */
  themeColor: {
    light: '#699CF9',
    dark: '#699CF9'
  },

  /** Microsoft tile color */
  msApplicationTileColor: '#699CF9',

  /** Favicon paths configuration */
  paths: {
    appleTouchIcon: '/apple-touch-icon.png',
    favicon32: '/favicon-32x32.png',
    favicon16: '/favicon-16x16.png',
    manifest: '/site.webmanifest',
    shortcutIcon: '/favicon.ico',
    androidChrome192: '/android-chrome-192x192.png',
    androidChrome512: '/android-chrome-512x512.png'
  },

  /** Icon sizes configuration */
  sizes: {
    appleTouchIcon: '180x180',
    favicon32: '32x32',
    favicon16: '16x16',
    androidChrome192: '192x192',
    androidChrome512: '512x512'
  },

  /** MIME types */
  mimeTypes: {
    png: 'image/png',
    ico: 'image/x-icon'
  }
} as const;

/** AI Metadata Configuration */
export const AI_METADATA_CONFIG = {
  /** Language configuration */
  language: 'es',

  /** Schema.org context */
  schemaContext: 'https://schema.org',

  /** Default accessibility */
  isAccessibleForFree: true,

  /** AI metadata file path */
  metadataFilePath: '/ai-metadata.json',

  /** Meta tag prefixes */
  metaTagPrefix: 'ai:',

  /** Author configuration */
  author: {
    type: 'Person',
    name: SITE_INFO.author.name,
    url: `${SITE_INFO.url}/about`
  },

  /** Action types */
  actionTypes: {
    read: 'ReadAction',
    view: 'ViewAction',
    search: 'SearchAction'
  },

  /** Content types mapping */
  contentTypes: {
    website: 'WebSite',
    article: 'BlogPosting',
    profile: 'Person',
    blog: 'Blog'
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
