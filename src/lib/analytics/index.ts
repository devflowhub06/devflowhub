import { Analytics } from '@vercel/analytics/react'

// Analytics configuration
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

// Initialize PostHog only on client side
let posthog: any = null
if (typeof window !== 'undefined') {
  import('posthog-js').then((posthogModule) => {
    posthog = posthogModule.default
    if (POSTHOG_KEY && POSTHOG_KEY.trim() !== '') {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        loaded: (posthog: any) => {
          if (process.env.NODE_ENV === 'development') posthog.debug()
        },
        capture_pageview: false, // We'll handle this manually
      })
    }
  }).catch(() => {
    // PostHog not available, continue without it
    console.warn('PostHog not available')
  })
}

// Analytics event types
export type AnalyticsEvent = 
  | 'user_registered'
  | 'user_logged_in'
  | 'project_created'
  | 'project_deleted'
  | 'tool_switched'
  | 'tool_recommended'
  | 'tool_recommendation_accepted'
  | 'tool_recommendation_rejected'
  | 'context_synced'
  | 'task_completed'
  | 'upgrade_clicked'
  | 'feature_used'
  | 'error_occurred'
  | 'page_viewed'
  | 'feedback_submitted'
  | 'conversion'
  | 'performance_metric'

// Analytics service class
export class AnalyticsService {
  private static instance: AnalyticsService

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  // Track page views
  trackPageView(page: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return

    // PostHog
    if (posthog && POSTHOG_KEY && POSTHOG_KEY.trim() !== '') {
      try {
        posthog.capture('page_viewed', {
          page,
          ...properties,
        })
      } catch (error) {
        console.warn('PostHog tracking failed:', error)
      }
    }

    // Vercel Analytics (handled automatically)
    console.log(`[Analytics] Page viewed: ${page}`, properties)
  }

  // Track user events
  trackEvent(event: AnalyticsEvent, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return

    // PostHog
    if (posthog && POSTHOG_KEY && POSTHOG_KEY.trim() !== '') {
      try {
        posthog.capture(event, properties)
      } catch (error) {
        console.warn('PostHog tracking failed:', error)
      }
    }

    console.log(`[Analytics] Event: ${event}`, properties)
  }

  // Track user identification
  identify(userId: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return

    // PostHog
    if (posthog && POSTHOG_KEY && POSTHOG_KEY.trim() !== '') {
      posthog.identify(userId, properties)
    }

    console.log(`[Analytics] User identified: ${userId}`, properties)
  }

  // Track user properties
  setUserProperties(properties: Record<string, any>) {
    if (typeof window === 'undefined') return

    // PostHog
    if (posthog && POSTHOG_KEY && POSTHOG_KEY.trim() !== '') {
      posthog.people.set(properties)
    }

    console.log(`[Analytics] User properties set:`, properties)
  }

  // Track errors
  trackError(error: Error, context?: Record<string, any>) {
    if (typeof window === 'undefined') return

    // PostHog
    if (posthog && POSTHOG_KEY && POSTHOG_KEY.trim() !== '') {
      posthog.capture('error_occurred', {
        error_message: error.message,
        error_stack: error.stack,
        error_name: error.name,
        ...context,
      })
    }

    console.error(`[Analytics] Error tracked:`, error, context)
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return

    // PostHog
    if (posthog && POSTHOG_KEY && POSTHOG_KEY.trim() !== '') {
      posthog.capture('performance_metric', {
        metric,
        value,
        ...properties,
      })
    }

    console.log(`[Analytics] Performance: ${metric} = ${value}`, properties)
  }

  // Track feature usage
  trackFeatureUsage(feature: string, properties?: Record<string, any>) {
    this.trackEvent('feature_used', {
      feature,
      ...properties,
    })
  }

  // Track conversion events
  trackConversion(funnel: string, step: string, properties?: Record<string, any>) {
    this.trackEvent('conversion', {
      funnel,
      step,
      ...properties,
    })
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance()

// Export Vercel Analytics component
export { Analytics }

// Hook for React components
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    identify: analytics.identify.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
  }
} 