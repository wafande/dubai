const CACHE_NAME = 'dubai-luxury-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/images/logo.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      })
  );
  // Activate new service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
    .then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

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
    
// Helper function to handle network requests
async function handleFetch(request) {
  // Skip non-GET requests
  if (request.method !== 'GET') {
    try {
      return await fetch(request);
    } catch (err) {
      console.error('Non-GET request failed:', err);
      throw err;
    }
  }

  // Skip API calls and cross-origin requests
  if (request.url.includes('/api/') || !request.url.startsWith(self.location.origin)) {
    try {
      return await fetch(request);
    } catch (err) {
      console.error('API or cross-origin request failed:', err);
    throw err;
    }
  }

  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response was not ok');
  } catch (err) {
    console.warn('Network request failed, trying cache:', err);

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

      // For other requests, throw the error
      throw err;
    } catch (cacheErr) {
      console.error('Cache retrieval failed:', cacheErr);
      if (request.mode === 'navigate') {
        return createOfflineResponse();
      }
      throw cacheErr;
    }
  }
}

// Fetch event - serve from network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    handleFetch(event.request)
      .catch(err => {
        console.error('Fetch handler failed:', err);
        if (event.request.mode === 'navigate') {
          return createOfflineResponse();
        }
        throw err;
      })
  );
}); 