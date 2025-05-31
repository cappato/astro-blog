// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://cappato.dev',
  output: 'static',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
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
    inlineStylesheets: 'always', // Cambiar a 'always' para CSS crítico
    // Mejora: comprimir assets estáticos
    assets: 'assets',
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



