'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import nextDynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loading } from '@/components/ui/loading'
import { Error as ErrorComponent } from '@/components/ui/error'
import { ProjectContextProvider, useProjectContext } from '@/lib/context/ProjectContextProvider'
import { ToolSwitchModal } from '@/components/projects/ToolSwitchModal'
import {
  Zap, CheckCircle, RefreshCw, Clock
} from 'lucide-react'
import { trackPageLoad } from '@/lib/metrics'
import { integrations } from '@/lib/integrations'
import { brandLabelFromAny, moduleToProvider } from '@/lib/tools/tool-mapping'
import { generateV0Url } from '@/lib/tools'
import { toast } from 'sonner'

// Dynamic imports for performance optimization

interface Project {
  id: string
  name: string
  description: string
  status: string
  type: string
  selectedTool: string
  currentTool?: string
  createdAt: string
  updatedAt: string
  language?: string
  framework?: string
  complexity?: string
  context: {
    files: any[]
    requirements: any[]
    codeSnippets: any[]
    designDecisions: any[]
  }
  lastUsedTool?: string
}

interface Activity {
  id: string
  type: string
  tool?: string
  fromTool?: string
  toTool?: string
  details?: string
  success: boolean
  timeTaken?: number
  createdAt: string
}

interface Tool {
  id: string
  name: string
  description: string
  capabilities: string[]
  status: 'available' | 'connected'
  icon?: string
}

interface ProjectDetailsContentProps {
  projectId: string
}

function ContextSyncStatus({ lastSyncTime }: { lastSyncTime?: Date }) {
  const getStatusInfo = () => {
    if (!lastSyncTime) return {
      icon: Clock,
      text: 'Ready to sync',
      color: 'text-yellow-600 bg-yellow-50'
    }
    const timeDiff = Date.now() - lastSyncTime.getTime()
    const isRecent = timeDiff < 30000
    return {
      icon: isRecent ? CheckCircle : RefreshCw,
      text: isRecent ? 'Context synced' : 'Sync available',
      color: isRecent ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'
    }
  }
  const { icon: Icon, text, color } = getStatusInfo()
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${color}`}>
      <Icon className="w-4 h-4" />
      <span>{text}</span>
    </div>
  )
}

function ToolCard({ tool, isConnected }: { tool: string, isConnected: boolean }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const handleToolClick = () => {
    setIsAnimating(true);
    toast.loading('Preparing your workspace...', {
      duration: 2000,
      id: 'tool-loading',
    });
    setTimeout(() => {
      toast.success('Ready to code! 🚀', {
        id: 'tool-loading',
        duration: 3000,
      });
      setIsAnimating(false);
      // Open tool in new tab
      if (tool === 'ui-studio') {
        window.open('https://v0.dev/', '_blank');
      } else if (tool === 'deployer') {
        window.open('https://bolt.new/', '_blank');
      } else if (tool === 'sandbox') {
        window.open('https://replit.com/', '_blank');
      } else if (tool === 'editor') {
        window.open('https://cursor.sh/', '_blank');
      }
    }, 1500);
  };
  const providerKey = moduleToProvider[tool as any] as keyof typeof integrations.ai_tools | undefined;
  const details = providerKey ? integrations.ai_tools[providerKey] : undefined;
  return (
    <Card
      className={`tool-card p-4 hover:shadow-lg transition-all hover:scale-[1.02] ${isAnimating ? 'animate-pulse-glow' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{brandLabelFromAny(tool)}</h3>
        <Badge className={isConnected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
          {isConnected ? 'Connected' : 'Available'}
        </Badge>
      </div>
      {details && (
        <p className="text-sm text-gray-500 mb-4">
          {details.method}
        </p>
      )}
      <Button
        className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
        onClick={handleToolClick}
        disabled={isAnimating}
      >
        {isAnimating ? 'Opening...' : 'Open Workspace'}
      </Button>
      <p className="text-xs text-gray-400 mt-2">
        Last used: {new Date().toLocaleString()}
      </p>
    </Card>
  );
}

function ProjectDetailsContent({ projectId }: ProjectDetailsContentProps) {
  const router = useRouter()
  const { context, addFile, updateFile, addRequirement, addCodeSnippet, addDesignDecision, syncToTool } = useProjectContext()
  const [isEditingName, setIsEditingName] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({})
  const [project, setProject] = useState<Project | null>(null)
  const [activityHistory, setActivityHistory] = useState<Activity[]>([])
  const [isToolModalOpen, setIsToolModalOpen] = useState(false)
  const [isSwitchingTool, setIsSwitchingTool] = useState(false)
  const [currentTool, setCurrentTool] = useState('sandbox')
  const [isOpeningV0, setIsOpeningV0] = useState(false)
  const [openV0Error, setOpenV0Error] = useState<string | null>(null)

  // Available tools configuration
  const availableTools: Tool[] = [
    { 
      id: 'editor', 
      name: 'DevFlowHub Editor', 
      description: 'Deep Links + File System',
      capabilities: ['Code editing', 'Refactoring', 'AI completions'],
      status: 'available' 
    },
    { 
      id: 'ui-studio', 
      name: 'DevFlowHub UI Studio', 
      description: 'AI-powered UI generation',
      capabilities: ['UI generation', 'Component creation', 'Design systems'],
      status: 'available' 
    },
    { 
      id: 'deployer', 
      name: 'DevFlowHub Deployer', 
      description: 'StackBlitz API',
      capabilities: ['Quick iterations', 'Live preview', 'Package management'],
      status: 'available' 
    },
    { 
      id: 'sandbox', 
      name: 'DevFlowHub Sandbox', 
      description: 'REST API',
      capabilities: ['Rapid prototyping', 'Full-stack development', 'Real-time collaboration'],
      status: 'available' 
    }
  ]

  useEffect(() => {
    // Track page load time
    const startTime = performance.now()
    const timer = setTimeout(() => {
      setIsLoading(false)
      trackPageLoad(startTime)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`)
        if (!response.ok) throw new Error('Failed to fetch project')
        const data = await response.json()
        setProject(data)
        setProjectName(data.name)
        setCurrentTool(data.currentTool || data.selectedTool || 'sandbox')
        
        // Fetch activity history
        await fetchActivityHistory()
      } catch (error: any) {
        console.error('Error fetching project:', error)
      }
    }

    fetchProject()
  }, [projectId])

  const fetchActivityHistory = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/activities`)
      if (response.ok) {
        const data = await response.json()
        setActivityHistory(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to fetch activity history:', error)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-gray-500'
      case 'archived':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleNameSave = async () => {
    try {
      setIsEditingName(false)
      await updateFile('project.json', JSON.stringify({ ...context, name: projectName }))
    } catch (err) {
      setError('Failed to update project name')
    }
  }

  const handleSync = async (tool: string) => {
    try {
      setIsSyncing(prev => ({ ...prev, [tool]: true }))
      await syncToTool(tool as any)
    } catch (err) {
      setError(`Failed to sync with ${tool}`)
    } finally {
      setIsSyncing(prev => ({ ...prev, [tool]: false }))
    }
  }

  const handleArchive = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      })
      if (!response.ok) throw new (Error as any)('Failed to archive project')
      router.push('/dashboard/projects')
    } catch (error: any) {
      console.error('Error archiving project:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new (Error as any)('Failed to delete project')
      router.push('/dashboard/projects')
    } catch (error: any) {
      console.error('Error deleting project:', error)
    }
  }

  const handleSwitchTool = () => {
    setIsToolModalOpen(true)
  }

  const handleToolSelect = async (toolId: string) => {
    try {
      setIsSwitchingTool(true)
      const previousTool = currentTool
      
      // Update current tool state immediately
      setCurrentTool(toolId)
      
      // Close modal
      setIsToolModalOpen(false)
      
      // Update project's current tool in database
      await updateProjectCurrentTool(toolId)
      
      // Add to activity history
      await addActivityLog({
        type: 'tool_switch',
        tool: toolId,
        fromTool: previousTool,
        toTool: toolId,
        details: `Switched from ${previousTool} to ${toolId}`,
        success: true
      })
      
      // Show success message
      console.log(`Successfully switched to ${toolId.charAt(0).toUpperCase() + toolId.slice(1)}`)
      
    } catch (error) {
      console.error('Failed to switch tool:', error)
      // Rollback current tool state
      setCurrentTool(currentTool)
      setError('Failed to switch tool. Please try again.')
    } finally {
      setIsSwitchingTool(false)
    }
  }

  const updateProjectCurrentTool = async (toolId: string) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentTool: toolId,
        updatedAt: new Date().toISOString()
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to update project tool')
    }
    
    return response.json()
  }

  const addActivityLog = async (activity: {
    type: string
    tool?: string
    fromTool?: string
    toTool?: string
    details?: string
    success: boolean
  }) => {
    try {
      const newActivity = {
        id: Date.now().toString(), // Temporary ID for optimistic update
        projectId: projectId,
        type: activity.type,
        tool: activity.tool,
        fromTool: activity.fromTool,
        toTool: activity.toTool,
        details: activity.details,
        success: activity.success,
        createdAt: new Date().toISOString()
      }
      
      // Optimistic update - add to state immediately
      setActivityHistory(prev => [newActivity as Activity, ...prev])
      
      // Save to database
      const response = await fetch(`/api/projects/${projectId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newActivity)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save activity')
      }
      
      const savedActivity = await response.json()
      
      // Update with real ID from database
      setActivityHistory(prev => 
        prev.map(item => 
          item.id === newActivity.id ? { ...savedActivity, id: savedActivity.id } : item
        )
      )
      
    } catch (error) {
      console.error('Failed to add activity log:', error)
      // Rollback optimistic update on error
      const tempId = Date.now().toString()
      setActivityHistory(prev => prev.filter(item => item.id !== tempId))
      setError('Failed to log activity. Please try again.')
    }
  }

  const formatActivityTitle = (activity: Activity) => {
    switch (activity.type) {
      case 'tool_switch':
        return `Switched to ${brandLabelFromAny(activity.tool || '')}`
      case 'task_complete':
        return `Completed task in ${brandLabelFromAny(activity.tool || '')}`
      case 'context_sync':
        return `Synced context with ${brandLabelFromAny(activity.tool || '')}`
      case 'project_created':
        return 'Project created'
      case 'project_updated':
        return 'Project updated'
      default:
        return activity.details || 'Unknown activity'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const handleOpenInV0 = async () => {
    setIsOpeningV0(true)
    setOpenV0Error(null)
    try {
      if (!project) throw new Error('Project not loaded')
      const v0Url = generateV0Url(project)
      window.open(v0Url, '_blank', 'noopener,noreferrer')
      await addActivityLog({
        type: 'tool_switch',
        tool: 'ui-studio',
        details: 'Opened project in DevFlowHub UI Studio (v0.dev)',
        success: true
      })
      // Optionally update lastUsedTool in state (module id)
      setProject((prev) => prev ? { ...prev, lastUsedTool: 'ui-studio' } : prev)
    } catch (error) {
      setOpenV0Error('Failed to open v0.dev. Please try again.')
    } finally {
      setIsOpeningV0(false)
    }
  }

  if (isLoading || !project) {
    return <Loading size="lg" text="Loading project details..." className="min-h-[400px]" />
  }

  if (error) {
    return (
      <ErrorComponent
        title="Error Loading Project"
        message={error}
        onRetry={() => {
          setError(null)
          setIsLoading(true)
        }}
        className="min-h-[400px]"
      />
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {isEditingName ? (
            <div className="flex items-center space-x-2 animate-scale-in">
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-2xl font-bold"
              />
              <Button onClick={handleNameSave}>Save</Button>
              <Button onClick={() => setIsEditingName(false)}>Cancel</Button>
            </div>
          ) : (
            <h1 
              className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors" 
              onClick={() => setIsEditingName(true)}
            >
              {projectName}
            </h1>
          )}
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
          {/* Context Sync Indicator */}
          <ContextSyncStatus lastSyncTime={project?.updatedAt ? new Date(project.updatedAt) : undefined} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleArchive}>
            <Zap className="w-4 h-4 mr-2" />
            Archive
          </Button>
          <Button onClick={handleDelete}>
            <Zap className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button>
            <Zap className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Project Info */}
        <Card className="p-4 hover:shadow-lg transition-shadow animate-fade-in">
          <h2 className="text-lg font-semibold mb-4">Project Info</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>
            <div>
              <h3 className="font-medium">Technical Details</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Type: {project.type}</li>
                {project.language && <li>Language: {project.language}</li>}
                {project.framework && <li>Framework: {project.framework}</li>}
                {project.complexity && <li>Complexity: {project.complexity}</li>}
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Timeline</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Created: {formatDate(new Date(project.createdAt))}
                </p>
                <p className="text-sm text-gray-600">
                  Last Modified: {formatDate(new Date(project.updatedAt))}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Activity */}
        <Card className="p-4 hover:shadow-lg transition-shadow animate-fade-in [animation-delay:100ms]">
          <h2 className="text-lg font-semibold mb-4">Current Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="font-medium">{brandLabelFromAny(currentTool)}</span>
            </div>
            <div>
              <p className="text-gray-600 mb-4">Current task description will appear here</p>
              <Progress value={60} className="mb-4" />
            </div>
            <Button 
              onClick={handleSwitchTool}
              className="w-full hover:bg-primary/10 transition-colors"
              disabled={isSwitchingTool}
            >
              {isSwitchingTool ? 'Switching...' : 'Switch Tool'}
            </Button>
          </div>
        </Card>

        {/* Tool History */}
        <Card className="p-4 hover:shadow-lg transition-shadow animate-fade-in [animation-delay:200ms]">
          <h2 className="text-lg font-semibold mb-4">Tool History</h2>
          <div className="space-y-4">
            {activityHistory.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No activity history yet
              </div>
            ) : (
              activityHistory.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'tool_switch' ? 'bg-blue-500' : 
                    activity.type === 'task_complete' ? 'bg-green-500' : 
                    activity.type === 'context_sync' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {formatActivityTitle(activity)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimestamp(activity.createdAt)}
                    </div>
                    {activity.details && (
                      <div className="text-sm text-gray-600 mt-1">
                        {activity.details}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Workspace Button */}
      <div className="mt-6 animate-fade-in [animation-delay:300ms]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Development Workspace</h2>
          <Button
            onClick={() => router.push(`/dashboard/projects/${projectId}/workspace`)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Zap className="mr-2 h-4 w-4" />
            Open Workspace
          </Button>
        </div>
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">Integrated Development Environment</h3>
              <p className="text-gray-600 text-sm mb-3">
                Use all your AI coding modules in one place. Switch between DevFlowHub Editor, DevFlowHub Sandbox, DevFlowHub UI Studio, and DevFlowHub Deployer seamlessly without leaving DevFlowHub.
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>✨ No more redirects</span>
                <span>•</span>
                <span>🔄 Real-time sync</span>
                <span>•</span>
                <span>📊 Usage tracking</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tools Panel */}
      <div className="mt-6 animate-fade-in [animation-delay:300ms]">
        <h2 className="text-lg font-semibold mb-4">Quick Access Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {['editor', 'ui-studio', 'deployer', 'sandbox'].map(toolKey => (
            <ToolCard
              key={toolKey}
              tool={toolKey}
              isConnected={toolKey === currentTool}
            />
          ))}
        </div>
      </div>


      {/* Tool Switch Modal */}
      <ToolSwitchModal
        isOpen={isToolModalOpen}
        onClose={() => setIsToolModalOpen(false)}
        availableTools={availableTools}
        currentTool={currentTool}
        onToolSelect={handleToolSelect}
        isLoading={isSwitchingTool}
      />
    </div>
  )
}

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  console.log('🔍 ProjectDetailsPage params:', params)
  console.log('🔍 ProjectDetailsPage params.id:', params.id)
  
  return (
    <ProjectContextProvider projectId={params.id}>
      <ProjectDetailsContent projectId={params.id} />
    </ProjectContextProvider>
  )
} 