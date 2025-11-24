'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { analytics } from '@/lib/analytics'

// Define the AnalyticsEvent type locally to avoid conflicts
type AnalyticsEvent = string

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent, properties?: Record<string, any>) => void
  trackPageView: (page: string, properties?: Record<string, any>) => void
  identify: (userId: string, properties?: Record<string, any>) => void
  setUserProperties: (properties: Record<string, any>) => void
  trackError: (error: Error, context?: Record<string, any>) => void
  trackPerformance: (metric: string, value: number, properties?: Record<string, any>) => void
  trackFeatureUsage: (feature: string, properties?: Record<string, any>) => void
  trackConversion: (funnel: string, step: string, properties?: Record<string, any>) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider')
  }
  return context
}

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const pathname = usePathname()
  const [isMounted, setIsMounted] = React.useState(false)

  // Ensure we're on the client before doing anything
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Track page views - only on client
  useEffect(() => {
    if (!isMounted || !pathname || !analytics) return
    
    analytics.trackPageView(pathname, {
      timestamp: new Date().toISOString(),
      userAgent: window.navigator.userAgent,
    })
  }, [pathname, isMounted])

  // Identify user when session changes - only on client
  useEffect(() => {
    if (!isMounted || !session?.user?.id || !analytics) return
    
    analytics.identify(session.user.id, {
      email: session.user.email,
      name: session.user.name,
      plan: (session.user as any).plan || 'free',
    })

    // Set user properties
    analytics.setUserProperties({
      email: session.user.email,
      name: session.user.name,
      plan: (session.user as any).plan || 'free',
      joinedAt: (session.user as any).createdAt || new Date().toISOString(),
    })
  }, [session?.user, isMounted])

  // Track performance metrics - only on client after mount
  useEffect(() => {
    if (!isMounted || !analytics) return
    
    // Use setTimeout to ensure performance entries are available
    const timer = setTimeout(() => {
      try {
        // Track page load time
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation && navigation.loadEventEnd > 0) {
          analytics.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.loadEventStart, {
            page: pathname,
          })
        }

        // Track First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint')
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
        if (fcp) {
          analytics.trackPerformance('first_contentful_paint', fcp.startTime, {
            page: pathname,
          })
        }
      } catch (error) {
        // Silently ignore performance tracking errors
        console.warn('Performance tracking error (non-fatal):', error)
      }
    }, 100) // Small delay to ensure metrics are available

    return () => clearTimeout(timer)
  }, [pathname, isMounted])

  // Global error handler - only on client
  useEffect(() => {
    if (!isMounted || !analytics) return

    const handleError = (event: ErrorEvent) => {
      try {
        analytics.trackError(event.error || new Error(event.message), {
          url: event.filename,
          line: event.lineno,
          column: event.colno,
          page: pathname,
        })
      } catch (err) {
        // Prevent infinite error loops
        console.warn('Error tracking error (non-fatal):', err)
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        analytics.trackError(new Error(event.reason), {
          type: 'unhandled_rejection',
          page: pathname,
        })
      } catch (err) {
        // Prevent infinite error loops
        console.warn('Error tracking rejection (non-fatal):', err)
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [pathname, isMounted])

  // Create a safe analytics methods object
  const analyticsMethods = analytics ? {
    trackEvent: (event: AnalyticsEvent, properties?: Record<string, any>) => {
      if (analytics) analytics.track({ eventName: event, eventType: 'user_action', metadata: properties })
    },
    trackPageView: (page: string, properties?: Record<string, any>) => {
      if (analytics) analytics.trackPageView(page, properties)
    },
    identify: (userId: string, properties?: Record<string, any>) => {
      if (analytics) analytics.identify(userId, properties)
    },
    setUserProperties: (properties: Record<string, any>) => {
      if (analytics) analytics.setUserProperties(properties)
    },
    trackError: (error: Error, context?: Record<string, any>) => {
      if (analytics) analytics.trackError(error, context)
    },
    trackPerformance: (metric: string, value: number, properties?: Record<string, any>) => {
      if (analytics) analytics.trackPerformance(metric, value, properties)
    },
    trackFeatureUsage: (feature: string, properties?: Record<string, any>) => {
      if (analytics) analytics.trackFeatureUsage(feature, properties)
    },
    trackConversion: (funnel: string, step: string, properties?: Record<string, any>) => {
      if (analytics) analytics.trackConversion(funnel, step, properties)
    }
  } : {
    trackEvent: () => {},
    trackPageView: () => {},
    identify: () => {},
    setUserProperties: () => {},
    trackError: () => {},
    trackPerformance: () => {},
    trackFeatureUsage: () => {},
    trackConversion: () => {}
  }

  // Prevent hydration issues by only rendering children after mount
  if (!isMounted) {
    return (
      <AnalyticsContext.Provider value={analyticsMethods}>
        {children}
      </AnalyticsContext.Provider>
    )
  }

  return (
    <AnalyticsContext.Provider value={analyticsMethods}>
      {children}
    </AnalyticsContext.Provider>
  )
} 