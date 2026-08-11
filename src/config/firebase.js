// src/config/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Validasi sederhana
const missingKeys = Object.entries(firebaseConfig).filter(([, v]) => !v)
if (missingKeys.length > 0) {
  console.error(
    'Konfigurasi Firebase belum lengkap. Periksa file .env di root proyek. Key kosong:',
    missingKeys.map(([k]) => k)
  )
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app, 'asia-southeast2')

// ─── BLOK EMULATOR ──────────────────────────────────────────────────
// Jika aplikasi berjalan di komputer lokal (localhost), belokkan SEMUA
// layanan Firebase (Auth, Firestore, Functions) ke emulator.
//
// PENTING: connectXxxEmulator() HANYA BOLEH dipanggil SATU KALI per app
// lifecycle, dan HARUS dipanggil sebelum service itu dipakai di tempat
// lain (mis. sebelum getDocs/onSnapshot pertama, sebelum login pertama).
// Karena module ini di-import sekali di awal (main.jsx), timing ini aman.
//
// Guard `window.__FIREBASE_EMULATOR_CONNECTED__` mencegah error
// "already connected" akibat Hot Module Reload (HMR) Vite saat dev,
// yang bisa menjalankan ulang isi module ini tanpa reload penuh browser.
// Ubah USE_EMULATOR ke `true` jika ingin memakai emulator lokal lagi
const USE_EMULATOR = false;

if (
  USE_EMULATOR &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  !window.__FIREBASE_EMULATOR_CONNECTED__
) {
  console.log('🔌 Menghubungkan Firebase SDK ke Emulator Lokal (Auth, Firestore, Functions)...')

  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectFunctionsEmulator(functions, '127.0.0.1', 5001)

  window.__FIREBASE_EMULATOR_CONNECTED__ = true
}
// ─────────────────────────────────────────────────────────────────

export const CLOUD_FUNCTION_URL = import.meta.env.VITE_CLOUD_FUNCTION_URL