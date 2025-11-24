'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Clock, AlertCircle, Zap, Activity } from 'lucide-react'

interface Metrics {
  pageLoadTime: number
  apiResponseTime: number
  errorRate: number
  activeUsers: number
  uptime: number
  apiResponseTimes: Record<string, number>
}

const formatTime = (ms: number) => {
  if (!ms) return '0ms'
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`
}

const formatPercentage = (value: number) => {
  if (!value) return '0%'
  return `${value.toFixed(1)}%`
}

export function MetricsDashboard() {
  const [localMetrics, setLocalMetrics] = useState<Metrics>({
    pageLoadTime: 0,
    apiResponseTime: 0,
    errorRate: 0,
    activeUsers: 0,
    uptime: 0,
    apiResponseTimes: {}
  })

  useEffect(() => {
    // Simulate metrics data
    const mockMetrics: Metrics = {
      pageLoadTime: 450,
      apiResponseTime: 120,
      errorRate: 0.5,
      activeUsers: 42,
      uptime: 86400, // 24 hours in seconds
      apiResponseTimes: {
        '/api/auth': 150,
        '/api/projects': 200,
        '/api/tasks': 180
      }
    }
    setLocalMetrics(mockMetrics)
  }, [])

  const formatUptime = (seconds: number) => {
    if (!seconds) return '0h 0m 0s'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  }

  const calculateUptimePercentage = () => {
    // Assuming 24 hours as the target uptime
    const targetUptime = 24 * 3600
    return ((localMetrics.uptime || 0) / targetUptime) * 100
  }

  const getApiPerformanceColor = (responseTime: number) => {
    if (!responseTime) return 'text-gray-500'
    if (responseTime < 100) return 'text-green-500'
    if (responseTime < 300) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Performance Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Page Load Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(localMetrics.pageLoadTime)}</div>
            <Progress 
              value={(localMetrics.pageLoadTime / 1000) * 100} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Target: &lt;1s
            </p>
          </CardContent>
        </Card>

        {/* API Response Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(localMetrics.apiResponseTime)}</div>
            <Progress 
              value={(localMetrics.apiResponseTime / 500) * 100} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Target: &lt;500ms
            </p>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(localMetrics.errorRate)}</div>
            <Progress 
              value={localMetrics.errorRate} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Target: &lt;1%
            </p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localMetrics.activeUsers}</div>
            <Progress 
              value={(localMetrics.activeUsers / 100) * 100} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        {/* Uptime */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(localMetrics.uptime)}</div>
            <Progress 
              value={calculateUptimePercentage()} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        {/* API Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(localMetrics.apiResponseTimes).map(([endpoint, time]) => (
                <div key={endpoint} className="flex justify-between items-center">
                  <span className="text-sm truncate max-w-[150px]">{endpoint}</span>
                  <span className={getApiPerformanceColor(time)}>
                    {formatTime(time)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 