import React, { useState } from "react";
import { Compass, Award, Sparkles, Map, Heart, Activity } from "lucide-react";
import { MOOD_CONFIGS } from "../types";



export const PetaView = ({ entries, stats }) => {
  const [selectedNode, setSelectedNode] = useState(1);

  // Map nodes definitions
  const MAP_NODES = [
    {
      id: 1,
      name: "Titik Semai",
      minXP: 0,
      description: "Tempat dahan rimbun MindQuest pertama kali disemai di dasar lembah jiwamu yang sunyi.",
      icon: "🌱"
    },
    {
      id: 2,
      name: "Lembah Gema",
      minXP: 100,
      description: "Lembah sunyi peneduh batin yang memantulkan gema kejujuran perasaanmu terjernih.",
      icon: "⛰️"
    },
    {
      id: 3,
      name: "Hutan Kabut",
      minXP: 250,
      description: "Hutan lebat berselimut kabut tebal tempat merajut kegelisahan menjadi kebijaksanaan batin.",
      icon: "🌲"
    },
    {
      id: 4,
      name: "Puncak Kristal",
      minXP: 450,
      description: "Puncak dingin bersalju yang bersentuhan langsung dengan rasi bintang bimbingan.",
      icon: "❄️"
    },
    {
      id: 5,
      name: "Kuil Bintang Sejati",
      minXP: 700,
      description: "Kuil sakral pembebasan pikiran tempat jiwamu menyatu dalam keheningan universal abadi.",
      icon: "🏛️"
    }
  ];

  // Calculate mood counts
  const moodCounts = {
    Senang: 0,
    Tenang: 0,
    Lelah: 0,
    Gelisah: 0
  };

  const totalEntries = entries.length || 1;

  // Fix for Fallback Peta Emosi: If mood is unknown, default to 'Tenang'
  const safeEntries = entries.map(e => ({
    ...e,
    mood: MOOD_CONFIGS[e.mood] ? e.mood : "Tenang"
  }));

  safeEntries.forEach((e) => {
    if (moodCounts[e.mood] !== undefined) {
      moodCounts[e.mood]++;
    }
  });

  // Prepare custom SVG chart coordinate values for past 7 journal records
  const chartEntries = [...safeEntries].reverse().slice(-7); // take older to newer
  const padding = 40;
  const chartWidth = 500;
  const chartHeight = 200;

  // Map entries to coordinates (x from 0 to chartWidth, y from moodScore 1-10 mapped to chartHeight)
  const getCoordinates = () => {
    if (chartEntries.length < 2) return [];
    
    return chartEntries.map((entry, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / (chartEntries.length - 1);
      // Map score 1-10 to y-axis (10 is top/padding, 1 is bottom/chartHeight-padding)
      const score = entry.moodScore;
      const y = chartHeight - padding - ((score - 1) * (chartHeight - padding * 2)) / 9;
      return { x, y, entry };
    });
  };

  const coords = getCoordinates();

  // Create SVG path string for coordinates
  const getPathString = () => {
    if (coords.length < 2) return "";
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      // Use bezier curve or smooth line
      const cx = (coords[i - 1].x + coords[i].x) / 2;
      path += ` Q ${cx} ${coords[i - 1].y}, ${coords[i].x} ${coords[i].y}`;
    }
    return path;
  };

  const getAreaPathString = () => {
    if (coords.length < 2) return "";
    const path = getPathString();
    return `${path} L ${coords[coords.length - 1].x} ${chartHeight - padding} L ${coords[0].x} ${chartHeight - padding} Z`;
  };

  const pathStr = getPathString();
  const areaPathStr = getAreaPathString();

  return (
    <div className="space-y-6" id="peta-view-container">
      <div className="space-y-1">
        <h2 className="font-serif text-2xl font-bold text-vellum">Rasi Peta Kesejahteraan</h2>
        <p className="text-xs text-magic-light">Pantau kemajuan wilayah batiniah dan keseimbangan perasaanmu dari masa ke masa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: The Interactive Celestial Map Path (7 cols) */}
        <div className="lg:col-span-7 bg-space-light/50 border border-space-bright rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-wider">
            <Map className="w-4 h-4" /> Peta Jalan Batiniah
          </div>

          {/* Interactive Node Path UI */}
          <div className="relative py-8 px-4 flex flex-col md:flex-row items-center justify-between gap-6 overflow-x-auto min-h-[160px]">
            {/* Glowing connecting vector line */}
            <div className="absolute top-[40%] left-10 right-10 h-0.5 bg-gradient-to-r from-gold/10 via-gold/60 to-gold/10 hidden md:block z-0 glow-path" />

            {MAP_NODES.map((node) => {
              const isUnlocked = stats.xp >= node.minXP;
              const isSelected = selectedNode === node.id;
              
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  id={`map-node-${node.id}`}
                  className="relative z-10 flex flex-col items-center cursor-pointer group hover-float"
                >
                  {/* Glowing Node Circle */}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border ${
                      isSelected
                        ? "bg-gold border-gold text-midnight scale-110 shadow-lg shadow-gold/50 aura-pulse"
                        : isUnlocked
                        ? "glass-cosmic border-gold/50 text-vellum hover:bg-space-bright/80 hover:scale-105"
                        : "bg-space-deep border-space-bright text-vellum/30 cursor-not-allowed"
                    }`}
                  >
                    {isUnlocked ? (
                      <span className="text-xl">{node.icon}</span>
                    ) : (
                      <span className="text-sm font-mono text-magic-light/30">🔒</span>
                    )}
                  </div>

                  {/* Node Name Label */}
                  <div className="mt-2 text-center">
                    <div className={`text-xs font-serif font-bold ${isUnlocked ? "text-vellum group-hover:text-gold" : "text-vellum/30"}`}>
                      {node.name}
                    </div>
                    <div className="text-[9px] font-mono text-gold/60">
                      {node.minXP} XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Node Detail Card */}
          {selectedNode && (
            <div className="p-4 rounded-xl bg-space-bright/40 border border-space-bright animate-fadeIn space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{MAP_NODES[selectedNode - 1].icon}</span>
                <h3 className="font-serif text-sm font-bold text-vellum">
                  Wilayah: {MAP_NODES[selectedNode - 1].name}
                </h3>
                {stats.xp >= MAP_NODES[selectedNode - 1].minXP ? (
                  <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/20 text-emerald-400">
                    DIJELAJAHI
                  </span>
                ) : (
                  <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/20 text-rose-400">
                    TERKUNCI
                  </span>
                )}
              </div>
              <p className="text-xs text-magic-light leading-relaxed pl-8">
                {MAP_NODES[selectedNode - 1].description}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Custom Charts Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* A. Emotional Distribution Pie/Bar Chart */}
          <div className="glass-cosmic rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-wider">
              <Heart className="w-4 h-4" /> Keseimbangan Suasana Hati
            </div>

            <div className="space-y-3">
              {(Object.keys(MOOD_CONFIGS)).map((key) => {
                const config = MOOD_CONFIGS[key];
                const count = moodCounts[key];
                const percentage = Math.round((count / totalEntries) * 100);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-vellum">
                      <span className="flex items-center gap-1.5">
                        <span>{config.icon}</span> {key}
                      </span>
                      <span className="text-gold">{count} Goresan ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-space-deep h-1.5 rounded-full overflow-hidden border border-space-bright/55">
                      <div
                        className={`bg-gradient-to-r ${config.color} h-full rounded-full transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* B. Custom Inline SVG Emotional Trend Chart */}
          <div className="glass-cosmic rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-wider">
                <Activity className="w-4 h-4" /> Tren Tingkat Ketenangan
              </div>
              <span className="text-[9px] font-mono text-gold/60">7 Goresan Terakhir</span>
            </div>

            {coords.length < 2 ? (
              <div className="h-36 flex flex-col items-center justify-center text-center p-4 border border-dashed border-space-bright rounded-xl">
                <Sparkles className="w-8 h-8 text-space-bright mb-2 animate-float" />
                <p className="text-[10px] text-magic-light max-w-[200px]">
                  Goreskan minimal 2 memoar jurnal untuk menyalakan rasi garis ketenangan batinmu.
                </p>
              </div>
            ) : (
              <div className="relative pt-2" id="custom-svg-wellness-chart">
                {/* SVG Render */}
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                  {/* Grid Guidelines */}
                  <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#262747" strokeDasharray="3,3" />
                  <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#262747" strokeDasharray="3,3" />
                  <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#262747" strokeDasharray="3,3" />

                  {/* Left Label Indicators */}
                  <text x={padding - 10} y={padding + 4} fill="#f2ca50" fontSize="10" fontFamily="monospace" textAnchor="end">10</text>
                  <text x={padding - 10} y={chartHeight / 2 + 4} fill="#f2ca50" fontSize="10" fontFamily="monospace" textAnchor="end">5</text>
                  <text x={padding - 10} y={chartHeight - padding + 4} fill="#f2ca50" fontSize="10" fontFamily="monospace" textAnchor="end">1</text>

                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="cosmicGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f2ca50" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f2ca50" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Cosmic Gradient Fill */}
                  <path
                    d={areaPathStr}
                    fill="url(#cosmicGradient)"
                    className="transition-all duration-1000"
                  />

                  {/* Glowing Connection Line */}
                  <path
                    d={pathStr}
                    fill="none"
                    stroke="#f2ca50"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="gold-glow-line"
                  />

                  {/* Nodes plotted circles */}
                  {coords.map((pt, idx) => {
                    const moodColor = MOOD_CONFIGS[pt.entry.mood].textColor;
                    return (
                      <g key={idx} className="cursor-pointer group">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="6"
                          fill="#171837"
                          stroke="#f2ca50"
                          strokeWidth="2"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="3"
                          fill="#f2ca50"
                          className="animate-ping"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 12}
                          fill="#fcf8ee"
                          fontSize="9"
                          fontFamily="sans-serif"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-space-deep px-1 rounded pointer-events-none"
                        >
                          {pt.entry.moodScore}/10
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Bottom Horizontal Labels */}
                <div className="flex justify-between px-10 text-[9px] font-mono text-magic-light mt-1">
                  {chartEntries.map((e, idx) => (
                    <span key={idx} className="truncate max-w-[50px]" title={e.title}>
                      {e.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
