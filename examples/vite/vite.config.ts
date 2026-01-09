import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ensure React resolves to the correct location in monorepo
      react: path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
    },
  },
  optimizeDeps: {
    include: [
      '@react-page/editor',
      '@react-page/plugins-slate',
      '@react-page/plugins-image',
      '@react-page/plugins-video',
      '@react-page/plugins-html5-video',
      '@react-page/plugins-spacer',
      '@react-page/plugins-divider',
      '@react-page/plugins-background',
    ],
  },
});
