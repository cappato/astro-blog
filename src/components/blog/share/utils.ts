/**
 * Utilidades TypeScript para el sistema de compartir en redes sociales
 */

import type {
  ShareData,
  DeviceInfo,
  ShareResult,
  ShareUrlOptions
} from './types';
import { SocialPlatform } from './types';
import {
  SHARE_URLS,
  MOBILE_URLS,
  MOBILE_USER_AGENT_REGEX,
  MOBILE_BREAKPOINT,
  POPUP_FEATURES,
  MESSAGES
} from './constants';

/**
 * Detecta si el dispositivo actual es móvil
 */
export const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      userAgent: '',
      screenWidth: 0
    };
  }

  return {
    isMobile: MOBILE_USER_AGENT_REGEX.test(navigator.userAgent) || window.innerWidth < MOBILE_BREAKPOINT,
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth
  };
};

/**
 * Convierte una URL relativa en absoluta
 */
export const makeAbsoluteUrl = (url: string, baseUrl?: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (typeof window !== 'undefined') {
    return new URL(url, window.location.origin).toString();
  }

  if (baseUrl) {
    return new URL(url, baseUrl).toString();
  }

  return url;
};

/**
 * Genera la URL de compartir para una plataforma específica
 */
export const generateShareUrl = (platform: SocialPlatform, data: ShareData): string => {
  const { url, title, description, hashtags } = data;
  const absoluteUrl = makeAbsoluteUrl(url);

  switch (platform) {
    case SocialPlatform.FACEBOOK:
      return `${SHARE_URLS.facebook}?u=${encodeURIComponent(absoluteUrl)}`;

    case SocialPlatform.TWITTER:
      const twitterText = description ? `${title} - ${description}` : title;
      const hashtagsText = hashtags?.length ? ` ${hashtags.map(tag => `#${tag}`).join(' ')}` : '';
      return `${SHARE_URLS.twitter}?text=${encodeURIComponent(twitterText + hashtagsText)}&url=${encodeURIComponent(absoluteUrl)}`;

    case SocialPlatform.LINKEDIN:
      return `${SHARE_URLS.linkedin}?url=${encodeURIComponent(absoluteUrl)}&title=${encodeURIComponent(title)}`;

    case SocialPlatform.WHATSAPP:
      const whatsappMessage = `¡Hola! Encontré este artículo: ${title} ${absoluteUrl}`;
      return `${SHARE_URLS.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

    default:
      return absoluteUrl;
  }
};

/**
 * Genera la URL móvil específica para Facebook
 */
export const generateMobileFacebookUrl = (url: string): string => {
  const absoluteUrl = makeAbsoluteUrl(url);
  return `${MOBILE_URLS.facebook}?href=${encodeURIComponent(absoluteUrl)}`;
};

/**
 * Copia texto al portapapeles de forma segura
 */
export const copyToClipboard = async (text: string): Promise<ShareResult> => {
  try {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API no disponible');
    }

    await navigator.clipboard.writeText(text);

    return {
      success: true,
      platform: SocialPlatform.COPY,
      message: MESSAGES.copySuccess
    };
  } catch (error) {
    return {
      success: false,
      platform: SocialPlatform.COPY,
      error: MESSAGES.copyError
    };
  }
};

/**
 * Abre una ventana emergente para compartir
 */
export const openSharePopup = (
  url: string,
  platform: SocialPlatform,
  options: ShareUrlOptions = {}
): void => {
  const {
    openInNewWindow = true,
    windowFeatures = POPUP_FEATURES[platform as keyof typeof POPUP_FEATURES] || 'width=600,height=400'
  } = options;

  if (openInNewWindow) {
    window.open(url, '_blank', windowFeatures);
  } else {
    window.location.href = url;
  }
};

/**
 * Maneja el compartir en Facebook con soporte móvil
 */
export const handleFacebookShare = (data: ShareData): void => {
  const deviceInfo = getDeviceInfo();

  if (deviceInfo.isMobile) {
    const mobileUrl = generateMobileFacebookUrl(data.url);
    window.open(mobileUrl, '_blank');
  } else {
    const shareUrl = generateShareUrl(SocialPlatform.FACEBOOK, data);
    openSharePopup(shareUrl, SocialPlatform.FACEBOOK);
  }
};

/**
 * Dispara un evento personalizado para mostrar notificaciones
 */
export const dispatchToastEvent = (message: string, isError: boolean = false): void => {
  const event = new CustomEvent('show-toast', {
    detail: {
      message,
      type: isError ? 'error' : 'success'
    }
  });

  if (typeof document !== 'undefined') {
    document.dispatchEvent(event);
  }
};

/**
 * Valida los datos de compartir
 */
export const validateShareData = (data: Partial<ShareData>): data is ShareData => {
  return !!(data.url && data.title);
};

/**
 * Sanitiza el título para compartir
 */
export const sanitizeTitle = (title: string): string => {
  return title.trim().replace(/\s+/g, ' ');
};

/**
 * Genera un ID único para elementos del DOM
 */
export const generateElementId = (platform: SocialPlatform, variant: string): string => {
  return `${platform}-share-${variant}`;
};
