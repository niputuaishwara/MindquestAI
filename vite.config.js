import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Service Worker custom — kita tulis sendiri di src/sw.js
      srcDir: 'src',
      filename: 'sw.js',
      strategies: 'injectManifest',
      // Aset yang di-precache otomatis oleh Workbox
      includeAssets: ['icons/*.png', 'offline.html'],
      manifest: {
        name: 'MindQuest',
        short_name: 'MindQuest',
        description: 'Jurnal harian adaptif untuk pengelolaan emosi remaja',
        theme_color: '#534AB7',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'id',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['health', 'lifestyle'],
        shortcuts: [
          {
            name: 'Tulis Jurnal',
            short_name: 'Jurnal',
            url: '/journal',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }]
          }
        ]
      },
      // Workbox config — strategi caching per tipe resource
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Firebase Firestore — Network First, fallback ke cache
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 }
            }
          },
          {
            // Firebase Auth — Network Only (tidak boleh cache token)
            urlPattern: /^https:\/\/identitytoolkit\.googleapis\.com\/.*/i,
            handler: 'NetworkOnly'
          },
          {
            // Cloud Functions (analisis AI) — Network Only, stateless
            urlPattern: /^https:\/\/.*\.cloudfunctions\.net\/.*/i,
            handler: 'NetworkOnly'
          },
          {
            // Gemini API (direct fallback) — Network Only, never cache
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
            handler: 'NetworkOnly'
          },
          {
            // Aset statis (font, gambar) — Cache First
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff2)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 2592000 }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: { '@': '/src' }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions'],
          charts: ['recharts']
        }
      }
    }
  }
})
