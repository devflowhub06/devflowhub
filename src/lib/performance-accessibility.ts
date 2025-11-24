'use client'

// Performance and Accessibility utilities for Homepage v3.0
// Implements optimizations specified in the master prompt

import { useEffect, useRef, useCallback } from 'react'

// Performance optimizations
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private intersectionObserver: IntersectionObserver | null = null
  private resizeObserver: ResizeObserver | null = null
  private lazyImages: Set<HTMLImageElement> = new Set()

  private constructor() {
    this.initializeOptimizations()
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
    }
    return PerformanceOptimizer.instance
  }

  private initializeOptimizations() {
    // Only initialize on client side
    if (typeof window === 'undefined') return
    
    // Preload critical resources
    this.preloadCriticalResources()
    
    // Initialize lazy loading
    this.initializeLazyLoading()
    
    // Optimize animations for reduced motion
    this.handleReducedMotion()
    
    // Initialize intersection observer for performance
    this.initializeIntersectionObserver()
  }

  private preloadCriticalResources() {
    // Only preload on client side
    if (typeof window === 'undefined') return
    
    // Preload hero fonts
    const fontPreloads = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap'
    ]

    fontPreloads.forEach(fontUrl => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = fontUrl
      link.onload = () => {
        // Convert preload to stylesheet after loading
        link.rel = 'stylesheet'
      }
      document.head.appendChild(link)
    })

    // Preload critical images only if they exist
    const criticalImages = [
      '/icons/logo.svg',
      '/icons/workspace-icons.svg'
    ]

    criticalImages.forEach(imageSrc => {
      // Check if image exists before preloading
      const img = new Image()
      img.onload = () => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = imageSrc
        document.head.appendChild(link)
      }
      img.onerror = () => {
        // Image doesn't exist, skip preloading
        console.warn(`Critical image not found: ${imageSrc}`)
      }
      img.src = imageSrc
    })
  }

  private initializeLazyLoading() {
    // Lazy load non-critical images
    const images = document.querySelectorAll('img[data-src]')
    images.forEach(img => {
      this.lazyImages.add(img as HTMLImageElement)
    })

    if (this.lazyImages.size > 0) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              const src = img.dataset.src
              if (src) {
                img.src = src
                img.removeAttribute('data-src')
                this.lazyImages.delete(img)
                this.intersectionObserver?.unobserve(img)
              }
            }
          })
        },
        { rootMargin: '50px' }
      )

      this.lazyImages.forEach(img => {
        this.intersectionObserver?.observe(img)
      })
    }
  }

  private handleReducedMotion() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      // Disable animations
      document.documentElement.style.setProperty('--animation-duration', '0.01ms')
      document.documentElement.style.setProperty('--animation-iteration-count', '1')
      
      // Add reduced motion class
      document.documentElement.classList.add('reduced-motion')
    }

    // Listen for changes in motion preference
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduced-motion')
      } else {
        document.documentElement.classList.remove('reduced-motion')
      }
    })
  }

  private initializeIntersectionObserver() {
    // Use intersection observer for performance monitoring
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Track when sections come into view for performance metrics
            const sectionName = entry.target.getAttribute('data-section')
            if (sectionName) {
              this.trackSectionPerformance(sectionName)
            }
          }
        })
      },
      { threshold: 0.1 }
    )
  }

  private trackSectionPerformance(sectionName: string) {
    // Track performance metrics for each section
    const performanceEntry = performance.getEntriesByName(sectionName)[0]
    if (performanceEntry) {
      console.log(`Section ${sectionName} performance:`, {
        loadTime: performanceEntry.duration,
        timestamp: performanceEntry.startTime
      })
    }
  }

  public optimizeImages() {
    // Convert images to WebP format if supported
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      if (img.src.includes('.jpg') || img.src.includes('.png')) {
        const webpSrc = img.src.replace(/\.(jpg|png)$/, '.webp')
        const webpImg = new Image()
        webpImg.onload = () => {
          img.src = webpSrc
        }
        webpImg.src = webpSrc
      }
    })
  }

  public cleanup() {
    this.intersectionObserver?.disconnect()
    this.resizeObserver?.disconnect()
    this.lazyImages.clear()
  }
}

// Accessibility utilities
export class AccessibilityManager {
  private static instance: AccessibilityManager
  private focusableElements: Set<HTMLElement> = new Set()
  private skipLinks: Set<HTMLElement> = new Set()

  private constructor() {
    this.initializeAccessibility()
  }

  public static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager()
    }
    return AccessibilityManager.instance
  }

  private initializeAccessibility() {
    // Only initialize on client side
    if (typeof window === 'undefined') return
    
    // Add skip links
    this.addSkipLinks()
    
    // Initialize focus management
    this.initializeFocusManagement()
    
    // Add ARIA labels and roles
    this.addAriaLabels()
    
    // Initialize keyboard navigation
    this.initializeKeyboardNavigation()
  }

  private addSkipLinks() {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'Skip to main content'
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50'
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #2563eb;
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
      transition: top 0.3s;
    `
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px'
    })
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px'
    })
    
    document.body.insertBefore(skipLink, document.body.firstChild)
    this.skipLinks.add(skipLink)
  }

  private initializeFocusManagement() {
    // Find all focusable elements
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]'
    ]

    focusableSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        this.focusableElements.add(el as HTMLElement)
      })
    })

    // Add focus indicators
    this.addFocusIndicators()
  }

  private addFocusIndicators() {
    const style = document.createElement('style')
    style.textContent = `
      .focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      .focus\\:not-sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: 0.5rem;
        margin: 0;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
    `
    document.head.appendChild(style)
  }

  private addAriaLabels() {
    // Add ARIA labels to interactive elements
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
    buttons.forEach(button => {
      const text = button.textContent?.trim()
      if (text && text.length > 0) {
        button.setAttribute('aria-label', text)
      }
    })

    // Add ARIA roles to custom components
    const customButtons = document.querySelectorAll('[role="button"]')
    customButtons.forEach(button => {
      if (!button.getAttribute('tabindex')) {
        button.setAttribute('tabindex', '0')
      }
    })
  }

  private initializeKeyboardNavigation() {
    // Handle keyboard navigation for custom components
    document.addEventListener('keydown', (e) => {
      // Handle Enter and Space for custom buttons
      if (e.key === 'Enter' || e.key === ' ') {
        const target = e.target as HTMLElement
        if (target.getAttribute('role') === 'button' && !target.tagName.toLowerCase().includes('button')) {
          e.preventDefault()
          target.click()
        }
      }

      // Handle Escape for modals and dropdowns
      if (e.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement
        if (activeElement && activeElement.getAttribute('aria-expanded') === 'true') {
          activeElement.setAttribute('aria-expanded', 'false')
          activeElement.blur()
        }
      }
    })
  }

  public announceToScreenReader(message: string) {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  public setFocus(element: HTMLElement) {
    element.focus()
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  public cleanup() {
    this.focusableElements.clear()
    this.skipLinks.forEach(link => {
      if (link.parentNode) {
        link.parentNode.removeChild(link)
      }
    })
    this.skipLinks.clear()
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  private constructor() {
    this.initializeMonitoring()
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initializeMonitoring() {
    // Only initialize on client side
    if (typeof window === 'undefined') return
    
    // Monitor Core Web Vitals
    this.monitorCoreWebVitals()
    
    // Monitor resource loading
    this.monitorResourceLoading()
    
    // Monitor user interactions
    this.monitorUserInteractions()
  }

  private monitorCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.set('LCP', lastEntry.startTime)
      
      if (lastEntry.startTime > 2500) {
        console.warn('LCP is slow:', lastEntry.startTime)
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        const fid = entry.processingStart - entry.startTime
        this.metrics.set('FID', fid)
        
        if (fid > 100) {
          console.warn('FID is slow:', fid)
        }
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.metrics.set('CLS', clsValue)
      
      if (clsValue > 0.1) {
        console.warn('CLS is poor:', clsValue)
      }
    }).observe({ entryTypes: ['layout-shift'] })
  }

  private monitorResourceLoading() {
    // Monitor resource loading times
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource')
      resources.forEach(resource => {
        if (resource.duration > 1000) {
          console.warn('Slow resource:', resource.name, resource.duration)
        }
      })
    })
  }

  private monitorUserInteractions() {
    // Track interaction responsiveness
    let interactionCount = 0
    const startTime = performance.now()
    
    document.addEventListener('click', () => {
      interactionCount++
      const timeSinceStart = performance.now() - startTime
      this.metrics.set('interaction_count', interactionCount)
      this.metrics.set('time_to_interaction', timeSinceStart)
    })
  }

  public getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  public reportMetrics() {
    const metrics = this.getMetrics()
    console.log('Performance Metrics:', metrics)
    
    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metrics', {
        custom_map: {
          lcp: metrics.LCP,
          fid: metrics.FID,
          cls: metrics.CLS
        }
      })
    }
  }
}

// Export singleton instances
export const performanceOptimizer = PerformanceOptimizer.getInstance()
export const accessibilityManager = AccessibilityManager.getInstance()
export const performanceMonitor = PerformanceMonitor.getInstance()

// Hook for using performance optimizations
export function usePerformanceOptimization() {
  useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') return
    
    try {
      // Initialize optimizations when component mounts
      performanceOptimizer.optimizeImages()
    } catch (error) {
      console.warn('Performance optimization failed:', error)
    }
    
    return () => {
      try {
        // Cleanup when component unmounts
        performanceOptimizer.cleanup()
      } catch (error) {
        console.warn('Performance cleanup failed:', error)
      }
    }
  }, [])
}

// Hook for using accessibility features
export function useAccessibility() {
  const announceToScreenReader = useCallback((message: string) => {
    accessibilityManager.announceToScreenReader(message)
  }, [])

  const setFocus = useCallback((element: HTMLElement) => {
    accessibilityManager.setFocus(element)
  }, [])

  return { announceToScreenReader, setFocus }
}

export default {
  performanceOptimizer,
  accessibilityManager,
  performanceMonitor,
  usePerformanceOptimization,
  useAccessibility
}
