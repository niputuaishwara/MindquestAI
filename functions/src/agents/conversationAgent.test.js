import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runConversation } from './conversationAgent.js';
import Groq from 'groq-sdk';
import { SYSTEM_PROMPT } from '../systemPrompt.js';

// Mock the Groq SDK
vi.mock('groq-sdk', () => {
  const mockCreate = vi.fn();
  return {
    default: class GroqMock {
      constructor() {
        this.chat = {
          completions: {
            create: mockCreate
          }
        };
      }
    },
    // Export mockCreate so we can assert on it in tests
    mockCreate
  };
});

// Since mockCreate is inside the mock, we can get it by instantiating Groq
const getMockCreate = () => new Groq().chat.completions.create;

describe('Conversation Agent', () => {
  const apiKey = 'test-api-key';
  const history = [{ role: 'user', parts: [{ text: 'Hello' }] }];
  const message = 'How are you?';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Response valid JSON dengan phase="scoring" dan score bertipe string angka -> hasil integer', async () => {
    const mockCreate = getMockCreate();
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            phase: 'scoring',
            message: 'Ini skor kamu',
            isComplete: true,
            result: { score: '8', emotionLabel: 'Senang' }
          })
        }
      }]
    });

    const result = await runConversation(apiKey, history, message);
    
    expect(result.phase).toBe('scoring');
    expect(result.result.score).toBe(8); // Harus integer 8, bukan string '8'
    expect(typeof result.result.score).toBe('number');
  });

  it('2. Response valid JSON tapi phase di luar validPhases -> default ke "deepening"', async () => {
    const mockCreate = getMockCreate();
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            phase: 'fase_halusinasi',
            message: 'Sesuatu',
            isComplete: false,
            result: null
          })
        }
      }]
    });

    const result = await runConversation(apiKey, history, message);
    
    expect(result.phase).toBe('deepening'); // Fallback ke deepening
    expect(result.message).toBe('Sesuatu');
  });

  it('3. Response bukan JSON sama sekali -> pastikan fallback message ter-generate, bukan crash', async () => {
    const mockCreate = getMockCreate();
    // Groq mengembalikan string biasa yang bukan JSON
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: 'Halo, aku AI dan aku tidak mau pakai JSON.'
        }
      }]
    });

    const result = await runConversation(apiKey, history, message);
    
    expect(result.phase).toBe('deepening');
    expect(result.message).toBe('Halo, aku AI dan aku tidak mau pakai JSON.');
    expect(result.isComplete).toBe(false);
    expect(result.result).toBeNull();
  });

  it('4. Response dengan result.score = "abc" (non-numeric) -> harus jadi null', async () => {
    const mockCreate = getMockCreate();
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            phase: 'scoring',
            message: 'Ini skormu',
            isComplete: true,
            result: { score: 'abc' }
          })
        }
      }]
    });

    const result = await runConversation(apiKey, history, message);
    
    expect(result.phase).toBe('scoring');
    expect(result.result.score).toBeNull(); // NaN menjadi null
  });

  it('5. trendSummary tidak kosong -> pastikan ter-inject ke system prompt', async () => {
    const mockCreate = getMockCreate();
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            phase: 'deepening',
            message: 'Paham',
          })
        }
      }]
    });

    const trendSummary = 'User sering merasa cemas di pagi hari.';
    await runConversation(apiKey, history, message, trendSummary);
    
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
    const systemPromptContent = callArgs.messages.find(m => m.role === 'system').content;
    
    expect(systemPromptContent).toContain(SYSTEM_PROMPT);
    expect(systemPromptContent).toContain('INFORMASI TREN PENGGUNA');
    expect(systemPromptContent).toContain(trendSummary);
  });
  
  it('Tambahan: test jika API Groq error/throw -> throw Error', async () => {
    const mockCreate = getMockCreate();
    mockCreate.mockRejectedValue(new Error('API Timeout'));
    
    await expect(runConversation(apiKey, history, message)).rejects.toThrow('Gagal memproses percakapan dengan AI.');
  });
  
  it('Tambahan: Response terpotong tapi diawali { (JSON tidak utuh) -> message diganti fallback', async () => {
    const mockCreate = getMockCreate();
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: '{\n  "phase": "deepen'
        }
      }]
    });

    const result = await runConversation(apiKey, history, message);
    
    expect(result.phase).toBe('deepening');
    expect(result.message).toBe('Maaf, aku sedang memproses perasaanmu tapi sepertinya koneksi batinku sedikit terganggu. Bisa tolong ulangi kalimat terakhirmu?');
  });
});
