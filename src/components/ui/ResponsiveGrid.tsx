'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveGridProps {
  children: ReactNode
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  minColumnWidth?: string
  className?: string
}

/**
 * ResponsiveGrid - Automatically responsive grid that adapts to any screen size
 * 
 * Features:
 * - Uses CSS Grid with auto-fit for perfect responsiveness
 * - Automatically adjusts columns based on container width
 * - No horizontal overflow
 * - Touch-friendly spacing
 */
export default function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  minColumnWidth = '280px',
  className
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  }

  return (
    <div
      className={cn(
        'grid w-full',
        'grid-cols-1',
        'sm:grid-cols-2',
        'lg:grid-cols-3',
        'xl:grid-cols-4',
        gapClasses[gap],
        className
      )}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`
      }}
    >
      {children}
    </div>
  )
}

/**
 * ResponsiveCardGrid - Pre-configured for card layouts
 */
export function ResponsiveCardGrid({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <ResponsiveGrid
      minColumnWidth="260px"
      gap="md"
      className={cn('py-6', className)}
    >
      {children}
    </ResponsiveGrid>
  )
}
