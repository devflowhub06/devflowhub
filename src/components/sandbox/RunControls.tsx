'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Square, 
  RotateCcw, 
  ExternalLink,
  Settings,
  Clock,
  DollarSign,
  Shield,
  Zap,
  Terminal,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  Activity
} from 'lucide-react'

interface RunControlsProps {
  projectId: string
  currentRun?: any
  onRunStart: (options: any) => Promise<void>
  onRunStop: (runId: string) => Promise<void>
  onRunRestart: (runId: string) => Promise<void>
  onRunDestroy: (runId: string) => Promise<void>
  isLoading?: boolean
}

interface EnvironmentVariable {
  key: string
  value: string
  isSecret: boolean
}

export function RunControls({
  projectId,
  currentRun,
  onRunStart,
  onRunStop,
  onRunRestart,
  onRunDestroy,
  isLoading = false
}: RunControlsProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([
    { key: 'NODE_ENV', value: 'development', isSecret: false },
    { key: 'PORT', value: '3000', isSecret: false }
  ])
  const [runOptions, setRunOptions] = useState({
    branch: 'main',
    public: false,
    ttlMinutes: 60,
    snapshotBeforeRun: true,
    buildCommand: '',
    startCommand: ''
  })
  const [estimatedCost, setEstimatedCost] = useState(0.15)

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '', isSecret: false }])
  }

  const updateEnvVar = (index: number, field: keyof EnvironmentVariable, value: string | boolean) => {
    const updated = [...envVars]
    updated[index] = { ...updated[index], [field]: value }
    setEnvVars(updated)
  }

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index))
  }

  const handleRunStart = async () => {
    const env = envVars.reduce((acc, { key, value }) => {
      if (key.trim()) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, string>)

    await onRunStart({
      ...runOptions,
      env
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500'
      case 'starting': return 'bg-yellow-500'
      case 'building': return 'bg-blue-500'
      case 'stopped': return 'bg-gray-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Run Status */}
      {currentRun && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Current Run</span>
              </CardTitle>
              <Badge className={`${getStatusColor(currentRun.status)} text-white`}>
                {currentRun.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Run ID:</span>
                <code className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-200">
                  {currentRun.id}
                </code>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Branch:</span>
                <Badge variant="outline" className="text-xs">
                  {currentRun.branch}
                </Badge>
              </div>

              {currentRun.url && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Preview URL:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(currentRun.url, '_blank')}
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open
                  </Button>
                </div>
              )}

              {currentRun.health && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-slate-700 rounded">
                    <div className="text-slate-400">Uptime</div>
                    <div className="text-white font-mono">{currentRun.health.uptime}</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700 rounded">
                    <div className="text-slate-400">Memory</div>
                    <div className="text-white font-mono">{currentRun.health.memoryMb}MB</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700 rounded">
                    <div className="text-slate-400">CPU</div>
                    <div className="text-white font-mono">{currentRun.health.cpuPercent}%</div>
                  </div>
                </div>
              )}

              {/* Run Controls */}
              <div className="flex items-center space-x-2 pt-2">
                {currentRun.status === 'running' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRunStop(currentRun.id)}
                      className="flex items-center space-x-1"
                    >
                      <Square className="h-3 w-3" />
                      <span>Stop</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRunRestart(currentRun.id)}
                      className="flex items-center space-x-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Restart</span>
                    </Button>
                  </>
                )}
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to destroy this run? This cannot be undone.')) {
                      onRunDestroy(currentRun.id)
                    }
                  }}
                  className="flex items-center space-x-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Destroy</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Run Configuration */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Start New Run</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Branch</Label>
                  <Input
                    value={runOptions.branch}
                    onChange={(e) => setRunOptions({...runOptions, branch: e.target.value})}
                    placeholder="main"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-slate-300">TTL (minutes)</Label>
                  <Input
                    type="number"
                    value={runOptions.ttlMinutes}
                    onChange={(e) => setRunOptions({...runOptions, ttlMinutes: parseInt(e.target.value)})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={runOptions.public}
                    onChange={(e) => setRunOptions({...runOptions, public: e.target.checked})}
                    className="rounded"
                  />
                  <span>Public preview URL</span>
                </label>

                <label className="flex items-center space-x-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={runOptions.snapshotBeforeRun}
                    onChange={(e) => setRunOptions({...runOptions, snapshotBeforeRun: e.target.checked})}
                    className="rounded"
                  />
                  <span>Create snapshot</span>
                </label>
              </div>

              {/* Cost Estimation */}
              <div className="bg-slate-700 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-slate-300">Estimated Cost</span>
                  </div>
                  <span className="text-lg font-bold text-green-400">${estimatedCost}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Build time + {runOptions.ttlMinutes}min runtime + bandwidth
                </p>
              </div>
            </TabsContent>

            <TabsContent value="environment" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Environment Variables</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addEnvVar}
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {envVars.map((envVar, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="KEY"
                      value={envVar.key}
                      onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white flex-1"
                    />
                    <Input
                      placeholder="value"
                      type={envVar.isSecret ? 'password' : 'text'}
                      value={envVar.value}
                      onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateEnvVar(index, 'isSecret', !envVar.isSecret)}
                      className="p-1"
                    >
                      {envVar.isSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeEnvVar(index)}
                      className="p-1 text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div>
                <Label className="text-slate-300">Build Command</Label>
                <Input
                  value={runOptions.buildCommand}
                  onChange={(e) => setRunOptions({...runOptions, buildCommand: e.target.value})}
                  placeholder="npm run build"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">Start Command</Label>
                <Input
                  value={runOptions.startCommand}
                  onChange={(e) => setRunOptions({...runOptions, startCommand: e.target.value})}
                  placeholder="npm start"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-300">Security Notice</span>
                </div>
                <p className="text-xs text-amber-200">
                  Runtimes are isolated and auto-destroy after TTL. 
                  Secrets are encrypted and never logged.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Start Run Button */}
          <div className="pt-4 border-t border-slate-700">
            <Button
              onClick={handleRunStart}
              disabled={isLoading || currentRun?.status === 'running'}
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Starting Runtime...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Start Sandbox Runtime</span>
                  <Badge variant="outline" className="ml-2 text-green-400 border-green-400">
                    ${estimatedCost}
                  </Badge>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
