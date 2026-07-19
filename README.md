# 🌌 MindQuest - Hutan Jiwa

MindQuest adalah aplikasi jurnal kesehatan mental interaktif berbasis PWA (Progressive Web App) dengan pendekatan *Zero-Knowledge Encryption* dan dukungan kecerdasan buatan (AI) yang empatik. Aplikasi ini dirancang khusus untuk memastikan privasi absolut penggunanya, dengan fitur enkripsi kelas tinggi yang berjalan langsung di browser pengguna sebelum data dikirim ke server.

## ✨ Fitur Utama

### 1. Kriptografi Zero-Knowledge (AES-256-GCM)
Keamanan adalah prioritas mutlak. Teks jurnal dan keluhan pengguna tidak pernah menyentuh server dalam bentuk teks asli (plaintext).
- Data dienkripsi secara lokal di perangkat klien menggunakan **Web Crypto API**.
- Server Google Firestore hanya menerima, menyimpan, dan mengirimkan sekumpulan karakter acak (*Ciphertext*) dan *Initialization Vector* (IV).
- **Alat Uji Dekripsi Manual (Live)** tersedia di dalam aplikasi (Mode Developer) untuk membuktikan keaslian proses pembongkaran sandi secara waktu-nyata tanpa bergantung pada *cache*.
- 📖 **[Dokumentasi Lengkap Kriptografi MindQuest](docs/KRIPTOGRAFI-README.md)**

### 2. MindQuest AI (Teman Digital Empatik)
Terintegrasi dengan kecerdasan buatan yang dilatih khusus menjadi teman sejawat digital untuk menemani pengguna mengelola emosi.
- **Tanpa Diagnosis Medis**: AI tidak pernah memberikan diagnosis klinis atau menghakimi perasaan pengguna.
- **Deteksi Krisis Real-Time**: Sistem secara proaktif memantau sinyal krisis darurat dan mengarahkan pengguna ke bantuan profesional atau mengaktifkan mode penanganan darurat (*distress*).
- **Refleksi Batin Harian**: AI memberikan umpan balik dan kutipan semangat ("Rusa Berbintang") pada setiap entri jurnal yang dibuat.

### 3. Portal Konseling Anonim & Live Chat
MindQuest menghubungkan pengguna dengan Psikolog profesional secara langsung tanpa memerlukan identitas asli.
- Menggunakan **Anonymous Auth**.
- Psikolog memiliki dasbor khusus (*Portal Psikolog*) dengan UI bernuansa *space-glassmorphism* elegan yang memuat antrean klien secara *real-time*.
- Fitur *Live Chat* yang terenkripsi dan aman.

### 4. Jurnal Batin & PWA (Progressive Web App)
- Pencatatan jurnal dengan pemantauan skor emosi (1-10) setiap hari.
- Visualisasi tren fluktuasi emosi pengguna menggunakan grafik 14 hari terakhir.
- **Dukungan Offline (PWA)**: Aplikasi dilengkapi dengan *Service Worker* (Workbox) yang memungkinkan akses aplikasi dan *caching* data secara luring.

### 5. Keamanan SSDLC (Microsoft SDL)
Pengembangan aplikasi ini menerapkan metodologi *Secure Software Development Life Cycle* (SSDLC) berbasis **Microsoft SDL**.
- Mencakup pemodelan *Attack Tree*, analisis risiko, hingga PoC (*Proof of Concept*) pengujian kerentanan.
- 📖 **[Dokumentasi SSDLC MindQuest](docs/ssdlc-microsoft-sdl/README.md)**

### 6. Estetika "Hutan Jiwa" (Dark Space Theme)
Antarmuka tidak kaku seperti aplikasi medis biasa, melainkan didesain menggunakan filosofi visual *MindQuest*:
- **Latar:** `midnight` dan `space-deep` yang memberikan ketenangan kosmos.
- **Warna Aksen:** Pendaran bintang `gold` dan tekstur kuno `vellum`.
- **Micro-animations:** Elemen kaca transparan (*glassmorphism*) dan tombol interaktif yang halus.

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

Aplikasi ini dibangun menggunakan tumpukan **React + Vite + Firebase**.

### 1. Prasyarat
Pastikan Anda telah menginstal `Node.js` (minimal v18) dan memiliki akun Firebase.

### 2. Instalasi
Clone repositori atau buka folder paket aplikasi, lalu jalankan:
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan (.env)
Salin file `.env.example` menjadi `.env` dan isi dengan kredensial dari *Firebase Console* Anda:
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=mindquest-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mindquest-xxxx
VITE_FIREBASE_STORAGE_BUCKET=mindquest-xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Jalankan Server Pengembangan (Lokal)
Jalankan perintah berikut untuk membuka aplikasi di server lokal (biasanya di `localhost:5173` atau `5174`):
```bash
npm run dev
```

---

## 🔒 Konfigurasi Keamanan (Firestore Rules & PWA)
Pastikan Anda men-*deploy* aturan keamanan Firebase (Security Rules) agar fitur *Live Chat* dan *Jurnal* beroperasi dengan aman dari sisi server:

```bash
firebase deploy --only firestore:rules
```

Aplikasi ini juga menggunakan *Service Worker* untuk proteksi dan akses luring, pastikan di-*build* untuk produksi jika ingin menguji fitur PWA sepenuhnya:
```bash
npm run build && npm run preview
```

## 🧪 Cara Mendemonstrasikan Dekripsi Manual (Kepada Dosen/Penguji)
Aplikasi memiliki alat demonstrasi khusus untuk sidang/pengujian:
1. Ketuk teks **"Gulungan Memoar"** (pada tab Jurnal) sebanyak 5 kali secara cepat.
2. Klik ikon 🔒 Gembok yang muncul di layar bagian atas hingga berubah warna menjadi Hijau.
3. Buka salah satu entri jurnal.
4. Di bagian bawah teks, Anda akan menemukan kotak **"BUKTI ENKRIPSI"** beserta tombol **Uji Dekripsi Manual**.
5. Salin *Ciphertext* acak secara langsung dari *Database Firestore* Anda, lalu *paste* ke dalam alat ini untuk membuktikan bahwa dekripsi terjadi secara nyata di memori aplikasi tanpa menyentuh internet.

---
*Dibuat untuk memberikan ketenangan batin yang sejati di dalam Hutan Jiwa.*
