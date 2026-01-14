/// <reference types="histoire" />

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import VitePluginSvgSpritemap from '@spiriit/vite-plugin-svg-spritemap'
import { vite as vidstack } from 'vidstack/plugins'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('media-'),
                },
            },
        }),
        vueDevTools(),
        VitePluginSvgSpritemap('./src/icons/*.svg'),
        vidstack(),
    ],
    histoire: {
        setupFile: '/src/histoire.setup.ts',
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                ws: true,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
})
