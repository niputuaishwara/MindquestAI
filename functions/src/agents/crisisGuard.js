// functions/src/agents/crisisGuard.js
// Crisis Guard Agent — lapisan deteksi deterministik yang berjalan SEBELUM
// Gemini dipanggil. Tujuannya: sinyal krisis paling eksplisit tidak boleh
// bergantung sepenuhnya pada kepatuhan LLM terhadap instruksi prompt.
//
// Agent ini TIDAK menggantikan deteksi krisis di systemPrompt.js — dia adalah
// lapisan pengaman KEDUA yang independen. Kalau keduanya sepakat, makin yakin.
// Kalau guard ini trigger tapi LLM tidak, guard yang menang (fail-safe).

// Daftar ini sengaja dijaga singkat & pattern-level, bukan daftar lengkap
// frasa — daftar lengkap justru berisiko jadi peta untuk dihindari/diakali.
const CRISIS_PATTERNS = [
  /mau\s+mati/i,
  /ingin\s+mati/i,
  /pengen\s+mati/i,
  /bunuh\s+diri/i,
  /akhiri\s+hidup/i,
  /mengakhiri\s+hidup/i,
  /ingin\s+mengakhiri\s+hidup/i,
  /mengakhiri\s+(semua|segalanya)/i,
  /tidak\s+mau\s+hidup/i,
  /nggak\s+mau\s+hidup/i,
  /ga\s+mau\s+hidup/i,
  /tidak\s+kuat\s+lagi/i,
  /udah\s+tidak\s+kuat/i,
  /sudah\s+tidak\s+kuat/i,
  /nyakitin\s+diri/i,
  /menyakiti\s+diri/i,
  /capek\s+hidup/i,
  /lelah\s+hidup/i,
]

/**
 * Cek pesan user terhadap pola krisis eksplisit.
 * @param {string} message - pesan user (plaintext, sudah didekripsi di client
 *   atau memang belum pernah dienkripsi karena ini pesan sesi berjalan)
 * @returns {{ triggered: boolean, matchedPattern: string|null }}
 */
export function checkCrisisSignal(message) {
  if (typeof message !== 'string' || !message.trim()) {
    return { triggered: false, matchedPattern: null }
  }

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(message)) {
      return { triggered: true, matchedPattern: pattern.source }
    }
  }

  return { triggered: false, matchedPattern: null }
}

export const DISTRESS_MESSAGES = [
  'Aku dengar kamu, dan ini terasa berat banget ya. Aku di sini, dan aku mau terus dengar ceritamu kalau kamu mau lanjut cerita sekarang. Kapan pun kamu butuh bicara langsung sama orang, ada 119 ext 8 (Into The Light Indonesia) yang siap 24 jam, gratis. Tapi aku di sini dulu — mau cerita apa yang bikin kamu ngerasa seberat ini?',
  'Rasanya pasti sakit dan melelahkan sekali memendam ini sendirian. Aku ada di sini buat temenin kamu, kalau kamu siap buat cerita pelan-pelan. Kapan pun kamu butuh teman bicara langsung, 119 ext 8 (Into The Light Indonesia) juga siap bantu 24 jam dan gratis. Tapi kalau kamu masih mau ngobrol sama aku sekarang, aku siap dengerin keluh kesahmu. Apa yang paling membebani pikiranmu saat ini?'
];

/**
 * Membuat response instan saat krisis terdeteksi oleh Crisis Guard.
 * Menghasilkan format yang persis sama dengan output dari Gemini API.
 * @param {string[]} messages - Array pesan krisis
 * @returns {object} Response object untuk disalurkan ke frontend
 */
export function buildDistressResponse(messages) {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return {
    phase: 'distress',
    message: messages[randomIndex],
    isComplete: true,
    result: {
      emotionLabel: 'Distres Akut',
      emotionType: 'distress',
      score: null,
      plutchikCategory: 'Distress'
    },
    _source: 'crisisGuard'
  }
}
