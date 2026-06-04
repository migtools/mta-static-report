import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'remove-module-and-crossorigin',
      transformIndexHtml(html) {
        // Remove type="module" and crossorigin to make it work with file:// protocol
        // Also add defer to scripts to ensure they load in order
        return html
          .replace(/type="module"\s+/g, '')
          .replace(/\s+crossorigin/g, '')
          .replace(/<script src="/g, '<script defer src="');
      },
    },
  ],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  base: './',
  build: {
    // Generate legacy bundle for file:// protocol compatibility
    target: 'es2015',
    rollupOptions: {
      output: {
        // Use IIFE format instead of ES modules to avoid CORS issues with file://
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
});
