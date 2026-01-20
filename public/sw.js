// Simple service worker to handle chunk loading errors
const CACHE_NAME = "app-cache-v1";

self.addEventListener("fetch", (event) => {
  // Only handle requests for JavaScript chunks
  if (event.request.url.includes("/_next/static/chunks/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If chunk loading fails, try to get it from cache
        return caches.match(event.request);
      })
    );
  }
});

// Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
