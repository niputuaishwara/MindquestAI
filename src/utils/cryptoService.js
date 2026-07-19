// src/utils/cryptoService.js
// Modul kriptografi inti MindQuest — murni Web Crypto API bawaan browser,
// tanpa library eksternal (mengurangi attack surface & dependency).
//
// Arsitektur kunci (2 lapis):
// 1. "Wrapping key"  — diturunkan via PBKDF2 dari UID + salt acak (non-rahasia,
//    disimpan di Firestore). Tidak pernah dipakai langsung untuk enkripsi data.
// 2. "Data key"      — kunci AES-256-GCM acak sungguhan, dibungkus (wrapped)
//    oleh wrapping key, lalu hasil wrapped-nya disimpan di Firestore.
//    Inilah kunci yang benar-benar mengenkripsi/dekripsi isi jurnal.
//
// Pemisahan ini supaya data key bisa di-rotate/di-generate ulang tanpa
// mengubah turunan PBKDF2, dan supaya ciphertext jurnal tidak langsung
// terikat ke UID secara langsung (defense in depth).

const PBKDF2_ITERATIONS = 210_000 // rekomendasi OWASP 2023 untuk PBKDF2-SHA256
const AES_KEY_LENGTH = 256
const GCM_IV_LENGTH_BYTES = 12 // standar rekomendasi NIST untuk AES-GCM

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

// ---------- Util konversi ----------

function bufToBase64(buf) {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBuf(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// ---------- Salt & wrapping key (lapis 1) ----------

/** Buat salt acak 16 byte, dikembalikan sebagai base64. Tidak rahasia. */
export function generateSaltBase64() {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return bufToBase64(salt)
}

/**
 * Turunkan wrapping key dari PIN + salt via PBKDF2-SHA256.
 * @param {string} pin - PIN rahasia pengguna
 * @param {string} saltBase64 - salt (non-rahasia), unik per pengguna
 * @returns {Promise<CryptoKey>}
 */
export async function deriveWrappingKey(pin, saltBase64) {
  const saltBuf = base64ToBuf(saltBase64)
  const baseKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuf,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false, // wrapping key tidak perlu extractable
    ['wrapKey', 'unwrapKey']
  )
}

// ---------- Data key (lapis 2 — kunci enkripsi sesungguhnya) ----------

/** Generate AES-256-GCM data key baru (acak, extractable agar bisa di-wrap). */
export async function generateDataKey() {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Bungkus (enkripsi) data key memakai wrapping key, siap disimpan di Firestore.
 * @returns {Promise<{iv: string, wrapped: string}>} base64
 */
export async function wrapDataKey(dataKey, wrappingKey) {
  const iv = crypto.getRandomValues(new Uint8Array(GCM_IV_LENGTH_BYTES))
  const wrapped = await crypto.subtle.wrapKey(
    'raw',
    dataKey,
    wrappingKey,
    { name: 'AES-GCM', iv }
  )
  return { iv: bufToBase64(iv), wrapped: bufToBase64(wrapped) }
}

/** Buka kembali (unwrap) data key dari hasil Firestore + wrapping key. */
export async function unwrapDataKey(wrappedObj, wrappingKey) {
  const iv = new Uint8Array(base64ToBuf(wrappedObj.iv))
  const wrappedBuf = base64ToBuf(wrappedObj.wrapped)

  return crypto.subtle.unwrapKey(
    'raw',
    wrappedBuf,
    wrappingKey,
    { name: 'AES-GCM', iv },
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
}

// ---------- Enkripsi/dekripsi konten jurnal ----------

/**
 * Enkripsi teks plaintext memakai data key. IV baru di-generate setiap kali
 * dipanggil (jangan pernah reuse IV pada AES-GCM).
 * @returns {Promise<{iv: string, ciphertext: string}>} base64
 */
export async function encryptText(plaintext, dataKey) {
  const iv = crypto.getRandomValues(new Uint8Array(GCM_IV_LENGTH_BYTES))
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    dataKey,
    textEncoder.encode(plaintext)
  )
  return { iv: bufToBase64(iv), ciphertext: bufToBase64(ciphertextBuf) }
}

/**
 * Dekripsi payload {iv, ciphertext} hasil encryptText. Akan melempar error
 * jika data key salah atau ciphertext rusak/dimanipulasi (auth tag GCM gagal).
 */
export async function decryptText(payload, dataKey) {
  const iv = new Uint8Array(base64ToBuf(payload.iv))
  const ciphertextBuf = base64ToBuf(payload.ciphertext)
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    dataKey,
    ciphertextBuf
  )
  return textDecoder.decode(plainBuf)
}
