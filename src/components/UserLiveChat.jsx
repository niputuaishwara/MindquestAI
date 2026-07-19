import React, { useState, useEffect, useRef } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { X, Send, User, ShieldAlert, Loader } from 'lucide-react';

export const UserLiveChat = ({ chatId, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatStatus, setChatStatus] = useState('waiting');
  const [psychologistName, setPsychologistName] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Listen to chat status
    const chatRef = doc(db, 'chats', chatId);
    const unsubChat = onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setChatStatus(data.status);
        if (data.psychologistName) {
          setPsychologistName(data.psychologistName);
        }
      }
    });

    // Listen to messages
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    const unsubMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => {
      unsubChat();
      unsubMessages();
    };
  }, [chatId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input.trim();
    setInput('');

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text,
        senderId: currentUser.uid,
        senderRole: 'user',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
    }
  };

  const handleEndChat = async () => {
    if (window.confirm("Akhiri sesi obrolan ini? PIN sementara Anda akan dihapus dari sistem.")) {
      try {
        await updateDoc(doc(db, 'chats', chatId), {
          status: 'completed',
          encryptedPin: null // Hapus PIN demi keamanan
        });
        onClose();
      } catch (err) {
        console.error("Gagal mengakhiri obrolan:", err);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> 
              Sesi Konsultasi Anonim
            </h3>
            <p className="text-indigo-200 text-xs mt-0.5">
              {chatStatus === 'waiting' ? 'Mencari psikolog yang tersedia...' : `Terhubung dengan ${psychologistName}`}
            </p>
          </div>
          <button 
            onClick={handleEndChat}
            className="p-2 bg-indigo-700/50 hover:bg-indigo-700 rounded-lg transition-colors text-sm font-medium"
          >
            Akhiri Sesi
          </button>
        </div>

        {/* Status Banner */}
        {chatStatus === 'waiting' && (
          <div className="bg-indigo-50 border-b border-indigo-100 p-3 flex items-center justify-center gap-2 text-indigo-700 text-sm font-medium shrink-0">
            <Loader className="w-4 h-4 animate-spin" />
            Harap tunggu. Psikolog akan segera bergabung...
          </div>
        )}
        {chatStatus === 'completed' && (
          <div className="bg-red-50 border-b border-red-100 p-3 text-center text-red-700 text-sm font-medium shrink-0">
            Sesi obrolan ini telah diakhiri.
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          <div className="text-center text-xs text-slate-400 mb-6 font-medium bg-slate-100 py-2 rounded-lg">
            Sesi ini bersifat anonim dan diamankan dengan enkripsi *Zero-Knowledge*.
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.uid;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <span className="text-[10px] text-slate-500 mb-1 ml-1 font-bold">{psychologistName || 'Psikolog'}</span>}
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 mx-1">
                  {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : ''}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={chatStatus !== 'active'}
            placeholder={chatStatus === 'waiting' ? "Menunggu psikolog..." : chatStatus === 'completed' ? "Sesi berakhir" : "Ketik pesan..."}
            className="flex-1 px-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl transition-all disabled:opacity-50 text-slate-800"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatStatus !== 'active'}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
};
