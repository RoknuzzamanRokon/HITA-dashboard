/**
 * Service Worker for Page and API Caching
 * Provides offline-first experience with intelligent caching strategies
 */

const CACHE_NAME = "dashboard-cache-v1";
const API_CACHE_NAME = "api-cache-v1";
const STATIC_CACHE_NAME = "static-cache-v1";

// Cache duration in milliseconds
const CACHE_DURATION = {
  PAGES: 24 * 60 * 60 * 1000, // 24 hours
  API: 10 * 60 * 1000, // 10 minutes
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// URLs to cache
const PAGES_TO_CACHE = ["/", "/dashboard", "/dashboard/users", "/login"];

const API_ENDPOINTS_TO_CACHE = [
  "/api/users/dashboard-stats",
  "/api/users/list",
  "/api/dashboard/points-summary",
];

const STATIC_ASSETS = ["/favicon.ico", "/manifest.json"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker: Installing...");

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log("📦 Service Worker: Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      }),

      // Cache pages
      caches.open(CACHE_NAME).then((cache) => {
        console.log("📄 Service Worker: Caching pages");
        return cache.addAll(PAGES_TO_CACHE);
      }),
    ]).then(() => {
      console.log("✅ Service Worker: Installation complete");
      self.skipWaiting();
    }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME
            ) {
              console.log("🗑️ Service Worker: Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("✅ Service Worker: Activation complete");
        return self.clients.claim();
      }),
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith("/api/")) {
    // API requests - cache with network-first strategy
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.startsWith("/dashboard") || url.pathname === "/") {
    // Dashboard pages - cache with stale-while-revalidate strategy
    event.respondWith(handlePageRequest(request));
  } else if (isStaticAsset(url.pathname)) {
    // Static assets - cache-first strategy
    event.respondWith(handleStaticRequest(request));
  } else {
    // Other requests - network-first
    event.respondWith(handleNetworkFirst(request));
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);

  // Check if this API endpoint should be cached
  const shouldCache = API_ENDPOINTS_TO_CACHE.some((endpoint) =>
    url.pathname.includes(endpoint),
  );

  if (!shouldCache) {
    return fetch(request);
  }

  try {
    console.log("🌐 Service Worker: Fetching API:", url.pathname);

    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful response
      const cache = await caches.open(API_CACHE_NAME);
      const responseClone = networkResponse.clone();

      // Add timestamp to cached response
      const responseWithTimestamp = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          "sw-cached-at": Date.now().toString(),
        },
      });

      cache.put(request, responseWithTimestamp);
      console.log("💾 Service Worker: Cached API response:", url.pathname);
    }

    return networkResponse;
  } catch (error) {
    console.log(
      "📡 Service Worker: Network failed, trying cache:",
      url.pathname,
    );

    // Network failed, try cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      const cachedAt = cachedResponse.headers.get("sw-cached-at");
      const age = cachedAt ? Date.now() - parseInt(cachedAt) : Infinity;

      if (age < CACHE_DURATION.API) {
        console.log(
          "⚡ Service Worker: Serving cached API response:",
          url.pathname,
        );
        return cachedResponse;
      } else {
        console.log(
          "⏰ Service Worker: Cached API response expired:",
          url.pathname,
        );
      }
    }

    // Return network error if no valid cache
    throw error;
  }
}

// Handle page requests with stale-while-revalidate strategy
async function handlePageRequest(request) {
  const url = new URL(request.url);

  try {
    console.log("📄 Service Worker: Handling page request:", url.pathname);

    // Get cached version immediately
    const cachedResponse = await caches.match(request);

    // Start network request in background
    const networkPromise = fetch(request)
      .then(async (networkResponse) => {
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
          console.log("💾 Service Worker: Updated page cache:", url.pathname);
        }
        return networkResponse;
      })
      .catch((error) => {
        console.log(
          "📡 Service Worker: Network failed for page:",
          url.pathname,
        );
        return null;
      });

    // Return cached version if available, otherwise wait for network
    if (cachedResponse) {
      console.log("⚡ Service Worker: Serving cached page:", url.pathname);

      // Update cache in background
      networkPromise;

      return cachedResponse;
    } else {
      console.log(
        "🌐 Service Worker: No cache, waiting for network:",
        url.pathname,
      );
      return await networkPromise;
    }
  } catch (error) {
    console.error("❌ Service Worker: Page request failed:", error);
    throw error;
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log("⚡ Service Worker: Serving cached static asset");
    return cachedResponse;
  }

  try {
    console.log("🌐 Service Worker: Fetching static asset");
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log("💾 Service Worker: Cached static asset");
    }

    return networkResponse;
  } catch (error) {
    console.error("❌ Service Worker: Static asset request failed:", error);
    throw error;
  }
}

// Handle other requests with network-first strategy
async function handleNetworkFirst(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("⚡ Service Worker: Serving cached fallback");
      return cachedResponse;
    }
    throw error;
  }
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
  ];
  return (
    staticExtensions.some((ext) => pathname.endsWith(ext)) ||
    pathname.includes("/static/") ||
    pathname.includes("/_next/")
  );
}

// Message handler for cache management
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "CLEAR_CACHE":
      clearCache(payload?.cacheType);
      break;
    case "CLEAR_USER_CACHE":
      clearUserCache(payload?.userId);
      break;
    case "GET_CACHE_STATUS":
      getCacheStatus().then((status) => {
        event.ports[0].postMessage({ type: "CACHE_STATUS", payload: status });
      });
      break;
  }
});

// Clear cache by type
async function clearCache(cacheType) {
  try {
    if (cacheType === "api" || !cacheType) {
      await caches.delete(API_CACHE_NAME);
      console.log("🗑️ Service Worker: Cleared API cache");
    }

    if (cacheType === "pages" || !cacheType) {
      await caches.delete(CACHE_NAME);
      console.log("🗑️ Service Worker: Cleared page cache");
    }

    if (cacheType === "static" || !cacheType) {
      await caches.delete(STATIC_CACHE_NAME);
      console.log("🗑️ Service Worker: Cleared static cache");
    }
  } catch (error) {
    console.error("❌ Service Worker: Failed to clear cache:", error);
  }
}

// Clear user-specific cache (for logout)
async function clearUserCache(userId) {
  try {
    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        const url = new URL(request.url);
        if (
          url.pathname.includes(`user/${userId}`) ||
          url.searchParams.get("userId") === userId
        ) {
          await cache.delete(request);
          console.log(
            "🗑️ Service Worker: Cleared user cache entry:",
            request.url,
          );
        }
      }
    }
  } catch (error) {
    console.error("❌ Service Worker: Failed to clear user cache:", error);
  }
}

// Get cache status
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const status = {};

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      status[cacheName] = requests.length;
    }

    return status;
  } catch (error) {
    console.error("❌ Service Worker: Failed to get cache status:", error);
    return {};
  }
}

console.log("🚀 Service Worker: Script loaded and ready");
