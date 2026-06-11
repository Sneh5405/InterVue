export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#05080e',
          900: '#090d16',
          800: '#121824',
          700: '#1b2332',
          600: '#253043',
          500: '#3b4b66',
          400: '#62789c',
          300: '#8fa3c2',
          200: '#bdcbdc',
          100: '#e4ebf5',
        },
        indigo: {
          950: '#0d0024',
          900: '#1e004a',
          800: '#2f006b',
          700: '#4d009e',
          600: '#6b00d7',
          500: '#8b00ff',
          400: '#a23bff',
          300: '#be75ff',
          200: '#dcb0ff',
          100: '#f3e6ff',
        },
        blue: {
          950: '#001a1f',
          900: '#003740',
          800: '#005966',
          700: '#007b8c',
          600: '#009fb3',
          500: '#00f2fe',
          400: '#46f5ff',
          300: '#80f7ff',
          200: '#b3fbff',
          100: '#e6fdff',
        },
        emerald: {
          500: '#39ff14',
          400: '#74ff5c',
          600: '#22ce00',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: []
}

