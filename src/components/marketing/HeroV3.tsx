'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { trackCTAClick } from '@/lib/analytics'
import HeroInteractiveDemo from './HeroInteractiveDemo'

export default function HeroV3() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-bg-900 overflow-hidden pt-20">
      {/* Clean background - no distracting animations */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-900 via-bg-900 to-surface-800" />
      
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.1] mb-4 sm:mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
              Build Production Apps
            </span>
            <br />
            <span className="text-accent-warn">10x Faster</span>
            {' '}
            <span className="text-white">with AI</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            The only AI Development OS that unifies ideation, coding, testing, design, and deployment 
            <br className="hidden md:block" />
            {' '}with intelligent context across all workspaces.
          </p>

          {/* Key Differentiator Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8 backdrop-blur-sm">
            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-accent-warn" />
            <span className="text-white text-xs sm:text-sm font-medium">
              Complete Development OS • Not Just a Code Editor
            </span>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 px-2">
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-accent-warn text-white font-bold text-base sm:text-lg md:text-xl rounded-xl transition-all duration-200 hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-105"
              onClick={() => trackCTAClick('Start Free Trial', 'hero', 'gradient')}
            >
              Start Building Free
              <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            
            <Link
              href="/book-demo"
              className="group inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 border-2 border-white/20 text-white hover:text-accent-warn hover:border-accent-warn rounded-xl font-bold text-base sm:text-lg md:text-xl transition-all duration-200 hover:bg-white/5"
              onClick={() => trackCTAClick('Book a Demo', 'hero', 'gradient')}
            >
              Book Demo
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-gray-400 text-xs sm:text-sm px-2 mb-8 sm:mb-12">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full" />
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              <span>Free forever tier</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full" />
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              <span>Setup in 2 minutes</span>
            </div>
          </div>

          {/* Interactive AI Demo */}
          <div className="max-w-5xl mx-auto w-full mt-12 sm:mt-16 px-2">
            <HeroInteractiveDemo />
          </div>

          {/* Social Proof Numbers */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto mt-12 sm:mt-16 px-2">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">2,000+</div>
              <div className="text-gray-400 text-xs sm:text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">27</div>
              <div className="text-gray-400 text-xs sm:text-sm">Countries Worldwide</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}