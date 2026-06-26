/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm paper, not stark white — reduces glare for light-sensitive readers
        paper: {
          light: '#FAF7F1',
          DEFAULT: '#FAF7F1',
          dark: '#1B1D21',
        },
        ink: {
          light: '#262420',
          dark: '#EDEAE3',
        },
        // Calm focus blue — primary actions
        focus: {
          50: '#EEF2F7',
          100: '#D7E1EC',
          400: '#5B7DA3',
          500: '#3D5A80',
          600: '#314A68',
          700: '#263A52',
        },
        // Warm amber — reserved ONLY for "explain this" / read-aloud highlight signal
        signal: {
          100: '#FBE8D3',
          300: '#F0BD83',
          500: '#E0944B',
          600: '#C97A33',
        },
        // Quiet sage — success / correct states
        sage: {
          100: '#DEEBE3',
          500: '#4F8A6D',
          600: '#3D6E56',
        },
        // Soft rose — incorrect / gentle error, never harsh red
        rose: {
          100: '#F4E2DE',
          500: '#B5604E',
        },
      },
      fontFamily: {
        // Display face — Lexend is engineered to improve reading proficiency
        display: ['Lexend', 'system-ui', 'sans-serif'],
        // Body face — Atkinson Hyperlegible, built by the Braille Institute for legibility
        body: ['Atkinson Hyperlegible', 'system-ui', 'sans-serif'],
        // Dyslexia-friendly alternative, toggled via AccessibilityContext
        dyslexic: ['OpenDyslexic', 'Comic Sans MS', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        'reader-wide': '0.02em',
        'reader-wider': '0.04em',
        'reader-widest': '0.08em',
      },
      lineHeight: {
        'reader-loose': '1.8',
        'reader-relaxed': '2.1',
        'reader-airy': '2.5',
      },
      keyframes: {
        wordWash: {
          '0%': { backgroundColor: 'rgba(224,148,75,0)' },
          '30%': { backgroundColor: 'rgba(224,148,75,0.35)' },
          '100%': { backgroundColor: 'rgba(224,148,75,0)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'word-wash': 'wordWash 0.6s ease-out',
        'rise-in': 'riseIn 0.35s ease-out',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
