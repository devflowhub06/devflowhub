'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Rocket,
  Terminal,
  Activity,
  Database,
  Settings,
  ExternalLink,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Clock,
  DollarSign,
  Shield,
  Zap,
  Eye,
  Code,
  Monitor,
  Server,
  Cloud,
  Copy
} from 'lucide-react'
import { RunControls } from '@/components/sandbox/RunControls'
import { LogsView } from '@/components/sandbox/LogsView'
import { SnapshotManager } from '@/components/sandbox/SnapshotManager'
import { RuntimeMonitor } from '@/components/sandbox/RuntimeMonitor'
import { ProcessControls } from '@/components/sandbox/ProcessControls'
import { EditorTerminal } from '@/components/editor/EditorTerminal'

interface DevFlowHubSandboxProps {
  projectId: string
  onStatusChange?: (status: any) => void
  onToolSwitch?: (tool: string) => void
}

interface RunStatus {
  id: string
  status: string
  url?: string
  branch: string
  health?: any
  estimatedCost: number
  createdAt: string
}

export default function DevFlowHubSandbox({ 
  projectId, 
  onStatusChange, 
  onToolSwitch 
}: DevFlowHubSandboxProps) {
  const [activeTab, setActiveTab] = useState<'controls' | 'monitor'>('controls')
  const [currentRun, setCurrentRun] = useState<RunStatus | null>(null)
  const [runs, setRuns] = useState<RunStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  // Load existing runs
  const loadRuns = useCallback(async () => {
    try {
      const response = await fetch(`/api/sandbox/${projectId}/run`)
      if (response.ok) {
        const data = await response.json()
        setRuns(data.runs || [])
        
        // Set current run if any is active
        const activeRun = data.runs?.find((r: RunStatus) => 
          r.status === 'running' || r.status === 'starting'
        )
        if (activeRun) {
          setCurrentRun(activeRun)
          setIsStreaming(true)
        }
      }
    } catch (error) {
      console.error('Error loading runs:', error)
    }
  }, [projectId])

  // Start new run
  const handleRunStart = useCallback(async (options: any) => {
    try {
      setIsLoading(true)
      
      // Show starting message
      onStatusChange?.({
        status: 'starting',
        message: 'Creating K8s runtime environment...',
        progress: 25
      })
      
      const response = await fetch(`/api/sandbox/${projectId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      })

      if (response.ok) {
        const data = await response.json()
        const newRun: RunStatus = {
          id: data.runId,
          status: 'starting',
          url: data.url,
          branch: options.branch,
          estimatedCost: data.estimatedCost,
          createdAt: data.createdAt,
          health: {
            uptime: '0s',
            memoryMb: 0,
            cpuPercent: 0
          }
        }
        
        setCurrentRun(newRun)
        setIsStreaming(true)
        
        // Simulate runtime startup process
        setTimeout(() => {
          setCurrentRun(prev => prev ? { ...prev, status: 'building' } : null)
          onStatusChange?.({
            status: 'building',
            message: 'Building project dependencies...',
            progress: 50
          })
        }, 2000)
        
        setTimeout(() => {
          setCurrentRun(prev => prev ? { 
            ...prev, 
            status: 'running',
            health: {
              uptime: '30s',
              memoryMb: 128,
              cpuPercent: 15
            }
          } : null)
          onStatusChange?.({
            status: 'running',
            message: 'Runtime active - preview URL ready!',
            progress: 100
          })
        }, 5000)
        
        await loadRuns()
      } else {
        const error = await response.json()
        alert(`Failed to start run: ${error.error}`)
      }
    } catch (error) {
      console.error('Error starting run:', error)
      alert('Failed to start sandbox runtime')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, onStatusChange, loadRuns])

  // Stop run
  const handleRunStop = useCallback(async (runId: string) => {
    try {
      const response = await fetch(`/api/sandbox/${projectId}/run/${runId}/stop`, {
        method: 'POST'
      })

      if (response.ok) {
        setCurrentRun(prev => prev ? { ...prev, status: 'stopped' } : null)
        setIsStreaming(false)
        await loadRuns()
      }
    } catch (error) {
      console.error('Error stopping run:', error)
    }
  }, [projectId, loadRuns])

  // Restart run
  const handleRunRestart = useCallback(async (runId: string) => {
    try {
      await handleRunStop(runId)
      // Wait a moment then start new run with same options
      setTimeout(() => {
        if (currentRun) {
          handleRunStart({
            branch: currentRun.branch,
            ttlMinutes: 60,
            snapshotBeforeRun: true
          })
        }
      }, 2000)
    } catch (error) {
      console.error('Error restarting run:', error)
    }
  }, [currentRun, handleRunStart, handleRunStop])

  // Destroy run
  const handleRunDestroy = useCallback(async (runId: string) => {
    try {
      const response = await fetch(`/api/sandbox/${projectId}/run/${runId}/destroy`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCurrentRun(null)
        setIsStreaming(false)
        await loadRuns()
      }
    } catch (error) {
      console.error('Error destroying run:', error)
    }
  }, [projectId, loadRuns])

  // Load runs on mount
  useEffect(() => {
    loadRuns()
  }, [loadRuns])

  // Poll for runtime status updates
  useEffect(() => {
    if (!currentRun || currentRun.status !== 'running') return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/sandbox/${projectId}/run/${currentRun.id}/status`)
        if (response.ok) {
          const statusData = await response.json()
          setCurrentRun(prev => prev ? {
            ...prev,
            status: statusData.status,
            health: statusData.health,
            url: statusData.url
          } : null)
        }
      } catch (error) {
        console.error('Error polling status:', error)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [currentRun, projectId])

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Sandbox Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Rocket className="h-6 w-6 text-orange-400" />
              <h2 className="text-xl font-bold text-white">DevFlowHub Sandbox</h2>
            </div>
            <Badge variant="outline" className="text-orange-400 border-orange-400">
              K8s Runtime
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentRun && (
              <>
                <Badge className={`${
                  currentRun.status === 'running' ? 'bg-green-500' : 
                  currentRun.status === 'building' ? 'bg-blue-500' :
                  currentRun.status === 'starting' ? 'bg-yellow-500' : 'bg-gray-500'
                } text-white`}>
                  {currentRun.status}
                </Badge>
                {currentRun.url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(currentRun.url, '_blank')}
                    className="flex items-center space-x-1 text-green-400 border-green-400"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Open Preview</span>
                  </Button>
                )}
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={loadRuns}
              className="flex items-center space-x-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-96 border-r border-slate-700 flex flex-col">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="controls" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Controls
              </TabsTrigger>
              <TabsTrigger value="monitor" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Monitor
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="controls" className="h-full p-4 overflow-y-auto">
                <RunControls
                  projectId={projectId}
                  currentRun={currentRun}
                  onRunStart={handleRunStart}
                  onRunStop={handleRunStop}
                  onRunRestart={handleRunRestart}
                  onRunDestroy={handleRunDestroy}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="monitor" className="h-full p-4 overflow-y-auto space-y-4">
                <RuntimeMonitor 
                  runId={currentRun?.id}
                  isActive={currentRun?.status === 'running'}
                />
                <ProcessControls
                  runId={currentRun?.id}
                  isActive={currentRun?.status === 'running'}
                  onStart={() => {/* TODO */}}
                  onStop={() => currentRun && handleRunStop(currentRun.id)}
                  onRestart={() => currentRun && handleRunRestart(currentRun.id)}
                  onKill={() => currentRun && handleRunDestroy(currentRun.id)}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Panel - Multi-Purpose */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="preview" className="h-full flex flex-col">
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
              <TabsList className="bg-slate-700">
                <TabsTrigger value="preview" className="text-xs">
                  <Monitor className="h-3 w-3 mr-1" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="logs" className="text-xs">
                  <Terminal className="h-3 w-3 mr-1" />
                  Logs
                </TabsTrigger>
                <TabsTrigger value="terminal" className="text-xs">
                  <Code className="h-3 w-3 mr-1" />
                  Terminal
                </TabsTrigger>
                <TabsTrigger value="snapshots" className="text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  Snapshots
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="preview" className="h-full">
                {currentRun ? (
                  <>
                    {/* Preview Header */}
                    <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Monitor className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-white">Live Preview</span>
                        <Badge variant="outline" className="text-xs border-green-400 text-green-400">
                          {currentRun.branch}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => currentRun.url && window.open(currentRun.url, '_blank')}
                          disabled={!currentRun.url}
                          className="flex items-center space-x-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Open</span>
                        </Button>
                      </div>
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 bg-white">
                      {currentRun.status === 'running' && currentRun.url ? (
                        <iframe
                          src={currentRun.url}
                          className="w-full h-full border-0"
                          title="Sandbox Preview"
                          sandbox="allow-scripts allow-same-origin allow-forms"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                            <p className="text-slate-600 font-medium">
                              {currentRun?.status === 'starting' && 'Starting K8s pod...'}
                              {currentRun?.status === 'building' && 'Building dependencies...'}
                              {!currentRun && 'Runtime not started'}
                            </p>
                            <p className="text-slate-500 text-sm">
                              {currentRun?.status === 'starting' && 'Creating isolated environment'}
                              {currentRun?.status === 'building' && 'Installing packages and building project'}
                              {!currentRun && 'Click "Start Sandbox Runtime" to begin'}
                            </p>
                            {currentRun?.url && (
                              <div className="mt-4">
                                <p className="text-slate-600 text-sm mb-2">Preview URL Ready:</p>
                                <code className="bg-slate-100 px-3 py-1 rounded text-sm text-slate-700">
                                  {currentRun.url}
                                </code>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Rocket className="h-20 w-20 mx-auto mb-6 text-slate-400 opacity-50" />
                      <h3 className="text-xl font-bold text-white mb-2">Welcome to DevFlowHub Sandbox</h3>
                      <p className="text-slate-400 mb-6 max-w-md">
                        Create isolated, secure runtime environments for your projects. 
                        Start a sandbox to see live preview, logs, and terminal access.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm text-slate-500">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-green-400" />
                          <span>Isolated & Secure</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span>One-Click Deploy</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Terminal className="h-4 w-4 text-blue-400" />
                          <span>Real-time Logs</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-purple-400" />
                          <span>Snapshot & Restore</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="logs" className="h-full p-4">
                <LogsView
                  runId={currentRun?.id}
                  isStreaming={isStreaming}
                  onToggleStreaming={() => setIsStreaming(!isStreaming)}
                  onClearLogs={() => {/* TODO: Clear logs */}}
                />
              </TabsContent>

              <TabsContent value="terminal" className="h-full">
                <EditorTerminal projectId={projectId} />
              </TabsContent>

              <TabsContent value="snapshots" className="h-full p-4 overflow-y-auto">
                <SnapshotManager projectId={projectId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span>Total Runs: {runs.length}</span>
            <span>Active: {runs.filter(r => r.status === 'running').length}</span>
            {currentRun && (
              <>
                <span>Cost: ${currentRun.estimatedCost}</span>
                <span>Status: {currentRun.status}</span>
                {currentRun.health && (
                  <span>Uptime: {currentRun.health.uptime}</span>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Runtime: Kubernetes</span>
            <div className={`w-2 h-2 rounded-full ${
              currentRun?.status === 'running' ? 'bg-green-400' : 
              currentRun?.status === 'starting' || currentRun?.status === 'building' ? 'bg-yellow-400' : 
              'bg-green-400'
            }`}></div>
            <span>{currentRun?.status === 'running' ? 'Active' : 'Healthy'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
