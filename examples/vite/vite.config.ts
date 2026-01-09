import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Optimize dependencies for react-dnd ESM
  optimizeDeps: {
    include: [
      'react-dnd',
      'react-dnd-html5-backend',
      'dnd-core',
      '@react-dnd/invariant',
      '@react-dnd/asap',
      '@react-dnd/shallowequal',
    ],
  },
});
