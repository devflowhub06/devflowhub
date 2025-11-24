import { useEffect, useRef, RefObject } from 'react'

interface UseResizeObserverOptions {
  onResize?: (entries: ResizeObserverEntry[]) => void
  enabled?: boolean
}

/**
 * Custom hook to observe element size changes and trigger callbacks
 * Perfect for Monaco editor, xterm terminal, and preview iframes
 */
export function useResizeObserver<T extends HTMLElement = HTMLElement>(
  targetRef: RefObject<T>,
  options: UseResizeObserverOptions = {}
) {
  const { onResize, enabled = true } = options
  const observerRef = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    if (!enabled || !targetRef.current) return

    // Create ResizeObserver if not exists
    if (!observerRef.current && typeof ResizeObserver !== 'undefined') {
      observerRef.current = new ResizeObserver((entries) => {
        if (onResize) {
          onResize(entries)
        }
      })
    }

    const observer = observerRef.current

    if (observer && targetRef.current) {
      observer.observe(targetRef.current)
    }

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [targetRef, onResize, enabled])

  return observerRef
}

/**
 * Utility hook specifically for Monaco editor layout updates
 */
export function useEditorResize<T extends HTMLElement = HTMLElement>(
  targetRef: RefObject<T>,
  editorInstance: any,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options

  useResizeObserver(targetRef, {
    enabled: enabled && !!editorInstance,
    onResize: () => {
      if (editorInstance && typeof editorInstance.layout === 'function') {
        // Debounce layout calls to prevent excessive reflows
        requestAnimationFrame(() => {
          editorInstance.layout()
        })
      }
    },
  })
}

/**
 * Utility hook specifically for xterm terminal resize
 */
export function useTerminalResize<T extends HTMLElement = HTMLElement>(
  targetRef: RefObject<T>,
  terminalInstance: any,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options

  useResizeObserver(targetRef, {
    enabled: enabled && !!terminalInstance,
    onResize: () => {
      if (terminalInstance && typeof terminalInstance.fit === 'function') {
        // Debounce fit calls to prevent excessive reflows
        requestAnimationFrame(() => {
          terminalInstance.fit()
        })
      }
    },
  })
}

/**
 * Utility hook for preview iframe resize
 */
export function usePreviewResize<T extends HTMLIFrameElement = HTMLIFrameElement>(
  targetRef: RefObject<T>,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options

  useResizeObserver(targetRef, {
    enabled,
    onResize: (entries) => {
      // Trigger resize event in iframe (if same-origin)
      for (const entry of entries) {
        const iframe = entry.target as HTMLIFrameElement
        if (iframe.contentWindow) {
          // Dispatch resize event to iframe content
          try {
            iframe.contentWindow.dispatchEvent(new Event('resize'))
          } catch (e) {
            // Cross-origin iframe, ignore
          }
        }
      }
    },
  })
}

export default useResizeObserver