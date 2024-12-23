const CACHE_NAME = 'dubai-luxury-cache-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/assets/img/logo.png',
  '/assets/fonts/main.woff2',
  '/icons/icon-144x144.png'
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
    // Try cache first for static assets
    if (STATIC_ASSETS.some(asset => request.url.endsWith(asset))) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response was not ok');
  } catch (error) {
    console.log('Request failed:', error);

    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Handle navigation requests
    if (request.mode === 'navigate') {
      return createOfflineResponse();
    }

    // Handle image requests
    if (request.destination === 'image') {
      return new Response(
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" fill="#999">Image</text></svg>',
        {
          headers: { 'Content-Type': 'image/svg+xml' }
        }
      );
    }

    // Handle font requests
    if (request.destination === 'font') {
      return new Response('', {
        status: 404,
        statusText: 'Font not available offline'
      });
    }

    // For other requests
    return new Response('Resource not available offline', {
      status: 404,
      statusText: 'Not Found',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Fetch event - try cache first for static assets, then network
self.addEventListener('fetch', (event) => {
  event.respondWith(handleFetch(event.request));
}); 