# 01 — Konsep SSDLC dan Microsoft SDL Framework

## 1.1 Apa Itu SSDLC?

**SSDLC (Secure Software Development Life Cycle)** adalah pendekatan pengembangan perangkat lunak yang mengintegrasikan praktik keamanan di **setiap fase** siklus hidup pengembangan — bukan hanya sebagai tahap akhir (testing/auditing).

### Perbedaan SDLC vs SSDLC

```
┌─────────────────────────────────────────────────────────────────┐
│  SDLC Tradisional:                                              │
│  Requirements → Design → Implementation → Testing → Deployment  │
│                                              ↑                  │
│                                     Security baru di sini       │
│                                     (terlambat & mahal)         │
├─────────────────────────────────────────────────────────────────┤
│  SSDLC (Secure SDLC):                                          │
│  Setiap fase sudah ada komponen keamanan:                       │
│                                                                 │
│  Requirements  →  Security Requirements                         │
│  Design        →  Threat Modeling                               │
│  Implementation→  Secure Coding Standards                       │
│  Testing       →  Security Testing & Penetration Testing        │
│  Deployment    →  Security Configuration & Hardening            │
│  Maintenance   →  Incident Response & Monitoring                │
└─────────────────────────────────────────────────────────────────┘
```

### Mengapa SSDLC Penting?

| Aspek | Tanpa SSDLC | Dengan SSDLC |
|-------|-------------|--------------|
| **Biaya perbaikan bug** | 100x lebih mahal (ditemukan di produksi) | Ditemukan sejak awal, biaya rendah |
| **Waktu deteksi** | Setelah deployment / insiden | Selama pengembangan |
| **Cakupan keamanan** | Sporadis, hanya pada tes akhir | Sistematis di setiap fase |
| **Kesadaran developer** | Rendah | Tinggi (trained & aware) |
| **Kepatuhan regulasi** | Reaktif | Proaktif (by design) |

---

## 1.2 Microsoft SDL (Security Development Lifecycle)

**Microsoft SDL** adalah framework SSDLC yang diperkenalkan oleh Microsoft pada tahun 2004. Awalnya dikembangkan secara internal setelah serangan worm Blaster (2003) dan menjadi standar wajib untuk semua produk Microsoft.

### Sejarah Singkat

| Tahun | Peristiwa |
|-------|-----------|
| 2002 | Bill Gates mengirim memo "Trustworthy Computing" |
| 2004 | Microsoft SDL versi 1.0 dirilis secara internal |
| 2008 | Microsoft SDL dipublikasikan untuk umum |
| 2010 | SDL Simplified untuk Agile & small teams |
| 2020+ | SDL terus diperbarui untuk DevSecOps & cloud-native |

### Prinsip Dasar Microsoft SDL

Microsoft SDL dibangun di atas tiga pilar utama:

```
              ┌─────────────────────┐
              │   TRUSTWORTHY       │
              │   COMPUTING         │
              └────────┬────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼────┐  ┌─────▼────┐  ┌────▼────┐
    │ Secure  │  │ Secure   │  │ Secure  │
    │ by      │  │ by       │  │ in      │
    │ Design  │  │ Default  │  │ Deploy- │
    │         │  │          │  │ ment    │
    └─────────┘  └──────────┘  └─────────┘
```

1. **Secure by Design** — Arsitektur dan desain sudah memperhitungkan ancaman sejak awal
2. **Secure by Default** — Konfigurasi default sudah dalam kondisi paling aman
3. **Secure in Deployment** — Proses deployment memiliki kontrol keamanan yang ketat

---

## 1.3 Tujuh Fase Microsoft SDL

Microsoft SDL terdiri dari **7 fase** yang membentuk siklus lengkap:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐                 │
│    │   Fase 1 │───▶│  Fase 2  │───▶│  Fase 3  │                │
│    │ Training │    │Require-  │    │  Design  │                 │
│    │          │    │  ments   │    │          │                 │
│    └──────────┘    └──────────┘    └──────────┘                 │
│                                        │                        │
│                                        ▼                        │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐                 │
│    │  Fase 6  │◀───│  Fase 5  │◀───│  Fase 4  │                │
│    │ Release  │    │ Verifi-  │    │ Implemen-│                 │
│    │          │    │ cation   │    │ tation   │                 │
│    └──────────┘    └──────────┘    └──────────┘                 │
│         │                                                       │
│         ▼                                                       │
│    ┌──────────┐                                                 │
│    │  Fase 7  │                                                 │
│    │ Response │                                                 │
│    │          │                                                 │
│    └──────────┘                                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

| No | Fase | Deskripsi Singkat |
|----|------|-------------------|
| 1 | **Training** | Pelatihan keamanan untuk seluruh tim pengembang |
| 2 | **Requirements** | Mendefinisikan security requirements & quality gates |
| 3 | **Design** | Threat modeling, attack surface analysis, design review |
| 4 | **Implementation** | Secure coding, static analysis, banned functions |
| 5 | **Verification** | Dynamic testing, fuzz testing, attack surface review |
| 6 | **Release** | Final security review, incident response plan |
| 7 | **Response** | Post-release monitoring, incident handling, patching |

> 📖 Detail lengkap setiap fase dibahas pada dokumen **[02-fase-microsoft-sdl.md](./02-fase-microsoft-sdl.md)**.

---

## 1.4 Mengapa Microsoft SDL untuk MindQuest?

MindQuest dipilih menggunakan Microsoft SDL karena:

1. **Data Sensitif** — Aplikasi mengelola data emosional remaja yang memerlukan perlindungan tingkat tinggi
2. **Enkripsi End-to-End** — Implementasi kriptografi (AES-256-GCM + PBKDF2) membutuhkan review keamanan formal
3. **AI Integration** — Penggunaan Gemini API membutuhkan validasi terhadap prompt injection dan data leakage
4. **Firebase Backend** — Konfigurasi cloud memerlukan hardening rules dan access control
5. **Target Pengguna Rentan** — Remaja sebagai target pengguna membutuhkan standar privasi dan etika tinggi

### Relevansi Setiap Pilar SDL untuk MindQuest

| Pilar SDL | Relevansi MindQuest |
|-----------|---------------------|
| **Secure by Design** | Arsitektur 2-layer key (wrapping key + data key), anonymous auth |
| **Secure by Default** | Firestore rules deny-by-default, enkripsi wajib sebelum simpan |
| **Secure in Deployment** | Source map disabled, Firebase security rules, Cloud Functions auth |

---

## 1.5 Posisi Attack Tree Model dalam SDL

**Attack Tree Model** digunakan pada **Fase 3 (Design)** dan **Fase 5 (Verification)** dari Microsoft SDL:

```
Microsoft SDL
├── Fase 1: Training
├── Fase 2: Requirements
├── Fase 3: Design ──────────── ← Attack Tree dibuat di sini
│   ├── Threat Modeling             (identifikasi ancaman)
│   ├── Attack Surface Analysis
│   └── Attack Tree Construction
├── Fase 4: Implementation
├── Fase 5: Verification ───── ← Attack Tree divalidasi di sini
│   ├── Security Testing            (pengujian kerentanan)
│   └── Attack Path Validation
├── Fase 6: Release
└── Fase 7: Response
```

> 📖 Penjelasan lengkap Attack Tree Model ada di **[03-attack-tree-model.md](./03-attack-tree-model.md)**.

---

## 1.6 Referensi

- Microsoft. (2010). *Microsoft Security Development Lifecycle (SDL)*. [https://www.microsoft.com/en-us/securityengineering/sdl](https://www.microsoft.com/en-us/securityengineering/sdl)
- Howard, M., & Lipner, S. (2006). *The Security Development Lifecycle: SDL: A Process for Developing Demonstrably More Secure Software*. Microsoft Press.
- OWASP. (2021). *OWASP Software Assurance Maturity Model (SAMM)*. [https://owasp.org/www-project-samm/](https://owasp.org/www-project-samm/)
- Schneier, B. (1999). *Attack Trees*. Dr. Dobb's Journal.
