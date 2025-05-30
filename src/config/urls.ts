/**
 * Configuración centralizada de URLs y endpoints
 * Todas las URLs externas y endpoints de APIs
 */

import { SITE_INFO } from './site';

/** URLs de APIs de redes sociales para compartir */
export const SHARE_APIS = {
  facebook: {
    web: 'https://www.facebook.com/sharer.php',
    mobile: 'fb://facewebmodal/f',
    params: {
      u: 'url' // parámetro para la URL
    }
  },
  
  twitter: {
    web: 'https://twitter.com/intent/tweet',
    mobile: 'twitter://post',
    params: {
      text: 'text',
      url: 'url',
      hashtags: 'hashtags',
      via: 'via'
    }
  },
  
  linkedin: {
    web: 'https://www.linkedin.com/sharing/share-offsite/',
    mobile: 'linkedin://sharing/share-offsite/',
    params: {
      url: 'url',
      title: 'title',
      summary: 'summary'
    }
  },
  
  whatsapp: {
    web: 'https://wa.me/',
    mobile: 'whatsapp://send',
    params: {
      text: 'text'
    }
  },
  
  telegram: {
    web: 'https://t.me/share/url',
    mobile: 'tg://msg_url',
    params: {
      url: 'url',
      text: 'text'
    }
  },
  
  reddit: {
    web: 'https://reddit.com/submit',
    params: {
      url: 'url',
      title: 'title'
    }
  }
} as const;

/** URLs de CDNs y servicios externos */
export const EXTERNAL_SERVICES = {
  /** CDNs de fuentes */
  fonts: {
    google: 'https://fonts.googleapis.com',
    googleStatic: 'https://fonts.gstatic.com'
  },
  
  /** APIs de terceros */
  apis: {
    gravatar: 'https://www.gravatar.com/avatar',
    github: 'https://api.github.com',
    unsplash: 'https://api.unsplash.com'
  },
  
  /** Servicios de analytics */
  analytics: {
    googleAnalytics: 'https://www.googletagmanager.com/gtag/js',
    googleTagManager: 'https://www.googletagmanager.com/gtm.js',
    plausible: 'https://plausible.io/js/script.js'
  },
  
  /** Servicios de comentarios */
  comments: {
    disqus: 'https://disqus.com/embed/comments/',
    giscus: 'https://giscus.app/client.js'
  }
} as const;

/** URLs internas del sitio */
export const INTERNAL_URLS = {
  /** Páginas principales */
  pages: {
    home: '/',
    blog: '/blog',
    about: '/#about',
    contact: '/#contact',
    privacy: '/privacy',
    terms: '/terms'
  },
  
  /** APIs internas */
  api: {
    contact: '/api/contact',
    newsletter: '/api/newsletter',
    search: '/api/search'
  },
  
  /** Feeds y sitemaps */
  feeds: {
    rss: '/rss.xml',
    atom: '/atom.xml',
    sitemap: '/sitemap.xml',
    robots: '/robots.txt'
  },
  
  /** Assets */
  assets: {
    images: '/images',
    icons: '/icons',
    fonts: '/fonts',
    downloads: '/downloads'
  }
} as const;

/** Configuración de ventanas emergentes para compartir */
export const POPUP_CONFIG = {
  facebook: {
    width: 600,
    height: 400,
    features: 'scrollbars=yes,resizable=yes,toolbar=no,location=yes'
  },
  
  twitter: {
    width: 550,
    height: 420,
    features: 'scrollbars=yes,resizable=yes,toolbar=no,location=yes'
  },
  
  linkedin: {
    width: 550,
    height: 420,
    features: 'scrollbars=yes,resizable=yes,toolbar=no,location=yes'
  },
  
  default: {
    width: 600,
    height: 400,
    features: 'scrollbars=yes,resizable=yes,toolbar=no,location=yes'
  }
} as const;

/** Configuración de breakpoints para detección móvil */
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  wide: 1536
} as const;

/** Expresiones regulares para validación de URLs */
export const URL_PATTERNS = {
  /** Detectar dispositivos móviles */
  mobileUserAgent: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
  
  /** Validar URLs */
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  /** Validar emails */
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  /** Detectar URLs de imágenes */
  image: /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i,
  
  /** Detectar URLs externas */
  external: new RegExp(`^(?!${SITE_INFO.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`),
  
  /** Detectar URLs de redes sociales */
  social: {
    twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//,
    facebook: /^https?:\/\/(www\.)?facebook\.com\//,
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\//,
    github: /^https?:\/\/(www\.)?github\.com\//,
    youtube: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//
  }
} as const;

/** Utilidades para trabajar con URLs */
export const URL_UTILS = {
  /** Hacer una URL absoluta */
  makeAbsolute: (url: string, base: string = SITE_INFO.url): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return new URL(url, base).toString();
  },
  
  /** Obtener el dominio de una URL */
  getDomain: (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  },
  
  /** Verificar si una URL es externa */
  isExternal: (url: string): boolean => {
    return URL_PATTERNS.external.test(url);
  },
  
  /** Generar URL de compartir */
  generateShareUrl: (platform: keyof typeof SHARE_APIS, params: Record<string, string>): string => {
    const config = SHARE_APIS[platform];
    if (!config) return '';
    
    const url = new URL(config.web);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    
    return url.toString();
  },
  
  /** Generar parámetros de ventana emergente */
  getPopupFeatures: (platform: keyof typeof POPUP_CONFIG): string => {
    const config = POPUP_CONFIG[platform] || POPUP_CONFIG.default;
    return `width=${config.width},height=${config.height},${config.features}`;
  }
} as const;
