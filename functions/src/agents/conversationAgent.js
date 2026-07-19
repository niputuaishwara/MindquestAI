// functions/src/agents/conversationAgent.js
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SYSTEM_PROMPT } from '../systemPrompt.js'

/**
 * Conversation Agent — memanggil Gemini LLM untuk memproses histori dan pesan.
 * Memastikan output di-parse dengan benar dan divalidasi sesuai fase.
 */
export async function runConversation(apiKey, history, message, trendSummary = "") {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)

    // Inject trendSummary into system instructions if provided
    let dynamicPrompt = SYSTEM_PROMPT;
    if (trendSummary) {
      dynamicPrompt += `\n\n═══════════════════════════════════════\nINFORMASI TREN PENGGUNA (Hanya untuk konteks, tidak perlu disebut eksplisit kecuali relevan)\n═══════════════════════════════════════\n${trendSummary}\n`;
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: dynamicPrompt,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 512,
        responseMimeType: 'application/json'
      }
    })

    const chat = model.startChat({ history })
    const result = await chat.sendMessage(message)
    const rawText = result.response.text()

    let parsed
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      let safeMessage = rawText;
      if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
        safeMessage = "Maaf, aku sedang memproses perasaanmu tapi sepertinya koneksi batinku sedikit terganggu. Bisa tolong ulangi kalimat terakhirmu?";
      }

      // Fallback aman jika Gemini tidak patuh format
      parsed = {
        phase: 'deepening',
        message: safeMessage,
        questionCount: 1,
        isComplete: false,
        result: null
      }
    }

    // Validasi ketat fase dan tipe data
    const validPhases = ['deepening', 'clarify', 'request_score', 'scoring', 'distress', 'crisis_deepening']
    if (!validPhases.includes(parsed.phase)) {
      parsed.phase = 'deepening'
    }

    if (typeof parsed.message !== 'string') {
      parsed.message = ''
    }

    if (typeof parsed.isComplete !== 'boolean') {
      parsed.isComplete = false
    }

    // Bugfix 1 & 2: Pastikan properti "score" ter-parse sebagai integer di fase scoring
    if (parsed.phase === 'scoring' && parsed.result) {
      if (parsed.result.score) {
        parsed.result.score = parseInt(parsed.result.score, 10);
        if (isNaN(parsed.result.score)) parsed.result.score = null;
      }
    }

    // Pastikan result minimal berisi null jika tidak ada
    if (parsed.result === undefined) {
      parsed.result = null;
    }

    return parsed

  } catch (err) {
    console.error('ConversationAgent Error:', err)
    throw new Error('Gagal memproses percakapan dengan AI.')
  }
}
