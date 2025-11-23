import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './', // 使用相对路径，适配 GitHub Pages
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Morandi Recipe',
        short_name: 'Recipes',
        description: 'A visually calming, elegant recipe manager.',
        theme_color: '#F2F0EB',
        background_color: '#F2F0EB',
        display: 'standalone',
        start_url: './', // 修改为相对路径
        orientation: 'portrait',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3565/3565418.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3565/3565418.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'docs'
  }
});