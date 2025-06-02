/**
 * Basic SEO Connectivity Test
 * Simple verification that production site is accessible
 * Run manually: npx vitest run src/__tests__/seo/basic-connectivity.test.ts
 */

import { describe, test, expect } from 'vitest';

const PRODUCTION_URL = 'https://cappato.dev';

describe('Basic SEO Connectivity', () => {
  test('should connect to production site', async () => {
    const response = await fetch(PRODUCTION_URL);
    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
  });

  test('should return HTML content', async () => {
    const response = await fetch(PRODUCTION_URL);
    const contentType = response.headers.get('content-type');
    expect(contentType).toMatch(/text\/html/);
  });

  test('should have basic HTML structure', async () => {
    const response = await fetch(PRODUCTION_URL);
    const html = await response.text();

    expect(html).toContain('<html');
    expect(html).toContain('<head>');
    expect(html).toContain('<body'); // HTML might be minified
    expect(html).toContain('<title>');
  });

  test('should contain site name', async () => {
    const response = await fetch(PRODUCTION_URL);
    const html = await response.text();
    
    expect(html).toContain('Matías Cappato');
  });

  test('should have reasonable response time', async () => {
    const startTime = Date.now();
    const response = await fetch(PRODUCTION_URL);
    const endTime = Date.now();
    
    expect(response.status).toBe(200);
    expect(endTime - startTime).toBeLessThan(5000); // Less than 5 seconds
  });
});
