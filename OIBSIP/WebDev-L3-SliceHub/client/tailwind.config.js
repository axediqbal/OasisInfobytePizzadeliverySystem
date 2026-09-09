/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'oklch(0.16 0.02 260)',
        surface: 'oklch(0.21 0.02 260)',
        'surface-elevated': 'oklch(0.26 0.02 260)',
        'surface-hover': 'oklch(0.24 0.02 260)',
        accent: {
          DEFAULT: 'oklch(0.68 0.19 35)',
          hover: 'oklch(0.74 0.19 35)',
          muted: 'oklch(0.68 0.19 35 / 0.15)',
        },
        success: {
          DEFAULT: 'oklch(0.72 0.17 145)',
          muted: 'oklch(0.72 0.17 145 / 0.15)',
        },
        warning: {
          DEFAULT: 'oklch(0.78 0.16 85)',
          muted: 'oklch(0.78 0.16 85 / 0.15)',
        },
        danger: {
          DEFAULT: 'oklch(0.65 0.22 25)',
          muted: 'oklch(0.65 0.22 25 / 0.15)',
        },
        primary: {
          text: 'oklch(0.95 0 0)',
          muted: 'oklch(0.65 0.01 260)',
        },
        border: 'oklch(1 0 0 / 0.08)',
        'border-strong': 'oklch(1 0 0 / 0.16)',
      },
      fontFamily: {
        display: ['"Clash Display"', '"General Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'input': '6px',
        'card': '12px',
        'modal': '20px',
      },
      boxShadow: {
        'warm': '0 8px 24px rgba(0, 0, 0, 0.35)',
        'warm-lg': '0 16px 36px rgba(0, 0, 0, 0.45)',
        'accent-glow': '0 0 25px oklch(0.68 0.19 35 / 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
