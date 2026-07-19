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
*Dibuat untuk memberikan ketenangan batin yang sejati di dalam Hutan Jiwa.*
