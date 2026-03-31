import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mystic: {
          dark: '#080808',
          charcoal: '#1a1a1a',
          gold: '#C5A059',
          amber: '#FFD700',
          red: '#8B0000',
          paper: '#F2E8C9',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif TC"', 'serif'],
        calligraphy: ['"Ma Shan Zheng"', 'cursive'],
        sans: ['"Inter"', 'sans-serif'],
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        smoke: 'smoke 3s ease-in-out infinite alternate',
        toss: 'toss 0.8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        marquee: 'marquee 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        smoke: {
          '0%': { opacity: 0.3, transform: 'translateY(0) scale(1)' },
          '100%': { opacity: 0.7, transform: 'translateY(-20px) scale(1.1)' },
        },
        toss: {
          '0%': { transform: 'translateY(0) rotateX(0) rotateZ(0) scale(1)' },
          '25%': { transform: 'translateY(-100px) rotateX(180deg) rotateZ(45deg) scale(1.1)' },
          '50%': { transform: 'translateY(-120px) rotateX(360deg) rotateZ(90deg) scale(1.1)' },
          '75%': { transform: 'translateY(-50px) rotateX(540deg) rotateZ(135deg) scale(1.05)' },
          '100%': { transform: 'translateY(0) rotateX(720deg) rotateZ(180deg) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [typography],
};
