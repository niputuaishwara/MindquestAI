import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const InteractiveDeer = ({ onDeerMessage }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lookDirection, setLookDirection] = useState("center");
  const [showSparkles, setShowSparkles] = useState(false);

  // Auto blinking interval
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);

      // Occasionally change look direction randomly
      const rand = Math.random();
      if (rand < 0.3) {
        setLookDirection("left");
      } else if (rand < 0.6) {
        setLookDirection("right");
      } else {
        setLookDirection("center");
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDeerClick = () => {
    setClickCount((prev) => prev + 1);
    setIsBlinking(true);
    setShowSparkles(true);
    setTimeout(() => setIsBlinking(false), 300);
    setTimeout(() => setShowSparkles(false), 800);

    // Call callback or display magic whisper
    if (onDeerMessage) {
      const whispers = [
        "Ssshh... Rasakan kehangatan rasi bintang di dalam jiwamu.",
        "Napasmu adalah jembatan menuju ketenangan sejati, Penjelajah.",
        "Aku selalu menemanimu menjelajahi rimbunnya hutan pikiran.",
        "Setiap rintangan batin dapat ditenangkan dengan satu helaan napas lembut.",
        "Cahaya di dahan tandukku bersinar lebih terang berkat kehadiranmu!",
        "Rusa Berbintang melambaikan telinganya, menyebarkan debu mimpi damai."
      ];
      const randomWhisper = whispers[Math.floor(Math.random() * whispers.length)];
      onDeerMessage(randomWhisper);
    }
  };

  // Calculate pupillary coordinate offsets based on lookDirection
  const getPupilOffset = () => {
    switch (lookDirection) {
      case "left":
        return { x: -2, y: 0 };
      case "right":
        return { x: 2, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const pupilOffset = getPupilOffset();

  return (
    <div 
      className="flex flex-col items-center justify-center p-4 select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleDeerClick}
      id="interactive-deer-logo-container"
    >
      {/* Deer Avatar Sphere */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Glowing Auroral Background Orbits */}
        <div className={`absolute inset-0 rounded-full bg-radial from-gold/15 to-transparent blur-xl transition-all duration-700 ${isHovered ? "scale-125 opacity-100" : "scale-100 opacity-60"}`} />

        {/* Orbiting Tiny Celestial Particles */}
        <AnimatePresence>
          {isHovered && (
            <>
              {/* Star 1 */}
              <motion.div
                className="absolute w-1.5 h-1.5 rounded-full bg-gold"
                animate={{
                  x: [0, 36, 0, -36, 0],
                  y: [-36, 0, 36, 0, -36],
                }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              />
              {/* Star 2 */}
              <motion.div
                className="absolute w-1 h-1 rounded-full bg-magic-light"
                animate={{
                  x: [0, -42, 0, 42, 0],
                  y: [42, 0, -42, 0, 42],
                }}
                transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Clicking Sparkles Effect */}
        {showSparkles && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span className="absolute text-gold text-sm animate-ping">✦</span>
            <span className="absolute text-magic-light text-xs animate-ping translate-x-6 -translate-y-6">✦</span>
            <span className="absolute text-gold text-xs animate-ping -translate-x-6 translate-y-6">✦</span>
          </div>
        )}

        {/* Majestic Deer Vector SVG */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-24 h-24 z-10 filter drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
          animate={isHovered ? { y: [-2, 2, -2] } : { y: 0 }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          {/* Antlers / Tanduk Rusa - Glows beautifully */}
          <motion.path
            d="M 38,38 C 35,28 28,24 22,22 M 28,24 C 20,20 22,12 18,10 M 24,18 C 16,16 18,8 14,8 M 32,32 C 26,28 28,20 24,18"
            fill="none"
            stroke={isHovered ? "#f2ca50" : "#dcd3b5"}
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-all duration-500"
            animate={isHovered ? { strokeWidth: 2.5 } : { strokeWidth: 2 }}
          />
          <motion.path
            d="M 62,38 C 65,28 72,24 78,22 M 72,24 C 80,20 78,12 82,10 M 76,18 C 84,16 82,8 86,8 M 68,32 C 74,28 72,20 76,18"
            fill="none"
            stroke={isHovered ? "#f2ca50" : "#dcd3b5"}
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-all duration-500"
            animate={isHovered ? { strokeWidth: 2.5 } : { strokeWidth: 2 }}
          />

          {/* Glowing Antler Tips (Stars) */}
          <motion.circle
            cx="18" cy="10" r="1.5"
            fill="#f2ca50"
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
          />
          <motion.circle
            cx="82" cy="10" r="1.5"
            fill="#f2ca50"
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
          />
          <motion.circle
            cx="14" cy="8" r="1"
            fill="#c9beff"
            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
          />
          <motion.circle
            cx="86" cy="8" r="1"
            fill="#c9beff"
            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
          />

          {/* Ears / Telinga Rusa */}
          <motion.path
            d="M 33,48 Q 20,43 28,52 Z"
            fill="#171837"
            stroke="#dcd3b5"
            strokeWidth="1.5"
            animate={isHovered ? { rotate: [-2, 4, -2] } : { rotate: 0 }}
            className="origin-right"
          />
          <motion.path
            d="M 67,48 Q 80,43 72,52 Z"
            fill="#171837"
            stroke="#dcd3b5"
            strokeWidth="1.5"
            animate={isHovered ? { rotate: [2, -4, 2] } : { rotate: 0 }}
            className="origin-left"
          />

          {/* Deer Face Head Structure */}
          <path
            d="M 35,46 L 65,46 L 58,74 Q 50,82 42,74 Z"
            fill="#171837"
            stroke="#dcd3b5"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Celestial Forehead Star Marks */}
          <polygon
            points="50,49 52,53 56,53 53,55 54,59 50,57 46,59 47,55 44,53 48,53"
            fill="#f2ca50"
            className="animate-pulse"
          />
          <line x1="50" y1="52" x2="50" y2="60" stroke="#f2ca50" strokeWidth="0.5" />
          <line x1="46" y1="56" x2="54" y2="56" stroke="#f2ca50" strokeWidth="0.5" />

          {/* Eyes / Mata (Interactive blinking & gaze) */}
          {!isBlinking ? (
            <>
              {/* Left Eye */}
              <circle cx="41" cy="61" r="3.5" fill="#0f102f" stroke="#dcd3b5" strokeWidth="0.5" />
              {/* Left Pupil with lookDirection shift */}
              <circle
                cx={41 + pupilOffset.x}
                cy={61 + pupilOffset.y}
                r="2"
                fill="#fcf8ee"
              />
              <circle
                cx={40 + pupilOffset.x}
                cy={60 + pupilOffset.y}
                r="0.75"
                fill="#ffffff"
              />

              {/* Right Eye */}
              <circle cx="59" cy="61" r="3.5" fill="#0f102f" stroke="#dcd3b5" strokeWidth="0.5" />
              {/* Right Pupil with lookDirection shift */}
              <circle
                cx={59 + pupilOffset.x}
                cy={61 + pupilOffset.y}
                r="2"
                fill="#fcf8ee"
              />
              <circle
                cx={58 + pupilOffset.x}
                cy={60 + pupilOffset.y}
                r="0.75"
                fill="#ffffff"
              />
            </>
          ) : (
            <>
              {/* Blinking eyes closed */}
              <path d="M 37.5,61 Q 41,63 44.5,61" fill="none" stroke="#dcd3b5" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 55.5,61 Q 59,63 62.5,61" fill="none" stroke="#dcd3b5" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}

          {/* Snout / Nose Area */}
          <path d="M 46,74 Q 50,71 54,74 Q 50,81 46,74 Z" fill="#0f102f" stroke="#f2ca50" strokeWidth="1" />
          <circle cx="50" cy="73.5" r="1" fill="#fcf8ee" />

          {/* Soft Cheeks - Pink subtle glow when hovered */}
          <ellipse
            cx="37" cy="66" rx="2.5" ry="1.5"
            fill="#e29bb3"
            opacity={isHovered ? 0.4 : 0.15}
            className="transition-all duration-300"
          />
          <ellipse
            cx="63" cy="66" rx="2.5" ry="1.5"
            fill="#e29bb3"
            opacity={isHovered ? 0.4 : 0.15}
            className="transition-all duration-300"
          />
        </motion.svg>
      </div>

      {/* Brand Title: mindquest (strictly lowercase, minimal, elegant) */}
      <div className="mt-1 text-center">
        <span className="font-serif text-lg tracking-[0.25em] text-vellum font-semibold uppercase block hover:text-gold transition-colors">
          mindquest
        </span>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <span className="h-px w-3 bg-gold/30"></span>
          <span className="text-[9px] uppercase tracking-[0.15em] text-gold/60 font-mono">
            Rusa Berbintang
          </span>
          <span className="h-px w-3 bg-gold/30"></span>
        </div>
      </div>
    </div>
  );
};
