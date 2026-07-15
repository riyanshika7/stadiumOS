import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: '127.0.0.1',
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Three.js is inherently large (~966 kB min, ~269 kB gzip).
    // It is loaded lazily via DashboardDigitalTwin React.lazy(), so it does
    // NOT block the critical path.  Raise the warning limit to 1000 kB to
    // suppress the expected Three.js size warning in CI logs.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting strategy
         * ─────────────────────────────────────────────────────────────────
         * Using a function (not an object) avoids the circular-dependency
         * warning that arises when Rollup resolves shared peer deps across
         * statically-declared entry arrays.
         *
         * Chunk map:
         *  vendor-three  │ Three.js + R3F  (lazy-loaded via React.lazy)
         *  vendor-ui     │ Framer Motion + Lucide icons
         *  vendor-misc   │ everything else in node_modules
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('/three/') || id.includes('@react-three/')) {
            return 'vendor-three';
          }
          if (id.includes('/framer-motion/') || id.includes('/lucide-react/')) {
            return 'vendor-ui';
          }
          // react / react-dom / scheduler / all other deps → vendor-misc
          return 'vendor-misc';
        },
      },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/temp/**'],
  },
});
