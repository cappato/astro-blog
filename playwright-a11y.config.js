/**
 * Playwright Configuration for Accessibility Testing
 * 
 * Replaces custom accessibility testing with industry-standard axe-core integration.
 * Provides comprehensive WCAG compliance testing.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests/accessibility',
  
  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  
  // Test configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/accessibility-report' }],
    ['json', { outputFile: 'test-results/accessibility-results.json' }],
    ['list']
  ],
  
  // Global test settings
  use: {
    // Base URL for testing
    baseURL: 'http://localhost:4321',
    
    // Browser settings
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Viewport
    viewport: { width: 1280, height: 720 }
  },

  // Test projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }
  ],

  // Web server configuration
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
