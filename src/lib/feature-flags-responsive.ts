/**
 * Feature flags for responsive design rollout
 * Allows gradual enablement of responsive improvements
 */

export interface ResponsiveFeatureFlags {
  // Core responsive features
  FLUID_TYPOGRAPHY: boolean
  FLUID_SPACING: boolean
  RESPONSIVE_CONTAINERS: boolean
  RESPONSIVE_GRIDS: boolean
  
  // Advanced features
  CONTAINER_QUERIES: boolean
  RESIZE_OBSERVER: boolean
  TOUCH_OPTIMIZATIONS: boolean
  
  // Component-specific flags
  RESPONSIVE_DASHBOARD: boolean
  RESPONSIVE_WORKSPACE: boolean
  RESPONSIVE_MODALS: boolean
  RESPONSIVE_AI_ASSISTANT: boolean
  
  // Performance optimizations
  LAZY_LOADING: boolean
  REDUCED_MOTION: boolean
  HIGH_DPI_OPTIMIZATION: boolean
}

// Default configuration for different environments
const DEFAULT_FLAGS: ResponsiveFeatureFlags = {
  // Core features - enable by default
  FLUID_TYPOGRAPHY: true,
  FLUID_SPACING: true,
  RESPONSIVE_CONTAINERS: true,
  RESPONSIVE_GRIDS: true,
  
  // Advanced features - enable by default
  CONTAINER_QUERIES: true,
  RESIZE_OBSERVER: true,
  TOUCH_OPTIMIZATIONS: true,
  
  // Component features - enable by default
  RESPONSIVE_DASHBOARD: true,
  RESPONSIVE_WORKSPACE: true,
  RESPONSIVE_MODALS: true,
  RESPONSIVE_AI_ASSISTANT: true,
  
  // Performance features - enable by default
  LAZY_LOADING: true,
  REDUCED_MOTION: true,
  HIGH_DPI_OPTIMIZATION: true,
}

// Production configuration with gradual rollout
const PRODUCTION_FLAGS: ResponsiveFeatureFlags = {
  ...DEFAULT_FLAGS,
  
  // Gradual rollout percentages (0-100)
  RESPONSIVE_DASHBOARD: true, // 100% rollout
  RESPONSIVE_WORKSPACE: false, // 0% rollout initially
  RESPONSIVE_MODALS: true, // 100% rollout
  RESPONSIVE_AI_ASSISTANT: true, // 100% rollout
  
  // Performance features
  LAZY_LOADING: true,
  REDUCED_MOTION: true,
  HIGH_DPI_OPTIMIZATION: false, // 0% rollout initially
}

// Staging configuration
const STAGING_FLAGS: ResponsiveFeatureFlags = {
  ...DEFAULT_FLAGS,
  RESPONSIVE_WORKSPACE: true, // Enable in staging
  HIGH_DPI_OPTIMIZATION: true, // Test in staging
}

// Development configuration
const DEVELOPMENT_FLAGS: ResponsiveFeatureFlags = {
  ...DEFAULT_FLAGS,
  // All features enabled in development
}

/**
 * Get feature flags based on environment and user context
 */
export function getResponsiveFeatureFlags(
  userId?: string,
  environment: 'development' | 'staging' | 'production' = 'production'
): ResponsiveFeatureFlags {
  let flags: ResponsiveFeatureFlags

  switch (environment) {
    case 'development':
      flags = DEVELOPMENT_FLAGS
      break
    case 'staging':
      flags = STAGING_FLAGS
      break
    case 'production':
    default:
      flags = PRODUCTION_FLAGS
      break
  }

  // Apply gradual rollout logic for specific users
  if (userId && environment === 'production') {
    const userHash = hashUserId(userId)
    
    // Gradual rollout for workspace responsive features
    if (userHash % 100 < 25) { // 25% rollout
      flags.RESPONSIVE_WORKSPACE = true
    }
    
    // Gradual rollout for high DPI optimization
    if (userHash % 100 < 10) { // 10% rollout
      flags.HIGH_DPI_OPTIMIZATION = true
    }
  }

  return flags
}

/**
 * Check if a specific feature is enabled
 */
export function isResponsiveFeatureEnabled(
  feature: keyof ResponsiveFeatureFlags,
  userId?: string,
  environment?: 'development' | 'staging' | 'production'
): boolean {
  const flags = getResponsiveFeatureFlags(userId, environment)
  return flags[feature]
}

/**
 * Get feature flags for client-side usage
 */
export function getClientResponsiveFeatureFlags(): ResponsiveFeatureFlags {
  const environment = process.env.NODE_ENV as 'development' | 'staging' | 'production'
  
  // For client-side, we need to get user ID from session or context
  // This would typically be injected via props or context
  return getResponsiveFeatureFlags(undefined, environment)
}

/**
 * Simple hash function for user ID to enable consistent rollout
 */
function hashUserId(userId: string): number {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Feature flag overrides for testing
 */
export function setResponsiveFeatureFlagOverride(
  feature: keyof ResponsiveFeatureFlags,
  enabled: boolean
): void {
  if (typeof window !== 'undefined') {
    // Store in localStorage for testing
    localStorage.setItem(`responsive-flag-${feature}`, enabled.toString())
  }
}

/**
 * Get feature flag with override support
 */
export function getResponsiveFeatureFlagWithOverride(
  feature: keyof ResponsiveFeatureFlags,
  userId?: string,
  environment?: 'development' | 'staging' | 'production'
): boolean {
  // Check for override first
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem(`responsive-flag-${feature}`)
    if (override !== null) {
      return override === 'true'
    }
  }

  // Return normal feature flag value
  return isResponsiveFeatureEnabled(feature, userId, environment)
}

/**
 * Reset all feature flag overrides
 */
export function resetResponsiveFeatureFlagOverrides(): void {
  if (typeof window !== 'undefined') {
    const keys = Object.keys(DEFAULT_FLAGS) as (keyof ResponsiveFeatureFlags)[]
    keys.forEach(key => {
      localStorage.removeItem(`responsive-flag-${key}`)
    })
  }
}

/**
 * Feature flag configuration for different user segments
 */
export interface UserSegment {
  segment: 'beta' | 'early-adopter' | 'general' | 'enterprise'
  features: Partial<ResponsiveFeatureFlags>
}

const USER_SEGMENTS: UserSegment[] = [
  {
    segment: 'beta',
    features: {
      RESPONSIVE_WORKSPACE: true,
      HIGH_DPI_OPTIMIZATION: true,
      CONTAINER_QUERIES: true,
    }
  },
  {
    segment: 'early-adopter',
    features: {
      RESPONSIVE_WORKSPACE: true,
      HIGH_DPI_OPTIMIZATION: true,
    }
  },
  {
    segment: 'enterprise',
    features: {
      RESPONSIVE_WORKSPACE: true,
      LAZY_LOADING: false, // Disable for enterprise users who prefer immediate loading
    }
  },
  {
    segment: 'general',
    features: {
      // Default configuration
    }
  }
]

/**
 * Get feature flags for user segment
 */
export function getResponsiveFeatureFlagsForSegment(
  segment: string,
  baseFlags: ResponsiveFeatureFlags = DEFAULT_FLAGS
): ResponsiveFeatureFlags {
  const userSegment = USER_SEGMENTS.find(s => s.segment === segment)
  
  if (!userSegment) {
    return baseFlags
  }

  return {
    ...baseFlags,
    ...userSegment.features
  }
}

/**
 * Analytics tracking for feature flag usage
 */
export function trackResponsiveFeatureUsage(
  feature: keyof ResponsiveFeatureFlags,
  enabled: boolean,
  userId?: string
): void {
  // This would integrate with your analytics system
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'responsive_feature_usage', {
      feature_name: feature,
      feature_enabled: enabled,
      user_id: userId,
      timestamp: Date.now()
    })
  }
}

/**
 * Get feature flag status for debugging
 */
export function getResponsiveFeatureFlagStatus(
  userId?: string,
  environment?: 'development' | 'staging' | 'production'
): {
  flags: ResponsiveFeatureFlags
  userId?: string
  environment: string
  timestamp: number
} {
  return {
    flags: getResponsiveFeatureFlags(userId, environment),
    userId,
    environment: environment || process.env.NODE_ENV || 'production',
    timestamp: Date.now()
  }
}
