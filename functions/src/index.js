// functions/src/index.js
// Cloud Functions MindQuest — Fase 2.
// analyzeEmotion: endpoint multi-turn percakapan AI via Gemini API.

import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { checkCrisisSignal, buildDistressResponse, DISTRESS_MESSAGES } from './agents/crisisGuard.js'
import { decideAction } from './agents/actionDecision.js'
import { runConversation } from './agents/conversationAgent.js'

initializeApp()

export const geminiApiKey = defineSecret('GEMINI_API_KEY')

// ─── Healthcheck (Fase 0, tetap dipertahankan) ───────────────────────────────
export const healthCheck = onRequest(
  { region: 'asia-southeast2', secrets: [geminiApiKey] },
  (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'mindquest-functions',
      geminiKeyConfigured: Boolean(geminiApiKey.value())
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
    secrets: [geminiApiKey],
    cors: true
  },
  async (req, res) => {
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

    // ── 3.5 Crisis Guard (Pre-LLM) ──────────────────────────────────────────
    const crisisCheck = checkCrisisSignal(message)
    if (crisisCheck.triggered) {
      console.log(`[CrisisGuard] Triggered by pattern: ${crisisCheck.matchedPattern}`)
      let responseObj = buildDistressResponse(DISTRESS_MESSAGES)
      responseObj = decideAction(responseObj, consecutiveNegativeDays, trendDirection, hasDistressCategoryEntry)
      return res.status(200).json(responseObj)
    }

    // ── 4. Panggil Gemini API (via Conversation Agent) ──────────────────────
    try {
      const parsed = await runConversation(geminiApiKey.value(), history, message, trendSummary)

      // ── 7. Action Decision (Post-LLM) ────────────────────────────────────
      const finalResponse = decideAction(parsed, consecutiveNegativeDays, trendDirection, hasDistressCategoryEntry)

      return res.status(200).json(finalResponse)

    } catch (err) {
      console.error('Gemini API error:', err)
      return res.status(500).json({
        error: 'Gagal menghubungi layanan AI. Coba beberapa saat lagi.',
        detail: err.message
      })
    }
  }
)
