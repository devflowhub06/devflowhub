'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useResizeObserver, useMonacoResize, useXTermResize } from '@/hooks/useResizeObserver'
import { ResponsiveContainer, ResponsiveFlex, ResponsiveStack } from '@/components/ui/responsive-container'
import { Button } from '@/components/ui/button'
import { PanelLeft, PanelRight, Maximize2, Minimize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ResponsiveWorkspaceLayoutProps {
  children: React.ReactNode
  className?: string
  leftPanel?: {
    content: React.ReactNode
    title?: string
    defaultWidth?: number
    minWidth?: number
    maxWidth?: number
    collapsible?: boolean
    defaultCollapsed?: boolean
  }
  rightPanel?: {
    content: React.ReactNode
    title?: string
    defaultWidth?: number
    minWidth?: number
    maxWidth?: number
    collapsible?: boolean
    defaultCollapsed?: boolean
  }
  mainContent: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  storageKey?: string
}

export function ResponsiveWorkspaceLayout({
  children,
  className,
  leftPanel,
  rightPanel,
  mainContent,
  header,
  footer,
  storageKey = 'workspace-layout'
}: ResponsiveWorkspaceLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(leftPanel?.defaultCollapsed ?? false)
  const [rightCollapsed, setRightCollapsed] = useState(rightPanel?.defaultCollapsed ?? false)
  const [leftWidth, setLeftWidth] = useState(leftPanel?.defaultWidth ?? 280)
  const [rightWidth, setRightWidth] = useState(rightPanel?.defaultWidth ?? 280)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isLargeScreen = useMediaQuery('(min-width: 1400px)')

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const newIsMobile = width < 768
      const newIsTablet = width >= 768 && width < 1024
      
      setIsMobile(newIsMobile)
      setIsTablet(newIsTablet)
      
      // Auto-collapse panels on mobile
      if (newIsMobile) {
        setLeftCollapsed(true)
        setRightCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load saved state from localStorage - only on client
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        const saved = localStorage.getItem(`responsive-workspace-${storageKey}`)
        if (saved) {
          const state = JSON.parse(saved)
          setLeftCollapsed(state.leftCollapsed ?? leftCollapsed)
          setRightCollapsed(state.rightCollapsed ?? rightCollapsed)
          setLeftWidth(state.leftWidth ?? leftWidth)
          setRightWidth(state.rightWidth ?? rightWidth)
        }
      } catch (error) {
        console.warn('Failed to load workspace layout state:', error)
      }
    }
  }, [storageKey]) // Remove dependencies to prevent hydration issues

  // Save state to localStorage
  const saveState = useCallback(() => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        localStorage.setItem(`responsive-workspace-${storageKey}`, JSON.stringify({
          leftCollapsed,
          rightCollapsed,
          leftWidth,
          rightWidth
        }))
      } catch (error) {
        console.warn('Failed to save workspace layout state:', error)
      }
    }
  }, [storageKey, leftCollapsed, rightCollapsed, leftWidth, rightWidth])

  useEffect(() => {
    saveState()
  }, [saveState])

  // Toggle panel functions
  const toggleLeftPanel = useCallback(() => {
    setLeftCollapsed(!leftCollapsed)
  }, [leftCollapsed])

  const toggleRightPanel = useCallback(() => {
    setRightCollapsed(!rightCollapsed)
  }, [rightCollapsed])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      setLeftCollapsed(true)
      setRightCollapsed(true)
    }
  }, [isFullscreen])

  // Resize observer for main content area
  const { ref: mainContentRef } = useResizeObserver({
    onResize: useCallback((entry) => {
      // Handle any main content resize logic here
      console.log('Main content resized:', entry.contentRect)
    }, [])
  })

  // Determine layout based on screen size and state
  const getLayoutClasses = () => {
    if (isMobile) {
      return {
        container: 'flex flex-col h-full',
        main: 'flex-1 min-h-0',
        panels: 'fixed inset-0 z-50 bg-background/95 backdrop-blur-sm'
      }
    }

    if (isTablet) {
      return {
        container: 'flex h-full',
        main: 'flex-1 min-h-0',
        panels: 'absolute inset-0 z-40 bg-background/90 backdrop-blur-sm'
      }
    }

    return {
      container: 'flex h-full',
      main: 'flex-1 min-h-0',
      panels: 'relative'
    }
  }

  const layoutClasses = getLayoutClasses()

  // Panel width calculations
  const effectiveLeftWidth = leftCollapsed ? 0 : leftWidth
  const effectiveRightWidth = rightCollapsed ? 0 : rightWidth

  return (
    <div className={cn('h-full w-full bg-background', className)}>
      {/* Header */}
      {header && (
        <div className="flex-shrink-0 border-b">
          {header}
        </div>
      )}

      {/* Main Layout */}
      <div className={cn('flex-1 min-h-0', layoutClasses.container)}>
        {/* Left Panel */}
        {leftPanel && !isMobile && (
          <div
            className={cn(
              'flex-shrink-0 border-r bg-muted/30 transition-all duration-300',
              layoutClasses.panels,
              leftCollapsed && 'w-0 overflow-hidden'
            )}
            style={{
              width: leftCollapsed ? 0 : `${effectiveLeftWidth}px`,
              minWidth: leftCollapsed ? 0 : `${leftPanel.minWidth || 200}px`,
              maxWidth: leftCollapsed ? 0 : `${leftPanel.maxWidth || 400}px`
            }}
          >
            <div className="flex flex-col h-full">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-sm">{leftPanel.title || 'Panel'}</h3>
                <div className="flex items-center gap-2">
                  {leftPanel.collapsible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleLeftPanel}
                      className="h-8 w-8 p-0"
                    >
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Panel Content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {leftPanel.content}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div
          ref={mainContentRef}
          className={cn(
            'flex flex-col min-h-0',
            layoutClasses.main
          )}
        >
          {/* Main Content Header with Controls */}
          <div className="flex items-center justify-between p-4 border-b bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              {leftPanel && isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLeftPanel}
                  className="h-8 w-8 p-0"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              )}
              {rightPanel && isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleRightPanel}
                  className="h-8 w-8 p-0"
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {mainContent}
          </div>
        </div>

        {/* Right Panel */}
        {rightPanel && !isMobile && (
          <div
            className={cn(
              'flex-shrink-0 border-l bg-muted/30 transition-all duration-300',
              layoutClasses.panels,
              rightCollapsed && 'w-0 overflow-hidden'
            )}
            style={{
              width: rightCollapsed ? 0 : `${effectiveRightWidth}px`,
              minWidth: rightCollapsed ? 0 : `${rightPanel.minWidth || 200}px`,
              maxWidth: rightCollapsed ? 0 : `${rightPanel.maxWidth || 400}px`
            }}
          >
            <div className="flex flex-col h-full">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-sm">{rightPanel.title || 'Panel'}</h3>
                <div className="flex items-center gap-2">
                  {rightPanel.collapsible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleRightPanel}
                      className="h-8 w-8 p-0"
                    >
                      <PanelRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Panel Content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {rightPanel.content}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Panel Overlays */}
        {isMobile && (
          <>
            {/* Left Panel Overlay */}
            {leftPanel && !leftCollapsed && (
              <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg">{leftPanel.title || 'Panel'}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleLeftPanel}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {leftPanel.content}
                  </div>
                </div>
              </div>
            )}

            {/* Right Panel Overlay */}
            {rightPanel && !rightCollapsed && (
              <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg">{rightPanel.title || 'Panel'}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleRightPanel}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {rightPanel.content}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="flex-shrink-0 border-t">
          {footer}
        </div>
      )}
    </div>
  )
}

export default ResponsiveWorkspaceLayout
