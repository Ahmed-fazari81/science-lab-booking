const CACHE_NAME = 'science-lab-v1';
const urlsToCache = [
  '/science-lab-booking/',
  '/science-lab-booking/index.html',
  '/science-lab-booking/images/icon-192.png',
  '/science-lab-booking/images/icon-512.png'
];

// التثبيت: تخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error('Cache failed:', err);
      })
  );
  self.skipWaiting();
});

// التفعيل
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
    })
  );
  self.clients.claim();
});

// جلب البيانات: التحقق من وجود الإنترنت أولاً
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // إذا كان هناك إنترنت، نرجع البيانات من الشبكة
        return response;
      })
      .catch(() => {
        // إذا لا يوجد إنترنت، نرجع الصفحة الأساسية من الكاش أو رسالة خطأ
        if (event.request.mode === 'navigate') {
          return new Response(
            '<html dir="rtl" style="font-family:Cairo,sans-serif;text-align:center;padding:50px;">' +
            '<h1 style="color:#dc3545;">⚠️ لا يوجد اتصال بالإنترنت</h1>' +
            '<p>يجب الاتصال بالإنترنت لاستخدام تطبيق حجز المختبر</p>' +
            '<button onclick="location.reload()" style="padding:10px 20px;background:#0d6efd;color:#fff;border:none;border-radius:8px;cursor:pointer;">إعادة المحاولة</button>' +
            '</html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
        return caches.match(event.request);
      })
  );
});

// التحقق من حالة الاتصال وإرسالها للتطبيق
self.addEventListener('message', (event) => {
  if (event.data === 'checkOnline') {
    event.ports[0].postMessage(navigator.onLine);
  }
});
