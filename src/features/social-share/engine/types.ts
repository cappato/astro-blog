/**
 * Social Share Feature - TypeScript Type Definitions
 * Complete type safety for social sharing functionality
 */

/** Plataformas de redes sociales disponibles */
export enum SocialPlatform {
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  WHATSAPP = 'whatsapp',
  COPY = 'copy'
}

/** Tamaños disponibles para los botones */
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Variantes de estilo para los botones */
export type ButtonVariant = 'compact' | 'full';

/** Configuración de colores para una plataforma */
export interface SocialColors {
  readonly bg: string;
  readonly hover: string;
  readonly text?: string;
}

/** Configuración completa de una plataforma social */
export interface SocialConfig {
  readonly name: string;
  readonly colors: SocialColors;
  readonly iconName: 'link' | 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'copy' | 'email' | 'check' | 'github' | 'location' | 'menu' | 'close';
  readonly ariaLabel: string;
}

/** Datos necesarios para generar un enlace de compartir */
export interface ShareData {
  readonly url: string;
  readonly title: string;
  readonly description?: string;
  readonly hashtags?: readonly string[];
}

/** Props para el componente ShareButton individual */
export interface ShareButtonProps {
  readonly platform: SocialPlatform;
  readonly shareData: ShareData;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly showLabel?: boolean;
  readonly className?: string;
}

/** Props para el componente ShareButtons principal */
export interface ShareButtonsProps {
  readonly url: string;
  readonly title: string;
  readonly description?: string;
  readonly hashtags?: readonly string[];
  readonly compact?: boolean;
  readonly showTitle?: boolean;
  readonly platforms?: readonly SocialPlatform[];
}

/** Resultado de una operación de compartir */
export interface ShareResult {
  readonly success: boolean;
  readonly platform: SocialPlatform;
  readonly message?: string;
  readonly error?: string;
}

/** Configuración del dispositivo */
export interface DeviceInfo {
  readonly isMobile: boolean;
  readonly userAgent: string;
  readonly screenWidth: number;
}

/** Opciones para generar URLs de compartir */
export interface ShareUrlOptions {
  readonly openInNewWindow?: boolean;
  readonly windowFeatures?: string;
  readonly fallbackUrl?: string;
}
