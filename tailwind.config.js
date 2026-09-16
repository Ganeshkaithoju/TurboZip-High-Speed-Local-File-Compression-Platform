/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090b10',
        surface: {
          DEFAULT: '#0f141f',
          subtle: '#141b2a',
          hover: '#1a2336',
          border: '#202c44',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        cyan: {
          glow: '#00f2fe',
          dim: '#00838f',
        },
        accent: {
          blue: '#3b82f6',
          violet: '#8b5cf6',
          emerald: '#10b981',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(16, 185, 129, 0.15)',
        'glow-cyan': '0 0 20px -3px rgba(0, 242, 254, 0.18)',
        'glow-core': '0 0 35px -5px rgba(56, 189, 248, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 18s linear infinite',
      }
    },
  },
  plugins: [],
}
