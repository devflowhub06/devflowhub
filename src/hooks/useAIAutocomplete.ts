import { useState, useCallback, useRef, useEffect } from 'react'

interface AutocompleteSuggestion {
  suggestion: string
  confidence: number
  language: string
  fallback?: boolean
}

interface UseAIAutocompleteOptions {
  enabled: boolean
  debounceMs?: number
  maxTokens?: number
  projectContext?: string
}

export function useAIAutocomplete(options: UseAIAutocompleteOptions) {
  const [suggestion, setSuggestion] = useState<AutocompleteSuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()

  const { enabled, debounceMs = 800, maxTokens = 150, projectContext } = options

  const getSuggestion = useCallback(async (
    code: string,
    cursorPosition: { line: number; character: number },
    language: string = 'javascript'
  ) => {
    if (!enabled || !code.trim()) {
      setSuggestion(null)
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce the request
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      setError(null)

      try {
        abortControllerRef.current = new AbortController()
        
        const response = await fetch('/api/editor/ai/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            cursorPosition,
            language,
            projectContext,
            maxTokens
          }),
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.suggestion && data.suggestion.trim()) {
          setSuggestion({
            suggestion: data.suggestion,
            confidence: data.confidence || 0.5,
            language: data.language || language,
            fallback: data.fallback || false
          })
        } else {
          setSuggestion(null)
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, ignore
          return
        }
        
        console.error('AI autocomplete error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setSuggestion(null)
      } finally {
        setIsLoading(false)
      }
    }, debounceMs)
  }, [enabled, debounceMs, maxTokens, projectContext])

  const clearSuggestion = useCallback(() => {
    setSuggestion(null)
    setError(null)
    setIsLoading(false)
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    suggestion,
    isLoading,
    error,
    getSuggestion,
    clearSuggestion
  }
}
