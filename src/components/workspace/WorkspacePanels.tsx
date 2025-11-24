'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'

interface Panel {
  id: string
  content: React.ReactNode
  minSize?: number
  defaultSize?: number
}

interface WorkspacePanelsProps {
  panels: Panel[]
  direction?: 'horizontal' | 'vertical'
  className?: string
  projectId?: string
  storageKey?: string
}

export default function WorkspacePanels({ 
  panels, 
  direction = 'horizontal',
  className,
  projectId,
  storageKey = 'dfh:workspace:panels'
}: WorkspacePanelsProps) {
  const [sizes, setSizes] = useState<number[]>([])
  const [isResizing, setIsResizing] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 768px)')

  // Initialize sizes
  useEffect(() => {
    const defaultSizes = panels.map(panel => panel.defaultSize || 100 / panels.length)
    setSizes(defaultSizes)

    // Load from localStorage
    if (projectId && typeof window !== 'undefined') {
      const key = `${storageKey}:${projectId}`
      const saved = localStorage.getItem(key)
      if (saved) {
        try {
          const parsedSizes = JSON.parse(saved)
          if (parsedSizes.length === panels.length) {
            setSizes(parsedSizes)
          }
        } catch (e) {
          console.warn('Failed to parse saved panel sizes:', e)
        }
      }
    }
  }, [panels, projectId, storageKey])

  // Save to localStorage
  const saveSizes = useCallback((newSizes: number[]) => {
    if (projectId && typeof window !== 'undefined') {
      const key = `${storageKey}:${projectId}`
      localStorage.setItem(key, JSON.stringify(newSizes))
    }
  }, [projectId, storageKey])

  // Handle resize
  const handleResize = useCallback((index: number, delta: number) => {
    if (sizes.length === 0) return

    const newSizes = [...sizes]
    const totalSize = sizes.reduce((sum, size) => sum + size, 0)
    
    if (direction === 'horizontal') {
      const deltaPercent = (delta / window.innerWidth) * 100
      newSizes[index] = Math.max(10, Math.min(80, newSizes[index] + deltaPercent))
      newSizes[index + 1] = Math.max(10, Math.min(80, newSizes[index + 1] - deltaPercent))
    } else {
      const deltaPercent = (delta / window.innerHeight) * 100
      newSizes[index] = Math.max(10, Math.min(80, newSizes[index] + deltaPercent))
      newSizes[index + 1] = Math.max(10, Math.min(80, newSizes[index + 1] - deltaPercent))
    }

    setSizes(newSizes)
    saveSizes(newSizes)
  }, [sizes, direction, saveSizes])

  // Mouse handlers for resize
  const handleMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const startX = e.clientX
    const startY = e.clientY

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      const delta = direction === 'horizontal' ? deltaX : deltaY
      handleResize(index, delta)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [handleResize, direction])

  if (sizes.length === 0) {
    return <div className="flex-1 min-h-0 min-w-0">Loading...</div>
  }

  return (
    <div className={cn(
      "flex min-h-0 min-w-0 flex-1",
      direction === 'vertical' ? 'flex-col' : 'flex-row',
      className
    )}>
      {panels.map((panel, index) => (
        <React.Fragment key={panel.id}>
          <div 
            className="min-w-0 min-h-0 overflow-hidden"
            style={{ 
              [direction === 'horizontal' ? 'width' : 'height']: `${sizes[index]}%` 
            }}
          >
            {panel.content}
          </div>
          {index < panels.length - 1 && (
            <div
              className={cn(
                "bg-slate-600 hover:bg-slate-500 cursor-col-resize select-none",
                direction === 'vertical' && "cursor-row-resize",
                "transition-colors duration-200",
                isResizing && "bg-slate-400"
              )}
              style={{
                [direction === 'horizontal' ? 'width' : 'height']: '4px'
              }}
              onMouseDown={handleMouseDown(index)}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
