import React, { useState } from 'react';
import { Settings, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { signOutUser } from '../services/authService';

export const SettingsView = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'HAPUS') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const functions = getFunctions();
      const deleteUserAccount = httpsCallable(functions, 'deleteUserAccount');
      
      const result = await deleteUserAccount();
      
      if (result.data.success) {
        setSuccess(true);
        // Clear local storage completely
        localStorage.clear();
        
        // Wait a moment for user to read success message before signing out
        setTimeout(async () => {
          await signOutUser();
        }, 2000);
      } else {
        setError('Gagal menghapus akun. Silakan coba lagi.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Terjadi kesalahan saat menghapus akun.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto" id="settings-view-container">
      {/* Header */}
      <div className="bg-space-light/50 rounded-2xl p-6 border border-space-bright flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-space-bright/30 flex items-center justify-center border border-space-bright">
          <Settings className="w-6 h-6 text-vellum" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-vellum">Pengaturan</h2>
          <p className="text-sm text-magic-light">Kelola privasi dan keamanan akun Penjelajah Anda.</p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-950/20 rounded-2xl p-6 border border-red-900/50 space-y-6">
        <div>
          <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-red-500 mb-2">
            <AlertTriangle className="w-5 h-5" />
            Zona Berbahaya
          </h3>
          <p className="text-sm text-red-300/80">
            Tindakan di area ini bersifat permanen dan tidak dapat dibatalkan.
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-900/30 border border-emerald-800/50 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <div>
              <p className="font-bold text-emerald-400">Akun Berhasil Dihapus</p>
              <p className="text-sm text-emerald-300/80">Selamat tinggal, Penjelajah. Logging out...</p>
            </div>
          </div>
        ) : (
          <div className="bg-space-deep/50 rounded-xl p-5 border border-red-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-vellum">Hapus Akun Permanen</h4>
              <p className="text-xs text-magic-light mt-1 max-w-md">
                Menghapus seluruh entri jurnal, sesi obrolan, skor, dan identitas Anda secara permanen dari server. 
                Data yang dienkripsi tidak akan dapat dipulihkan.
              </p>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="shrink-0 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all"
            >
              Hapus Akun
            </button>
          </div>
        )}

        {/* 2-Step Confirmation */}
        {showConfirm && !success && (
          <div className="mt-4 p-5 bg-red-950/40 border border-red-900/60 rounded-xl space-y-4 animate-fadeIn">
            <div className="space-y-2">
              <p className="text-sm text-red-200">
                Apakah Anda benar-benar yakin? Ketik <strong>HAPUS</strong> untuk mengonfirmasi.
              </p>
              {error && (
                <div className="text-xs text-red-400 bg-red-950/50 p-2 rounded border border-red-900">
                  {error}
                </div>
              )}
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="HAPUS"
                className="w-full px-4 py-3 bg-space-deep border border-red-900/50 rounded-lg text-vellum focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono tracking-widest text-center"
                disabled={loading}
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmText('');
                  setError(null);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-space-bright/30 hover:bg-space-bright/50 text-vellum text-sm rounded-lg transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'HAPUS' || loading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:text-red-300/50 text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-pulse">Menghapus...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Ya, Hapus Permanen
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
