// @ts-check
import AstroPWA from '@vite-pwa/astro'
import { shell } from '@chirag127/astro-shell/shell'

// Uses @vite-pwa/astro directly — small, well-supported community plugin.
// PWA manifest + workbox config is inlined below.
export default shell({
  site: 'https://pdf.oriz.in',
  base: process.env.PUBLIC_BASE_PATH ?? '/',
  integrations: [
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
    optimizeDeps: {
      exclude: ['pdfjs-dist'],
    },
  },
})
