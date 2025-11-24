'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  RefreshCw, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle, 
  Wifi, 
  WifiOff,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { toast } from 'sonner'

export interface ToolEmbedProps {
  tool: 'editor' | 'sandbox' | 'ui-studio' | 'deployer'
  projectId: string
  project: any
  embedUrl?: string
  fallbackUrl?: string
  onLoad?: () => void
  onError?: (error: string) => void
  onRefresh?: () => void
  className?: string
  showHeader?: boolean
  showStatusBar?: boolean
  allowFullscreen?: boolean
}

export default function ToolEmbed({
  tool,
  projectId,
  project,
  embedUrl,
  fallbackUrl,
  onLoad,
  onError,
  onRefresh,
  className = '',
  showHeader = true,
  showStatusBar = true,
  allowFullscreen = true
}: ToolEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  const toolConfig = {
    editor: {
      name: 'DevFlowHub Editor',
      icon: '💻',
      color: 'blue',
      description: 'AI-powered code editor'
    },
    sandbox: {
      name: 'DevFlowHub Sandbox',
      icon: '🟢',
      color: 'green',
      description: 'Online IDE and cloud runtime'
    },
    'ui-studio': {
      name: 'DevFlowHub UI Studio',
      icon: '🎨',
      color: 'purple',
      description: 'AI-powered UI generator'
    },
    deployer: {
      name: 'DevFlowHub Deployer',
      icon: '⚡',
      color: 'yellow',
      description: 'Deployment and preview'
    }
  }

  const config = toolConfig[tool]

  useEffect(() => {
    if (embedUrl) {
      setIsLoading(true)
      setError(null)
      setConnectionStatus('connecting')
    }
  }, [embedUrl])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setIsConnected(true)
    setConnectionStatus('connected')
    onLoad?.()
    toast.success(`${config.name} workspace loaded successfully`, {
      icon: <CheckCircle className="w-4 h-4" />,
    })
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setIsConnected(false)
    setConnectionStatus('disconnected')
    const errorMsg = `Failed to load ${config.name} workspace`
    setError(errorMsg)
    onError?.(errorMsg)
    toast.error(errorMsg, {
      icon: <AlertCircle className="w-4 h-4" />,
    })
  }

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true)
      setError(null)
      setConnectionStatus('connecting')
      iframeRef.current.src = iframeRef.current.src
    }
    onRefresh?.()
  }

  const handleOpenExternal = () => {
    const url = fallbackUrl || embedUrl
    if (url) {
      window.open(url, '_blank')
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <RefreshCw className="h-3 w-3 animate-spin" />
      case 'connected':
        return <Wifi className="h-3 w-3 text-green-500" />
      case 'disconnected':
        return <WifiOff className="h-3 w-3 text-red-500" />
    }
  }

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting...'
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Disconnected'
    }
  }

  if (!embedUrl) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">{config.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{config.name} Workspace</h3>
            <p className="text-gray-600 mb-4">{config.description}</p>
            <p className="text-sm text-gray-500">No embed URL configured for this tool.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`h-full flex flex-col ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Header */}
      {showHeader && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h3 className="font-medium text-gray-900">{config.name} Workspace</h3>
              <p className="text-sm text-gray-500">
                {project.name} • {project.language}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : 'secondary'} 
              className="text-xs"
            >
              <span className="flex items-center space-x-1">
                {getConnectionIcon()}
                <span>{getConnectionText()}</span>
              </span>
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {fallbackUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenExternal}
                className="h-8"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open
              </Button>
            )}
            
            {allowFullscreen && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Embed Container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading {config.name} workspace...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <Card className="max-w-md">
              <CardContent className="p-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-4 flex space-x-2">
                  <Button onClick={handleRefresh} disabled={isLoading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                  {fallbackUrl && (
                    <Button variant="outline" onClick={handleOpenExternal}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open External
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full border-0"
          title={`${config.name} Workspace`}
          allow="camera; microphone; geolocation; encrypted-media; clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>

      {/* Status Bar */}
      {showStatusBar && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              {getConnectionIcon()}
              <span>{getConnectionText()}</span>
            </span>
            <span>Project: {project.name}</span>
            <span>Tool: {config.name}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Auto-sync enabled</span>
            <Settings className="h-3 w-3" />
          </div>
        </div>
      )}
    </div>
  )
}
