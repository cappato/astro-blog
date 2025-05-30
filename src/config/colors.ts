/**
 * Sistema de colores centralizado
 * Paleta de colores consistente para todo el sitio
 */

/** Colores primarios del sitio */
export const PRIMARY_COLORS = {
  /** Azul principal - RGB(105, 156, 249) */
  blue: {
    50: '#EBF2FF',
    100: '#D6E4FF',
    200: '#B3CCFF',
    300: '#8FB5FF',
    400: '#699CF9', // Color principal
    500: '#5A8AE0', // Hover
    600: '#4A73C7',
    700: '#3B5CAE',
    800: '#2C4595',
    900: '#1D2E7C'
  },
  
  /** Verde secundario - RGB(162, 246, 120) */
  green: {
    50: '#F0FFF4',
    100: '#C6F6D5',
    200: '#9AE6B4',
    300: '#68D391',
    400: '#A2F678', // Color principal
    500: '#8FDB6A', // Hover
    600: '#7BC258',
    700: '#68A946',
    800: '#559034',
    900: '#427722'
  }
} as const;

/** Colores de grises para el tema oscuro */
export const GRAY_COLORS = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827' // Fondo principal oscuro
} as const;

/** Colores semánticos */
export const SEMANTIC_COLORS = {
  /** Colores de estado */
  success: {
    light: PRIMARY_COLORS.green[400],
    dark: PRIMARY_COLORS.green[500],
    bg: PRIMARY_COLORS.green[50],
    text: PRIMARY_COLORS.green[800]
  },
  
  warning: {
    light: '#FCD34D',
    dark: '#F59E0B',
    bg: '#FFFBEB',
    text: '#92400E'
  },
  
  error: {
    light: '#F87171',
    dark: '#DC2626',
    bg: '#FEF2F2',
    text: '#991B1B'
  },
  
  info: {
    light: PRIMARY_COLORS.blue[400],
    dark: PRIMARY_COLORS.blue[500],
    bg: PRIMARY_COLORS.blue[50],
    text: PRIMARY_COLORS.blue[800]
  }
} as const;

/** Colores para redes sociales */
export const SOCIAL_COLORS = {
  facebook: {
    brand: '#1877F2',
    bg: PRIMARY_COLORS.blue[400], // Usar nuestro azul consistente
    hover: PRIMARY_COLORS.blue[500],
    text: '#FFFFFF'
  },
  
  twitter: {
    brand: '#1DA1F2',
    bg: PRIMARY_COLORS.blue[400], // Usar nuestro azul consistente
    hover: PRIMARY_COLORS.blue[500],
    text: '#FFFFFF'
  },
  
  linkedin: {
    brand: '#0A66C2',
    bg: PRIMARY_COLORS.blue[400], // Usar nuestro azul consistente
    hover: PRIMARY_COLORS.blue[500],
    text: '#FFFFFF'
  },
  
  github: {
    brand: '#181717',
    bg: GRAY_COLORS[700],
    hover: GRAY_COLORS[600],
    text: '#FFFFFF'
  },
  
  whatsapp: {
    brand: '#25D366',
    bg: PRIMARY_COLORS.green[400], // Usar nuestro verde consistente
    hover: PRIMARY_COLORS.green[500],
    text: '#FFFFFF'
  },
  
  email: {
    brand: '#EA4335',
    bg: SEMANTIC_COLORS.error.light,
    hover: SEMANTIC_COLORS.error.dark,
    text: '#FFFFFF'
  }
} as const;

/** Configuración de tema */
export const THEME_CONFIG = {
  /** Tema oscuro (principal) */
  dark: {
    background: {
      primary: GRAY_COLORS[900],
      secondary: GRAY_COLORS[800],
      tertiary: GRAY_COLORS[700]
    },
    text: {
      primary: GRAY_COLORS[100],
      secondary: GRAY_COLORS[300],
      tertiary: GRAY_COLORS[400],
      muted: GRAY_COLORS[500]
    },
    border: {
      primary: GRAY_COLORS[700],
      secondary: GRAY_COLORS[600],
      accent: PRIMARY_COLORS.blue[400]
    },
    accent: {
      primary: PRIMARY_COLORS.blue[400],
      secondary: PRIMARY_COLORS.green[400],
      hover: PRIMARY_COLORS.blue[500]
    }
  },
  
  /** Tema claro (futuro) */
  light: {
    background: {
      primary: '#FFFFFF',
      secondary: GRAY_COLORS[50],
      tertiary: GRAY_COLORS[100]
    },
    text: {
      primary: GRAY_COLORS[900],
      secondary: GRAY_COLORS[700],
      tertiary: GRAY_COLORS[600],
      muted: GRAY_COLORS[500]
    },
    border: {
      primary: GRAY_COLORS[200],
      secondary: GRAY_COLORS[300],
      accent: PRIMARY_COLORS.blue[400]
    },
    accent: {
      primary: PRIMARY_COLORS.blue[400],
      secondary: PRIMARY_COLORS.green[400],
      hover: PRIMARY_COLORS.blue[500]
    }
  }
} as const;

/** Utilidades de color */
export const COLOR_UTILS = {
  /** Convertir hex a RGB */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  /** Convertir RGB a hex */
  rgbToHex: (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  
  /** Añadir transparencia a un color hex */
  addAlpha: (hex: string, alpha: number): string => {
    const rgb = COLOR_UTILS.hexToRgb(hex);
    return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : hex;
  }
} as const;

/** Exportar colores principales para fácil acceso */
export const COLORS = {
  primary: PRIMARY_COLORS.blue[400],
  primaryHover: PRIMARY_COLORS.blue[500],
  secondary: PRIMARY_COLORS.green[400],
  secondaryHover: PRIMARY_COLORS.green[500],
  background: GRAY_COLORS[900],
  surface: GRAY_COLORS[800],
  text: GRAY_COLORS[100],
  textSecondary: GRAY_COLORS[300],
  border: GRAY_COLORS[700],
  ...SEMANTIC_COLORS
} as const;
