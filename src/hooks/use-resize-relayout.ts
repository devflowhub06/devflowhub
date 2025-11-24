'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseResizeRelayoutOptions {
  onResize?: () => void
  debounceMs?: number
}

export function useResizeRelayout({ 
  onResize, 
  debounceMs = 100 
}: UseResizeRelayoutOptions = {}) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleResize = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      // Trigger Monaco editor relayout
      if (typeof window !== 'undefined' && (window as any).monaco) {
        const editors = (window as any).monaco.editor.getEditors()
        editors.forEach((editor: any) => {
          editor.layout()
        })
      }

      // Trigger xterm.js fit
      if (typeof window !== 'undefined' && (window as any).xterm) {
        const terminals = document.querySelectorAll('.xterm')
        terminals.forEach((terminal) => {
          const termInstance = (terminal as any).__xterm
          if (termInstance && termInstance.fit) {
            termInstance.fit()
          }
        })
      }

      // Trigger Sandpack relayout
      if (typeof window !== 'undefined' && (window as any).sandpack) {
        const sandpackElements = document.querySelectorAll('[data-sandpack]')
        sandpackElements.forEach((element) => {
          const sandpackInstance = (element as any).__sandpack
          if (sandpackInstance && sandpackInstance.updateViewport) {
            sandpackInstance.updateViewport()
          }
        })
      }

      // Call custom resize handler
      onResize?.()
    }, debounceMs)
  }, [onResize, debounceMs])

  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize)
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleResize])

  return containerRef
}
