const CACHE_NAME = 'daily-time-v1.0.2'; // Version ပြောင်းတိုင်း ဒီနေရာမှာ နံပါတ်တင်ပါ
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png'
];

// 1. Install Event - Cache သိမ်းခြင်း
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Service Worker အသစ်ကို ချက်ချင်း activate လုပ်စေရန်
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activate Event - Cache အဟောင်းများ ရှင်းလင်းခြင်း
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // ချက်ချင်း control ယူရန်
  );
});

// 3. Fetch Event - Offline မှာ Cache ကနေ ပြန်ပေးခြင်း
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    // index.html ကို Network First နဲ့ ယူမယ်၊ မရရင် Cache ကနေ ယူမယ်
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // ကျန်တဲ့ assets တွေကို Cache First နဲ့ ယူမယ်
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
    );
  }
});
