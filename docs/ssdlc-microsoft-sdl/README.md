# 📘 SSDLC dengan Microsoft SDL Framework — MindQuest

## Dokumentasi Secure Software Development Life Cycle (SSDLC)

Dokumen ini menjelaskan bagaimana konsep **SSDLC (Secure Software Development Life Cycle)** diterapkan pada proyek **MindQuest** menggunakan **framework Microsoft Security Development Lifecycle (SDL)**, dengan pendekatan pengujian kerentanan melalui **Attack Tree Model**.

---

## 📂 Struktur Folder

```
docs/ssdlc-microsoft-sdl/
│
├── README.md                              ← Anda di sini
├── 01-konsep-ssdlc-microsoft-sdl.md       ← Konsep SSDLC & Microsoft SDL
├── 02-fase-microsoft-sdl.md               ← 7 Fase Microsoft SDL (detail)
├── 03-attack-tree-model.md                ← Penjelasan Attack Tree Model
├── 04-attack-tree-mindquest.md            ← Attack Tree spesifik MindQuest (OWASP LLM Top 10)
├── 05-pemetaan-sdl-ke-mindquest.md        ← Pemetaan fase SDL ke kode MindQuest
├── 06-hasil-pengujian-kerentanan.md       ← Hasil pengujian & mitigasi (PoC + Code Review)
├── 07-ringkasan-rekomendasi.md            ← Ringkasan & rekomendasi akhir
│
└── poc/                                   ← Script Proof-of-Concept
    ├── poc-01-firestore-rules.mjs         ← PoC: Cross-user Firestore access
    ├── poc-02-cloud-function-validation.mjs ← PoC: Auth, rate limit, payload
    └── poc-03-pwa-cache-audit.js          ← PoC: PWA cache & offline audit
```

---

## 🎯 Tujuan Dokumentasi

1. Menjelaskan konsep **SSDLC** dan bagaimana **Microsoft SDL** sebagai framework acuan
2. Memetakan setiap fase Microsoft SDL ke implementasi aktual pada proyek MindQuest
3. Menerapkan **Attack Tree Model** (20 leaf nodes, 4 pohon) untuk mengidentifikasi vektor serangan — termasuk jalur **eksfiltrasi** data dan **PWA-specific threats**
4. Memetakan ancaman AI ke **OWASP Top 10 for LLM Applications (2025)**
5. Menguji kerentanan melalui **PoC Execution** dan **Code Review**, lalu menyusun rekomendasi mitigasi

---

## 🏗️ Tentang MindQuest

**MindQuest** adalah aplikasi web (PWA) jurnal harian adaptif untuk pengelolaan emosi remaja dengan fitur:

| Komponen | Teknologi | Fungsi Keamanan |
|----------|-----------|-----------------|
| Frontend | React + Vite (PWA) | Client-side encryption AES-256-GCM |
| Backend | Firebase Cloud Functions | Token verification, server-side AI processing |
| Database | Cloud Firestore | Security Rules per-user, data terenkripsi |
| AI Engine | Gemini API | Multi-turn conversation dengan deteksi krisis |
| Auth | Firebase Anonymous Auth | Privasi pengguna tanpa data identitas |
| Crypto | Web Crypto API (PBKDF2 + AES-GCM) | End-to-end encryption jurnal |

---

## 📖 Cara Membaca

Baca secara berurutan dari dokumen `01` hingga `07` untuk pemahaman komprehensif, atau langsung ke bagian yang relevan:

- **Baru mengenal SSDLC?** → Mulai dari [01-konsep-ssdlc-microsoft-sdl.md](./01-konsep-ssdlc-microsoft-sdl.md)
- **Ingin memahami Attack Tree?** → Langsung ke [03-attack-tree-model.md](./03-attack-tree-model.md)
- **Ingin lihat hasil pengujian?** → Buka [06-hasil-pengujian-kerentanan.md](./06-hasil-pengujian-kerentanan.md)

---

> **Catatan:** Dokumentasi ini disusun sebagai bagian dari proses pengembangan aman pada proyek MindQuest dan dapat digunakan sebagai referensi untuk audit keamanan, laporan akademis, maupun evaluasi teknis.
