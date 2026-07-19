import React, { useState, useRef, useEffect } from "react";
import { BookOpen, Send, Trash2, Sparkles, Calendar, Heart, Plus, X, RotateCcw, Info, Lock, PhoneCall } from "lucide-react";
import { MOOD_CONFIGS } from "../types";
import { UserLiveChat } from "./UserLiveChat";
import { decryptText } from "../utils/cryptoService";

export const JurnalView = ({
  entries,
  chatHistory,
  currentMood,
  onAddEntry,
  onDeleteEntry,
  onSendChatMessage,
  isChatLoading,
  isCrisisLoading,
  onResetChat,
  onRequestChat,
  currentUser,
  dataKey,
}) => {
  const [chatInput, setChatInput] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showSos, setShowSos] = useState(false);
  const [devMode, setDevMode] = useState(false);
  
  // Live Chat States
  const [activeChatId, setActiveChatId] = useState(null);
  const [isRequestingChat, setIsRequestingChat] = useState(false);
  
  // Secret Tap States
  const [tapCount, setTapCount] = useState(0);
  const [showDevToggle, setShowDevToggle] = useState(false);

  useEffect(() => {
    if (tapCount > 0 && tapCount < 5) {
      const timer = setTimeout(() => setTapCount(0), 1000);
      return () => clearTimeout(timer);
    } else if (tapCount >= 5) {
      setShowDevToggle(true);
      setTapCount(0);
    }
  }, [tapCount]);
  
  // States for manual journal writing form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [newMood, setNewMood] = useState(currentMood);
  const [newScore, setNewScore] = useState(5);

  const chatEndRef = useRef(null);

  // Manual Decryption Test States
  const [showTestModal, setShowTestModal] = useState(false);
  const [testCipher, setTestCipher] = useState("");
  const [testIv, setTestIv] = useState("");
  const [testResult, setTestResult] = useState("");
  const [testError, setTestError] = useState("");
  
  const handleManualDecrypt = async () => {
    try {
      setTestError("");
      setTestResult("");
      if (!dataKey) throw new Error("DataKey tidak tersedia di memori.");
      const result = await decryptText({ ciphertext: testCipher, iv: testIv }, dataKey);
      setTestResult(result);
    } catch (err) {
      setTestError("Gagal mendekripsi: Pastikan Ciphertext dan IV benar, dan ini adalah akun pemilik data.");
    }
  };

  // Auto scroll to chat bottom and check for emergency
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // Auto-open SOS modal if the last message is an emergency warning
    if (chatHistory && chatHistory.length > 0) {
      const lastMsg = chatHistory[chatHistory.length - 1];
      if (lastMsg.sender === 'companion' && lastMsg.text.includes("Peringatan Medis Darurat")) {
        setShowSos(true);
      }
    }
  }, [chatHistory, isChatLoading]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChatMessage(chatInput.trim());
    setChatInput("");
  };

  const handleSaveJournal = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;
    onAddEntry({
      title: newTitle.trim(),
      text: newText.trim(),
      mood: newMood,
      moodScore: newScore,
    });
    // Reset form
    setNewTitle("");
    setNewText("");
    setNewMood(currentMood);
    setNewScore(5);
    setShowAddForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]" id="jurnal-view-container">
      
      {/* LEFT COLUMN: Memorial Logs & History (5/12 cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-4 h-full">
        {/* Header with quick creation toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold" />
            <h2 
              className="font-serif text-lg font-bold text-vellum cursor-default select-none"
              onClick={() => setTapCount(prev => prev + 1)}
            >
              Gulungan Memoar
            </h2>
            <button
              onClick={() => setShowInfo(true)}
              className="p-1 rounded bg-space-bright/20 hover:bg-space-bright text-magic-light hover:text-gold transition-colors ml-2"
              title="Transparansi Ilmiah"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSos(true)}
              className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 hover:text-rose-300 transition-colors ml-1"
              title="Bantuan Psikolog (SOS)"
            >
              <Heart className="w-4 h-4" />
            </button>
            {showDevToggle && (
              <button
                onClick={() => setDevMode(!devMode)}
                className={`p-1 rounded transition-colors ml-1 animate-fadeIn ${devMode ? 'bg-emerald-500/30 text-emerald-300' : 'bg-space-bright/20 text-magic-light hover:text-emerald-300'}`}
                title="Mode Pembuktian Dosen (Lihat Ciphertext)"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            id="toggle-add-journal-btn"
            className="px-3 py-1.5 rounded-lg bg-gold/15 border border-gold/30 hover:bg-gold hover:text-midnight transition-all duration-300 text-xs font-mono text-gold flex items-center gap-1"
          >
            {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showAddForm ? "Batal" : "Gores Gulungan Memoar"}
          </button>
        </div>

        {/* Manual Journal Writing Form */}
        {showAddForm && (
          <form 
            onSubmit={handleSaveJournal}
            id="add-journal-form"
            className="p-4 rounded-xl bg-space-light/80 border border-gold/30 space-y-3"
          >
            <div className="text-xs font-mono text-gold tracking-wider uppercase">Goresan Gulungan Memoar</div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-magic-light font-mono block">Judul Refleksi</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="misal: Kedamaian di Bawah Hujan"
                className="w-full bg-space-deep border border-space-bright rounded-lg p-2 text-sm text-vellum focus:outline-none focus:border-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-magic-light font-mono block">Rona Suasana</label>
                <select
                  value={newMood}
                  onChange={(e) => setNewMood(e.target.value)}
                  className="w-full bg-space-deep border border-space-bright rounded-lg p-2 text-xs text-vellum focus:outline-none focus:border-gold"
                >
                  {Object.keys(MOOD_CONFIGS).map((m) => (
                    <option key={m} value={m} className="bg-space-deep">
                      {MOOD_CONFIGS[m].icon} {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-magic-light font-mono block">Skor Ketenangan ({newScore}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                  className="w-full h-1 bg-space-deep rounded-lg appearance-none cursor-pointer accent-gold mt-3"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-magic-light font-mono block">Isi Perenungan</label>
              <textarea
                required
                rows={4}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Tuliskan keluh kesah, kegembiraan, atau apapun yang ada di benakmu..."
                className="w-full bg-space-deep border border-space-bright rounded-lg p-2 text-xs text-vellum focus:outline-none focus:border-gold resize-none ruled-textarea"
              />
            </div>

            <button
              type="submit"
              id="submit-journal-btn"
              className="w-full py-2 btn-shimmer text-midnight rounded-lg text-xs font-mono font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Simpan dalam Rasi Memoar
            </button>
          </form>
        )}

        {/* Scrollable Journal List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3" id="journal-history-list">
          {entries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center border border-dashed border-space-bright rounded-xl bg-space-light/10">
              <BookOpen className="w-12 h-12 text-space-bright mb-3 animate-float" />
              <div className="font-serif text-sm text-vellum font-semibold">Belum Ada Goresan Memoar</div>
              <p className="text-xs text-magic-light mt-1 max-w-[200px]">
                Gunakan menu di atas atau selesaikan misi batin untuk menorehkan Gulungan Memoar pertamamu.
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const moodInfo = MOOD_CONFIGS[entry.mood] || { icon: "🌿", label: "Tenang" };
              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  id={`journal-card-${entry.id}`}
                  className="torn-edge-bottom p-4 rounded-xl bg-space-light/30 border border-space-bright hover:border-gold/30 cursor-pointer transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between space-y-2 group mb-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-gold">
                        <Calendar className="w-3 h-3" /> {entry.date}
                      </div>
                      <h3 className="font-serif text-sm font-bold text-vellum group-hover:text-gold transition-colors">
                        {entry.title || "Memoar Tanpa Judul"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm px-1.5 py-0.5 bg-space-bright/80 rounded border border-space-bright">
                        {moodInfo.icon}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEntry(entry.id);
                        }}
                        id={`delete-journal-btn-${entry.id}`}
                        className="p-1 rounded bg-space-bright/30 hover:bg-rose-500/20 text-magic-light hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Hapus Memoar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-magic-light line-clamp-2 leading-relaxed">
                    {entry.text}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-gold/60 pt-1 border-t border-space-bright/20">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-gold" /> Ketenangan: {entry.moodScore}/10
                    </span>
                    <span className="text-gold group-hover:translate-x-1 transition-transform text-xs">
                      Buka Gulungan →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Starry Companion Chat Panel (7/12 cols) */}
      <div className="lg:col-span-7 flex flex-col bg-space-light/40 border border-space-bright rounded-2xl overflow-hidden h-full">
        {/* Chat Header */}
        <div className="px-4 py-3 bg-space-bright/30 border-b border-space-bright flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center border border-gold/30 animate-pulse">
              <span className="text-sm">🦌</span>
            </div>
            <div>
              <div className="font-serif text-sm font-bold text-vellum">Si Rusa Berbintang</div>
              <div className="text-[10px] font-mono text-gold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Pendengar Jiwamu
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSos(true)}
              className="px-2 py-1 flex items-center gap-1 rounded bg-rose-500/20 hover:bg-rose-500/40 text-[10px] font-mono text-rose-300 transition-all border border-rose-500/30 animate-pulse"
              title="Bantuan Psikolog Darurat"
            >
              <PhoneCall className="w-3 h-3" /> SOS Darurat
            </button>
            <button
              onClick={onResetChat}
              className="px-2 py-1 flex items-center gap-1 rounded bg-space-bright/40 hover:bg-space-bright/80 text-[10px] font-mono text-magic-light hover:text-gold transition-all"
              title="Mulai Ulang Obrolan"
            >
              <RotateCcw className="w-3 h-3" /> Reset Chat
            </button>
            <span className="text-[10px] font-mono text-magic-light ml-2">Lensa Pikiran:</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-space-bright/60 border border-space-bright font-serif text-vellum">
              {MOOD_CONFIGS[currentMood]?.icon || "🌿"} {currentMood}
            </span>
          </div>
        </div>

        {/* Message Streams */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages-scroll-container">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-space-bright/30 flex items-center justify-center animate-bounce">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-serif text-sm text-vellum font-semibold">Goreslah Bisikan Pertamamu</h3>
              <p className="text-xs text-magic-light max-w-sm leading-relaxed">
                Ceritakan kekhawatiranmu, rasa syukurmu, atau ketakutan batinmu hari ini. Si Rusa Berbintang akan mendengarkan dengan penuh empati puitis di bawah rasi bintang MindQuest.
              </p>
            </div>
          ) : (
            chatHistory.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed border ${
                      isUser
                        ? "bg-space-bright/80 border-space-bright text-vellum rounded-tr-none"
                        : "bg-gradient-to-br from-vellum to-vellum-dark border-vellum-dark text-space-deep shadow-md shadow-black/10 rounded-tl-none font-serif font-medium"
                    }`}
                  >
                    {!isUser && (
                      <div className="text-[9px] font-mono text-gold-dark uppercase tracking-widest mb-1">
                        ✦ Si Rusa Berbintang
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <div className={`text-[8px] text-right mt-1 font-mono ${isUser ? "text-magic-light/50" : "text-space-deep/60"}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Twinkling Loading Indicator */}
          {isChatLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="max-w-[85%] bg-gradient-to-br from-vellum to-vellum-dark border border-vellum-dark text-space-deep rounded-2xl rounded-tl-none p-3.5 text-xs">
                <div className="text-[9px] font-mono text-gold-dark uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-spin text-gold-dark" /> 
                  {isCrisisLoading 
                    ? "Si Rusa hadir di sini, mendengarkanmu dengan penuh perhatian..." 
                    : "Rusa Berbintang sedang mengamati bintang..."}
                </div>
                <div className="flex gap-1.5 py-1 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-space-deep animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-space-deep animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-space-deep animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendChat} className="p-3 bg-space-bright/20 border-t border-space-bright flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isChatLoading}
            placeholder="Ketik rahasia hati Penjelajah di Hutan Jiwa..."
            className="flex-1 bg-space-deep border border-space-bright rounded-xl px-4 py-2.5 text-xs text-vellum focus:outline-none focus:border-gold placeholder:text-magic-light/35"
          />
          <button
            type="submit"
            id="send-chat-btn"
            disabled={!chatInput.trim() || isChatLoading}
            className="w-10 h-10 rounded-xl bg-gold hover:bg-gold-dark text-midnight flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:bg-gold/40"
          >
            <Send className="w-4 h-4 fill-midnight" />
          </button>
        </form>
      </div>

      {/* FULLSCREEN VELUM MEMOIR OVERLAY MODAL */}
      {selectedEntry && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          id="journal-overlay-modal"
          onClick={() => setSelectedEntry(null)}
        >
          <div 
            className="vellum-card max-w-lg w-full rounded-2xl overflow-hidden relative border-4 border-double border-vellum-dark/40 shadow-2xl p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ornate corners */}
            <div className="absolute top-2 left-2 text-vellum-dark text-lg select-none">✥</div>
            <div className="absolute top-2 right-2 text-vellum-dark text-lg select-none">✥</div>
            <div className="absolute bottom-2 left-2 text-vellum-dark text-lg select-none">✥</div>
            <div className="absolute bottom-2 right-2 text-vellum-dark text-lg select-none">✥</div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedEntry(null)}
              id="close-journal-overlay-btn"
              className="absolute top-4 right-4 p-1.5 rounded-full bg-vellum-dark/20 text-space-deep hover:bg-vellum-dark/40 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content of scroll */}
            <div className="text-center space-y-2 pb-4 border-b border-vellum-dark/30">
              <div className="text-xs font-mono text-gold-dark uppercase tracking-widest flex justify-center items-center gap-1">
                ✦ GULUNGAN MEMOAR KUNO ✦
              </div>
              <h2 className="font-serif text-2xl font-bold text-space-deep tracking-wide leading-tight mt-1">
                {selectedEntry.title || "Memoar Tanpa Judul"}
              </h2>
              <div className="text-[11px] font-mono text-space-deep/60 flex justify-center items-center gap-3">
                <span>⏱️ {selectedEntry.date}</span>
                <span>•</span>
                <span>{MOOD_CONFIGS[selectedEntry.mood]?.icon || "🌿"} Suasana: {selectedEntry.mood} ({selectedEntry.moodScore}/10)</span>
              </div>
            </div>

            <div className="font-serif italic text-base text-space-deep/90 leading-relaxed max-h-60 overflow-y-auto pr-2 px-2 text-justify">
              "{selectedEntry.text}"
            </div>

            {devMode && selectedEntry.rawCiphertext && (
              <div className="mt-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-left">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> BUKTI ENKRIPSI (DARI FIRESTORE)
                  </div>
                  <button 
                    onClick={() => {
                      setTestCipher(selectedEntry.rawCiphertext);
                      setTestIv(selectedEntry.rawIv || "");
                      setTestResult("");
                      setTestError("");
                      setShowTestModal(true);
                    }}
                    className="text-[9px] px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                  >
                    Uji Dekripsi Manual
                  </button>
                </div>
                <div className="text-[9px] font-mono text-emerald-800 break-all max-h-32 overflow-y-auto p-2 bg-emerald-500/20 rounded">
                  <strong>IV:</strong> {selectedEntry.rawIv || "N/A"}<br/><br/>
                  <strong>Cipher:</strong> {selectedEntry.rawCiphertext}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-vellum-dark/30 text-center space-y-2">
              <div className="inline-flex items-center gap-1 text-[10px] font-mono text-gold-dark uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> BINTANG REFLEKSI
              </div>
              <p className="text-xs text-space-deep/75 italic leading-relaxed max-w-sm mx-auto">
                {selectedEntry.reflection || "Setiap kata yang tersimpan adalah benih kedamaian di masa depan. Rusa Berbintang senantiasa menjaga lembaran ini untukmu."}
              </p>
            </div>

            <button
              onClick={() => setSelectedEntry(null)}
              id="close-journal-overlay-bottom-btn"
              className="w-full py-2.5 bg-space-deep hover:bg-space-bright text-vellum rounded-xl text-xs font-mono font-bold transition-all mt-4"
            >
              Tutup Gulungan Memoar
            </button>
          </div>
        </div>
      )}

      {/* SCIENTIFIC TRANSPARENCY MODAL */}
      {showInfo && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowInfo(false)}
        >
          <div 
            className="bg-space-light/95 border border-gold/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b border-space-bright pb-2">
              <h2 className="font-serif text-lg font-bold text-vellum flex items-center gap-2">
                <Info className="w-5 h-5 text-gold" /> Transparansi Ilmiah
              </h2>
              <button onClick={() => setShowInfo(false)} className="text-magic-light hover:text-rose-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-sm text-magic-light leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>
                <b>Jurnal & Batin</b> dirancang berdasarkan prinsip terapi naratif dan <i>Cognitive Behavioral Therapy (CBT)</i>.
              </p>
              <p>
                Analisis emosi oleh AI dipetakan secara khusus menggunakan landasan <b>Plutchik's Wheel of Emotions (1980)</b>. Untuk menjaga stabilitas antarmuka, spektrum emosi Plutchik yang luas dikerucutkan ke dalam 4 Rona Suasana Hati utama:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><b>Senang:</b> Turunan dari <i>Joy/Ecstasy</i> (Kegembiraan)</li>
                <li><b>Tenang:</b> Turunan dari <i>Serenity/Trust</i> (Kedamaian/Kepercayaan)</li>
                <li><b>Lelah:</b> Turunan dari <i>Sadness/Pensiveness</i> (Kesedihan/Kemurungan)</li>
                <li><b>Gelisah:</b> Turunan dari <i>Fear/Apprehension</i> (Ketakutan/Kecemasan)</li>
              </ul>
              <p>
                Melalui klasifikasi terstruktur ini, Si Rusa Berbintang dapat mendeteksi pola emosi Penjelajah secara akurat dari waktu ke waktu dan merekomendasikan intervensi (Misi Batin) yang paling tepat untuk mengembalikan ekuilibrium psikologis.
              </p>
            </div>
            <button 
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full py-2 bg-space-bright/80 hover:bg-space-bright rounded-xl text-white font-mono font-bold transition-all text-sm border border-space-bright"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* SOS MODAL */}
      {showSos && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowSos(false)}
        >
          <div 
            className="bg-space-light/95 border border-rose-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b border-space-bright pb-2">
              <h2 className="font-serif text-lg font-bold text-rose-400 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Bantuan Profesional
              </h2>
              <button onClick={() => setShowSos(false)} className="text-magic-light hover:text-rose-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-sm text-magic-light leading-relaxed">
              <p>
                Jika beban di jiwamu terasa terlalu berat untuk dipikul sendirian, jangan ragu untuk mencari bantuan profesional. Kamu tidak sendirian.
              </p>
              <div className="space-y-3 mt-4">
                <a 
                  href="tel:119" 
                  className="flex items-center gap-3 p-3 rounded-xl bg-space-bright/30 hover:bg-space-bright/60 border border-space-bright transition-all"
                >
                  <PhoneCall className="w-5 h-5 text-rose-400" />
                  <div>
                    <div className="font-bold text-vellum">Hotline Kemenkes RI (119 ext 8)</div>
                    <div className="text-[10px] text-magic-light">Layanan Sejiwa (24 Jam)</div>
                  </div>
                </a>
                <a 
                  href="https://wa.me/628113855472" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-space-bright/30 hover:bg-space-bright/60 border border-space-bright transition-all"
                >
                  <Heart className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-bold text-vellum">Yayasan Pulih</div>
                    <div className="text-[10px] text-magic-light">Konseling Psikologis (WhatsApp)</div>
                  </div>
                </a>

                {/* Bagikan ke Psikolog (Sistem Chat) */}
                <div className="mt-6 border-t border-space-bright pt-4">
                  <p className="text-[11px] text-magic-light mb-3 leading-relaxed">
                    Ingin berbicara langsung dengan psikolog secara aman dan 100% anonim di dalam aplikasi?
                  </p>
                  
                  <button
                    onClick={async () => {
                      setIsRequestingChat(true)
                      const chatId = await onRequestChat()
                      if (chatId) {
                        setActiveChatId(chatId)
                        setShowSos(false) // Tutup modal SOS, buka chat
                      }
                      setIsRequestingChat(false)
                    }}
                    disabled={isRequestingChat || activeChatId}
                    className="w-full py-2.5 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 rounded-xl font-bold text-xs transition-all border border-indigo-500/30 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    {isRequestingChat ? 'Menghubungkan...' : 'Mulai Sesi Chat Anonim'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CHAT OVERLAY */}
      {activeChatId && (
        <UserLiveChat 
          chatId={activeChatId} 
          onClose={() => setActiveChatId(null)} 
          currentUser={currentUser}
        />
      )}
      
      {/* MANUAL DECRYPTION TEST MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-space-deep border border-emerald-500/30 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowTestModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-space-bright/20 text-magic-light hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-emerald-400 font-mono font-bold text-lg mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5" /> ALAT UJI DEKRIPSI MANDIRI (LIVE)
            </h3>
            <p className="text-xs text-emerald-200/70 font-mono mb-4">
              Silakan salin-tempel (copy-paste) `ciphertext` dan `iv` mentah dari Google Firebase Console untuk membuktikan proses dekripsi berjalan langsung di browser ini.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-emerald-400 font-mono block mb-1">Initialization Vector (IV)</label>
                <input
                  type="text"
                  value={testIv}
                  onChange={(e) => setTestIv(e.target.value)}
                  className="w-full bg-space-dark border border-emerald-500/30 rounded p-2 text-xs text-white font-mono focus:border-emerald-400 outline-none"
                  placeholder="Paste string base64 IV..."
                />
              </div>
              <div>
                <label className="text-[10px] text-emerald-400 font-mono block mb-1">Ciphertext Base64</label>
                <textarea
                  value={testCipher}
                  onChange={(e) => setTestCipher(e.target.value)}
                  rows={4}
                  className="w-full bg-space-dark border border-emerald-500/30 rounded p-2 text-xs text-white font-mono focus:border-emerald-400 outline-none resize-none"
                  placeholder="Paste string base64 ciphertext..."
                />
              </div>
              
              <button
                onClick={handleManualDecrypt}
                disabled={!testIv || !testCipher}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded transition-colors disabled:opacity-50"
              >
                🔓 PROSES DEKRIPSI LOKAL
              </button>

              {testError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded text-rose-300 text-xs font-mono">
                  {testError}
                </div>
              )}

              {testResult && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded text-emerald-100 text-xs font-mono">
                  <div className="text-[10px] text-emerald-400 mb-1">HASIL DEKRIPSI (Teks Terbaca):</div>
                  <div className="break-all whitespace-pre-wrap">{testResult}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
