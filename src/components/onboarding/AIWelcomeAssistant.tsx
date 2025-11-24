'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Bot, 
  X, 
  Sparkles, 
  FileText, 
  Terminal, 
  Eye, 
  Rocket,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

interface WelcomeMessage {
  id: string
  title: string
  content: string
  action?: {
    label: string
    href: string
  }
}

const welcomeMessages: WelcomeMessage[] = [
  {
    id: 'workspace-layout',
    title: 'Welcome to Your Workspace! 👋',
    content: `This is your DevFlowHub workspace. Here's what you can do:

• **Editor Tab**: Write and edit your code with AI-powered autocomplete
• **Terminal Tab**: Run commands and see output in real-time
• **Preview Tab**: See your app running live
• **AI Assistant**: Get help with explain, debug, and refactor

Try clicking on different tabs to explore!`,
    action: {
      label: 'Open Editor',
      href: '#editor'
    }
  },
  {
    id: 'ai-features',
    title: 'AI-Powered Development 🚀',
    content: `DevFlowHub's AI can help you:

• **Explain Code**: Select code and ask "What does this do?"
• **Debug Issues**: Get AI-powered bug detection and fixes
• **Refactor**: Improve code quality with AI suggestions
• **Chat**: Ask questions about your codebase

The AI understands your entire project structure!`,
    action: {
      label: 'Try AI Assistant',
      href: '#assistant'
    }
  },
  {
    id: 'terminal-preview',
    title: 'Run & Preview Your App 🎯',
    content: `Use the terminal to:
• Run \`npm run dev\` to start your development server
• Install packages with \`npm install\`
• Run tests and scripts

The preview tab will automatically show your running app!`,
    action: {
      label: 'Open Terminal',
      href: '#terminal'
    }
  }
]

interface AIWelcomeAssistantProps {
  onDismiss?: () => void
  currentStep?: number
}

export function AIWelcomeAssistant({ onDismiss, currentStep = 0 }: AIWelcomeAssistantProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(currentStep)
  const [isVisible, setIsVisible] = useState(true)

  const currentMessage = welcomeMessages[currentMessageIndex]

  const handleNext = () => {
    if (currentMessageIndex < welcomeMessages.length - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1)
    } else {
      handleDismiss()
    }
  }

  const handlePrevious = () => {
    if (currentMessageIndex > 0) {
      setCurrentMessageIndex(currentMessageIndex - 1)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) {
      onDismiss()
    }
    // Store dismissal in localStorage
    localStorage.setItem('ai-welcome-dismissed', 'true')
  }

  // Check if already dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('ai-welcome-dismissed')
    if (dismissed === 'true') {
      setIsVisible(false)
    }
  }, [])

  if (!isVisible) return null

  return (
    <Card className="border-accent-warn/30 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-accent-warn/20">
              <Bot className="h-5 w-5 text-accent-warn" />
            </div>
            <CardTitle className="text-sm font-medium text-white">
              {currentMessage.title}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-300 whitespace-pre-line">
          {currentMessage.content}
        </p>

        {currentMessage.action && (
          <Button
            onClick={() => {
              const element = document.querySelector(currentMessage.action!.href)
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="w-full bg-accent-warn hover:bg-accent-warn/90 text-white"
            size="sm"
          >
            {currentMessage.action.label}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}

        {/* Progress Indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <div className="flex items-center space-x-1">
            {welcomeMessages.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentMessageIndex
                    ? 'w-6 bg-accent-warn'
                    : 'w-1.5 bg-slate-600'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {currentMessageIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                className="text-xs text-slate-400 hover:text-white"
              >
                Previous
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="text-xs text-accent-warn hover:text-accent-warn/80"
            >
              {currentMessageIndex < welcomeMessages.length - 1 ? 'Next' : 'Got it!'}
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


