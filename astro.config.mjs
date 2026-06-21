// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import AstroPWA from '@vite-pwa/astro'
import tailwindcss from '@tailwindcss/vite'

// ponytail: @vite-pwa/astro directly until @chirag127/astro-pwa wrapper
// ships real defaults. The wrapper will collapse this config block to one
// line once published; today it's a 12-line manifest in this file.

export default defineConfig({
  site: 'https://pdf.oriz.in',
  output: 'static',
  integrations: [
    react(),
    mdx(),
    sitemap(),
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Oriz PDF Tools',
        short_name: 'PDF Tools',
        description: 'Free, private, browser-based PDF tools — merge, split, compress, convert, sign.',
        theme_color: '#08090B',
        background_color: '#08090B',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{html,css,js,svg,png,woff2}'],
        navigateFallback: '/',
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['pdfjs-dist'],
    },
  },
})
