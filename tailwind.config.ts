import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        body: ['Poppins', 'sans-serif'],
        headline: ['Poppins', 'sans-serif'],
      },
      fontWeight: {
        headline: '900',
      },
      colors: {
        border: "hsl(0 0% 82.4%)",
        input: "hsl(0 0% 82.4%)",
        ring: "hsl(190 52% 80%)",
        background: "hsl(0 0% 96.1%)",
        foreground: "hsl(0 0% 41.2%)",
        primary: {
          DEFAULT: "hsl(190 52% 80%)",
          foreground: "hsl(0 0% 41.2%)",
        },
        secondary: {
          DEFAULT: "hsl(0 0% 82.4%)",
          foreground: "hsl(0 0% 41.2%)",
        },
        destructive: {
          DEFAULT: "hsl(0 100% 50%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(0 0% 96.1%)",
          foreground: "hsl(0 0% 41.2%)",
        },
        accent: {
          DEFAULT: "hsl(190 52% 80%)",
          foreground: "hsl(0 0% 41.2%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 96.1%)",
          foreground: "hsl(0 0% 41.2%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(0 0% 41.2%)",
        },
        chart: {
          "1": "hsl(190 52% 80%)",
          "2": "hsl(0 0% 82.4%)",
          "3": "hsl(190 52% 70%)",
          "4": "hsl(0 0% 72.4%)",
          "5": "hsl(190 52% 60%)",
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
