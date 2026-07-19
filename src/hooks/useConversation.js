// src/hooks/useConversation.js
// Hook React untuk mengelola state percakapan multi-turn dengan AI.
// History percakapan disimpan di state (memori), bukan localStorage.
// Setelah percakapan selesai, hasil disimpan ke Firestore via saveSession.

import { useState, useCallback } from 'react'
import { sendMessage, makeHistoryEntry } from '@/services/conversationService'
import { saveSession } from '@/services/firestoreService'

export function useConversation(uid, dataKey) {
  const [history, setHistory]         = useState([])   // riwayat percakapan sesi ini
  const [aiMessage, setAiMessage]     = useState('')    // pesan AI terbaru
  const [phase, setPhase]             = useState('idle')// idle|clarify|deepening|scoring|distress
  const [isComplete, setIsComplete]   = useState(false)
  const [result, setResult]           = useState(null)  // hasil akhir (skor, label, dll)
  const [actions, setActions]         = useState([])    // instruksi aksi dari backend
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [questionCount, setQuestionCount] = useState(0)

  /**
   * Kirim pesan pengguna ke AI. Pesan pertama adalah isi jurnal.
   * @param {string} userText - teks dari pengguna
   */
  const send = useCallback(async (userText, trendSummary = "", trendDirection = "stable", consecutiveNegativeDays = 0, hasDistressCategoryEntry = false) => {
    if (!userText.trim() || loading || isComplete) return

    setLoading(true)
    setError(null)

    // Tambah pesan user ke history lokal
    const newUserEntry = makeHistoryEntry('user', userText)
    const updatedHistory = [...history, newUserEntry]

    try {
      const response = await sendMessage(history, userText, trendSummary, trendDirection, consecutiveNegativeDays, hasDistressCategoryEntry)

      let finalMessage = response.message
      if (response.actions && response.actions.some(a => a.type === 'TRIGGER_CRISIS_PROTOCOL')) {
        if (!finalMessage.includes("Peringatan Medis Darurat")) {
          finalMessage += "\n\n[Sistem: Peringatan Medis Darurat]"
        }
      }

      // Tambah respons AI ke history
      const newModelEntry = makeHistoryEntry('model', finalMessage)
      const finalHistory = [...updatedHistory, newModelEntry]

      setHistory(finalHistory)
      setAiMessage(finalMessage)
      setPhase(response.phase)
      setQuestionCount(response.questionCount || 0)
      if (response.actions) setActions(response.actions)

      if (response.isComplete) {
        setIsComplete(true)
        setResult(response.result)

        // Simpan sesi ke Firestore (terenkripsi)
        if (uid && dataKey && response.result) {
          await saveSession(uid, dataKey, {
            history: finalHistory,
            emotionLabel: response.result.emotionLabel,
            emotionType: response.result.emotionType,
            score: response.result.score,
            plutchikCategory: response.result.plutchikCategory
          })
        }
      }
    } catch (err) {
      setError(err.message)
      throw err // Rethrow to allow caller (App.jsx) to trigger fallback
    } finally {
      setLoading(false)
    }
  }, [history, loading, isComplete, uid, dataKey])

  /** Reset percakapan untuk sesi baru */
  const reset = useCallback(() => {
    setHistory([])
    setAiMessage('')
    setPhase('idle')
    setIsComplete(false)
    setResult(null)
    setActions([])
    setError(null)
    setQuestionCount(0)
  }, [])

  return {
    history,
    aiMessage,
    phase,
    isComplete,
    result,
    actions,
    loading,
    error,
    questionCount,
    send,
    reset
  }
}
