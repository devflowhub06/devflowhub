/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // DevFlowHub Ultra-Strong Design System (from spec)
        'bg-900': '#071826', // Background deep base
        'surface-800': '#0f2630', // Container / card surface
        'accent-gradient': 'linear-gradient(90deg, #09c6f9 0%, #7b61ff 100%)', // Primary CTA gradient
        'accent-warn': '#ff7a1a', // Secondary / action / orange
        'cyan-500': '#2bd3ff', // Cyan mid accents
        'purple-500': '#7b61ff', // Electric purple
        'text-100': '#ffffff', // Neutral text headlines
        'muted-70': '#8ea1aa', // Muted text
        'success-50': '#3ad07f', // Success/green for badges
        'body-text': '#bcd1d9', // Body text (4.5:1 contrast)
        
        // Legacy support
        'bg-800': '#0f2630',
        'bg-elev': 'rgba(255,255,255,0.02)',
        'blue-500': '#2bd3ff',
        'blue-600': '#09c6f9',
        'violet-500': '#7b61ff',
        'orange-500': '#ff7a1a',
        'orange-400': '#ff7a1a',
        'text-primary': '#ffffff',
        'text-muted': '#bcd1d9',
        'mono-code': '#3ad07f',
        'mono-green': '#3ad07f',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(90deg, #09c6f9 0%, #7b61ff 100%)',
        'primary-gradient': 'linear-gradient(90deg, #09c6f9 0%, #7b61ff 100%)',
        'secondary-gradient': 'linear-gradient(90deg, #2bd3ff 0%, #09c6f9 100%)',
        'warm-gradient': 'linear-gradient(90deg, #ff7a1a 0%, #ff7a1a 100%)',
        'neon-glow': '0 10px 40px rgba(9,198,249,0.08)',
        'card-shadow': '0 30px 60px rgba(7,24,38,0.6)',
        'inset-light': 'inset 0 1px 0 rgba(255,255,255,0.02)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Source Code Pro', 'monospace'],
      },
      boxShadow: {
        'neon-sm': '0 8px 30px rgba(9,198,249,0.06)',
        'neon-md': '0 10px 40px rgba(9,198,249,0.08)',
        'neon-lg': '0 20px 60px rgba(9,198,249,0.12)',
        'card-elevated': '0 30px 60px rgba(7,24,38,0.6), inset 0 1px 0 rgba(255,255,255,0.02)',
      },
      fontSize: {
        'fluid-xl': 'clamp(2.2rem, 3.2vw, 5rem)',
        'fluid-lg': 'clamp(1.5rem, 2.5vw, 3rem)',
        'fluid-md': 'clamp(1.125rem, 1.5vw, 1.5rem)',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '120rem',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "blob": {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 2s infinite",
        "blob": "blob 7s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 