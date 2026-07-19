import React, { useState, useRef, useEffect } from 'react'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, query, orderBy, getDocs } from 'firebase/firestore'

const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : null;
let db = null;
let auth = null;
let appId = typeof __app_id !== 'undefined' ? __app_id : 'mindquest-prod';

if (firebaseConfigStr) {
  try {
    const firebaseConfig = JSON.parse(firebaseConfigStr);
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.warn("Backend configuration skipped.");
  }
}

export default function JournalTestPanel() {
  const [text, setText] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const callDirectGemini = async (msg, history) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) throw new Error("API Key tidak ditemukan.");
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [...history.map(h => ({ role: h.role, parts: [{ text: h.parts[0].text }] })), 
                   { role: 'user', parts: [{ text: msg }] }]
      })
    });
    const data = await response.json();
    return { message: data.candidates[0].content.parts[0].text };
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const aiResult = await callDirectGemini(text, chatHistory);
      setChatHistory(prev => [...prev, { role: 'user', parts: [{ text }] }, { role: 'model', parts: [{ text: aiResult.message }] }]);
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] w-full max-w-[900px] mx-auto bg-[#0a0a0f] rounded-3xl border border-[#2a2a3c] overflow-hidden shadow-2xl font-sans text-white">
      <style>{`
        .chat-bubble { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); }
      `}</style>

      {/* Header */}
      <div className="p-6 border-b border-[#1f1f2e] flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center text-xl">🧚</div>
        <div>
          <h2 className="text-lg font-semibold text-white">MindQuest Peri</h2>
          <p className="text-xs text-gray-400">Menemani perjalanan jiwamu</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 italic">
            <p>Mulai ceritakan sesuatu pada peri...</p>
          </div>
        )}
        {chatHistory.map((h, i) => (
          <div key={i} className={`chat-bubble flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-4 rounded-2xl ${h.role === 'user' 
              ? 'bg-[#6366f1] text-white rounded-br-none' 
              : 'glass text-gray-200 rounded-bl-none'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{h.parts[0].text}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 glass rounded-b-3xl">
        <div className="flex items-center gap-2">
          <textarea 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis bisikan hatimu..."
            className="flex-1 bg-transparent border-none outline-none text-white p-2 resize-none h-12"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="px-6 py-3 bg-[#6366f1] hover:bg-[#4f46e5] rounded-xl text-white font-medium transition-all"
          >
            {loading ? '...' : 'Kirim'}
          </button>
        </div>
      </div>
    </div>
  )
}