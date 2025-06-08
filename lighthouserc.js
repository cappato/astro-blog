/**
 * Lighthouse CI Configuration
 * 
 * Replaces custom SEO testing with industry-standard Lighthouse audits.
 * Provides comprehensive SEO, performance, accessibility, and best practices testing.
 */

module.exports = {
  ci: {
    // Build configuration
    collect: {
      // URLs to audit (can be local or remote)
      url: [
        'http://localhost:4321',
        'http://localhost:4321/blog',
        'http://localhost:4321/blog/dark-mode-perfecto-astro',
        'http://localhost:4321/blog/auto-merge-inteligente-ux-control'
      ],
      
      // Lighthouse settings
      settings: {
        // Chrome flags for CI environment
        chromeFlags: '--no-sandbox --headless --disable-gpu --disable-dev-shm-usage',
        
        // Audit configuration
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        
        // Skip certain audits that might be flaky in CI
        skipAudits: [
          'canonical', // Can be flaky with local URLs
          'robots-txt', // Not applicable for local testing
        ],
        
        // Throttling settings for consistent results
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        
        // Form factor
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        }
      },
      
      // Number of runs per URL for more reliable results
      numberOfRuns: 3,
      
      // Start server automatically (for local testing)
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000
    },
    
    // Assertion configuration (quality gates)
    assert: {
      assertions: {
        // Performance thresholds
        'categories:performance': ['error', { minScore: 0.8 }],
        
        // SEO thresholds (strict)
        'categories:seo': ['error', { minScore: 0.95 }],
        
        // Accessibility thresholds
        'categories:accessibility': ['error', { minScore: 0.9 }],
        
        // Best practices thresholds
        'categories:best-practices': ['error', { minScore: 0.9 }],
        
        // Specific SEO audits
        'meta-description': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        'meta-viewport': 'error',
        'structured-data': 'warn', // Warn instead of error for flexibility
        
        // Performance audits
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        
        // Accessibility audits
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        
        // Best practices
        'uses-https': 'off', // Disabled for local testing
        'is-on-https': 'off', // Disabled for local testing
        'external-anchors-use-rel-noopener': 'warn'
      }
    },
    
    // Upload configuration (for CI/CD)
    upload: {
      target: 'temporary-public-storage',
      // Alternative: use LHCI server
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN
    },
    
    // Server configuration (if using LHCI server)
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lhci.db'
      }
    }
  }
};
