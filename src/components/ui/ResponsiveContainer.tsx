'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

/**
 * ResponsiveContainer - Fluid container that scales beautifully from mobile to 4K
 * 
 * Features:
 * - Automatically centers content with max-width
 * - Fluid padding that scales with viewport
 * - No horizontal scroll
 * - Works on all device sizes
 */
export default function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = 'full'
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  }

  return (
    <div 
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8 box-content',
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  )
}
