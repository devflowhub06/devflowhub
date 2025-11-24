'use client'

import { useState, useEffect } from 'react'
import { trackCTAClick } from '@/lib/analytics'

// Enhanced A/B Testing Infrastructure
export interface ABTestVariant {
  id: string
  name: string
  weight: number
  config: Record<string, any>
}

export interface ABTest {
  id: string
  name: string
  variants: ABTestVariant[]
  isActive: boolean
  startDate: string
  endDate?: string
}

// Predefined A/B Tests
export const AB_TESTS: Record<string, ABTest> = {
  hero_copy: {
    id: 'hero_copy',
    name: 'Hero Copy Variants',
    isActive: true,
    startDate: '2024-01-01',
    variants: [
      {
        id: 'A',
        name: 'Ship real products with AI',
        weight: 33,
        config: {
          headline: "Ship real products with AI.",
          subhead: "Unified AI workspaces that keep full project context across ideation, code, testing and deployment.",
          cta: "Start Free Trial",
          microcopy: "No credit card required."
        }
      },
      {
        id: 'B', 
        name: 'Ship faster with an AI development OS',
        weight: 33,
        config: {
          headline: "Ship faster with an AI development OS.",
          subhead: "Unified AI workspaces that keep full project context across ideation, code, testing and deployment.",
          cta: "Start Free Trial",
          microcopy: "No credit card required."
        }
      },
      {
        id: 'C',
        name: 'From idea to production — one AI-powered workspace',
        weight: 34,
        config: {
          headline: "From idea to production — one AI-powered workspace.",
          subhead: "Unified AI workspaces that keep full project context across ideation, code, testing and deployment.",
          cta: "Start Free Trial",
          microcopy: "No credit card required."
        }
      }
    ]
  },
  cta_color: {
    id: 'cta_color',
    name: 'CTA Color Variants',
    isActive: true,
    startDate: '2024-01-01',
    variants: [
      {
        id: 'gradient',
        name: 'Cyan-Purple Gradient',
        weight: 50,
        config: {
          className: 'accent-gradient',
          gradient: 'linear-gradient(90deg, #09c6f9 0%, #7b61ff 100%)'
        }
      },
      {
        id: 'orange',
        name: 'Orange Accent',
        weight: 50,
        config: {
          className: 'bg-accent-warn',
          gradient: 'linear-gradient(90deg, #ff7a1a 0%, #ff7a1a 100%)'
        }
      }
    ]
  }
}

// A/B Testing Hook
export function useABTest(testId: string): ABTestVariant | null {
  const [variant, setVariant] = useState<ABTestVariant | null>(null)

  useEffect(() => {
    const test = AB_TESTS[testId]
    if (!test || !test.isActive) {
      setVariant(null)
      return
    }

    // Get or create user's variant assignment
    const storageKey = `ab_test_${testId}`
    const storedVariant = localStorage.getItem(storageKey)
    
    if (storedVariant) {
      const variant = test.variants.find(v => v.id === storedVariant)
      if (variant) {
        setVariant(variant)
        return
      }
    }

    // Assign new variant based on weights
    const assignedVariant = assignVariant(test.variants)
    if (assignedVariant) {
      localStorage.setItem(storageKey, assignedVariant.id)
      setVariant(assignedVariant)
      
      // Track variant assignment
      trackCTAClick('AB Test Assignment', 'system', `${testId}-${assignedVariant.id}`)
    }
  }, [testId])

  return variant
}

// Helper function to assign variant based on weights
function assignVariant(variants: ABTestVariant[]): ABTestVariant | null {
  const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0)
  const random = Math.random() * totalWeight
  
  let currentWeight = 0
  for (const variant of variants) {
    currentWeight += variant.weight
    if (random <= currentWeight) {
      return variant
    }
  }
  
  return variants[0] // Fallback
}

// Analytics tracking for A/B tests
export function trackABTestEvent(
  testId: string, 
  variantId: string, 
  event: string, 
  properties: Record<string, any> = {}
) {
  trackCTAClick(event as any, 'ab_test', `${testId}-${variantId}`)
}

// Get all active tests
export function getActiveTests(): ABTest[] {
  return Object.values(AB_TESTS).filter(test => test.isActive)
}

// Check if test is active
export function isTestActive(testId: string): boolean {
  const test = AB_TESTS[testId]
  return test ? test.isActive : false
}

// Get test configuration
export function getTestConfig(testId: string): ABTest | null {
  return AB_TESTS[testId] || null
}
