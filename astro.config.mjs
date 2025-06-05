// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://cappato.dev',
  output: 'static',
  prefetch: {
    prefetchAll: false, // We handle prefetching manually for better control
    defaultStrategy: 'hover'
  },
  integrations: [
    tailwind({
      // Configuración de Tailwind
      configFile: './tailwind.config.js', // Usar configFile en lugar de config
      applyBaseStyles: true,
    }),
  ],
  build: {
    // Mejora: control más granular de inlineStylesheets
    inlineStylesheets: 'auto', // Auto para mejor balance performance/cache
    // Mejora: comprimir assets estáticos
    assets: '_astro', // Standard Astro assets folder
    // Mejora: split chunks para mejor caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['astro/runtime'],
          'social': ['./src/scripts/social-share.ts'],
          'ui': ['./src/scripts/ui-interactions.ts'],
          'prefetch': ['./src/scripts/prefetch.ts']
        }
      }
    }
  },
  vite: {
    build: {
      cssCodeSplit: true,
      minify: 'esbuild',
      target: 'es2020',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          compact: true,
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
      cssMinify: true,
    },
    esbuild: {
      pure: ['console.log', 'console.debug', 'console.info'],
      legalComments: 'none',
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
    },
    optimizeDeps: {
      exclude: ['sharp'],
    },
  },
});



