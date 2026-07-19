/* eslint-disable no-restricted-globals */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, NetworkOnly, CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// self.__WB_MANIFEST disuntik otomatis oleh Workbox saat build (jangan dihapus)
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// --- Firestore: Network First, fallback ke cache ---
registerRoute(
  ({ url }) => url.origin === 'https://firestore.googleapis.com',
  new NetworkFirst({
    cacheName: 'firestore-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 86400 })
    ]
  })
)

// --- Firebase Auth: Network Only, token tidak boleh di-cache ---
registerRoute(
  ({ url }) => url.origin === 'https://identitytoolkit.googleapis.com',
  new NetworkOnly()
)

// --- Cloud Functions (analisis AI): Network Only ---
registerRoute(
  ({ url }) => url.hostname.endsWith('cloudfunctions.net'),
  new NetworkOnly()
)

// --- Aset statis: Cache First ---
registerRoute(
  ({ request }) =>
    ['image', 'font'].includes(request.destination),
  new CacheFirst({
    cacheName: 'assets-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 2592000 })
    ]
  })
)

// --- Fallback offline untuk navigasi halaman saat tidak ada koneksi ---
const offlineFallback = async () => {
  const cache = await caches.open('offline-fallback')
  const cached = await cache.match('/offline.html')
  return cached || Response.error()
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => offlineFallback())
    )
  }
})

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
