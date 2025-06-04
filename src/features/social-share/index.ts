/**
 * Social Share Feature - Main Export
 * 
 * This feature provides comprehensive social sharing functionality
 * for Astro projects with zero configuration required.
 * 
 * @example Basic usage in layouts:
 * ```astro
 * ---
 * import { ShareButtons } from '../features/social-share';
 * ---
 * <ShareButtons url={Astro.url.href} title="Page Title" />
 * ```
 * 
 * @example For blog posts with full functionality:
 * ```astro
 * ---
 * import { ShareButtons, ShareMessage, CopyToast } from '../features/social-share';
 * ---
 * <ShareButtons url={postUrl} title={title} description={description} />
 * <ShareMessage title={title} description={description} url={postUrl} tags={tags} />
 * <CopyToast />
 * ```
 */

// Main component exports
export { default as ShareButtons } from './components/ShareButtons.astro';
export { default as ShareButton } from './components/ShareButton.astro';
export { default as ShareMessage } from './components/ShareMessage.astro';
export { default as SidebarShareButtons } from './components/SidebarShareButtons.astro';
export { default as CopyToast } from './components/CopyToast.astro';

// Engine exports for advanced usage
export {
  generateShareUrl,
  makeAbsoluteUrl,
  copyToClipboard,
  openSharePopup,
  handleFacebookShare,
  dispatchToastEvent,
  validateShareData,
  sanitizeTitle,
  generateElementId,
  getDeviceInfo,
  generateMobileFacebookUrl
} from './engine/utils';

// Client-side script exports
export {
  initializeShareButtons,
  handleCopyClick,
  handleFacebookClick,
  addTemporaryFeedback
} from './engine/shareScript';

// Configuration exports for customization
export {
  SOCIAL_CONFIGS,
  ICON_SIZES,
  POPUP_FEATURES,
  SHARE_URLS,
  MOBILE_URLS,
  MOBILE_USER_AGENT_REGEX,
  MOBILE_BREAKPOINT,
  DEFAULT_PLATFORMS,
  MESSAGES
} from './engine/constants';

// Type exports for TypeScript users
export type * from './engine/types';

/**
 * Enhanced feature metadata
 */
export const SOCIAL_SHARE_FEATURE = {
  name: 'Social Share System Enhanced',
  version: '2.0.0',
  description: 'Comprehensive social sharing system with mobile support, accessibility features, and TypeScript integration',
  author: 'Matías Cappato',
  reusable: true,
  plugAndPlay: true,
  selfContained: true,
  features: [
    'Multi-platform support (Facebook, Twitter, LinkedIn, WhatsApp, Copy)',
    'Mobile-optimized sharing (native apps when available)',
    'Accessibility compliant (ARIA labels, keyboard navigation)',
    'TypeScript type safety',
    'Customizable UI (compact/full variants)',
    'Toast notifications',
    'Suggested message generation',
    'Device detection',
    'Error handling with fallbacks',
    'Plug & play portability'
  ],
  supportedPlatforms: [
    'Facebook (web + mobile app)',
    'Twitter',
    'LinkedIn', 
    'WhatsApp',
    'Copy to clipboard'
  ],
  exports: {
    components: ['ShareButtons', 'ShareButton', 'ShareMessage', 'SidebarShareButtons', 'CopyToast'],
    functions: ['generateShareUrl', 'copyToClipboard', 'validateShareData'],
    types: ['ShareData', 'ShareButtonProps', 'SocialPlatform'],
    utilities: ['makeAbsoluteUrl', 'sanitizeTitle', 'getDeviceInfo'],
    configuration: ['SOCIAL_CONFIGS', 'DEFAULT_PLATFORMS', 'MESSAGES']
  }
} as const;
