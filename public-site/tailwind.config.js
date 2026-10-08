/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        // Premium 2026 Palette
        sand: '#F7F5F0',       // Warm background instead of harsh white
        forest: '#2C423F',     // Deep, trustworthy dark green/slate
        blush: '#E8A598',      // Sophisticated playful accent
        sage: '#A6B3A8',       // Calm secondary
        stone: '#E5E2DC',      // Borders and subtle backgrounds
      },
      boxShadow: {
        'premium': '0 24px 48px -12px rgba(44, 66, 63, 0.08)',
        'premium-hover': '0 32px 64px -12px rgba(44, 66, 63, 0.12)',
        'glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'reveal-up': 'revealUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        revealUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
