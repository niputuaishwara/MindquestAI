// src/agents/trendPlanner.js
// Client-side Agent: Menganalisis riwayat jurnal pengguna secara lokal.
// Ini menjaga kerahasiaan End-to-End Encryption (E2EE) karena backend
// tidak pernah membaca teks jurnal secara langsung, melainkan hanya 
// menerima ringkasan tren (metadata).

export function generateTrendSummary(entries) {
  if (!entries || entries.length === 0) {
    return {
      narrative: "Belum ada riwayat jurnal. Ini adalah pengguna baru atau belum menulis jurnal.",
      trendDirection: 'stable',
      consecutiveNegativeDays: 0,
      hasDistressCategoryEntry: false
    };
  }

  // Filter entri 14 hari terakhir
  const now = Date.now();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
  
  const recentEntries = entries.filter(entry => {
    if (!entry.timestamp) return false; // fallback: kecualikan entri jika belum punya timestamp valid
    return (now - entry.timestamp) <= fourteenDaysMs;
  });

  // [TREND-DIAG] Sementara — hapus setelah testing E2E selesai
  console.group('[TREND-DIAG] generateTrendSummary');
  console.log('[TREND-DIAG] Total entries masuk:', entries.length, '| Dalam 14 hari:', recentEntries.length);
  recentEntries.forEach((e, i) => {
    console.log(`[TREND-DIAG] Entry[${i}]: mood=${JSON.stringify(e.mood)} | negScore=${e.negativeScore} | ts=${new Date(e.timestamp).toDateString()}`);
  });

  if (recentEntries.length === 0) {
    return {
      narrative: "Tidak ada aktivitas jurnal dalam 14 hari terakhir.",
      trendDirection: 'stable',
      consecutiveNegativeDays: 0,
      hasDistressCategoryEntry: false
    };
  }

  // Hitung distribusi mood
  const moodCounts = {};
  let totalScore = 0;
  let validScores = 0;

  recentEntries.forEach(entry => {
    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }
    if (entry.moodScore && typeof entry.moodScore === 'number') {
      totalScore += entry.moodScore;
      validScores += 1;
    }
  });

  // Temukan mood dominan
  let dominantMood = 'Tidak diketahui';
  let maxCount = 0;
  for (const [mood, count] of Object.entries(moodCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantMood = mood;
    }
  }

  const averageScore = validScores > 0 ? (totalScore / validScores).toFixed(1) : 'N/A';
  const narrative = `Dalam ${recentEntries.length} entri terakhir, pengguna sering merasa ${dominantMood} (muncul ${maxCount} kali). Rata-rata intensitas emosi: ${averageScore}/10.`;

  // Hitung consecutiveNegativeDays dan hasDistressCategoryEntry
  const negativeMoods = ['Cemas', 'Sedih', 'Marah', 'Isolasi Diri', 'Lelah', 'Gelisah', 'Kecewa', 'Depresi'];
  const distressCategories = ['Frustrasi Tinggi', 'Burnout Parah', 'Putus Asa'];
  
  let hasDistressCategoryEntry = false;
  
  // Kelompokkan berdasarkan tanggal kalender unik
  const entriesByDate = {};
  for (const entry of recentEntries) {
    const dateStr = new Date(entry.timestamp).toDateString();
    if (!entriesByDate[dateStr]) {
      entriesByDate[dateStr] = [];
    }
    entriesByDate[dateStr].push(entry);
  }

  // Ambil hari-hari unik dan urutkan descending (terbaru dulu)
  const uniqueDates = Object.keys(entriesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let consecutiveNegativeDays = 0;
  
  // Interpretasi (b): Hari kosong tanpa entri diabaikan.
  // Streak dihitung murni dari hari-hari dimana user *memang* menulis jurnal.
  // Jika dalam sehari ada minimal 1 entri negatif, hari tersebut dianggap hari negatif.
  for (const dateStr of uniqueDates) {
    const entriesOnDate = entriesByDate[dateStr];
    
    // Cek apakah ada minimal satu entri negatif di hari ini
    const isNegativeDay = entriesOnDate.some(entry => {
      // Jalur utama: mood eksplisit dari plaintext terdekripsi
      if (entry.mood) {
        if (distressCategories.includes(entry.mood) || distressCategories.includes(entry.plutchikCategory)) {
          hasDistressCategoryEntry = true;
        }
        const result = negativeMoods.includes(entry.mood) || distressCategories.includes(entry.mood) || (entry.plutchikCategory === 'Lelah' || entry.plutchikCategory === 'Gelisah');
        console.log(`[TREND-DIAG]   ${dateStr} → JALUR UTAMA (mood='${entry.mood}') → negatif=${result}`);
        return result;
      }
      // Jalur fallback: negativeScore (plaintext metadata di Firestore).
      // Dipakai saat mood tidak tersedia — misal entri dari seeder testing
      // atau jika JSON.parse gagal. Threshold > 5 agar netral tidak terhitung.
      if (typeof entry.negativeScore === 'number') {
        const result = entry.negativeScore > 5;
        console.log(`[TREND-DIAG]   ${dateStr} → JALUR FALLBACK (negScore=${entry.negativeScore}) → negatif=${result}`);
        return result;
      }
      console.log(`[TREND-DIAG]   ${dateStr} → TIDAK ADA mood NOR negScore — dianggap NON-negatif`);
      return false;
    });

    if (isNegativeDay) {
      consecutiveNegativeDays++;
    } else {
      // Terputus oleh hari kalender yang sepenuhnya positif / non-negatif
      break;
    }
  }
  console.log('[TREND-DIAG] consecutiveNegativeDays:', consecutiveNegativeDays, '| trendDirection akan:', consecutiveNegativeDays >= 3 ? 'declining' : 'stable/improving');
  console.groupEnd();

  // Tentukan trendDirection
  let trendDirection = 'stable';
  if (consecutiveNegativeDays >= 3) {
    trendDirection = 'declining';
  } else if (consecutiveNegativeDays === 0 && recentEntries.length >= 2) {
    // Cek apakah seluruh entri dalam 5 entri terakhir tidak masuk negativeMoods/distressCategories
    const last5Entries = recentEntries.slice(0, 5);
    const hasAnyNegativeInLast5 = last5Entries.some(entry => {
      if (!entry.mood) return false;
      return negativeMoods.includes(entry.mood) || distressCategories.includes(entry.mood) || (entry.plutchikCategory === 'Lelah' || entry.plutchikCategory === 'Gelisah');
    });
    
    if (!hasAnyNegativeInLast5) {
      trendDirection = 'improving';
    }
  }

  // Jika fallback dipakai, cek seluruh recentEntries lagi buat berjaga-jaga (karena isNegativeDay iterasi per hari, bisa terputus)
  if (!hasDistressCategoryEntry) {
    hasDistressCategoryEntry = recentEntries.some(entry => entry.mood && (distressCategories.includes(entry.mood) || distressCategories.includes(entry.plutchikCategory)));
  }

  return {
    narrative,
    trendDirection,
    consecutiveNegativeDays,
    hasDistressCategoryEntry
  };
}
