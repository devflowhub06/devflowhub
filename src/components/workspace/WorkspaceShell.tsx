'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface WorkspaceShellProps {
  children: React.ReactNode
  className?: string
}

export default function WorkspaceShell({ children, className }: WorkspaceShellProps) {
  // Set up dynamic viewport height for mobile devices with proper CSS variables
  useEffect(() => {
    const setAppHeight = () => {
      const vh = window.innerHeight * 0.01
      const vw = window.innerWidth * 0.01
      
      // Set CSS custom properties for responsive design
      document.documentElement.style.setProperty('--vh', `${vh}px`)
      document.documentElement.style.setProperty('--vw', `${vw}px`)
      document.documentElement.style.setProperty('--app-h', `${window.innerHeight}px`)
      document.documentElement.style.setProperty('--app-w', `${window.innerWidth}px`)
      
      // Set sidebar width variables
      document.documentElement.style.setProperty('--sidebar-w', '16rem')
      document.documentElement.style.setProperty('--sidebar-w-collapsed', '4rem')
      
      // Set safe area insets for mobile
      const safeAreaTop = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0px'
      const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0px'
      document.documentElement.style.setProperty('--safe-area-top', safeAreaTop)
      document.documentElement.style.setProperty('--safe-area-bottom', safeAreaBottom)
    }

    setAppHeight()
    window.addEventListener('resize', setAppHeight)
    window.addEventListener('orientationchange', setAppHeight)

    return () => {
      window.removeEventListener('resize', setAppHeight)
      window.removeEventListener('orientationchange', setAppHeight)
    }
  }, [])

  return (
    <div 
      className={cn(
        "min-h-[--app-h] h-[--app-h] flex flex-col overflow-hidden",
        "supports-[height:100dvh]:min-h-[100dvh] supports-[height:100dvh]:h-[100dvh]",
        "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
        className
      )}
    >
      {children}
    </div>
  )
}
