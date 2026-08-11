import { decideAction } from '../functions/src/agents/actionDecision.js';

console.log("====================================================");
console.log("🤖 MINDQUEST BOUNDED AGENTIC EVALUATION RUNNER");
console.log("====================================================\n");

// ---------------------------------------------------------
// SKENARIO 2: SEEDER STREAK (State/Histori Memengaruhi Keputusan)
// ---------------------------------------------------------
console.log("▶️ SKENARIO 2: STREAK NEGATIF TANPA KRISIS (Trend Agent Active)");
console.log("Kondisi: User mengalami mood negatif 3 hari berturut-turut, tapi ucapan hari ini BUKAN krisis.");

// Mock AI Response (Fase Deepening biasa)
const skenario2_aiResponse = {
  phase: 'deepening',
  isComplete: false,
  result: {
    emotionLabel: 'Sedih',
    emotionType: 'negative',
    score: 7,
    plutchikCategory: 'Sadness'
  }
};
const skenario2_consecutiveNegativeDays = 3;
const skenario2_trendDirection = 'declining';
const skenario2_hasDistressCategoryEntry = false;

const result2 = decideAction(
  skenario2_aiResponse, 
  skenario2_consecutiveNegativeDays, 
  skenario2_trendDirection, 
  skenario2_hasDistressCategoryEntry
);

console.log("\n[INPUT KE ACTION DECISION AGENT]");
console.log("- Phase:", skenario2_aiResponse.phase);
console.log("- Consecutive Negative Days:", skenario2_consecutiveNegativeDays);

console.log("\n[HASIL TINDAKAN OTONOM (ACTIONS)]");
console.log(JSON.stringify(result2.actions, null, 2));

const isSkenario2Success = result2.actions.some(a => a.type === 'SUGGEST_TREND_CHECKIN');
console.log(`\n✅ STATUS UJI SKENARIO 2: ${isSkenario2Success ? 'LULUS (SUGGEST_TREND_CHECKIN terpanggil karena state histori)' : 'GAGAL'}`);
console.log("----------------------------------------------------\n");


// ---------------------------------------------------------
// SKENARIO 3: EKSKLUSIVITAS (Krisis vs Tren)
// ---------------------------------------------------------
console.log("▶️ SKENARIO 3: STREAK NEGATIF + DETEKSI KRISIS HARI INI (Crisis Guard Priority)");
console.log("Kondisi: User punya riwayat 3 hari negatif (memicu tren), TETAPI ucapan hari ini mengandung kata bunuh diri (memicu Crisis Guard).");
console.log("Ekspektasi: Hanya protokol krisis yang berjalan. Tindakan cek tren harus diblokir (Eksklusivitas).");

// Mock AI Response (Crisis Guard menginterupsi menjadi fase 'distress')
const skenario3_aiResponse = {
  phase: 'distress', // ini di-set oleh Crisis Guard sebelumnya
  isComplete: true,
  result: {
    emotionLabel: 'Distres Akut',
    emotionType: 'distress',
    score: null,
    plutchikCategory: 'Distress'
  },
  _source: 'crisisGuard'
};
// State tetap 3 hari negatif
const skenario3_consecutiveNegativeDays = 3; 
const skenario3_trendDirection = 'declining';
const skenario3_hasDistressCategoryEntry = true;

const result3 = decideAction(
  skenario3_aiResponse, 
  skenario3_consecutiveNegativeDays, 
  skenario3_trendDirection, 
  skenario3_hasDistressCategoryEntry
);

console.log("\n[INPUT KE ACTION DECISION AGENT]");
console.log("- Phase:", skenario3_aiResponse.phase, "(Overridden by Crisis Guard)");
console.log("- Consecutive Negative Days:", skenario3_consecutiveNegativeDays);

console.log("\n[HASIL TINDAKAN OTONOM (ACTIONS)]");
console.log(JSON.stringify(result3.actions, null, 2));

const hasCrisisProtocol = result3.actions.some(a => a.type === 'TRIGGER_CRISIS_PROTOCOL');
const hasSaveCrisis = result3.actions.some(a => a.type === 'SAVE_CRISIS_SESSION');
const hasTrendCheckin = result3.actions.some(a => a.type === 'SUGGEST_TREND_CHECKIN');

const isSkenario3Success = hasCrisisProtocol && hasSaveCrisis && !hasTrendCheckin;

console.log(`\n✅ STATUS UJI SKENARIO 3: ${isSkenario3Success ? 'LULUS (Eksklusif: Hanya Krisis yang aktif, Aksi Tren ditahan/dicegah)' : 'GAGAL (Terjadi tumpang tindih berbahaya)'}`);
console.log("====================================================\n");
