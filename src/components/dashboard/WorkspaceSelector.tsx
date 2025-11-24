'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Code, Palette, Play, Rocket, Brain, GitBranch, Settings } from 'lucide-react'

interface WorkspaceSelectorProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
}

const workspaceOptions = [
  {
    id: 'editor',
    name: 'DevFlowHub Editor',
    description: 'Write and edit code with AI assistance',
    icon: Code,
    color: 'bg-blue-500',
    href: (projectId: string) => `/dashboard/projects/${projectId}/workspace?module=editor`
  },
  {
    id: 'ui-studio',
    name: 'DevFlowHub UI Studio',
    description: 'Design and prototype user interfaces',
    icon: Palette,
    color: 'bg-purple-500',
    href: (projectId: string) => `/dashboard/projects/${projectId}/workspace?module=ui_studio`
  },
  {
    id: 'sandbox',
    name: 'DevFlowHub Sandbox',
    description: 'Run and test your code in a live environment',
    icon: Play,
    color: 'bg-green-500',
    href: (projectId: string) => `/dashboard/projects/${projectId}/workspace?module=sandbox`
  },
  {
    id: 'deployer',
    name: 'DevFlowHub Deployer',
    description: 'Deploy your application to production',
    icon: Rocket,
    color: 'bg-orange-500',
    href: (projectId: string) => `/dashboard/projects/${projectId}/workspace?module=deployer`
  },
  {
    id: 'assistant',
    name: 'AI Assistant',
    description: 'Get help with your project using AI',
    icon: Brain,
    color: 'bg-indigo-500',
    href: (projectId: string) => `/dashboard/projects/${projectId}/workspace?tool=assistant`
  },
  {
    id: 'git',
    name: 'Git',
    description: 'Manage version control and collaboration',
    icon: GitBranch,
    color: 'bg-gray-500',
    href: (projectId: string) => `/dashboard/projects/${projectId}/workspace?tool=git`
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configure project settings and integrations',
    icon: Settings,
    color: 'bg-slate-500',
    href: (projectId: string) => `/dashboard/projects/${projectId}/workspace?tool=settings`
  }
]

export function WorkspaceSelector({ isOpen, onClose, projectId, projectName }: WorkspaceSelectorProps) {
  const router = useRouter()
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)

  const handleWorkspaceSelect = (workspaceId: string) => {
    setSelectedWorkspace(workspaceId)
    const workspace = workspaceOptions.find(w => w.id === workspaceId)
    if (workspace) {
      const href = workspace.href(projectId)
      console.log('Navigating to workspace:', href)
      router.push(href)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect to DevFlowHub Workspaces</DialogTitle>
          <DialogDescription>
            Select a workspace to work on <strong>{projectName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {workspaceOptions.map((workspace) => {
            const Icon = workspace.icon
            return (
              <Card
                key={workspace.id}
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
                  selectedWorkspace === workspace.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleWorkspaceSelect(workspace.id)}
              >
                <CardHeader className="pb-3">
                  <div className={`p-3 rounded-lg ${workspace.color} text-white w-fit`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{workspace.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {workspace.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (selectedWorkspace) {
                handleWorkspaceSelect(selectedWorkspace)
              }
            }}
            disabled={!selectedWorkspace}
          >
            Open Workspace
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
