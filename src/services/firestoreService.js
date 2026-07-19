// src/services/firestoreService.js
// CRUD entri jurnal. Plaintext TIDAK PERNAH dikirim ke Firestore — selalu
// dienkripsi di sisi klien dulu (cryptoService) sebelum addDoc, dan
// didekripsi setelah getDocs. Firestore hanya pernah melihat ciphertext.
//
// Struktur koleksi: journals/{uid}/entries/{entryId}

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { encryptText, decryptText } from '@/utils/cryptoService'

function entriesCollection(uid) {
  return collection(db, 'journals', uid, 'entries')
}

/**
 * Simpan entri jurnal baru — teks dienkripsi sebelum dikirim.
 * @param {string} uid
 * @param {CryptoKey} dataKey
 * @param {{ text: string, positiveScore: number, negativeScore: number }} entry
 * @returns {Promise<string>} ID dokumen yang baru dibuat
 */
export async function addJournalEntry(uid, dataKey, { text, positiveScore, negativeScore }) {
  const { iv, ciphertext } = await encryptText(text, dataKey)

  const docRef = await addDoc(entriesCollection(uid), {
    ciphertext,
    iv,
    positiveScore,
    negativeScore,
    createdAt: serverTimestamp()
  })

  return docRef.id
}

/**
 * Ambil semua entri jurnal milik user, terurut terbaru dulu, lalu didekripsi.
 * @param {string} uid
 * @param {CryptoKey} dataKey
 * @returns {Promise<Array<{id: string, text: string, positiveScore: number, negativeScore: number, createdAt: any}>>}
 */
export async function getJournalEntries(uid, dataKey) {
  const q = query(entriesCollection(uid), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  const entries = []
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data()
    try {
      const text = await decryptText({ ciphertext: data.ciphertext, iv: data.iv }, dataKey)
      entries.push({
        id: docSnap.id,
        text,
        rawCiphertext: data.ciphertext,
        rawIv: data.iv,
        positiveScore: data.positiveScore,
        negativeScore: data.negativeScore,
        createdAt: data.createdAt
      })
    } catch (err) {
      // Dekripsi gagal — kemungkinan data key beda (mis. ganti device tanpa
      // migrasi). Skip entri ini daripada bikin seluruh list gagal dimuat.
      console.error(`Gagal mendekripsi entri ${docSnap.id}:`, err)
    }
  }

  return entries
}

/** Hapus satu entri jurnal. */
export async function deleteJournalEntry(uid, entryId) {
  return deleteDoc(doc(db, 'journals', uid, 'entries', entryId))
}

// ─── Fase 2: Penyimpanan sesi percakapan ─────────────────────────────────────
// Struktur: journals/{uid}/sessions/{sessionId}
// Satu "sesi" = satu percakapan lengkap (jurnal awal + dialog AI + hasil skor)

import { serverTimestamp as st } from 'firebase/firestore'

/**
 * Simpan sesi percakapan yang sudah selesai ke Firestore (terenkripsi).
 * @param {string} uid
 * @param {CryptoKey} dataKey
 * @param {object} sessionData
 * @param {Array} sessionData.history - riwayat percakapan (akan dienkripsi)
 * @param {string} sessionData.emotionLabel - label emosi hasil analisis
 * @param {string} sessionData.emotionType - 'positive'|'negative'|'distress'
 * @param {number|null} sessionData.score - skor 1–10 atau null jika distres
 * @param {string} sessionData.plutchikCategory - kategori Plutchik
 */
export async function saveSession(uid, dataKey, {
  history,
  emotionLabel,
  emotionType,
  score,
  plutchikCategory
}) {
  // Enkripsi riwayat percakapan (berisi teks jurnal asli pengguna)
  const { iv, ciphertext } = await encryptText(
    JSON.stringify(history),
    dataKey
  )

  const sessionRef = collection(db, 'journals', uid, 'sessions')
  const docRef = await addDoc(sessionRef, {
    encryptedHistory: { iv, ciphertext },
    emotionLabel,
    emotionType,
    score: score ?? null,
    plutchikCategory,
    completedAt: serverTimestamp()
  })

  return docRef.id
}

/**
 * Ambil semua sesi yang sudah selesai, dekripsi history-nya.
 * @param {string} uid
 * @param {CryptoKey} dataKey
 */
export async function getSessions(uid, dataKey) {
  const q = query(
    collection(db, 'journals', uid, 'sessions'),
    orderBy('completedAt', 'desc')
  )
  const snap = await getDocs(q)
  const sessions = []

  for (const docSnap of snap.docs) {
    const data = docSnap.data()
    try {
      const historyJson = await decryptText(data.encryptedHistory, dataKey)
      sessions.push({
        id: docSnap.id,
        history: JSON.parse(historyJson),
        emotionLabel: data.emotionLabel,
        emotionType: data.emotionType,
        score: data.score,
        plutchikCategory: data.plutchikCategory,
        completedAt: data.completedAt
      })
    } catch (err) {
      console.error(`Gagal dekripsi sesi ${docSnap.id}:`, err)
    }
  }

  return sessions
}
