# 03 — Attack Tree Model: Konsep dan Metodologi

## 3.1 Apa Itu Attack Tree?

**Attack Tree** adalah model ancaman berbentuk pohon (tree) yang merepresentasikan secara hierarkis bagaimana sebuah **tujuan serangan (goal)** dapat dicapai melalui berbagai **jalur serangan (attack paths)**. Model ini pertama kali diperkenalkan oleh **Bruce Schneier** pada tahun 1999.

### Struktur Dasar Attack Tree

```
                    ┌─────────────────────┐
                    │    ROOT NODE        │
                    │  (Goal: Tujuan      │
                    │   Serangan)         │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴──────────────┐
                 │                            │
          ┌──────▼──────┐             ┌───────▼──────┐
          │  SUB-GOAL 1 │             │  SUB-GOAL 2  │
          │  (AND/OR)   │             │  (AND/OR)    │
          └──────┬──────┘             └───────┬──────┘
                 │                            │
          ┌──────┴──────┐             ┌───────┴──────┐
          │             │             │              │
     ┌────▼───┐   ┌────▼───┐   ┌─────▼────┐   ┌────▼───┐
     │ LEAF 1 │   │ LEAF 2 │   │  LEAF 3  │   │ LEAF 4 │
     │(Attack)│   │(Attack)│   │ (Attack) │   │(Attack)│
     └────────┘   └────────┘   └──────────┘   └────────┘
```

### Komponen Attack Tree

| Komponen | Deskripsi | Simbol |
|----------|-----------|--------|
| **Root Node** | Tujuan utama penyerang | Node paling atas |
| **Sub-Goal** | Langkah antara untuk mencapai root goal | Node tengah |
| **Leaf Node** | Aksi serangan spesifik yang dapat dilakukan | Node paling bawah |
| **AND Node** | SEMUA child node harus berhasil | Garis lengkung penghubung |
| **OR Node** | SALAH SATU child node cukup berhasil | Tidak ada garis penghubung |

---

## 3.2 Mengapa Attack Tree?

### Keunggulan Attack Tree Model

| Keunggulan | Penjelasan |
|------------|------------|
| **Visual & Intuitif** | Mudah dipahami oleh developer dan non-technical stakeholder |
| **Sistematis** | Memastikan semua kemungkinan jalur serangan teridentifikasi |
| **Terukur** | Setiap node bisa diberi atribut (probabilitas, biaya, skill level) |
| **Reusable** | Tree bisa di-update saat arsitektur berubah |
| **Prioritisasi** | Membantu menentukan mitigasi mana yang paling urgent |

### Perbandingan dengan Metode Lain

| Metode | Kelebihan | Kekurangan | Cocok Untuk |
|--------|-----------|------------|-------------|
| **Attack Tree** | Hierarkis, terukur, visual | Bisa kompleks untuk sistem besar | Analisis mendalam per-goal |
| **STRIDE** | Kategori jelas, mudah dipelajari | Kurang detail per-attack path | Threat categorization awal |
| **DREAD** | Scoring risiko kuantitatif | Subjektif tanpa referensi | Risk prioritization |
| **PASTA** | End-to-end, business-aligned | Kompleks, butuh waktu lama | Enterprise applications |

> **Dalam proyek MindQuest**, Attack Tree digunakan **bersama STRIDE**: STRIDE mengkategorikan ancaman di Fase 3, lalu Attack Tree mendetailkan setiap kategori menjadi jalur serangan spesifik yang dapat diuji.

---

## 3.3 Cara Membangun Attack Tree

### Langkah-Langkah

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  LANGKAH 1: Tentukan Root Goal                      │
│  ↓ "Apa yang ingin dicapai penyerang?"              │
│                                                     │
│  LANGKAH 2: Dekomposisi menjadi Sub-Goals           │
│  ↓ "Cara apa saja yang bisa mencapai goal itu?"     │
│                                                     │
│  LANGKAH 3: Lanjutkan sampai Leaf Nodes             │
│  ↓ "Apa aksi spesifik yang bisa dilakukan?"         │
│                                                     │
│  LANGKAH 4: Tentukan Relasi (AND/OR)                │
│  ↓ "Apakah semua harus berhasil atau salah satu?"   │
│                                                     │
│  LANGKAH 5: Beri Atribut pada Leaf Nodes            │
│  ↓ Probabilitas, biaya, skill, detectability        │
│                                                     │
│  LANGKAH 6: Analisis Jalur Kritis                   │
│  ↓ "Jalur mana yang paling mungkin & berbahaya?"    │
│                                                     │
│  LANGKAH 7: Rancang Mitigasi                        │
│     "Bagaimana memblokir setiap leaf node?"          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Atribut pada Leaf Node

Setiap leaf node dapat diberi atribut untuk analisis kuantitatif:

| Atribut | Skala | Deskripsi |
|---------|-------|-----------|
| **Probability (P)** | Low / Medium / High | Kemungkinan serangan berhasil |
| **Cost (C)** | Low / Medium / High | Biaya/usaha yang diperlukan penyerang |
| **Skill Level (S)** | Novice / Intermediate / Expert | Tingkat keahlian yang dibutuhkan |
| **Detectability (D)** | Easy / Medium / Hard | Seberapa mudah serangan terdeteksi |
| **Impact (I)** | Low / Medium / High / Critical | Dampak jika serangan berhasil |

### Contoh Perhitungan Risiko

```
Risk Score = Impact × Probability × (1 - Detectability)

Contoh:
  Leaf: "Curi data key dari memori browser"
  Impact: High (3)
  Probability: Low (1)
  Detectability: Hard (0.2)
  
  Risk = 3 × 1 × (1 - 0.2) = 2.4 → Medium Risk
```

---

## 3.4 Notasi Attack Tree

### OR Decomposition (Default)

Penyerang hanya perlu berhasil di **salah satu** jalur:

```
         ┌──────────────────┐
         │ Akses Data User  │
         │     (OR)         │
         └────────┬─────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
   ┌────▼─────┐       ┌────▼─────┐
   │ Bypass   │       │ Curi     │
   │ Auth     │       │ Token    │
   └──────────┘       └──────────┘
   
   Cukup salah satu berhasil
```

### AND Decomposition

Penyerang harus berhasil di **semua** jalur:

```
         ┌──────────────────┐
         │ Dekripsi Jurnal  │
         │     (AND)        │
         └────────┬─────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
   ┌────▼─────┐       ┌────▼─────┐
   │ Dapatkan │       │ Dapatkan │
   │Ciphertext│       │ Data Key │
   │  (✓ easy)│       │(✗ hard)  │
   └──────────┘       └──────────┘
   
   Keduanya HARUS berhasil
```

### Kombinasi AND + OR

```
         ┌──────────────────────────┐
         │ Baca Plaintext Jurnal    │
         │        (AND)             │
         └─────────────┬────────────┘
                       │
        ┌──────────────┴───────────────┐
        │                              │
   ┌────▼──────────┐           ┌──────▼──────────┐
   │ Akses         │           │ Dapatkan        │
   │ Ciphertext    │           │ Data Key        │
   │ (OR)          │           │ (OR)            │
   └──────┬────────┘           └──────┬──────────┘
          │                           │
   ┌──────┴──────┐            ┌───────┴───────┐
   │             │            │               │
┌──▼───┐   ┌────▼──┐   ┌─────▼───┐    ┌──────▼──┐
│Direct│   │Sniff  │   │Brute-   │    │Memory   │
│ Read │   │Network│   │force    │    │Dump     │
│ DB   │   │Traffic│   │PIN/Salt │    │Browser  │
└──────┘   └───────┘   └─────────┘    └─────────┘
```

---

## 3.5 Attack Tree dalam Konteks Microsoft SDL

Dalam framework Microsoft SDL, Attack Tree berperan pada dua fase:

### Fase 3 (Design) — Konstruksi

```
Tujuan: Mengidentifikasi semua kemungkinan serangan
Input:  → Architecture diagram
        → Data flow diagram
        → Asset inventory
        → Threat categories (dari STRIDE)
Output: → Attack Tree per-goal
        → Prioritized attack paths
        → Mitigation strategies
```

### Fase 5 (Verification) — Validasi

```
Tujuan: Memvalidasi bahwa mitigasi efektif
Input:  → Attack Tree dari Fase 3
        → Source code & configuration
        → Test results
Output: → Validated/invalidated attack paths
        → Residual risk assessment
        → Updated attack tree (jika ada temuan baru)
```

---

## 3.6 Template Attack Tree Node

Untuk konsistensi, setiap leaf node dalam attack tree MindQuest menggunakan template berikut:

```
┌────────────────────────────────────────────┐
│ Node ID   : AT-XX-YY                       │
│ Nama      : [Deskripsi serangan]           │
│ Tipe      : AND / OR                       │
│ Level     : Root / Sub-Goal / Leaf         │
│                                            │
│ Atribut (jika Leaf):                       │
│   Probability   : Low / Medium / High      │
│   Skill Level   : Novice / Inter / Expert  │
│   Impact        : Low / Med / High / Crit  │
│   Detectability : Easy / Medium / Hard     │
│   Mitigasi      : [Strategi mitigasi]      │
│   Status        : Mitigated / Open / N/A   │
│   Evidence      : [File/test reference]    │
└────────────────────────────────────────────┘
```

---

## 3.7 Referensi

- Schneier, B. (1999). *Attack Trees: Modeling Security Threats*. Dr. Dobb's Journal.
- Mauw, S., & Oostdijk, M. (2005). *Foundations of Attack Trees*. LNCS 3935, Springer.
- Edge, K. S. (2007). *A Framework for Analyzing and Mitigating the Vulnerabilities of Complex Systems via Attack and Protection Trees*. Air Force Institute of Technology.
- Microsoft. (2010). *Threat Modeling in the Microsoft Security Development Lifecycle*. MSDN.

---

> **Selanjutnya:** [04-attack-tree-mindquest.md](./04-attack-tree-mindquest.md) — Attack Tree spesifik untuk MindQuest
