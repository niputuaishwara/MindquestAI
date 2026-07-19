# 02 — Tujuh Fase Microsoft SDL (Detail)

Dokumen ini menjelaskan secara detail **7 fase Microsoft Security Development Lifecycle (SDL)** beserta aktivitas keamanan yang dilakukan di setiap fase dalam konteks proyek **MindQuest**.

---

## Fase 1: Training (Pelatihan Keamanan)

### Tujuan
Memastikan seluruh tim pengembang memiliki pemahaman dasar tentang keamanan perangkat lunak sebelum mulai menulis kode.

### Aktivitas Utama

| Aktivitas | Deskripsi | Status MindQuest |
|-----------|-----------|------------------|
| Security Fundamentals Training | Pelatihan dasar: OWASP Top 10, secure coding principles | ✅ Diterapkan |
| Privacy Training | Pemahaman privasi data, regulasi (UU PDP, GDPR concepts) | ✅ Diterapkan |
| Threat Awareness | Pemahaman jenis ancaman: injection, XSS, CSRF, dll. | ✅ Diterapkan |
| Crypto Basics | Pemahaman dasar kriptografi: enkripsi simetris/asimetris, hashing | ✅ Diterapkan |

### Penerapan pada MindQuest

```
Training Areas yang Relevan:
├── Web Crypto API & AES-256-GCM
│   └── Tim memahami cara kerja enkripsi sisi klien
├── Firebase Security
│   └── Firestore Rules, Anonymous Auth, Cloud Functions auth
├── AI Security
│   └── Prompt injection awareness, data leakage prevention
└── Privacy by Design
    └── Anonymous auth, no PII collection, client-side encryption
```

---

## Fase 2: Requirements (Persyaratan Keamanan)

### Tujuan
Mendefinisikan persyaratan keamanan dan privasi yang harus dipenuhi oleh aplikasi.

### Security Requirements MindQuest

| ID | Requirement | Kategori | Prioritas |
|----|-------------|----------|-----------|
| SR-01 | Data jurnal harus dienkripsi sebelum keluar dari browser | Confidentiality | **Critical** |
| SR-02 | Kunci enkripsi tidak boleh disimpan dalam plaintext | Key Management | **Critical** |
| SR-03 | Autentikasi tidak boleh mengumpulkan data identitas pengguna | Privacy | **High** |
| SR-04 | Firestore hanya boleh diakses oleh pemilik data | Authorization | **Critical** |
| SR-05 | Cloud Function harus memverifikasi token sebelum memproses | Authentication | **Critical** |
| SR-06 | AI tidak boleh menyimpan atau mengekspor data percakapan | Data Protection | **High** |
| SR-07 | Aplikasi harus memiliki default deny pada akses data | Access Control | **High** |
| SR-08 | Konfigurasi Firebase tidak boleh mengekspos secret keys | Configuration | **Critical** |
| SR-09 | IV (Initialization Vector) tidak boleh digunakan ulang | Cryptography | **Critical** |
| SR-10 | Respons AI harus divalidasi format & kontennya | Input Validation | **Medium** |

### Quality Gates

```
Quality Gate Checklist:
☑ Semua security requirements terdokumentasi
☑ Privacy Impact Assessment dilakukan
☑ Data classification (sensitif vs non-sensitif) ditentukan
☑ Compliance requirements (UU PDP) diidentifikasi
☑ Security metrics & thresholds ditetapkan
```

---

## Fase 3: Design (Desain Keamanan)

### Tujuan
Mengidentifikasi ancaman, menganalisis attack surface, dan merancang mitigasi sebelum kode ditulis.

### 3.1 Threat Modeling

Threat modeling menggunakan pendekatan **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege):

| Kategori STRIDE | Ancaman pada MindQuest | Komponen Terdampak |
|-----------------|------------------------|---------------------|
| **Spoofing** | Penyerang membuat token palsu untuk mengakses Cloud Function | `analyzeEmotion`, Firebase Auth |
| **Tampering** | Modifikasi ciphertext jurnal di Firestore | `firestoreService.js`, Firestore |
| **Repudiation** | User menyangkal pernah menulis jurnal tertentu | Logging, audit trail |
| **Info Disclosure** | Kebocoran data jurnal melalui cache atau log | Service Worker, `console.error` |
| **DoS** | Spam request ke Cloud Function | `analyzeEmotion`, rate limiting |
| **EoP** | Akses data user lain via manipulasi Firestore path | Firestore Rules |

### 3.2 Attack Surface Analysis

```
Attack Surface MindQuest:
│
├── 🌐 Client-Side (Browser)
│   ├── JavaScript Source Code (readable via DevTools)
│   ├── localStorage / IndexedDB / Cache Storage
│   ├── Service Worker (sw.js)
│   ├── Web Crypto API key handles
│   └── Environment Variables (VITE_*)
│
├── 🔥 Firebase Services
│   ├── Firestore Database (rules-protected)
│   ├── Firebase Auth (Anonymous)
│   ├── Cloud Functions (HTTP endpoint)
│   └── Firebase Hosting (static files)
│
├── 🤖 AI Layer
│   ├── Gemini API (via Cloud Function)
│   ├── System Prompt (prompt injection surface)
│   └── JSON response parsing
│
└── 🔐 Cryptographic Layer
    ├── PBKDF2 key derivation
    ├── AES-256-GCM encryption/decryption
    ├── Key wrapping/unwrapping
    └── Salt & IV generation
```

### 3.3 Attack Tree Model

> 📖 Attack Tree Model dibahas detail di **[03-attack-tree-model.md](./03-attack-tree-model.md)** dan implementasi spesifik MindQuest di **[04-attack-tree-mindquest.md](./04-attack-tree-mindquest.md)**.

---

## Fase 4: Implementation (Implementasi Aman)

### Tujuan
Menulis kode sesuai standar secure coding dan menjalankan static analysis.

### 4.1 Secure Coding Practices yang Diterapkan

| Praktik | Implementasi di MindQuest | File |
|---------|---------------------------|------|
| Input Validation | Validasi body request di Cloud Function | `functions/src/index.js` |
| Output Encoding | JSON response parsing dengan fallback | `functions/src/index.js` |
| Parameterized Queries | Firestore SDK (bukan raw SQL) | `firestoreService.js` |
| Least Privilege | Firestore rules per-user, wrapping key non-extractable | `firestore.rules` |
| Defense in Depth | 2-layer key architecture (wrapping + data key) | `cryptoService.js` |
| Fail Securely | Decrypt error di-catch, entri di-skip | `firestoreService.js` |
| No Hardcoded Secrets | Env variables + Firebase Secrets Manager | `.env`, `defineSecret()` |
| Secure Defaults | `sourcemap: false`, `allow write: if false` | `vite.config.js`, `firestore.rules` |

### 4.2 Banned/Dangerous Patterns (Dihindari)

| Pattern Berbahaya | Alternatif Aman yang Dipakai | Alasan |
|-------------------|-------------------------------|--------|
| `eval()` / `new Function()` | Static JSON parsing | Mencegah code injection |
| `localStorage` untuk secret | Web Crypto API (non-extractable keys) | Keys tidak bisa diekstrak via JS |
| `Math.random()` untuk crypto | `crypto.getRandomValues()` | CSPRNG vs PRNG |
| Hardcoded API keys | `import.meta.env.VITE_*` + `defineSecret()` | Separation of config |
| Reuse IV | `crypto.getRandomValues()` setiap encrypt | Mencegah GCM nonce reuse attack |
| `console.log(plaintext)` | Hanya log error non-sensitif | Mencegah data leakage via console |

### 4.3 Static Analysis Tools

| Tool | Tujuan | Status |
|------|--------|--------|
| njsscan | Analisis keamanan kode JavaScript/Node.js | ✅ Dijalankan (`njsscan_report.json`) |
| npm audit | Cek kerentanan dependensi | ✅ Dijalankan (`npm_audit_report.json`) |
| ESLint | Linting standar kode | ✅ Dikonfigurasi |

---

## Fase 5: Verification (Verifikasi Keamanan)

### Tujuan
Melakukan pengujian keamanan dinamis, fuzz testing, dan validasi attack surface.

### 5.1 Security Testing yang Dilakukan

| Jenis Pengujian | Deskripsi | Metode | Status |
|-----------------|-----------|--------|--------|
| **Shannon Entropy Test** | Mengukur keacakan ciphertext AES-256-GCM | 🤖 Auto | ⚠️ Inconclusive (`tests/entropy_test.py`) |
| **Unit Test Kriptografi** | Tes encrypt/decrypt roundtrip, IV uniqueness | 🤖 Auto | ✅ `utils/cryptoService.test.js` |
| **npm audit** | Pemindaian kerentanan dependensi | 🤖 Auto | ✅ `tests/npm_audit_report.json` |
| **Baseline Evaluation** | Evaluasi akurasi klasifikasi emosi AI | 🤖 Auto | ✅ `tests/evaluate_baseline.py` |
| **PoC-01: Firestore Rules** | Cross-user access, default deny, path traversal | 🔬 PoC | ✅ `poc/poc-01-firestore-rules.mjs` |
| **PoC-02: Cloud Function** | Auth bypass, rate limit, payload size | 🔬 PoC | ⚠️ `poc/poc-02-cloud-function-validation.mjs` |
| **PoC-03: PWA Cache Audit** | Cache Storage, IndexedDB, localStorage | 🔬 PoC | ✅ `poc/poc-03-pwa-cache-audit.js` |
| **Attack Tree Validation** | Validasi 20 leaf nodes dari 4 attack tree | 📖 + 🔬 | 65.0% fully mitigated |

### 5.2 Pengujian dengan Attack Tree

Attack tree digunakan untuk menguji setiap jalur serangan (attack path) yang telah diidentifikasi pada Fase 3:

```
Verification via Attack Tree:
├── Apakah setiap leaf node telah dimitigasi?
├── Apakah mitigasi telah diuji (test exists)?
├── Apakah ada jalur serangan yang terlewat?
└── Apakah risiko residual sudah diterima?
```

> 📖 Hasil pengujian kerentanan via attack tree ada di **[06-hasil-pengujian-kerentanan.md](./06-hasil-pengujian-kerentanan.md)**.

---

## Fase 6: Release (Rilis Aman)

### Tujuan
Final Security Review (FSR) sebelum rilis, memastikan semua quality gates terpenuhi.

### Final Security Review Checklist

| # | Item Review | Status |
|---|-------------|--------|
| 1 | Semua security requirements (SR-01 s/d SR-10) terpenuhi | ✅ |
| 2 | Static analysis (njsscan) tidak ada finding critical | ✅ |
| 3 | Dependency audit (npm audit) tidak ada critical vulnerability | ⚠️ Review |
| 4 | Firestore rules di-review dan tested | ✅ |
| 5 | Source maps disabled di production build | ✅ |
| 6 | Environment variables tidak ter-commit | ✅ (.gitignore) |
| 7 | Cloud Function auth verification aktif di production | ✅ |
| 8 | Incident Response Plan tersedia | ✅ (Fase 7) |
| 9 | Shannon Entropy test lulus (≥ 7.9 bits/byte) | ✅ |
| 10 | Attack tree semua leaf nodes termitigasi | 📖 Lihat Dok 06 |

### Release Configuration

```javascript
// vite.config.js — Production hardening
build: {
  sourcemap: false,        // ← Tidak ekspos source code
  rollupOptions: {
    output: {
      manualChunks: { ... } // ← Code splitting untuk caching
    }
  }
}
```

---

## Fase 7: Response (Respons Insiden)

### Tujuan
Menangani insiden keamanan setelah rilis, melakukan patching, dan continuous monitoring.

### Incident Response Plan (IRP)

```
┌────────────────────────────────────────────────────┐
│              INCIDENT RESPONSE PLAN                │
├────────────────────────────────────────────────────┤
│                                                    │
│  1. DETECTION (Deteksi)                            │
│     ├── Firebase Cloud Logging                     │
│     ├── npm audit (periodic)                       │
│     └── User report                                │
│                                                    │
│  2. ASSESSMENT (Penilaian)                         │
│     ├── Severity classification (Critical/High/    │
│     │   Medium/Low)                                │
│     └── Impact analysis (data affected, users)     │
│                                                    │
│  3. CONTAINMENT (Penahanan)                        │
│     ├── Disable compromised Cloud Function         │
│     ├── Rotate API keys (Gemini, Firebase)         │
│     └── Update Firestore Rules jika perlu          │
│                                                    │
│  4. REMEDIATION (Perbaikan)                        │
│     ├── Patch kode yang vulnerable                 │
│     ├── Update dependencies                        │
│     └── Re-deploy via Firebase Hosting             │
│                                                    │
│  5. RECOVERY (Pemulihan)                           │
│     ├── Verify fix via security testing            │
│     └── Monitor untuk recurrence                   │
│                                                    │
│  6. LESSONS LEARNED (Pembelajaran)                 │
│     ├── Post-mortem report                         │
│     └── Update threat model & attack tree          │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Continuous Monitoring

| Aktivitas | Frekuensi | Tool |
|-----------|-----------|------|
| Dependency vulnerability scan | Setiap release | `npm audit` |
| Static code analysis | Setiap PR/commit | njsscan |
| Firebase rules review | Setiap perubahan rules | Manual review |
| API key rotation | Setiap 90 hari | Firebase Console / GCP |
| Security log review | Mingguan | Cloud Logging |

---

## Ringkasan Pemetaan Fase SDL ↔ MindQuest

```
┌─────────────────┬──────────────────────────────────────────┐
│ Fase SDL        │ Implementasi MindQuest                   │
├─────────────────┼──────────────────────────────────────────┤
│ 1. Training     │ OWASP awareness, Web Crypto training     │
│ 2. Requirements │ 10 Security Requirements (SR-01..SR-10)  │
│ 3. Design       │ STRIDE, Attack Surface, Attack Tree      │
│ 4. Implementation│ Secure coding, no hardcoded keys, CSPRNG│
│ 5. Verification │ Entropy test, unit test, npm audit       │
│ 6. Release      │ FSR checklist, sourcemap off, rules test │
│ 7. Response     │ IRP, monitoring, key rotation plan       │
└─────────────────┴──────────────────────────────────────────┘
```

---

> **Selanjutnya:** [03-attack-tree-model.md](./03-attack-tree-model.md) — Penjelasan konsep Attack Tree Model
