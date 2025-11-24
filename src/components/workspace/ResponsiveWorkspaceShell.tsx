'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'

interface ResponsiveWorkspaceShellProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  sidebar?: React.ReactNode
  content?: React.ReactNode
  projectId?: string
}

export default function ResponsiveWorkspaceShell({ 
  children, 
  className,
  header,
  sidebar,
  content,
  projectId 
}: ResponsiveWorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 768px)')

  // Close sidebar on desktop
  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(false)
    }
  }, [isDesktop])

  return (
    <div className={cn("flex h-svh flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900", className)}>
      {/* Header */}
      {header && (
        <div className="shrink-0">
          {header}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Desktop Sidebar */}
            <div className={cn(
              "hidden lg:flex lg:w-72 xl:w-80",
              "bg-slate-800/50 backdrop-blur border-r border-slate-700/50"
            )}>
              {sidebar}
            </div>

            {/* Mobile/Tablet Sidebar Drawer */}
            {!isDesktop && (
              <div className={cn(
                "fixed inset-0 z-50 lg:hidden",
                isSidebarOpen ? "block" : "hidden"
              )}>
                <div 
                  className="absolute inset-0 bg-black/50" 
                  onClick={() => setIsSidebarOpen(false)}
                />
                <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-slate-800/95 backdrop-blur border-r border-slate-700/50">
                  {sidebar}
                </div>
              </div>
            )}
          </>
        )}

        {/* Content Area */}
        <div className="flex min-h-0 min-w-0 flex-1">
          {content || children}
        </div>
      </div>
    </div>
  )
}
