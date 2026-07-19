import json
import os
import google.generativeai as genai
from sklearn.metrics import classification_report, f1_score, cohen_kappa_score
from dotenv import load_dotenv

# Memuat variabel lingkungan dari file .env (jika ada)
# Pastikan VITE_GEMINI_API_KEY diset di file .env Anda
load_dotenv(dotenv_path="../.env")
api_key = os.getenv("VITE_GEMINI_API_KEY")

if not api_key:
    print("Error: VITE_GEMINI_API_KEY tidak ditemukan!")
    exit(1)

genai.configure(api_key=api_key)

# Konfigurasi Model
generation_config = {
  "temperature": 0.2,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 1024,
  "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
  model_name="gemini-2.0-flash",
  generation_config=generation_config,
)

# SYSTEM PROMPT (Sesuaikan dengan prompt produksi Anda)
SYSTEM_PROMPT = """
Kamu adalah sistem klasifikasi emosi. Tugasmu adalah menganalisis teks dan 
mengklasifikasikannya ke dalam SATU dari TIGA kategori emosi dasar berikut:
1. Positif
2. Negatif
3. Netral

Kembalikan respons dalam format JSON murni:
{
    "emotion": "Positif|Negatif|Netral"
}
"""

def load_ground_truth(file_path):
    """
    Fungsi untuk memuat 20 skenario ground truth yang divalidasi psikolog.
    Harus mengembalikan daftar dictionary: [{'text': '...', 'ground_truth': 'Positif/Negatif/Netral'}]
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"File dataset {file_path} tidak ditemukan. Silakan buat filenya terlebih dahulu.")
        # Membuat file placeholder jika belum ada
        placeholder = [
            {"id": 1, "text": "Contoh kalimat dari skenario psikolog 1", "ground_truth": "Negatif"},
            {"id": 2, "text": "Contoh kalimat dari skenario psikolog 2", "ground_truth": "Positif"}
        ]
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(placeholder, f, indent=4)
        print(f"File template {file_path} telah dibuat. Silakan isi dengan 20 skenario Anda.")
        exit(1)

def evaluate():
    dataset_path = "ground_truth_scenarios.json"
    dataset = load_ground_truth(dataset_path)
    
    y_true = []
    y_pred = []
    
    print(f"Memulai evaluasi terhadap {len(dataset)} skenario...\n")
    
    for idx, data in enumerate(dataset):
        text = data.get('text', '')
        ground_truth = data.get('ground_truth', '')
        
        # Kirim ke Gemini
        try:
            chat = model.start_chat(
                history=[
                    {"role": "user", "parts": [SYSTEM_PROMPT]}
                ]
            )
            response = chat.send_message(text)
            
            # Parsing output JSON
            output = json.loads(response.text)
            predicted = output.get('emotion', '')
            
            print(f"Skenario {idx+1}")
            print(f"Asli     : {ground_truth}")
            print(f"Prediksi : {predicted}")
            print("-" * 30)
            
            y_true.append(ground_truth.strip().lower())
            y_pred.append(predicted.strip().lower())
            
        except Exception as e:
            print(f"Gagal mengevaluasi skenario {idx+1}: {e}")
            
    # --- MENGHITUNG METRIK (SCIKIT-LEARN) ---
    print("\n\n=== HASIL EVALUASI MODEL (METRIK KLINIS) ===")
    
    # 1. Classification Report (Mencakup Precision, Recall, F1-Score per kelas)
    print("\n1. Laporan Klasifikasi (Classification Report):")
    print(classification_report(y_true, y_pred, zero_division=0))
    
    # 2. Macro F1-Score Keseluruhan
    macro_f1 = f1_score(y_true, y_pred, average='macro', zero_division=0)
    print(f"\n2. F1-Score (Macro Average) : {macro_f1:.4f}")
    
    # 3. Cohen's Kappa (Reliabilitas / Kesepakatan)
    kappa = cohen_kappa_score(y_true, y_pred)
    print(f"3. Cohen's Kappa Score      : {kappa:.4f}")
    
    print("\n--- KESIMPULAN PENGUJIAN ---")
    if macro_f1 >= 0.80:
        print("✅ TARGET TERCAPAI: F1-Score keseluruhan \u2265 80%. Sistem memenuhi kriteria kelayakan teknis.")
    else:
        print("❌ TARGET BELUM TERCAPAI: F1-Score di bawah 80%. Diperlukan perbaikan pada System Prompt.")

if __name__ == "__main__":
    evaluate()
