'use client'

import { Suspense, useEffect, useCallback } from 'react'
import NavbarV3 from '@/components/marketing/NavbarV3'
import HeroV3 from '@/components/marketing/HeroV3'
import WorkspacesGrid from '@/components/marketing/WorkspacesGrid'
import ImpactMetrics from '@/components/marketing/ImpactMetrics'
import FAQ from '@/components/marketing/FAQ'
import FooterV3 from '@/components/marketing/FooterV3'
import CompetitiveAdvantage from '@/components/marketing/CompetitiveAdvantage'
import PricingSection from '@/components/marketing/PricingSection'
import StructuredData from '@/components/marketing/StructuredData'
import InteractiveProductTour from '@/components/marketing/InteractiveProductTour'
import EnterpriseAssurance from '@/components/marketing/EnterpriseAssurance'
import { analytics } from '@/lib/analytics'
import { usePerformanceOptimization, useAccessibility } from '@/lib/performance-accessibility'

export default function MarketingPage() {
  // Initialize performance optimizations and accessibility features
  usePerformanceOptimization()
  const { announceToScreenReader } = useAccessibility()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    // Announce page load to screen readers
    announceToScreenReader('DevFlowHub homepage loaded. Use Tab to navigate through sections.')
    
    // Report performance metrics after page load
    const timer = setTimeout(() => {
      try {
        const { performanceMonitor } = require('@/lib/performance-accessibility')
        performanceMonitor.reportMetrics()
      } catch (error) {
        console.warn('Performance monitoring not available:', error)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [announceToScreenReader])

  return (
    <div className="min-h-screen bg-bg-900">
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-500 text-white px-4 py-2 rounded z-50"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      {/* Sticky Navigation */}
      <Suspense fallback={null}>
        <NavbarV3 />
      </Suspense>

      {/* Hero Section */}
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-text-primary text-xl">Loading...</div>
        </div>
      }>
        <main id="main-content" role="main" aria-label="Main content">
          <HeroV3 />

          <Suspense fallback={null}>
            <InteractiveProductTour />
          </Suspense>

          <Suspense fallback={null}>
            <EnterpriseAssurance />
          </Suspense>

          {/* Workspaces Grid */}
          <Suspense fallback={null}>
            <WorkspacesGrid />
          </Suspense>

          {/* Impact Metrics */}
          <Suspense fallback={null}>
            <ImpactMetrics />
          </Suspense>

          {/* Competitive Advantage */}
          <Suspense fallback={null}>
            <CompetitiveAdvantage />
          </Suspense>

          {/* Pricing Section */}
          <Suspense fallback={null}>
            <PricingSection />
          </Suspense>

          {/* FAQ Section */}
          <Suspense fallback={null}>
            <FAQ />
          </Suspense>
        </main>
      </Suspense>

      {/* Footer */}
      <Suspense fallback={null}>
        <FooterV3 />
      </Suspense>

      {/* Structured Data for SEO */}
      <StructuredData />
    </div>
  )
}