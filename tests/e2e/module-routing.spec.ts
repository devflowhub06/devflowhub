/**
 * E2E Tests for DevFlowHub Module Routing
 * Tests the rebranding system and module navigation
 */

import { test, expect } from '@playwright/test'

test.describe('DevFlowHub Module Routing', () => {
  test.beforeEach(async ({ page }) => {
    // Enable rebranding feature flag
    await page.addInitScript(() => {
      window.localStorage.setItem('feature-flags', JSON.stringify({
        'rebrand_v1.0': true,
        'ai_router': true
      }))
    })
  })

  test('should display DevFlowHub module names in navigation', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check that navigation shows DevFlowHub module names
    await expect(page.locator('[data-testid="nav-editor"]')).toContainText('DevFlowHub Editor')
    await expect(page.locator('[data-testid="nav-sandbox"]')).toContainText('DevFlowHub Sandbox')
    await expect(page.locator('[data-testid="nav-ui-studio"]')).toContainText('DevFlowHub UI Studio')
    await expect(page.locator('[data-testid="nav-deployer"]')).toContainText('DevFlowHub Deployer')
  })

  test('should route to correct module via URL parameter', async ({ page }) => {
    // Test module-based routing
    await page.goto('/dashboard/projects/test-project/workspace?module=editor')
    
    // Should show DevFlowHub Editor
    await expect(page.locator('[data-testid="active-module"]')).toContainText('DevFlowHub Editor')
    await expect(page.locator('[data-testid="module-description"]')).toContainText('Code editor with AI assistance')
    
    // Test sandbox module
    await page.goto('/dashboard/projects/test-project/workspace?module=sandbox')
    await expect(page.locator('[data-testid="active-module"]')).toContainText('DevFlowHub Sandbox')
    
    // Test UI Studio module
    await page.goto('/dashboard/projects/test-project/workspace?module=ui_studio')
    await expect(page.locator('[data-testid="active-module"]')).toContainText('DevFlowHub UI Studio')
    
    // Test Deployer module
    await page.goto('/dashboard/projects/test-project/workspace?module=deployer')
    await expect(page.locator('[data-testid="active-module"]')).toContainText('DevFlowHub Deployer')
  })

  test('should maintain backward compatibility with tool parameters', async ({ page }) => {
    // Test legacy tool-based routing still works
    await page.goto('/dashboard/projects/test-project/workspace?tool=cursor')
    
    // Should still work and show the editor
    await expect(page.locator('[data-testid="active-module"]')).toContainText('DevFlowHub Editor')
    
    await page.goto('/dashboard/projects/test-project/workspace?tool=replit')
    await expect(page.locator('[data-testid="active-module"]')).toContainText('DevFlowHub Sandbox')
  })

  test('should track module analytics events', async ({ page }) => {
    // Mock analytics tracking
    const analyticsEvents: any[] = []
    await page.route('**/api/analytics/track', async route => {
      const request = route.request()
      const body = await request.postDataJSON()
      analyticsEvents.push(body)
      await route.fulfill({ status: 200 })
    })

    await page.goto('/dashboard/projects/test-project/workspace?module=editor')
    
    // Wait for analytics event
    await page.waitForTimeout(1000)
    
    // Check that module_opened event was tracked
    const moduleOpenedEvent = analyticsEvents.find(e => e.eventName === 'module_opened')
    expect(moduleOpenedEvent).toBeDefined()
    expect(moduleOpenedEvent.properties.module).toBe('editor')
    expect(moduleOpenedEvent.properties.provider).toBe('cursor')
  })

  test('should switch between modules and track switch events', async ({ page }) => {
    // Mock analytics tracking
    const analyticsEvents: any[] = []
    await page.route('**/api/analytics/track', async route => {
      const request = route.request()
      const body = await request.postDataJSON()
      analyticsEvents.push(body)
      await route.fulfill({ status: 200 })
    })

    await page.goto('/dashboard/projects/test-project/workspace?module=editor')
    
    // Switch to sandbox
    await page.click('[data-testid="nav-sandbox"]')
    
    // Wait for analytics event
    await page.waitForTimeout(1000)
    
    // Check that module_switched event was tracked
    const moduleSwitchEvent = analyticsEvents.find(e => e.eventName === 'module_switched')
    expect(moduleSwitchEvent).toBeDefined()
    expect(moduleSwitchEvent.properties.fromModule).toBe('editor')
    expect(moduleSwitchEvent.properties.toModule).toBe('sandbox')
  })

  test('should show provider information in tooltips', async ({ page }) => {
    await page.goto('/dashboard/projects/test-project/workspace?module=editor')
    
    // Hover over module to show tooltip
    await page.hover('[data-testid="nav-editor"]')
    
    // Check that tooltip shows provider information
    await expect(page.locator('[data-testid="module-tooltip"]')).toContainText('Powered by Cursor')
  })

  test('should handle invalid module parameters gracefully', async ({ page }) => {
    // Test invalid module parameter
    await page.goto('/dashboard/projects/test-project/workspace?module=invalid')
    
    // Should fallback to default module
    await expect(page.locator('[data-testid="active-module"]')).toContainText('DevFlowHub Sandbox')
    
    // Should not show any errors
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible()
  })

  test('should work with feature flag disabled (fallback mode)', async ({ page }) => {
    // Disable rebranding feature flag
    await page.addInitScript(() => {
      window.localStorage.setItem('feature-flags', JSON.stringify({
        'rebrand_v1.0': false
      }))
    })

    await page.goto('/dashboard/projects/test-project/workspace?module=editor')
    
    // Should fallback to legacy names
    await expect(page.locator('[data-testid="active-module"]')).toContainText('Editor')
    await expect(page.locator('[data-testid="active-module"]')).not.toContainText('DevFlowHub')
  })
})

test.describe('AI Router Integration', () => {
  test('should route AI requests to correct modules', async ({ page }) => {
    await page.goto('/dashboard/projects/test-project/workspace?module=editor')
    
    // Send AI request for code completion
    await page.click('[data-testid="ai-assistant-button"]')
    await page.fill('[data-testid="ai-input"]', 'Generate a React component')
    await page.click('[data-testid="ai-send-button"]')
    
    // Check that AI request was routed to editor module
    await expect(page.locator('[data-testid="ai-response"]')).toContainText('Editor AI response')
  })

  test('should route UI generation requests to UI Studio', async ({ page }) => {
    await page.goto('/dashboard/projects/test-project/workspace?module=ui_studio')
    
    // Send AI request for UI generation
    await page.click('[data-testid="ai-assistant-button"]')
    await page.fill('[data-testid="ai-input"]', 'Create a login form')
    await page.click('[data-testid="ai-send-button"]')
    
    // Check that AI request was routed to UI Studio
    await expect(page.locator('[data-testid="ai-response"]')).toContainText('UI Studio AI response')
  })
})
