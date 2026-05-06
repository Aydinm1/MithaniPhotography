const PHOTO_CACHE = 'mithani-photo-cache-v1'
const STATIC_CACHE = 'mithani-static-cache-v1'

const isPhotoRequest = request => {
  const url = new URL(request.url)
  return url.origin === self.location.origin && (
    url.pathname.startsWith('/photos/') ||
    url.pathname.startsWith('/photos-optimized/')
  )
}

const isStaticAssetRequest = request => {
  const url = new URL(request.url)
  return url.origin === self.location.origin && (
    url.pathname.startsWith('/assets/') ||
    url.pathname === '/favicon.svg' ||
    url.pathname === '/icons.svg'
  )
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(key => key !== PHOTO_CACHE && key !== STATIC_CACHE)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event

  if (request.method !== 'GET') return

  if (isPhotoRequest(request) || isStaticAssetRequest(request)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached

        return fetch(request).then(response => {
          if (!response || !response.ok) return response

          const cacheName = isPhotoRequest(request) ? PHOTO_CACHE : STATIC_CACHE
          const copy = response.clone()
          caches.open(cacheName).then(cache => cache.put(request, copy))
          return response
        })
      })
    )
  }
})
