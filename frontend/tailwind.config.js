/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        cyber: {
          bg: '#080C16',
          surface: '#0F172A',
          card: 'rgba(17, 24, 39, 0.75)',
          border: 'rgba(51, 65, 85, 0.6)',
          borderBright: 'rgba(71, 85, 105, 0.9)',
          muted: '#94A3B8',
          text: '#F8FAFC',
        },
        tester: {
          cyan: '#06B6D4',
          emerald: '#10B981',
          glow: 'rgba(6, 182, 212, 0.35)',
        },
        dev: {
          purple: '#8B5CF6',
          indigo: '#6366F1',
          glow: 'rgba(139, 92, 246, 0.35)',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -4px rgba(6, 182, 212, 0.45)',
        'glow-purple': '0 0 25px -4px rgba(139, 92, 246, 0.45)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.45)',
        'glow-crimson': '0 0 25px -4px rgba(239, 68, 68, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora': 'aurora 15s ease infinite alternate',
      },
      keyframes: {
        aurora: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.1) translate(2%, 2%)' },
        }
      }
    },
  },
  plugins: [],
}
