/**
 * Configuración centralizada del sitio
 * Punto de entrada único para toda la configuración
 */

// Exportar todas las configuraciones
export * from './site';
export * from './colors';
export * from './urls';

// Re-exportar las configuraciones más utilizadas para fácil acceso
export { SITE_INFO, SOCIAL_LINKS, NAVIGATION, SEO_DEFAULTS, BLOG_CONFIG } from './site';
export { COLORS, PRIMARY_COLORS, SOCIAL_COLORS, THEME_CONFIG } from './colors';
export { SHARE_APIS, INTERNAL_URLS, URL_UTILS, BREAKPOINTS } from './urls';

/**
 * Configuración combinada para fácil acceso
 * Agrupa las configuraciones más utilizadas
 */
export const CONFIG = {
  // Información del sitio
  site: {
    url: 'https://cappato.dev',
    title: 'Matías Cappato',
    description: 'Desarrollador Web Full Stack especializado en React, TypeScript y tecnologías modernas.',
    author: 'Matías Cappato',
    language: 'es'
  },
  
  // Colores principales
  colors: {
    primary: '#699CF9',
    primaryHover: '#5A8AE0',
    secondary: '#A2F678',
    secondaryHover: '#8FDB6A',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB'
  },
  
  // Redes sociales
  social: {
    twitter: '@matiascappato',
    github: 'cappato',
    linkedin: 'matiascappato',
    email: 'matias@cappato.dev'
  },
  
  // Blog
  blog: {
    postsPerPage: 10,
    dateFormat: 'dd/MM/yyyy',
    excerptLength: 160
  },
  
  // SEO
  seo: {
    defaultImage: '/images/og-default.webp',
    defaultImageAlt: 'Matías Cappato - Desarrollador Web',
    twitterCard: 'summary_large_image'
  }
} as const;

/**
 * Tipo para la configuración completa
 * Útil para TypeScript y validación
 */
export type SiteConfig = typeof CONFIG;

/**
 * Validar configuración
 * Verifica que todas las configuraciones requeridas estén presentes
 */
export const validateConfig = (): boolean => {
  const required = [
    CONFIG.site.url,
    CONFIG.site.title,
    CONFIG.site.description,
    CONFIG.site.author,
    CONFIG.colors.primary,
    CONFIG.colors.secondary
  ];
  
  return required.every(value => value && value.length > 0);
};

/**
 * Obtener configuración de entorno
 * Permite sobrescribir configuración según el entorno
 */
export const getEnvConfig = () => {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  
  return {
    isDev,
    isProd,
    baseUrl: isDev ? 'http://localhost:4321' : CONFIG.site.url,
    enableAnalytics: isProd,
    enableServiceWorker: isProd,
    logLevel: isDev ? 'debug' : 'error'
  };
};

/**
 * Configuración por defecto para componentes
 * Valores por defecto comunes para componentes
 */
export const COMPONENT_DEFAULTS = {
  // Botones
  button: {
    size: 'md' as const,
    variant: 'primary' as const,
    disabled: false
  },
  
  // Imágenes
  image: {
    quality: 80,
    format: 'webp' as const,
    loading: 'lazy' as const
  },
  
  // Modales
  modal: {
    closeOnEscape: true,
    closeOnOverlay: true,
    showCloseButton: true
  },
  
  // Formularios
  form: {
    validateOnBlur: true,
    validateOnChange: false,
    showErrorMessages: true
  }
} as const;
