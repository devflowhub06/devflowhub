'use client'

import { useState, useEffect, useCallback } from 'react'

interface UsePersistentPanelSizesOptions {
  projectId: string
  defaultSizes: number[]
  storageKey?: string
}

export function usePersistentPanelSizes({ 
  projectId, 
  defaultSizes, 
  storageKey = 'dfh:workspace:panels' 
}: UsePersistentPanelSizesOptions) {
  const [sizes, setSizes] = useState<number[]>(defaultSizes)

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const key = `${storageKey}:${projectId}`
    const saved = localStorage.getItem(key)
    
    if (saved) {
      try {
        const parsedSizes = JSON.parse(saved)
        if (parsedSizes.length === defaultSizes.length) {
          setSizes(parsedSizes)
        }
      } catch (e) {
        console.warn('Failed to parse saved panel sizes:', e)
      }
    }
  }, [projectId, defaultSizes.length, storageKey])

  // Save to localStorage
  const updateSizes = useCallback((newSizes: number[]) => {
    setSizes(newSizes)
    
    if (typeof window !== 'undefined') {
      const key = `${storageKey}:${projectId}`
      localStorage.setItem(key, JSON.stringify(newSizes))
    }
  }, [projectId, storageKey])

  return [sizes, updateSizes] as const
}
