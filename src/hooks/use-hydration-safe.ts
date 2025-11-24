import { useState, useEffect } from 'react'

/**
 * Hook to safely handle hydration mismatches by ensuring client-side only execution
 */
export function useHydrationSafe() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}

/**
 * Hook to safely access localStorage without hydration mismatches
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const isMounted = useHydrationSafe()

  // Load from localStorage only after hydration
  useEffect(() => {
    if (!isMounted) return

    try {
      const item = localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn(`Failed to load localStorage key "${key}":`, error)
    }
  }, [key, isMounted])

  // Save to localStorage only after hydration
  const setValue = (value: T | ((val: T) => T)) => {
    if (!isMounted) return

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`Failed to save localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}
