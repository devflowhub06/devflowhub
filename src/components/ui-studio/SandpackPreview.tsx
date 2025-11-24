'use client'

import React, { useState } from 'react'
import { Sandpack } from '@codesandbox/sandpack-react'
import { Button } from '@/components/ui/button'
import { Play, Square, Maximize2, Minimize2, RefreshCw } from 'lucide-react'

interface Component {
  name: string
  code: string
  description?: string
}

interface SandpackPreviewProps {
  component?: Component
  className?: string
}

const defaultComponent: Component = {
  name: 'ExampleComponent',
  code: `import React from 'react'

export default function ExampleComponent() {
  return (
    <div className="p-4 bg-blue-500 text-white rounded-lg">
      <h2 className="text-xl font-bold">Hello World!</h2>
      <p>This is an example component.</p>
    </div>
  )
}`,
  description: 'A simple example component'
}

export default function SandpackPreview({ component, className = '' }: SandpackPreviewProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentComponent = component || defaultComponent

  const files = {
    '/App.js': {
      code: `import React from 'react'
import ${currentComponent.name} from './${currentComponent.name}.jsx'

export default function App() {
  return (
    <div className="App">
      <${currentComponent.name} />
    </div>
  )
}`
    },
    [`/${currentComponent.name}.jsx`]: {
      code: currentComponent.code || '// Component code will be generated here'
    }
  }

  const handleRun = () => {
    setIsRunning(true)
    setError(null)
  }

  const handleStop = () => {
    setIsRunning(false)
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleRefresh = () => {
    setIsRunning(false)
    setError(null)
    // Force refresh by updating a dummy state
    setTimeout(() => setIsRunning(true), 100)
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
            <h3 className="text-lg font-semibold">Preview - {currentComponent.name}</h3>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleFullscreen}
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <Sandpack
              template="react"
              files={files}
              options={{
                showNavigator: false,
                showRefreshButton: false,
                showInlineErrors: true,
                showConsole: false,
                showConsoleButton: false,
                showTabs: false,
                showLineNumbers: false,
                wrapContent: true,
                editorHeight: '100%',
                editorWidthPercentage: 0,
                showReadOnly: false,
                initMode: 'lazy',
                bundlerURL: 'https://bundler.ecmascript.sh/'
              }}
              theme="dark"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-slate-900 rounded-lg border border-slate-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-slate-200">Live Preview</h3>
          <span className="text-xs text-slate-400">({currentComponent.name})</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={isRunning ? handleStop : handleRun}
            className={`text-xs px-2 py-1 h-6 ${
              isRunning 
                ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30' 
                : 'bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30'
            }`}
          >
            {isRunning ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span className="ml-1">{isRunning ? 'Stop' : 'Run'}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="text-xs px-2 py-1 h-6 text-slate-400 border-slate-600 hover:bg-slate-700"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleFullscreen}
            className="text-xs px-2 py-1 h-6 text-slate-400 border-slate-600 hover:bg-slate-700"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="h-96">
        {isRunning ? (
          <Sandpack
            template="react"
            files={files}
            options={{
              showNavigator: false,
              showRefreshButton: false,
              showInlineErrors: true,
              showConsole: false,
              showConsoleButton: false,
              showTabs: false,
              showLineNumbers: false,
              wrapContent: true,
              editorHeight: 0,
              editorWidthPercentage: 0,
              showReadOnly: false,
              initMode: 'lazy',
              bundlerURL: 'https://bundler.ecmascript.sh/'
            }}
            theme="dark"
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-slate-800">
            <div className="text-center">
              <Play className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Click Run to preview component</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-900/20 border-t border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}