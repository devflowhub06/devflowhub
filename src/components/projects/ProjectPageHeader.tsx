'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Code, 
  Palette, 
  Play, 
  Rocket, 
  Brain, 
  GitBranch, 
  Settings,
  Activity,
  Clock,
  Users,
  Zap
} from 'lucide-react'

interface ProjectData {
  id: string
  name: string
  description: string
  status: 'active' | 'provisioning' | 'failed'
  language: string
  framework: string
  createdAt: string
  lastModified: string
  activeTool: string
  context: {
    files: any[]
    sandboxUrl?: string
    git: {
      branch: string
      connected: boolean
    }
    ai: {
      indexed: boolean
      lastIndexed: string
    }
    deployment: {
      status: string
      url?: string
    }
  }
}

interface ProjectPageHeaderProps {
  projectId: string
  project: ProjectData
  onToolSwitch: (tool: string) => void
}

const toolOptions = [
  {
    id: 'editor',
    name: 'DevFlowHub Editor',
    icon: Code,
    description: 'Write and edit code with AI assistance',
    color: 'bg-blue-500',
    status: 'active'
  },
  {
    id: 'ui-studio',
    name: 'DevFlowHub UI Studio',
    icon: Palette,
    description: 'Design and prototype user interfaces',
    color: 'bg-purple-500',
    status: 'active'
  },
  {
    id: 'sandbox',
    name: 'DevFlowHub Sandbox',
    icon: Play,
    description: 'Run and test your code in a live environment',
    color: 'bg-green-500',
    status: project => project.context.sandboxUrl ? 'active' : 'inactive'
  },
  {
    id: 'deployer',
    name: 'DevFlowHub Deployer',
    icon: Rocket,
    description: 'Deploy your application to production',
    color: 'bg-orange-500',
    status: project => project.context.deployment.status === 'deployed' ? 'active' : 'inactive'
  },
  {
    id: 'assistant',
    name: 'AI Assistant',
    icon: Brain,
    description: 'Get AI help',
    color: 'bg-indigo-500',
    status: project => project.context.ai.indexed ? 'active' : 'inactive'
  },
  {
    id: 'git',
    name: 'Git',
    icon: GitBranch,
    description: 'Version control',
    color: 'bg-gray-500',
    status: project => project.context.git.connected ? 'active' : 'inactive'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    description: 'Configure project',
    color: 'bg-slate-500',
    status: 'active'
  }
]

export function ProjectPageHeader({ projectId, project, onToolSwitch }: ProjectPageHeaderProps) {
  const router = useRouter()
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    setLastSync(new Date())
  }, [project])

  const handleToolSwitch = (toolId: string) => {
    onToolSwitch(toolId)
    // Map tool IDs to module names for DevFlowHub rebranding
    const toolToModule: Record<string, string> = {
      'editor': 'editor',
      'cursor': 'editor',
      'sandbox': 'sandbox',
      'replit': 'sandbox',
      'ui-studio': 'ui_studio',
      'v0': 'ui_studio',
      'deployer': 'deployer',
      'bolt': 'deployer'
    }
    const module = toolToModule[toolId] || 'editor'
    router.push(`/dashboard/projects/${projectId}/workspace?module=${module}`)
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLastSync(new Date())
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const getToolStatus = (tool: any) => {
    if (typeof tool.status === 'function') {
      return tool.status(project)
    }
    return tool.status
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
            {project.status}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isSyncing ? 'Syncing...' : 'Sync'}
          </Button>
          {lastSync && (
            <span className="text-sm text-gray-500">
              Last sync: {lastSync.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Files</span>
            </div>
            <div className="text-2xl font-bold">{project.context.files.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Branch</span>
            </div>
            <div className="text-2xl font-bold">{project.context.git.branch}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Last Modified</span>
            </div>
            <div className="text-sm font-bold">
              {new Date(project.lastModified).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Status</span>
            </div>
            <div className="text-sm font-bold capitalize">{project.status}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tool Navigation */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">DevFlowHub Workspaces</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {toolOptions.map((tool) => {
              const Icon = tool.icon
              const status = getToolStatus(tool)
              const isActive = project.activeTool === tool.id
              
              return (
                <Button
                  key={tool.id}
                  variant={isActive ? 'default' : 'outline'}
                  className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                    isActive ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleToolSwitch(tool.id)}
                >
                  <div className={`p-2 rounded-lg ${tool.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{tool.name}</div>
                    <div className="text-xs text-gray-500">{tool.description}</div>
                    <Badge 
                      variant={status === 'active' ? 'default' : 'secondary'}
                      className="text-xs mt-1"
                    >
                      {status}
                    </Badge>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/projects/${projectId}/workspace?module=editor`)}
        >
          <Code className="h-4 w-4 mr-2" />
          Open Editor
        </Button>
        
        {project.context.sandboxUrl && (
          <Button
            variant="outline"
            onClick={() => window.open(project.context.sandboxUrl, '_blank')}
          >
            <Play className="h-4 w-4 mr-2" />
            Open Sandbox
          </Button>
        )}
        
        {project.context.deployment.url && (
          <Button
            variant="outline"
            onClick={() => window.open(project.context.deployment.url, '_blank')}
          >
            <Rocket className="h-4 w-4 mr-2" />
            View Deployment
          </Button>
        )}
      </div>
    </div>
  )
}
