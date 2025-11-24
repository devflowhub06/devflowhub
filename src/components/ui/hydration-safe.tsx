'use client';

import { useState, useEffect } from 'react';
import { motion, MotionProps } from 'framer-motion';

interface HydrationSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HydrationSafe({ children, fallback = null }: HydrationSafeProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook for hydration-safe state
export function useHydrationSafe<T>(value: T, defaultValue: T): T {
  const [isMounted, setIsMounted] = useState(false);
  const [safeValue, setSafeValue] = useState(defaultValue);

  useEffect(() => {
    setIsMounted(true);
    setSafeValue(value);
  }, [value]);

  return isMounted ? safeValue : defaultValue;
}

// Hook for hydration-safe boolean state
export function useHydrationSafeBoolean(initialValue: boolean = false): boolean {
  const [isMounted, setIsMounted] = useState(false);
  const [value, setValue] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setValue(initialValue);
  }, [initialValue]);

  return isMounted ? value : false;
}

// Component for conditional rendering that's hydration-safe
export function ConditionalRender({ 
  condition, 
  children, 
  fallback = null 
}: { 
  condition: boolean; 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const isMounted = useHydrationSafeBoolean(true);
  
  if (!isMounted) {
    return <>{fallback}</>;
  }
  
  return condition ? <>{children}</> : <>{fallback}</>;
}

// Hydration-safe motion component
interface HydrationSafeMotionProps extends MotionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HydrationSafeMotion({ 
  children, 
  fallback = null, 
  ...motionProps 
}: HydrationSafeMotionProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <motion.div {...motionProps}>{children}</motion.div>;
}