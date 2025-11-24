'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Terminal,
  Download,
  Copy,
  RefreshCw,
  Play,
  Square,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { createDeploymentWebSocket, LogMessage, DeploymentStatus } from '@/lib/deployer/websocket'

interface DeployLogsProps {
  deployId: string
  projectId: string
  status?: 'pending' | 'deploying' | 'success' | 'failed'
  onStatusChange?: (status: string) => void
}

export function DeployLogs({ deployId, projectId, status, onStatusChange }: DeployLogsProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<any>(null)
  const [logs, setLogs] = useState<LogMessage[]>([])
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (deployId && projectId) {
      connectToLogs()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
    }
  }, [deployId, projectId])

  const connectToLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setLogs([])
      
      wsRef.current = createDeploymentWebSocket(
        projectId,
        deployId,
        handleLogMessage,
        handleStatusChange,
        handleError,
        handleConnect,
        handleDisconnect
      )
      
      wsRef.current.connect()
    } catch (err) {
      setError('Failed to connect to deployment logs')
      setIsConnected(false)
      setIsLoading(false)
    }
  }

  const handleLogMessage = (log: LogMessage) => {
    setLogs(prev => [...prev, log])
  }

  const handleStatusChange = (status: DeploymentStatus) => {
    setDeploymentStatus(status)
    if (onStatusChange) {
      onStatusChange(status.status)
    }
  }

  const handleError = (error: string) => {
    setError(error)
    setIsConnected(false)
  }

  const handleConnect = () => {
    setIsConnected(true)
    setIsLoading(false)
    setError(null)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
  }

  const copyLogs = () => {
    const logsText = logs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString()
      return `[${timestamp}] ${log.message}`
    }).join('\n')
    navigator.clipboard.writeText(logsText)
  }

  const downloadLogs = () => {
    const logsText = logs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString()
      return `[${timestamp}] ${log.level?.toUpperCase() || 'INFO'} ${log.message}`
    }).join('\n')
    
    const blob = new Blob([logsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deploy-${deployId}-logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getCurrentStatus = () => {
    return deploymentStatus?.status || status || 'unknown'
  }

  const getStatusIcon = () => {
    const currentStatus = getCurrentStatus()
    switch (currentStatus) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'deploying':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Terminal className="h-4 w-4 text-slate-600" />
    }
  }

  const getStatusBadge = () => {
    const currentStatus = getCurrentStatus()
    switch (currentStatus) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'deploying':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Deploying {deploymentStatus?.progress && `(${deploymentStatus.progress}%)`}
        </Badge>
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Success</Badge>
      case 'failed':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <CardTitle className="text-lg">Deployment Logs</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={connectToLogs}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={copyLogs}
              disabled={logs.length === 0}
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={downloadLogs}
              disabled={logs.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <span>Deploy ID: {deployId}</span>
            <span className={`flex items-center space-x-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </span>
          </div>
          
          {deploymentStatus?.progress !== undefined && getCurrentStatus() === 'deploying' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span>{deploymentStatus.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${deploymentStatus.progress}%` }}
                />
              </div>
            </div>
          )}
          
          {deploymentStatus?.url && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Deployed URL:</span>
              <Button
                size="sm"
                variant="link"
                onClick={() => window.open(deploymentStatus.url, '_blank')}
                className="p-0 h-auto text-blue-600 hover:text-blue-800"
              >
                {deploymentStatus.url}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <div className="h-full bg-slate-900 text-green-400 font-mono text-sm overflow-auto">
          <div className="p-4 space-y-1">
            {isLoading && logs.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-2"></div>
                  <p className="text-slate-400">Connecting to logs...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400">{error}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={connectToLogs}
                    className="mt-2"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Connection
                  </Button>
                </div>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Terminal className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">No logs available</p>
                  <p className="text-slate-500 text-xs">Deployment logs will appear here</p>
                </div>
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-slate-500 text-xs mt-1 w-8 text-right">
                    {String(index + 1).padStart(3, '0')}
                  </span>
                  <span className="flex-1">
                    {log.level === 'error' && <span className="text-red-400">[ERROR] </span>}
                    {log.level === 'warn' && <span className="text-yellow-400">[WARN] </span>}
                    {log.level === 'debug' && <span className="text-slate-400">[DEBUG] </span>}
                    {log.message}
                  </span>
                </div>
              ))
            )}
            
            {getCurrentStatus() === 'deploying' && (
              <div className="flex items-center space-x-2 text-slate-400">
                <div className="animate-pulse">●</div>
                <span>Streaming logs...</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
