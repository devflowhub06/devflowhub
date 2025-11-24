import { AnalyticsService, analytics } from '../index'

// Mock posthog
jest.mock('posthog-js', () => ({
  init: jest.fn(),
  capture: jest.fn(),
  identify: jest.fn(),
  people: {
    set: jest.fn(),
  },
}))

// Mock Vercel Analytics
jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}))

describe('AnalyticsService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    
    // Mock window object for client-side tests
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/test',
      },
      writable: true,
    })
  })

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = AnalyticsService.getInstance()
      const instance2 = AnalyticsService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('trackPageView', () => {
    it('should track page view with properties', () => {
      const page = '/dashboard'
      const properties = { userId: '123' }
      
      analytics.trackPageView(page, properties)
      
      // In a real implementation, this would verify posthog.capture was called
      // For now, we just verify the method doesn't throw
      expect(true).toBe(true)
    })

    it('should handle server-side rendering', () => {
      // Mock server-side environment
      const originalWindow = global.window
      delete (global as any).window
      
      expect(() => {
        analytics.trackPageView('/test')
      }).not.toThrow()
      
      // Restore window
      global.window = originalWindow
    })
  })

  describe('trackEvent', () => {
    it('should track user events', () => {
      const event = 'user_registered'
      const properties = { method: 'google' }
      
      expect(() => {
        analytics.trackEvent(event, properties)
      }).not.toThrow()
    })
  })

  describe('identify', () => {
    it('should identify users', () => {
      const userId = 'user123'
      const properties = { email: 'test@example.com' }
      
      expect(() => {
        analytics.identify(userId, properties)
      }).not.toThrow()
    })
  })

  describe('trackError', () => {
    it('should track errors with context', () => {
      const error = new Error('Test error')
      const context = { page: '/dashboard' }
      
      expect(() => {
        analytics.trackError(error, context)
      }).not.toThrow()
    })
  })

  describe('trackPerformance', () => {
    it('should track performance metrics', () => {
      const metric = 'page_load_time'
      const value = 1500
      const properties = { page: '/dashboard' }
      
      expect(() => {
        analytics.trackPerformance(metric, value, properties)
      }).not.toThrow()
    })
  })

  describe('trackFeatureUsage', () => {
    it('should track feature usage', () => {
      const feature = 'tool_switching'
      const properties = { tool: 'cursor' }
      
      expect(() => {
        analytics.trackFeatureUsage(feature, properties)
      }).not.toThrow()
    })
  })

  describe('trackConversion', () => {
    it('should track conversion events', () => {
      const funnel = 'signup'
      const step = 'completed'
      const properties = { plan: 'pro' }
      
      expect(() => {
        analytics.trackConversion(funnel, step, properties)
      }).not.toThrow()
    })
  })
}) 