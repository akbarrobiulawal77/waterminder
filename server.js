// server.js
require('dotenv').config();
const express = require('express');
const webpush = require('web-push');
const cron = require('node-cron');

// Fungsi kirim notifikasi (kita ambil dari fungsi yang sudah ada sebelumnya)
const sendWaterReminder = () => {
    const payload = JSON.stringify({
        title: 'Waktunya Minum Air! 💧',
        body: 'Tubuhmu butuh cairan. Klik di sini dan ambil foto air minummu sekarang!',
        url: '/'
    });

    subscriptions.forEach(sub => {
        webpush.sendNotification(sub, payload).catch(err => {
            console.error("Gagal mengirim:", err);
        });
    });
};

// JADWAL: Kirim setiap 2 jam (bisa diubah ke '0 0 */2 * * *')
// Untuk pengetesan agar cepat, coba '*/1 * * * *' (setiap 1 menit)
cron.schedule('*/1 * * * *', () => {
    console.log('Menjalankan pengingat air otomatis...');
    sendWaterReminder();
});
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ganti dengan hasil generate VAPID keys milikmu nanti
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
    'mailto:emailkamu@contoh.com', // Ganti dengan emailmu
    publicVapidKey,
    privateVapidKey
);

// Array sementara untuk menyimpan data langganan user (Di production, simpan di database)
let subscriptions = [];

// Endpoint untuk menerima pendaftaran notifikasi dari HP pengguna
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({});
});

// Endpoint untuk memicu notifikasi (Nanti bisa dibuat sistem Cron/Jadwal otomatis)
app.post('/send-notification', (req, res) => {
    const payload = JSON.stringify({
        title: 'Waktunya Minum Air! 💧',
        body: 'Tubuhmu butuh cairan. Klik di sini dan ambil foto air minummu sekarang!',
        url: '/'
    });

    subscriptions.forEach((sub, index) => {
        webpush.sendNotification(sub, payload).catch(err => {
            console.error("Gagal mengirim ke user:", err);
            // Hapus langganan jika sudah tidak valid
            if (err.statusCode === 410 || err.statusCode === 404) {
                subscriptions.splice(index, 1);
            }
        });
    });

    res.status(200).json({ message: 'Notifikasi berhasil dikirim' });
});

// Paksa menggunakan port 3000 agar sinkron dengan pengaturan Railway kamu
const PORT = 3000; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SUCCESS] Aplikasi WaterMinder berjalan mutlak di port ${PORT}`);
});