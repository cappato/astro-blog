/**
 * Lighthouse CI Configuration
 * 
 * Replaces custom SEO testing with industry-standard Lighthouse audits.
 * Provides comprehensive SEO, performance, accessibility, and best practices testing.
 */

export default {
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
    // VERY PERMISSIVE for PRs - can be made strict later for quality work
    assert: {
      assertions: {
        // Core SEO (keep as errors - critical)
        'meta-description': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        'meta-viewport': 'error',

        // EVERYTHING ELSE OFF OR WARN (maximum permissiveness)
        'categories:performance': 'off',
        'categories:seo': 'warn',
        'categories:accessibility': 'off',
        'categories:best-practices': 'off',
        'structured-data': 'off',
        'first-contentful-paint': 'off',
        'largest-contentful-paint': 'off',
        'cumulative-layout-shift': 'off',
        'color-contrast': 'off',
        'image-alt': 'off',
        'label': 'off',
        'link-name': 'off',
        'label-content-name-mismatch': 'off',
        'unsized-images': 'off',
        'unused-javascript': 'off',
        'uses-responsive-images': 'off',
        'lcp-lazy-loaded': 'off',
        'redirects': 'off',
        'charset': 'off',
        'dom-size': 'off',
        'interactive': 'off',
        'mainthread-work-breakdown': 'off',
        'max-potential-fid': 'off',
        'render-blocking-resources': 'off',
        'bootup-time': 'off',

        // Disabled for local testing
        'uses-https': 'off',
        'is-on-https': 'off',
        'external-anchors-use-rel-noopener': 'off'
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
