'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity,
  Cpu,
  HardDrive,
  Network,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Server,
  Eye,
  BarChart3
} from 'lucide-react'

interface RuntimeMonitorProps {
  runId?: string
  isActive?: boolean
}

interface Metrics {
  cpu: number
  memory: number
  network: number
  uptime: number
  requests: number
  errors: number
}

export function RuntimeMonitor({ runId, isActive = false }: RuntimeMonitorProps) {
  const [metrics, setMetrics] = useState<Metrics>({
    cpu: 0,
    memory: 0,
    network: 0,
    uptime: 0,
    requests: 0,
    errors: 0
  })
  const [isLoading, setIsLoading] = useState(false)

  // Simulate real-time metrics
  useEffect(() => {
    if (!runId || !isActive) return

    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(50, Math.min(512, prev.memory + (Math.random() - 0.5) * 20)),
        network: prev.network + Math.random() * 100,
        uptime: prev.uptime + 1,
        requests: prev.requests + Math.floor(Math.random() * 3),
        errors: prev.errors + (Math.random() > 0.95 ? 1 : 0)
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [runId, isActive])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getHealthStatus = () => {
    if (metrics.cpu > 80) return { status: 'warning', color: 'text-yellow-400', icon: AlertTriangle }
    if (metrics.memory > 400) return { status: 'warning', color: 'text-yellow-400', icon: AlertTriangle }
    if (metrics.errors > 5) return { status: 'error', color: 'text-red-400', icon: AlertTriangle }
    return { status: 'healthy', color: 'text-green-400', icon: CheckCircle }
  }

  const health = getHealthStatus()

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <span>Runtime Monitor</span>
          </CardTitle>
          {runId && (
            <div className="flex items-center space-x-2">
              <health.icon className={`h-4 w-4 ${health.color}`} />
              <Badge className={`${health.status === 'healthy' ? 'bg-green-500' : health.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                {health.status}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!runId || !isActive ? (
          <div className="text-center py-8">
            <Server className="h-12 w-12 mx-auto mb-4 text-slate-400 opacity-50" />
            <p className="text-slate-400">No active runtime</p>
            <p className="text-slate-500 text-sm">Start a sandbox to see real-time metrics</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-slate-300">CPU</span>
                  </div>
                  <span className="text-lg font-bold text-white">{metrics.cpu.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metrics.cpu > 80 ? 'bg-red-400' : metrics.cpu > 60 ? 'bg-yellow-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${Math.min(100, metrics.cpu)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-slate-300">Memory</span>
                  </div>
                  <span className="text-lg font-bold text-white">{metrics.memory.toFixed(0)}MB</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metrics.memory > 400 ? 'bg-red-400' : metrics.memory > 300 ? 'bg-yellow-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${Math.min(100, (metrics.memory / 512) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-slate-300">Uptime</span>
                  </div>
                  <span className="text-lg font-bold text-white">{formatUptime(metrics.uptime)}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Started {formatUptime(metrics.uptime)} ago
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Network className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-slate-300">Network</span>
                  </div>
                  <span className="text-lg font-bold text-white">{(metrics.network / 1024).toFixed(1)}KB</span>
                </div>
                <div className="text-xs text-slate-400">
                  Total transferred
                </div>
              </div>
            </div>

            {/* Request Stats */}
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-orange-400" />
                  <span>Request Stats</span>
                </h4>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Total Requests:</span>
                  <span className="text-white font-mono">{metrics.requests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Errors:</span>
                  <span className={`font-mono ${metrics.errors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {metrics.errors}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Success Rate:</span>
                  <span className="text-green-400 font-mono">
                    {metrics.requests > 0 ? ((metrics.requests - metrics.errors) / metrics.requests * 100).toFixed(1) : 100}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Avg Response:</span>
                  <span className="text-blue-400 font-mono">45ms</span>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Performance Insights</span>
              </div>
              <div className="text-xs text-blue-200 space-y-1">
                {metrics.cpu < 30 && <p>✓ CPU usage is optimal</p>}
                {metrics.memory < 200 && <p>✓ Memory usage is efficient</p>}
                {metrics.errors === 0 && <p>✓ No errors detected</p>}
                {metrics.cpu > 80 && <p>⚠ High CPU usage detected</p>}
                {metrics.memory > 400 && <p>⚠ High memory usage</p>}
                {metrics.errors > 0 && <p>⚠ {metrics.errors} errors occurred</p>}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
