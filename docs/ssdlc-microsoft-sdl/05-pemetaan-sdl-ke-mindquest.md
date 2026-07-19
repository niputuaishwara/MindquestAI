# 05 — Pemetaan Fase Microsoft SDL ke Kode MindQuest

Dokumen ini memetakan setiap fase Microsoft SDL secara langsung ke **file, fungsi, dan konfigurasi aktual** dalam proyek MindQuest.

---

## Pemetaan Fase 1: Training → Pemahaman Keamanan Tim

| Topik Training | Bukti Implementasi di MindQuest |
|----------------|----------------------------------|
| Kriptografi dasar (AES-GCM, PBKDF2) | `src/utils/cryptoService.js` — implementasi murni Web Crypto API dengan komentar edukatif |
| OWASP Guidelines | `PBKDF2_ITERATIONS = 210_000` — mengikuti rekomendasi OWASP 2023 |
| Privacy by Design | Anonymous Auth — tidak ada email/password disimpan |
| Firebase Security | Firestore rules dengan pattern per-user ownership |

### Bukti Kode: Komentar Edukatif sebagai Artefak Training

```javascript
// cryptoService.js (baris 1-14)
// Arsitektur kunci (2 lapis):
// 1. "Wrapping key"  — diturunkan via PBKDF2 dari UID + salt acak
// 2. "Data key"      — kunci AES-256-GCM acak sungguhan, dibungkus
//    oleh wrapping key
//
// Pemisahan ini supaya data key bisa di-rotate tanpa
// mengubah turunan PBKDF2 (defense in depth).
```

---

## Pemetaan Fase 2: Requirements → Security Requirements

### SR-01: Enkripsi Sebelum Keluar dari Browser

**File:** `src/services/firestoreService.js`

```javascript
// firestoreService.js baris 32-44
export async function addJournalEntry(uid, dataKey, { text, ... }) {
  const { iv, ciphertext } = await encryptText(text, dataKey)  // ← Enkripsi SEBELUM addDoc
  
  const docRef = await addDoc(entriesCollection(uid), {
    ciphertext,  // ← Hanya ciphertext yang dikirim ke Firestore
    iv,          // ← IV untuk dekripsi
    // text TIDAK pernah dikirim!
  })
}
```

### SR-02: Kunci Tidak Disimpan Plaintext

**File:** `src/utils/cryptoService.js`

```javascript
// cryptoService.js baris 67-79
return crypto.subtle.deriveKey(
  { name: 'PBKDF2', ... },
  baseKey,
  { name: 'AES-GCM', length: AES_KEY_LENGTH },
  false,     // ← extractable = false! Kunci tidak bisa diekspor ke JS
  ['wrapKey', 'unwrapKey']
)
```

### SR-03: Autentikasi Tanpa Data Identitas

**File:** `src/services/authService.js`

```javascript
// authService.js baris 19-33
export async function signInAnonymouslyUser() {
  const { user } = await signInAnonymously(auth)  // ← Tidak ada email/password
  
  if (!snap.exists()) {
    const nickname = generateNickname()  // ← Nickname random, bukan nama asli
    await setDoc(doc(db, 'users', user.uid), {
      nickname,        // ← Satu-satunya "identifier" = nickname acak
      createdAt: ...
    })
  }
}
```

### SR-04: Firestore Hanya Diakses Pemilik

**File:** `firestore.rules`

```
// firestore.rules baris 10-35
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
match /journals/{userId}/entries/{entryId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
match /journals/{userId}/sessions/{sessionId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
match /userState/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
// Default deny
match /{document=**} {
  allow read, write: if false;  // ← DENY ALL sebagai default
}
```

### SR-05: Cloud Function Verifikasi Token

**File:** `functions/src/index.js`

```javascript
// index.js baris 53-73
const authHeader = req.headers.authorization || ''
if (!authHeader.startsWith('Bearer ')) {
  return res.status(401).json({ error: 'Token tidak ditemukan.' })
}

const token = authHeader.split('Bearer ')[1]

// Produksi: verifikasi ketat
try {
  await getAuth().verifyIdToken(token)
} catch (err) {
  return res.status(401).json({ error: 'Token tidak valid.' })
}
```

### SR-06: AI Tidak Menyimpan Data Percakapan

**Implementasi:** Gemini API dipanggil secara stateless per-request. History percakapan dikirim oleh client dan **tidak disimpan** di server Cloud Function.

```javascript
// index.js baris 97-98
const chat = model.startChat({ history })  // ← History dari client, bukan server
const result = await chat.sendMessage(message)
// Tidak ada .save() atau .persist() untuk history
```

### SR-07: Default Deny

**File:** `firestore.rules`

```
// Baris 33-35
match /{document=**} {
  allow read, write: if false;  // ← Semua path yang tidak di-match = DENY
}
```

### SR-08: Konfigurasi Tidak Ekspos Secret Keys

**Files:** `.env`, `.gitignore`, `functions/.env`

```
# .gitignore (excerpt)
.env
.env.local
.env.*.local
functions/.env
```

```javascript
// Firebase config via environment variables (bukan hardcoded)
// src/config/firebase.js baris 8-13
apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
// ...

// Gemini API key via Firebase Secrets Manager
// functions/src/index.js baris 14
export const geminiApiKey = defineSecret('GEMINI_API_KEY')
```

### SR-09: IV Tidak Digunakan Ulang

**File:** `src/utils/cryptoService.js`

```javascript
// Setiap panggilan encryptText() generate IV baru
// cryptoService.js baris 130-131
export async function encryptText(plaintext, dataKey) {
  const iv = crypto.getRandomValues(new Uint8Array(GCM_IV_LENGTH_BYTES))
  // ← IV baru setiap kali! Tidak pernah reuse.
}

// Juga saat wrapDataKey()
// cryptoService.js baris 97
const iv = crypto.getRandomValues(new Uint8Array(GCM_IV_LENGTH_BYTES))
```

### SR-10: Validasi Respons AI

**File:** `functions/src/index.js`

```javascript
// index.js baris 117-121
const validPhases = ['clarify', 'deepening', 'scoring', 'distress']
if (!validPhases.includes(parsed.phase)) parsed.phase = 'deepening'   // ← Fallback aman
if (typeof parsed.message !== 'string') parsed.message = ''           // ← Type check
if (typeof parsed.isComplete !== 'boolean') parsed.isComplete = false  // ← Type check
```

---

## Pemetaan Fase 3: Design → Threat Modeling Artifacts

| Artifact | Lokasi |
|----------|--------|
| Attack Surface Analysis | Dokumen `02-fase-microsoft-sdl.md` §3.2 |
| STRIDE Threat Model | Dokumen `02-fase-microsoft-sdl.md` §3.1 |
| Attack Tree (4 pohon) | Dokumen `04-attack-tree-mindquest.md` |
| Arsitektur 2-layer key | `src/utils/cryptoService.js` (komentar arsitektur baris 1-14) |

### Data Flow Diagram

```
┌─────────┐   plaintext    ┌──────────┐  ciphertext   ┌───────────┐
│  User   │ ──────────────▶│ Browser  │ ─────────────▶│ Firestore │
│ (Remaja)│                │ (React)  │               │ (Cloud)   │
└─────────┘                │          │               └───────────┘
     │                     │ Web      │                     │
     │    curhat text      │ Crypto   │                     │
     │ ──────────────────▶ │ API      │                     │
     │                     └─────┬────┘                     │
     │                           │ POST (auth token)        │
     │                     ┌─────▼────┐                     │
     │                     │ Cloud    │                     │
     │   respons AI        │ Function │                     │
     │ ◀───────────────────│ (Node.js)│                     │
     │                     └─────┬────┘                     │
     │                           │ Gemini API               │
     │                     ┌─────▼────┐                     │
     │                     │ Gemini   │                     │
     │                     │ AI       │                     │
     │                     └──────────┘                     │
     │                                                      │
     │         TRUST BOUNDARY                               │
     │  ═══════════════════════════════════                 │
     │  Browser (untrusted) ║ Server (trusted)              │
```

---

## Pemetaan Fase 4: Implementation → Secure Coding Evidence

### File-by-File Security Audit

| File | Secure Practice | Detail |
|------|-----------------|--------|
| `cryptoService.js` | CSPRNG, non-extractable keys, proper IV length | `crypto.getRandomValues()`, `extractable: false`, `GCM_IV_LENGTH_BYTES = 12` |
| `keyManager.js` | Key derivation dengan salt unik | `generateSaltBase64()` per user |
| `firestoreService.js` | Encrypt before write, decrypt after read | `encryptText()` → `addDoc()`, `getDocs()` → `decryptText()` |
| `authService.js` | Anonymous auth, no PII | `signInAnonymously()`, random nickname |
| `conversationService.js` | Auth token pada setiap request | `auth.currentUser.getIdToken()` |
| `firestore.rules` | Per-user ownership, default deny | `request.auth.uid == userId`, `allow: if false` |
| `vite.config.js` | No source maps, NetworkOnly for auth | `sourcemap: false`, auth caching = `NetworkOnly` |
| `functions/src/index.js` | Method guard, token verify, input validation, output validation | Baris 49-51, 54-73, 76-82, 117-121 |

---

## Pemetaan Fase 5: Verification → Testing Evidence

| Test | File | Apa yang Diuji | Metode | Hasil |
|------|------|-----------------|--------|-------|
| Shannon Entropy | `tests/entropy_test.py` | Keacakan ciphertext AES-256-GCM | 🤖 Auto | ⚠️ Inconclusive (sampel terlalu kecil: 38 bytes) |
| Unit Test Crypto | `src/utils/cryptoService.test.js` | Roundtrip encrypt-decrypt, IV uniqueness | 🤖 Auto | ✅ Pass |
| npm Audit | `tests/npm_audit_report.json` | Kerentanan dependensi | 🤖 Auto | Reviewed (moderate: undici) |
| njsscan | `njsscan_report.json` | Static analysis JavaScript | 🤖 Auto | Reviewed |
| AI Baseline | `tests/evaluate_baseline.py` | Akurasi klasifikasi emosi | 🤖 Auto | F1 ≥ 0.80 target |
| PoC-01 Firestore Rules | `docs/.../poc/poc-01-firestore-rules.mjs` | Cross-user access, default deny | 🔬 PoC | ✅ Pass (7 test cases) |
| PoC-02 Cloud Function | `docs/.../poc/poc-02-cloud-function-validation.mjs` | Auth, rate limit, payload size | 🔬 PoC | ⚠️ Temuan: no rate limit, no size limit |
| PoC-03 PWA Cache Audit | `docs/.../poc/poc-03-pwa-cache-audit.js` | Cache Storage, IndexedDB, localStorage | 🔬 PoC | ✅ Pass (no plaintext in cache) |
| Attack Tree Validation | Dok 04 + Dok 06 | Validasi 20 leaf nodes | 📖 + 🔬 | 65.0% fully mitigated |

---

## Pemetaan Fase 6: Release → Production Hardening

### Konfigurasi Production

| Setting | File | Nilai | Tujuan |
|---------|------|-------|--------|
| Source Maps | `vite.config.js` | `sourcemap: false` | Tidak ekspos kode sumber |
| Auth Caching | `vite.config.js` | `NetworkOnly` untuk identitytoolkit | Tidak cache token auth |
| AI Caching | `vite.config.js` | `NetworkOnly` untuk cloudfunctions | Request AI selalu fresh |
| Cache Limits | `vite.config.js` | `maxEntries: 50-60`, `maxAgeSeconds` | Cegah cache overflow |
| Code Splitting | `vite.config.js` | `manualChunks` (vendor, firebase, charts) | Optimasi load & caching |
| Default Deny | `firestore.rules` | `allow: if false` pada wildcard | Cegah akses tidak ter-match |
| Secret Management | `functions/src/index.js` | `defineSecret('GEMINI_API_KEY')` | API key tidak di-commit |

---

## Pemetaan Fase 7: Response → Monitoring & Incident Readiness

### Monitoring Points

```
Monitoring MindQuest:
│
├── Cloud Function Logs
│   ├── Auth verification errors (401)
│   ├── Gemini API errors (500)
│   └── Invalid request body (400)
│
├── Firebase Console
│   ├── Authentication usage (anonymous users count)
│   ├── Firestore read/write counts
│   └── Functions invocation count & errors
│
├── Dependency Monitoring
│   ├── npm audit (periodic scan)
│   └── GitHub Dependabot (jika di-host di GitHub)
│
└── Error Handling in Code
    ├── firestoreService.js: catch decrypt errors → skip entry
    ├── conversationService.js: catch HTTP errors → throw
    └── index.js: catch Gemini errors → 500 response
```

---

## Matriks Lengkap: Fase SDL × Komponen MindQuest

| Fase SDL | Frontend (React) | Crypto Layer | Firebase Backend | AI Layer |
|----------|-------------------|--------------|------------------|----------|
| **1. Training** | React security best practices | Web Crypto API understanding | Firestore rules training | Prompt engineering ethics |
| **2. Requirements** | SR-01, SR-09 | SR-02, SR-09 | SR-04, SR-05, SR-07, SR-08 | SR-06, SR-10 |
| **3. Design** | XSS prevention (React) | 2-layer key architecture | Per-user rules design | System prompt design |
| **4. Implementation** | Auto-escape, no eval | CSPRNG, non-extractable | Default deny, auth check | JSON validation, fallback |
| **5. Verification** | - | Entropy test, unit test | npm audit, rules test | Baseline evaluation |
| **6. Release** | sourcemap: false | - | defineSecret(), rules deploy | - |
| **7. Response** | Console error handling | Key rotation plan | Cloud Logging | Response monitoring |

---

> **Selanjutnya:** [06-hasil-pengujian-kerentanan.md](./06-hasil-pengujian-kerentanan.md) — Hasil pengujian kerentanan berdasarkan Attack Tree
