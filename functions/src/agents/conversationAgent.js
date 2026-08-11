// functions/src/agents/conversationAgent.js
import Groq from 'groq-sdk'
import { SYSTEM_PROMPT } from '../systemPrompt.js'

/**
 * Conversation Agent — memanggil Groq LLM untuk memproses histori dan pesan.
 * Memastikan output di-parse dengan benar dan divalidasi sesuai fase.
 */
export async function runConversation(apiKey, history, message, trendSummary = "") {
  try {
    const groq = new Groq({ apiKey })

    // Inject trendSummary into system instructions if provided
    let dynamicPrompt = SYSTEM_PROMPT;
    if (trendSummary) {
      dynamicPrompt += `\n\n═══════════════════════════════════════\nINFORMASI TREN PENGGUNA (Hanya untuk konteks, tidak perlu disebut eksplisit kecuali relevan)\n═══════════════════════════════════════\n${trendSummary}\n`;
    }

    const messages = [{ role: 'system', content: dynamicPrompt }];

    // Konversi histori dari format Gemini (role: 'user'/'model', parts: [{text: '...'}])
    // ke format Groq/OpenAI (role: 'user'/'assistant', content: '...')
    for (const h of history) {
      const role = h.role === 'model' ? 'assistant' : 'user';
      const content = h.parts && h.parts[0] ? h.parts[0].text : '';
      if (content) {
        messages.push({ role, content });
      }
    }

    messages.push({ role: 'user', content: message });

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    })

    const rawText = completion.choices[0]?.message?.content || '{}';

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
