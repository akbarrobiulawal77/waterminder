require('dotenv').config();
const express = require('express');
const webpush = require('web-push');
const cron = require('node-cron');
const path = require('path');

const app = express();
app.use(express.json());

// Menyajikan file dari folder "public"
app.use(express.static(path.join(__dirname, 'public')));

// Konfigurasi Web Push dengan VAPID Keys dari file .env
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
    'mailto:test@example.com',
    publicVapidKey,
    privateVapidKey
);

// Array untuk menyimpan data pendaftaran dari HP
let subscriptions = [];

// Menerima data pendaftaran (subscription) dari index.html
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    
    // Cek agar tidak ada data ganda jika tombol diklik berkali-kali
    const isExists = subscriptions.some(sub => sub.endpoint === subscription.endpoint);
    if (!isExists) {
        subscriptions.push(subscription);
        console.log('HP baru berhasil didaftarkan untuk notifikasi!');
    }

    res.status(201).json({});
});

// Fungsi untuk menembakkan notifikasi ke semua HP yang terdaftar
const sendWaterReminder = () => {
    const payload = JSON.stringify({
        title: 'Waktunya Minum Air sayangku,Cintaku 💧',
        body: 'Cepetan Minum Asa!',
        url: '/'
    });

    subscriptions.forEach(sub => {
        webpush.sendNotification(sub, payload).catch(err => {
            console.error("Gagal mengirim notifikasi:", err);
        });
    });
};

// ==========================================
// ALARM OTOMATIS (CRON JOB)
// Berjalan pada menit ke-0, setiap 3 jam sekali
// (Contoh: Jam 00:00, 03:00, 06:00, 09:00, dst)
// ==========================================
cron.schedule('0 */3 * * *', () => {
    console.log('Memulai proses pengiriman pengingat minum (Jadwal 3 Jam)...');
    sendWaterReminder();
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server WaterMinder berjalan dengan baik di port ${PORT}`);
});
