// 1. EVENT: Saat menerima sinyal notifikasi dari server (Push)
self.addEventListener('push', function(event) {
    let data = {};
    if (event.data) {
        data = event.data.json();
    }

    const options = {
        body: data.body || 'Waktunya minum air!',
        icon: '/icon.png', // Menampilkan logo aplikasimu di notifikasi
        badge: '/icon.png', // Ikon kecil warna putih di status bar atas (khusus Android)
        vibrate: [200, 100, 200, 100, 200, 100, 200], // Pola getaran HP
        requireInteraction: true, // PENTING: Notifikasi tidak akan hilang sampai user mengkliknya
        data: {
            url: data.url || '/' // Menyimpan link yang akan dibuka saat diklik
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'WaterMinder 💧', options)
    );
});

// 2. EVENT: Saat notifikasi diklik oleh pengguna
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Tutup pop-up notifikasinya

    // Buka aplikasi WaterMinder
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Cek apakah webnya sudah terbuka di background, kalau ya, fokuskan ke sana
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes(event.notification.data.url) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Kalau belum terbuka sama sekali, buka tab/jendela baru
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
