import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@go-game/core': resolve(__dirname, '../../packages/core/src'),
      '@go-game/ui': resolve(__dirname, '../../packages/ui/src'),
      '@go-game/storage': resolve(__dirname, '../../packages/storage/src'),
    },
  },
  build: {
    target: 'baseline-widely-available',
  },
  server: {
    port: 3000,
  },
});