import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'vite-plugin': 'src/vite-plugin.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['esbuild'],
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
