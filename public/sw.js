const CACHE_NAME = 'dubai-luxury-cache-v5';
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

// MIME type mapping
const MIME_TYPES = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// Helper function to get MIME type
function getMimeType(url) {
  const extension = url.split('.').pop().toLowerCase();
  return MIME_TYPES['.' + extension] || 'text/plain';
}

// Helper function to normalize URLs
function normalizeUrl(url) {
  const urlObj = new URL(url, self.location.origin);
  return urlObj.pathname;
}

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

  const normalizedUrl = normalizeUrl(request.url);
  const mimeType = getMimeType(normalizedUrl);

  // Handle module scripts
  if (request.destination === 'script') {
    try {
      const response = await fetch(request.clone());
      if (response.ok) {
        const newResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers({
            'Content-Type': 'application/javascript',
            ...Object.fromEntries(response.headers)
          })
        });
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, newResponse.clone());
        return newResponse;
      }
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
  }

  // Handle font requests
  if (request.destination === 'font' || normalizedUrl.includes('/fonts/')) {
    const fontPaths = [
      normalizedUrl,
      normalizedUrl.replace('/fonts/', '/assets/fonts/'),
      `/assets/fonts/${normalizedUrl.split('/').pop()}`
    ];

    // Try to fetch from network first
    try {
      const response = await fetch(request.clone());
      if (response.ok) {
        const newResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers({
            'Content-Type': 'font/woff2',
            ...Object.fromEntries(response.headers)
          })
        });
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, newResponse.clone());
        return newResponse;
      }
    } catch (error) {
      // Try cache with multiple paths
      for (const path of fontPaths) {
        const fontRequest = new Request(path);
        const cachedResponse = await caches.match(fontRequest);
        if (cachedResponse) {
          return cachedResponse;
        }
      }
    }
  }

  try {
    // Try network first for all other requests
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Ensure correct MIME type in response
      const newResponse = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: new Headers({
          'Content-Type': mimeType,
          ...Object.fromEntries(networkResponse.headers)
        })
      });
      
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, newResponse.clone());
      return newResponse;
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

    // Return appropriate error response based on request type
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