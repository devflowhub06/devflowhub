import React from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'fluid'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'responsive'
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function ResponsiveContainer({
  children,
  maxWidth = 'xl',
  padding = 'responsive',
  className,
  as: Component = 'div',
}: ResponsiveContainerProps) {
  const containerClasses = cn(
    'responsive-container',
    maxWidth !== 'fluid' && `responsive-container-${maxWidth}`,
    {
      'p-responsive': padding === 'responsive',
      'p-0': padding === 'none',
      'p-2 sm:p-3 md:p-4': padding === 'sm',
      'p-4 sm:p-6 md:p-8': padding === 'md',
      'p-6 sm:p-8 md:p-12': padding === 'lg',
      'p-8 sm:p-12 md:p-16': padding === 'xl',
    },
    className
  )

  return <Component className={containerClasses}>{children}</Component>
}

interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 'auto'
  gap?: 'sm' | 'md' | 'lg' | 'xl' | 'responsive'
  className?: string
}

export function ResponsiveGrid({
  children,
  cols = 'auto',
  gap = 'responsive',
  className,
}: ResponsiveGridProps) {
  const gridClasses = cn(
    'grid-responsive',
    cols === 'auto' && 'grid-responsive-auto',
    cols !== 'auto' && `grid-responsive-cols-${cols}`,
    {
      'gap-responsive': gap === 'responsive',
      'gap-2': gap === 'sm',
      'gap-4': gap === 'md',
      'gap-6': gap === 'lg',
      'gap-8': gap === 'xl',
    },
    className
  )

  return <div className={gridClasses}>{children}</div>
}

interface ResponsiveCardProps {
  children: React.ReactNode
  hover?: boolean
  className?: string
  onClick?: () => void
}

export function ResponsiveCard({
  children,
  hover = true,
  className,
  onClick,
}: ResponsiveCardProps) {
  const cardClasses = cn(
    'card-responsive bg-white dark:bg-gray-800',
    hover && 'cursor-pointer',
    className
  )

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  )
}

interface ResponsiveTextProps {
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  fluid?: boolean
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
}

export function ResponsiveText({
  children,
  size = 'base',
  fluid = false,
  className,
  as: Component = 'div',
}: ResponsiveTextProps) {
  const textClasses = cn(
    fluid ? `text-fluid-${size}` : `text-responsive-${size}`,
    className
  )

  return <Component className={textClasses}>{children}</Component>
}

interface ResponsiveSpacingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  responsive?: boolean
}

export function ResponsiveSpacing({ size = 'md', responsive = true }: ResponsiveSpacingProps) {
  if (responsive) {
    return <div className="my-responsive" style={{ marginTop: `var(--spacing-${size})` }} />
  }
  
  const spacingMap = {
    xs: 'my-1',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
    '2xl': 'my-12',
    '3xl': 'my-16',
    '4xl': 'my-24',
  }

  return <div className={spacingMap[size]} />
}

interface ResponsiveIconProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function ResponsiveIcon({
  children,
  size = 'md',
  className,
}: ResponsiveIconProps) {
  const iconClasses = cn(`icon-responsive-${size}`, className)

  return <div className={iconClasses}>{children}</div>
}

// Hook to detect current breakpoint
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<
    'mobile' | 'tablet' | 'desktop' | 'large' | 'qhd' | '4k' | '5k' | '6k' | '8k'
  >('mobile')

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      if (width >= 7680) {
        setBreakpoint('8k')
      } else if (width >= 5120) {
        setBreakpoint('6k')
      } else if (width >= 3840) {
        setBreakpoint('5k')
      } else if (width >= 2560) {
        setBreakpoint('4k')
      } else if (width >= 1920) {
        setBreakpoint('qhd')
      } else if (width >= 1440) {
        setBreakpoint('large')
      } else if (width >= 1024) {
        setBreakpoint('desktop')
      } else if (width >= 768) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('mobile')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}

// Hook to get responsive value based on breakpoint
export function useResponsiveValue<T>(values: {
  mobile?: T
  tablet?: T
  desktop?: T
  large?: T
  qhd?: T
  '4k'?: T
  '5k'?: T
  '6k'?: T
  '8k'?: T
  default: T
}): T {
  const breakpoint = useBreakpoint()
  return values[breakpoint] || values.default
}

// Utility component for responsive visibility
interface ResponsiveShowProps {
  children: React.ReactNode
  on?: ('mobile' | 'tablet' | 'desktop' | 'large' | 'qhd' | '4k' | '5k' | '6k' | '8k')[]
  above?: 'mobile' | 'tablet' | 'desktop' | 'large' | 'qhd' | '4k' | '5k' | '6k'
  below?: 'tablet' | 'desktop' | 'large' | 'qhd' | '4k' | '5k' | '6k' | '8k'
}

export function ResponsiveShow({ children, on, above, below }: ResponsiveShowProps) {
  const breakpoint = useBreakpoint()
  
  if (on && !on.includes(breakpoint)) {
    return null
  }
  
  if (above) {
    const breakpoints = ['mobile', 'tablet', 'desktop', 'large', 'qhd', '4k', '5k', '6k', '8k']
    const currentIndex = breakpoints.indexOf(breakpoint)
    const aboveIndex = breakpoints.indexOf(above)
    if (currentIndex <= aboveIndex) {
      return null
    }
  }
  
  if (below) {
    const breakpoints = ['mobile', 'tablet', 'desktop', 'large', 'qhd', '4k', '5k', '6k', '8k']
    const currentIndex = breakpoints.indexOf(breakpoint)
    const belowIndex = breakpoints.indexOf(below)
    if (currentIndex >= belowIndex) {
      return null
    }
  }

  return <>{children}</>
}

