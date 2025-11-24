'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { brandLabelFromAny, toModuleId } from '@/lib/tools/tool-mapping'
import { 
  Bot, 
  Sparkles, 
  Code2, 
  Terminal, 
  Rocket, 
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface AIAction {
  id: string
  type: 'create_file' | 'edit_file' | 'run_command' | 'deploy' | 'generate_ui'
  tool: 'editor' | 'sandbox' | 'ui-studio' | 'deployer'
  description: string
  status: 'pending' | 'executing' | 'completed' | 'failed'
  result?: string
  error?: string
}

interface ProjectContext {
  files: Array<{
    id: string
    name: string
    path: string
    type: 'file' | 'folder'
    content?: string
    lastModified: Date
  }>
  lastEdited?: Date
  language: string
  dependencies: string[]
  gitStatus: 'clean' | 'modified' | 'staged' | 'ahead'
}

interface GlobalAIAssistantProps {
  projectId: string
  activeTool: string
  projectContext: ProjectContext
  onActionExecute: (action: any) => void
  isOpen?: boolean
  onToggle?: () => void
}

export default function GlobalAIAssistant({ 
  projectId, 
  activeTool, 
  projectContext,
  onActionExecute 
}: GlobalAIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [actions, setActions] = useState<AIAction[]>([])
  const [suggestions] = useState([
    "Add a login page to my app",
    "Create a REST API endpoint",
    "Fix the styling on the header",
    "Add error handling to the form",
    "Deploy to staging environment",
    "Generate a user dashboard component"
  ])

  // Execute AI file operations
  const executeFileOperations = async (fileOperations: any[]) => {
    try {
      const response = await fetch('/api/files/patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          operations: fileOperations
        })
      })

      if (!response.ok) {
        throw new Error('File operations failed')
      }

      const result = await response.json()
      console.log('File operations result:', result)
      
      // Update the action with file operation results
      setActions(prev => prev.map(a => 
        a.id === actions[0]?.id 
          ? { ...a, result: `${a.result}\n\nFile operations: ${result.message}` }
          : a
      ))

    } catch (error) {
      console.error('File operations error:', error)
      setActions(prev => prev.map(a => 
        a.id === actions[0]?.id 
          ? { ...a, error: `File operations failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
          : a
      ))
    }
  }

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    
    // Create AI action
    const action: AIAction = {
      id: Date.now().toString(),
      type: 'edit_file',
      tool: (toModuleId(activeTool) || activeTool).toLowerCase() as any,
      description: prompt,
      status: 'pending'
    }

    setActions(prev => [action, ...prev])
    
    try {
      // Call OpenAI API for real AI processing
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          projectId,
          activeTool,
          projectContext,
          action: action.type
        })
      })

      if (!response.ok) {
        throw new Error('AI processing failed')
      }

      const result = await response.json()
      
      // Update action with real AI result
      setActions(prev => prev.map(a => 
        a.id === action.id 
          ? { 
              ...a, 
              status: 'completed', 
              result: result.message,
              tool: (toModuleId(result.recommendedTool || activeTool) || (result.recommendedTool || activeTool)).toLowerCase()
            }
          : a
      ))

      // Execute the AI action
      onActionExecute({
        ...action,
        result: result.message,
        tool: (toModuleId(result.recommendedTool || activeTool) || (result.recommendedTool || activeTool)).toLowerCase(),
        codeChanges: result.codeChanges,
        fileOperations: result.fileOperations
      })

      // Execute file operations if any
      if (result.fileOperations && result.fileOperations.length > 0) {
        await executeFileOperations(result.fileOperations)
      }

      setPrompt('')
    } catch (error) {
      console.error('AI processing error:', error)
      setActions(prev => prev.map(a => 
        a.id === action.id 
          ? { ...a, status: 'failed', error: 'AI processing failed. Please try again.' }
          : a
      ))
    } finally {
      setIsGenerating(false)
    }
  }

  const getStatusIcon = (status: AIAction['status']) => {
    switch (status) {
      case 'pending': return <Loader2 className="w-4 h-4 animate-spin" />
      case 'executing': return <Loader2 className="w-4 h-4 animate-spin" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'sandbox': return <Code2 className="w-4 h-4" />
      case 'editor': return <Terminal className="w-4 h-4" />
      case 'ui-studio': return <Sparkles className="w-4 h-4" />
      case 'deployer': return <Rocket className="w-4 h-4" />
      default: return <Bot className="w-4 h-4" />
    }
  }

  return (
    <Card className="fixed right-6 top-24 w-80 bg-white/95 backdrop-blur border-0 shadow-xl z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Bot className="w-5 h-5 text-purple-600" />
            <span>AI Assistant</span>
          </CardTitle>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
                     <Badge className="text-xs border border-gray-300 bg-gray-50">
            {brandLabelFromAny(activeTool)}
          </Badge>
          <span>•</span>
          <span>Project: {projectId?.slice(0, 8)}...</span>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* AI Input */}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                placeholder="What would you like me to help you with?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className="flex-1"
                disabled={isGenerating}
              />
                             <Button
                 onClick={handleSubmit}
                 disabled={!prompt.trim() || isGenerating}
                 className="px-3 h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white"
               >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Quick Actions:</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((suggestion, index) => (
                                 <Button
                   key={index}
                   onClick={() => setPrompt(suggestion)}
                   className="justify-start text-left h-auto py-2 px-3 text-xs border border-gray-300 bg-white hover:bg-gray-50"
                   disabled={isGenerating}
                 >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Recent Actions */}
          {actions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Recent Actions:</p>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {actions.slice(0, 3).map((action) => (
                  <div key={action.id} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(action.status)}
                      <div className="flex items-center space-x-2">
                        {getToolIcon(action.tool)}
                        <span className="text-xs font-medium text-gray-700">{brandLabelFromAny(action.tool)}</span>
                        <Badge variant="outline" className="text-xs">
                          {action.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-700 mb-2">{action.description}</p>
                    
                    {/* AI Recommendation */}
                    {action.result && (
                      <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-700 font-medium mb-1">AI Recommendation:</p>
                        <p className="text-xs text-blue-600">{action.result}</p>
                      </div>
                    )}
                    
                    {/* Tool Suggestion */}
                    {action.tool && action.tool !== activeTool.toLowerCase() && (
                      <div className="p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs text-green-700">💡 Switch to <strong>{brandLabelFromAny(action.tool)}</strong> for this task</p>
                      </div>
                    )}
                    
                    {/* Error Display */}
                    {action.error && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs text-red-700">{action.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Context */}
          {projectContext && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Project Context:</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Files: {projectContext.files?.length || 0}</p>
                {projectContext.language && <p>Language: {projectContext.language}</p>}
                {projectContext.lastEdited && <p>Last edited: {projectContext.lastEdited.toLocaleString()}</p>}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
