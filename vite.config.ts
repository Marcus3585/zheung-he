import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiKey = env.GEMINI_API_KEY || env.API_KEY || '';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Empty string when unset, so a missing key never throws in the browser.
      'process.env.API_KEY': JSON.stringify(geminiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
    },
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
