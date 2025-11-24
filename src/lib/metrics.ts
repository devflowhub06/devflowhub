'use client'

import { useEffect, useState } from 'react'

interface ApiMetric {
  endpoint: string
  responseTime: number
  status: number
  timestamp: number
}

interface PerformanceMetrics {
  pageLoadTime: number
  apiMetrics: ApiMetric[]
  errorCount: number
  startTime: number
}

class MetricsCollector {
  private static instance: MetricsCollector
  private metrics: PerformanceMetrics
  private startTime: number

  private constructor() {
    this.startTime = Date.now()
    this.metrics = {
      pageLoadTime: 0,
      apiMetrics: [],
      errorCount: 0,
      startTime: this.startTime
    }
  }

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }

  public trackPageLoad(startTime: number): void {
    this.metrics.pageLoadTime = Date.now() - startTime
  }

  public trackApiCall(endpoint: string, startTime: number, status: number): void {
    const responseTime = Date.now() - startTime
    this.metrics.apiMetrics.push({
      endpoint,
      responseTime,
      status,
      timestamp: Date.now()
    })
  }

  public trackError(): void {
    this.metrics.errorCount++
  }

  public getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      startTime: this.startTime
    }
  }

  public reset(): void {
    this.startTime = Date.now()
    this.metrics = {
      pageLoadTime: 0,
      apiMetrics: [],
      errorCount: 0,
      startTime: this.startTime
    }
  }
}

// React hook for using metrics in components
export const useMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => MetricsCollector.getInstance().getMetrics())

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(MetricsCollector.getInstance().getMetrics())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return metrics
}

// Utility functions for tracking metrics
export const trackPageLoad = (startTime: number) => {
  MetricsCollector.getInstance().trackPageLoad(startTime)
}

export const trackApiCall = (endpoint: string, startTime: number, status: number) => {
  MetricsCollector.getInstance().trackApiCall(endpoint, startTime, status)
}

export const trackError = () => {
  MetricsCollector.getInstance().trackError()
}

export const getMetrics = () => {
  return MetricsCollector.getInstance().getMetrics()
}

export const resetMetrics = () => {
  MetricsCollector.getInstance().reset()
} 