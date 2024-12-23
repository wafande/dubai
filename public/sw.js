const CACHE_NAME = 'dubai-luxury-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/assets/img/logo.png'
];

// Helper function to create offline response
function createOfflineResponse() {
  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Offline - Dubai Luxury Services</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: system-ui; padding: 2rem; text-align: center; }
          h1 { color: #333; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <h1>You're Offline</h1>
        <p>Please check your internet connection and try again.</p>
      </body>
    </html>`,
    {
      headers: { 'Content-Type': 'text/html' }
    }
  );
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('Failed to cache assets:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Helper function to handle network requests
async function handleFetch(request) {
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return fetch(request);
  }

  // Skip API calls
  if (request.url.includes('/api/')) {
    return fetch(request);
  }

  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response was not ok');
  } catch (networkError) {
    console.log('Network request failed, falling back to cache:', networkError);

    try {
      // Try cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // If it's a navigation request, return offline page
      if (request.mode === 'navigate') {
        return createOfflineResponse();
      }

      // For assets like images, try to return a placeholder
      if (request.destination === 'image') {
        return new Response(
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" fill="#999">Image</text></svg>',
          {
            headers: { 'Content-Type': 'image/svg+xml' }
          }
        );
      }

      // For other requests, return a basic error response
      return new Response('Resource not available offline', {
        status: 404,
        statusText: 'Not Found',
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch (cacheError) {
      console.error('Cache retrieval failed:', cacheError);
      return createOfflineResponse();
    }
  }
}

// Fetch event - serve from network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(handleFetch(event.request));
}); 