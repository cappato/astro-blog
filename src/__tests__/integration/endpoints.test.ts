/**
 * Endpoint Integration Tests
 * Automated verification of live endpoints during development
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { DOMParser } from '@xmldom/xmldom';

const DEV_PORT = 4321;
const DEV_URL = `http://localhost:${DEV_PORT}`;
const STARTUP_TIMEOUT = 30000; // 30 seconds
const REQUEST_TIMEOUT = 10000; // 10 seconds

let devServer: ChildProcess | null = null;

const parser = new DOMParser({
  errorHandler: {
    warning: () => {},
    error: (msg) => { throw new Error(msg); },
    fatalError: (msg) => { throw new Error(msg); }
  }
});

// Helper function to make HTTP requests
async function fetchWithTimeout(url: string, timeout = REQUEST_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Helper function to wait for server to be ready
async function waitForServer(url: string, maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetchWithTimeout(url, 5000);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Server not ready yet, wait and retry
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

describe('Endpoint Integration Tests', () => {
  beforeAll(async () => {
    console.log('Starting development server...');
    
    // Start dev server
    devServer = spawn('npm', ['run', 'dev'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'development' }
    });

    // Wait for server to be ready
    const serverReady = await waitForServer(DEV_URL);
    if (!serverReady) {
      throw new Error('Development server failed to start within timeout');
    }
    
    console.log('Development server is ready');
  }, STARTUP_TIMEOUT);

  afterAll(async () => {
    if (devServer) {
      console.log('Stopping development server...');
      devServer.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise(resolve => {
        devServer!.on('exit', resolve);
        setTimeout(() => {
          devServer!.kill('SIGKILL');
          resolve(undefined);
        }, 5000);
      });
    }
  });

  describe('RSS Endpoint', () => {
    test('GET /rss.xml should return 200', async () => {
      const response = await fetchWithTimeout(`${DEV_URL}/rss.xml`);
      expect(response.status).toBe(200);
    });

    test('RSS should have correct content type', async () => {
      const response = await fetchWithTimeout(`${DEV_URL}/rss.xml`);
      const contentType = response.headers.get('content-type');
      expect(contentType).toMatch(/application\/rss\+xml|text\/xml|application\/xml/);
    });

    test('RSS should return valid XML content', async () => {
      const response = await fetchWithTimeout(`${DEV_URL}/rss.xml`);
      const content = await response.text();
      
      expect(content).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
      expect(() => {
        parser.parseFromString(content, 'text/xml');
      }).not.toThrow();
    });

    test('RSS should contain expected structure', async () => {
      const response = await fetchWithTimeout(`${DEV_URL}/rss.xml`);
      const content = await response.text();
      const doc = parser.parseFromString(content, 'text/xml');
      
      const rssElement = doc.getElementsByTagName('rss')[0];
      const channelElement = doc.getElementsByTagName('channel')[0];
      
      expect(rssElement).toBeDefined();
      expect(rssElement.getAttribute('version')).toBe('2.0');
      expect(channelElement).toBeDefined();
    });

    test('RSS should have reasonable response time', async () => {
      const startTime = Date.now();
      const response = await fetchWithTimeout(`${DEV_URL}/rss.xml`);
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // Less than 5 seconds
    });
  });

  describe('Sitemap Endpoint', () => {
    test('GET /sitemap.xml should return 200', async () => {
      const response = await fetchWithTimeout(`${DEV_URL}/sitemap.xml`);
      expect(response.status).toBe(200);
    });

    test('Sitemap should have correct content type', async () => {
      const response = await fetchWithTimeout(`${DEV_URL}/sitemap.xml`);
      const contentType = response.headers.get('content-type');
      expect(contentType).toMatch(/application\/xml|text\/xml/);
    });

    test('Sitemap should return valid XML content', async () => {
      const response = await fetchWithTimeout(`${DEV_URL}/sitemap.xml`);
      const content = await response.text();
      
      expect(content).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
      expect(() => {
        parser.parseFromString(content, 'text/xml');
      }).not.toThrow();
    });

    test('Sitemap should contain expected structure', async () => {
      const response = await fetchWithTimeout(`${DEV_URL}/sitemap.xml`);
      const content = await response.text();
      const doc = parser.parseFromString(content, 'text/xml');
      
      const urlsetElement = doc.getElementsByTagName('urlset')[0];
      const urlElements = doc.getElementsByTagName('url');
      
      expect(urlsetElement).toBeDefined();
      expect(urlsetElement.getAttribute('xmlns')).toBe('http://www.sitemaps.org/schemas/sitemap/0.9');
      expect(urlElements.length).toBeGreaterThan(0);
    });

    test('Sitemap should have reasonable response time', async () => {
      const startTime = Date.now();
      const response = await fetchWithTimeout(`${DEV_URL}/sitemap.xml`);
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // Less than 5 seconds
    });
  });

  describe('AI Metadata Endpoint', () => {
    test('GET /ai-metadata.json should return 200', async () => {
      const response = await fetchWithTimeout(`${DEV_URL}/ai-metadata.json`);
      expect(response.status).toBe(200);
    });

    test('AI Metadata should have correct content type', async () => {
      const response = await fetchWithTimeout(`${DEV_URL}/ai-metadata.json`);
      const contentType = response.headers.get('content-type');
      expect(contentType).toMatch(/application\/json/);
    });

    test('AI Metadata should return valid JSON', async () => {
      const response = await fetchWithTimeout(`${DEV_URL}/ai-metadata.json`);
      const content = await response.text();
      
      expect(() => {
        JSON.parse(content);
      }).not.toThrow();
    });

    test('AI Metadata should have CORS headers', async () => {
      const response = await fetchWithTimeout(`${DEV_URL}/ai-metadata.json`);
      const corsHeader = response.headers.get('access-control-allow-origin');
      expect(corsHeader).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent endpoints gracefully', async () => {
      const response = await fetchWithTimeout(`${DEV_URL}/non-existent-endpoint.xml`);
      expect(response.status).toBe(404);
    });

    test('endpoints should be consistent between requests', async () => {
      // Make multiple requests to ensure consistency
      const responses = await Promise.all([
        fetchWithTimeout(`${DEV_URL}/rss.xml`),
        fetchWithTimeout(`${DEV_URL}/rss.xml`),
        fetchWithTimeout(`${DEV_URL}/rss.xml`)
      ]);

      const contents = await Promise.all(responses.map(r => r.text()));
      
      // All responses should be identical
      expect(contents[0]).toBe(contents[1]);
      expect(contents[1]).toBe(contents[2]);
    });
  });
});
