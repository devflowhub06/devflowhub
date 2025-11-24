'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Code, 
  FileText, 
  Lightbulb,
  X,
  Minimize2,
  Maximize2,
  Settings,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    filePath?: string
    lineNumber?: number
    tool?: string
    action?: string
  }
}

export interface AIAssistantProps {
  projectId: string
  project: any
  currentTool: string
  currentFile?: string
  currentCode?: string
  onCodeGeneration?: (code: string, filePath: string) => void
  onFileAnalysis?: (filePath: string) => void
  className?: string
}

export default function AIAssistant({
  projectId,
  project,
  currentTool,
  currentFile,
  currentCode,
  onCodeGeneration,
  onFileAnalysis,
  className = ''
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions] = useState([
    'Explain this code',
    'Generate unit tests',
    'Optimize performance',
    'Add error handling',
    'Refactor this function',
    'Generate documentation'
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (role: 'user' | 'assistant', content: string, metadata?: any) => {
    const newMessage: AIMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      metadata
    }
    setMessages(prev => [...prev, newMessage])
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage = content
    setInputValue('')
    setIsLoading(true)

    // Add user message
    addMessage('user', userMessage, {
      tool: currentTool,
      filePath: currentFile
    })

    try {
      // Prepare context for AI
      const context = {
        projectId,
        projectName: project.name,
        projectLanguage: project.language,
        currentTool,
        currentFile,
        currentCode,
        userMessage
      }

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context)
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      // Add AI response
      addMessage('assistant', data.response, {
        tool: currentTool,
        filePath: currentFile,
        action: data.action
      })

      // Handle code generation if AI suggests it
      if (data.code && data.filePath && onCodeGeneration) {
        onCodeGeneration(data.code, data.filePath)
        toast.success('Code generated and applied!', {
          icon: <Code className="w-4 h-4" />,
        })
      }

    } catch (error) {
      console.error('AI Assistant error:', error)
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.', {
        tool: currentTool,
        error: true
      })
      toast.error('Failed to get AI response', {
        icon: <Bot className="w-4 h-4" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const analyzeCurrentFile = async () => {
    if (!currentFile || !onFileAnalysis) return
    
    addMessage('user', `Analyze the current file: ${currentFile}`, {
      tool: currentTool,
      filePath: currentFile,
      action: 'analyze'
    })
    
    onFileAnalysis(currentFile)
  }

  const clearChat = () => {
    setMessages([])
  }

  const toggleAssistant = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // Add welcome message on first open
      if (messages.length === 0) {
        addMessage('assistant', `Hello! I'm your AI assistant for the ${project.name} project. I can help you with code analysis, generation, optimization, and more. What would you like to work on?`, {
          tool: currentTool,
          action: 'welcome'
        })
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-[9999] ${className}`}>
        <Button
          onClick={toggleAssistant}
          size="lg"
          className="rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 h-auto"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          AI Assistant
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] w-96 ${className}`}>
      <Card className="shadow-2xl border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Bot className="h-5 w-5 text-blue-600" />
              <span>AI Assistant</span>
              <Badge variant="secondary" className="text-xs">
                {currentTool}
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAssistant}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {currentFile && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FileText className="h-3 w-3" />
              <span>{currentFile}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={analyzeCurrentFile}
                className="h-6 px-2 text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                Analyze
              </Button>
            </div>
          )}
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="p-0">
              {/* Messages */}
              <ScrollArea className="h-80 px-4">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {message.role === 'user' ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Bot className="h-3 w-3" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.metadata?.action && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {message.metadata.action}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-3 w-3" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <Separator />

              {/* Suggestions */}
              {messages.length === 1 && (
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs h-7"
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your code..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => sendMessage(inputValue)}
                    disabled={isLoading || !inputValue.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
