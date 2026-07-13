// public/sw.js

self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'Waktunya minum air sayang!',
        icon: '/icon.png', // Tambahkan gambar icon (misalnya logo air) di folder public
        vibrate: [200, 100, 200, 100, 200], // Getaran khas
        data: {
            url: data.url || '/'
        },
        requireInteraction: true // Notif tidak akan hilang sampai diklik/disapu
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'WaterMinder', options)
    );
});

// Ketika notifikasi diklik, buka web aplikasinya
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});