// src/utils/nicknameGenerator.js
// Generator nickname bertema alam & ketenangan — sesuai tone psikologis MindQuest.
// Format: [Kata Sifat] [Kata Benda] #[Angka 4 digit]
// Contoh: "Embun Teduh #3847", "Kabut Bukit #1029"

const KATA_SIFAT = [
  'Tenang', 'Teduh', 'Lembut', 'Hangat', 'Damai',
  'Jernih', 'Sunyi', 'Bening', 'Segar', 'Tulus',
  'Halus', 'Sabar', 'Lapang', 'Cerah', 'Ringan'
]

const KATA_BENDA = [
  'Awan', 'Embun', 'Bukit', 'Kabut', 'Langit',
  'Sungai', 'Hutan', 'Bintang', 'Angin', 'Fajar',
  'Samudera', 'Lembah', 'Pagi', 'Riak', 'Cahaya'
]

function acak(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function angkaAcak() {
  return String(Math.floor(Math.random() * 9000) + 1000) // 1000–9999
}

/**
 * Generate satu nickname unik bertema alam.
 * @returns {string} misal "Embun Teduh #3847"
 */
export function generateNickname() {
  return `${acak(KATA_SIFAT)} ${acak(KATA_BENDA)} #${angkaAcak()}`
}
