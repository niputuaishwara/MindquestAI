import React, { useState, useEffect, useRef } from "react";
import { 
  Wind, 
  PenTool, 
  Compass, 
  Play, 
  ChevronRight, 
  CheckCircle2, 
  RotateCcw, 
  Award, 
  Sparkles, 
  AlertCircle,
  Zap,
  Coffee,
  Layers,
  CloudRain,
  Heart,
  Anchor,
  Eye,
  ChevronLeft,
  Check,
  Info,
  X
} from "lucide-react";

export const QuestView = ({
  quests,
  stats,
  entries = [],
  onStartQuest,
  onCompleteQuest,
  onCancelQuest,
  onNavigateToMenu,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const activeQuestId = stats.activeQuestId;
  const activeQuest = quests.find((q) => q.id === activeQuestId);

  // 1. ACTIVE SELECTION/FILTER CATEGORY
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const categories = [
    "Semua",
    "Cemas / Khawatir",
    "Marah / Frustrasi",
    "Lelah",
    "Burnout",
    "Sedih / Murung",
    "Senang / Bahagia",
    "Antusias / Harap",
    "Putus asa",
    "Isolasi diri"
  ];

  // Filtered Quests
  const filteredQuests = selectedCategory === "Semua"
    ? quests
    : quests.filter((q) => q.category === selectedCategory);

  // 2. BREATHING QUEST STATES ("marah-1")
  const [breathPhase, setBreathPhase] = useState("Tarik");
  const [breathTimer, setBreathTimer] = useState(4); // seconds per phase
  const [breathCycle, setBreathCycle] = useState(0); // 3 cycles needed for 4-7-8
  const [isBreathActive, setIsBreathActive] = useState(false);
  const breathIntervalRef = useRef(null);

  // 3. GENERIC STEP WIZARD STATES
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepInputs, setStepInputs] = useState({});
  const [reflectionText, setReflectionText] = useState("");
  const [calmnessScore, setCalmnessScore] = useState(8); // scale 1-10

  // Reset states when active quest changes
  useEffect(() => {
    if (!activeQuestId) {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      setIsBreathActive(false);
      setBreathCycle(0);
      setBreathPhase("Tarik");
      setBreathTimer(4);

      setCurrentStepIndex(0);
      setStepInputs({});
      setReflectionText("");
      setCalmnessScore(8);
    } else {
      setCurrentStepIndex(0);
      setStepInputs({});
      setReflectionText("");
      setCalmnessScore(8);

      if (activeQuestId === "marah-1") {
        setBreathCycle(0);
        setBreathPhase("Tarik");
        setBreathTimer(4);
        setIsBreathActive(false);
      }
    }
  }, [activeQuestId]);

  // Breathing loop duration getter
  const getPhaseDuration = (phase) => {
    if (phase === "Tarik") return 4;
    if (phase === "Tahan_Penuh") return 7;
    if (phase === "Hembuskan") return 8;
    return 4;
  };

  // Breathing interval controller
  useEffect(() => {
    if (activeQuestId === "marah-1" && isBreathActive) {
      breathIntervalRef.current = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            let nextPhase = "Tarik";

            if (breathPhase === "Tarik") {
              nextPhase = "Tahan_Penuh";
            } else if (breathPhase === "Tahan_Penuh") {
              nextPhase = "Hembuskan";
            } else if (breathPhase === "Hembuskan") {
              const completedCycle = breathCycle + 1;
              setBreathCycle(completedCycle);
              if (completedCycle >= 3) {
                setIsBreathActive(false);
                nextPhase = "Selesai";
              } else {
                nextPhase = "Tarik";
              }
            }

            setBreathPhase(nextPhase);
            return getPhaseDuration(nextPhase);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    }

    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, [isBreathActive, breathPhase, breathCycle, activeQuestId]);

  const handleStartBreathing = () => {
    setBreathCycle(0);
    setBreathPhase("Tarik");
    setBreathTimer(4);
    setIsBreathActive(true);
  };

  const handleStopBreathing = () => {
    setIsBreathActive(false);
    if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
  };

  const handleCompleteBreathingQuest = () => {
    const summary = "Menyelesaikan Misi: Pernapasan Penenang Jiwa (Siklus Pernapasan 4-7-8 sebanyak 3 siklus). Ketegangan batin mendingin, napas menjadi lambat dan damai.";
    onCompleteQuest("marah-1", summary, coolnessScoreToMoodScore(calmnessScore));
  };

  // Map calmness 1-10 to mood score for the journal entry
  const coolnessScoreToMoodScore = (score) => {
    return score;
  };

  // Generate dynamic, beautiful journal markdown text based on what the user input across wizard steps
  const generateAutomaticSummary = () => {
    if (!activeQuest) return "";
    let summary = `Menyelesaikan misi batin '${activeQuest.title}' (${activeQuest.category}).\n\n`;
    
    if (activeQuest.id === "cemas-1") {
      summary += "• Goresan 5 Benda yang dilihat:\n" + 
        `  1. ${stepInputs["cemas1-see1"] || "—"}\n` +
        `  2. ${stepInputs["cemas1-see2"] || "—"}\n` +
        `  3. ${stepInputs["cemas1-see3"] || "—"}\n` +
        `  4. ${stepInputs["cemas1-see4"] || "—"}\n` +
        `  5. ${stepInputs["cemas1-see5"] || "—"}\n` +
        "• Goresan 4 Benda yang disentuh:\n" +
        `  1. ${stepInputs["cemas1-touch1"] || "—"}\n` +
        `  2. ${stepInputs["cemas1-touch2"] || "—"}\n` +
        `  3. ${stepInputs["cemas1-touch3"] || "—"}\n` +
        `  4. ${stepInputs["cemas1-touch4"] || "—"}`;
    } else if (activeQuest.id === "cemas-2") {
      summary += `• Hal yang paling dikhawatirkan:\n  "${stepInputs["cemas2-worry"] || "—"}"\n\n` +
        `• Satu hal dalam kendali situasi:\n  "${stepInputs["cemas2-control"] || "—"}"`;
    } else if (activeQuest.id === "cemas-3") {
      summary += `• Kekhawatiran melintas:\n  "${stepInputs["cemas3-worry"] || "—"}"\n\n` +
        `• Fakta Objektif:\n  "${stepInputs["cemas3-fact"] || "—"}"\n\n` +
        `• Asumsi Cemas:\n  "${stepInputs["cemas3-assumption"] || "—"}"`;
    } else if (activeQuest.id === "marah-2") {
      summary += `• Pemicu Amarah/Frustrasi:\n  "${stepInputs["marah2-trigger"] || "—"}"\n\n` +
        `• Kebutuhan batin yang belum terpenuhi:\n  "${stepInputs["marah2-need"] || "—"}"`;
    } else if (activeQuest.id === "burnout-1") {
      summary += `• Beban & Tanggung Jawab Jiwa:\n  "${stepInputs["burnout1-load"] || "—"}"\n\n` +
        `• Rencana Pelepasan, Delegasi, atau Penundaan:\n  "${stepInputs["burnout1-strategy"] || "—"}"`;
    } else if (activeQuest.id === "sedih-1") {
      summary += `• Ungkapan perasaan sedih tanpa penilaian:\n  "${stepInputs["sedih1-feelings"] || "—"}"`;
    } else if (activeQuest.id === "senang-1") {
      summary += `• Satu hal kecil yang membuat tersenyum hari ini:\n  "${stepInputs["senang1-smile"] || "—"}"`;
    } else if (activeQuest.id === "antusias-3") {
      summary += `• Satu tindakan spesifik esok hari:\n  "${stepInputs["antusias3-step"] || "—"}"`;
    } else if (activeQuest.id === "putusasa-1") {
      summary += `• Satu hal kecil yang masih disyukuri:\n  "${stepInputs["putusasa1-gratitude"] || "—"}"`;
    } else {
      summary += `Refleksi Batin:\n${reflectionText.trim() ? `"${reflectionText}"` : "Selesai dijalani dengan kesadaran penuh dan hening."}`;
    }

    if (reflectionText.trim() && ![
      "cemas-1", "cemas-2", "cemas-3", "marah-2", "burnout-1", "sedih-1", "senang-1", "antusias-3", "putusasa-1"
    ].includes(activeQuest.id)) {
      // already added above or skipped
    } else if (reflectionText.trim()) {
      summary += `\n\nRefleksi Tambahan: "${reflectionText}"`;
    }

    return summary;
  };

  const handleCompleteGenericQuest = () => {
    if (!activeQuest) return;
    const summary = generateAutomaticSummary();
    onCompleteQuest(activeQuest.id, summary, calmnessScore);
  };

  const handleNextStep = () => {
    if (activeQuest && currentStepIndex < activeQuest.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Helper to get matching category icon
  const getQuestIcon = (iconName) => {
    switch (iconName) {
      case "Wind":
        return <Wind className="w-5 h-5" />;
      case "PenTool":
        return <PenTool className="w-5 h-5" />;
      case "Compass":
        return <Compass className="w-5 h-5" />;
      case "Zap":
        return <Zap className="w-5 h-5" />;
      case "Coffee":
        return <Coffee className="w-5 h-5" />;
      case "Layers":
        return <Layers className="w-5 h-5" />;
      case "CloudRain":
        return <CloudRain className="w-5 h-5" />;
      case "Heart":
        return <Heart className="w-5 h-5" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5" />;
      case "Anchor":
        return <Anchor className="w-5 h-5" />;
      default:
        return <Compass className="w-5 h-5" />;
    }
  };

  // Dynamic wizard form fields
  const renderStepInputs = () => {
    if (!activeQuest) return null;

    switch (activeQuest.id) {
      case "cemas-1":
        if (currentStepIndex >= 1 && currentStepIndex <= 5) {
          const num = currentStepIndex;
          const key = `cemas1-see${num}`;
          return (
            <div className="space-y-2 animate-fadeIn pt-2">
              <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Goresan Benda Terlihat #{num}</label>
              <input
                type="text"
                value={stepInputs[key] || ""}
                onChange={(e) => setStepInputs({ ...stepInputs, [key]: e.target.value })}
                placeholder="Apa objek fisik nyata yang tertangkap pandanganmu?"
                className="w-full bg-space-deep border border-space-bright rounded-xl p-3.5 text-xs text-vellum focus:outline-none focus:border-gold transition-all"
              />
            </div>
          );
        }
        if (currentStepIndex >= 6 && currentStepIndex <= 9) {
          const num = currentStepIndex - 5;
          const key = `cemas1-touch${num}`;
          return (
            <div className="space-y-2 animate-fadeIn pt-2">
              <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Goresan Benda Tersentuh #{num}</label>
              <input
                type="text"
                value={stepInputs[key] || ""}
                onChange={(e) => setStepInputs({ ...stepInputs, [key]: e.target.value })}
                placeholder="Sentuh benda di dekatmu, ceritakan tekstur atau suhunya..."
                className="w-full bg-space-deep border border-space-bright rounded-xl p-3.5 text-xs text-vellum focus:outline-none focus:border-gold transition-all"
              />
            </div>
          );
        }
        break;

      case "cemas-2":
        if (currentStepIndex === 1) {
          return (
            <div className="space-y-2 animate-fadeIn pt-2">
              <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Tuliskan Kekhawatiran Terbesarmu:</label>
              <textarea
                value={stepInputs["cemas2-worry"] || ""}
                onChange={(e) => setStepInputs({ ...stepInputs, "cemas2-worry": e.target.value })}
                placeholder="Tumpahkan rasa khawatir yang sedang berlari di kepalamu di sini..."
                className="w-full h-28 bg-space-deep border border-space-bright rounded-xl p-3.5 text-xs text-vellum focus:outline-none focus:border-gold resize-none transition-all leading-relaxed"
              />
            </div>
          );
        }
        if (currentStepIndex === 3) {
          return (
            <div className="space-y-2 animate-fadeIn pt-2">
              <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Satu Hal yang Bisa Kamu Kendalikan:</label>
              <textarea
                value={stepInputs["cemas2-control"] || ""}
                onChange={(e) => setStepInputs({ ...stepInputs, "cemas2-control": e.target.value })}
                placeholder="Langkah kecil apa yang sepenuhnya berada di bawah kuasamu saat ini?"
                className="w-full h-28 bg-space-deep border border-space-bright rounded-xl p-3.5 text-xs text-vellum focus:outline-none focus:border-gold resize-none transition-all leading-relaxed"
              />
            </div>
          );
        }
        break;

      case "cemas-3":
        if (currentStepIndex === 1) {
          return (
            <div className="space-y-2 animate-fadeIn pt-2">
              <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Daftar Kekhawatiran:</label>
              <textarea
                value={stepInputs["cemas3-worry"] || ""}
                onChange={(e) => setStepInputs({ ...stepInputs, "cemas3-worry": e.target.value })}
                placeholder="Tuliskan butir-butir ketakutan batin yang sedang kamu rasakan..."
                className="w-full h-24 bg-space-deep border border-space-bright rounded-xl p-3.5 text-xs text-vellum focus:outline-none focus:border-gold resize-none transition-all leading-relaxed"
              />
            </div>
          );
        }
        if (currentStepIndex === 2 || currentStepIndex === 3) {
          return (
            <div className="space-y-4 animate-fadeIn pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-emerald-400 block uppercase tracking-wider">Fakta Objektif (Hal yang Nyata Terjadi):</label>
                <input
                  type="text"
                  value={stepInputs["cemas3-fact"] || ""}
                  onChange={(e) => setStepInputs({ ...stepInputs, "cemas3-fact": e.target.value })}
                  placeholder="Contoh: Saya berada di kamar yang aman, saat ini tidak ada bahaya..."
                  className="w-full bg-space-deep border border-space-bright rounded-xl p-3 text-xs text-vellum focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-rose-400 block uppercase tracking-wider">Asumsi Cemas (Skenario Pikiran):</label>
                <input
                  type="text"
                  value={stepInputs["cemas3-assumption"] || ""}
                  onChange={(e) => setStepInputs({ ...stepInputs, "cemas3-assumption": e.target.value })}
                  placeholder="Contoh: Masa depan saya pasti hancur total..."
                  className="w-full bg-space-deep border border-space-bright rounded-xl p-3 text-xs text-vellum focus:outline-none focus:border-rose-500 transition-all"
                />
              </div>
            </div>
          );
        }
        break;

      case "marah-2":
        if (currentStepIndex === 1) {
          return (
            <div className="space-y-2 animate-fadeIn pt-2">
              <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Penyebab Kemarahan / Frustrasi:</label>
              <input
                type="text"
                value={stepInputs["marah2-trigger"] || ""}
                onChange={(e) => setStepInputs({ ...stepInputs, "marah2-trigger": e.target.value })}
                placeholder="Apa atau siapa situasi yang membuat baramu menyala?"
                className="w-full bg-space-deep border border-space-bright rounded-xl p-3.5 text-xs text-vellum focus:outline-none focus:border-gold transition-all"
              />
            </div>
          );
        }
        if (currentStepIndex === 3) {
          return (
            <div className="space-y-2 animate-fadeIn pt-2">
              <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Kebutuhan Batin yang Belum Terpenuhi:</label>
              <input
                type="text"
                value={stepInputs["marah2-need"] || ""}
                onChange={(e) => setStepInputs({ ...stepInputs, "marah2-need": e.target.value })}
                placeholder="misal: Saya butuh waktu istirahat penuh, butuh dihargai jerih payah saya..."
                className="w-full bg-space-deep border border-space-bright rounded-xl p-3.5 text-xs text-vellum focus:outline-none focus:border-gold transition-all"
              />
            </div>
          );
        }
        break;

      case "burnout-1":
        if (currentStepIndex === 1) {
          return (
            <div className="space-y-2 animate-fadeIn pt-2">
              <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Tulis Semua Tanggung Jawab yang Mengimpitmu:</label>
              <textarea
                value={stepInputs["burnout1-load"] || ""}
                onChange={(e) => setStepInputs({ ...stepInputs, "burnout1-load": e.target.value })}
                placeholder="Tuliskan segalanya: pekerjaan, tenggat waktu, hubungan sosial, ekspektasi batin..."
                className="w-full h-28 bg-space-deep border border-space-bright rounded-xl p-3.5 text-xs text-vellum focus:outline-none focus:border-gold resize-none transition-all leading-relaxed"
              />
            </div>
          );
        }
        if (currentStepIndex === 3 || currentStepIndex === 4 || currentStepIndex === 5) {
          return (
            <div className="space-y-2 animate-fadeIn pt-2">
              <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Tanggung Jawab yang Bisa Dilepas / Didelegasikan / Ditunda:</label>
              <textarea
                value={stepInputs["burnout1-strategy"] || ""}
                onChange={(e) => setStepInputs({ ...stepInputs, "burnout1-strategy": e.target.value })}
                placeholder="Mana di antara tanggung jawab tersebut yang bisa didelegasikan atau ditunda demi kelangsungan jiwamu?"
                className="w-full h-28 bg-space-deep border border-space-bright rounded-xl p-3.5 text-xs text-vellum focus:outline-none focus:border-gold resize-none transition-all leading-relaxed"
              />
            </div>
          );
        }
        break;

      case "sedih-1":
        if (currentStepIndex === 1) {
          return (
            <div className="space-y-2 animate-fadeIn pt-2">
              <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Goresan Ungkapan Rasa Sedih / Murung:</label>
              <textarea
                value={stepInputs["sedih1-feelings"] || ""}
                onChange={(e) => setStepInputs({ ...stepInputs, "sedih1-feelings": e.target.value })}
                placeholder="Tuliskan rasa penat atau lara batinmu di sini secara tulus tanpa menghakimi diri..."
                className="w-full h-36 bg-space-deep border border-space-bright rounded-xl p-3.5 text-xs text-vellum focus:outline-none focus:border-gold resize-none transition-all leading-relaxed"
              />
            </div>
          );
        }
        break;

      case "senang-1":
        if (currentStepIndex === 2) {
          return (
            <div className="space-y-2 animate-fadeIn pt-2">
              <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Satu Hal yang Membuatmu Tersenyum Hari Ini:</label>
              <input
                type="text"
                value={stepInputs["senang1-smile"] || ""}
                onChange={(e) => setStepInputs({ ...stepInputs, "senang1-smile": e.target.value })}
                placeholder="Hal kecil, senyuman seseorang, atau hidangan lezat kesukaanmu..."
                className="w-full bg-space-deep border border-space-bright rounded-xl p-3.5 text-xs text-vellum focus:outline-none focus:border-gold transition-all"
              />
            </div>
          );
        }
        break;

      case "antusias-3":
        if (currentStepIndex === 2) {
          return (
            <div className="space-y-2 animate-fadeIn pt-2">
              <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Satu Langkah Sederhana untuk Besok:</label>
              <input
                type="text"
                value={stepInputs["antusias3-step"] || ""}
                onChange={(e) => setStepInputs({ ...stepInputs, "antusias3-step": e.target.value })}
                placeholder="Goreskan satu aksi nyata yang sangat mudah dilakukan esok pagi..."
                className="w-full bg-space-deep border border-space-bright rounded-xl p-3.5 text-xs text-vellum focus:outline-none focus:border-gold transition-all"
              />
            </div>
          );
        }
        break;

      case "putusasa-1":
        if (currentStepIndex === 3) {
          return (
            <div className="space-y-2 animate-fadeIn pt-2">
              <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Satu Hal Sekecil Apapun yang Bisa Disyukuri:</label>
              <input
                type="text"
                value={stepInputs["putusasa1-gratitude"] || ""}
                onChange={(e) => setStepInputs({ ...stepInputs, "putusasa1-gratitude": e.target.value })}
                placeholder="Secangkir air peneduh, detak jantung, atau udara pagi..."
                className="w-full bg-space-deep border border-space-bright rounded-xl p-3.5 text-xs text-vellum focus:outline-none focus:border-gold transition-all"
              />
            </div>
          );
        }
        break;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="quest-view-container">
      
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 bg-space-bright/20 rounded-full flex items-center justify-center border border-space-bright mb-2 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <Compass className="w-10 h-10 text-magic-light" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-vellum tracking-wide">
            Jalan Belum Terbuka
          </h2>
          <p className="text-magic-light max-w-md mx-auto text-sm leading-relaxed">
            Untuk melakukan misi batin, kamu dapat memulainya melalui jurnal harian terlebih dahulu. Rekam jejak emosimu agar rasi bintang dapat memandu jalanmu.
          </p>
          <button
            onClick={() => onNavigateToMenu("jurnal")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-[#ffd970] text-midnight font-bold shadow-lg shadow-gold/20 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Buka Jurnal Harian
          </button>
        </div>
      ) : !activeQuest ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-bold text-vellum flex items-center gap-2">
                Gerbang Penjelajahan Jiwa
                <button
                  onClick={() => setShowInfo(true)}
                  className="p-1 rounded bg-space-bright/20 hover:bg-space-bright text-magic-light hover:text-gold transition-colors"
                  title="Transparansi Ilmiah"
                >
                  <Info className="w-5 h-5" />
                </button>
              </h2>
              <p className="text-xs text-magic-light">Pilihlah rute batinmu berdasarkan tantangan yang sedang kamu rasakan hari ini.</p>
            </div>
            
            {/* XP Tracker brief tag */}
            <div className="px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/25 text-[11px] font-mono text-gold flex items-center gap-1.5 self-start md:self-auto">
              <Sparkles className="w-3.5 h-3.5 animate-pulse-gold" /> Level {stats.level} • {stats.xp} XP
            </div>
          </div>

          {/* Category filter — hand-stamped feel dengan rotasi sedikit alternatif */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-space-bright/20" id="quest-category-tabs">
            {categories.map((cat, idx) => {
              const isActive = selectedCategory === cat;
              // Sedikit variasi rotasi per tombol — efek hand-stamped
              const rotateClass = idx % 3 === 0 ? '-rotate-[0.5deg]' : idx % 3 === 1 ? 'rotate-[0.5deg]' : 'rotate-0'
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    px-3.5 py-1.5 text-[11px] font-mono whitespace-nowrap
                    transition-all duration-250 border shrink-0
                    ${rotateClass}
                    ${isActive
                      ? "rounded-lg bg-gold text-midnight border-gold font-bold shadow-md shadow-gold/15 rotate-0"
                      : "rounded-md bg-space-bright/35 border-space-bright/50 text-magic-light hover:text-vellum hover:bg-space-bright/70 hover:rotate-0"
                    }
                  `}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Active filtered quests list */}
          {filteredQuests.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-space-bright rounded-2xl space-y-3">
              <Compass className="w-10 h-10 text-space-bright mx-auto animate-float" />
              <p className="text-sm text-magic-light">Rasi bintang tidak menemukan misi dalam kategori ini.</p>
              <button
                onClick={() => setSelectedCategory("Semua")}
                className="text-xs font-mono text-gold underline"
              >
                Kembali ke Semua Rasi
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="quest-grid-display">
              {filteredQuests.map((quest) => {
                const isDone = quest.isCompleted;
                return (
                  <div
                    key={quest.id}
                    id={`quest-card-${quest.id}`}
                    className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-72 overflow-hidden ${
                      isDone
                        ? "bg-space-bright/10 border-space-bright/30 opacity-70"
                        : "bg-space-light/50 border-space-bright hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Wax seal — pojok kiri atas, muncul dengan animasi */}
                    <div className="absolute top-3 left-3 wax-seal animate-wax-seal z-10" style={{ animationDelay: '0.2s' }}>
                      {quest.category?.charAt(0) || 'M'}
                    </div>

                    <div className="space-y-3 mt-5">
                      <div className="flex justify-between items-center">
                        <div className={`p-2 rounded-lg border ${quest.color}`}>
                          {getQuestIcon(quest.icon)}
                        </div>
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> SELESAI
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-gold px-2 py-0.5 rounded bg-gold/5 border border-gold/15 truncate max-w-[120px]">
                            {quest.category}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-serif text-sm font-bold text-vellum tracking-wide line-clamp-1">{quest.title}</h3>
                        <p className="text-[11px] text-magic-light leading-relaxed line-clamp-3">
                          {quest.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-mono text-gold/80 border-t border-space-bright/20 pt-2.5">
                        <span>⏱️ {quest.duration}</span>
                        <span>❖ +{quest.rewardXP} XP</span>
                      </div>

                      <button
                        onClick={() => onStartQuest(quest.id)}
                        id={`start-quest-${quest.id}`}
                        className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          isDone
                            ? "bg-space-bright/20 border border-space-bright text-vellum/50 hover:bg-space-bright/50 hover:text-vellum"
                            : "btn-shimmer text-midnight hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                      >
                        {isDone ? "Ulangi Misi Ketenangan" : "Mulai Penjelajahan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Magical reminder */}
          <div className="p-4 rounded-xl bg-space-bright/20 border border-space-bright flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/20 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <p className="text-[11px] text-magic-light leading-relaxed">
              Setiap kali Anda menyelesaikan misi batin, "Si Rusa Berbintang" akan mengarsipkan jurnal batin Anda secara otomatis dan memberikan petuah ketenangan batin yang dapat dibaca di halaman Jurnal.
            </p>
          </div>
        </div>
      ) : (
        
        /* 2. STATE: ACTIVE QUEST - Show full immersive interaction panel */
        <div className="bg-space-light/60 border border-gold/20 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden" id="active-quest-panel">
          
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

          {/* Active Quest Header */}
          <div className="flex items-center justify-between border-b border-space-bright pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${activeQuest.color}`}>
                {getQuestIcon(activeQuest.icon)}
              </div>
              <div>
                <span className="text-[9px] font-mono text-gold tracking-widest uppercase">Misi Aktif • {activeQuest.category}</span>
                <h2 className="font-serif text-lg font-bold text-vellum">{activeQuest.title}</h2>
              </div>
            </div>

            <button
              onClick={onCancelQuest}
              id="cancel-active-quest"
              className="px-3 py-1.5 rounded bg-space-bright/50 border border-space-bright text-[11px] text-magic-light hover:text-rose-400 hover:border-rose-500/30 transition-all font-mono"
            >
              Kembali
            </button>
          </div>

          {/* 2A. SPECIALIZED IMMERSIVE FLOW FOR: "Pernapasan Penenang Jiwa" (marah-1) */}
          {activeQuest.id === "marah-1" ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-8 animate-fadeIn" id="breathing-game-flow">
              
              {/* Animated Core Breathing Circle */}
              <div className="relative w-60 h-60 flex items-center justify-center">
                {/* Expanding outer golden ripple ring */}
                <div 
                  className={`absolute rounded-full border border-gold/20 transition-all duration-1000 ${
                    breathPhase === "Tarik" 
                      ? "scale-[1.8] opacity-60 bg-gold/5" 
                      : breathPhase === "Tahan_Penuh" 
                      ? "scale-[1.6] opacity-90 bg-gold/10" 
                      : breathPhase === "Hembuskan" 
                      ? "scale-[1.1] opacity-30 bg-transparent" 
                      : "scale-[1.0] opacity-10"
                  }`} 
                />

                {/* Inner glowing circle */}
                <div 
                  className={`rounded-full flex flex-col items-center justify-center transition-all duration-[4000ms] ease-in-out border-2 shadow-2xl ${
                    breathPhase === "Tarik"
                      ? "w-44 h-44 bg-gold/10 border-gold shadow-gold/20 scale-125"
                      : breathPhase === "Tahan_Penuh"
                      ? "w-44 h-44 bg-amber-500/15 border-amber-400 shadow-amber-500/20 scale-125 animate-pulse-gold"
                      : breathPhase === "Hembuskan"
                      ? "w-28 h-28 bg-teal-500/10 border-teal-400 shadow-teal-500/10 scale-100"
                      : breathPhase === "Selesai"
                      ? "w-36 h-36 bg-emerald-500/10 border-emerald-400"
                      : "w-28 h-28 bg-space-deep border-space-bright scale-95"
                  }`}
                >
                  {isBreathActive ? (
                    <div className="text-center space-y-1">
                      <div className="font-serif text-base font-bold text-vellum animate-pulse">
                        {breathPhase === "Tarik" && "TARIK NAPAS"}
                        {breathPhase === "Tahan_Penuh" && "TAHAN NAPAS"}
                        {breathPhase === "Hembuskan" && "HEMBUSKAN"}
                      </div>
                      <div className="font-mono text-3xl font-extrabold text-gold">{breathTimer}</div>
                      <div className="text-[10px] text-magic-light font-mono uppercase tracking-wider">Detik</div>
                    </div>
                  ) : breathPhase === "Selesai" ? (
                    <div className="text-center space-y-1 p-2">
                      <Award className="w-8 h-8 text-gold mx-auto animate-bounce" />
                      <div className="font-serif text-xs font-bold text-vellum uppercase">Siklus Tuntas!</div>
                    </div>
                  ) : (
                    <div className="text-center space-y-1 p-2 cursor-pointer" onClick={handleStartBreathing}>
                      <Wind className="w-8 h-8 text-gold mx-auto animate-float" />
                      <div className="text-[9px] font-mono text-gold uppercase tracking-widest">Mulai Ritme</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cycle Tracker Indicator */}
              <div className="space-y-3 text-center max-w-md w-full">
                <div className="flex justify-center items-center gap-2">
                  <span className="text-xs font-mono text-magic-light">Siklus Penenang (4-7-8):</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`w-3 h-3 rounded-full border transition-all ${
                          i <= breathCycle 
                            ? "bg-gold border-gold" 
                            : isBreathActive && i === breathCycle + 1
                            ? "border-gold animate-ping bg-gold/40"
                            : "border-space-bright bg-space-deep"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-gold">({breathCycle}/3)</span>
                </div>

                <div className="p-4 rounded-xl bg-space-deep/80 border border-space-bright text-center min-h-[76px] flex items-center justify-center">
                  <p className="text-xs text-vellum font-serif italic">
                    {breathPhase === "Tarik" && "“Tarik napas perlahan melalui hidung selama 4 detik, rasakan udara sejuk mengisi paru-parumu.”"}
                    {breathPhase === "Tahan_Penuh" && "“Tahan napasmu dengan tenang selama 7 detik. Biarkan emosi marahmu diredam dalam keheningan.”"}
                    {breathPhase === "Hembuskan" && "“Embuskan perlahan melalui mulut selama 8 detik. Biarkan amarahmu keluar seperti awan gelap.”"}
                    {breathPhase === "Selesai" && "“Sempurna. Jiwamu telah mendingin. Rasakan kedamaian yang melingkupi nadamu.”"}
                  </p>
                </div>
              </div>

              {/* Review calmness slider & complete */}
              {breathPhase === "Selesai" && (
                <div className="w-full max-w-sm bg-space-bright/20 border border-space-bright rounded-2xl p-4 space-y-4 animate-fadeIn text-center">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-gold block uppercase tracking-wider">Bagaimana tingkat ketenangan batinmu sekarang?</label>
                    <div className="flex justify-between text-xs font-mono text-magic-light">
                      <span>Sangat Gelisah (1)</span>
                      <span className="text-gold font-bold">{calmnessScore}/10</span>
                      <span>Sangat Tenang (10)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={calmnessScore}
                      onChange={(e) => setCalmnessScore(Number(e.target.value))}
                      className="w-full accent-gold bg-space-deep h-1 rounded"
                    />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-4 w-full max-w-xs justify-center">
                {!isBreathActive && breathPhase !== "Selesai" ? (
                  <button
                    onClick={handleStartBreathing}
                    className="w-full py-3 bg-gold hover:bg-gold-dark text-midnight font-mono text-xs font-bold rounded-xl transition-all shadow-lg shadow-gold/5"
                  >
                    Mulai Latihan (4-7-8 • 3 Siklus)
                  </button>
                ) : isBreathActive ? (
                  <button
                    onClick={handleStopBreathing}
                    className="w-full py-3 bg-space-bright/60 border border-space-bright text-vellum font-mono text-xs font-bold rounded-xl hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-400/30 transition-all"
                  >
                    Hentikan Latihan
                  </button>
                ) : (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={handleStartBreathing}
                      className="px-3.5 bg-space-bright/40 border border-space-bright text-vellum rounded-xl hover:bg-space-bright/80 transition-all"
                      title="Ulangi Latihan"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCompleteBreathingQuest}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10"
                    >
                      Selesaikan & Rekam Memoar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            
            /* 2B. UNIVERSAL GENERIC STEP WIZARD PLAYER - Handles other 22 quests elegantly */
            <div className="space-y-6 max-w-lg mx-auto animate-fadeIn" id="generic-wizard-quest-flow">
              
              {/* Stepper Header with progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-gold uppercase tracking-widest">
                  <span>Langkah {currentStepIndex + 1} dari {activeQuest.steps.length}</span>
                  <span className="text-magic-light">Estimasi: {activeQuest.duration}</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full bg-space-deep h-1.5 rounded-full overflow-hidden border border-space-bright/40">
                  <div 
                    className="bg-gold h-full transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / activeQuest.steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Core Active Step Card */}
              <div className="bg-space-deep/80 border border-space-bright rounded-2xl p-5 md:p-6 space-y-4 min-h-[140px] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-2 right-2 text-vellum-dark/15 text-6xl select-none font-serif">
                  {currentStepIndex + 1}
                </div>
                
                <div className="space-y-3 relative z-10">
                  <p className="font-serif text-sm md:text-base text-vellum leading-relaxed text-justify">
                    "{activeQuest.steps[currentStepIndex]}"
                  </p>
                  
                  {/* Render contextual inputs depending on active quest and step index */}
                  {renderStepInputs()}
                </div>
              </div>

              {/* Final submission stage triggers when they are on the last step of the quest */}
              {currentStepIndex === activeQuest.steps.length - 1 && (
                <div className="bg-space-bright/10 border border-space-bright/40 rounded-2xl p-5 space-y-4 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gold block uppercase tracking-wider">Refleksi Ketenangan Jiwa (Opsional):</label>
                    <textarea
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      placeholder="Bagaimana perasaanmu setelah menuntaskan misi batin ini? Tuliskan refleksimu di sini..."
                      className="w-full h-24 bg-space-deep border border-space-bright rounded-xl p-3 text-xs text-vellum focus:outline-none focus:border-gold resize-none transition-all leading-relaxed"
                    />
                  </div>

                  {/* Calmness slider feedback */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[10px] font-mono text-gold uppercase tracking-wider">
                      <span>Denyut Tenang Jiwa</span>
                      <span className="text-gold font-bold">{calmnessScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={calmnessScore}
                      onChange={(e) => setCalmnessScore(Number(e.target.value))}
                      className="w-full accent-gold bg-space-deep h-1 rounded"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-magic-light">
                      <span>Penuh Tekanan (1)</span>
                      <span>Sempurna (10)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigations */}
              <div className="flex justify-between items-center gap-4 pt-2">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="px-4 py-2.5 rounded-xl bg-space-bright/30 border border-space-bright text-xs font-mono text-vellum hover:bg-space-bright/60 disabled:opacity-30 disabled:hover:bg-space-bright/30 transition-all flex items-center gap-1 shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" /> Kembali
                </button>

                {currentStepIndex < activeQuest.steps.length - 1 ? (
                  <button
                    onClick={handleNextStep}
                    className="flex-1 py-2.5 rounded-xl bg-gold text-midnight text-xs font-mono font-bold hover:bg-gold-dark transition-all flex items-center justify-center gap-1"
                  >
                    Langkah Berikutnya <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteGenericQuest}
                    id="complete-wizard-quest-btn"
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/10"
                  >
                    <Check className="w-4 h-4" /> Selesaikan Misi (+{activeQuest.rewardXP} XP)
                  </button>
                )}
              </div>
            </div>
          )}
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
                <b>Misi Batin</b> disusun menggunakan kerangka kerja modifikasi perilaku dan relaksasi sistematis, sejalan dengan praktik psikologi positif.
              </p>
              <p>
                Kategorisasi misi didasarkan pada spektrum <b>Plutchik's Wheel of Emotions</b> yang dikembangkan menjadi 9 strategi koping adaptif (<i>Adaptive Coping Strategies</i>). Intervensi dirancang spesifik untuk menyeimbangkan dinamika emosi pengguna:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><b>Kuadran Takut/Marah (Gelisah, Frustrasi):</b> Misi diarahkan pada <i>grounding</i> (pembumian) dan pernapasan untuk menurunkan hiperarousal.</li>
                <li><b>Kuadran Sedih/Jijik (Sedih, Putus Asa, Isolasi, Lelah):</b> Misi diarahkan pada eksplorasi ringan dan <i>behavioral activation</i> untuk memutus rantai rumisnasi.</li>
                <li><b>Kuadran Senang/Antisipasi (Senang, Antusias):</b> Misi diarahkan pada afirmasi positif dan jurnalisme rasa syukur (<i>gratitude journaling</i>) untuk menjaga momentum batin.</li>
              </ul>
              <p>
                Aktivitas seperti "Pernapasan Penenang Jiwa", "Jangkar Detik Ini", dan "Sinyal Penyelamat" memiliki efikasi klinis dalam menurunkan hormon kortisol dan meregulasi amigdala otak.
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
    </div>
  );
};
