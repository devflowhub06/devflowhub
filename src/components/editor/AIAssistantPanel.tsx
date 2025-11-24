'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  MessageSquare, 
  Bug, 
  RefreshCw, 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Code,
  FileText,
  Trash2
} from 'lucide-react'
import { clientTrackEvent } from '@/lib/client-analytics'

interface AssistantMessage {
  id: string
  type: 'user' | 'assistant'
  mode: 'explain' | 'debug' | 'refactor' | 'chat'
  content: string
  timestamp: Date
  metadata?: any
}

interface AIAssistantPanelProps {
  isOpen?: boolean
  onClose?: () => void
  selectedCode?: string
  currentFile?: string
  projectContext?: string
  language?: string
  cursorPosition?: { line: number; character: number }
  onApplyChanges?: (payload: { files: any[]; summary?: string; confidence?: number; mode?: string }) => void
  onApplySuggestion?: (suggestion: any) => void
  projectId?: string
}

export default function AIAssistantPanel({
  isOpen = false,
  onClose,
  selectedCode,
  currentFile,
  projectContext,
  language,
  cursorPosition,
  onApplyChanges,
  onApplySuggestion,
  projectId
}: AIAssistantPanelProps) {
  const [activeMode, setActiveMode] = useState<'explain' | 'debug' | 'refactor' | 'chat'>('chat')
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Get storage key for chat history
  const getStorageKey = () => {
    return `ai-assistant-chat-${projectId || 'default'}`
  }

  // Load chat history from localStorage
  const loadChatHistory = useCallback(() => {
    if (typeof window === 'undefined') return
    
    try {
      const storageKey = getStorageKey()
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsedMessages = JSON.parse(saved)
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(messagesWithDates)
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
      // Don't show error to user, just start with empty messages
    }
  }, [projectId])

  // Save chat history to localStorage
  const saveChatHistory = useCallback((messagesToSave: AssistantMessage[]) => {
    if (typeof window === 'undefined') return
    
    try {
      const storageKey = getStorageKey()
      // Only save last 50 messages to avoid localStorage size limits
      const messagesToStore = messagesToSave.slice(-50)
      localStorage.setItem(storageKey, JSON.stringify(messagesToStore))
    } catch (error) {
      console.error('Failed to save chat history:', error)
      // Don't show error to user, just continue
    }
  }, [projectId])

  // Load chat history on mount
  React.useEffect(() => {
    if (isOpen && projectId) {
      loadChatHistory()
    }
  }, [isOpen, projectId, loadChatHistory])

  // Save chat history whenever messages change
  React.useEffect(() => {
    if (messages.length > 0 && projectId) {
      saveChatHistory(messages)
    }
  }, [messages, projectId, saveChatHistory])

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const extractCodeBlock = useCallback((input: string) => {
    if (!input) return ''
    const match = input.match(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)```/)
    if (match && match[1]) {
      return match[1].trim()
    }
    return input.trim()
  }, [])

  const buildFileDiff = useCallback((filePath: string, original: string, updated: string) => {
    const normalizedOriginal = (original ?? '').replace(/\r\n/g, '\n')
    const normalizedUpdated = (updated ?? '').replace(/\r\n/g, '\n')

    const originalLines = normalizedOriginal.split('\n')
    const updatedLines = normalizedUpdated.split('\n')
    const maxLength = Math.max(originalLines.length, updatedLines.length)

    const changes: Array<{ type: 'added' | 'removed' | 'modified'; line: number; content: string }> = []

    for (let i = 0; i < maxLength; i++) {
      const oldLine = originalLines[i]
      const newLine = updatedLines[i]

      if (oldLine === newLine) {
        continue
      }

      if (oldLine !== undefined && newLine === undefined) {
        changes.push({ type: 'removed', line: i + 1, content: oldLine })
      } else if (oldLine === undefined && newLine !== undefined) {
        changes.push({ type: 'added', line: i + 1, content: newLine })
      } else if (oldLine !== newLine) {
        changes.push({ type: 'modified', line: i + 1, content: newLine ?? '' })
      }
    }

    return {
      filePath,
      originalContent: normalizedOriginal,
      newContent: normalizedUpdated,
      changes
    }
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedCode) return

    const trimmedInput = input.trim()

    clientTrackEvent('ai_completion_requested', {
      projectId,
      mode: activeMode,
      hasSelection: Boolean(selectedCode),
      hasMessage: Boolean(trimmedInput)
    })

    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      type: 'user',
      mode: activeMode,
      content: trimmedInput || `Please ${activeMode} this code`,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    // Use streaming for chat mode, regular API for others
    if (activeMode === 'chat' && projectId) {
      await handleStreamingChat(trimmedInput)
    } else {
      await handleRegularRequest(trimmedInput)
    }
  }

  const handleStreamingChat = async (message: string) => {
    setIsStreaming(true)
    setStreamingContent('')
    clientTrackEvent('ai_chat_stream_started', { projectId })

    const streamingMessage: AssistantMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      mode: 'chat',
      content: '',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, streamingMessage])

    try {
      const response = await fetch('/api/editor/ai/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          code: selectedCode || '',
          projectContext,
          language: language || 'javascript',
          projectId
        }),
      })

      if (!response.ok) throw new Error('Streaming failed')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                setIsStreaming(false)
                setStreamingContent('')
                clientTrackEvent('ai_chat_stream_completed', { projectId })
                return
              }
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  setStreamingContent(prev => {
                    const newContent = prev + parsed.content
                    setMessages(prevMessages => {
                      const updated = [...prevMessages]
                      const lastMsg = updated[updated.length - 1]
                      if (lastMsg && lastMsg.type === 'assistant') {
                        lastMsg.content = newContent
                      }
                      return updated
                    })
                    return newContent
                  })
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error)
      setMessages(prev => {
        const updated = [...prev]
        const lastMsg = updated[updated.length - 1]
        if (lastMsg.type === 'assistant') {
          lastMsg.content = error instanceof Error ? error.message : 'Streaming failed'
        }
        return updated
      })
      clientTrackEvent('ai_chat_stream_error', {
        projectId,
        error: error instanceof Error ? error.message : 'unknown'
      })
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
    }
  }

  const handleRegularRequest = async (trimmedInput: string) => {
    setIsLoading(true)

    try {
      const payload = {
        mode: activeMode,
        code: selectedCode || '',
        selectedText: selectedText,
        projectContext: projectContext,
        language: language || 'javascript',
        message: trimmedInput || undefined,
        projectId: projectId
      }

      if (activeMode === 'chat' && !payload.code && currentFile) {
        payload.code = selectedCode || ''
      }

      const response = await fetch('/api/editor/ai/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData?.error || 'AI assistant request failed')
      }

      const data = await response.json()

      let diffPayload: { files: any[]; summary?: string; confidence?: number; mode?: string } | null = null

      if (
        activeMode === 'refactor' &&
        data.response?.refactors?.length &&
        onApplyChanges &&
        currentFile
      ) {
        const refactor = data.response.refactors[0]
        const newCode = extractCodeBlock(refactor.refactoredCode || '')
        const originalSnippet = selectedCode || refactor.originalCode || payload.code || ''

        if (newCode && originalSnippet) {
          diffPayload = {
            files: [
              buildFileDiff(currentFile, originalSnippet, newCode)
            ],
            summary: data.response.summary,
            confidence: data.confidence,
            mode: activeMode
          }
          onApplyChanges(diffPayload)
          clientTrackEvent('ai_diff_generated', {
            projectId,
            mode: activeMode,
            files: diffPayload.files.length
          })
        }
      }

      const assistantMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        mode: activeMode,
        content: formatAssistantResponse(data.response, activeMode),
        timestamp: new Date(),
        metadata: data.response
      }

      setMessages(prev => [...prev, assistantMessage])

      // Update context files if available in response
      if (data.response?.metadata?.contextFiles && onApplyChanges) {
        onApplyChanges({
          files: [],
          summary: '',
          metadata: {
            contextFiles: data.response.metadata.contextFiles,
            query: data.response.metadata.query || ''
          }
        })
      }
      clientTrackEvent('ai_completion_succeeded', {
        projectId,
        mode: activeMode,
        hasDiff: Boolean(diffPayload)
      })
    } catch (error) {
      console.error('Assistant error:', error)
      const errorMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        mode: activeMode,
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      clientTrackEvent('ai_completion_failed', {
        projectId,
        mode: activeMode,
        error: error instanceof Error ? error.message : 'unknown'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatAssistantResponse = (response: any, mode: string): string => {
    switch (mode) {
      case 'explain':
        return `**Explanation:**\n${response.summary}\n\n**Details:**\n${response.explanations?.[0]?.details?.join('\n• ') || 'No details available'}`
      case 'debug':
        return `**Debug Analysis:**\n${response.summary}\n\n**Issues Found:**\n${response.issues?.map((issue: any) => `• Line ${issue.line}: ${issue.message}`).join('\n') || 'No issues found'}`
      case 'refactor':
        return `**Refactoring Suggestions:**\n${response.summary}\n\n**Options:**\n${response.refactors?.map((refactor: any) => `• ${refactor.name}: ${refactor.description}`).join('\n') || 'No suggestions available'}`
      case 'chat':
        return response.message || response.summary || 'Response received'
      default:
        return response?.summary || 'Response received'
    }
  }

  const handleModeChange = (mode: 'explain' | 'debug' | 'refactor' | 'chat') => {
    setActiveMode(mode)
    if (selectedCode && mode !== 'chat') {
      setInput(`Please ${mode} this code`)
    } else if (mode === 'chat') {
      setInput('')
    }
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'explain': return <Lightbulb className="h-4 w-4" />
      case 'debug': return <Bug className="h-4 w-4" />
      case 'refactor': return <RefreshCw className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'explain': return 'text-yellow-500'
      case 'debug': return 'text-red-500'
      case 'refactor': return 'text-blue-500'
      default: return 'text-green-500'
    }
  }

  // Clear chat history
  const clearChatHistory = () => {
    if (typeof window === 'undefined') return
    
    try {
      const storageKey = getStorageKey()
      localStorage.removeItem(storageKey)
      setMessages([])
      clientTrackEvent('ai_chat_history_cleared', { projectId })
    } catch (error) {
      console.error('Failed to clear chat history:', error)
    }
  }

  // Don't render if not open
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed top-0 right-0 h-full w-96 flex flex-col bg-slate-900 border-l border-slate-700 z-50">
      {/* Enhanced Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-warn/20 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-accent-warn" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-slate-400">Your intelligent coding partner</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChatHistory}
                className="h-6 w-6 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                title="Clear chat history"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-white/10"
              >
                ×
              </Button>
            )}
          </div>
        </div>
        
        {/* Enhanced Mode Tabs */}
        <Tabs value={activeMode} onValueChange={handleModeChange}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
            <TabsTrigger 
              value="chat" 
              className="text-xs data-[state=active]:bg-accent-warn/20 data-[state=active]:text-accent-warn data-[state=active]:border-accent-warn/30"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="explain"
              className="text-xs data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400 data-[state=active]:border-yellow-500/30"
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Explain
            </TabsTrigger>
            <TabsTrigger 
              value="debug"
              className="text-xs data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:border-red-500/30"
            >
              <Bug className="h-3 w-3 mr-1" />
              Debug
            </TabsTrigger>
            <TabsTrigger 
              value="refactor"
              className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:border-blue-500/30"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refactor
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Selected Code Info */}
      {selectedCode && (
        <div className="p-3 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <FileText className="h-3 w-3" />
            <span>Code selected from {currentFile}</span>
            <Badge variant="outline" className="text-xs">
              {selectedCode.length} chars
            </Badge>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 py-12 px-4">
              <div className="w-16 h-16 bg-accent-warn/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-accent-warn opacity-80" />
              </div>
              <h4 className="text-base font-semibold text-white mb-2">Welcome to DevFlowHub AI Assistant</h4>
              <p className="text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                Your intelligent coding partner with <span className="text-accent-warn font-semibold">deep codebase understanding</span> - equivalent to Cursor's AI. I understand your entire project, not just single files.
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto text-xs">
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <Lightbulb className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                  <p className="text-slate-300">Explain code</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <Bug className="h-4 w-4 text-red-400 mx-auto mb-1" />
                  <p className="text-slate-300">Debug issues</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <RefreshCw className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-slate-300">Refactor code</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <MessageSquare className="h-4 w-4 text-green-400 mx-auto mb-1" />
                  <p className="text-slate-300">Ask questions</p>
                </div>
              </div>
              <div className="mt-6 p-3 bg-accent-warn/10 border border-accent-warn/20 rounded-lg">
                <p className="text-xs text-accent-warn font-medium mb-1">✨ Codebase-Wide AI</p>
                <p className="text-xs text-slate-400">I understand your entire project, can reference any file, and reason across multiple files.</p>
              </div>
              <p className="text-xs mt-4 text-slate-500">Select code and choose a mode to get started</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getModeIcon(message.mode)}
                  <span className={`text-xs font-medium ${getModeColor(message.mode)}`}>
                    {message.mode.charAt(0).toUpperCase() + message.mode.slice(1)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          
          {(isLoading || isStreaming) && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">{isStreaming ? 'AI is typing...' : 'AI is thinking...'}</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask AI to ${activeMode} your code...`}
            className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-slate-400 resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={(isLoading || isStreaming) || (!input.trim() && !selectedCode)}
            className="bg-accent-warn hover:bg-orange-600 text-white font-semibold shadow-lg shadow-accent-warn/20"
          >
            {(isLoading || isStreaming) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}