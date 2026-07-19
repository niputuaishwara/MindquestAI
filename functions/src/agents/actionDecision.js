// functions/src/agents/actionDecision.js
// Action Decision Agent — Menganalisis output dari LLM (atau Crisis Guard)
// dan mengembalikan instruksi *tool/action* konkret (Agentic workflow)
// untuk dieksekusi oleh frontend (App.jsx) atau backend itu sendiri.

export function decideAction(aiResponse, consecutiveNegativeDays = 0, trendDirection = 'stable', hasDistressCategoryEntry = false) {
  // Salin response awal
  const enrichedResponse = { ...aiResponse };
  
  // Inisialisasi array actions jika belum ada
  enrichedResponse.actions = [];

  const phase = enrichedResponse.phase;
  const isComplete = enrichedResponse.isComplete;
  const result = enrichedResponse.result || {};
  const emotionType = result.emotionType?.toLowerCase();

  if (phase === 'distress') {
    enrichedResponse.actions.push({
      type: 'TRIGGER_CRISIS_PROTOCOL',
      payload: {
        alert: "Peringatan Medis Darurat",
        suggestion: "Hubungi layanan kesehatan mental profesional atau kontak darurat di sekitarmu."
      }
    });
  }

  // 2. Cek Tren Negatif Ekstrem (Agentic Workflow murni berdasarkan data historis)
  if ((consecutiveNegativeDays >= 3 || (consecutiveNegativeDays >= 2 && hasDistressCategoryEntry)) && phase !== 'distress') {
    enrichedResponse.actions.push({
      type: 'SUGGEST_TREND_CHECKIN',
      payload: { 
        consecutiveNegativeDays, 
        message: `Kamu sudah merasa berat selama ${consecutiveNegativeDays} hari berturut-turut. Rusa Bintang mengkhawatirkanmu, mau coba ngobrol lebih dalam tentang hal ini?`
      }
    });
  }

  // 3. Jika sesi percakapan selesai (fase akhir)
  if (isComplete && result.emotionLabel) {
    if (phase !== 'distress' && emotionType !== 'distress' && enrichedResponse._source !== 'crisisGuard') {
      // Bukan krisis: simpan sesi dan rekomendasikan quest
      enrichedResponse.actions.push({
        type: 'SAVE_SESSION_AND_RECOMMEND_QUEST',
        payload: {
          emotionLabel: result.emotionLabel,
          emotionType: result.emotionType,
          score: result.score,
          plutchikCategory: result.plutchikCategory
        }
      });
    } else {
      // Kondisi krisis: tetap simpan riwayat tanpa memicu rekomendasi quest
      enrichedResponse.actions.push({
        type: 'SAVE_CRISIS_SESSION',
        payload: {
          emotionLabel: result.emotionLabel,
          emotionType: result.emotionType,
          score: result.score,
          plutchikCategory: result.plutchikCategory
        }
      });
    }

    // 4. Tambahan: jika emosi negatif sangat tinggi tapi belum distress
    if (emotionType === 'negative' && result.score >= 8 && phase !== 'distress') {
      enrichedResponse.actions.push({
        type: 'SUGGEST_BREATHING_EXERCISE',
        payload: {
          duration: 60, // detik
          message: "Mari ambil jeda sejenak untuk menarik napas dalam."
        }
      });
    }

    // 5. Tambahan: jika emosi membaik
    if (trendDirection === 'improving' && phase !== 'distress') {
      enrichedResponse.actions.push({
        type: 'SUGGEST_DAILY_QUEST',
        payload: {
          message: "Perasaanmu tampaknya mulai membaik. Mari jaga energi positif ini dengan aktivitas yang menyenangkan."
        }
      });
    }
  }

  return enrichedResponse;
}
