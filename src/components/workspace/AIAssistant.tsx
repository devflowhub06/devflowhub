'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { brandLabelFromAny, toModuleId } from '@/lib/tools/tool-mapping'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react'
import { PreviewChangesModal } from '@/components/modals/PreviewChangesModal'
import { changeTracker, ChangeTracker } from '@/lib/services/change-tracker'
import { GitService } from '@/lib/services/git-service'

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

interface AIAssistantProps {
  projectId: string
  activeTool: string
  projectContext: ProjectContext
  onActionExecute?: (action: any) => void
  onToolSwitch?: (tool: string) => void
  className?: string
}

export default function AIAssistant({ 
  projectId, 
  activeTool, 
  projectContext,
  onActionExecute,
  onToolSwitch,
  className = ""
}: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [actions, setActions] = useState<AIAction[]>([])
  const [changeTrackerState, setChangeTrackerState] = useState(changeTracker.getState())
  const [suggestions] = useState([
    "Add a login page to my app",
    "Create a REST API endpoint", 
    "Fix the styling on the header",
    "Add error handling to the form",
    "Deploy to staging environment",
    "Generate a user dashboard component"
  ])

  const gitService = useRef(new GitService(projectId))

  // Subscribe to change tracker updates
  useEffect(() => {
    const unsubscribe = changeTracker.subscribe(setChangeTrackerState)
    return unsubscribe
  }, [])

  // Handle change approval
  const handleApproveChange = async (commitMessage: string) => {
    if (!changeTrackerState.currentChange) return

    try {
      changeTracker.setProcessing(true)
      
      // Create assistant branch
      const branchName = await gitService.current.createAssistantBranch()
      
      // Commit changes
      const commit = await gitService.current.commitChanges(
        branchName,
        commitMessage,
        changeTrackerState.currentChange.files,
        'AI Assistant'
      )

      // Apply changes to the project
      if (onActionExecute) {
        onActionExecute({
          id: changeTrackerState.currentChange.id,
          type: 'edit_file',
          tool: activeTool as any,
          description: changeTrackerState.currentChange.summary,
          status: 'completed',
          result: `Changes applied and committed to branch ${branchName}`,
          codeChanges: changeTrackerState.currentChange.files.map(f => ({
            file: f.path,
            operation: f.type,
            content: f.newContent
          })),
          fileOperations: changeTrackerState.currentChange.files.map(f => ({
            path: f.path,
            operation: f.type,
            content: f.newContent
          }))
        })
      }

      // Log approval
      await logActivity('assistant_change_approved', {
        changeId: changeTrackerState.currentChange.id,
        commitId: commit.id,
        branchName,
        filesChanged: changeTrackerState.currentChange.files.length
      })

      // Close modal and clear current change
      changeTracker.closeModal()
      
    } catch (error) {
      console.error('Error approving changes:', error)
      // Handle error - could show toast notification
    } finally {
      changeTracker.setProcessing(false)
    }
  }

  // Handle change rejection
  const handleRejectChange = async () => {
    if (!changeTrackerState.currentChange) return

    try {
      // Log rejection
      await logActivity('assistant_change_rejected', {
        changeId: changeTrackerState.currentChange.id,
        reason: 'User rejected the proposed changes'
      })

      // Close modal and clear current change
      changeTracker.closeModal()
      
    } catch (error) {
      console.error('Error rejecting changes:', error)
    }
  }

  // Log activity to database
  const logActivity = async (action: string, metadata: any) => {
    try {
      await fetch(`/api/projects/${projectId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          metadata,
          tool: activeTool
        })
      })
    } catch (error) {
      console.error('Error logging activity:', error)
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

      // Check if there are code changes that need approval
      const hasCodeChanges = (result.codeChanges && result.codeChanges.length > 0) || 
                            (result.fileOperations && result.fileOperations.length > 0)
      
      if (hasCodeChanges) {
        // Parse file changes for preview
        const fileChanges = ChangeTracker.parseFileChanges(result)
        
        if (fileChanges.length > 0) {
          // Propose changes for approval
          const proposedChange = ChangeTracker.createProposedChange(
            result.message || prompt,
            `AI Assistant suggested changes based on: "${prompt}"`,
            fileChanges,
            'ai-assistant'
          )
          
          changeTracker.proposeChange(proposedChange)
        }
      } else {
        // No code changes, execute directly
        if (onActionExecute) {
          onActionExecute({
            ...action,
            result: result.message,
            tool: (toModuleId(result.recommendedTool || activeTool) || (result.recommendedTool || activeTool)).toLowerCase(),
            codeChanges: result.codeChanges || [],
            fileOperations: result.fileOperations || []
          })
        }
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
      case 'sandbox': return <Bot className="w-4 h-4" />
      case 'editor': return <Bot className="w-4 h-4" />
      case 'ui-studio': return <Sparkles className="w-4 h-4" />
      case 'deployer': return <Bot className="w-4 h-4" />
      default: return <Bot className="w-4 h-4" />
    }
  }

  const generateCodeFromPrompt = (prompt: string, tool: string): string => {
    const lowerPrompt = prompt.toLowerCase()
    
    if (tool === 'ui-studio' || lowerPrompt.includes('component') || lowerPrompt.includes('ui')) {
      if (lowerPrompt.includes('navbar') || lowerPrompt.includes('navigation')) {
        return `import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-800">Logo</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                <a href="#" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About</a>
                <a href="#" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Services</a>
                <a href="#" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Contact</a>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;`
      } else if (lowerPrompt.includes('card')) {
        return `import React from 'react';

const Card = ({ title, description, image, onClick }) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
      {image && (
        <img className="w-full h-48 object-cover" src={image} alt={title} />
      )}
      <div className="px-6 py-4">
        <h3 className="font-bold text-xl mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600 text-base">{description}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <button 
          onClick={onClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

export default Card;`
      } else if (lowerPrompt.includes('button')) {
        return `import React from 'react';

const Button = ({ children, variant = 'primary', size = 'medium', onClick, disabled = false }) => {
  const baseClasses = 'font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={\`\${baseClasses} \${variants[variant]} \${sizes[size]} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;`
      }
    }
    
    if (tool === 'sandbox' || tool === 'editor') {
      if (lowerPrompt.includes('function') || lowerPrompt.includes('api')) {
        return `// AI Generated Function
export const ${getFunctionNameFromPrompt(prompt)} = async (params) => {
  try {
    // TODO: Implement the function logic
    console.log('Function called with params:', params);
    
    // Example implementation
    const result = {
      success: true,
      data: params,
      timestamp: new Date().toISOString()
    };
    
    return result;
  } catch (error) {
    console.error('Error in function:', error);
    throw error;
  }
};`
      } else if (lowerPrompt.includes('component')) {
        return `import React from 'react';

const ${getComponentNameFromPrompt(prompt)} = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">${getComponentNameFromPrompt(prompt)}</h2>
      <p className="text-gray-600">This is an AI-generated component.</p>
    </div>
  );
};

export default ${getComponentNameFromPrompt(prompt)};`
      }
    }
    
    return `// AI Generated Code
// Prompt: ${prompt}
// Generated for: ${tool}

console.log('AI generated code for: ${prompt}');`
  }

  const getFileNameFromPrompt = (prompt: string, tool: string): string => {
    const lowerPrompt = prompt.toLowerCase()
    
    if (lowerPrompt.includes('navbar') || lowerPrompt.includes('navigation')) {
      return 'Navbar.jsx'
    } else if (lowerPrompt.includes('card')) {
      return 'Card.jsx'
    } else if (lowerPrompt.includes('button')) {
      return 'Button.jsx'
    } else if (lowerPrompt.includes('footer')) {
      return 'Footer.jsx'
    } else if (lowerPrompt.includes('header')) {
      return 'Header.jsx'
    } else if (lowerPrompt.includes('function') || lowerPrompt.includes('api')) {
      return 'utils.js'
    } else {
      return `${getComponentNameFromPrompt(prompt)}.jsx`
    }
  }

  const getComponentNameFromPrompt = (prompt: string): string => {
    const words = prompt.split(' ').filter(word => word.length > 0)
    const capitalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    return capitalized.join('').replace(/[^a-zA-Z0-9]/g, '') || 'GeneratedComponent'
  }

  const getFunctionNameFromPrompt = (prompt: string): string => {
    const words = prompt.split(' ').filter(word => word.length > 0)
    const camelCase = words.map((word, index) => 
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    return camelCase.join('').replace(/[^a-zA-Z0-9]/g, '') || 'generatedFunction'
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700/50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2 text-white">
            <Bot className="w-5 h-5 text-blue-400" />
            <span>AI Assistant</span>
          </CardTitle>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0 bg-transparent hover:bg-slate-700/50 text-slate-400"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <Badge className="text-xs border-slate-600 bg-slate-700 text-slate-300">
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
                className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
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
            <p className="text-sm font-medium text-slate-300">Quick Actions:</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  onClick={() => setPrompt(suggestion)}
                  className="justify-start text-left h-auto py-2 px-3 text-xs border-slate-600 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300"
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
              <p className="text-sm font-medium text-slate-300">Recent Actions:</p>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {actions.slice(0, 3).map((action) => (
                  <div key={action.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(action.status)}
                      <div className="flex items-center space-x-2">
                        {getToolIcon(action.tool)}
                        <span className="text-xs font-medium text-slate-300">{action.tool.toUpperCase()}</span>
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {action.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-300 mb-2">{action.description}</p>
                    
                    {/* AI Recommendation */}
                    {action.result && (
                      <div className="mb-2 p-2 bg-blue-500/20 border border-blue-500/30 rounded">
                        <p className="text-xs text-blue-300 font-medium mb-1">✅ AI Response:</p>
                        <p className="text-xs text-blue-200">{action.result}</p>
                        {action.codeChanges && action.codeChanges.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-green-300 font-medium mb-1">📁 Generated Files:</p>
                            {action.codeChanges.map((change, idx) => (
                              <p key={idx} className="text-xs text-green-200">• {change.file}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Tool Suggestion */}
                    {action.tool && action.tool !== activeTool.toLowerCase() && (
                      <div className="p-2 bg-green-500/20 border border-green-500/30 rounded">
                        <button
                          onClick={() => onToolSwitch?.(action.tool)}
                          className="text-xs text-green-300 hover:text-green-200 transition-colors cursor-pointer text-left w-full"
                        >
                          💡 Switch to <strong>{brandLabelFromAny(action.tool)}</strong> for this task
                        </button>
                      </div>
                    )}
                    
                    {/* Error Display */}
                    {action.error && (
                      <div className="p-2 bg-red-500/20 border border-red-500/30 rounded">
                        <p className="text-xs text-red-300">{action.error}</p>
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
              <p className="text-sm font-medium text-slate-300">Project Context:</p>
              <div className="text-xs text-slate-400 space-y-1">
                <p>Files: {projectContext.files?.length || 0}</p>
                {projectContext.language && <p>Language: {projectContext.language}</p>}
                {projectContext.lastEdited && <p>Last edited: {projectContext.lastEdited.toLocaleString()}</p>}
              </div>
            </div>
          )}
        </CardContent>
      )}

      <PreviewChangesModal
        isOpen={changeTrackerState.isModalOpen}
        onClose={() => changeTracker.closeModal()}
        proposedChange={changeTrackerState.currentChange}
        onApprove={handleApproveChange}
        onReject={handleRejectChange}
        isProcessing={changeTrackerState.isProcessing}
      />
    </Card>
  )
}
