'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ResponsiveSidebarProps {
  children: React.ReactNode
  className?: string
  mobileTitle?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export default function ResponsiveSidebar({ 
  children, 
  className,
  mobileTitle = "Menu",
  collapsible = true,
  defaultCollapsed = false
}: ResponsiveSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const newIsMobile = width < 1024 // lg breakpoint
      
      setIsMobile(newIsMobile)
      
      if (newIsMobile) {
        setIsOpen(false) // Close mobile sheet on desktop
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load collapsed state from localStorage - only on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved !== null) {
        setIsCollapsed(JSON.parse(saved))
      }
    }
  }, [])

  // Save collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed))
    }
  }, [isCollapsed])

  return (
    <>
      {/* Mobile Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800/80 backdrop-blur border border-slate-700"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-80 p-0 bg-slate-900 border-slate-700 pb-[env(safe-area-inset-bottom)]"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">{mobileTitle}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {children}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex flex-col bg-slate-900 border-r border-slate-700 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-80 min-w-[14rem] max-w-[20rem]",
        className
      )}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-white truncate">{mobileTitle}</h2>
          )}
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="text-slate-400 hover:text-white flex-shrink-0"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
    </>
  )
}
