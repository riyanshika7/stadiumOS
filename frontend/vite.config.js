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
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/temp/**'],
  },
});
