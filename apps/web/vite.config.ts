import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The browser application is served by the portal server on the same address
// (architecture §4.1). `vite build --mode stage1` keeps the Stage 1 /dev pages;
// the production build leaves them out of the bundle entirely (§4.7).
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    __LOCAL_STANDINS__: JSON.stringify(mode === 'stage1'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
}));
