'use client'

import React, { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react').then(mod => ({ default: mod.Editor })), {
  ssr: false,
  loading: () => <div className="h-96 bg-slate-900 flex items-center justify-center text-slate-400">Loading Editor...</div>
})
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Play, 
  RefreshCw, 
  GitBranch, 
  GitCommit, 
  GitPullRequest,
  Eye,
  Zap,
  Code,
  TestTube,
  Settings,
  Maximize2,
  Minimize2,
  X,
  Plus,
  Search,
  FileText,
  Terminal,
  Bot
} from 'lucide-react'
import { AssistantLightbulb } from './AssistantLightbulb'
import { CommandPalette } from './CommandPalette'

interface MonacoEditorWrapperProps {
  projectId: string
  filePath: string
  content: string
  language: string
  onContentChange: (content: string) => void
  onSave: () => void
  onRun: () => void
  onGitAction: (action: string) => void
  onAIAction: (action: string, data?: any) => void
  isDirty: boolean
  gitStatus: string
  lastSaved?: string
}

export function MonacoEditorWrapper({
  projectId,
  filePath = '',
  content = '',
  language = 'text',
  onContentChange,
  onSave,
  onRun,
  onGitAction,
  onAIAction,
  isDirty = false,
  gitStatus = 'clean',
  lastSaved
}: MonacoEditorWrapperProps) {
  const editorRef = useRef<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [showAssistant, setShowAssistant] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'p':
            e.preventDefault()
            setShowCommandPalette(true)
            break
          case 's':
            e.preventDefault()
            onSave()
            break
          case 'Enter':
            e.preventDefault()
            onRun()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSave, onRun])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      lineHeight: 1.5,
      cursorBlinking: 'blink',
      cursorStyle: 'line',
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      minimap: { enabled: true },
      wordWrap: 'on',
      lineNumbers: 'on',
      renderLineHighlight: 'line',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      }
    })

    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
      setShowCommandPalette(true)
    })

    // Add AI Assistant keybinding
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      const position = editor.getPosition()
      const selection = editor.getSelection()
      if (position && onAIAction) {
        const selectedText = selection ? editor.getModel()?.getValueInRange(selection) : ''
        onAIAction('suggest', { 
          position, 
          selection,
          code: selectedText || editor.getValue() || ''
        })
      }
    })

    // Register AI Code Action Provider
    const disposable = monaco.languages.registerCodeActionProvider(getLanguageFromPath(filePath), {
      provideCodeActions: (model, range, context, token) => {
        const selectedCode = model.getValueInRange(range)
        
        return {
          actions: [
            {
              title: '🤖 AI: Refactor this code',
              kind: 'quickfix',
              run: async () => {
                try {
                  const { OpenAIService } = await import('@/lib/ai/openai-service')
                  const suggestion = await OpenAIService.generateCodeSuggestion(
                    selectedCode || model.getValue(),
                    filePath,
                    'refactor',
                    'Code refactoring via Monaco Editor'
                  )
                  onAIAction?.('refactor', suggestion)
                } catch (error) {
                  console.error('AI refactor error:', error)
                }
              }
            },
            {
              title: '🤖 AI: Optimize performance',
              kind: 'quickfix',
              run: () => onAIAction?.('optimize', { 
                range, 
                code: selectedCode,
                filePath,
                context: 'Performance optimization'
              })
            },
            {
              title: '🤖 AI: Generate unit tests',
              kind: 'quickfix',
              run: () => onAIAction?.('test', { 
                range, 
                code: selectedCode,
                filePath,
                context: 'Unit test generation'
              })
            },
            {
              title: '🤖 AI: Explain this code',
              kind: 'quickfix',
              run: () => onAIAction?.('explain', { 
                range, 
                code: selectedCode,
                filePath,
                context: 'Code explanation'
              })
            },
            {
              title: '🤖 AI: Fix potential issues',
              kind: 'quickfix',
              run: () => onAIAction?.('fix', { 
                range, 
                code: selectedCode,
                filePath,
                context: 'Bug fix suggestions'
              })
            }
          ],
          dispose: () => {}
        }
      }
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun()
    })

    // Handle selection changes
    editor.onDidChangeCursorSelection((e: any) => {
      const selection = editor.getSelection()
      if (selection) {
        setCursorPosition({
          line: selection.startLineNumber,
          column: selection.startColumn
        })
        
        const selectedText = editor.getModel()?.getValueInRange(selection) || ''
        setSelectedText(selectedText)
        setShowAssistant(selectedText.length > 0)
      }
    })

    // Handle content changes
    editor.onDidChangeModelContent(() => {
      const newContent = editor.getValue()
      onContentChange(newContent)
    })
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onContentChange(value)
    }
  }

  const handleCommand = (command: string, args?: any) => {
    switch (command) {
      case 'file:save':
        onSave()
        break
      case 'project:run':
        onRun()
        break
      case 'git:commit':
        onGitAction('commit')
        break
      case 'git:branch':
        onGitAction('branch')
        break
      case 'git:pr':
        onGitAction('pr')
        break
      case 'ai:suggest':
        onAIAction('suggest')
        break
      case 'ai:refactor':
        onAIAction('refactor')
        break
      case 'ai:test':
        onAIAction('test')
        break
      case 'ai:explain':
        onAIAction('explain')
        break
      default:
        console.log('Unknown command:', command, args)
    }
    setShowCommandPalette(false)
  }

  const handleSuggestion = (suggestion: any) => {
    onAIAction('apply', suggestion)
  }

  const handlePreview = (suggestion: any) => {
    onAIAction('preview', suggestion)
  }

  const getLanguageFromPath = (path: string): string => {
    if (!path || typeof path !== 'string') return 'text'
    const ext = path.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'fish': 'bash'
    }
    return languageMap[ext || ''] || 'text'
  }

  const formatFileSize = (content: string) => {
    const bytes = new Blob([content]).size
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getGitStatusColor = (status: string) => {
    switch (status) {
      case 'clean': return 'text-green-400'
      case 'modified': return 'text-yellow-400'
      case 'staged': return 'text-blue-400'
      case 'untracked': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  return (
    <div className={`h-full flex flex-col bg-slate-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-400" />
            <span className="text-white font-medium">{filePath}</span>
            <Badge variant="outline" className="text-xs">
              {getLanguageFromPath(filePath)}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={`text-xs ${getGitStatusColor(gitStatus)}`}>
              Git: {gitStatus}
            </Badge>
            {isDirty && (
              <Badge variant="outline" className="text-xs text-yellow-400">
                Modified
              </Badge>
            )}
            <span className="text-xs text-slate-400">
              {formatFileSize(content)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onSave}
            className="h-8 px-3"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRun}
            className="h-8 px-3"
          >
            <Play className="h-3 w-3 mr-1" />
            Run
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowCommandPalette(true)}
            className="h-8 px-3"
          >
            <Search className="h-3 w-3 mr-1" />
            Cmd+P
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={getLanguageFromPath(filePath)}
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
            minimap: { enabled: true },
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true
            }
          }}
        />
        
        {/* AI Assistant Lightbulb */}
        {showAssistant && selectedText && (
          <AssistantLightbulb
            position={cursorPosition}
            onSuggestion={handleSuggestion}
            onPreview={handlePreview}
            projectId={projectId}
            filePath={filePath}
            selectedCode={selectedText}
            isVisible={showAssistant}
          />
        )}
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between p-2 border-t border-slate-700 bg-slate-800 text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span>Line {cursorPosition.line}, Column {cursorPosition.column}</span>
          <span>{content.split('\n').length} lines</span>
          {lastSaved && (
            <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onGitAction('status')}
            className="h-6 px-2"
          >
            <GitBranch className="h-3 w-3 mr-1" />
            Git
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAIAction('suggest')}
            className="h-6 px-2"
          >
            <Bot className="h-3 w-3 mr-1" />
            AI
          </Button>
        </div>
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onCommand={handleCommand}
          projectId={projectId}
        />
      )}
    </div>
  )
}