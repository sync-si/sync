/// <reference types="histoire" />

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import createSvgSpritePlugin from 'vite-plugin-svg-sprite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createSvgSpritePlugin({
      exportType: 'vanilla',
      include: 'src/icons/*.svg',
      symbolId: 's-[name]',
    }),
  ],
  histoire: {
    setupFile: '/src/histoire.setup.ts',
  },
});
