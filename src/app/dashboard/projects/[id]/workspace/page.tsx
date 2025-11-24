'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Code2, Terminal, Sparkles, Rocket, Zap, Save, Play, GitBranch, Bot, Settings, RefreshCw } from 'lucide-react'
import dynamic from 'next/dynamic'
import ReplitWorkspace from './components/ReplitWorkspace'
import CursorWorkspace from './components/CursorWorkspace'
import V0Workspace from './components/V0Workspace'
import BoltWorkspace from './components/BoltWorkspace'
import ProfessionalWorkspace from '@/components/workspace/ProfessionalWorkspace'
import SimpleWorkspace from '@/components/workspace/SimpleWorkspace'
import { 
  LegacyToolType, 
  DevFlowHubModule, 
  toolParamToModuleParam, 
  moduleParamToToolParam,
  getModuleMappingByKey,
  getModuleMappingByModule,
  getModuleMapping
} from '@/lib/module-mapping'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { ProductTour } from '@/components/onboarding/ProductTour'
import { AIWelcomeAssistant } from '@/components/onboarding/AIWelcomeAssistant'

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

interface WorkspaceStatus {
  status: 'idle' | 'saving' | 'running' | 'building' | 'deploying' | 'error'
  message: string
  progress?: number
}

export default function WorkspacePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = params.id as string

  // Core state
  const [activeTool, setActiveTool] = useState('REPLIT')
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Project context
  const [projectContext, setProjectContext] = useState<ProjectContext>({
    files: [],
    language: 'javascript',
    dependencies: ['react', 'next', 'tailwindcss'],
    gitStatus: 'clean'
  })

  // Workspace status
  const [workspaceStatus, setWorkspaceStatus] = useState<WorkspaceStatus>({
    status: 'idle',
    message: 'Ready'
  })

  // Onboarding state
  const [showTour, setShowTour] = useState(false)
  const [showWelcomeAssistant, setShowWelcomeAssistant] = useState(true)


  // Initialize workspace
  useEffect(() => {
    console.log('🔍 WorkspacePage: projectId =', projectId, 'type:', typeof projectId, 'length:', projectId?.length)
    console.log('🔍 WorkspacePage: params =', params)
    console.log('🔍 WorkspacePage: searchParams =', searchParams.toString())

    // Validate project ID and redirect if invalid
    if (!projectId || 
        projectId === 'undefined' || 
        projectId === 'null' || 
        projectId === 'test' || 
        (projectId.length <= 10 && !projectId.startsWith('demo_')) ||
        projectId.includes('undefined')) {
      console.log('❌ WorkspacePage: Invalid projectId, redirecting to projects')
      console.log('❌ Invalid projectId details:', { projectId, type: typeof projectId, length: projectId?.length })
      setIsRedirecting(true)
      setTimeout(() => {
        router.push('/dashboard/projects')
      }, 100)
      return
    }

    console.log('✅ WorkspacePage: Valid projectId, proceeding with initialization')

    // Check if onboarding tour should be shown
    const onboardingParam = searchParams.get('onboarding')
    if (onboardingParam === 'true') {
      const tourCompleted = localStorage.getItem('product-tour-completed')
      if (!tourCompleted) {
        setShowTour(true)
      }
    }

    // Set tool from URL parameter (support both legacy 'tool' and new 'module' params)
    const toolFromUrl = searchParams.get('tool')
    const moduleFromUrl = searchParams.get('module')
    
    if (isFeatureEnabled('REBRAND_V1_0') && moduleFromUrl) {
      // New module-based routing
      try {
        const mapping = getModuleMappingByModule(moduleFromUrl as DevFlowHubModule)
        setActiveTool(mapping.legacyTool)
      } catch (error) {
        console.warn('Invalid module parameter:', moduleFromUrl)
        setActiveTool('REPLIT') // Default fallback
      }
    } else if (toolFromUrl) {
      // Legacy tool-based routing
      const map: Record<string,string> = {
        replit: 'REPLIT', cursor: 'CURSOR', v0: 'V0', bolt: 'BOLT',
        editor: 'CURSOR', sandbox: 'REPLIT', 'ui-studio': 'V0', deployer: 'BOLT'
      }
      const mapped = map[toolFromUrl.toLowerCase()]
      if (mapped) {
        setActiveTool(mapped)
      }
    }
    
    // Initialize project context
    initializeProjectContext()
    setIsLoading(false)
  }, [projectId, searchParams, router])

  // Initialize project context
  const initializeProjectContext = useCallback(async () => {
    try {
      console.log('🔧 WorkspacePage: Initializing project context for:', projectId)
      // Fetch project files and context
      const response = await fetch(`/api/projects/${projectId}/files`)
      if (response.ok) {
        const data = await response.json()
        setProjectContext(prev => ({
          ...prev,
          files: data.files || [],
          language: data.language || 'javascript'
        }))
      }
    } catch (error) {
      console.error('Failed to initialize project context:', error)
    }
  }, [projectId])

  // Handle status change from workspaces
  const handleWorkspaceStatusChange = useCallback((status: { status: string; message: string; progress?: number }) => {
    setWorkspaceStatus(status as WorkspaceStatus)
  }, [])

  // Handle tool switching from AI assistant
  const handleToolSwitch = useCallback((tool: string) => {
    const toolMap: { [key: string]: string } = {
      // Map to actual tool keys used in ProfessionalWorkspace
      'v0': 'V0',
      'replit': 'REPLIT', 
      'cursor': 'CURSOR',
      'bolt': 'BOLT',
      'editor': 'CURSOR',
      'sandbox': 'REPLIT',
      'ui-studio': 'V0',
      'deployer': 'BOLT'
    }
    
    const mappedTool = toolMap[tool.toLowerCase()] || tool.toUpperCase()
    setActiveTool(mappedTool)
    
    // Update URL to use new module routing when feature flag is enabled
    if (isFeatureEnabled('REBRAND_V1_0')) {
      try {
        const mapping = getModuleMapping(mappedTool as LegacyToolType)
        const newUrl = `/dashboard/projects/${projectId}/workspace?module=${mapping.module}`
        router.push(newUrl)
      } catch (error) {
        // Fallback to legacy routing
        const newUrl = `/dashboard/projects/${projectId}/workspace?tool=${tool.toLowerCase()}`
        router.push(newUrl)
      }
    } else {
      // Legacy tool-based routing
      const newUrl = `/dashboard/projects/${projectId}/workspace?tool=${tool.toLowerCase()}`
      router.push(newUrl)
    }
  }, [projectId, router])

  // Global actions
  const handleSaveAll = useCallback(async () => {
    setWorkspaceStatus({ status: 'saving', message: 'Saving all files...' })
    try {
      // Trigger save in all workspaces
      // This would integrate with the actual workspace components
      await new Promise(resolve => setTimeout(resolve, 1000))
      setWorkspaceStatus({ status: 'idle', message: 'All files saved' })
    } catch (error) {
      setWorkspaceStatus({ status: 'error', message: 'Failed to save files' })
    }
  }, [])

  const handleRunAll = useCallback(async () => {
    setWorkspaceStatus({ status: 'running', message: 'Running project...' })
    try {
      // Trigger run in active workspace
      await new Promise(resolve => setTimeout(resolve, 2000))
      setWorkspaceStatus({ status: 'idle', message: 'Project running successfully' })
    } catch (error) {
      setWorkspaceStatus({ status: 'error', message: 'Failed to run project' })
    }
  }, [])

  // AI Action handler
  const handleAIAction = useCallback(async (action: any) => {
    console.log('AI Action executed:', action)

    // Update project context based on action
    if (action.type === 'edit_file') {
      setProjectContext(prev => ({
        ...prev,
        lastEdited: new Date()
      }))
    }

    // Log usage
    try {
      await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          tool: action.tool,
          action: action.type,
          metadata: { description: action.description }
        })
      })
    } catch (error) {
      console.error('Failed to log usage:', error)
    }
  }, [projectId])

  // Redirecting state
  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Redirecting</h2>
          <p className="text-slate-400">Taking you back to projects...</p>
          <p className="text-slate-500 text-sm mt-2">Invalid Project ID: {projectId}</p>
          <p className="text-slate-500 text-xs mt-1">Type: {typeof projectId} | Length: {projectId?.length}</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Workspace</h2>
          <p className="text-slate-400">Project ID: {projectId}</p>
          <p className="text-slate-500 text-sm mt-2">Setting up your development environment...</p>
        </div>
      </div>
    )
  }

  // Render workspace based on active tool
  const renderWorkspace = () => {
    try {
      return (
        <ProfessionalWorkspace 
          projectId={projectId} 
          activeTool={activeTool}
          onStatusChange={handleWorkspaceStatusChange} 
          onToolSwitch={handleToolSwitch} 
        />
      )
    } catch (error) {
      console.error('Error rendering ProfessionalWorkspace, falling back to SimpleWorkspace:', error)
      return (
        <SimpleWorkspace 
          projectId={projectId} 
          activeTool={activeTool}
          onStatusChange={handleWorkspaceStatusChange} 
          onToolSwitch={handleToolSwitch} 
        />
      )
    }
  }

  // Status badge colors
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'saving': return 'text-yellow-600 border-yellow-300 bg-yellow-50'
      case 'running': return 'text-blue-600 border-blue-300 bg-blue-50'
      case 'building': return 'text-purple-600 border-purple-300 bg-purple-50'
      case 'deploying': return 'text-indigo-600 border-indigo-300 bg-indigo-50'
      case 'error': return 'text-red-600 border-red-300 bg-red-50'
      default: return 'text-green-600 border-green-300 bg-green-50'
    }
  }

  // Check if this is a demo project
  const isDemoProject = projectId.startsWith('demo_')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Demo Project Banner */}
      {isDemoProject && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold">Demo Project Active</h3>
                <p className="text-sm text-blue-100">You're exploring DevFlowHub with a temporary project</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => router.push('/signup')}
              >
                Sign Up to Save
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => router.push('/dashboard/projects/new')}
              >
                Create New Project
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Workspace */}
      {renderWorkspace()}

      {/* Onboarding Components */}
      <ProductTour
        isActive={showTour}
        onComplete={() => {
          setShowTour(false)
          localStorage.setItem('product-tour-completed', 'true')
        }}
        onSkip={() => {
          setShowTour(false)
          localStorage.setItem('product-tour-completed', 'true')
        }}
      />
      
      {showWelcomeAssistant && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <AIWelcomeAssistant
            onDismiss={() => setShowWelcomeAssistant(false)}
          />
        </div>
      )}
    </div>
  )
}
