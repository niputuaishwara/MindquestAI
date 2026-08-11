// src/App.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useEncryptionKey } from './hooks/useEncryptionKey'
import SplashScreen from './components/SplashScreen'
import OnboardingScreen from './components/OnboardingScreen'
import { signOutUser } from './services/authService'

// New imports for UI/UX integration
import { 
  BookOpen, 
  Sparkles, 
  Compass, 
  Map, 
  Settings, 
  Scroll, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  X 
} from 'lucide-react'
import { InteractiveDeer } from './components/InteractiveDeer'
import { BerandaView } from './components/BerandaView'
import { JurnalView } from './components/JurnalView'
import { QuestView } from './components/QuestView'
import { PetaView } from './components/PetaView'
import { PsikologPortal } from './components/PsikologPortal'
import { AdminDashboard } from './components/AdminDashboard'
import { INITIAL_QUESTS } from './types'
import { addJournalEntry, getJournalEntries, deleteJournalEntry, saveSession } from './services/firestoreService'
import { useConversation } from './hooks/useConversation'
import { SYSTEM_PROMPT } from './systemPrompt'
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore'
import { db } from './config/firebase'
import { generateTrendSummary } from './agents/trendPlanner'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  
  // Mengambil state dari custom hooks Firebase Anda
  const [pin, setPin] = useState(null)
  const { user, profile, loading: authLoading } = useAuth()
  const { dataKey, ready: keyReady, error: keyError } = useEncryptionKey(user?.uid, pin)

  // 1. Navigation & UI Overlays
  const [currentMenu, setCurrentMenu] = useState("beranda")
  const [showWisdomScroll, setShowWisdomScroll] = useState(false)
  const [wisdomText, setWisdomText] = useState("")
  const [isWisdomLoading, setIsWisdomLoading] = useState(false)
  const [isSoundOn, setIsSoundOn] = useState(false)
  const [starDensity, setStarDensity] = useState(50)
  const [deerWhisper, setDeerWhisper] = useState(null)

  // 2. Stats & Progression synced to Firestore
  const [stats, setStats] = useState({
    xp: 45,
    level: 1,
    title: "Penjelajah Rasi",
    activeQuestId: null,
    dailyStreak: 1,
    lastActiveDate: new Date().toLocaleDateString(),
    completedQuestIds: []
  })

  // 3. Mood tracking state
  const [currentMood, setCurrentMood] = useState("Tenang")

  // 4. Journal Entries state
  const [entries, setEntries] = useState([])
  const [entriesLoading, setEntriesLoading] = useState(false)
  
  // 4b. Quest Recommendation State
  const [recommendedQuest, setRecommendedQuest] = useState(null)

  const handleRecommendQuest = (moodLabel) => {
    let targetCategory = "Semua";
    const lowerMood = (moodLabel || "").toLowerCase();
    
    if (lowerMood.includes("cemas") || lowerMood.includes("gelisah") || lowerMood.includes("fear")) targetCategory = "Cemas / Khawatir";
    else if (lowerMood.includes("marah") || lowerMood.includes("anger")) targetCategory = "Marah / Frustrasi";
    else if (lowerMood.includes("lelah") || lowerMood.includes("burnout")) targetCategory = "Lelah";
    else if (lowerMood.includes("sedih") || lowerMood.includes("sadness")) targetCategory = "Sedih / Murung";
    else if (lowerMood.includes("senang") || lowerMood.includes("joy") || lowerMood.includes("bahagia") || lowerMood.includes("ceria") || lowerMood.includes("tenang") || lowerMood.includes("damai") || lowerMood.includes("serenity")) targetCategory = "Senang / Bahagia";
    else if (lowerMood.includes("antusias") || lowerMood.includes("anticipation")) targetCategory = "Antusias / Harap";
    else if (lowerMood.includes("putus asa")) targetCategory = "Putus asa";
    else if (lowerMood.includes("isolasi") || lowerMood.includes("disgust")) targetCategory = "Isolasi diri";
    
    let available = INITIAL_QUESTS.filter(q => 
      !(stats.completedQuestIds || []).includes(q.id) &&
      (targetCategory === "Semua" || q.category === targetCategory)
    );

    // If no quest matches the exact category, fallback to 'Tenang' or 'Senang' instead of completely random negative quests
    if (available.length === 0) {
       available = INITIAL_QUESTS.filter(q => 
         !(stats.completedQuestIds || []).includes(q.id) &&
         (q.category === "Tenang" || q.category === "Senang / Bahagia" || q.category === "Ketenangan")
       );
    }
    const fallback = INITIAL_QUESTS.filter(q => !(stats.completedQuestIds || []).includes(q.id));
    
    if (available.length > 0) {
      setRecommendedQuest(available[Math.floor(Math.random() * available.length)]);
    } else if (fallback.length > 0) {
      setRecommendedQuest(fallback[Math.floor(Math.random() * fallback.length)]);
    }
  }

  // 5. AI Conversation Hook
  const {
    history: chatHistoryRaw,
    send: sendConversation,
    reset: resetConversation,
    loading: chatLoading,
    error: chatError,
    isComplete: chatComplete,
    result: chatResult,
    actions: chatActions
  } = useConversation(user?.uid, dataKey)

  const [localHistory, setLocalHistory] = useState([])
  const [isLocalChatActive, setIsLocalChatActive] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isCrisisLoading, setIsCrisisLoading] = useState(false)

  // Sync stats from profile once loaded
  useEffect(() => {
    if (profile?.stats) {
      setStats(profile.stats)
    }
  }, [profile])

  // Agentic Action Loop Handler
  useEffect(() => {
    if (chatActions && chatActions.length > 0) {
      chatActions.forEach(action => {
        switch (action.type) {
          case 'TRIGGER_CRISIS_PROTOCOL':
            setDeerWhisper(`[!] ${action.payload.alert}: ${action.payload.suggestion}`);
            break;
          case 'SAVE_SESSION_AND_RECOMMEND_QUEST':
            handleRecommendQuest(action.payload.emotionLabel || action.payload.plutchikCategory);
            setDeerWhisper(`✦ Obrolan selesai! Rasi batinmu terdeteksi: ${action.payload.emotionLabel}.`);
            setTimeout(() => setDeerWhisper(null), 6000);
            
            // Extract last AI message from chat history
            const lastMessage = chatHistoryRaw && chatHistoryRaw.length > 0 
              ? chatHistoryRaw[chatHistoryRaw.length - 1].parts[0].text 
              : "Kesimpulan obrolan dengan Si Rusa Berbintang.";

            // Auto-add ke Gulungan Memoar untuk chat dari Cloud Function
            handleAddEntry({
              title: `Memoar Obrolan: ${action.payload.emotionLabel}`,
              text: lastMessage,
              mood: action.payload.plutchikCategory,
              moodScore: action.payload.score || 5,
              reflection: "Disimpulkan otomatis dari obrolan mendalam bersama Si Rusa Berbintang."
            });
            break;
          case 'SUGGEST_BREATHING_EXERCISE':
            setDeerWhisper(`✦ ${action.payload.message}`);
            setTimeout(() => setDeerWhisper(null), 6000);
            break;
          case 'SUGGEST_TREND_CHECKIN':
            setDeerWhisper(`✦ ${action.payload.message}`);
            setTimeout(() => setDeerWhisper(null), 7000);
            break;
          case 'SUGGEST_DAILY_QUEST':
            setDeerWhisper(`✦ ${action.payload.message}`);
            setTimeout(() => setDeerWhisper(null), 6000);
            handleRecommendQuest('Senang');
            break;
          default:
            break;
        }
      });
    }
  }, [chatActions])

  // Handle browser back button to always return to beranda
  useEffect(() => {
    const handlePopState = () => {
      setCurrentMenu("beranda")
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // Push state when navigating away from beranda so the back button is enabled
  useEffect(() => {
    if (currentMenu !== "beranda") {
      window.history.pushState({ menu: currentMenu }, "")
    }
  }, [currentMenu])

  const updateStats = async (updater) => {
    setStats((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      if (user) {
        const userDocRef = doc(db, 'users', user.uid)
        setDoc(userDocRef, { stats: next }, { merge: true })
          .catch(err => console.error("Gagal update stats:", err))
      }
      return next
    })
  }

  const addXP = (amount) => {
    updateStats((prev) => {
      const newXP = prev.xp + amount
      const currentLevel = prev.level
      const targetLevel = Math.floor(newXP / 150) + 1
      
      let title = prev.title
      if (targetLevel === 2) title = "Penjelajah Lembah Gema"
      if (targetLevel === 3) title = "Penjaga Hutan Kabut"
      if (targetLevel === 4) title = "Penyelaras Bintang"
      if (targetLevel >= 5) title = "Pendeta Kuil Ketenangan"

      const leveledUp = targetLevel > currentLevel

      if (leveledUp) {
        setDeerWhisper(`✦ Selamat! Jiwamu naik tingkat ke Level ${targetLevel}. Rasi tandukku memancarkan cahaya ${title}!`)
        setTimeout(() => setDeerWhisper(null), 7000)
      }

      return {
        ...prev,
        xp: newXP,
        level: targetLevel,
        title: title
      }
    })
  }

  // Load and decrypt journal entries
  const loadJournalEntries = async () => {
    if (user && dataKey) {
      setEntriesLoading(true)
      try {
        const res = await getJournalEntries(user.uid, dataKey)
        const parsed = res.map(e => {
          try {
            const obj = JSON.parse(e.text)
            return {
              id: e.id,
              date: e.createdAt ? new Date(e.createdAt.seconds * 1000).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
              title: obj.title,
              text: obj.text,
              mood: obj.mood,          // ← FIX: wajib ada agar trendPlanner bisa hitung streak
              moodScore: obj.moodScore,
              reflection: obj.reflection,
              timestamp: e.createdAt ? e.createdAt.seconds * 1000 : Date.now(),
              rawCiphertext: e.rawCiphertext,
              rawIv: e.rawIv
            }
          } catch {
            return {
              id: e.id,
              date: e.createdAt ? new Date(e.createdAt.seconds * 1000).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
              title: "Memoar Tanpa Judul",
              text: e.text,
              mood: "Tenang",
              moodScore: 5,
              reflection: "Tersimpan aman.",
              timestamp: e.createdAt ? e.createdAt.seconds * 1000 : Date.now(),
              rawCiphertext: e.rawCiphertext,
              rawIv: e.rawIv
            }
          }
        })
        setEntries(parsed)
      } catch (err) {
        console.error("Gagal memuat jurnal:", err)
      } finally {
        setEntriesLoading(false)
      }
    }
  }

  useEffect(() => {
    loadJournalEntries()
  }, [user, dataKey])

  const handleAddEntry = async (entry) => {
    if (!user || !dataKey) return
    try {
      const newEntryData = {
        title: entry.title,
        text: entry.text,
        mood: entry.mood,
        moodScore: entry.moodScore,
        reflection: entry.reflection || "Goresan katamu tersimpan abadi di bawah rasi bintang MindQuest. Biarkan jiwamu memproses ketenangan batin ini secara perlahan."
      }
      
      const serialized = JSON.stringify(newEntryData)
      const positiveScore = (entry.mood === 'Senang' || entry.mood === 'Tenang') ? entry.moodScore : 0
      const negativeScore = (entry.mood === 'Lelah' || entry.mood === 'Gelisah') ? (10 - entry.moodScore) : 0

      await addJournalEntry(user.uid, dataKey, {
        text: serialized,
        positiveScore,
        negativeScore
      })

      addXP(30)
      await loadJournalEntries()
      handleRecommendQuest(entry.mood)
    } catch (err) {
      console.error("Gagal menyimpan entri jurnal:", err)
    }
  }

  const handleRequestChat = async () => {
    if (!user || !pin) return null
    try {
      const chatRef = doc(collection(db, 'chats'))
      await setDoc(chatRef, {
        userId: user.uid,
        userPseudonym: profile?.pseudonym || 'Anonim',
        status: 'waiting',
        psychologistId: null,
        psychologistName: null,
        createdAt: serverTimestamp()
      })
      return chatRef.id
    } catch (err) {
      console.error("Gagal meminta chat:", err)
      return null
    }
  }

  const handleDeleteEntry = async (id) => {
    if (!user) return
    try {
      await deleteJournalEntry(user.uid, id)
      await loadJournalEntries()
    } catch (err) {
      console.error("Gagal menghapus entri jurnal:", err)
    }
  }

  // Fallback direct Groq client-side API call
  const callDirectGroq = async (msg, history) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY || ""
    if (!apiKey) throw new Error("VITE_GROQ_API_KEY tidak ditemukan.")
    
    const url = `https://api.groq.com/openai/v1/chat/completions`
    
    const formattedContents = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts && h.parts[0] ? h.parts[0].text : ''
      })),
      { role: 'user', content: msg }
    ]

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: formattedContents,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      console.error(`[DirectGroq] HTTP ${response.status}:`, JSON.stringify(errBody))
      throw new Error(`Direct API failed with status ${response.status}: ${errBody?.error?.message || JSON.stringify(errBody)}`)
    }

    const data = await response.json()
    const rawText = data.choices[0]?.message?.content || '{}'
    
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim()
      return JSON.parse(cleaned)
    } catch (err) {
      console.warn("Direct Groq JSON parse error:", err, "Raw Text:", rawText)
      return {
        phase: 'deepening',
        message: "Maaf, aku sedang memproses perasaanmu tapi rasanya koneksi batinku sedikit terganggu. Bisa tolong ulangi skormu?",
        isComplete: false,
        result: null
      }
    }
  }

  const handleSendChatMessage = async (text) => {
    if (!text.trim() || isChatLoading) return
    setIsChatLoading(true)
    
    // Prediksi sederhana krisis di sisi client untuk mengatur status loading yang lebih empatik
    const crisisKeywords = /mau\s+mati|ingin\s+mati|pengen\s+mati|bunuh\s+diri|akhiri\s+hidup|tidak\s+kuat\s+lagi|nyakitin\s+diri|capek\s+hidup|lelah\s+hidup/i;
    setIsCrisisLoading(crisisKeywords.test(text));

    if (isLocalChatActive) {
      // Direct Local Gemini Fallback Mode
      try {
        const userMsg = { role: 'user', parts: [{ text }] }
        const newHistory = [...localHistory, userMsg]
        setLocalHistory(newHistory)
        
        // Fallback langsung ke Groq API jika backend gagal
        const aiResult = await callDirectGroq(text, localHistory)
        
        const isHighNegative = aiResult.result && 
          (aiResult.result.emotionType?.toLowerCase() === 'negative' || aiResult.result.emotionType?.toLowerCase() === 'negatif') && 
          aiResult.result.score >= 8;

        const isDistress = aiResult.phase === 'distress' || 
          (aiResult.result && (aiResult.result.emotionType === 'distress' || aiResult.result.emotionLabel === 'Distres Akut')) || 
          isHighNegative;
        
        let finalMessage = aiResult.message
        if (isDistress && !finalMessage.includes("Peringatan Medis Darurat")) {
          finalMessage += "\n\n[Sistem: Peringatan Medis Darurat]";
        }

        const modelMsg = { role: 'model', parts: [{ text: finalMessage }] }
        setLocalHistory(prev => [...prev, modelMsg])

        if (aiResult.isComplete && aiResult.result) {
          await saveSession(user.uid, dataKey, {
            history: [...newHistory, modelMsg],
            emotionLabel: aiResult.result.emotionLabel,
            emotionType: aiResult.result.emotionType,
            score: aiResult.result.score,
            plutchikCategory: aiResult.result.plutchikCategory
          })
          
          if (!isDistress) {
            setDeerWhisper(`✦ Obrolan selesai! Rasi batinmu terdeteksi: ${aiResult.result.emotionLabel}.`)
            setTimeout(() => setDeerWhisper(null), 6000)
            handleRecommendQuest(aiResult.result.emotionLabel || aiResult.result.plutchikCategory)
            
            // Auto-add ke Gulungan Memoar
            await handleAddEntry({
              title: `Memoar Obrolan: ${aiResult.result.emotionLabel}`,
              text: aiResult.message,
              mood: aiResult.result.plutchikCategory,
              moodScore: aiResult.result.score || 5,
              reflection: "Disimpulkan otomatis dari obrolan mendalam bersama Si Rusa Berbintang."
            })
          }
        }
      } catch (err) {
        console.error("Gagal memanggil direct Groq:", err)
        const errorMsg = { role: 'model', parts: [{ text: `Hubungan magisku dengan bintang-bintang sedang terganggu. Error: ${err.message || 'Unknown'}. Mari kita coba lagi nanti...` }] }
        setLocalHistory(prev => [...prev, errorMsg])
      } finally {
        setIsChatLoading(false)
        setIsCrisisLoading(false)
      }
    } else {
      // Primary Mode: Cloud Function analyzeEmotion
      try {
        const trendData = generateTrendSummary(entries)
        await sendConversation(text, trendData.narrative, trendData.trendDirection, trendData.consecutiveNegativeDays, trendData.hasDistressCategoryEntry)
      } catch (err) {
        console.warn("Cloud function failed, falling back to direct client-side Groq:", err)
        setIsLocalChatActive(true)
        // Konversi history yang mentah dari state agar cocok dengan format array biasa
        const historyForFallback = chatHistoryRaw.map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text || m.parts?.[0]?.text }]
        }))
        setLocalHistory([...historyForFallback, { role: 'user', parts: [{ text }] }])

        try {
          const aiResult = await callDirectGroq(text, historyForFallback)
          
          const isHighNegative = aiResult.result && 
            (aiResult.result.emotionType?.toLowerCase() === 'negative' || aiResult.result.emotionType?.toLowerCase() === 'negatif') && 
            aiResult.result.score >= 8;

          const isDistress = aiResult.phase === 'distress' || 
            (aiResult.result && (aiResult.result.emotionType === 'distress' || aiResult.result.emotionLabel === 'Distres Akut')) || 
            isHighNegative;
          
          let finalMessage = aiResult.message
          if (isDistress && !finalMessage.includes("Peringatan Medis Darurat")) {
            finalMessage += "\n\n[Sistem: Peringatan Medis Darurat]";
          }

          const modelMsg = { role: 'model', parts: [{ text: finalMessage }] }
          setLocalHistory(prev => [...prev, modelMsg])

          if (aiResult.isComplete && aiResult.result) {
            await saveSession(user.uid, dataKey, {
              history: [...historyForFallback, { role: 'user', parts: [{ text }] }, modelMsg],
              emotionLabel: aiResult.result.emotionLabel,
              emotionType: aiResult.result.emotionType,
              score: aiResult.result.score,
              plutchikCategory: aiResult.result.plutchikCategory
            })
            
            if (!isDistress) {
              setDeerWhisper(`✦ Obrolan selesai! Rasi batinmu terdeteksi: ${aiResult.result.emotionLabel}.`)
              setTimeout(() => setDeerWhisper(null), 6000)
              handleRecommendQuest(aiResult.result.emotionLabel || aiResult.result.plutchikCategory)
            }
          }
        } catch (directErr) {
          console.error("Direct fallback also failed:", directErr)
          const errorMsg = { role: 'model', parts: [{ text: `Koneksi bintang terputus sepenuhnya. Error: ${directErr.message || 'Unknown'}. Mari kita coba lagi nanti.` }] }
          setLocalHistory(prev => [...prev, errorMsg])
        }
      } finally {
        setIsChatLoading(false)
        setIsCrisisLoading(false)
      }
    }
  }

  // Format chat history for rendering in JurnalView
  const derivedChatHistory = isLocalChatActive
    ? [
        {
          id: "chat-seed-1",
          sender: "companion",
          text: "Salam hangat, Penjelajah! Aku adalah Si Rusa Berbintang, pemandu spiritual dan kawan berbisikmu di hutan MindQuest. Ceritakan padaku, rintangan, ketakutan, atau kegembiraan kecil apa yang sedang beriak di hatimu saat ini? Aku di sini senantiasa mendengar dahan hatimu...",
          timestamp: "00:00"
        },
        ...localHistory.map((h, i) => ({
          id: `chat-msg-${i}`,
          sender: h.role === 'user' ? 'user' : 'companion',
          text: h.parts[0].text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      ]
    : [
        {
          id: "chat-seed-1",
          sender: "companion",
          text: "Salam hangat, Penjelajah! Aku adalah Si Rusa Berbintang, pemandu spiritual dan kawan berbisikmu di hutan MindQuest. Ceritakan padaku, rintangan, ketakutan, atau kegembiraan kecil apa yang sedang beriak di hatimu saat ini? Aku di sini senantiasa mendengar dahan hatimu...",
          timestamp: "00:00"
        },
        ...chatHistoryRaw.map((h, i) => ({
          id: `chat-msg-${i}`,
          sender: h.role === 'user' ? 'user' : 'companion',
          text: h.parts[0].text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      ]

  const isLoadingChatActive = isChatLoading || chatLoading

  // Derive quests state
  const quests = INITIAL_QUESTS.map(q => ({
    ...q,
    isCompleted: stats.completedQuestIds?.includes(q.id) || false
  }))

  const handleStartQuest = (questId) => {
    updateStats({ activeQuestId: questId })
    setCurrentMenu("quest")
  }

  const handleCancelQuest = () => {
    updateStats({ activeQuestId: null })
  }

  const handleCompleteQuest = async (questId, customLog, score) => {
    const quest = quests.find((q) => q.id === questId)
    const rewardXP = quest ? quest.rewardXP : 50

    const nextCompleted = [...(stats.completedQuestIds || []), questId]

    updateStats({
      activeQuestId: null,
      completedQuestIds: nextCompleted
    })
    
    addXP(rewardXP)

    try {
      const reflections = [
        "Mengosongkan pikiran sejenak mengembalikan keselarasan detak nadamu dengan rotasi bumi.",
        "Melihat keindahan kecil di sekelilingmu adalah kunci meruntuhkan dinding kecemasan.",
        "Melatih rasa syukur menyeimbangkan hormon ketenangan dan memupuk optimisme batin."
      ]
      const randomReflection = reflections[Math.floor(Math.random() * reflections.length)]

      const serialized = JSON.stringify({
        title: quest ? `Misi Selesai: ${quest.title}` : "Misi Ketenangan Jiwa",
        text: customLog,
        mood: currentMood,
        moodScore: score,
        reflection: randomReflection
      })

      const positiveScore = (currentMood === 'Senang' || currentMood === 'Tenang') ? score : 0
      const negativeScore = (currentMood === 'Lelah' || currentMood === 'Gelisah') ? (10 - score) : 0

      await addJournalEntry(user.uid, dataKey, {
        text: serialized,
        positiveScore,
        negativeScore
      })

      setDeerWhisper(`✦ Misi '${quest?.title}' selesai! Rekaman batin telah ditambahkan ke Gulungan Memoarmu.`)
      setTimeout(() => setDeerWhisper(null), 6000)
      
      await loadJournalEntries()
      setCurrentMenu("jurnal")
    } catch (err) {
      console.error("Gagal menyimpan log misi ke jurnal:", err)
    }
  }

  const handleOpenWisdomScroll = async () => {
    setShowWisdomScroll(true)
    setIsWisdomLoading(true)
    
    try {
      const activeQuestObj = quests.find((q) => q.id === stats.activeQuestId)
      
      // 1. Direct fetch ke Groq API untuk memproses summary
      const apiKey = import.meta.env.VITE_GROQ_API_KEY || ""
      if (!apiKey) throw new Error("VITE_GROQ_API_KEY tidak ditemukan.")

      const promptSummary = `Berikan petuah kebijaksanaan puitis satu paragraf singkat (maksimal 3 kalimat) dalam Bahasa Indonesia untuk seorang remaja yang sedang merasa "${currentMood}" dan sedang menjalankan misi "${activeQuestObj ? activeQuestObj.title : 'Penjelajahan Jiwa'}". Bicaralah dengan gaya dongeng yang bijak, hangat, dan menenangkan seperti Si Rusa Berbintang. Jangan gunakan JSON atau markdown, langsung teks saja.`
      
      const url = `https://api.groq.com/openai/v1/chat/completions`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: promptSummary }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.5
        })
      })

      if (!response.ok) throw new Error(`HTTP ${response.status} dari Groq API`)

      const data = await response.json()
      let analysisText = data.choices[0]?.message?.content || ""
      setWisdomText(analysisText)
    } catch (err) {
      console.warn("Gagal mengambil petuah bimbingan:", err)
      setWisdomText("Ketika jiwamu terasa berat ditiup badai pikiran, ingatlah bahwa dahan rimbun MindQuest senantiasa teduh melindungimu. Pejamkan matamu, rasakan rasi bintang memeluk nadamu.")
    } finally {
      setIsWisdomLoading(false)
    }
  }

  const handleResetData = async () => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid)
      await setDoc(userDocRef, {
        stats: {
          xp: 45,
          level: 1,
          title: "Penjelajah Rasi",
          activeQuestId: null,
          dailyStreak: 1,
          lastActiveDate: new Date().toLocaleDateString(),
          completedQuestIds: []
        }
      }, { merge: true })
      
      for (const entry of entries) {
        await deleteJournalEntry(user.uid, entry.id)
      }
    }
    
    localStorage.removeItem("mindquest_stats")
    localStorage.removeItem("mindquest_mood")
    localStorage.removeItem("mindquest_entries")
    localStorage.removeItem("mindquest_chat")
    localStorage.removeItem("mindquest_quests")
    window.location.reload()
  }

  const handleDeerMessage = (msg) => {
    setDeerWhisper(msg)
    setTimeout(() => {
      setDeerWhisper((current) => (current === msg ? null : current))
    }, 5500)
  }

  const handleResetChat = () => {
    resetConversation()
    setLocalHistory([])
    setIsLocalChatActive(false)
  }

  // ─── Rendering Dispatcher ──────────────────────────────────────────────────

  // Tangkap error dekripsi (PIN Salah) lalu lempar kembali ke Onboarding
  const [pinError, setPinError] = useState(null)
  useEffect(() => {
    if (keyError) {
      setPinError("Akses Ditolak: PIN yang Anda masukkan salah.")
      setPin(null)
    }
  }, [keyError])

  // 1. Splash screen — tampil di awal sebelum apapun
  if (!splashDone) {
    return (
      <SplashScreen
        onStart={() => setSplashDone(true)}
      />
    )
  }

  // 2. Loading status auth dari Firebase
  if (authLoading) return <CenterMessage text="Memuat Autentikasi..." />

  // 3. Role-Based Routing (Admin & Psikolog bypass PIN)
  if (user && profile) {
    if (profile.role === 'admin') {
      return <AdminDashboard onBack={() => signOutUser()} />;
    }
    if (profile.role === 'psychologist') {
      return <PsikologPortal onBack={() => signOutUser()} currentUser={user} profile={profile} />;
    }
  }

  // 4. Belum login atau belum input PIN → OnboardingScreen
  if (!user || !pin) {
    return (
      <OnboardingScreen 
        currentUser={user}
        onPinSet={(newPin) => {
          setPinError(null)
          setPin(newPin)
        }}
        externalError={pinError}
        onBack={() => {
          setSplashDone(false)
        }}
      />
    )
  }

  // 5. Sudah login, data key belum siap
  if (!keyReady) return <CenterMessage text="Membongkar gembok memori..." />

  // 6. Semua siap → App utama dengan Shell UI/UX yang indah
  return (
    <div className="min-h-screen bg-space-deep text-vellum font-sans flex flex-col md:flex-row relative overflow-hidden" id="applet-viewport-frame">
      
      {/* BACKGROUND FLOATING STAR PARTICLES — ukuran & warna bervariasi */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" id="celestial-particle-sky">
        <div className="absolute inset-0 bg-radial from-transparent via-[#0a0b22]/40 to-space-deep" />
        {Array.from({ length: starDensity }).map((_, i) => {
          const roll = i % 7
          const size = roll < 2 ? 4 : roll < 4 ? 2 : 1
          const top  = `${(i * 37.7 + 13) % 100}%`
          const left = `${(i * 61.3 + 7)  % 100}%`
          const delay    = `${(i * 0.37) % 9}s`
          const duration = `${6 + (i * 0.19) % 10}s`
          // Variasi warna: gold, lavender, putih
          const color = roll < 2 ? 'rgba(242,202,80,0.7)'
                      : roll < 4 ? 'rgba(201,190,255,0.5)'
                      : 'rgba(255,255,255,0.6)'
          return (
            <div
              key={i}
              className="absolute rounded-full animate-drift-free"
              style={{
                width:  size,
                height: size,
                top,
                left,
                background: `radial-gradient(circle, ${color}, transparent)`,
                animationDelay: delay,
                animationDuration: duration,
              }}
            />
          )
        })}
      </div>

      {/* LEFT SIDEBAR */}
      <aside 
        className="w-full md:w-64 bg-space-light/85 backdrop-blur-md border-r border-space-bright z-10 flex flex-col justify-between shrink-0 select-none relative"
        id="left-navigation-sidebar"
      >
        {/* Animated deer logo header */}
        <div className="relative">
          <InteractiveDeer onDeerMessage={handleDeerMessage} />
          
          {deerWhisper && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-32 w-[220px] bg-radial from-vellum to-vellum-dark text-space-deep text-[11px] leading-relaxed p-3.5 rounded-xl border border-vellum-dark/60 shadow-xl z-50 font-serif font-medium text-center animate-inkBleed"
              id="deer-whisper-speech-bubble"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-vellum" />
              <div className="text-[8px] font-mono text-gold-dark uppercase tracking-widest mb-0.5">✧ Sabda Rusa ✧</div>
              <p>"{deerWhisper}"</p>
            </div>
          )}
        </div>

        {/* Navigation — item aktif pakai indikator bar kiri (nav-active-bar) */}
        <nav className="flex-1 px-3 py-5 space-y-1 mt-4">
          {[
            { id: "beranda", label: "BERANDA",    icon: "🌿" },
            { id: "jurnal",  label: "JURNAL",     icon: "📜" },
            { id: "quest",   label: "MISI BATIN", icon: "⚔️" },
            { id: "peta",    label: "PETA EMOSI", icon: "🗺️" },
          ].map(({ id, label, icon }) => {
            const isActive = currentMenu === id
            return (
              <button
                key={id}
                onClick={() => setCurrentMenu(id)}
                id={`nav-btn-${id}`}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5
                  text-[11px] font-mono tracking-wider
                  transition-all duration-250 rounded-r-xl rounded-l-sm
                  ${isActive
                    ? 'nav-active-bar bg-space-bright/70 text-gold font-bold'
                    : 'text-magic-light hover:bg-space-bright/30 hover:text-vellum hover:pl-5'
                  }
                `}
              >
                <span className="text-base leading-none">{icon}</span>
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom utility controls */}
        <div className="p-4 space-y-2 border-t border-space-bright/30 bg-space-deep/25">
          {/* Buka Gulungan magical scroll button */}
          <button
            onClick={handleOpenWisdomScroll}
            id="buka-gulungan-btn"
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-gold/10 via-gold/25 to-gold/10 border border-gold/40 text-xs font-mono font-bold text-gold hover:from-gold hover:to-amber-500 hover:text-midnight transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-gold/5"
          >
            <Scroll className="w-4 h-4" />
            BUKA GULUNGAN
          </button>


          
          <button
            onClick={() => {
              setPin(null);
              setSplashDone(false);
              setCurrentMenu("beranda");
            }}
            className="w-full py-1.5 rounded-xl border border-dashed border-space-bright hover:border-rose-500/50 text-[10px] text-magic-light hover:text-rose-400 transition-all font-mono"
          >
            Kunci Jurnal
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT CANVAS */}
      <main className="flex-1 p-6 md:p-8 z-10 overflow-y-auto relative" id="main-application-canvas">

        {/* Breadcrumb navigasi — memberikan orientasi visual */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-gold/40 mb-5 tracking-ultrawide uppercase">
          <span className="text-gold/30">✦</span>
          <span>Hutan Jiwa</span>
          <span className="text-gold/20">/</span>
          <span className="text-gold/70">{{
            beranda: 'Beranda',
            jurnal:  'Jurnal & Batin',
            quest:   'Misi Batin',
            peta:    'Peta Emosi',
          }[currentMenu]}</span>
        </div>


        {/* View Switcher Dispatch */}
        {currentMenu === "beranda" && (
          <BerandaView
            stats={stats}
            quests={quests}
            currentMood={currentMood}
            onChangeMood={setCurrentMood}
            onNavigateToQuest={handleStartQuest}
            onNavigateToMenu={setCurrentMenu}
          />
        )}

        {currentMenu === "jurnal" && (
          <JurnalView
            entries={entries}
            chatHistory={derivedChatHistory}
            currentMood={currentMood}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onSendChatMessage={handleSendChatMessage}
            isChatLoading={isLoadingChatActive}
            isCrisisLoading={isCrisisLoading}
            onResetChat={handleResetChat}
            onRequestChat={handleRequestChat}
            currentUser={user}
            dataKey={dataKey}
          />
        )}

        {currentMenu === "quest" && (
          <QuestView
            quests={quests}
            stats={stats}
            entries={entries}
            onStartQuest={handleStartQuest}
            onCompleteQuest={handleCompleteQuest}
            onCancelQuest={handleCancelQuest}
            onNavigateToMenu={setCurrentMenu}
          />
        )}

        {currentMenu === "peta" && (
          <PetaView
            entries={entries}
            stats={stats}
          />
        )}
      </main>

      {/* RECOMMENDED QUEST OVERLAY MODAL */}
      {recommendedQuest && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          id="recommended-quest-overlay"
        >
          <div className="bg-space-light/95 border border-gold/40 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-gold/10 text-center space-y-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="mx-auto w-16 h-16 bg-gold/15 border border-gold/30 rounded-2xl flex items-center justify-center mb-4">
                <Compass className="w-8 h-8 text-gold animate-pulse-gold" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-vellum mb-2">Panggilan Hutan Jiwa</h2>
              <p className="text-sm text-magic-light leading-relaxed">
                Rasi bintang merasakan denyut jiwamu dan menyarankan <b>{recommendedQuest.title}</b> untuk menyeimbangkan batinmu saat ini.
              </p>
              
              <div className="bg-space-deep/50 border border-space-bright p-4 rounded-xl mt-4 mb-6 text-left">
                <div className="text-[10px] font-mono text-gold mb-1 uppercase tracking-wider">Kategori: {recommendedQuest.category}</div>
                <div className="text-xs text-magic-light line-clamp-3">{recommendedQuest.description}</div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    handleStartQuest(recommendedQuest.id);
                    setRecommendedQuest(null);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-gold to-[#ffd970] text-midnight font-bold rounded-xl shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Mulai Misi Sekarang
                </button>
                <button
                  onClick={() => setRecommendedQuest(null)}
                  className="w-full py-3 bg-space-bright/30 text-magic-light hover:text-vellum font-mono text-xs rounded-xl hover:bg-space-bright/50 transition-all border border-transparent hover:border-space-bright"
                >
                  Nanti Saja (Lewati)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VELUM WISDOM SCROLL OVERLAY MODAL */}
      {showWisdomScroll && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          id="wisdom-scroll-overlay"
          onClick={() => setShowWisdomScroll(false)}
        >
          <div 
            className="vellum-card max-w-xl w-full rounded-2xl overflow-hidden relative border-4 border-double border-vellum-dark/40 shadow-2xl p-8 md:p-10 text-center space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ornate corner anchors */}
            <div className="absolute top-2 left-2 text-vellum-dark text-lg select-none">✥</div>
            <div className="absolute top-2 right-2 text-vellum-dark text-lg select-none">✥</div>
            <div className="absolute bottom-2 left-2 text-vellum-dark text-lg select-none">✥</div>
            <div className="absolute bottom-2 right-2 text-vellum-dark text-lg select-none">✥</div>

            {/* Closing banner */}
            <button
              onClick={() => setShowWisdomScroll(false)}
              id="close-wisdom-scroll"
              className="absolute top-4 right-4 p-1 rounded-full bg-vellum-dark/20 text-space-deep hover:bg-vellum-dark/40 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo Rusa Magis Design */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gold/15 shadow-lg shadow-gold/20 flex items-center justify-center border-2 border-gold/30 text-gold animate-pulse-gold select-none">
                <span className="text-3xl font-serif font-bold">🦌</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-gold-dark uppercase tracking-widest">
                ✦ SABDA PETUAH RASI BINTANG ✦
              </div>
              <h2 className="font-serif text-xl font-bold text-space-deep italic">
                Buku Harian Rahasia Penjelajah Jiwa
              </h2>
            </div>

            {/* Wisdom Content */}
            <div className="py-4 border-y border-vellum-dark/30 min-h-[100px] flex items-center justify-center">
              {isWisdomLoading ? (
                <div className="space-y-2">
                  <Sparkles className="w-8 h-8 text-gold-dark animate-spin mx-auto" />
                  <p className="text-xs font-mono text-space-deep/60">Menguraikan pesan rahasia dari rasi bintang...</p>
                </div>
              ) : (
                <p className="font-serif italic text-base md:text-lg text-space-deep leading-relaxed text-justify px-4">
                  "{wisdomText}"
                </p>
              )}
            </div>

            <div className="text-[10px] font-mono text-space-deep/50 uppercase tracking-widest">
              Diterjemahkan secara spiritual oleh Si Rusa Berbintang
            </div>

            <button
              onClick={() => setShowWisdomScroll(false)}
              id="roll-up-scroll-btn"
              className="w-full py-3 bg-space-deep hover:bg-space-bright text-vellum font-mono text-xs font-bold rounded-xl transition-all shadow-md"
            >
              Gulung Kembali Lembaran Suci
            </button>
          </div>
        </div>
      )}


    </div>
  )
}

function CenterMessage({ text, isError }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', fontFamily: 'sans-serif', textAlign: 'center',
      padding: '1.5rem', color: isError ? '#A32D2D' : '#888'
    }}>
      <p>{text}</p>
    </div>
  )
}