'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play,
  Square,
  RotateCcw,
  Trash2,
  Activity,
  Zap,
  Shield,
  Clock,
  Hash,
  List,
  RefreshCw
} from 'lucide-react'

interface Process {
  pid: number
  name: string
  cpu: number
  memory: number
  status: 'running' | 'sleeping' | 'stopped'
  uptime: string
}

interface ProcessControlsProps {
  runId?: string
  isActive?: boolean
  onStart?: () => void
  onStop?: () => void
  onRestart?: () => void
  onKill?: () => void
}

export function ProcessControls({
  runId,
  isActive = false,
  onStart,
  onStop,
  onRestart,
  onKill
}: ProcessControlsProps) {
  const [processes, setProcesses] = useState<Process[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock process data
  useEffect(() => {
    if (!runId || !isActive) {
      setProcesses([])
      return
    }

    const mockProcesses: Process[] = [
      {
        pid: 1,
        name: 'node',
        cpu: 15.5,
        memory: 128.7,
        status: 'running',
        uptime: '5m 23s'
      },
      {
        pid: 42,
        name: 'npm',
        cpu: 2.1,
        memory: 45.2,
        status: 'running',
        uptime: '5m 20s'
      },
      {
        pid: 156,
        name: 'webpack',
        cpu: 8.3,
        memory: 89.4,
        status: 'running',
        uptime: '4m 15s'
      }
    ]

    setProcesses(mockProcesses)

    // Simulate process updates
    const interval = setInterval(() => {
      setProcesses(prev => prev.map(proc => ({
        ...proc,
        cpu: Math.max(0, Math.min(100, proc.cpu + (Math.random() - 0.5) * 5)),
        memory: Math.max(10, Math.min(200, proc.memory + (Math.random() - 0.5) * 10))
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [runId, isActive])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500'
      case 'sleeping': return 'bg-yellow-500'
      case 'stopped': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const refreshProcesses = async () => {
    if (!runId) return

    setIsLoading(true)
    try {
      // In production, fetch real process list from runtime
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Mock refresh - in reality would call API
    } catch (error) {
      console.error('Error refreshing processes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <List className="h-5 w-5 text-cyan-400" />
            <span>Process Controls</span>
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshProcesses}
            disabled={isLoading || !isActive}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!runId || !isActive ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 text-slate-400 opacity-50" />
            <p className="text-slate-400">No active runtime</p>
            <p className="text-slate-500 text-sm">Start a sandbox to monitor processes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Main Process Controls */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onStart}
                disabled={isActive}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-3 w-3" />
                <span>Start</span>
              </Button>
              
              <Button
                onClick={onStop}
                disabled={!isActive}
                variant="outline"
                className="flex items-center space-x-1 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white"
              >
                <Square className="h-3 w-3" />
                <span>Stop</span>
              </Button>
              
              <Button
                onClick={onRestart}
                disabled={!isActive}
                variant="outline"
                className="flex items-center space-x-1 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Restart</span>
              </Button>
              
              <Button
                onClick={onKill}
                disabled={!isActive}
                variant="outline"
                className="flex items-center space-x-1 border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="h-3 w-3" />
                <span>Kill</span>
              </Button>
            </div>

            {/* Process List */}
            <div className="space-y-2">
              <h4 className="text-white font-medium flex items-center space-x-2">
                <Hash className="h-4 w-4" />
                <span>Running Processes</span>
                <Badge variant="outline" className="text-xs">
                  {processes.length}
                </Badge>
              </h4>
              
              {processes.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-sm">
                  No processes running
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {processes.map((process) => (
                    <div key={process.pid} className="bg-slate-700 rounded p-3 border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(process.status)} text-white text-xs`}>
                            {process.status}
                          </Badge>
                          <span className="text-white font-medium">{process.name}</span>
                        </div>
                        <span className="text-slate-400 text-xs">PID: {process.pid}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-slate-400">CPU</div>
                          <div className="text-white font-mono">{process.cpu.toFixed(1)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400">Memory</div>
                          <div className="text-white font-mono">{process.memory.toFixed(0)}MB</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400">Uptime</div>
                          <div className="text-white font-mono">{process.uptime}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
              <h5 className="text-white font-medium mb-2 flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span>Quick Actions</span>
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 justify-start text-slate-300 hover:text-white"
                >
                  View Logs
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 justify-start text-slate-300 hover:text-white"
                >
                  Open Terminal
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 justify-start text-slate-300 hover:text-white"
                >
                  Create Snapshot
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 justify-start text-slate-300 hover:text-white"
                >
                  View Metrics
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
