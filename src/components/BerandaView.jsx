import React, { useState, useRef } from "react";
import { Sparkles, Award, Play, ChevronRight, Compass } from "lucide-react";
import { MOOD_CONFIGS, DAILY_QUOTES } from "../types";

// Ripple effect hook
function useRipple() {
  const [ripples, setRipples] = useState([]);
  const trigger = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const key = `${id}-${Date.now()}`;
    setRipples(prev => [...prev, { key, x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.key !== key));
    }, 700);
  };
  return [ripples, trigger];
}

// Mood bg gradients — berbeda per mood, bukan seragam
const MOOD_BG = {
  Senang:  "from-amber-900/30 to-amber-800/10",
  Tenang:  "from-indigo-900/30 to-indigo-800/10",
  Gelisah: "from-blue-900/30 to-cyan-800/10",
  Lelah:   "from-slate-800/40 to-slate-700/10",
};

export const BerandaView = ({
  stats,
  quests,
  currentMood,
  onChangeMood,
  onNavigateToQuest,
  onNavigateToMenu,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [ripples, triggerRipple] = useRipple();

  const activeQuest = quests.find((q) => q.id === stats.activeQuestId && !q.isCompleted);
  const recommendedQuest = activeQuest || quests.find((q) => !q.isCompleted) || quests[0];

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % DAILY_QUOTES.length);
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5  && hours < 11) return "Pagi yang Cerah, Penjelajah!";
    if (hours >= 11 && hours < 15) return "Siang yang Terang, Penjelajah!";
    if (hours >= 15 && hours < 18) return "Sore yang Tenang, Penjelajah!";
    return "Malam yang Damai, Penjelajah!";
  };

  const xpPercent = Math.min(((stats.xp % 150) / 150) * 100, 100);

  return (
    <div className="space-y-5" id="beranda-view-container">

      {/* ── 1. Hero Section ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-radial from-space-light/80 to-space-deep border border-space-bright flex flex-col md:flex-row md:items-center justify-between gap-6">

        {/* Subtle texture via noise overlay */}
        <div className="noise-overlay absolute inset-0 rounded-2xl z-0" />

        {/* Decorative sparkle — off-center intentionally */}
        <div className="absolute top-2 right-6 opacity-[0.07] pointer-events-none">
          <Sparkles className="w-28 h-28 text-gold animate-breathe" />
        </div>

        {/* Left: Greeting */}
        <div className="relative z-10 space-y-2 flex-1">
          {/* Badge dengan ornamen bintang */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-mono tracking-ultrawide">
            <span className="animate-soft-pulse">✦</span>
            RASI BINTANG HARI INI
            <span className="animate-soft-pulse animation-delay-300">✦</span>
          </div>

          {/* Greeting dengan inkBleed animation */}
          <h1
            className="font-serif text-3xl font-bold text-vellum leading-tight tracking-wide animate-inkBleed"
            style={{ animationDelay: '0.1s', opacity: 0 }}
          >
            {getGreeting()}
          </h1>

          <p className="text-magic-light text-sm max-w-sm leading-relaxed animate-inkBleed" style={{ animationDelay: '0.25s', opacity: 0 }}>
            Selamat datang di Hutan Jiwa. Hari ini adalah dahan rimbun baru bagi Penjelajah untuk beristirahat, merenung, dan mengukir Gulungan Memoar bersama rasi bintang.
          </p>
        </div>

        {/* Right: Level Card */}
        <div className="relative z-10 min-w-[200px] glass-cosmic p-4 rounded-2xl flex flex-col justify-center transition-all duration-300 hover:shadow-gold/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center border border-gold/40 animate-breathe hover-float cursor-default">
              <Award className="w-5 h-5 text-gold drop-shadow-md" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-gold tracking-ultrawide uppercase">Pangkat Jiwa</div>
              <div className="font-serif text-lg font-bold text-vellum">{stats.title}</div>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs font-mono text-magic-light">
              <span>Tingkat {stats.level}</span>
              <span>{stats.xp} XP</span>
            </div>
            {/* XP bar dengan shimmer glow */}
            <div className="w-full bg-space-deep h-2 rounded-full overflow-hidden border border-space-bright relative">
              <div
                className="h-full rounded-full transition-all duration-1000 relative"
                style={{
                  width: `${xpPercent}%`,
                  background: 'linear-gradient(90deg, #b89324, #f2ca50, #ffd970, #f2ca50)',
                  backgroundSize: '200% auto',
                  animation: 'shimmer-sweep 2.5s linear infinite',
                }}
              />
            </div>
            <div className="text-[9px] text-right text-gold/60 font-mono">
              {150 - (stats.xp % 150)} XP lagi untuk naik tingkat
            </div>
          </div>
        </div>
      </div>

      {/* ── Ornament divider ─────────────────────────────── */}
      <div className="ornament-divider text-[10px]">✦ ─────── ✦</div>

      {/* ── 2. Mood Check-In ─────────────────────────────── */}
      <div className="bg-space-light/50 rounded-2xl p-5 border border-space-bright space-y-4">
        {/* Header compact — label dan badge dalam satu baris */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-semibold text-vellum leading-snug">
              Bagaimana denyut jiwa Penjelajah hari ini?
            </h2>
            <p className="text-[11px] text-magic-light mt-0.5">Pilih suasana hati aktifmu untuk menyelaraskan Hutan Jiwa.</p>
          </div>
          <div className="shrink-0 px-2.5 py-1 rounded-md bg-space-bright/50 border border-space-bright text-[10px] font-mono text-gold">
            Aktif: <span className="font-bold">{currentMood}</span>
          </div>
        </div>

        {/* Mood grid — tinggi seragam, rapi */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.keys(MOOD_CONFIGS).map((moodKey) => {
            const config   = MOOD_CONFIGS[moodKey];
            const isActive = currentMood === moodKey;
            const moodRipples = ripples.filter(r => r.id === moodKey);
            const bgGrad = MOOD_BG[moodKey] || "from-space-bright/20 to-space-bright/10";

            return (
              <button
                key={moodKey}
                onClick={(e) => {
                  triggerRipple(e, moodKey);
                  onChangeMood(moodKey);
                }}
                id={`mood-btn-${moodKey.toLowerCase()}`}
                className={`
                  relative overflow-hidden p-4 rounded-xl border text-left
                  transition-all duration-300 hover:-translate-y-0.5
                  flex flex-col justify-between h-28
                  ${isActive
                    ? `bg-gradient-to-br ${bgGrad} ${config.borderColor} shadow-md shadow-gold/5`
                    : `bg-gradient-to-br ${bgGrad} border-space-bright/60 hover:border-space-bright`
                  }
                `}
              >
                {/* Ripple effect */}
                {moodRipples.map(r => (
                  <span
                    key={r.key}
                    className="absolute rounded-full bg-gold/20 animate-ripple-out pointer-events-none"
                    style={{ width: 20, height: 20, left: r.x - 10, top: r.y - 10 }}
                  />
                ))}

                <div className="flex justify-between items-start">
                  <span className="text-2xl leading-none">{config.icon}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-gold animate-ping shrink-0" />
                  )}
                </div>
                <div>
                  <div className={`font-semibold text-sm ${isActive ? config.textColor : "text-vellum"}`}>
                    {config.label}
                  </div>
                  <div className="text-[10px] text-magic-light leading-tight mt-0.5 line-clamp-2">
                    {config.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Quotes & Recommended Quest ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Daily Quotes */}
        <div className="lg:col-span-5 bg-space-light/50 rounded-2xl p-6 border border-space-bright flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-mono text-gold uppercase tracking-ultrawide">
              <Sparkles className="w-3.5 h-3.5" />
              Bisikan Daun Rimbun
            </div>

            {/* Quote — min-height agar tidak lompat saat berganti */}
            <div className="relative pl-6 min-h-[80px]">
              <span className="font-serif text-5xl text-gold/10 absolute -top-4 left-0 leading-none select-none">&ldquo;</span>
              <p
                key={quoteIndex}
                className="font-serif italic text-sm text-vellum leading-relaxed relative z-10 animate-inkBleed"
                style={{ animationDelay: '0s', opacity: 0 }}
              >
                {DAILY_QUOTES[quoteIndex]}
              </p>
              <p className="text-right text-[10px] text-gold/60 mt-3 font-mono">— Si Rusa Berbintang</p>
            </div>
          </div>

          <button
            onClick={handleNextQuote}
            id="next-quote-btn"
            className="w-full py-2.5 px-4 rounded-xl bg-space-bright/80 border border-space-bright text-[11px] font-mono text-gold hover:bg-gold hover:text-midnight transition-all duration-300 text-center group shrink-0"
          >
            <span className="group-hover:tracking-wider transition-all">Tukar Sabda Kebijaksanaan</span>
          </button>
        </div>

        {/* Recommended Quest */}
        <div className="lg:col-span-7 bg-space-light/50 rounded-2xl p-6 border border-space-bright flex flex-col justify-between space-y-4">
          {recommendedQuest ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gold uppercase tracking-ultrawide">
                    <Compass className="w-3.5 h-3.5 text-gold animate-breathe" />
                    Misi Penjelajahan Jiwa
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Wax seal kategori */}
                    <span className="wax-seal animate-wax-seal text-[9px]">
                      {recommendedQuest.category?.charAt(0) || 'M'}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-gold/10 border border-gold/20 text-gold">
                      {recommendedQuest.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-vellum animate-inkBleed" style={{ animationDelay: '0.1s', opacity: 0 }}>
                    {recommendedQuest.title}
                  </h3>
                  <p className="text-xs text-magic-light leading-relaxed">
                    {recommendedQuest.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs font-mono text-gold">
                  <span>⏱️ {recommendedQuest.duration}</span>
                  <span>✦ +{recommendedQuest.rewardXP} XP ({recommendedQuest.rewardType})</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onNavigateToQuest(recommendedQuest.id)}
                  id="start-recommended-quest-btn"
                  className="flex-1 py-3 px-4 rounded-xl btn-shimmer text-midnight font-serif text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/10"
                >
                  <Play className="w-4 h-4 fill-midnight" />
                  Lanjutkan Misi Sekarang
                </button>
                <button
                  onClick={() => onNavigateToMenu("quest")}
                  id="view-all-quests-btn"
                  className="px-4 rounded-xl bg-space-bright/40 border border-space-bright text-[11px] text-vellum hover:bg-space-bright/80 transition-all flex items-center justify-center group"
                >
                  Cari Misi Lain
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-space-bright rounded-xl">
              <Sparkles className="w-12 h-12 text-gold animate-float mb-3" />
              <h3 className="font-serif text-sm text-vellum font-semibold">Semua Misi Selesai!</h3>
              <p className="text-xs text-magic-light max-w-xs mt-1 leading-relaxed">
                Jiwamu telah menjelajahi seluruh rasi misi saat ini. Datanglah kembali besok untuk menyelaraskan batinmu kembali.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
