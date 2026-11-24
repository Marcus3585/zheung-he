import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      // One Three.js for the app and for globe.gl. Two copies make
      // `camera instanceof Camera` fail and blank the page.
      dedupe: ['three'],
    },
    optimizeDeps: {
      include: ['three', 'react-globe.gl'],
    },
  };
});
