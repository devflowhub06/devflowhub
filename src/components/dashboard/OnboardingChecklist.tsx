'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { WorkspaceSelector } from './WorkspaceSelector'
import { toast } from 'sonner'

interface OnboardingProgress {
  id: string
  userId: string
  createdFirstProject: boolean
  connectedIntegration: boolean
  ranInSandbox: boolean
  deployedToStaging: boolean
  usedAssistant: boolean
  createdAt: string
  updatedAt: string
}

const onboardingSteps = [
  {
    id: 'createdFirstProject',
    title: 'Create your first project',
    description: 'Start building with a template or from scratch',
    action: 'Create Project',
    href: '/dashboard/projects/new',
    icon: Sparkles
  },
  {
    id: 'connectedIntegration',
    title: 'Connect to DevFlowHub Workspaces',
    description: 'Access DevFlowHub Editor, UI Studio, Sandbox, and Deployer',
    action: 'Open Workspaces',
    href: null, // Will be set dynamically based on user's project
    icon: CheckCircle
  },
  {
    id: 'ranInSandbox',
    title: 'Run project in DevFlowHub Sandbox',
    description: 'Test your code in our cloud environment',
    action: 'Open Sandbox',
    href: null, // Will be set dynamically
    icon: CheckCircle
  },
  {
    id: 'deployedToStaging',
    title: 'Deploy with DevFlowHub Deployer',
    description: 'Push your project to a staging environment',
    action: 'Deploy',
    href: null, // Will be set dynamically
    icon: CheckCircle
  },
  {
    id: 'usedAssistant',
    title: 'Use Assistant for one task',
    description: 'Get help from our AI-powered assistant',
    action: 'Try Assistant',
    href: null, // Will be set dynamically
    icon: CheckCircle
  }
]

export function OnboardingChecklist() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [firstProjectId, setFirstProjectId] = useState<string | null>(null)
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false)
  const [selectedProjectName, setSelectedProjectName] = useState<string>('')

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/onboarding')
      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      }
    } catch (error) {
      console.error('Error fetching onboarding progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const markStepComplete = async (stepId: string) => {
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepId })
      })
      
      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      }
    } catch (error) {
      console.error('Error updating onboarding progress:', error)
    }
  }

  const handleStepClick = async (step: typeof onboardingSteps[0]) => {
    try {
      if (step.href) {
        router.push(step.href)
      } else {
        // Handle dynamic steps based on project context
        switch (step.id) {
          case 'connectedIntegration':
            // Open workspaces for the first project
            await openWorkspacesForProject()
            break
          case 'ranInSandbox':
            // Open sandbox for the first project
            await openSandboxForProject()
            break
          case 'deployedToStaging':
            // Open deployer for the first project
            await openDeployerForProject()
            break
          case 'usedAssistant':
            // Open assistant for the first project
            await openAssistantForProject()
            break
          default:
            console.log(`Handle ${step.id} action`)
        }
      }
    } catch (error) {
      console.error('Error handling step click:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const openWorkspacesForProject = async () => {
    try {
      // Get user's first project
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        const projects = data.projects || []
        if (projects.length > 0) {
          const firstProject = projects[0]
          setFirstProjectId(firstProject.id)
          setSelectedProjectName(firstProject.name)
          setShowWorkspaceSelector(true)
          
          // Mark the step as completed
          await markStepComplete('connectedIntegration')
        } else {
          toast.info('Please create a project first.')
        }
      } else {
        toast.error('Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error opening workspaces:', error)
      toast.error('Failed to open workspaces')
    }
  }

  const openSandboxForProject = async () => {
    try {
      // Get user's first project
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        const projects = data.projects || []
        if (projects.length > 0) {
          const firstProject = projects[0]
          router.push(`/dashboard/projects/${firstProject.id}/workspace?module=sandbox`)
        }
      }
    } catch (error) {
      console.error('Error opening sandbox:', error)
    }
  }

  const openDeployerForProject = async () => {
    try {
      // Get user's first project
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        const projects = data.projects || []
        if (projects.length > 0) {
          const firstProject = projects[0]
          router.push(`/dashboard/projects/${firstProject.id}/workspace?module=deployer`)
        }
      }
    } catch (error) {
      console.error('Error opening deployer:', error)
    }
  }

  const openAssistantForProject = async () => {
    try {
      // Get user's first project
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        const projects = data.projects || []
        if (projects.length > 0) {
          const firstProject = projects[0]
          router.push(`/dashboard/projects/${firstProject.id}/workspace?tool=assistant`)
        }
      }
    } catch (error) {
      console.error('Error opening assistant:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded mb-2"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!progress) {
    return null
  }

  const completedSteps = [
    progress.createdFirstProject,
    progress.connectedIntegration,
    progress.ranInSandbox,
    progress.deployedToStaging,
    progress.usedAssistant
  ].filter(Boolean).length

  const totalSteps = onboardingSteps.length
  const progressPercentage = (completedSteps / totalSteps) * 100
  const isComplete = completedSteps === totalSteps

  if (isComplete) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                🎉 Onboarding Complete!
              </h3>
              <p className="text-green-600">
                You've successfully completed all onboarding steps. Welcome to DevFlowHub!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>Getting Started</span>
          </CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{completedSteps} of {totalSteps} completed</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onboardingSteps.map((step, index) => {
              const isCompleted = progress[step.id as keyof OnboardingProgress] as boolean
              const Icon = step.icon
              
              return (
                <div
                  key={step.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                    isCompleted 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${
                      isCompleted ? 'text-green-800' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h4>
                    <p className={`text-sm ${
                      isCompleted ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  
                  {!isCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStepClick(step)}
                      className="flex-shrink-0"
                    >
                      {step.action}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {showWorkspaceSelector && firstProjectId && (
        <WorkspaceSelector
          isOpen={showWorkspaceSelector}
          onClose={() => setShowWorkspaceSelector(false)}
          projectId={firstProjectId}
          projectName={selectedProjectName}
        />
      )}
    </>
  )
}