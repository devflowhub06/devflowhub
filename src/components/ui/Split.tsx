'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface SplitProps {
  children: React.ReactNode[]
  direction?: 'horizontal' | 'vertical'
  minSize?: number
  maxSize?: number
  gutterSize?: number
  snapOffset?: number
  className?: string
  storageKey?: string
  onResize?: (sizes: number[]) => void
  responsive?: boolean
}

export default function Split({
  children,
  direction = 'horizontal',
  minSize = 280,
  maxSize,
  gutterSize = 8,
  snapOffset = 16,
  className,
  storageKey,
  onResize,
  responsive = true
}: SplitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sizes, setSizes] = useState<number[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [currentDirection, setCurrentDirection] = useState(direction)
  const [isMobile, setIsMobile] = useState(false)

  // Responsive direction handling
  useEffect(() => {
    if (!responsive) return

    const checkScreenSize = () => {
      const width = window.innerWidth
      const newIsMobile = width < 768 // md breakpoint
      const newDirection = newIsMobile ? 'vertical' : direction
      
      setIsMobile(newIsMobile)
      setCurrentDirection(newDirection)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [direction, responsive])

  // Initialize sizes based on children count
  useEffect(() => {
    if (children.length > 0 && sizes.length === 0) {
      const equalSize = 100 / children.length
      const initialSizes = Array(children.length).fill(equalSize)
      
      // Load from localStorage if available
      if (storageKey) {
        const saved = localStorage.getItem(`split-${storageKey}`)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (parsed.length === children.length) {
              setSizes(parsed)
              return
            }
          } catch (e) {
            console.warn('Failed to parse saved split sizes:', e)
          }
        }
      }
      
      setSizes(initialSizes)
    }
  }, [children.length, sizes.length, storageKey])

  // Save sizes to localStorage
  useEffect(() => {
    if (sizes.length > 0 && storageKey) {
      localStorage.setItem(`split-${storageKey}`, JSON.stringify(sizes))
    }
  }, [sizes, storageKey])

  // Handle resize with throttling
  const handleResize = useCallback((newSizes: number[]) => {
    setSizes(newSizes)
    onResize?.(newSizes)
  }, [onResize])

  // Handle mouse events for dragging with improved performance
  const handleMouseDown = useCallback((index: number) => {
    setIsDragging(true)
    
    let animationFrame: number
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        const containerRect = containerRef.current!.getBoundingClientRect()
        const isHorizontal = currentDirection === 'horizontal'
        const containerSize = isHorizontal ? containerRect.width : containerRect.height
        const mousePos = isHorizontal ? e.clientX - containerRect.left : e.clientY - containerRect.top
        
        const newSizes = [...sizes]
        const leftSize = Math.max(minSize, Math.min(100 - minSize, (mousePos / containerSize) * 100))
        const rightSize = 100 - leftSize
        
        if (leftSize >= minSize && rightSize >= minSize) {
          newSizes[index] = leftSize
          newSizes[index + 1] = rightSize
          handleResize(newSizes)
        }
      })
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      cancelAnimationFrame(animationFrame)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [sizes, currentDirection, minSize, handleResize])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleMouseDown(index)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const isHorizontal = currentDirection === 'horizontal'
      const isLeftOrUp = e.key === 'ArrowLeft' || e.key === 'ArrowUp'
      const delta = isLeftOrUp ? -1 : 1
      
      const newSizes = [...sizes]
      const currentSize = newSizes[index]
      const nextSize = newSizes[index + 1]
      const newCurrentSize = Math.max(minSize, Math.min(100 - minSize, currentSize + delta))
      const newNextSize = 100 - newCurrentSize
      
      if (newCurrentSize >= minSize && newNextSize >= minSize) {
        newSizes[index] = newCurrentSize
        newSizes[index + 1] = newNextSize
        handleResize(newSizes)
      }
    }
  }, [sizes, currentDirection, minSize, handleMouseDown, handleResize])

  if (sizes.length === 0) {
    return <div className={cn("flex", className)}>{children}</div>
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex",
        currentDirection === 'horizontal' ? 'flex-row' : 'flex-col',
        isDragging && 'select-none',
        className
      )}
    >
      {children.map((child, index) => (
        <div key={index} className="relative flex-shrink-0">
          <div
            style={{
              [currentDirection === 'horizontal' ? 'width' : 'height']: `${sizes[index]}%`,
              minWidth: currentDirection === 'horizontal' ? `${minSize}px` : undefined,
              minHeight: currentDirection === 'vertical' ? `${minSize}px` : undefined,
              maxWidth: currentDirection === 'horizontal' && maxSize ? `${maxSize}px` : undefined,
              maxHeight: currentDirection === 'vertical' && maxSize ? `${maxSize}px` : undefined,
            }}
            className="h-full overflow-hidden"
          >
            {child}
          </div>
          
          {index < children.length - 1 && (
            <div
              className={cn(
                "bg-slate-600 hover:bg-slate-500 active:bg-slate-400 transition-colors",
                "flex items-center justify-center group",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                currentDirection === 'horizontal' 
                  ? 'w-2 h-full absolute right-0 top-0 -mr-1 z-10 cursor-col-resize' 
                  : 'h-2 w-full absolute bottom-0 left-0 -mb-1 z-10 cursor-row-resize'
              )}
              onMouseDown={() => handleMouseDown(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              role="separator"
              aria-label={`Resize ${currentDirection === 'horizontal' ? 'panels' : 'sections'}`}
              aria-valuenow={sizes[index]}
              aria-valuemin={minSize}
              aria-valuemax={100 - minSize}
              tabIndex={0}
            >
              <div className={cn(
                "bg-slate-400 group-hover:bg-slate-300 rounded-full transition-colors",
                currentDirection === 'horizontal' ? 'w-1 h-8' : 'h-1 w-8'
              )} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
