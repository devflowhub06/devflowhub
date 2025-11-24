/**
 * DevFlowHub Design Tokens
 * Production-ready design system for Homepage v3.0
 */

export const DESIGN_TOKENS = {
  // Color Palette - Deep cosmos-grade canvas + bright gradients
  colors: {
    // Primary background
    background: {
      primary: '#081022', // Deep navy/near-black
      secondary: '#0f1724', // Slightly lighter navy
      tertiary: '#1e293b', // Card backgrounds
    },
    
    // Accent gradients (teal → cyan → indigo)
    accent: {
      teal: '#00D4FF',
      cyan: '#4AC6FF', 
      indigo: '#9B6BFF',
      // Gradient combinations
      primary: 'linear-gradient(135deg, #00D4FF 0%, #4AC6FF 50%, #9B6BFF 100%)',
      secondary: 'linear-gradient(90deg, #00D4FF 0%, #9B6BFF 100%)',
      hover: 'linear-gradient(135deg, #00E5FF 0%, #5AD6FF 50%, #AB7BFF 100%)',
    },
    
    // Secondary accents
    success: '#00E4A1', // Lime/green for success states
    warning: '#FFB800',
    error: '#FF6B6B',
    
    // Text colors
    text: {
      primary: '#FFFFFF',
      secondary: '#E2E8F0', // Light gray
      tertiary: '#94A3B8', // Medium gray
      muted: '#64748B', // Dark gray
    },
    
    // Glass morphism
    glass: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.1)',
      backdrop: 'blur(12px)',
    },
    
    // Shadows
    shadow: {
      card: '0 14px 40px rgba(4, 9, 19, 0.6)',
      cardHover: '0 20px 60px rgba(4, 9, 19, 0.8)',
      glow: '0 0 40px rgba(0, 212, 255, 0.3)',
    }
  },
  
  // Typography
  typography: {
    fontFamily: {
      display: ['Inter', 'system-ui', 'sans-serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },
    
    fontSize: {
      // Fluid typography using clamp()
      hero: 'clamp(2.5rem, 7vw, 5.5rem)', // 40px - 88px
      h1: 'clamp(2rem, 5vw, 4rem)', // 32px - 64px
      h2: 'clamp(1.75rem, 4vw, 3rem)', // 28px - 48px
      h3: 'clamp(1.5rem, 3vw, 2.25rem)', // 24px - 36px
      body: 'clamp(1rem, 1.2vw, 1.25rem)', // 16px - 20px
      small: 'clamp(0.875rem, 1vw, 1rem)', // 14px - 16px
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    
    lineHeight: {
      tight: 1.1,
      snug: 1.2,
      normal: 1.5,
      relaxed: 1.6,
      loose: 1.8,
    },
    
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
    }
  },
  
  // Spacing scale (8px base)
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    32: '8rem', // 128px
    40: '10rem', // 160px
    48: '12rem', // 192px
    64: '16rem', // 256px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem', // 4px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem', // 32px
    full: '9999px',
  },
  
  // Animation timing
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
    },
    
    easing: {
      // cubic-bezier(.22,.9,.4,1) - smooth, natural
      smooth: 'cubic-bezier(0.22, 0.9, 0.4, 1)',
      // cubic-bezier(.4,0,.2,1) - material design
      material: 'cubic-bezier(0.4, 0, 0.2, 1)',
      // cubic-bezier(.25,.46,.45,.94) - ease-out-quad
      easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '4xl': '2560px',
  },
  
  // Container max widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1440px', // Max width for homepage
    '4xl': '2560px',
  }
} as const

/**
 * Tailwind CSS configuration snippet
 * Add this to your tailwind.config.js
 */
export const TAILWIND_CONFIG = {
  theme: {
    extend: {
      colors: {
        'dfh-bg': DESIGN_TOKENS.colors.background.primary,
        'dfh-bg-secondary': DESIGN_TOKENS.colors.background.secondary,
        'dfh-accent-teal': DESIGN_TOKENS.colors.accent.teal,
        'dfh-accent-cyan': DESIGN_TOKENS.colors.accent.cyan,
        'dfh-accent-indigo': DESIGN_TOKENS.colors.accent.indigo,
        'dfh-success': DESIGN_TOKENS.colors.success,
        'dfh-text-primary': DESIGN_TOKENS.colors.text.primary,
        'dfh-text-secondary': DESIGN_TOKENS.colors.text.secondary,
        'dfh-text-tertiary': DESIGN_TOKENS.colors.text.tertiary,
      },
      fontFamily: {
        'display': DESIGN_TOKENS.typography.fontFamily.display,
        'body': DESIGN_TOKENS.typography.fontFamily.body,
        'mono': DESIGN_TOKENS.typography.fontFamily.mono,
      },
      fontSize: DESIGN_TOKENS.typography.fontSize,
      fontWeight: DESIGN_TOKENS.typography.fontWeight,
      lineHeight: DESIGN_TOKENS.typography.lineHeight,
      letterSpacing: DESIGN_TOKENS.typography.letterSpacing,
      spacing: DESIGN_TOKENS.spacing,
      borderRadius: DESIGN_TOKENS.borderRadius,
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.6)' },
        },
      },
      maxWidth: DESIGN_TOKENS.container,
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    // Add custom utilities
    function({ addUtilities }: any) {
      const newUtilities = {
        '.glass-panel': {
          background: DESIGN_TOKENS.colors.glass.background,
          border: `1px solid ${DESIGN_TOKENS.colors.glass.border}`,
          backdropFilter: DESIGN_TOKENS.colors.glass.backdrop,
        },
        '.gradient-text': {
          background: DESIGN_TOKENS.colors.accent.primary,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
        '.gradient-border': {
          background: DESIGN_TOKENS.colors.accent.primary,
          padding: '1px',
          borderRadius: DESIGN_TOKENS.borderRadius.xl,
        },
        '.card-hover': {
          transition: `all ${DESIGN_TOKENS.animation.duration.normal} ${DESIGN_TOKENS.animation.easing.smooth}`,
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: DESIGN_TOKENS.colors.shadow.cardHover,
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
}

/**
 * CSS Custom Properties for runtime theming
 */
export const CSS_CUSTOM_PROPERTIES = `
:root {
  --dfh-bg-primary: ${DESIGN_TOKENS.colors.background.primary};
  --dfh-bg-secondary: ${DESIGN_TOKENS.colors.background.secondary};
  --dfh-accent-teal: ${DESIGN_TOKENS.colors.accent.teal};
  --dfh-accent-cyan: ${DESIGN_TOKENS.colors.accent.cyan};
  --dfh-accent-indigo: ${DESIGN_TOKENS.colors.accent.indigo};
  --dfh-success: ${DESIGN_TOKENS.colors.success};
  --dfh-text-primary: ${DESIGN_TOKENS.colors.text.primary};
  --dfh-text-secondary: ${DESIGN_TOKENS.colors.text.secondary};
  --dfh-text-tertiary: ${DESIGN_TOKENS.colors.text.tertiary};
  --dfh-glass-bg: ${DESIGN_TOKENS.colors.glass.background};
  --dfh-glass-border: ${DESIGN_TOKENS.colors.glass.border};
  --dfh-shadow-card: ${DESIGN_TOKENS.colors.shadow.card};
  --dfh-shadow-glow: ${DESIGN_TOKENS.colors.shadow.glow};
}
`
