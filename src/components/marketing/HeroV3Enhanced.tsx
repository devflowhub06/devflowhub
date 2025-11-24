'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { 
  isFeatureEnabled, 
  getABTestVariant, 
  trackEvent, 
  ANALYTICS_EVENTS,
  HERO_COPY_VARIANTS 
} from '@/lib/feature-flags'

interface HeroVariant {
  headline: string
  subheadline: string
  ctaPrimary: string
  ctaSecondary: string
}

const HERO_VARIANTS: Record<string, HeroVariant> = {
  A: {
    headline: "Build the future. Ship with AI.",
    subheadline: "From idea to production in minutes — single platform, unified AI workspaces that keep context across tools.",
    ctaPrimary: "Start Free Trial",
    ctaSecondary: "Book a Demo"
  },
  B: {
    headline: "Ship faster with an AI Development OS",
    subheadline: "AI agents that understand your project. Build, test and deploy — without switching tools.",
    ctaPrimary: "Start Free Trial", 
    ctaSecondary: "Book a Demo"
  }
}

export default function HeroV3() {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [variant, setVariant] = useState<string>('A')
  const [isHomepageV3Enabled, setIsHomepageV3Enabled] = useState(false)

  // Initialize feature flags and A/B testing
  useEffect(() => {
    const homepageV3Enabled = isFeatureEnabled('HOMEPAGE_V3')
    setIsHomepageV3Enabled(homepageV3Enabled)

    if (homepageV3Enabled) {
      // Track homepage v3 launch
      trackEvent(ANALYTICS_EVENTS.HOMEPAGE_V3_LAUNCH, {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      })

      // Get A/B test variant
      const heroVariant = getABTestVariant('hero_copy')
      setVariant(heroVariant)
      
      // Track variant view
      const variantEvent = heroVariant === 'A' 
        ? ANALYTICS_EVENTS.HERO_VARIANT_A_VIEW 
        : ANALYTICS_EVENTS.HERO_VARIANT_B_VIEW
      
      trackEvent(variantEvent, {
        variant: heroVariant,
        timestamp: new Date().toISOString()
      })
    }
  }, [])

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleCTAClick = (ctaType: 'primary' | 'secondary') => {
    const eventName = ctaType === 'primary' 
      ? ANALYTICS_EVENTS.HOMEPAGE_CTA_START_TRIAL 
      : ANALYTICS_EVENTS.HOMEPAGE_CTA_BOOK_DEMO

    trackEvent(eventName, {
      variant,
      ctaType,
      timestamp: new Date().toISOString()
    })

    if (ctaType === 'primary') {
      router.push('/signup')
    } else {
      router.push('/book-demo')
    }
  }

  const currentVariant = HERO_VARIANTS[variant]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#081022] via-[#0f1724] to-[#081022]">
      {/* Animated Background with Mouse Tracking */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle 800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 212, 255, 0.15) 0%, rgba(155, 107, 255, 0.1) 30%, transparent 70%)`
        }}
      />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 2xl:px-20 w-full pt-32 pb-20 lg:pt-40 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#00D4FF]/20 to-[#9B6BFF]/20 border border-[#00D4FF]/30 text-[#00D4FF] text-sm font-medium mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4FF]"></span>
              </span>
              <span>AI Development OS</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              className="text-[clamp(2.5rem,7vw,5.5rem)] font-black text-white mb-6 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {currentVariant.headline.split('.')[0]}.
              <br />
              <span className="bg-gradient-to-r from-[#00D4FF] via-[#4AC6FF] to-[#9B6BFF] bg-clip-text text-transparent">
                {currentVariant.headline.split('.')[1] || 'Ship with AI'}
              </span>
            </motion.h1>

            <motion.p
              className="text-[clamp(1.1rem,1.5vw,1.25rem)] text-[#E2E8F0] mb-12 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {currentVariant.subheadline}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <button
                onClick={() => handleCTAClick('primary')}
                className="group relative bg-gradient-to-r from-[#00D4FF] to-[#4AC6FF] text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-[0_0_40px_rgba(0,212,255,0.6)] transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:ring-offset-2 focus:ring-offset-[#081022]"
                aria-label={`${currentVariant.ctaPrimary} — DevFlowHub`}
              >
                <span>{currentVariant.ctaPrimary}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button
                onClick={() => handleCTAClick('secondary')}
                className="group bg-[#1e293b]/50 backdrop-blur-sm border border-[#475569] text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:border-[#00D4FF]/50 hover:bg-[#1e293b]/70 transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:ring-offset-2 focus:ring-offset-[#081022]"
                aria-label={`${currentVariant.ctaSecondary} — DevFlowHub`}
              >
                <Play className="w-5 h-5" />
                <span>{currentVariant.ctaSecondary}</span>
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[#94A3B8] text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-[#00E4A1]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-[#00D4FF]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free plan available</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-[#9B6BFF]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Setup in 2 min</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual - AI OS Composition */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="relative w-full max-w-lg mx-auto">
              {/* Glass Card with Code Window */}
              <div 
                className="glass-panel p-6 rounded-2xl shadow-2xl border border-[#475569]/50"
                style={{
                  transform: shouldReduceMotion ? 'none' : `perspective(1000px) rotateX(${(mousePosition.y - window.innerHeight / 2) * 0.01}deg) rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.01}deg)`
                }}
              >
                {/* Code Window Header */}
                <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-[#475569]/50">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-[#94A3B8] font-mono">app.tsx</span>
                  </div>
                </div>

                {/* Code Preview */}
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex items-center space-x-3 text-[#94A3B8]">
                    <span className="text-[#00D4FF]">function</span>
                    <span className="text-[#9B6BFF]">Ship</span>
                    <span className="text-[#94A3B8]">()</span>
                    <span className="text-[#94A3B8]">{'{'}</span>
                  </div>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-[#FF6B6B]">return</span>
                      <span className="text-[#00E4A1]">&lt;</span>
                      <span className="text-[#4AC6FF]">AIWorkspace</span>
                      <span className="text-[#00E4A1]">/&gt;</span>
                    </div>
                  </div>
                  <div className="text-[#94A3B8]">{'}'}</div>
                </div>

                {/* Floating Workspace Icons */}
                <div className="absolute -top-4 -right-4 flex space-x-2">
                  <motion.div
                    className="glass-panel p-3 rounded-xl"
                    animate={shouldReduceMotion ? {} : {
                      y: [0, -8, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <svg className="w-6 h-6 text-[#00D4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </motion.div>
                  <motion.div
                    className="glass-panel p-3 rounded-xl"
                    animate={shouldReduceMotion ? {} : {
                      y: [0, -8, 0],
                      rotate: [0, -5, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2
                    }}
                  >
                    <svg className="w-6 h-6 text-[#9B6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </motion.div>
                </div>

                {/* Bottom Floating Icons */}
                <div className="absolute -bottom-4 -left-4 flex space-x-2">
                  <motion.div
                    className="glass-panel p-3 rounded-xl"
                    animate={shouldReduceMotion ? {} : {
                      y: [0, -6, 0],
                      rotate: [0, -3, 0],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <svg className="w-6 h-6 text-[#00E4A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </motion.div>
                  <motion.div
                    className="glass-panel p-3 rounded-xl"
                    animate={shouldReduceMotion ? {} : {
                      y: [0, -6, 0],
                      rotate: [0, 3, 0],
                    }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4
                    }}
                  >
                    <svg className="w-6 h-6 text-[#FFB800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Decorative Gradient Blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#00D4FF]/10 to-[#9B6BFF]/10 rounded-full blur-3xl -z-10"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
