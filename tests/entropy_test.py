"""
=============================================================
PENGUJIAN SHANNON ENTROPY - IMPLEMENTASI KRIPTOGRAFI
MindQuest - AES-256-GCM Encryption Strength Test
=============================================================
Cara menjalankan:
  python tests/entropy_test.py

Cara mengambil sampel ciphertext dari Firebase:
  1. Buka Firebase Console -> Firestore -> koleksi 'users'
  2. Buka dokumen user -> subkoleksi 'journal'
  3. Salin nilai field 'ciphertext' (string base64)
  4. Tempel ke dalam daftar CIPHERTEXT_SAMPLES di bawah
=============================================================
"""

import math
import base64
from collections import Counter
import json
import datetime

def calculate_shannon_entropy(data: bytes) -> float:
    """Hitung Shannon Entropy dalam bits per byte."""
    if not data:
        return 0.0
    length = len(data)
    frequencies = Counter(data)
    entropy = 0.0
    for count in frequencies.values():
        p = count / length
        entropy -= p * math.log2(p)
    return entropy

def classify_entropy(score: float) -> str:
    if score >= 7.9:
        return "SANGAT ACAK (Setara Noise Acak Murni)"
    elif score >= 7.5:
        return "ACAK (Memenuhi Standar Keamanan)"
    elif score >= 7.0:
        return "CUKUP ACAK (Perlu Diperiksa)"
    else:
        return "KURANG ACAK (Tidak Memenuhi Standar)"

# ============================================================
# MASUKKAN CIPHERTEXT DARI FIRESTORE DI SINI
# Ganti placeholder di bawah ini dengan ciphertext aktual
# (format: base64 string dari field 'ciphertext' di Firestore)
# ============================================================
CIPHERTEXT_SAMPLES = [
    {
        "label": "Jurnal Firebase 1",
        "ciphertext": "9WhimssxyEbRNbZ1oUox464Zd6Tx8RDQKgZlFa5HxbtLx6H0MIQ="
    }
]

def run_test():
    print("=" * 65)
    print("  UJI SHANNON ENTROPY - KEAMANAN KRIPTOGRAFI MINDQUEST")
    print("  AES-256-GCM Ciphertext Randomness Analysis")
    print(f"  Tanggal Uji: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 65)
    print()
    print(f"{'Sampel':<25} {'Panjang (byte)':<16} {'Entropi':<12} {'Status'}")
    print("-" * 75)

    results = []
    total_entropy = 0.0
    valid_count = 0

    for sample in CIPHERTEXT_SAMPLES:
        label = sample["label"]
        b64 = sample["ciphertext"]
        try:
            # Padding base64 jika perlu
            b64_padded = b64 + "=" * ((4 - len(b64) % 4) % 4)
            raw = base64.b64decode(b64_padded)
            entropy = calculate_shannon_entropy(raw)
            status = classify_entropy(entropy)
            total_entropy += entropy
            valid_count += 1
            print(f"{label:<25} {len(raw):<16} {entropy:<12.5f} {status}")
            results.append({
                "label": label,
                "bytes": len(raw),
                "entropy": round(entropy, 5),
                "status": status
            })
        except Exception as e:
            print(f"{label:<25} ERROR: {e}")

    if valid_count > 0:
        avg = total_entropy / valid_count
        print("-" * 75)
        print(f"\n{'Rata-rata Entropi:':<42} {avg:.5f} bits/byte")
        print(f"{'Jumlah Sampel Valid:':<42} {valid_count}")
        print()
        print("=" * 65)
        print("  KESIMPULAN PENGUJIAN")
        print("=" * 65)
        if avg >= 7.9:
            print("  [LULUS]: Rata-rata entropi >= 7.9 bits/byte.")
            print("  Implementasi AES-256-GCM menghasilkan ciphertext dengan")
            print("  tingkat keacakan yang sangat tinggi, tahan terhadap")
            print("  analisis kriptanalitik statistik.")
        else:
            print("  [PERLU DIPERIKSA]: Rata-rata entropi di bawah threshold.")
            print("  Kemungkinan penyebab: sampel terlalu pendek atau ada masalah")
            print("  pada implementasi enkripsi.")

        # Simpan hasil ke JSON untuk laporan
        report = {
            "tanggal_uji": datetime.datetime.now().isoformat(),
            "algoritma": "AES-256-GCM",
            "kdf": "PBKDF2-SHA256 (210.000 iterasi)",
            "threshold": 7.9,
            "rata_rata_entropi": round(avg, 5),
            "jumlah_sampel": valid_count,
            "lulus": avg >= 7.9,
            "detail_sampel": results
        }
        with open("tests/entropy_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=4, ensure_ascii=False)
        print(f"\n  Laporan detail disimpan ke: tests/entropy_report.json")

if __name__ == "__main__":
    run_test()
