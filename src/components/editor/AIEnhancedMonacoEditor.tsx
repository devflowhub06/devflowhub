'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAIAutocomplete } from '@/hooks/useAIAutocomplete'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  MessageCircle, 
  Play, 
  Square, 
  RefreshCw,
  Settings,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(mod => ({ default: mod.Editor })), {
  ssr: false,
  loading: () => <div className="h-96 bg-slate-900 flex items-center justify-center text-slate-400">Loading Editor...</div>
})

interface AIEnhancedMonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  projectContext?: string
  onAIAssistantClick?: () => void
  onRunTestsClick?: () => void
  onRefreshPreviewClick?: () => void
  className?: string
}

export default function AIEnhancedMonacoEditor({
  value,
  onChange,
  language = 'javascript',
  projectContext,
  onAIAssistantClick,
  onRunTestsClick,
  onRefreshPreviewClick,
  className = ''
}: AIEnhancedMonacoEditorProps) {
  const [isAIAutocompleteEnabled, setIsAIAutocompleteEnabled] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [editorMounted, setEditorMounted] = useState(false)

  const { suggestion, isLoading, getSuggestion, clearSuggestion } = useAIAutocomplete({
    enabled: isAIAutocompleteEnabled,
    projectContext
  })

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    setEditorMounted(true)
    
    // Configure AI autocomplete
    editor.onDidChangeModelContent(() => {
      const position = editor.getPosition()
      if (position && isAIAutocompleteEnabled) {
        getSuggestion(value, position, language)
      }
    })

    // Handle AI suggestions
    editor.addCommand(monaco.KeyCode.Tab, () => {
      if (suggestion && !isLoading) {
        const position = editor.getPosition()
        const range = new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        )
        editor.executeEdits('ai-suggestion', [{
          range,
          text: suggestion.suggestion,
          forceMoveMarkers: true
        }])
        clearSuggestion()
      }
    })

    // Configure editor options
    editor.updateOptions({
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showCustomcolors: true,
        showFolders: true,
        showTypeParameters: true,
        showIssues: true,
        showUsers: true,
        showWords: true,
        showText: true,
        showKeywords: true,
        showSnippets: true
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: 'off'
    })
  }, [isAIAutocompleteEnabled, suggestion, isLoading, getSuggestion, clearSuggestion, value, language])

  const handleRunTests = useCallback(async () => {
    setIsRunning(true)
    try {
      if (onRunTestsClick) {
        await onRunTestsClick()
      }
    } finally {
      setIsRunning(false)
    }
  }, [onRunTestsClick])

  const handleRefreshPreview = useCallback(async () => {
    try {
      if (onRefreshPreviewClick) {
        await onRefreshPreviewClick()
      }
    } catch (error) {
      console.error('Error refreshing preview:', error)
    }
  }, [onRefreshPreviewClick])

  return (
    <div className={`flex flex-col h-full bg-slate-900 ${className}`}>
      {/* AI Feature Buttons */}
      <div className="flex items-center gap-2 p-3 bg-slate-800 border-b border-slate-700">
        <Button
          variant={isAIAutocompleteEnabled ? "default" : "outline"}
          size="sm"
          onClick={() => setIsAIAutocompleteEnabled(!isAIAutocompleteEnabled)}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          AI Autocomplete
          {isAIAutocompleteEnabled && (
            <Badge variant="secondary" className="ml-1">
              ON
            </Badge>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onAIAssistantClick}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          AI Assistant
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRunTests}
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <Square className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Run Tests
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshPreview}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Preview
        </Button>

        {/* Enhanced AI Status Indicators */}
        <div className="flex items-center gap-3 ml-auto">
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-warn/10 border border-accent-warn/20 rounded-lg">
              <Zap className="h-3.5 w-3.5 text-accent-warn animate-pulse" />
              <span className="text-xs font-medium text-accent-warn">AI Analyzing...</span>
            </div>
          )}
          
          {suggestion && !isLoading && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs font-medium text-green-400">Suggestion Ready</span>
            </div>
          )}
          
          {!isLoading && !suggestion && isAIAutocompleteEnabled && (
            <div className="flex items-center gap-1 px-2 text-slate-500">
              <Brain className="h-3 w-3" />
              <span className="text-xs">AI Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 relative">
        <MonacoEditor
          height="100%"
          language={language}
          value={value}
          onChange={(newValue) => onChange(newValue || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineHeight: 20,
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            cursorStyle: 'line',
            cursorBlinking: 'blink',
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            contextmenu: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            cursorSmoothCaretAnimation: true,
            renderWhitespace: 'selection',
            renderControlCharacters: false,
            fontLigatures: true,
            bracketPairColorization: {
              enabled: true
            },
            guides: {
              bracketPairs: true,
              indentation: true
            }
          }}
        />

        {/* Enhanced AI Suggestion Overlay */}
        {suggestion && !isLoading && (
          <div className="absolute bottom-4 right-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-accent-warn/30 rounded-xl p-4 shadow-2xl max-w-md z-50 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-accent-warn/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="h-4 w-4 text-accent-warn animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-white">AI Suggestion</p>
                  <Badge variant="outline" className="text-xs bg-accent-warn/10 border-accent-warn/30 text-accent-warn">
                    {Math.round((suggestion.confidence || 0) * 100)}% confidence
                  </Badge>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 mb-2 border border-slate-700">
                  <code className="text-xs text-slate-300 font-mono break-words">{suggestion.suggestion}</code>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Zap className="h-3 w-3 text-accent-warn" />
                    <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs font-mono">Tab</kbd> to accept</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSuggestion}
                    className="h-6 px-2 text-xs text-slate-400 hover:text-white"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Thinking Indicator */}
        {isLoading && (
          <div className="absolute bottom-4 right-4 bg-slate-800/95 border border-slate-700 rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 z-50">
            <Zap className="h-4 w-4 text-accent-warn animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">AI is thinking...</span>
          </div>
        )}
      </div>
    </div>
  )
}