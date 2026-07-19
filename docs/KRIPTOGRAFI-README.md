# 🔐 Implementasi Kriptografi pada MindQuest

## Dokumentasi Lengkap untuk Demo & Penjelasan

> **MindQuest** adalah aplikasi web (PWA) jurnal harian adaptif untuk pengelolaan emosi remaja.
> Dokumen ini menjelaskan secara menyeluruh **konsep dan implementasi kriptografi** yang digunakan
> untuk melindungi data sensitif (isi jurnal dan riwayat percakapan AI) pengguna.

---

## 📑 Daftar Isi

1. [Ringkasan Arsitektur Keamanan](#1-ringkasan-arsitektur-keamanan)
2. [Teknologi Kriptografi yang Digunakan](#2-teknologi-kriptografi-yang-digunakan)
3. [Arsitektur Kunci 2 Lapis (Two-Layer Key Architecture)](#3-arsitektur-kunci-2-lapis-two-layer-key-architecture)
4. [Alur Kriptografi End-to-End](#4-alur-kriptografi-end-to-end)
5. [Penjelasan Detail Per Komponen](#5-penjelasan-detail-per-komponen)
6. [Peta File & Kode Sumber](#6-peta-file--kode-sumber)
7. [Skenario Demo Langkah demi Langkah](#7-skenario-demo-langkah-demi-langkah)
8. [Pengujian Keamanan Kriptografi](#8-pengujian-keamanan-kriptografi)
9. [Standar & Referensi](#9-standar--referensi)
10. [Keterbatasan & Rekomendasi](#10-keterbatasan--rekomendasi)

---

## 1. Ringkasan Arsitektur Keamanan

MindQuest menerapkan prinsip **Client-Side Encryption (CSE)** atau **End-to-End Encryption (E2E)**. Artinya:

```
┌─────────────────────────────────────────────────────────────────┐
│  PRINSIP UTAMA: Server Tidak Pernah Melihat Data Asli (Plaintext) │
└─────────────────────────────────────────────────────────────────┘

Pengguna menulis jurnal  →  Dienkripsi di BROWSER  →  Yang dikirim ke Firebase
                                                       hanya CIPHERTEXT (teks acak)
```

| Aspek | Detail |
|-------|--------|
| **Model Enkripsi** | Client-Side Encryption (CSE) |
| **Algoritma Enkripsi** | AES-256-GCM (Advanced Encryption Standard, 256-bit, Galois/Counter Mode) |
| **Key Derivation Function** | PBKDF2-SHA256 dengan 210.000 iterasi |
| **Library** | Web Crypto API bawaan browser (tanpa dependency eksternal) |
| **Manajemen Kunci** | Two-layer: Wrapping Key (PBKDF2) + Data Key (AES-256-GCM acak) |
| **Penyimpanan Kunci** | Wrapped key disimpan di Firestore, data key hanya ada di memori (RAM) |
| **IV (Initialization Vector)** | 12 byte acak, di-generate baru setiap operasi enkripsi (tidak pernah reuse) |
| **Salt** | 16 byte acak, unik per pengguna |

---

## 2. Teknologi Kriptografi yang Digunakan

### 2.1 AES-256-GCM (Advanced Encryption Standard — Galois/Counter Mode)

```
┌──────────────────────────────────────────────────────┐
│              AES-256-GCM                             │
│                                                      │
│  • Tipe        : Symmetric Block Cipher              │
│  • Panjang Key : 256 bit (32 byte)                   │
│  • Mode        : GCM (Galois/Counter Mode)           │
│  • Panjang IV  : 96 bit (12 byte) — standar NIST     │
│  • Auth Tag    : 128 bit (otomatis oleh Web Crypto)  │
│                                                      │
│  Keunggulan GCM:                                     │
│  ✓ AEAD — Authenticated Encryption with              │
│    Associated Data                                   │
│  ✓ Menjamin Confidentiality (kerahasiaan)            │
│  ✓ Menjamin Integrity (keutuhan data)                │
│  ✓ Menjamin Authenticity (keaslian data)             │
│  ✓ Jika ciphertext diubah oleh penyerang,            │
│    dekripsi PASTI GAGAL (auth tag tidak cocok)        │
└──────────────────────────────────────────────────────┘
```

**Mengapa AES-256-GCM?**
- **AES-256** adalah standar enkripsi simetris terkuat yang direkomendasikan NIST (National Institute of Standards and Technology)
- **GCM mode** menyediakan *Authenticated Encryption with Associated Data (AEAD)* — tidak hanya mengenkripsi, tetapi juga memverifikasi bahwa data tidak diubah/dimanipulasi
- Didukung secara native oleh seluruh browser modern melalui Web Crypto API
- Tidak memerlukan library pihak ketiga, mengurangi *attack surface*

### 2.2 PBKDF2-SHA256 (Password-Based Key Derivation Function 2)

```
┌──────────────────────────────────────────────────────┐
│              PBKDF2-SHA256                            │
│                                                      │
│  • Fungsi   : Menurunkan kunci kriptografi dari      │
│               input yang relatif lemah (PIN/UID)     │
│  • Hash     : SHA-256                                │
│  • Iterasi  : 210.000 (rekomendasi OWASP 2023)       │
│  • Salt     : 16 byte acak (unik per pengguna)       │
│  • Output   : 256-bit AES key (Wrapping Key)         │
│                                                      │
│  Tujuan tingginya iterasi:                           │
│  ✓ Memperlambat brute-force attack                   │
│  ✓ Membuat serangan dictionary attack mahal           │
│  ✓ 210.000 iterasi ≈ waktu komputasi cukup lama      │
│    bagi penyerang, tapi masih nyaman bagi pengguna   │
└──────────────────────────────────────────────────────┘
```

**Mengapa PBKDF2, bukan bcrypt/scrypt/Argon2?**
- PBKDF2 adalah **satu-satunya KDF yang didukung Web Crypto API** secara native di browser
- Tidak perlu menambahkan library besar ke bundle client-side
- Dengan 210.000 iterasi (sesuai rekomendasi OWASP 2023), keamanannya masih memadai

### 2.3 Web Crypto API

```
┌──────────────────────────────────────────────────────┐
│              Web Crypto API                          │
│                                                      │
│  • API kriptografi bawaan browser modern              │
│  • Tersedia di: Chrome, Firefox, Safari, Edge        │
│  • Diakses via: window.crypto.subtle                 │
│  • TIDAK bisa membaca kunci dari JavaScript          │
│    (non-extractable key mode)                        │
│                                                      │
│  Operasi yang digunakan MindQuest:                   │
│  • crypto.subtle.importKey()     — import raw key    │
│  • crypto.subtle.deriveKey()     — PBKDF2 derivation │
│  • crypto.subtle.generateKey()   — generate AES key  │
│  • crypto.subtle.wrapKey()       — bungkus data key  │
│  • crypto.subtle.unwrapKey()     — buka data key     │
│  • crypto.subtle.encrypt()       — enkripsi AES-GCM  │
│  • crypto.subtle.decrypt()       — dekripsi AES-GCM  │
│  • crypto.getRandomValues()      — generate IV/salt  │
└──────────────────────────────────────────────────────┘
```

---

## 3. Arsitektur Kunci 2 Lapis (Two-Layer Key Architecture)

MindQuest menggunakan arsitektur kunci berlapis (**Key Wrapping**) untuk memisahkan antara kunci turunan (derivation) dan kunci enkripsi data sesungguhnya.

```
                    ┌──────────────────────────────┐
                    │  INPUT: PIN/UID Pengguna     │
                    │  (rahasia, tidak disimpan)    │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │  LAPIS 1: WRAPPING KEY        │
                    │                               │
                    │  PBKDF2-SHA256                │
                    │  • Input: PIN + Salt          │
                    │  • Iterasi: 210.000           │
                    │  • Output: AES-256 key        │
                    │                               │
                    │  Fungsi:                      │
                    │  • Membungkus (wrap) data key  │
                    │  • Membuka (unwrap) data key   │
                    │  • TIDAK untuk enkripsi data   │
                    └──────────────┬───────────────┘
                                   │
                          wrap / unwrap
                                   │
                    ┌──────────────▼───────────────┐
                    │  LAPIS 2: DATA KEY            │
                    │                               │
                    │  AES-256-GCM                  │
                    │  • 256-bit random key          │
                    │  • Disimpan WRAPPED            │
                    │    (terenkripsi) di Firestore  │
                    │  • Di-unwrap ke memori saat    │
                    │    login                       │
                    │                               │
                    │  Fungsi:                      │
                    │  • Enkripsi isi jurnal         │
                    │  • Dekripsi isi jurnal         │
                    │  • Enkripsi riwayat chat AI    │
                    │  • Dekripsi riwayat chat AI    │
                    └──────────────────────────────┘
```

### Mengapa 2 Lapis?

| Keuntungan | Penjelasan |
|------------|------------|
| **Key Rotation** | Data key bisa di-rotate (generate ulang) tanpa mengubah turunan PBKDF2 |
| **Defense in Depth** | Ciphertext jurnal tidak langsung terikat ke UID/PIN; ada lapisan pemisah |
| **Separation of Concerns** | Wrapping key hanya untuk membungkus/membuka kunci, bukan untuk enkripsi data |
| **Keamanan di Firestore** | Yang tersimpan di Firestore adalah wrapped key (terenkripsi), bukan raw key |

### Apa yang Disimpan di Firestore?

```
Firestore Collection: users/{uid}
├── salt          : string (base64)    ← Salt 16 byte, non-rahasia
├── wrappedKey    : {                  ← Data key yang SUDAH dibungkus
│     iv: string (base64),             ← IV untuk proses wrapping
│     wrapped: string (base64)         ← Data key terenkripsi
│   }
├── nickname      : string             ← Nama tampilan acak
└── createdAt     : timestamp
```

> ⚠️ **PENTING:** Data key dalam bentuk asli (raw) **TIDAK PERNAH** disimpan di mana pun — baik di Firestore, localStorage, maupun sessionStorage. Data key hanya ada di **memori (RAM)** selama aplikasi berjalan.

---

## 4. Alur Kriptografi End-to-End

### 4.1 Alur Saat Pengguna Pertama Kali Login

```
┌─────────────┐     ┌─────────────────────────────────────────────────────┐
│  PENGGUNA   │     │                    BROWSER                         │
│  (baru)     │     │                                                     │
│             │     │  1. Firebase Anonymous Auth → dapat UID              │
│  Login      │────►│  2. Generate salt acak (16 byte)                    │
│  anonim     │     │  3. Derive wrapping key:                            │
│             │     │     PBKDF2(UID, salt, 210000, SHA256) → wrapping key│
│             │     │  4. Generate data key acak (AES-256)                │
│             │     │  5. Wrap data key dengan wrapping key               │
│             │     │  6. Simpan ke Firestore:                            │
│             │     │     • salt (base64)                                  │
│             │     │     • wrappedKey {iv, wrapped} (base64)              │
│             │     │  7. Data key tetap di MEMORI (React state)           │
│             │     │     → siap untuk enkripsi/dekripsi                   │
└─────────────┘     └─────────────────────────────────────────────────────┘
```

### 4.2 Alur Saat Pengguna Login Kembali (Sesi Berikutnya)

```
┌─────────────┐     ┌─────────────────────────────────────────────────────┐
│  PENGGUNA   │     │                    BROWSER                         │
│  (kembali)  │     │                                                     │
│             │     │  1. Firebase Auth → UID yang sama                    │
│  Login      │────►│  2. Baca salt + wrappedKey dari Firestore           │
│  ulang      │     │  3. Derive wrapping key:                            │
│             │     │     PBKDF2(UID, salt, 210000, SHA256) → wrapping key│
│             │     │  4. Unwrap data key dari wrappedKey                  │
│             │     │  5. Data key di MEMORI → jurnal lama bisa            │
│             │     │     didekripsi kembali ✓                             │
└─────────────┘     └─────────────────────────────────────────────────────┘
```

### 4.3 Alur Enkripsi Saat Menyimpan Jurnal

```
┌──────────────────┐     ┌──────────────────────────────────────────────┐
│ PENGGUNA MENULIS │     │              PROSES ENKRIPSI                 │
│                  │     │                                              │
│ "Hari ini aku    │     │  1. Generate IV baru (12 byte acak)          │
│  merasa senang   │────►│  2. AES-256-GCM.encrypt(                    │
│  setelah ngobrol │     │       plaintext, dataKey, IV                 │
│  sama teman"     │     │     )                                        │
│                  │     │  3. Hasilkan:                                │
│                  │     │     • iv: "a7Bx9pQ2..."       (base64)       │
│                  │     │     • ciphertext: "9WhimssxyE..." (base64)   │
│                  │     │                                              │
│                  │     │  4. YANG DIKIRIM ke Firestore:                │
│                  │     │     { iv, ciphertext, positiveScore, ... }   │
│                  │     │     ← BUKAN plaintext!                       │
└──────────────────┘     └──────────────────────────────────────────────┘

                    ┌──────────────────────────────────────────────┐
                    │         DATA DI FIRESTORE                    │
                    │                                              │
                    │  journals/{uid}/entries/{entryId}            │
                    │  ├── ciphertext : "9WhimssxyEbRNbZ1oUo..."  │
                    │  ├── iv         : "a7Bx9pQ2kLm..."          │
                    │  ├── positiveScore : 7                       │
                    │  ├── negativeScore : 2                       │
                    │  └── createdAt  : Timestamp                  │
                    │                                              │
                    │  ⚠️ Field ciphertext berisi TEKS ACAK,       │
                    │     BUKAN isi jurnal asli                    │
                    └──────────────────────────────────────────────┘
```

### 4.4 Alur Enkripsi Riwayat Percakapan AI

```
┌──────────────────────────────────────────────────────────────────┐
│  SETELAH PERCAKAPAN AI SELESAI                                   │
│                                                                   │
│  1. Riwayat percakapan (array of messages) di-serialize ke JSON  │
│     JSON.stringify(history)                                       │
│                                                                   │
│  2. JSON string dienkripsi:                                       │
│     AES-256-GCM.encrypt(jsonString, dataKey, newIV)              │
│                                                                   │
│  3. Disimpan ke Firestore:                                        │
│     journals/{uid}/sessions/{sessionId}                           │
│     ├── encryptedHistory : { iv, ciphertext }  ← TERENKRIPSI     │
│     ├── emotionLabel     : "senang"            ← metadata, tidak │
│     ├── emotionType      : "positive"             dienkripsi     │
│     ├── score            : 8                      (untuk grafik) │
│     ├── plutchikCategory : "joy"                                 │
│     └── completedAt      : Timestamp                             │
│                                                                   │
│  ✅ Isi percakapan (teks sensitif) → terenkripsi                  │
│  ℹ️  Metadata emosi (non-sensitif) → tidak dienkripsi             │
│     (diperlukan untuk grafik/statistik tanpa perlu dekripsi)      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Penjelasan Detail Per Komponen

### 5.1 `cryptoService.js` — Modul Kriptografi Inti

File: [`src/utils/cryptoService.js`](file:///c:/Users/ASUS/Downloads/mindquest-splash%20(1)/src/utils/cryptoService.js)

Ini adalah **jantung kriptografi** MindQuest. Seluruh operasi kripto terpusat di sini.

#### Konstanta Keamanan

```javascript
const PBKDF2_ITERATIONS = 210_000  // Rekomendasi OWASP 2023 untuk PBKDF2-SHA256
const AES_KEY_LENGTH    = 256      // 256-bit AES (tingkat keamanan tertinggi)
const GCM_IV_LENGTH_BYTES = 12     // 96-bit IV, standar rekomendasi NIST untuk AES-GCM
```

| Konstanta | Nilai | Standar Acuan | Penjelasan |
|-----------|-------|---------------|------------|
| `PBKDF2_ITERATIONS` | 210.000 | OWASP 2023 | Jumlah iterasi hashing untuk memperlambat brute-force |
| `AES_KEY_LENGTH` | 256 bit | NIST FIPS 197 | Panjang kunci AES (level terkuat: 128/192/**256**) |
| `GCM_IV_LENGTH_BYTES` | 12 byte | NIST SP 800-38D | Panjang IV yang direkomendasikan untuk mode GCM |

#### Fungsi-fungsi yang Diekspor

| Fungsi | Tujuan | Input | Output |
|--------|--------|-------|--------|
| `generateSaltBase64()` | Membuat salt 16 byte acak | — | `string` (base64) |
| `deriveWrappingKey(pin, saltBase64)` | Menurunkan wrapping key via PBKDF2 | PIN + Salt | `CryptoKey` (non-extractable) |
| `generateDataKey()` | Membuat data key AES-256-GCM acak | — | `CryptoKey` (extractable) |
| `wrapDataKey(dataKey, wrappingKey)` | Membungkus data key | Data key + Wrapping key | `{iv, wrapped}` (base64) |
| `unwrapDataKey(wrappedObj, wrappingKey)` | Membuka bungkusan data key | Wrapped obj + Wrapping key | `CryptoKey` |
| `encryptText(plaintext, dataKey)` | Enkripsi teks jurnal | Teks + Data key | `{iv, ciphertext}` (base64) |
| `decryptText(payload, dataKey)` | Dekripsi ciphertext jurnal | `{iv, ciphertext}` + Data key | `string` (plaintext) |

#### Properti Keamanan Kunci

```
Wrapping Key:
  • extractable: false   → JavaScript TIDAK BISA membaca raw bytes kunci ini
  • usages: ['wrapKey', 'unwrapKey']  → HANYA bisa wrap/unwrap, BUKAN encrypt/decrypt

Data Key:
  • extractable: true    → Bisa di-wrap (diekspor dalam bentuk terenkripsi)
  • usages: ['encrypt', 'decrypt']  → Digunakan langsung untuk enkripsi data
```

### 5.2 `keyManager.js` — Manajemen Kunci + Firestore

File: [`src/utils/keyManager.js`](file:///c:/Users/ASUS/Downloads/mindquest-splash%20(1)/src/utils/keyManager.js)

Menjembatani modul kripto murni (`cryptoService.js`) dengan penyimpanan kunci di Firestore.

```
┌────────────────────────────────────────────────────────┐
│  getOrCreateDataKey(uid, pin)                          │
│                                                        │
│  if (user sudah punya salt & wrappedKey di Firestore)  │
│    → Derive wrapping key dari PIN + salt               │
│    → Unwrap data key dari wrappedKey                   │
│    → Return data key (siap pakai)                      │
│                                                        │
│  else (user baru, pertama kali login)                  │
│    → Generate salt baru (16 byte acak)                 │
│    → Derive wrapping key dari PIN + salt               │
│    → Generate data key baru (256-bit acak)             │
│    → Wrap data key dengan wrapping key                 │
│    → Simpan {salt, wrappedKey} ke Firestore            │
│    → Return data key (siap pakai)                      │
└────────────────────────────────────────────────────────┘
```

### 5.3 `useEncryptionKey.js` — React Hook Manajemen Kunci

File: [`src/hooks/useEncryptionKey.js`](file:///c:/Users/ASUS/Downloads/mindquest-splash%20(1)/src/hooks/useEncryptionKey.js)

```
┌────────────────────────────────────────────────────────┐
│  useEncryptionKey(uid, pin)                            │
│                                                        │
│  • Data key disimpan di React state (MEMORI saja)      │
│  • TIDAK PERNAH ditulis ke:                            │
│    ✗ localStorage                                      │
│    ✗ sessionStorage                                    │
│    ✗ IndexedDB                                         │
│    ✗ Cookie                                            │
│    ✗ Disk apapun                                       │
│                                                        │
│  • Keamanan: Jika device dicuri dalam keadaan app      │
│    tertutup, kunci TIDAK ADA di storage mana pun       │
│                                                        │
│  Returns: { dataKey, ready, error }                    │
└────────────────────────────────────────────────────────┘
```

### 5.4 `firestoreService.js` — CRUD Terenkripsi

File: [`src/services/firestoreService.js`](file:///c:/Users/ASUS/Downloads/mindquest-splash%20(1)/src/services/firestoreService.js)

Semua operasi baca/tulis ke Firestore melewati proses enkripsi/dekripsi:

```
SIMPAN (addJournalEntry):
  plaintext → encryptText(plaintext, dataKey) → {iv, ciphertext} → addDoc(Firestore)

BACA (getJournalEntries):
  getDocs(Firestore) → {iv, ciphertext} → decryptText({iv, ciphertext}, dataKey) → plaintext

SIMPAN SESI AI (saveSession):
  history (array) → JSON.stringify → encryptText → {encryptedHistory} → addDoc(Firestore)

BACA SESI AI (getSessions):
  getDocs(Firestore) → {encryptedHistory} → decryptText → JSON.parse → history (array)
```

### 5.5 `firestore.rules` — Keamanan Tingkat Database

File: [`firestore.rules`](file:///c:/Users/ASUS/Downloads/mindquest-splash%20(1)/firestore.rules)

```
Aturan akses Firestore (Defense in Depth):

users/{userId}
  → Hanya bisa dibaca/ditulis oleh pemilik (request.auth.uid == userId)

journals/{userId}/entries/{entryId}
  → Hanya bisa dibaca/ditulis oleh pemilik

journals/{userId}/sessions/{sessionId}
  → Hanya bisa dibaca/ditulis oleh pemilik

Default:
  → DENY ALL (semua path lain ditolak)
```

> Meskipun data sudah terenkripsi, Firestore Rules memastikan bahwa **bahkan ciphertext sekalipun tidak bisa diakses** oleh pengguna lain — ini adalah prinsip **Defense in Depth**.

### 5.6 Keamanan Server-Side (Cloud Functions)

File: [`functions/src/index.js`](file:///c:/Users/ASUS/Downloads/mindquest-splash%20(1)/functions/src/index.js)

```
┌────────────────────────────────────────────────────────┐
│  Cloud Function: analyzeEmotion                        │
│                                                        │
│  Keamanan:                                             │
│  1. Verifikasi Firebase ID Token (Bearer token)        │
│  2. Validasi method (hanya POST)                       │
│  3. Validasi body (message wajib, history harus array) │
│  4. GEMINI_API_KEY disimpan sebagai Firebase Secret     │
│     → TIDAK ADA di .env client, tidak pernah terkirim  │
│       ke browser                                       │
│                                                        │
│  Catatan Penting:                                      │
│  • Yang dikirim ke Cloud Function adalah pesan          │
│    PLAINTEXT (belum dienkripsi) karena AI perlu membaca │
│    isi pesan untuk memberikan respons                   │
│  • Setelah percakapan selesai, riwayat dienkripsi      │
│    di browser SEBELUM disimpan ke Firestore             │
│  • Cloud Function menggunakan HTTPS (TLS) untuk        │
│    enkripsi data in-transit                             │
└────────────────────────────────────────────────────────┘
```

### 5.7 Service Worker & PWA Cache Security

File: [`src/sw.js`](file:///c:/Users/ASUS/Downloads/mindquest-splash%20(1)/src/sw.js)

```
Strategi caching berdasarkan sensitivitas data:

Firebase Auth (identitytoolkit.googleapis.com)
  → NetworkOnly — Token TIDAK BOLEH di-cache

Cloud Functions (*.cloudfunctions.net)
  → NetworkOnly — Respons AI tidak di-cache

Firestore (firestore.googleapis.com)
  → NetworkFirst — Fallback ke cache, tapi data sudah terenkripsi

Aset statis (gambar, font)
  → CacheFirst — Aman untuk di-cache
```

---

## 6. Peta File & Kode Sumber

```
mindquest/
├── src/
│   ├── utils/
│   │   ├── cryptoService.js        ← ⭐ INTI: Semua operasi kriptografi
│   │   ├── cryptoService.test.js   ← Unit test enkripsi/dekripsi
│   │   └── keyManager.js           ← Manajemen kunci + Firestore bridge
│   │
│   ├── hooks/
│   │   ├── useEncryptionKey.js     ← React hook data key (memori only)
│   │   ├── useAuth.js              ← React hook autentikasi
│   │   └── useConversation.js      ← Hook percakapan AI (enkripsi sesi)
│   │
│   ├── services/
│   │   ├── firestoreService.js     ← CRUD jurnal & sesi (terenkripsi)
│   │   ├── authService.js          ← Anonymous auth + profil
│   │   └── conversationService.js  ← Komunikasi ke Cloud Function
│   │
│   ├── config/
│   │   └── firebase.js             ← Konfigurasi Firebase (dari .env)
│   │
│   └── sw.js                       ← Service Worker (cache security)
│
├── functions/src/
│   └── index.js                    ← Cloud Function (token verification)
│
├── firestore.rules                 ← Security rules per-user
│
├── tests/
│   ├── entropy_test.py             ← Uji Shannon Entropy ciphertext
│   └── entropy_report.json         ← Hasil uji entropi
│
└── docs/
    └── KRIPTOGRAFI-README.md       ← 📘 Dokumen ini
```

---

## 7. Skenario Demo Langkah demi Langkah

### Demo 1: Membuktikan Data Terenkripsi di Firestore

**Tujuan:** Menunjukkan bahwa isi jurnal yang tersimpan di database adalah ciphertext (bukan plaintext).

**Langkah-langkah:**

1. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```

2. **Buka browser** → `http://localhost:5173`

3. **Login anonim** (otomatis) → Catat UID yang muncul di UI

4. **Tulis jurnal**, misal:
   > "Hari ini aku senang karena nilai ujianku bagus"

5. **Buka Firebase Console** → Firestore Database → Koleksi `journals` → `{uid}` → `entries`

6. **Perhatikan field `ciphertext`:**
   ```
   ❌ BUKAN: "Hari ini aku senang karena nilai ujianku bagus"
   ✅ YANG ADA: "9WhimssxyEbRNbZ1oUox464Zd6Tx8RDQKgZlFa5Hx..."
   ```

7. **Kembali ke aplikasi** → Entri jurnal yang sama tetap tampil dalam bentuk **plaintext** (didekripsi di browser)

> **Kesimpulan Demo 1:** Firebase (server) hanya menyimpan ciphertext. Hanya browser pengguna yang bisa membaca isi aslinya.

---

### Demo 2: Membuktikan IV Selalu Berbeda (Non-Reuse)

**Tujuan:** Menunjukkan bahwa plaintext yang sama menghasilkan ciphertext berbeda setiap kali.

**Langkah-langkah:**

1. Tulis jurnal pertama: **"test"**
2. Tulis jurnal kedua: **"test"** (isi sama persis)
3. Buka Firestore → Bandingkan kedua dokumen:

   ```
   Entry 1: { iv: "a7Bx9pQ2...", ciphertext: "kLm4nOp5..." }
   Entry 2: { iv: "rStUvWx6...", ciphertext: "yZaB1cDe..." }
                ↑ BERBEDA           ↑ BERBEDA
   ```

> **Kesimpulan Demo 2:** IV baru di-generate setiap enkripsi, sehingga ciphertext selalu unik meskipun plaintext sama. Ini mencegah *pattern analysis attack*.

---

### Demo 3: Menjalankan Unit Test Kriptografi

**Tujuan:** Membuktikan bahwa seluruh mekanisme kriptografi berjalan benar secara programatik.

```bash
npm run test
```

**Test yang dijalankan (5 test case):**

| # | Test Case | Verifikasi |
|---|-----------|------------|
| 1 | Enkripsi → dekripsi menghasilkan plaintext yang sama | Correctness |
| 2 | Ciphertext berbeda untuk plaintext sama (IV acak) | IV non-reuse |
| 3 | Dekripsi gagal jika data key salah | Key isolation |
| 4 | Wrap → unwrap menghasilkan key yang identik fungsinya | Key wrapping integrity |
| 5 | UID berbeda menghasilkan wrapping key berbeda (salt sama) | User isolation |

**Output yang diharapkan:**
```
✓ mengenkripsi lalu mendekripsi teks dan menghasilkan plaintext yang sama persis
✓ menghasilkan ciphertext berbeda untuk plaintext yang sama (IV acak setiap kali)
✓ gagal dekripsi (melempar error) jika memakai data key yang salah
✓ wrap lalu unwrap data key menghasilkan key yang fungsinya identik
✓ UID yang berbeda menghasilkan wrapping key yang berbeda (salt sama)

Test Files  1 passed (1)
Tests       5 passed (5)
```

---

### Demo 4: Uji Shannon Entropy Ciphertext

**Tujuan:** Mengukur tingkat keacakan (randomness) ciphertext secara statistik.

```bash
python tests/entropy_test.py
```

**Penjelasan:**
- **Shannon Entropy** mengukur seberapa acak distribusi byte dalam ciphertext
- Skala: 0 (tidak acak) hingga 8 (acak sempurna untuk byte)
- Threshold keamanan: ≥ 7.9 bits/byte (setara noise acak murni)
- Ciphertext yang baik harus mendekati 8.0

> **Catatan:** Sampel yang sangat pendek (<64 byte) secara statistik belum bisa mencapai entropi ≥7.9 bukan karena algoritma lemah, melainkan karena ukuran sampel terlalu kecil untuk distribusi 256 kemungkinan byte. Gunakan sampel yang lebih panjang untuk hasil yang representatif.

---

### Demo 5: Membuktikan Keamanan Wrapped Key di Firestore

**Tujuan:** Menunjukkan bahwa data key tersimpan dalam bentuk terbungkus (wrapped), bukan raw key.

1. Buka Firebase Console → Firestore → Koleksi `users` → Pilih dokumen UID

2. Perhatikan field:
   ```json
   {
     "salt": "rAnDoMbAsE64sAlT==",
     "wrappedKey": {
       "iv": "aBcDeFgHiJkL",
       "wrapped": "xYz123456789AbCdEf..."
     }
   }
   ```

3. Field `wrapped` berisi data key yang **sudah dienkripsi** oleh wrapping key
4. Tanpa mengetahui PIN/UID (untuk menurunkan wrapping key), data key ini **tidak bisa dibuka**

---

## 8. Pengujian Keamanan Kriptografi

### 8.1 Unit Test (`cryptoService.test.js`)

| Kategori | Test | Status |
|----------|------|--------|
| **Correctness** | Enkripsi + dekripsi = plaintext asli | ✅ |
| **Randomness** | IV berbeda setiap enkripsi | ✅ |
| **Key Isolation** | Dekripsi gagal dengan key yang salah | ✅ |
| **Key Wrapping** | Wrap + unwrap = key yang berfungsi identik | ✅ |
| **User Isolation** | UID berbeda = wrapping key berbeda | ✅ |

### 8.2 Shannon Entropy Test (`entropy_test.py`)

| Parameter | Nilai |
|-----------|-------|
| Algoritma yang diuji | AES-256-GCM |
| KDF | PBKDF2-SHA256 (210.000 iterasi) |
| Threshold kelulusan | ≥ 7.9 bits/byte |
| Metode | Analisis distribusi byte ciphertext dari Firestore |

### 8.3 Defense-in-Depth Checklist

| Layer | Mekanisme | Status |
|-------|-----------|--------|
| **Enkripsi Data** | AES-256-GCM (client-side) | ✅ Aktif |
| **Key Derivation** | PBKDF2-SHA256 (210.000 iterasi) | ✅ Aktif |
| **Key Wrapping** | AES-GCM wrap/unwrap | ✅ Aktif |
| **Key Storage** | Hanya di memori (React state) | ✅ Aktif |
| **IV Management** | Random 12-byte IV setiap enkripsi | ✅ Aktif |
| **Database Access Control** | Firestore Rules (per-user) | ✅ Aktif |
| **API Authentication** | Firebase ID Token (Bearer) | ✅ Aktif |
| **Secret Management** | Firebase Secrets (server-side only) | ✅ Aktif |
| **Transport Security** | HTTPS/TLS (Firebase default) | ✅ Aktif |
| **Cache Security** | NetworkOnly untuk Auth & AI | ✅ Aktif |

---

## 9. Standar & Referensi

| Standar | Penerapan di MindQuest |
|---------|----------------------|
| **NIST FIPS 197** | AES-256 sebagai algoritma enkripsi |
| **NIST SP 800-38D** | GCM mode dengan IV 96-bit |
| **NIST SP 800-132** | PBKDF2 untuk key derivation |
| **OWASP Password Storage Cheat Sheet (2023)** | 210.000 iterasi PBKDF2-SHA256 |
| **OWASP Cryptographic Storage Cheat Sheet** | Client-side encryption, key separation |
| **OWASP Top 10 for LLM Applications (2025)** | Mitigasi ancaman AI |
| **W3C Web Crypto API Specification** | Implementasi kriptografi tanpa library eksternal |

---

## 10. Keterbatasan & Rekomendasi

### Keterbatasan Saat Ini

| # | Keterbatasan | Dampak | Mitigasi Potensial |
|---|-------------|--------|-------------------|
| 1 | **Anonymous Auth terikat device/browser** | Jika user clear data browser, UID hilang → jurnal lama tidak bisa diakses | Tambahkan opsi "Hubungkan Akun" (link ke Google/Email) |
| 2 | **Data key hilang saat app ditutup** | User harus re-derive setiap buka app (memerlukan koneksi ke Firestore) | Ini **desain yang disengaja** demi keamanan |
| 3 | **Pesan ke AI dikirim plaintext** | Cloud Function melihat isi pesan untuk proses AI | Tidak bisa dihindari — AI perlu membaca teks; dimitigasi oleh HTTPS + token auth |
| 4 | **Metadata emosi tidak dienkripsi** | Label emosi, skor, kategori Plutchik tersimpan plaintext | Trade-off: diperlukan untuk grafik/statistik tanpa perlu dekripsi |
| 5 | **PBKDF2 vs Argon2** | PBKDF2 tidak seresistan Argon2 terhadap GPU-based attack | Web Crypto API belum mendukung Argon2; 210.000 iterasi PBKDF2 masih memadai |

### Rekomendasi untuk Pengembangan Lanjutan

1. **Key Rotation** — Tambahkan mekanisme re-encrypt seluruh jurnal dengan data key baru secara berkala
2. **Account Linking** — Integrasikan Google/Email auth agar data bisa diakses lintas-device
3. **Backup Key** — Recovery phrase untuk menyelamatkan data jika UID anonim hilang
4. **CSP Headers** — Tambahkan Content Security Policy untuk mencegah XSS yang bisa mencuri data key dari memori

---

## Diagram Ringkasan Arsitektur Kriptografi

```
┌────────────────────────────────────────────────────────────────────┐
│                          BROWSER (CLIENT)                          │
│                                                                    │
│   ┌─────────┐     ┌──────────┐     ┌──────────────────────────┐   │
│   │  USER   │────►│ PIN/UID  │────►│ PBKDF2-SHA256 (210K)    │   │
│   │  INPUT  │     │          │     │ + Salt (16 byte acak)    │   │
│   └─────────┘     └──────────┘     └───────────┬──────────────┘   │
│                                                 │                  │
│                                        Wrapping Key                │
│                                                 │                  │
│                                    ┌────────────▼─────────────┐   │
│   ┌──────────────┐                 │    UNWRAP / WRAP         │   │
│   │  DATA KEY    │◄────────────────│    (AES-GCM)             │   │
│   │  (256-bit    │                 │                           │   │
│   │   in RAM)    │                 └───────────────────────────┘   │
│   └──────┬───────┘                                                 │
│          │                                                         │
│   ┌──────▼───────┐         ┌──────────────┐                       │
│   │  AES-256-GCM │────────►│  CIPHERTEXT  │──── ke Firestore ───►│
│   │  + IV (12B)  │         │  + IV        │                       │
│   └──────────────┘         └──────────────┘                       │
│                                                                    │
│   ┌──────────────┐         ┌──────────────┐                       │
│   │  AES-256-GCM │◄────────│  CIPHERTEXT  │◄── dari Firestore ──│
│   │  DECRYPT     │         │  + IV        │                       │
│   └──────┬───────┘         └──────────────┘                       │
│          │                                                         │
│   ┌──────▼───────┐                                                 │
│   │  PLAINTEXT   │  ← Hanya ada di browser, tidak pernah          │
│   │  (jurnal)    │    dikirim ke server dalam bentuk asli          │
│   └──────────────┘                                                 │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                    FIREBASE (SERVER)                                │
│                                                                    │
│   Firestore hanya menyimpan:                                       │
│   • salt (non-rahasia)                                             │
│   • wrappedKey (data key terenkripsi)                              │
│   • ciphertext jurnal (teks acak, bukan plaintext)                 │
│   • encryptedHistory (riwayat chat terenkripsi)                    │
│   • metadata emosi (non-sensitif, untuk grafik)                    │
│                                                                    │
│   Server TIDAK PERNAH memiliki:                                    │
│   • Data key dalam bentuk asli                                     │
│   • Plaintext jurnal                                               │
│   • Plaintext riwayat percakapan                                   │
└────────────────────────────────────────────────────────────────────┘
```

---

> 📘 **Dokumen ini disusun sebagai panduan demo dan referensi teknis implementasi kriptografi pada proyek MindQuest.**
> Dapat digunakan untuk presentasi, sidang skripsi, atau audit keamanan.
