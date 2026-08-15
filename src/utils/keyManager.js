// src/utils/keyManager.js
// Menjembatani cryptoService (murni kripto) dengan Firestore (penyimpanan
// salt + wrapped data key per pengguna). Tidak disebut eksplisit di roadmap
// P1S2, tapi diperlukan agar data key bisa dipakai ulang di sesi berikutnya
// pada device yang sama — tanpa ini, tiap refresh akan generate key baru
// dan jurnal lama jadi tidak bisa didekripsi lagi.

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import {
  generateSaltBase64,
  deriveWrappingKey,
  generateDataKey,
  wrapDataKey,
  unwrapDataKey
} from './cryptoService.js'

/**
 * Ambil data key milik user (kalau sudah pernah dibuat), atau buat baru kalau
 * ini pertama kalinya user tersebut login.
 * @param {string} uid
 * @param {string} pin - PIN kriptografi pengguna
 * @param {{ given: boolean, timestamp: string } | null} consentData
 *   Objek consent yang harus diteruskan saat user baru membuat PIN pertama kali.
 *   Jika diisi, field `consentGiven` dan `consentAt` akan ditulis ke Firestore
 *   dalam setDoc yang SAMA dengan salt/wrappedKey — tanpa write terpisah,
 *   sehingga tidak ada risiko race condition. Untuk returning user, biarkan null.
 * @returns {Promise<CryptoKey>} data key siap pakai untuk encryptText/decryptText
 */
export async function getOrCreateDataKey(uid, pin, consentData = null) {
  const userRef = doc(db, 'users', uid)
  const snapshot = await getDoc(userRef)

  if (snapshot.exists() && snapshot.data().salt && snapshot.data().wrappedKey) {
    const { salt, wrappedKey } = snapshot.data()
    const wrappingKey = await deriveWrappingKey(pin, salt)
    return unwrapDataKey(wrappedKey, wrappingKey)
  }

  // Pertama kali login dari device ini → buat salt, data key, dan simpan wrapped-nya.
  const salt = generateSaltBase64()
  const wrappingKey = await deriveWrappingKey(pin, salt)
  const dataKey = await generateDataKey()
  const wrappedKey = await wrapDataKey(dataKey, wrappingKey)

  // Tulis semua field — termasuk consent jika ada — dalam satu operasi setDoc
  // agar tidak ada kemungkinan race condition antara write consent dan write key.
  await setDoc(
    userRef,
    {
      salt,
      wrappedKey,
      createdAt: new Date().toISOString(),
      ...(consentData
        ? {
            consentGiven: consentData.given,    // boolean true
            consentAt: consentData.timestamp    // ISO 8601 string
          }
        : {})
    },
    { merge: true }
  )

  return dataKey
}
