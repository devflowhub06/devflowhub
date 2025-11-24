/**
 * Feature Flags for DevFlowHub
 * Controls rollout of new features and rebranding
 */

export interface FeatureFlag {
  name: string
  enabled: boolean
  description: string
  rolloutPercentage?: number
}

export const FEATURE_FLAGS = {
  // Rebranding feature flag
  REBRAND_V1_0: {
    name: 'rebrand_v1.0',
    enabled: process.env.NEXT_PUBLIC_REBRAND_V1_0 === 'true' || process.env.NODE_ENV === 'development',
    description: 'Enable DevFlowHub module rebranding (Editor, Sandbox, UI Studio, Deployer)',
    rolloutPercentage: 100
  },
  
  // AI Router feature flag
  AI_ROUTER: {
    name: 'ai_router',
    enabled: process.env.NEXT_PUBLIC_AI_ROUTER === 'true' || process.env.NODE_ENV === 'development',
    description: 'Enable unified AI Router service for module routing',
    rolloutPercentage: 100
  },

  // Homepage v3.0 feature flag
  HOMEPAGE_V3: {
    name: 'homepage_v3',
    enabled: process.env.NEXT_PUBLIC_HOMEPAGE_V3 === 'true' || process.env.NODE_ENV === 'development',
    description: 'Enable Homepage v3.0 with new design and A/B testing',
    rolloutPercentage: parseInt(process.env.NEXT_PUBLIC_HOMEPAGE_V3_ROLLOUT || '100')
  },

  // Hero copy A/B testing
  HERO_COPY_VARIANT: {
    name: 'hero_copy_variant',
    enabled: process.env.NEXT_PUBLIC_HERO_COPY_VARIANT === 'true' || process.env.NODE_ENV === 'development',
    description: 'Enable Hero copy A/B testing (A vs B variants)',
    rolloutPercentage: parseInt(process.env.NEXT_PUBLIC_HERO_COPY_ROLLOUT || '50')
  }
} as const

export type FeatureFlagName = keyof typeof FEATURE_FLAGS

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flagName: FeatureFlagName): boolean {
  const flag = FEATURE_FLAGS[flagName]
  
  if (!flag.enabled) {
    return false
  }
  
  // If rollout percentage is specified, use it
  if (flag.rolloutPercentage && flag.rolloutPercentage < 100) {
    // In a real implementation, you'd use user ID or session ID for consistent rollout
    const random = Math.random() * 100
    return random < flag.rolloutPercentage
  }
  
  return true
}

/**
 * Get feature flag configuration
 */
export function getFeatureFlag(flagName: FeatureFlagName): FeatureFlag {
  return FEATURE_FLAGS[flagName]
}

/**
 * Get all enabled feature flags
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([, flag]) => flag.enabled)
    .map(([name]) => name)
}

/**
 * A/B Testing utilities
 */
export interface ABTestVariant {
  id: string
  name: string
  weight: number
}

export const HERO_COPY_VARIANTS: Record<string, ABTestVariant> = {
  A: {
    id: 'A',
    name: 'Build the future. Ship with AI.',
    weight: 50
  },
  B: {
    id: 'B', 
    name: 'Ship faster with an AI Development OS',
    weight: 50
  }
}

/**
 * Get A/B test variant for user
 */
export function getABTestVariant(testName: string, userId?: string): string {
  // Use userId for consistent assignment, fallback to random
  const seed = userId ? userId : Math.random().toString()
  const hash = seed.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const random = Math.abs(hash) % 100
  
  if (testName === 'hero_copy') {
    return random < 50 ? 'A' : 'B'
  }
  
  return 'A' // default
}

/**
 * Analytics tracking utilities
 */
export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  userId?: string
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  // In production, integrate with your analytics service (Mixpanel, Amplitude, etc.)
  if (typeof window !== 'undefined') {
    console.log('Analytics Event:', { event, properties, timestamp: new Date().toISOString() })
    
    // Example integration with Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', event, properties)
    }
  }
}

export const ANALYTICS_EVENTS = {
  HOMEPAGE_V3_LAUNCH: 'Homepage_v3_Launch',
  HOMEPAGE_CTA_START_TRIAL: 'Homepage_CTA_StartTrial',
  HOMEPAGE_CTA_BOOK_DEMO: 'Homepage_CTA_BookDemo',
  HOMEPAGE_LINK_EXPLORE_WORKSPACE: 'Homepage_Link_ExploreWorkspace',
  HERO_VARIANT_A_VIEW: 'Hero_Variant_A_View',
  HERO_VARIANT_B_VIEW: 'Hero_Variant_B_View'
} as const
