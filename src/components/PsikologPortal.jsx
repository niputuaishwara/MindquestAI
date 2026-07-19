import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { getJournalEntries } from '@/services/firestoreService';
// import { getOrCreateDataKey } from '@/utils/keyManager';
import { ArrowLeft, Search, Shield, BookOpen, Clock, Activity, MessageSquare, Send, UserCheck, Loader } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function PsikologPortal({ onBack, currentUser, profile }) {
  const [waitingChats, setWaitingChats] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  
  // Patient Data (Journal)
  const [patientData, setPatientData] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  // Chat Data
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Listen for waiting and active chats
  useEffect(() => {
    const qWaiting = query(collection(db, 'chats'), where('status', '==', 'waiting'));
    const unsubWaiting = onSnapshot(qWaiting, (snapshot) => {
      setWaitingChats(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error("Error listening to waiting chats:", err);
    });

    const qActive = query(
      collection(db, 'chats'), 
      where('status', '==', 'active'),
      where('psychologistId', '==', currentUser.uid)
    );
    const unsubActive = onSnapshot(qActive, (snapshot) => {
      const actives = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setActiveChats(actives);
      // Update selected chat status if it changed (e.g. user ended it, though user updates status to 'completed' so it will disappear from this list)
    }, (err) => {
      console.error("Error listening to active chats:", err);
    });

    return () => {
      unsubWaiting();
      unsubActive();
    };
  }, [currentUser.uid]);

  // Handle Chat Selection
  useEffect(() => {
    if (!selectedChat) {
      setPatientData(null);
      setMessages([]);
      return;
    }

    // Jurnal dilindungi enkripsi Zero-Knowledge, Psikolog tidak dapat mengakses riwayat
    setPatientData(null);

    // Listen to messages for the selected chat
    const qMsgs = query(collection(db, 'chats', selectedChat.id, 'messages'), orderBy('createdAt', 'asc'));
    const unsubMsgs = onSnapshot(qMsgs, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubMsgs();
  }, [selectedChat]);

  const handleAcceptChat = async (chat) => {
    try {
      await updateDoc(doc(db, 'chats', chat.id), {
        status: 'active',
        psychologistId: currentUser.uid,
        psychologistName: profile?.pseudonym || currentUser.email || 'Psikolog'
      });
      setSelectedChat({ ...chat, status: 'active', psychologistId: currentUser.uid });
    } catch (err) {
      console.error("Gagal menerima chat", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;

    const text = input.trim();
    setInput('');

    try {
      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
        text,
        senderId: currentUser.uid,
        senderRole: 'psychologist',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Gagal mengirim pesan", err);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-midnight text-vellum font-sans p-4 lg:p-8 flex flex-col relative overflow-hidden">
      {/* Background Starry details similar to JurnalView */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-space-light/50 to-transparent pointer-events-none z-0"></div>
      
      <header className="flex items-center justify-between mb-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-space-deep border border-space-bright rounded-xl hover:bg-space-light transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-magic-light group-hover:text-gold transition-colors" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-vellum flex items-center gap-3">
              <Shield className="w-6 h-6 text-gold" />
              Portal Konseling Hutan Jiwa
            </h1>
            <p className="text-xs lg:text-sm text-magic-light/70 font-mono tracking-wide mt-1">Sistem Rekam Medis Bintang & Anonimitas Penuh (Zero-Knowledge)</p>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* PANEL KIRI: Daftar Pasien */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0 bg-space-light/40 backdrop-blur-md rounded-2xl border border-space-bright overflow-hidden relative z-10 shadow-2xl">
          <div className="p-4 bg-space-deep/80 border-b border-space-bright">
            <h3 className="font-bold text-gold flex items-center gap-2 font-serif text-sm tracking-wide">
              <Activity className="w-4 h-4" /> Antrean Penjelajah
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <div>
              <h4 className="text-[10px] font-mono font-bold text-magic-light/60 uppercase tracking-widest mb-3">Sedang Berlangsung</h4>
              {activeChats.length === 0 ? (
                <div className="text-xs text-magic-light/40 italic font-serif">Tidak ada sesi aktif di konstelasi ini.</div>
              ) : (
                activeChats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full text-left p-3.5 rounded-xl mb-2 transition-all duration-300 border ${
                      selectedChat?.id === chat.id 
                        ? 'bg-space-bright border-gold shadow-[0_0_15px_rgba(242,202,80,0.15)] text-gold' 
                        : 'bg-space-deep/50 hover:bg-space-bright border-space-bright text-vellum hover:border-gold/30'
                    }`}
                  >
                    <div className="font-bold text-sm font-serif">{chat.userPseudonym}</div>
                    <div className={`text-[10px] font-mono mt-1 ${selectedChat?.id === chat.id ? 'text-gold/70' : 'text-magic-light/50'}`}>
                      Sesi Aktif
                    </div>
                  </button>
                ))
              )}
            </div>

            <div>
              <h4 className="text-[10px] font-mono font-bold text-magic-light/60 uppercase tracking-widest mb-3">Meminta Bantuan Bintang</h4>
              {waitingChats.length === 0 ? (
                <div className="text-xs text-magic-light/40 italic font-serif">Antrean kosong. Hutan terasa damai.</div>
              ) : (
                waitingChats.map(chat => (
                  <div key={chat.id} className="p-4 bg-gold/5 border border-gold/20 rounded-xl mb-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gold/10 blur-2xl rounded-full -mr-8 -mt-8"></div>
                    <div className="font-bold text-sm text-gold mb-3 font-serif relative z-10">{chat.userPseudonym}</div>
                    <button
                      onClick={() => handleAcceptChat(chat)}
                      className="w-full py-2 bg-gold hover:bg-gold-dark text-midnight text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg relative z-10 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Terima Sesi
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* PANEL KANAN: Detail & Chat */}
        <div className="lg:col-span-9 flex flex-col min-h-0 bg-space-light/40 backdrop-blur-md rounded-2xl border border-space-bright overflow-hidden relative z-10 shadow-2xl">
          {!selectedChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-magic-light/50 p-8 text-center">
              <MessageSquare className="w-16 h-16 mb-6 text-space-bright animate-float" />
              <p className="font-serif text-lg text-vellum mb-2">Belum Ada Sesi yang Dipilih</p>
              <p className="text-sm">Pilih penjelajah dari antrean untuk mulai memandu mereka di Hutan Jiwa.</p>
            </div>
          ) : selectedChat.status === 'waiting' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-magic-light/50 p-8 text-center">
              <Shield className="w-12 h-12 mb-4 text-gold/50" />
              <p className="font-serif text-lg text-gold mb-2">Ruang Tunggu</p>
              <p className="text-sm">Terima permintaan dari <strong>{selectedChat.userPseudonym}</strong> terlebih dahulu untuk membuka kunci sesi ini.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col lg:flex-row min-h-0">
              
              {/* KOLOM CHAT */}
              <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-space-bright min-h-[400px] lg:min-h-0">
                <div className="p-4 border-b border-space-bright bg-space-deep/80 shrink-0">
                  <h3 className="font-bold text-vellum flex items-center gap-2 font-serif tracking-wide text-sm">
                    <MessageSquare className="w-4 h-4 text-gold" /> Obrolan Bintang: <span className="text-gold">{selectedChat.userPseudonym}</span>
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-space-deep/30 custom-scrollbar">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.uid;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div 
                          className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                            isMe 
                              ? 'bg-space-bright border border-space-light text-vellum rounded-tr-sm' 
                              : 'bg-gold/10 border border-gold/20 text-vellum rounded-tl-sm shadow-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] font-mono text-magic-light/40 mt-1 mx-1">
                          {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : ''}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 bg-space-deep/80 border-t border-space-bright flex gap-3 shrink-0">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Kirim panduan untuk penjelajah..."
                    className="flex-1 px-4 py-2.5 bg-midnight border border-space-bright focus:border-gold focus:ring-1 focus:ring-gold/50 rounded-xl transition-all text-sm text-vellum placeholder:text-magic-light/30 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-3 bg-gold text-midnight rounded-xl hover:bg-gold-dark disabled:opacity-30 transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 fill-midnight" />
                  </button>
                </form>
              </div>

              {/* KOLOM JURNAL */}
              <div className="w-full lg:w-[45%] flex flex-col min-h-0 bg-space-deep/50">
                <div className="p-4 border-b border-space-bright bg-space-deep/80 shrink-0">
                  <h3 className="font-bold text-vellum flex items-center gap-2 font-serif tracking-wide text-sm">
                    <BookOpen className="w-4 h-4 text-gold" /> Jurnal & Tren Batin
                  </h3>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-space-deep/30">
                  <Shield className="w-16 h-16 mb-6 text-gold/50" />
                  <p className="font-serif text-lg text-vellum mb-2">Riwayat Terlindungi (Zero-Knowledge)</p>
                  <p className="text-sm text-magic-light/70">
                    Berdasarkan standar privasi ketat, psikolog hanya memiliki akses ke percakapan <i>live chat</i> saat ini. Riwayat jurnal masa lalu sepenuhnya dienkripsi secara lokal di perangkat klien dan tidak dapat dibaca oleh siapa pun.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
