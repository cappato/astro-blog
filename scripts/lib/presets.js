/**
 * Configuración de presets para optimización de imágenes
 * Centraliza todos los formatos y calidades disponibles
 */

/**
 * Presets de optimización de imágenes
 * Cada preset define width, height, format, quality y fit
 */
export const PRESETS = {
  // Preset por defecto para imágenes generales
  default: {
    width: 1200,
    height: null,
    format: 'webp',
    quality: 80
  },

  // Open Graph para redes sociales (WebP)
  og: {
    width: 1200,
    height: 630,
    format: 'webp',
    quality: 80,
    fit: 'cover'
  },

  // Open Graph en JPEG para mayor compatibilidad
  'og-jpg': {
    width: 1200,
    height: 630,
    format: 'jpeg',
    quality: 80,
    fit: 'cover'
  },

  // Thumbnails para previews
  thumb: {
    width: 600,
    height: 315,
    format: 'webp',
    quality: 80,
    fit: 'cover'
  },

  // WhatsApp Stories (cuadrado)
  wsp: {
    width: 1080,
    height: 1080,
    format: 'webp',
    quality: 80,
    fit: 'cover'
  },

  // AVIF para navegadores modernos
  'avif': {
    width: 1200,
    height: null,
    format: 'avif',
    quality: 65,
    fit: 'inside'
  },

  // Open Graph en AVIF
  'og-avif': {
    width: 1200,
    height: 630,
    format: 'avif',
    quality: 65,
    fit: 'cover'
  },

  // Low Quality Image Placeholder
  'lqip': {
    width: 20,
    height: null,
    format: 'webp',
    quality: 20,
    fit: 'inside'
  }
};

/**
 * Configuración de rutas del proyecto
 */
export const PATHS = {
  RAW_DIR: 'images/raw',
  PUBLIC_DIR: 'public/images'
};

/**
 * Extensiones de archivo soportadas
 */
export const SUPPORTED_EXTENSIONS = /\.(jpg|jpeg|png|webp)$/i;

/**
 * Configuración de archivos especiales
 */
export const SPECIAL_FILES = {
  COVER_PATTERN: /^portada\.(jpg|jpeg|png|webp)$/i
};

/**
 * Obtener preset por nombre
 * @param {string} presetName - Nombre del preset
 * @returns {Object|null} Configuración del preset o null si no existe
 */
export function getPreset(presetName) {
  return PRESETS[presetName] || null;
}

/**
 * Obtener todos los nombres de presets disponibles
 * @returns {string[]} Array con nombres de presets
 */
export function getPresetNames() {
  return Object.keys(PRESETS);
}

/**
 * Verificar si un archivo es una imagen soportada
 * @param {string} filename - Nombre del archivo
 * @returns {boolean} True si es una extensión soportada
 */
export function isSupportedImage(filename) {
  return SUPPORTED_EXTENSIONS.test(filename);
}

/**
 * Verificar si un archivo es una imagen de portada
 * @param {string} filename - Nombre del archivo
 * @returns {boolean} True si es una imagen de portada
 */
export function isCoverImage(filename) {
  return SPECIAL_FILES.COVER_PATTERN.test(filename);
}

/**
 * Generar nombre de archivo de salida
 * @param {string} baseName - Nombre base sin extensión
 * @param {string} presetName - Nombre del preset
 * @param {string} format - Formato de salida
 * @returns {string} Nombre de archivo con sufijo y extensión
 */
export function generateOutputFilename(baseName, presetName, format) {
  const suffix = presetName === 'default' ? '' : `-${presetName}`;
  return `${baseName}${suffix}.${format}`;
}
