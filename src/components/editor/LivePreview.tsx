'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Sandpack } from '@codesandbox/sandpack-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Square, 
  RefreshCw, 
  ExternalLink,
  Eye,
  Code,
  Monitor,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings
} from 'lucide-react'

interface LivePreviewProps {
  files: Array<{
    path: string
    content: string
  }>
  template?: 'react' | 'vanilla' | 'vue' | 'angular' | 'nextjs'
  onRefresh?: () => void
  isAutoRefresh?: boolean
  onStatusChange?: (status: { status: string; message: string; progress?: number }) => void
}

export function LivePreview({ 
  files, 
  template = 'react',
  onRefresh,
  isAutoRefresh = true,
  onStatusChange
}: LivePreviewProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [lastFilesHash, setLastFilesHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'building' | 'ready' | 'error'>('idle')
  const [showCode, setShowCode] = useState(false)

  // Generate hash of files to detect changes
  const generateFilesHash = useCallback((files: Array<{ path: string; content: string }>) => {
    return files.map(f => `${f.path}:${f.content}`).join('|')
  }, [])

  // Auto-refresh when files change
  useEffect(() => {
    if (!isAutoRefresh) return

    const currentHash = generateFilesHash(files)
    if (currentHash !== lastFilesHash && lastFilesHash !== '') {
      setIsLoading(true)
      setPreviewStatus('building')
      onStatusChange?.({ status: 'building', message: 'Files changed, rebuilding preview...', progress: 50 })
      
      // Debounce the refresh
      const timeoutId = setTimeout(() => {
        setPreviewKey(prev => prev + 1)
        setIsLoading(false)
        setPreviewStatus('ready')
        onStatusChange?.({ status: 'ready', message: 'Preview updated successfully', progress: 100 })
        onRefresh?.()
      }, 500)

      return () => clearTimeout(timeoutId)
    }
    
    setLastFilesHash(currentHash)
  }, [files, lastFilesHash, generateFilesHash, isAutoRefresh, onRefresh, onStatusChange])

  const handleRefresh = useCallback(() => {
    setIsLoading(true)
    setPreviewStatus('building')
    onStatusChange?.({ status: 'building', message: 'Manually refreshing preview...', progress: 30 })
    
    setTimeout(() => {
      setPreviewKey(prev => prev + 1)
      setIsLoading(false)
      setPreviewStatus('ready')
      onStatusChange?.({ status: 'ready', message: 'Preview refreshed successfully', progress: 100 })
      onRefresh?.()
    }, 300)
  }, [onRefresh, onStatusChange])

  const handleRun = useCallback(() => {
    setIsRunning(true)
    setPreviewStatus('building')
    onStatusChange?.({ status: 'building', message: 'Starting preview...', progress: 20 })
    
    setTimeout(() => {
      setIsRunning(false)
      setPreviewStatus('ready')
      onStatusChange?.({ status: 'ready', message: 'Preview is running', progress: 100 })
    }, 2000)
  }, [onStatusChange])

  // Convert files to Sandpack format
  const sandpackFiles = files.reduce((acc, file) => {
    acc[file.path] = file.content
    return acc
  }, {} as Record<string, string>)

  // Ensure we have required files for React
  if (template === 'react' && !sandpackFiles['/App.js'] && !sandpackFiles['/App.tsx']) {
    sandpackFiles['/App.js'] = `import React from 'react'

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Welcome to DevFlowHub Editor</h1>
      <p>Start editing your files to see live preview!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p><strong>Hot Reload:</strong> Enabled</p>
        <p><strong>Status:</strong> ${previewStatus}</p>
        <p><strong>Files:</strong> ${files.length} files loaded</p>
      </div>
    </div>
  )
}`
  }

  if (template === 'react' && !sandpackFiles['/index.js']) {
    sandpackFiles['/index.js'] = `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(<App />)`
  }

  if (template === 'react' && !sandpackFiles['/public/index.html']) {
    sandpackFiles['/public/index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevFlowHub Preview</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`
  }

  const getStatusIcon = () => {
    switch (previewStatus) {
      case 'building':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Eye className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (previewStatus) {
      case 'building':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-gray-900">Live Preview</span>
            <Badge variant="outline" className={getStatusColor()}>
              {previewStatus}
            </Badge>
          </div>
          
          {isAutoRefresh && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              <Zap className="h-3 w-3 mr-1" />
              Auto Refresh
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-2"
          >
            {showCode ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
            {showCode ? 'Preview' : 'Code'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <Square className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'Stop' : 'Run'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        <Sandpack
          key={previewKey}
          template={template}
          files={sandpackFiles}
          options={{
            showNavigator: false,
            showRefreshButton: false,
            showTabs: showCode,
            showLineNumbers: showCode,
            editorHeight: showCode ? 300 : 0,
            editorWidth: showCode ? 500 : 0,
            wrapContent: true,
            autorun: true,
            autoReload: isAutoRefresh,
            bundlerURL: 'https://bundler.ecmascript.org/',
          }}
          theme="light"
          customSetup={{
            dependencies: {
              'react': '^18.0.0',
              'react-dom': '^18.0.0',
              '@types/react': '^18.0.0',
              '@types/react-dom': '^18.0.0'
            }
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Files: {files.length}</span>
          <span>Template: {template}</span>
          <span>Hot Reload: {isAutoRefresh ? 'On' : 'Off'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          <span>DevFlowHub Preview</span>
        </div>
      </div>
    </div>
  )
}