// src/services/patternService.js
// Deteksi pola emosional lintas sesi.
// Dipanggil setelah setiap sesi selesai untuk menganalisis tren emosi pengguna.
// Output dipakai untuk: menentukan kapan quest muncul, dan mendeteksi distres akut
// berdasarkan pola (bukan hanya satu sesi).

import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { db } from '@/config/firebase'

const MIN_SESSIONS_FOR_PATTERN = 3   // minimum sesi sebelum pola bisa dideteksi
const DISTRESS_NEGATIVE_THRESHOLD = 8 // skor negatif >= ini dianggap mengkhawatirkan
const DISTRESS_POSITIVE_THRESHOLD = 4 // skor positif < ini dianggap mengkhawatirkan
const DISTRESS_CONSECUTIVE_DAYS = 3   // berturut-turut N sesi negatif tinggi

/**
 * Ambil riwayat sesi jurnal yang sudah selesai dari Firestore.
 * @param {string} uid
 * @param {number} maxSessions - berapa sesi terakhir yang dianalisis
 */
async function getRecentSessions(uid, maxSessions = 10) {
  const q = query(
    collection(db, 'journals', uid, 'sessions'),
    orderBy('completedAt', 'desc'),
    limit(maxSessions)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Analisis pola emosional dari riwayat sesi.
 * @param {string} uid
 * @returns {Promise<PatternResult>}
 */
export async function analyzePattern(uid) {
  const sessions = await getRecentSessions(uid)

  // Belum cukup data
  if (sessions.length < MIN_SESSIONS_FOR_PATTERN) {
    return {
      hasPattern: false,
      sessionCount: sessions.length,
      minRequired: MIN_SESSIONS_FOR_PATTERN,
      dominantEmotion: null,
      distressRisk: false,
      questUnlocked: false,
      trend: null
    }
  }

  // ── Hitung distribusi emosi ──────────────────────────────────────────────
  const positiveScores = sessions
    .filter(s => s.emotionType === 'positive')
    .map(s => s.score)

  const negativeScores = sessions
    .filter(s => s.emotionType === 'negative')
    .map(s => s.score)

  const distressSessions = sessions.filter(s => s.emotionType === 'distress')

  // ── Deteksi distres akut berbasis pola ──────────────────────────────────
  // Kondisi 1: ada sesi distres akut eksplisit
  const hasExplicitDistress = distressSessions.length > 0

  // Kondisi 2: N sesi berturut-turut dengan skor negatif >= threshold
  let consecutiveHighNegative = 0
  for (const s of sessions) {
    if (s.emotionType === 'negative' && s.score >= DISTRESS_NEGATIVE_THRESHOLD) {
      consecutiveHighNegative++
      if (consecutiveHighNegative >= DISTRESS_CONSECUTIVE_DAYS) break
    } else {
      consecutiveHighNegative = 0
    }
  }

  // Kondisi 3: positif rendah DAN negatif tinggi secara bersamaan (lintas sesi)
  const avgPositive = positiveScores.length
    ? positiveScores.reduce((a, b) => a + b, 0) / positiveScores.length
    : null
  const avgNegative = negativeScores.length
    ? negativeScores.reduce((a, b) => a + b, 0) / negativeScores.length
    : null

  const hasLowPositiveHighNegative =
    avgPositive !== null && avgNegative !== null &&
    avgPositive < DISTRESS_POSITIVE_THRESHOLD &&
    avgNegative > DISTRESS_NEGATIVE_THRESHOLD

  const distressRisk =
    hasExplicitDistress ||
    consecutiveHighNegative >= DISTRESS_CONSECUTIVE_DAYS ||
    hasLowPositiveHighNegative

  // ── Tentukan emosi dominan dari keseluruhan sesi ─────────────────────────
  const emotionCounts = {}
  for (const s of sessions) {
    if (!s.emotionLabel) continue
    emotionCounts[s.emotionLabel] = (emotionCounts[s.emotionLabel] || 0) + 1
  }
  const dominantEmotion = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  // ── Tentukan tren (3 sesi terakhir) ─────────────────────────────────────
  const last3 = sessions.slice(0, 3)
  const last3Negative = last3.filter(s => s.emotionType === 'negative').length
  const last3Positive = last3.filter(s => s.emotionType === 'positive').length
  let trend = 'mixed'
  if (last3Negative === 3) trend = 'worsening'
  else if (last3Positive === 3) trend = 'improving'
  else if (last3Positive > last3Negative) trend = 'slightly_improving'
  else if (last3Negative > last3Positive) trend = 'slightly_worsening'

  // ── Quest unlock — muncul setelah pola terbaca dan tidak ada distres ─────
  const questUnlocked = sessions.length >= MIN_SESSIONS_FOR_PATTERN && !distressRisk

  return {
    hasPattern: true,
    sessionCount: sessions.length,
    dominantEmotion,
    distressRisk,
    questUnlocked,
    trend,
    avgPositive,
    avgNegative,
    consecutiveHighNegative
  }
}

/**
 * @typedef {Object} PatternResult
 * @property {boolean} hasPattern
 * @property {number} sessionCount
 * @property {string|null} dominantEmotion
 * @property {boolean} distressRisk
 * @property {boolean} questUnlocked
 * @property {'improving'|'worsening'|'slightly_improving'|'slightly_worsening'|'mixed'|null} trend
 * @property {number|null} avgPositive
 * @property {number|null} avgNegative
 * @property {number} consecutiveHighNegative
 */
