/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#534AB7',
        midnight: '#0a0b22',
        'space-deep': '#0f102f',
        'space-light': '#171837',
        'space-bright': '#262747',
        gold: '#f2ca50',
        'gold-dark': '#b89324',
        'magic-purple': '#473b86',
        'magic-light': '#c9beff',
        vellum: '#fcf8ee',
        'vellum-dark': '#d5caa3',
        // Tambahan tone warna per mood
        'mood-senang': '#fef3c7',
        'mood-gelisah': '#dbeafe',
        'mood-lelah': '#f3f4f6',
        'mood-marah': '#fce7e7',
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Be Vietnam Pro", "Inter", "sans-serif"],
        mono: ["Be Vietnam Pro", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      letterSpacing: {
        ultrawide: '0.3em',
        superwide: '0.5em',
      },
      spacing: {
        '13': '3.25rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },
      screens: {
        'xs': '380px',
      },
      animation: {
        'shimmer': 'shimmer 2.5s linear infinite',
        'drift': 'drift 12s ease-in-out infinite',
        'inkBleed': 'inkBleed 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'breathe': 'breathe 5s ease-in-out infinite',
        'ripple': 'ripple 0.6s ease-out forwards',
        'letter-pop': 'letterPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(6px, -8px) rotate(1deg)' },
          '50%': { transform: 'translate(-4px, 4px) rotate(-0.5deg)' },
          '75%': { transform: 'translate(3px, -3px) rotate(0.5deg)' },
        },
        inkBleed: {
          '0%': { opacity: '0', filter: 'blur(8px)', transform: 'translateY(6px)' },
          '100%': { opacity: '1', filter: 'blur(0)', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.015)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
        letterPop: {
          '0%': { opacity: '0', transform: 'translateY(12px) rotate(-2deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotate(0deg)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    }
  },
  plugins: []
}
