/**
 * Social Share Feature Tests
 * Tests for the modular social sharing system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateShareUrl,
  makeAbsoluteUrl,
  validateShareData,
  sanitizeTitle,
  getDeviceInfo,
  copyToClipboard
} from '../engine/utils';
import { SocialPlatform } from '../engine/types';
import type { ShareData } from '../engine/types';

// Mock del navegador para tests
const mockNavigator = {
  clipboard: {
    writeText: vi.fn()
  },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

const mockWindow = {
  location: {
    origin: 'https://cappato.dev'
  },
  innerWidth: 1024
};

// Setup global mocks
beforeEach(() => {
  vi.stubGlobal('navigator', mockNavigator);
  vi.stubGlobal('window', mockWindow);
  vi.clearAllMocks();
});

describe('generateShareUrl', () => {
  const mockShareData: ShareData = {
    url: 'https://cappato.dev/blog/test-post',
    title: 'Test Post Title',
    description: 'Test description',
    hashtags: ['test', 'blog']
  };

  it('should generate correct Facebook URL', () => {
    const result = generateShareUrl(SocialPlatform.FACEBOOK, mockShareData);
    expect(result).toBe('https://www.facebook.com/sharer.php?u=https%3A%2F%2Fcappato.dev%2Fblog%2Ftest-post');
  });

  it('should generate correct Twitter URL with hashtags', () => {
    const result = generateShareUrl(SocialPlatform.TWITTER, mockShareData);
    expect(result).toContain('https://twitter.com/intent/tweet');
    expect(result).toContain('Test%20Post%20Title%20-%20Test%20description%20%23test%20%23blog');
    expect(result).toContain('https%3A%2F%2Fcappato.dev%2Fblog%2Ftest-post');
  });

  it('should generate correct LinkedIn URL', () => {
    const result = generateShareUrl(SocialPlatform.LINKEDIN, mockShareData);
    expect(result).toBe('https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fcappato.dev%2Fblog%2Ftest-post&title=Test%20Post%20Title');
  });

  it('should generate correct WhatsApp URL', () => {
    const result = generateShareUrl(SocialPlatform.WHATSAPP, mockShareData);
    expect(result).toContain('https://wa.me/?text=');
    expect(result).toContain('Test%20Post%20Title');
    expect(result).toContain('https%3A%2F%2Fcappato.dev%2Fblog%2Ftest-post');
  });

  it('should return original URL for unknown platform', () => {
    const result = generateShareUrl('unknown' as SocialPlatform, mockShareData);
    expect(result).toBe(mockShareData.url);
  });
});

describe('makeAbsoluteUrl', () => {
  it('should return absolute URL unchanged', () => {
    const absoluteUrl = 'https://example.com/path';
    const result = makeAbsoluteUrl(absoluteUrl);
    expect(result).toBe(absoluteUrl);
  });

  it('should convert relative URL to absolute using window.location', () => {
    const relativeUrl = '/blog/test-post';
    const result = makeAbsoluteUrl(relativeUrl);
    expect(result).toBe('https://cappato.dev/blog/test-post');
  });

  it('should use provided baseUrl when window is not available', () => {
    vi.stubGlobal('window', undefined);
    const relativeUrl = '/blog/test-post';
    const baseUrl = 'https://custom.com';
    const result = makeAbsoluteUrl(relativeUrl, baseUrl);
    expect(result).toBe('https://custom.com/blog/test-post');
  });
});

describe('validateShareData', () => {
  it('should return true for valid share data', () => {
    const validData = {
      url: 'https://example.com',
      title: 'Test Title'
    };
    expect(validateShareData(validData)).toBe(true);
  });

  it('should return false when URL is missing', () => {
    const invalidData = {
      title: 'Test Title'
    };
    expect(validateShareData(invalidData)).toBe(false);
  });

  it('should return false when title is missing', () => {
    const invalidData = {
      url: 'https://example.com'
    };
    expect(validateShareData(invalidData)).toBe(false);
  });

  it('should return false when both URL and title are missing', () => {
    const invalidData = {};
    expect(validateShareData(invalidData)).toBe(false);
  });
});

describe('sanitizeTitle', () => {
  it('should trim whitespace from title', () => {
    const title = '  Test Title  ';
    const result = sanitizeTitle(title);
    expect(result).toBe('Test Title');
  });

  it('should replace multiple spaces with single space', () => {
    const title = 'Test    Title   With    Spaces';
    const result = sanitizeTitle(title);
    expect(result).toBe('Test Title With Spaces');
  });

  it('should handle empty string', () => {
    const title = '';
    const result = sanitizeTitle(title);
    expect(result).toBe('');
  });
});

describe('getDeviceInfo', () => {
  it('should detect desktop device', () => {
    const result = getDeviceInfo();
    expect(result.isMobile).toBe(false);
    expect(result.userAgent).toContain('Mozilla');
    expect(result.screenWidth).toBe(1024);
  });

  it('should detect mobile device by user agent', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    });

    const result = getDeviceInfo();
    expect(result.isMobile).toBe(true);
  });

  it('should detect mobile device by screen width', () => {
    vi.stubGlobal('window', {
      ...mockWindow,
      innerWidth: 500
    });

    const result = getDeviceInfo();
    expect(result.isMobile).toBe(true);
  });

  it('should handle server-side rendering (no window)', () => {
    vi.stubGlobal('window', undefined);

    const result = getDeviceInfo();
    expect(result.isMobile).toBe(false);
    expect(result.userAgent).toBe('');
    expect(result.screenWidth).toBe(0);
  });
});

describe('copyToClipboard', () => {
  it('should successfully copy text to clipboard', async () => {
    mockNavigator.clipboard.writeText.mockResolvedValue(undefined);

    const result = await copyToClipboard('test text');

    expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    expect(result.success).toBe(true);
    expect(result.platform).toBe(SocialPlatform.COPY);
    expect(result.message).toBe('¡Enlace copiado al portapapeles!');
  });

  it('should handle clipboard API failure', async () => {
    mockNavigator.clipboard.writeText.mockRejectedValue(new Error('Clipboard failed'));

    const result = await copyToClipboard('test text');

    expect(result.success).toBe(false);
    expect(result.platform).toBe(SocialPlatform.COPY);
    expect(result.error).toBe('Error al copiar el enlace');
  });

  it('should handle missing clipboard API', async () => {
    vi.stubGlobal('navigator', { clipboard: undefined });

    const result = await copyToClipboard('test text');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Error al copiar el enlace');
  });
});
