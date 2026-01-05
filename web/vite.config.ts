/// <reference types="histoire" />

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import VitePluginSvgSpritemap from '@spiriit/vite-plugin-svg-spritemap'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vueDevTools(), VitePluginSvgSpritemap('./src/icons/*.svg')],
    histoire: {
        setupFile: '/src/histoire.setup.ts',
    },
})
