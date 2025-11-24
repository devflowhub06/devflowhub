'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Play, Sparkles } from 'lucide-react'

export default function CTAJoin() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useTransform(mouseY, [-300, 300], [10, -10])
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = e.currentTarget as Element
      if (rect) {
        const { left, top, width, height } = rect.getBoundingClientRect()
        const x = e.clientX - left - width / 2
        const y = e.clientY - top - height / 2
        setMousePosition({ x, y })
        mouseX.set(x)
        mouseY.set(y)
      }
    }

    const element = document.getElementById('cta-section')
    if (element) {
      element.addEventListener('mousemove', handleMouseMove)
      return () => element.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mouseX, mouseY])

  return (
    <section id="cta-section" className="py-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x + 50}% ${mousePosition.y + 50}%, rgba(38, 214, 255, 0.2) 0%, transparent 70%)`
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 2xl:px-20 relative">
        <motion.div
          className="glass-panel p-16 text-center max-w-4xl mx-auto"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          {/* Sparkle Icon */}
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          {/* Main Headline */}
          <motion.h2 
            className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-white mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Build the Future.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              Ship with AI.
            </span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p 
            className="text-[clamp(1.1rem,1.5vw,1.25rem)] text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Join thousands of developers who are already building the future with AI. 
            Start your journey with DevFlowHub's unified AI development platform.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button
              onClick={() => router.push('/signup')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-12 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-3 hover:shadow-[0_0_40px_rgba(56,189,248,0.8)] transition-all duration-300 hover:scale-105"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => router.push('/book-demo')}
              className="glass-panel text-white px-12 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-3 hover:border-white/30 transition-all duration-300 hover:scale-105"
            >
              <Play className="w-5 h-5" />
              <span>Book a Demo</span>
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="mt-12 pt-8 border-t border-white/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-sm">Free forever plan</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span className="text-sm">Setup in 2 minutes</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
