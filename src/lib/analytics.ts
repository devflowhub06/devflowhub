'use client'

// Analytics tracking utilities for Homepage v3.0
// Implements the analytics events specified in the master prompt

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp?: number
}

interface CTAClickEvent extends AnalyticsEvent {
  event: 'cta_click'
  properties: {
    cta_name: 'Start Free Trial' | 'Book a Demo' | 'Explore Workspace' | 'Sign Up' | 'Sign In'
    cta_location: 'hero' | 'navbar' | 'workspaces' | 'workflow' | 'footer'
    cta_variant?: string
  }
}

interface WorkspaceExploreEvent extends AnalyticsEvent {
  event: 'workspace_explore'
  properties: {
    workspace_name: 'Editor' | 'Sandbox' | 'UI Studio' | 'Deployer' | 'AI Assistant'
    workspace_location: 'grid' | 'workflow'
  }
}

interface HomepageViewEvent extends AnalyticsEvent {
  event: 'homepage_view'
  properties: {
    hero_visible_timestamp: number
    user_type: 'new' | 'returning'
    referrer?: string
  }
}

interface VideoPlayEvent extends AnalyticsEvent {
  event: 'video_play'
  properties: {
    video_type: 'workflow_demo' | 'product_demo'
    video_location: 'hero' | 'workflow'
  }
}

interface NavClickEvent extends AnalyticsEvent {
  event: 'nav_signup_click' | 'nav_signin_click'
  properties: {
    nav_location: 'navbar' | 'footer'
  }
}

interface ScrollDepthEvent extends AnalyticsEvent {
  event: 'scroll_depth'
  properties: {
    depth_percentage: number
    sections_viewed: string[]
  }
}

interface TimeOnHeroEvent extends AnalyticsEvent {
  event: 'time_on_hero'
  properties: {
    time_seconds: number
    interactions_count: number
  }
}

type AllAnalyticsEvents = 
  | CTAClickEvent 
  | WorkspaceExploreEvent 
  | HomepageViewEvent 
  | VideoPlayEvent 
  | NavClickEvent 
  | ScrollDepthEvent 
  | TimeOnHeroEvent

class AnalyticsTracker {
  private static instance: AnalyticsTracker
  private heroStartTime: number = 0
  private heroInteractions: number = 0
  private sectionsViewed: Set<string> = new Set()
  private maxScrollDepth: number = 0

  private constructor() {
    this.initializeTracking()
  }

  public static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker()
    }
    return AnalyticsTracker.instance
  }

  private initializeTracking() {
    // Only initialize on client side
    if (typeof window === 'undefined') return
    
    // Track homepage view when component mounts
    this.trackHomepageView()
    
    // Track scroll depth
    this.trackScrollDepth()
    
    // Track time on hero
    this.trackTimeOnHero()
  }

  private trackHomepageView() {
    const heroElement = document.querySelector('[data-hero-section]')
    if (heroElement) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.trackEvent({
                event: 'homepage_view',
                properties: {
                  hero_visible_timestamp: Date.now(),
                  user_type: this.isReturningUser() ? 'returning' : 'new',
                  referrer: document.referrer || undefined
                }
              })
              observer.disconnect()
            }
          })
        },
        { threshold: 0.5 }
      )
      observer.observe(heroElement)
    }
  }

  private trackScrollDepth() {
    let ticking = false
    
    const updateScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / docHeight) * 100)
      
      if (scrollPercent > this.maxScrollDepth) {
        this.maxScrollDepth = scrollPercent
        
        // Track section views
        this.trackSectionViews()
        
        // Send scroll depth event every 25%
        if (scrollPercent % 25 === 0) {
          this.trackEvent({
            event: 'scroll_depth',
            properties: {
              depth_percentage: scrollPercent,
              sections_viewed: Array.from(this.sectionsViewed)
            }
          })
        }
      }
      
      ticking = false
    }
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDepth)
        ticking = true
      }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true })
  }

  private trackSectionViews() {
    const sections = [
      { id: 'hero', selector: '[data-hero-section]' },
      { id: 'workspaces', selector: '[data-workspaces-section]' },
      { id: 'workflow', selector: '[data-workflow-section]' },
      { id: 'faq', selector: '[data-faq-section]' },
      { id: 'footer', selector: '[data-footer-section]' }
    ]
    
    sections.forEach(({ id, selector }) => {
      const element = document.querySelector(selector)
      if (element && !this.sectionsViewed.has(id)) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                this.sectionsViewed.add(id)
                observer.disconnect()
              }
            })
          },
          { threshold: 0.5 }
        )
        observer.observe(element)
      }
    })
  }

  private trackTimeOnHero() {
    const heroElement = document.querySelector('[data-hero-section]')
    if (!heroElement) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.heroStartTime = Date.now()
            this.heroInteractions = 0
            
            // Track interactions on hero
            const interactiveElements = heroElement.querySelectorAll('button, a, [role="button"]')
            interactiveElements.forEach((element) => {
              element.addEventListener('click', () => {
                this.heroInteractions++
              }, { once: false })
            })
          } else if (this.heroStartTime > 0) {
            // Hero is no longer visible, track time spent
            const timeSpent = Math.round((Date.now() - this.heroStartTime) / 1000)
            this.trackEvent({
              event: 'time_on_hero',
              properties: {
                time_seconds: timeSpent,
                interactions_count: this.heroInteractions
              }
            })
            this.heroStartTime = 0
            this.heroInteractions = 0
          }
        })
      },
      { threshold: 0.5 }
    )
    
    observer.observe(heroElement)
  }

  private isReturningUser(): boolean {
    // Check if user has visited before (simple localStorage check)
    const hasVisited = localStorage.getItem('devflowhub_visited')
    if (!hasVisited) {
      localStorage.setItem('devflowhub_visited', 'true')
      return false
    }
    return true
  }

  public trackEvent(event: AllAnalyticsEvents) {
    // Add timestamp if not provided
    if (!event.timestamp) {
      event.timestamp = Date.now()
    }
    
    // Send to analytics service (PostHog, Google Analytics, etc.)
    this.sendToAnalytics(event)
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event)
    }
  }

  private sendToAnalytics(event: AllAnalyticsEvents) {
    // Only send on client side
    if (typeof window === 'undefined') return
    
    try {
      // PostHog integration
      if ((window as any).posthog) {
        (window as any).posthog.capture(event.event, event.properties)
      }
      
      // Google Analytics 4 integration
      if ((window as any).gtag) {
        (window as any).gtag('event', event.event, {
          ...event.properties,
          event_category: 'homepage_v3',
          event_label: 'homepage_interaction'
        })
      }
      
      // Custom analytics endpoint
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch((error) => {
        console.warn('Analytics tracking failed:', error)
      })
    } catch (error) {
      console.warn('Analytics error:', error)
    }
  }

  // Public methods for tracking specific events
  public trackCTAClick(ctaName: CTAClickEvent['properties']['cta_name'], location: CTAClickEvent['properties']['cta_location'], variant?: string) {
    this.trackEvent({
      event: 'cta_click',
      properties: {
        cta_name: ctaName,
        cta_location: location,
        cta_variant: variant
      }
    })
  }

  public trackWorkspaceExplore(workspaceName: WorkspaceExploreEvent['properties']['workspace_name'], location: WorkspaceExploreEvent['properties']['workspace_location']) {
    this.trackEvent({
      event: 'workspace_explore',
      properties: {
        workspace_name: workspaceName,
        workspace_location: location
      }
    })
  }

  public trackVideoPlay(videoType: VideoPlayEvent['properties']['video_type'], location: VideoPlayEvent['properties']['video_location']) {
    this.trackEvent({
      event: 'video_play',
      properties: {
        video_type: videoType,
        video_location: location
      }
    })
  }

  public trackNavClick(type: 'nav_signup_click' | 'nav_signin_click', location: NavClickEvent['properties']['nav_location']) {
    this.trackEvent({
      event: type,
      properties: {
        nav_location: location
      }
    })
  }

  public trackPageView(page: string, properties?: Record<string, any>) {
    this.trackEvent({
      event: 'page_view',
      properties: {
        page,
        ...properties
      }
    })
  }

  public identify(userId: string, properties?: Record<string, any>) {
    this.trackEvent({
      event: 'user_identify',
      properties: {
        userId,
        ...properties
      }
    })
  }

  public setUserProperties(properties: Record<string, any>) {
    this.trackEvent({
      event: 'user_properties_set',
      properties
    })
  }

  public trackError(error: Error, context?: Record<string, any>) {
    this.trackEvent({
      event: 'error_tracked',
      properties: {
        error_message: error.message,
        error_stack: error.stack,
        ...context
      }
    })
  }

  public trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
    this.trackEvent({
      event: 'performance_metric',
      properties: {
        metric,
        value,
        ...properties
      }
    })
  }

  public trackFeatureUsage(feature: string, properties?: Record<string, any>) {
    this.trackEvent({
      event: 'feature_usage',
      properties: {
        feature,
        ...properties
      }
    })
  }

  public trackConversion(funnel: string, step: string, properties?: Record<string, any>) {
    this.trackEvent({
      event: 'conversion',
      properties: {
        funnel,
        step,
        ...properties
      }
    })
  }
}

// Export singleton instance
export const analytics = AnalyticsTracker.getInstance()

// Export individual tracking functions for easy use
export const trackCTAClick = (ctaName: CTAClickEvent['properties']['cta_name'], location: CTAClickEvent['properties']['cta_location'], variant?: string) => {
  analytics.trackCTAClick(ctaName, location, variant)
}

export const trackWorkspaceExplore = (workspaceName: WorkspaceExploreEvent['properties']['workspace_name'], location: WorkspaceExploreEvent['properties']['workspace_location']) => {
  analytics.trackWorkspaceExplore(workspaceName, location)
}

export const trackVideoPlay = (videoType: VideoPlayEvent['properties']['video_type'], location: VideoPlayEvent['properties']['video_location']) => {
  analytics.trackVideoPlay(videoType, location)
}

export const trackNavClick = (type: 'nav_signup_click' | 'nav_signin_click', location: NavClickEvent['properties']['nav_location']) => {
  analytics.trackNavClick(type, location)
}

// Generic analytics tracking function for API routes
export const trackAnalytics = (event: string, properties?: Record<string, any>) => {
  analytics.trackEvent({
    event,
    properties: properties || {},
    timestamp: Date.now()
  })
}

export default analytics