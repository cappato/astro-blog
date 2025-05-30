/**
 * Configuración y constantes para el sistema de compartir en redes sociales
 */

import type { SocialConfig } from './types';
import { SocialPlatform } from './types';

/** Configuración de colores con mejor contraste para accesibilidad */
export const SOCIAL_CONFIGS: Record<SocialPlatform, SocialConfig> = {
  facebook: {
    name: 'Facebook',
    colors: {
      bg: '#699CF9',
      hover: '#5A8AE0',
      text: '#FFFFFF'
    },
    iconName: 'facebook',
    ariaLabel: 'Compartir en Facebook'
  },
  twitter: {
    name: 'Twitter',
    colors: {
      bg: '#699CF9',
      hover: '#5A8AE0',
      text: '#FFFFFF'
    },
    iconName: 'twitter',
    ariaLabel: 'Compartir en Twitter'
  },
  linkedin: {
    name: 'LinkedIn',
    colors: {
      bg: '#699CF9',
      hover: '#5A8AE0',
      text: '#FFFFFF'
    },
    iconName: 'linkedin',
    ariaLabel: 'Compartir en LinkedIn'
  },
  whatsapp: {
    name: 'WhatsApp',
    colors: {
      bg: '#A2F678',
      hover: '#8FDB6A',
      text: '#FFFFFF'
    },
    iconName: 'whatsapp',
    ariaLabel: 'Compartir en WhatsApp'
  },
  copy: {
    name: 'Copiar enlace',
    colors: {
      bg: '#699CF9',
      hover: '#5A8AE0',
      text: '#FFFFFF'
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
  facebook: 'width=600,height=400,scrollbars=yes,resizable=yes',
  twitter: 'width=550,height=420,scrollbars=yes,resizable=yes',
  linkedin: 'width=550,height=420,scrollbars=yes,resizable=yes'
} as const;

/** URLs base para compartir en redes sociales */
export const SHARE_URLS = {
  facebook: 'https://www.facebook.com/sharer.php',
  twitter: 'https://twitter.com/intent/tweet',
  linkedin: 'https://www.linkedin.com/sharing/share-offsite/',
  whatsapp: 'https://wa.me/'
} as const;

/** URLs móviles específicas */
export const MOBILE_URLS = {
  facebook: 'fb://facewebmodal/f'
} as const;

/** Expresión regular para detectar dispositivos móviles */
export const MOBILE_USER_AGENT_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

/** Breakpoint para considerar un dispositivo como móvil */
export const MOBILE_BREAKPOINT = 768;

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
