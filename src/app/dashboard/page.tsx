'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Plus, Brain, Menu } from 'lucide-react'
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist'
import { LiveDashboardStats } from '@/components/dashboard/LiveDashboardStats'
import { ConversationalAI } from '@/components/dashboard/ConversationalAI'
import { AuthDebugInfo } from '@/components/debug/AuthDebugInfo'
import { UsageMeter } from '@/components/billing/UsageMeter'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { ResponsiveContainer, ResponsiveGrid, ResponsiveFlex, ResponsiveStack, ResponsiveText } from '@/components/ui/responsive-container'
import { useSession } from 'next-auth/react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  path: string
  color: string
}

const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-6 w-6 ${props.className || ''}`}
    {...props}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 5 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.6 5a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 16 5a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19 8.6c.22.36.34.78.34 1.21 0 .43-.12.85-.34 1.21Z" />
  </svg>
)

const quickActions: QuickAction[] = [
  {
    id: '1',
    title: 'New Project',
    description: 'Start building your next big idea',
    icon: (
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    ),
    path: '/dashboard/projects/new',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  {
    id: '2',
    title: 'Projects',
    description: 'View and manage your projects',
    icon: (
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
    ),
    path: '/dashboard/projects',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600'
  },
  {
    id: '3',
    title: 'Analytics',
    description: 'Track your project metrics',
    icon: (
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
    ),
    path: '/dashboard/analytics',
    color: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
  },
  {
    id: '5',
    title: 'Upgrade',
    description: 'Get access to premium features',
    icon: (
      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>
    ),
    path: '/dashboard/upgrade',
    color: 'bg-gradient-to-br from-amber-500 to-yellow-500'
  },
  {
    id: '6',
    title: 'Settings',
    description: 'Configure your workspace',
    icon: (
      <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
        <SettingsIcon className="text-white" />
      </div>
    ),
    path: '/dashboard/settings',
    color: 'bg-gradient-to-br from-slate-500 to-slate-600'
  }
]

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

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [showConversationalAI, setShowConversationalAI] = useState(false)
  const [projectContext, setProjectContext] = useState<ProjectContext | undefined>(undefined)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)

  // Check if onboarding should be shown
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch('/api/onboarding')
        if (response.ok) {
          const data = await response.json()
          const progress = data.progress
          
          // Show onboarding modal if user hasn't created first project
          if (!progress?.createdFirstProject) {
            // Check if modal was already dismissed
            const dismissed = localStorage.getItem('onboarding-modal-dismissed')
            if (!dismissed) {
              setShowOnboardingModal(true)
            }
          }
        }
      } catch (error) {
        console.error('Error checking onboarding:', error)
      }
    }

    checkOnboarding()
  }, [session])

  // Fetch user's first project for AI context
  useEffect(() => {
    const fetchProjectContext = async () => {
      try {
        const response = await fetch('/api/projects', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          const projects = data.projects || []
          if (projects.length > 0) {
            const firstProject = projects[0]
            setProjectContext({
              id: firstProject.id,
              name: firstProject.name,
              language: firstProject.language || 'JavaScript',
              framework: firstProject.framework || 'React',
              files: [], // Would need to fetch files separately
              status: firstProject.status || 'active',
              lastModified: firstProject.updatedAt || firstProject.createdAt
            })
          }
        }
      } catch (error) {
        console.error('Error fetching project context:', error)
      }
    }

    fetchProjectContext()
  }, [])

  const handleOnboardingComplete = (templateId: string) => {
    setShowOnboardingModal(false)
    localStorage.setItem('onboarding-modal-dismissed', 'true')
  }

  const handleOnboardingClose = () => {
    setShowOnboardingModal(false)
    localStorage.setItem('onboarding-modal-dismissed', 'true')
  }

  return (
    <>
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
      />
      <ResponsiveContainer maxWidth="xl" padding="lg">
        <ResponsiveStack gap="xl">
        {/* Header Section */}
        <ResponsiveFlex 
          direction="row" 
          wrap={true}
          gap="md" 
          align="center" 
          justify="between"
          className="w-full"
        >
          <ResponsiveText size="2xl" weight="bold" className="flex-shrink-0">
            Welcome back
          </ResponsiveText>
          
          {/* Action Buttons */}
          <ResponsiveFlex 
            direction="row" 
            wrap={true}
            gap="sm" 
            align="center"
            className="flex-shrink-0"
          >
            <Button
              variant="outline"
              size="sm"
              className="touch-target text-fluid-sm whitespace-nowrap"
              onClick={() => setShowConversationalAI(true)}
            >
              <Brain className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="sm:hidden">AI</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="touch-target text-fluid-sm whitespace-nowrap"
              onClick={() => router.push('/dashboard/projects/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Quick Create</span>
              <span className="sm:hidden">Create</span>
            </Button>
            <Button 
              size="sm"
              className="touch-target text-fluid-sm whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white border-0"
              onClick={() => router.push('/dashboard/projects/new')}
            >
              <Zap className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </Button>
          </ResponsiveFlex>
        </ResponsiveFlex>

        {/* Debug Info */}
        <AuthDebugInfo />
        
        {/* Usage Meter and Onboarding */}
        <ResponsiveGrid columns="auto" gap="lg" className="w-full">
          <div className="w-full">
            <UsageMeter />
          </div>
          <div className="w-full">
            <OnboardingChecklist />
          </div>
        </ResponsiveGrid>
        
        {/* Live Dashboard Stats */}
        <div className="w-full">
          <LiveDashboardStats />
        </div>
        
        {/* Quick Actions Grid */}
        <div className="w-full">
          <ResponsiveGrid columns="auto" gap="lg">
            {quickActions.map((action) => (
              <Card
                key={action.id}
                className="group relative overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer touch-target-comfortable"
                onClick={() => router.push(action.path)}
              >
                <div className="p-fluid-4">
                  <ResponsiveFlex 
                    direction="row" 
                    gap="sm" 
                    align="start" 
                    justify="between"
                    className="mb-fluid-3"
                  >
                    <div className={`p-fluid-2 rounded-lg ${action.color} text-white flex-shrink-0`}>
                      {action.icon}
                    </div>
                    <ResponsiveText 
                      size="sm" 
                      color="secondary"
                      className="group-hover:text-foreground transition-colors flex-shrink-0"
                    >
                      <span className="hidden sm:inline">Click to open →</span>
                      <span className="sm:hidden">→</span>
                    </ResponsiveText>
                  </ResponsiveFlex>
                  
                  <ResponsiveStack gap="sm">
                    <ResponsiveText 
                      size="lg" 
                      weight="semibold"
                      className="group-hover:text-foreground transition-colors"
                    >
                      {action.title}
                    </ResponsiveText>
                    <ResponsiveText 
                      size="sm" 
                      color="secondary"
                      className="group-hover:text-muted-foreground transition-colors"
                    >
                      {action.description}
                    </ResponsiveText>
                  </ResponsiveStack>
                </div>
                
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${action.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200`} />
              </Card>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Modals */}
        <ConversationalAI
          isOpen={showConversationalAI}
          onClose={() => setShowConversationalAI(false)}
          projectContext={projectContext}
          onNavigateToTool={(tool, projectId) => {
            // Map tool names to module names for DevFlowHub rebranding
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
            const module = toolToModule[tool] || 'editor'
            router.push(`/dashboard/projects/${projectId}/workspace?module=${module}`)
          }}
        />
      </ResponsiveStack>
    </ResponsiveContainer>
    </>
  )
}