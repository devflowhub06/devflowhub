'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Sandpack } from '@codesandbox/sandpack-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmergencyPreview } from './EmergencyPreview'
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
  Settings,
  Wifi,
  WifiOff,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  RotateCcw,
  Globe,
  Smartphone,
  Tablet,
  Laptop,
  AlertTriangle
} from 'lucide-react'

interface AdvancedLivePreviewProps {
  files: Array<{
    path: string
    content: string
  }>
  template?: 'react' | 'vanilla' | 'vue' | 'angular' | 'nextjs' | 'vite' | 'svelte'
  onRefresh?: () => void
  isAutoRefresh?: boolean
  onStatusChange?: (status: { status: string; message: string; progress?: number }) => void
}

type PreviewMode = 'sandpack' | 'iframe' | 'static' | 'devserver' | 'emergency'
type DeviceSize = 'mobile' | 'tablet' | 'desktop'

export function AdvancedLivePreview({ 
  files, 
  template = 'react',
  onRefresh,
  isAutoRefresh = true,
  onStatusChange
}: AdvancedLivePreviewProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [lastFilesHash, setLastFilesHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'building' | 'ready' | 'error'>('idle')
  const [showCode, setShowCode] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('sandpack')
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [bundleUrl, setBundleUrl] = useState('https://bundler.ecmascript.org/')
  const [fallbackUrls] = useState([
    'https://bundler.ecmascript.org/',
    'https://sandpack-bundler.pages.dev/',
    'https://sandpack-bundler-ecmascript.vercel.app/'
  ])
  
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Enhanced file hash generation
  const generateFilesHash = useCallback((files: Array<{ path: string; content: string }>) => {
    return files.map(f => `${f.path}:${f.content.length}:${f.content.slice(0, 100)}`).join('|')
  }, [])

  // Connection health check
  const checkConnection = useCallback(async () => {
    setConnectionStatus('connecting')
    
    try {
      const response = await fetch(`${bundleUrl}ping`, { 
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      })
      
      setConnectionStatus('connected')
      setError(null)
      return true
    } catch (err) {
      console.warn('Primary bundler failed, trying fallback...', err)
      
      // Try fallback URLs
      for (const fallbackUrl of fallbackUrls) {
        if (fallbackUrl === bundleUrl) continue
        
        try {
          await fetch(`${fallbackUrl}ping`, { 
            method: 'HEAD',
            mode: 'no-cors',
            signal: AbortSignal.timeout(3000)
          })
          
          setBundleUrl(fallbackUrl)
          setConnectionStatus('connected')
          setError(null)
          return true
        } catch (fallbackErr) {
          console.warn(`Fallback bundler ${fallbackUrl} failed:`, fallbackErr)
        }
      }
      
      setConnectionStatus('disconnected')
      setError('All bundlers unavailable. Switching to emergency preview mode.')
      setPreviewMode('emergency')
      return false
    }
  }, [bundleUrl, fallbackUrls])

  // Enhanced auto-refresh with connection check
  useEffect(() => {
    if (!isAutoRefresh) return

    const currentHash = generateFilesHash(files)
    if (currentHash !== lastFilesHash && lastFilesHash !== '') {
      setIsLoading(true)
      setPreviewStatus('building')
      onStatusChange?.({ status: 'building', message: 'Files changed, rebuilding preview...', progress: 50 })
      
      // Check connection before refresh
      checkConnection().then((connected) => {
        if (connected || previewMode === 'static') {
          const timeoutId = setTimeout(() => {
            setPreviewKey(prev => prev + 1)
            setIsLoading(false)
            setPreviewStatus('ready')
            onStatusChange?.({ status: 'ready', message: 'Preview updated successfully', progress: 100 })
            onRefresh?.()
          }, 500)
          
          timeoutRef.current = timeoutId
        } else {
          setIsLoading(false)
          setPreviewStatus('error')
          onStatusChange?.({ status: 'error', message: 'Connection failed, using fallback', progress: 0 })
        }
      })

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }
    
    setLastFilesHash(currentHash)
  }, [files, lastFilesHash, generateFilesHash, isAutoRefresh, onRefresh, onStatusChange, checkConnection, previewMode])

  // Initial connection check
  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [checkConnection])

  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    setPreviewStatus('building')
    setRetryCount(prev => prev + 1)
    onStatusChange?.({ status: 'building', message: 'Manually refreshing preview...', progress: 30 })
    
    const connected = await checkConnection()
    
    setTimeout(() => {
      setPreviewKey(prev => prev + 1)
      setIsLoading(false)
      setPreviewStatus(connected ? 'ready' : 'error')
      onStatusChange?.({ 
        status: connected ? 'ready' : 'error', 
        message: connected ? 'Preview refreshed successfully' : 'Using fallback mode', 
        progress: 100 
      })
      onRefresh?.()
    }, 300)
  }, [onRefresh, onStatusChange, checkConnection])

  const handleRun = useCallback(async () => {
    setIsRunning(true)
    setPreviewStatus('building')
    onStatusChange?.({ status: 'building', message: 'Starting preview...', progress: 20 })
    
    const connected = await checkConnection()
    
    setTimeout(() => {
      setIsRunning(false)
      setPreviewStatus(connected ? 'ready' : 'error')
      onStatusChange?.({ 
        status: connected ? 'ready' : 'error', 
        message: connected ? 'Preview is running' : 'Running in fallback mode', 
        progress: 100 
      })
    }, 2000)
  }, [onStatusChange, checkConnection])

  // Convert files to proper format
  const sandpackFiles = files.reduce((acc, file) => {
    acc[file.path] = file.content
    return acc
  }, {} as Record<string, string>)

  // Enhanced file setup with better defaults
  const setupFiles = useCallback(() => {
    const setup: Record<string, string> = { ...sandpackFiles }

    if (template === 'react') {
      if (!setup['/App.js'] && !setup['/App.tsx'] && !setup['/App.jsx']) {
        setup['/App.js'] = `import React, { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState('Ready')

  useEffect(() => {
    setStatus('Hot Reload Active')
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 DevFlowHub Live Preview</h1>
        <p>Real-time development environment</p>
        
        <div className="demo-section">
          <h2>Interactive Demo</h2>
          <p>Count: {count}</p>
          <button onClick={() => setCount(count + 1)}>
            Increment
          </button>
          <button onClick={() => setCount(0)}>
            Reset
          </button>
        </div>
        
        <div className="status-section">
          <h3>System Status</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Preview:</span>
              <span className="status-value ready">${previewStatus}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Files:</span>
              <span className="status-value">${files.length}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Hot Reload:</span>
              <span className="status-value active">Enabled</span>
            </div>
            <div className="status-item">
              <span className="status-label">Connection:</span>
              <span className="status-value ${connectionStatus}">${connectionStatus}</span>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}`

        setup['/App.css'] = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  text-align: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.app-header {
  padding: 60px 20px;
  max-width: 800px;
  margin: 0 auto;
}

.app-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.app-header p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.demo-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 15px;
  margin: 2rem 0;
  backdrop-filter: blur(10px);
}

.demo-section h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.demo-section p {
  font-size: 1.5rem;
  margin: 1rem 0;
  font-weight: bold;
}

.demo-section button {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 24px;
  margin: 0 8px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.demo-section button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.status-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 15px;
  margin-top: 2rem;
  backdrop-filter: blur(10px);
}

.status-section h3 {
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.status-label {
  font-weight: 500;
}

.status-value {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
}

.status-value.ready {
  background: rgba(34, 197, 94, 0.3);
  color: #10b981;
}

.status-value.active {
  background: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.status-value.connected {
  background: rgba(34, 197, 94, 0.3);
  color: #10b981;
}

.status-value.disconnected {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}
`
      }

      if (!setup['/index.js']) {
        setup['/index.js'] = `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(<App />)`
      }

      if (!setup['/public/index.html']) {
        setup['/public/index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevFlowHub Live Preview</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>">
</head>
<body>
  <div id="root"></div>
</body>
</html>`
      }
    }

    return setup
  }, [sandpackFiles, template, previewStatus, files.length, connectionStatus])

  const finalFiles = setupFiles()

  // Static HTML fallback
  const generateStaticHTML = useCallback(() => {
    const mainFile = finalFiles['/App.js'] || finalFiles['/App.tsx'] || finalFiles['/App.jsx'] || finalFiles['/index.html']
    
    if (template === 'react' && mainFile) {
      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevFlowHub Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; }
    .fallback-notice { 
      background: #fef3c7; 
      border: 1px solid #f59e0b; 
      padding: 1rem; 
      margin: 1rem; 
      border-radius: 8px; 
      text-align: center; 
    }
  </style>
</head>
<body>
  <div class="fallback-notice">
    <h3>🔄 Fallback Preview Mode</h3>
    <p>Live bundler is unavailable. This is a static preview.</p>
    <p>Files: ${files.length} | Status: ${previewStatus} | Connection: ${connectionStatus}</p>
  </div>
  <div id="root"></div>
  <script type="text/babel">
    ${mainFile.replace('export default', 'const App =')}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
</body>
</html>`
    }
    
    return mainFile || '<h1>No preview available</h1>'
  }, [finalFiles, template, files.length, previewStatus, connectionStatus])

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

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'connecting':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      default:
        return <WifiOff className="h-4 w-4 text-red-500" />
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

  const getDeviceStyles = () => {
    switch (deviceSize) {
      case 'mobile':
        return { width: '375px', height: '667px', margin: '0 auto' }
      case 'tablet':
        return { width: '768px', height: '1024px', margin: '0 auto' }
      default:
        return { width: '100%', height: '100%' }
    }
  }

  const renderPreviewContent = () => {
    if (previewMode === 'emergency') {
      return <EmergencyPreview files={files} onStatusChange={onStatusChange} />
    }

    if (previewMode === 'static') {
      return (
        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Static Preview Mode</h3>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Fallback Active
                </Badge>
              </div>
              <div 
                className="border rounded-lg overflow-auto bg-white"
                style={getDeviceStyles()}
                dangerouslySetInnerHTML={{ __html: generateStaticHTML() }}
              />
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="flex-1 overflow-hidden">
        <Sandpack
          key={`${previewKey}-${bundleUrl}`}
          template={template}
          files={finalFiles}
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
            bundlerURL: bundleUrl,
            bundlerTimeout: 15000,
            logLevel: 'error'
          }}
          theme="light"
          customSetup={{
            dependencies: {
              'react': '^18.2.0',
              'react-dom': '^18.2.0',
              '@types/react': '^18.2.0',
              '@types/react-dom': '^18.2.0'
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className={`h-full flex flex-col bg-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-gray-900">Advanced Live Preview</span>
            <Badge variant="outline" className={getStatusColor()}>
              {previewStatus}
            </Badge>
            {getConnectionIcon()}
            <Badge variant="outline" className="text-xs">
              {connectionStatus}
            </Badge>
          </div>
          
          {isAutoRefresh && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              <Zap className="h-3 w-3 mr-1" />
              Auto Refresh
            </Badge>
          )}

          {previewMode === 'static' && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
              <RotateCcw className="h-3 w-3 mr-1" />
              Fallback Mode
            </Badge>
          )}

          {previewMode === 'emergency' && (
            <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Emergency Mode
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Device Size Controls */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={deviceSize === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceSize('mobile')}
              className="h-8 w-8 p-0"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceSize === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceSize('tablet')}
              className="h-8 w-8 p-0"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceSize === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceSize('desktop')}
              className="h-8 w-8 p-0"
            >
              <Laptop className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview Mode Toggle */}
          <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as PreviewMode)}>
            <TabsList className="grid w-auto grid-cols-3">
              <TabsTrigger value="sandpack" className="text-xs">Live</TabsTrigger>
              <TabsTrigger value="static" className="text-xs">Static</TabsTrigger>
              <TabsTrigger value="emergency" className="text-xs">Emergency</TabsTrigger>
            </TabsList>
          </Tabs>

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
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-3">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null)
                setRetryCount(0)
                checkConnection()
              }}
              className="ml-auto text-xs"
            >
              Retry ({retryCount})
            </Button>
          </div>
        </div>
      )}

      {/* Preview Content */}
      {renderPreviewContent()}

      {/* Enhanced Status Bar */}
      <div className="flex items-center justify-between p-2 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Files: {files.length}</span>
          <span>Template: {template}</span>
          <span>Mode: {previewMode}</span>
          <span>Device: {deviceSize}</span>
          <span>Hot Reload: {isAutoRefresh ? 'On' : 'Off'}</span>
          <span>Bundler: {bundleUrl.includes('ecmascript') ? 'Primary' : 'Fallback'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          <span>DevFlowHub Advanced Preview</span>
        </div>
      </div>
    </div>
  )
}
