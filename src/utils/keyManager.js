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
 * @returns {Promise<CryptoKey>} data key siap pakai untuk encryptText/decryptText
 */
export async function getOrCreateDataKey(uid, pin) {
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

  await setDoc(
    userRef,
    {
      salt,
      wrappedKey,
      createdAt: new Date().toISOString()
    },
    { merge: true }
  )

  return dataKey
}
