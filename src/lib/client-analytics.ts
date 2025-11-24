'use client'

type AnalyticsProperties = Record<string, unknown> | undefined

/**
 * Lightweight client-side analytics helper.
 * Falls back gracefully if PostHog/gtag are unavailable.
 */
export function clientTrackEvent(event: string, properties?: AnalyticsProperties) {
  if (typeof window === 'undefined') return

  try {
    const win = window as any

    if (win.posthog?.capture) {
      win.posthog.capture(event, properties)
      return
    }

    if (win.gtag) {
      win.gtag('event', event, properties ?? {})
      return
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug('[analytics]', event, properties)
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[analytics] capture failed', error)
    }
  }
}

