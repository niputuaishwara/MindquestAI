// functions/src/index.js
// Cloud Functions MindQuest — Fase 2.
// analyzeEmotion: endpoint multi-turn percakapan AI via Groq API.

import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { checkCrisisSignal, buildDistressResponse, DISTRESS_MESSAGES } from './agents/crisisGuard.js'
import { decideAction } from './agents/actionDecision.js'
import { runConversation } from './agents/conversationAgent.js'

initializeApp()

export const groqApiKey = defineSecret('GROQ_API_KEY')

// ─── Rate Limiting (in-memory, per IP) — FIX AT-04-A1 ───────────────────────
// Sederhana dan cukup untuk 1 instance function. CATATAN JUJUR: karena Cloud
// Functions bisa scale ke banyak instance, Map ini TIDAK dibagi antar
// instance — pada beban tinggi/multi-instance nyata, penyerang berpotensi
// mendapat lebih banyak jatah efektif daripada MAX_REQUESTS di bawah ini.
// Untuk produksi sesungguhnya, R-01 di paper tetap merekomendasikan Firebase
// App Check atau rate limiter terpusat (mis. Redis/Firestore counter).
const rateLimitStore = new Map()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000

function isRateLimited(ip) {
  const now = Date.now()
  const timestamps = (rateLimitStore.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS)
  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(ip, timestamps)
    return true
  }
  timestamps.push(now)
  rateLimitStore.set(ip, timestamps)
  return false
}

// ─── Payload Size Validation — FIX AT-04-A2 ─────────────────────────────────
const MAX_MESSAGE_LENGTH = 5000

// ─── Healthcheck (Fase 0, tetap dipertahankan) ───────────────────────────────
export const healthCheck = onRequest(
  { region: 'asia-southeast2', secrets: [groqApiKey] },
  (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'mindquest-functions',
      groqKeyConfigured: Boolean(groqApiKey.value())
    })
  }
)

// ─── analyzeEmotion ──────────────────────────────────────────────────────────
// POST body:
// {
//   "history": [                        ← riwayat percakapan sesi ini
//     { "role": "user", "parts": [{ "text": "..." }] },
//     { "role": "model", "parts": [{ "text": "..." }] }
//   ],
//   "message": "pesan terbaru dari pengguna"
// }
//
// Header wajib:
//   Authorization: Bearer <Firebase ID token>

export const analyzeEmotion = onRequest(
  {
    region: 'asia-southeast2',
    secrets: [groqApiKey]
    // cors bukan di sini — di-handle manual di dalam handler agar
    // OPTIONS preflight tidak dicegat middleware sebelum kode kita jalan
  },
  async (req, res) => {
    // ── 0. CORS headers (emulator + production) ───────────────────────────────
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5000',
      'https://mindquest-app-f216d.web.app',
      'https://mindquest-app-f216d.firebaseapp.com'
    ]
    const origin = req.headers.origin || ''
    if (allowedOrigins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin)
    } else {
      res.set('Access-Control-Allow-Origin', 'http://localhost:5173')
    }
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.set('Access-Control-Max-Age', '3600')

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).send('')
    }

    // ── 1. Method guard ──────────────────────────────────────────────────────
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // ── 2. Verifikasi Firebase Auth token ────────────────────────────────────
    const authHeader = req.headers.authorization || ''
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan.' })
    }
    
    const token = authHeader.split('Bearer ')[1]

    // Cek jika berjalan di Emulator Lokal
    if (process.env.FUNCTIONS_EMULATOR === 'true') {
      console.log('⚡ Menggunakan Emulator: Membuka jalur autentikasi otomatis...');
      // Bypass verifikasi token di lokal agar Anda tidak tertahan error 401
    } else {
      // Jalur Produksi asli (Tetap aman & diverifikasi ketat di Cloud Google)
      try {
        await getAuth().verifyIdToken(token)
      } catch (err) {
        console.error('Auth Verification Error:', err)
        return res.status(401).json({ error: 'Token tidak valid atau sudah kedaluwarsa.' })
      }
    }
    
    // ── 3. Validasi body ─────────────────────────────────────────────────────
    const { history = [], message, trendSummary = "", trendDirection = "stable", consecutiveNegativeDays = 0, hasDistressCategoryEntry = false } = req.body
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Field "message" wajib diisi.' })
    }
    if (!Array.isArray(history)) {
      return res.status(400).json({ error: 'Field "history" harus berupa array.' })
    }

    // ── 4. Payload Size Validation (AT-04-A2) ────────────────────────────────
    // Sengaja dicek SEBELUM rate limiter: payload oversized harus selalu
    // ditolak 400 tanpa ikut "memakan" jatah rate limit milik IP tersebut.
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Pesan terlalu panjang (maksimal ${MAX_MESSAGE_LENGTH} karakter).`
      })
    }

    // ── 5. Rate Limiting (AT-04-A1) ──────────────────────────────────────────
    const clientIp = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(clientIp)) {
      return res.status(429).json({
        error: 'Terlalu banyak permintaan. Coba lagi dalam beberapa saat.'
      })
    }

    // ── 6. Crisis Guard (Pre-LLM) ────────────────────────────────────────────
    const crisisCheck = checkCrisisSignal(message)
    if (crisisCheck.triggered) {
      console.log(`[CrisisGuard] Triggered by pattern: ${crisisCheck.matchedPattern}`)
      let responseObj = buildDistressResponse(DISTRESS_MESSAGES)
      responseObj = decideAction(responseObj, consecutiveNegativeDays, trendDirection, hasDistressCategoryEntry)
      return res.status(200).json(responseObj)
    }

    // ── 4. Panggil Groq API (via Conversation Agent) ──────────────────────
    try {
      const parsed = await runConversation(groqApiKey.value(), history, message, trendSummary)

      // ── 7. Action Decision (Post-LLM) ────────────────────────────────────
      const finalResponse = decideAction(parsed, consecutiveNegativeDays, trendDirection, hasDistressCategoryEntry)

      return res.status(200).json(finalResponse)

    } catch (err) {
      console.error('Groq API error:', err)
      return res.status(500).json({
        error: 'Gagal menghubungi layanan AI. Coba beberapa saat lagi.',
        detail: err.message
      })
    }
  }
)
