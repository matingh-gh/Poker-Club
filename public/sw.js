self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
// passthrough (بدون کش)
self.addEventListener('fetch', () => {});

// bump:1758623516
