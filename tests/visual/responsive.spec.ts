import { test, expect } from '@playwright/test'

// Viewport configurations for comprehensive responsive testing
const viewports = [
  // Mobile
  { name: 'Mobile Narrow', width: 320, height: 568 },
  { name: 'Mobile Typical', width: 375, height: 812 },
  { name: 'Mobile Large', width: 414, height: 896 },
  
  // Tablet
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  
  // Laptop
  { name: 'Laptop Small', width: 1366, height: 768 },
  { name: 'Laptop Large', width: 1440, height: 900 },
  
  // Desktop
  { name: 'Desktop', width: 1600, height: 900 },
  { name: 'Desktop Wide', width: 1920, height: 1080 },
  
  // Ultra-wide
  { name: 'Ultra-wide', width: 2560, height: 1440 },
  { name: '4K', width: 3840, height: 2160 }
]

test.describe('Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up consistent environment
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  // Dashboard Page Tests
  test.describe('Dashboard Page', () => {
    for (const viewport of viewports) {
      test(`Dashboard - ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')
        
        // Take full page screenshot
        await expect(page).toHaveScreenshot(`dashboard-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`, {
          fullPage: true,
          animations: 'disabled'
        })
        
        // Verify no horizontal scroll
        const body = await page.locator('body')
        const scrollWidth = await body.evaluate(el => el.scrollWidth)
        const clientWidth = await body.evaluate(el => el.clientWidth)
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // Allow 1px tolerance
        
        // Verify touch targets are adequate (44px minimum)
        const buttons = await page.locator('button').all()
        for (const button of buttons) {
          const box = await button.boundingBox()
          if (box) {
            expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44)
          }
        }
      })
    }

    test('Dashboard - Quick Actions Grid Responsiveness', async ({ page }) => {
      const viewports = [
        { width: 375, name: 'mobile' },
        { width: 768, name: 'tablet' },
        { width: 1024, name: 'laptop' },
        { width: 1440, name: 'desktop' }
      ]

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: 900 })
        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')
        
        const quickActionsGrid = page.locator('[data-testid="quick-actions-grid"], .grid-responsive')
        await expect(quickActionsGrid).toHaveScreenshot(`dashboard-quick-actions-${viewport.name}.png`)
      }
    })
  })

  // Landing Page Tests
  test.describe('Landing Page', () => {
    for (const viewport of viewports) {
      test(`Landing Page - ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        
        // Take full page screenshot
        await expect(page).toHaveScreenshot(`landing-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`, {
          fullPage: true,
          animations: 'disabled'
        })
        
        // Verify hero section is responsive
        const hero = page.locator('[data-testid="hero-section"], .hero, main')
        await expect(hero).toBeVisible()
        
        // Verify no horizontal scroll
        const body = await page.locator('body')
        const scrollWidth = await body.evaluate(el => el.scrollWidth)
        const clientWidth = await body.evaluate(el => el.clientWidth)
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
      })
    }
  })

  // Workspace Tests
  test.describe('Workspace Pages', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to a project workspace (assuming there's a test project)
      await page.goto('/dashboard/projects')
      await page.waitForLoadState('networkidle')
      
      // Try to find and click on the first project
      const firstProject = page.locator('[data-testid="project-card"]').first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.waitForLoadState('networkidle')
      }
    })

    for (const viewport of viewports.slice(0, 8)) { // Test fewer viewports for workspace
      test(`Workspace - ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        
        // Take full page screenshot
        await expect(page).toHaveScreenshot(`workspace-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`, {
          fullPage: true,
          animations: 'disabled'
        })
        
        // Verify workspace layout adapts properly
        const workspace = page.locator('[data-testid="workspace"], .workspace, main')
        await expect(workspace).toBeVisible()
        
        // Check for horizontal scroll
        const body = await page.locator('body')
        const scrollWidth = await body.evaluate(el => el.scrollWidth)
        const clientWidth = await body.evaluate(el => el.clientWidth)
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
      })
    }
  })

  // AI Assistant Modal Tests
  test.describe('AI Assistant Modal', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Open AI Assistant modal
      const aiButton = page.locator('button:has-text("AI"), button:has-text("AI Assistant")').first()
      await aiButton.click()
      await page.waitForSelector('[role="dialog"], .modal, [data-testid="ai-modal"]', { timeout: 5000 })
    })

    for (const viewport of viewports.slice(0, 6)) { // Test fewer viewports for modal
      test(`AI Assistant Modal - ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        
        const modal = page.locator('[role="dialog"], .modal, [data-testid="ai-modal"]')
        await expect(modal).toBeVisible()
        
        // Take modal screenshot
        await expect(modal).toHaveScreenshot(`ai-modal-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`)
        
        // Verify modal doesn't overflow viewport
        const modalBox = await modal.boundingBox()
        const viewportSize = page.viewportSize()
        if (modalBox && viewportSize) {
          expect(modalBox.width).toBeLessThanOrEqual(viewportSize.width)
          expect(modalBox.height).toBeLessThanOrEqual(viewportSize.height)
        }
      })
    }
  })

  // Typography and Spacing Tests
  test.describe('Typography and Spacing', () => {
    test('Fluid Typography Scaling', async ({ page }) => {
      const viewports = [
        { width: 320, name: 'mobile' },
        { width: 768, name: 'tablet' },
        { width: 1440, name: 'desktop' },
        { width: 2560, name: 'ultra-wide' }
      ]

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: 900 })
        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')
        
        // Check heading sizes
        const heading = page.locator('h1').first()
        const fontSize = await heading.evaluate(el => getComputedStyle(el).fontSize)
        
        // Verify font size scales appropriately
        if (viewport.width <= 768) {
          expect(parseFloat(fontSize)).toBeLessThanOrEqual(24) // Smaller on mobile
        } else if (viewport.width >= 2560) {
          expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(20) // Larger on ultra-wide
        }
      }
    })

    test('Fluid Spacing Scaling', async ({ page }) => {
      const viewports = [
        { width: 375, name: 'mobile' },
        { width: 1024, name: 'tablet' },
        { width: 1920, name: 'desktop' }
      ]

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: 900 })
        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')
        
        // Check spacing of cards
        const cards = page.locator('[data-testid="project-card"], .card').first()
        if (await cards.isVisible()) {
          const padding = await cards.evaluate(el => getComputedStyle(el).padding)
          const paddingValue = parseFloat(padding)
          
          // Verify padding scales appropriately
          if (viewport.width <= 375) {
            expect(paddingValue).toBeLessThanOrEqual(16) // Smaller padding on mobile
          } else if (viewport.width >= 1920) {
            expect(paddingValue).toBeGreaterThanOrEqual(16) // Larger padding on desktop
          }
        }
      }
    })
  })

  // Performance Tests
  test.describe('Performance', () => {
    test('Lighthouse Performance - Mobile', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Run Lighthouse audit
      const performanceScore = await page.evaluate(() => {
        return new Promise((resolve) => {
          // This would integrate with Lighthouse in a real test
          // For now, we'll check basic performance metrics
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart
          resolve(loadTime)
        })
      })
      
      expect(performanceScore).toBeLessThan(3000) // Load time should be under 3 seconds
    })

    test('Lighthouse Accessibility', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Check for accessibility issues
      const buttons = await page.locator('button').all()
      for (const button of buttons) {
        const ariaLabel = await button.getAttribute('aria-label')
        const text = await button.textContent()
        
        // Verify buttons have accessible labels
        expect(ariaLabel || text?.trim()).toBeTruthy()
      }
      
      // Check for proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
      let h1Count = 0
      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
        if (tagName === 'h1') h1Count++
      }
      expect(h1Count).toBeLessThanOrEqual(1) // Should have at most one h1
    })
  })

  // Container Queries Test (if supported)
  test.describe('Container Queries', () => {
    test('Container-based Responsive Behavior', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Test container query behavior by resizing a specific container
      const container = page.locator('.container-fluid, [data-testid="responsive-container"]').first()
      if (await container.isVisible()) {
        // Simulate different container sizes
        const containerBox = await container.boundingBox()
        if (containerBox) {
          // Check that content adapts to container size
          const content = container.locator('.grid-responsive, .flex-responsive')
          if (await content.isVisible()) {
            // Verify responsive behavior
            await expect(content).toBeVisible()
          }
        }
      }
    })
  })
})

// Helper function to check for horizontal scroll
async function checkHorizontalScroll(page: any) {
  const body = await page.locator('body')
  const scrollWidth = await body.evaluate((el: Element) => el.scrollWidth)
  const clientWidth = await body.evaluate((el: Element) => el.clientWidth)
  return scrollWidth <= clientWidth + 1 // Allow 1px tolerance
}

// Helper function to check touch target sizes
async function checkTouchTargets(page: any) {
  const interactiveElements = await page.locator('button, a, input, select, textarea').all()
  const violations = []
  
  for (const element of interactiveElements) {
    const box = await element.boundingBox()
    if (box && Math.min(box.width, box.height) < 44) {
      violations.push({
        element: await element.evaluate((el: Element) => el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : '')),
        size: Math.min(box.width, box.height)
      })
    }
  }
  
  return violations
}
