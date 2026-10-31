/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vietnam: {
          red: '#DA251D',
          darkred: '#990000',
          crimson: '#B31B1B',
          gold: '#FFFF00',
          yellow: '#FFD700',
          amber: '#FFBF00',
        },
        military: {
          dark: '#0D130E',
          surface: '#18231B',
          card: '#1F2E23',
          border: '#2E4434',
          accent: '#4C7A57',
          olive: '#556B2F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
