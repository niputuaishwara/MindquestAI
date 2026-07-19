// src/utils/cryptoService.test.js
// Unit test untuk verifikasi modul enkripsi sebelum dipakai di production.
// Jalankan: npm run test

import { describe, it, expect } from 'vitest'
import {
  generateSaltBase64,
  deriveWrappingKey,
  generateDataKey,
  wrapDataKey,
  unwrapDataKey,
  encryptText,
  decryptText
} from './cryptoService.js'

describe('cryptoService — enkripsi/dekripsi dasar', () => {
  it('mengenkripsi lalu mendekripsi teks dan menghasilkan plaintext yang sama persis', async () => {
    const dataKey = await generateDataKey()
    const plaintext = 'Hari ini aku merasa cemas tapi juga lega setelah cerita ke teman.'

    const encrypted = await encryptText(plaintext, dataKey)
    expect(encrypted.ciphertext).not.toBe(plaintext)
    expect(typeof encrypted.ciphertext).toBe('string')
    expect(typeof encrypted.iv).toBe('string')

    const decrypted = await decryptText(encrypted, dataKey)
    expect(decrypted).toBe(plaintext)
  })

  it('menghasilkan ciphertext berbeda untuk plaintext yang sama (IV acak setiap kali)', async () => {
    const dataKey = await generateDataKey()
    const plaintext = 'Teks yang persis sama'

    const a = await encryptText(plaintext, dataKey)
    const b = await encryptText(plaintext, dataKey)

    expect(a.ciphertext).not.toBe(b.ciphertext)
    expect(a.iv).not.toBe(b.iv)
  })

  it('gagal dekripsi (melempar error) jika memakai data key yang salah', async () => {
    const dataKeyA = await generateDataKey()
    const dataKeyB = await generateDataKey()
    const encrypted = await encryptText('data rahasia', dataKeyA)

    await expect(decryptText(encrypted, dataKeyB)).rejects.toThrow()
  })
})

describe('cryptoService — key wrapping (PBKDF2 + AES-GCM)', () => {
  it('wrap lalu unwrap data key menghasilkan key yang fungsinya identik', async () => {
    const uid = 'user-uji-coba-123'
    const salt = generateSaltBase64()

    const wrappingKey = await deriveWrappingKey(uid, salt)
    const originalDataKey = await generateDataKey()
    const wrapped = await wrapDataKey(originalDataKey, wrappingKey)
    const unwrappedDataKey = await unwrapDataKey(wrapped, wrappingKey)

    // Enkripsi pakai key asli, dekripsi pakai key hasil unwrap — harus cocok.
    const plaintext = 'Verifikasi proses unwrap key'
    const encrypted = await encryptText(plaintext, originalDataKey)
    const decrypted = await decryptText(encrypted, unwrappedDataKey)

    expect(decrypted).toBe(plaintext)
  })

  it('UID yang berbeda menghasilkan wrapping key yang berbeda (salt sama)', async () => {
    const salt = generateSaltBase64()
    const keyA = await deriveWrappingKey('uid-a', salt)
    const keyB = await deriveWrappingKey('uid-b', salt)

    const dataKey = await generateDataKey()
    const wrappedByA = await wrapDataKey(dataKey, keyA)

    // unwrap pakai key milik UID lain harus gagal
    await expect(unwrapDataKey(wrappedByA, keyB)).rejects.toThrow()
  })
})
