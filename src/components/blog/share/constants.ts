/**
 * Configuración y constantes para el sistema de compartir en redes sociales
 */

import type { SocialConfig } from './types';
import { SocialPlatform } from './types';
import { SHARE_APIS, POPUP_CONFIG, BREAKPOINTS } from '../../../config/urls';

// Colores directos en lugar de importar archivo eliminado
const SOCIAL_COLORS = {
  facebook: { bg: '#699CF9', hover: '#5A8AE0', text: '#FFFFFF' },
  twitter: { bg: '#699CF9', hover: '#5A8AE0', text: '#FFFFFF' },
  linkedin: { bg: '#699CF9', hover: '#5A8AE0', text: '#FFFFFF' },
  whatsapp: { bg: '#6B8E23', hover: '#5A7A1E', text: '#FFFFFF' }
};

/** Configuración de colores con mejor contraste para accesibilidad */
export const SOCIAL_CONFIGS: Record<SocialPlatform, SocialConfig> = {
  facebook: {
    name: 'Facebook',
    colors: SOCIAL_COLORS.facebook,
    iconName: 'facebook',
    ariaLabel: 'Compartir en Facebook'
  },
  twitter: {
    name: 'Twitter',
    colors: SOCIAL_COLORS.twitter,
    iconName: 'twitter',
    ariaLabel: 'Compartir en Twitter'
  },
  linkedin: {
    name: 'LinkedIn',
    colors: SOCIAL_COLORS.linkedin,
    iconName: 'linkedin',
    ariaLabel: 'Compartir en LinkedIn'
  },
  whatsapp: {
    name: 'WhatsApp',
    colors: SOCIAL_COLORS.whatsapp,
    iconName: 'whatsapp',
    ariaLabel: 'Compartir en WhatsApp'
  },
  copy: {
    name: 'Copiar enlace',
    colors: {
      bg: SOCIAL_COLORS.facebook.bg, // Usar el mismo azul consistente
      hover: SOCIAL_COLORS.facebook.hover,
      text: SOCIAL_COLORS.facebook.text
    },
    iconName: 'link',
    ariaLabel: 'Copiar enlace al portapapeles'
  }
} as const;

/** Tamaños de iconos según el tamaño del botón */
export const ICON_SIZES = {
  sm: 14,
  md: 16,
  lg: 18
} as const;

/** Configuración de ventanas emergentes para compartir */
export const POPUP_FEATURES = {
  facebook: `width=${POPUP_CONFIG.facebook.width},height=${POPUP_CONFIG.facebook.height},${POPUP_CONFIG.facebook.features}`,
  twitter: `width=${POPUP_CONFIG.twitter.width},height=${POPUP_CONFIG.twitter.height},${POPUP_CONFIG.twitter.features}`,
  linkedin: `width=${POPUP_CONFIG.linkedin.width},height=${POPUP_CONFIG.linkedin.height},${POPUP_CONFIG.linkedin.features}`
} as const;

/** URLs base para compartir en redes sociales */
export const SHARE_URLS = {
  facebook: SHARE_APIS.facebook.web,
  twitter: SHARE_APIS.twitter.web,
  linkedin: SHARE_APIS.linkedin.web,
  whatsapp: SHARE_APIS.whatsapp.web
} as const;

/** URLs móviles específicas */
export const MOBILE_URLS = {
  facebook: SHARE_APIS.facebook.mobile
} as const;

/** Expresión regular para detectar dispositivos móviles */
export const MOBILE_USER_AGENT_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

/** Breakpoint para considerar un dispositivo como móvil */
export const MOBILE_BREAKPOINT = BREAKPOINTS.mobile;

/** Plataformas por defecto a mostrar */
export const DEFAULT_PLATFORMS: readonly SocialPlatform[] = [
  SocialPlatform.COPY,
  SocialPlatform.FACEBOOK,
  SocialPlatform.TWITTER,
  SocialPlatform.LINKEDIN,
  SocialPlatform.WHATSAPP
] as const;

/** Mensajes de éxito y error */
export const MESSAGES = {
  copySuccess: '¡Enlace copiado al portapapeles!',
  copyError: 'Error al copiar el enlace',
  shareError: 'Error al compartir en {platform}'
} as const;
