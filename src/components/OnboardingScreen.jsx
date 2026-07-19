import React, { useState, useEffect } from 'react'
import { registerPseudonymous, loginPseudonymous, loginWithEmail, signOutUser } from '@/services/authService'
import { Lock, KeyRound, ArrowLeft, ShieldAlert, UserCircle, Shield, Mail } from 'lucide-react'

const bgLogin = '/bg-login.png'
const MAX_ATTEMPTS = 3
const LOCKOUT_DURATION = 60 // in seconds

export default function OnboardingScreen({ currentUser, onPinSet, externalError, onBack }) {
  const isReturningUser = !!currentUser
  
  // Phase 1: Pseudonymous Auth
  const [isLoginMode, setIsLoginMode] = useState(false)
  const [isProfessionalMode, setIsProfessionalMode] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  // Phase 2: PIN
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  
  // Rate limiting states
  const [attempts, setAttempts] = useState(() => parseInt(localStorage.getItem('mindquest_pin_attempts') || '0'))
  const [lockoutUntil, setLockoutUntil] = useState(() => parseInt(localStorage.getItem('mindquest_pin_lockout') || '0'))
  const [lockoutTimer, setLockoutTimer] = useState(0)

  // Timer for lockout countdown
  useEffect(() => {
    let interval;
    if (lockoutUntil > Date.now()) {
      interval = setInterval(() => {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutUntil(0);
          setAttempts(0);
          localStorage.removeItem('mindquest_pin_attempts');
          localStorage.removeItem('mindquest_pin_lockout');
        } else {
          setLockoutTimer(remaining);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Handle external errors (Wrong PIN from crypto service)
  useEffect(() => {
    if (externalError && isReturningUser) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('mindquest_pin_attempts', newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        const newLockout = Date.now() + (LOCKOUT_DURATION * 1000);
        setLockoutUntil(newLockout);
        localStorage.setItem('mindquest_pin_lockout', newLockout.toString());
      }
    }
  }, [externalError, isReturningUser]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    
    setLoading(true)
    try {
      if (isProfessionalMode) {
        await loginWithEmail(username, password) // 'username' di sini adalah email
      } else {
        // Validasi username alphanumeric tanpa spasi
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          setLocalError('Username hanya boleh berisi huruf, angka, dan underscore (_)')
          setLoading(false)
          return
        }

        if (isLoginMode) {
          await loginPseudonymous(username, password)
        } else {
          await registerPseudonymous(username, password)
        }
      }
      // On success, App.jsx will detect currentUser and route accordingly
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        setLocalError('Username sudah dipakai, coba yang lain.')
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setLocalError('Username atau Password salah.')
      } else {
        setLocalError('Gagal terhubung ke alam MindQuest.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPin = async (e) => {
    e.preventDefault()
    setLocalError('')
    
    if (lockoutUntil > Date.now()) {
      return; // prevent submit if locked
    }
    
    if (pin.length < 6) {
      setLocalError('PIN harus minimal 6 karakter.')
      return
    }

    // Since user is already authenticated (Phase 1), just pass the PIN
    onPinSet(pin)
  }

  const isLockedOut = lockoutUntil > Date.now();
  const displayError = localError || (externalError && attempts > 0 ? `${externalError} (Percobaan gagal: ${attempts}/${MAX_ATTEMPTS})` : externalError);

  return (
    <div className="flex min-h-[100dvh] w-full bg-midnight font-sans">
      
      {/* Left Side: Background & Branding */}
      <div className="hidden lg:flex flex-col relative w-1/2 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-midnight/80 via-midnight/30 to-transparent" />
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgLogin})` }}
        />
        <div className="relative z-20 flex flex-col justify-center h-full p-16">
          <h1 className="font-serif text-5xl xl:text-6xl text-gold font-bold mb-4 drop-shadow-md">
            MindQuest
          </h1>
          <h2 className="text-3xl text-white font-medium drop-shadow-md leading-tight">
            Buku Harian Petualanganmu
          </h2>
          <p className="text-xl text-white/70 mt-2 font-light drop-shadow-sm">
            Ruang aman untuk jiwamu.
          </p>
        </div>
      </div>

      {/* Right Side: Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div 
          className="lg:hidden absolute inset-0 z-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${bgLogin})` }}
        />
        
        <div className="relative z-10 w-full max-w-[440px] bg-vellum/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
          
          {/* Tombol Kembali ke Splash Screen */}
          {onBack && (
            <button
              id="onboarding-back-btn"
              onClick={onBack}
              className="absolute top-5 left-5 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors group"
              aria-label="Kembali ke halaman utama"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Kembali</span>
            </button>
          )}

          {displayError && !isLockedOut && (
            <div className="mb-6 p-3 bg-red-100/80 border border-red-200 text-red-700 rounded-xl text-sm animate-pulse text-center font-medium">
              {displayError}
            </div>
          )}

          {isLockedOut && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 text-red-800 rounded-xl text-center shadow-sm">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <p className="font-bold text-lg mb-1">Akses Dikunci Sementara</p>
              <p className="text-sm">Terlalu banyak percobaan PIN gagal. Silakan coba lagi dalam:</p>
              <p className="text-2xl font-mono mt-2 font-bold">{lockoutTimer} detik</p>
            </div>
          )}

          {/* PHASE 1: PSEUDONYMOUS AUTH */}
          {!isReturningUser ? (
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <div className="text-center mb-8">
                <div className={`mx-auto w-16 h-16 ${isProfessionalMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-primary/10 border-primary/20'} border rounded-2xl flex items-center justify-center mb-4`}>
                  {isProfessionalMode ? <Shield className="w-8 h-8 text-indigo-600" /> : <UserCircle className="w-8 h-8 text-primary" />}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#3d3d3d] mb-2">
                  {isProfessionalMode ? 'Portal Medis' : (isLoginMode ? 'Masuk' : 'Buat Identitas Samaran')}
                </h2>
                <p className="text-sm text-gray-600">
                  {isProfessionalMode 
                    ? 'Masuk dengan kredensial tenaga medis Anda.' 
                    : (isLoginMode ? 'Masukkan username samaranmu untuk memulihkan jurnal.' : 'Aplikasi ini 100% anonim. Buat username acak agar data tidak hilang saat ganti perangkat.')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isProfessionalMode ? 'Email' : 'Username Samaran'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      {isProfessionalMode ? <Mail className="h-5 w-5 text-gray-400" /> : <UserCircle className="h-5 w-5 text-gray-400" />}
                    </div>
                    <input
                      type={isProfessionalMode ? "email" : "text"}
                      required
                      placeholder={isProfessionalMode ? "dr.ahmad@example.com" : "rusa_bintang_99"}
                      className={`block w-full pl-12 pr-4 py-3 bg-white/70 border-0 rounded-xl focus:ring-2 ${isProfessionalMode ? 'focus:ring-indigo-500' : 'focus:ring-primary'} focus:bg-white text-gray-800 transition-all shadow-sm`}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    {(!isLoginMode && !isProfessionalMode) && <span className="text-[10px] text-gray-500 font-medium">Min. 6 Karakter</span>}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder={(!isLoginMode && !isProfessionalMode) ? "Minimal 6 karakter..." : "••••••••"}
                      className={`block w-full pl-12 pr-4 py-3 bg-white/70 border-0 rounded-xl focus:ring-2 ${isProfessionalMode ? 'focus:ring-indigo-500' : 'focus:ring-primary'} focus:bg-white text-gray-800 transition-all shadow-sm`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-4 ${isProfessionalMode ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30' : 'bg-primary hover:bg-primary/90 shadow-primary/30'} disabled:bg-gray-400 text-white rounded-xl font-bold text-base shadow-lg transition-all duration-300 transform active:scale-[0.98] flex justify-center items-center gap-2`}
              >
                {loading ? 'Menghubungkan...' : (isProfessionalMode ? 'Masuk sebagai Tenaga Medis' : (isLoginMode ? 'Masuk' : 'Daftar Samaran'))}
              </button>

              <div className="flex flex-col items-center gap-2 mt-4">
                {!isProfessionalMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(!isLoginMode)
                      setLocalError('')
                    }}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    {isLoginMode ? 'Belum punya akun? Buat Samaran Baru' : 'Sudah punya identitas? Masuk'}
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setIsProfessionalMode(!isProfessionalMode)
                    setUsername('')
                    setPassword('')
                    setLocalError('')
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors mt-2"
                >
                  {isProfessionalMode ? 'Kembali ke Akses Pengguna' : 'Masuk sebagai Psikolog / Admin'}
                </button>
              </div>
            </form>
          ) : (
            /* PHASE 2: PIN AUTHENTICATION */
            <form onSubmit={handleSubmitPin} className="space-y-6">
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <KeyRound className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#3d3d3d] mb-2">
                  Kunci Enkripsi Anda
                </h2>
                <p className="text-sm text-gray-600">
                  {attempts > 0 ? 'Masukkan PIN dengan benar untuk membuka dekripsi.' : 'Masukkan PIN kriptografi Anda untuk membongkar jurnal luring.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">
                  PIN Kriptografi (Min. 6 Karakter)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••"
                    className="block w-full pl-12 pr-4 py-4 bg-white/70 border-0 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800 text-center text-xl tracking-[0.5em] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    autoFocus
                    disabled={loading || isLockedOut}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isLockedOut}
                className="w-full py-4 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white rounded-xl font-bold text-base shadow-lg shadow-amber-500/30 transition-all duration-300 transform active:scale-[0.98] flex justify-center items-center gap-2"
              >
                Buka Jurnal
              </button>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-left space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wide">
                  <span>🔒</span> Zero-Knowledge Privacy
                </div>
                <p className="text-[12px] text-amber-800 leading-relaxed text-justify">
                  Sistem kami tidak menyimpan PIN ini di server. Jika PIN Anda hilang, identitas Anda tetap anonim, namun jurnal Anda secara matematis <strong>tidak dapat dipulihkan</strong> meski Anda mengingat username.
                </p>
              </div>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={async () => {
                    await signOutUser()
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  Ganti Akun / Logout
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}

