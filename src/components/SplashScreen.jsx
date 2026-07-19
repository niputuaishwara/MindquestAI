// src/components/SplashScreen.jsx
import React, { useState, useEffect } from 'react'

const bgImg = '/bg-splash.png'

const TITLE_LETTERS = ['M','i','n','d','Q','u','e','s','t']
const LETTER_DELAYS = [0, 0.08, 0.16, 0.24, 0.38, 0.47, 0.55, 0.63, 0.72]

const PARTICLES = [
  { size: 3, top: '12%',  left: '8%',   delay: 0,    dur: 11, opacity: 0.6 },
  { size: 2, top: '23%',  left: '88%',  delay: 1.4,  dur: 14, opacity: 0.4 },
  { size: 4, top: '67%',  left: '5%',   delay: 2.8,  dur: 9,  opacity: 0.5 },
  { size: 2, top: '78%',  left: '92%',  delay: 0.7,  dur: 16, opacity: 0.35},
  { size: 3, top: '41%',  left: '94%',  delay: 3.2,  dur: 12, opacity: 0.55},
  { size: 2, top: '55%',  left: '3%',   delay: 1.9,  dur: 13, opacity: 0.4 },
  { size: 5, top: '85%',  left: '45%',  delay: 0.4,  dur: 10, opacity: 0.3 },
  { size: 2, top: '8%',   left: '62%',  delay: 2.1,  dur: 15, opacity: 0.45},
  { size: 3, top: '33%',  left: '15%',  delay: 4.0,  dur: 11, opacity: 0.5 },
  { size: 2, top: '92%',  left: '72%',  delay: 1.1,  dur: 17, opacity: 0.3 },
]

// onStart → pengguna akan diarahkan ke OnboardingScreen yang menangani logika Login/Register
export default function SplashScreen({ onStart }) {
  const [pressedStart, setPressedStart] = useState(false)
  const [lettersVisible,  setLettersVisible]  = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLettersVisible(true), 120)
    return () => clearTimeout(t)
  }, [])

  // Tombol utama = Mulai Petualangan
  const handleStart = () => {
    if (pressedStart) return
    setPressedStart(true)
    if (navigator.vibrate) navigator.vibrate(50)
    setTimeout(() => onStart?.(), 600)
  }

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-midnight">

      {/* Background Image Removed */}

      {/* Vignette overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-midnight/95 via-midnight/30 to-midnight/60 pointer-events-none" />

      {/* ── Floating light particles ─────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-drift-free"
            style={{
              width:  p.size,
              height: p.size,
              top:    p.top,
              left:   p.left,
              opacity: p.opacity,
              animationDelay:    `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              background: i % 3 === 0
                ? 'radial-gradient(circle, #f2ca50, transparent)'
                : i % 3 === 1
                ? 'radial-gradient(circle, #c9beff, transparent)'
                : 'radial-gradient(circle, #ffffff, transparent)',
            }}
          />
        ))}
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-12">

        {/* Ornament top */}
        <div className="ornament-divider w-48 mb-6 text-[10px] tracking-ultrawide text-gold/40">
          ✦ ✦ ✦
        </div>

        {/* Letter-by-letter title */}
        <h1
          className="font-serif font-semibold tracking-wide drop-shadow-[0_0_18px_rgba(242,202,80,0.35)] mb-2 flex items-end justify-center gap-0"
          style={{ fontSize: 'clamp(3.2rem, 12vw, 5rem)' }}
          aria-label="MindQuest"
        >
          {TITLE_LETTERS.map((letter, i) => (
            <span
              key={i}
              className="text-gold inline-block"
              style={{
                opacity: lettersVisible ? 1 : 0,
                animation: lettersVisible
                  ? `letterPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) ${LETTER_DELAYS[i]}s both`
                  : 'none',
                fontSize: letter === letter.toUpperCase() && letter !== 'i'
                  ? '1.05em' : '1em',
              }}
            >
              {letter}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <div className="relative mt-2 mb-10 max-w-[300px] mx-auto">
          <span
            className="font-serif text-4xl text-gold/20 absolute -top-3 -left-3 select-none leading-none"
            aria-hidden="true"
          >"</span>
          <p className="font-sans text-base md:text-lg text-white/80 leading-relaxed animate-fade-in-up animation-delay-900">
            Petualangan menuju kesehatan mental yang lebih baik
          </p>
          <span
            className="font-serif text-4xl text-gold/20 absolute -bottom-6 -right-2 select-none leading-none"
            aria-hidden="true"
          >"</span>
        </div>

        {/* Ornament divider */}
        <div className="ornament-divider w-56 mb-8 text-[9px] tracking-superwide text-gold/30 animate-fade-in-up animation-delay-800">
          ─ ✦ ─
        </div>

        {/* ── CTA Utama: MASUK ── */}
        <div className="animate-fade-in-up animation-delay-1000">
          <button
            id="splash-btn-start"
            onClick={handleStart}
            disabled={pressedStart}
            className={`
              group relative overflow-hidden px-10 py-3.5
              btn-shimmer
              rounded-full text-midnight font-bold text-base md:text-lg tracking-wide
              shadow-[0_4px_24px_rgba(242,202,80,0.35)]
              transition-all duration-300 transform hover:scale-105 active:scale-95
              ${pressedStart ? 'opacity-80 scale-95' : 'opacity-100'}
            `}
            aria-label="Masuk ke MindQuest"
          >
            <span className="relative z-10 flex items-center gap-2">
              Mulai Petualangan
              <span className="transition-transform group-hover:translate-x-1.5 inline-block">›</span>
            </span>
          </button>
        </div>

        {/* Ornament bottom */}
        <div className="ornament-divider w-40 mt-10 text-[9px] text-gold/25 animate-fade-in-up animation-delay-1100">
          ✦
        </div>
      </div>
    </div>
  )
}
