'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Brain, 
  Send, 
  Loader2, 
  Code, 
  Palette, 
  Play, 
  Rocket, 
  GitBranch,
  Settings,
  MessageSquare,
  Zap,
  History,
  Copy as CopyIcon,
  Check
} from 'lucide-react'

interface AIMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  context?: {
    projectId?: string
    tool?: string
    action?: string
  }
}

interface ProjectContext {
  id: string
  name: string
  language: string
  framework: string
  files: Array<{
    name: string
    path: string
    content: string
  }>
  status: string
  lastModified: string
}

interface ConversationalAIProps {
  isOpen: boolean
  onClose: () => void
  projectContext?: ProjectContext
  onNavigateToTool?: (tool: string, projectId: string) => void
}

const quickActions = [
  {
    id: 'add-auth',
    label: 'Add Authentication',
    description: 'Add user authentication to my project',
    icon: Settings,
    tool: 'editor'
  },
  {
    id: 'create-component',
    label: 'Create Component',
    description: 'Create a new React component',
    icon: Code,
    tool: 'ui-studio'
  },
  {
    id: 'run-tests',
    label: 'Run Tests',
    description: 'Run tests in sandbox',
    icon: Play,
    tool: 'sandbox'
  },
  {
    id: 'deploy-app',
    label: 'Deploy App',
    description: 'Deploy to production',
    icon: Rocket,
    tool: 'deployer'
  },
  {
    id: 'git-commit',
    label: 'Git Commit',
    description: 'Commit changes to git',
    icon: GitBranch,
    tool: 'git'
  }
]

export function ConversationalAI({ 
  isOpen, 
  onClose, 
  projectContext, 
  onNavigateToTool 
}: ConversationalAIProps) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<AIMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // --- Small internal components/helpers for nicer rendering ---
  function CodeBlock({ code, language }: { code: string; language?: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      } catch {}
    }

    return (
      <div className="relative group border rounded-md bg-slate-950/95 text-slate-100 overflow-x-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs text-slate-300">
          <span className="uppercase tracking-wide opacity-70">{language || 'code'}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-slate-800"
            aria-label="Copy code"
          >
            {copied ? <Check className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
            <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="text-[12px] leading-relaxed p-3 font-mono whitespace-pre">{code}</pre>
      </div>
    )
  }

  type Segment =
    | { kind: 'text'; text: string }
    | { kind: 'code'; code: string; lang?: string }

  function splitMarkdownBlocks(content: string): Segment[] {
    const segments: Segment[] = []
    const fence = /```(\w+)?\n([\s\S]*?)```/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = fence.exec(content)) !== null) {
      const before = content.slice(lastIndex, match.index)
      if (before.trim().length > 0) {
        segments.push({ kind: 'text', text: before })
      }
      segments.push({ kind: 'code', code: match[2].replace(/\n$/, ''), lang: match[1] || undefined })
      lastIndex = fence.lastIndex
    }
    const tail = content.slice(lastIndex)
    if (tail.trim().length > 0) {
      segments.push({ kind: 'text', text: tail })
    }
    return segments
  }

  function renderText(text: string) {
    // Very light Markdown-ish rendering for headings and lists
    return text.split(/\n{2,}/).map((para, idx) => {
      const lines = para.split('\n')
      const first = lines[0] || ''
      if (/^#{1,6}\s+/.test(first)) {
        const title = first.replace(/^#{1,6}\s+/, '')
        const rest = lines.slice(1).join('\n')
        return (
          <div key={idx} className="space-y-1">
            <div className="font-semibold text-sm">{title}</div>
            {rest && <div className="text-sm whitespace-pre-wrap">{rest}</div>}
          </div>
        )
      }
      return (
        <p key={idx} className="text-sm whitespace-pre-wrap">
          {para}
        </p>
      )
    })
  }

  function renderMessageContent(content: string) {
    const parts = splitMarkdownBlocks(content)
    return (
      <div className="space-y-3">
        {parts.map((seg, i) =>
          seg.kind === 'code' ? (
            <CodeBlock key={i} code={seg.code} language={seg.lang} />
          ) : (
            <div key={i}>{renderText(seg.text)}</div>
          )
        )}
      </div>
    )
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message
      const welcomeMessage: AIMessage = {
        id: 'welcome',
        type: 'assistant',
        content: `Hello! I'm your DevFlowHub AI Assistant. I can help you with your projects, code, and development tasks. 

${projectContext ? `I can see you're working on "${projectContext.name}" (${projectContext.language}/${projectContext.framework}). ` : ''}What would you like to do today?`,
        timestamp: new Date(),
        context: projectContext ? { projectId: projectContext.id } : undefined
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, projectContext])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
      context: projectContext ? { projectId: projectContext.id } : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectContext?.id || 'dashboard',
          projectName: projectContext?.name || 'Dashboard',
          projectLanguage: projectContext?.language || 'JavaScript',
          currentTool: 'dashboard',
          currentFile: null,
          currentCode: null,
          userMessage: input.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.response || 'I understand your request. Let me help you with that.',
          timestamp: new Date(),
          context: {
            projectId: projectContext?.id,
            action: data.action || 'assist'
          }
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Failed to get AI response')
      }
    } catch (error) {
      console.error('AI Assistant error:', error)
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (action: typeof quickActions[0]) => {
    const message = `Please ${action.description.toLowerCase()}`
    setInput(message)
    
    if (onNavigateToTool && projectContext) {
      onNavigateToTool(action.tool, projectContext.id)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-fluid-2 sm:p-fluid-4">
      <Card className="w-full max-w-4xl h-[85vh] sm:h-[90vh] flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0 px-fluid-4 pt-fluid-4">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 flex-shrink-0" />
            <CardTitle className="text-fluid-lg sm:text-fluid-xl truncate">DevFlowHub AI Assistant</CardTitle>
            {projectContext && (
              <Badge variant="outline" className="hidden sm:inline-flex flex-shrink-0">
                {projectContext.name}
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="touch-target flex-shrink-0"
          >
            ×
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0 space-y-3 px-fluid-4 pb-fluid-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-fluid-2 flex-shrink-0">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="h-auto p-fluid-2 sm:p-fluid-3 flex flex-col items-center space-y-1 touch-target"
                  onClick={() => handleQuickAction(action)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs text-center leading-tight">{action.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Messages - Fixed height with proper scrolling */}
          <div className="flex-1 min-h-0 border rounded-lg bg-gray-50">
            <ScrollArea className="h-full">
              <div className="p-fluid-3 sm:p-fluid-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] sm:max-w-[85%] rounded-lg px-fluid-2 sm:px-fluid-3 py-fluid-2 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.type === 'user' ? (
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-700 text-white text-[10px] flex-shrink-0">You</span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] flex-shrink-0">AI</span>
                        )}
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-fluid-sm">
                        {message.type === 'assistant' ? renderMessageContent(message.content) : (
                          <span className="whitespace-pre-wrap break-words">{message.content}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-fluid-2 sm:p-fluid-3 rounded-lg shadow-sm max-w-[90%] sm:max-w-[85%]">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600 flex-shrink-0" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input - Fixed at bottom */}
          <div className="flex space-x-2 flex-shrink-0">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your project..."
              disabled={isLoading}
              className="flex-1 touch-target text-fluid-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 touch-target"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Context Info */}
          {projectContext && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded flex-shrink-0">
              <strong>Project Context:</strong> {projectContext.name} ({projectContext.language}/{projectContext.framework}) • 
              {projectContext.files.length} files • Last modified: {new Date(projectContext.lastModified).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
