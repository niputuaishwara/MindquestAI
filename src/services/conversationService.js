// src/services/conversationService.js
// Manajemen percakapan multi-turn antara pengguna dan Gemini AI.
// Menyimpan history percakapan sesi ini di memori (tidak di localStorage).
// Setelah percakapan selesai (isComplete: true), hasilnya disimpan ke Firestore
// via firestoreService.

import { auth, CLOUD_FUNCTION_URL } from '@/config/firebase'

const FUNCTION_URL = CLOUD_FUNCTION_URL || 
  'https://asia-southeast2-mindquest-app-f216d.cloudfunctions.net/analyzeEmotion'

/**
 * Kirim pesan ke Cloud Function analyzeEmotion.
 * @param {Array} history - riwayat percakapan sesi ini (format Gemini)
 * @param {string} message - pesan terbaru dari pengguna
 * @returns {Promise<object>} respons dari Gemini (phase, message, isComplete, result)
 */
export async function sendMessage(history, message, trendSummary = "", trendDirection = "stable", consecutiveNegativeDays = 0, hasDistressCategoryEntry = false) {
  const token = await auth.currentUser.getIdToken()

  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ history, message, trendSummary, trendDirection, consecutiveNegativeDays, hasDistressCategoryEntry })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Buat entry history baru untuk dikirim ke Gemini.
 * @param {'user'|'model'} role
 * @param {string} text
 */
export function makeHistoryEntry(role, text) {
  return { role, parts: [{ text }] }
}
