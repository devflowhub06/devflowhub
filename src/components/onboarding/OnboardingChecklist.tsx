'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  CheckCircle2, 
  Circle, 
  Crown, 
  ArrowRight,
  Sparkles,
  Rocket,
  Share2,
  GitBranch
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface ChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
  requiresUpgrade?: boolean
  upgradePlan?: 'pro' | 'enterprise'
  action?: () => void
}

export function OnboardingChecklist() {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadChecklist()
  }, [session])

  const loadChecklist = async () => {
    try {
      // Get user's plan and project count
      const [billingRes, projectsRes] = await Promise.all([
        fetch('/api/usage/limits'),
        fetch('/api/projects')
      ])

      const billingData = billingRes.ok ? await billingRes.json() : null
      const projectsData = projectsRes.ok ? await projectsRes.json() : null

      const plan = billingData?.plan?.name?.toLowerCase() || 'free'
      const projectCount = projectsData?.projects?.length || 0
      const isPro = plan === 'pro' || plan === 'enterprise'

      const checklistItems: ChecklistItem[] = [
        {
          id: 'create-project',
          title: 'Create your first project',
          description: 'Start building with DevFlowHub',
          completed: projectCount > 0,
          action: () => router.push('/dashboard/projects/new')
        },
        {
          id: 'use-ai-assistant',
          title: 'Try AI Assistant',
          description: 'Get help with your code using AI',
          completed: false, // Would need to track this
          action: () => router.push('/dashboard')
        },
        {
          id: 'deploy-project',
          title: 'Deploy a project',
          description: 'Share your work with the world',
          completed: false, // Would need to track this
          requiresUpgrade: !isPro,
          upgradePlan: 'pro',
          action: () => {
            if (isPro) {
              router.push('/dashboard')
            } else {
              router.push('/pricing')
            }
          }
        },
        {
          id: 'share-workspace',
          title: 'Share a workspace',
          description: 'Collaborate with your team',
          completed: false,
          requiresUpgrade: !isPro,
          upgradePlan: 'pro',
          action: () => {
            if (isPro) {
              router.push('/dashboard')
            } else {
              router.push('/pricing')
            }
          }
        },
        {
          id: 'connect-github',
          title: 'Connect GitHub',
          description: 'Link your repositories',
          completed: false,
          action: () => router.push('/dashboard/settings?tab=integrations')
        },
        {
          id: 'use-ai-refactor',
          title: 'Try AI Refactor',
          description: 'Let AI improve your code',
          completed: false,
          requiresUpgrade: !isPro,
          upgradePlan: 'pro',
          action: () => {
            if (isPro) {
              router.push('/dashboard')
            } else {
              router.push('/pricing')
            }
          }
        }
      ]

      setItems(checklistItems)
    } catch (error) {
      console.error('Error loading checklist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleItemClick = (item: ChecklistItem) => {
    if (item.action) {
      item.action()
    }
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-2 bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length
  const progress = (completedCount / totalCount) * 100

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Getting Started</CardTitle>
            <CardDescription className="text-xs mt-1">
              {completedCount} of {totalCount} completed
            </CardDescription>
          </div>
          {completedCount < totalCount && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleUpgrade}
              className="text-xs h-7 px-2 border-accent-warn/30 text-accent-warn hover:bg-accent-warn/10"
            >
              <Crown className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          )}
        </div>
        <div className="mt-3">
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-warn transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`flex items-start space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
              item.completed
                ? 'bg-green-500/10 border border-green-500/20'
                : item.requiresUpgrade
                ? 'bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15'
                : 'hover:bg-slate-700/50'
            }`}
          >
            <div className="mt-0.5">
              {item.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <Circle className="h-4 w-4 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-xs font-medium ${item.completed ? 'text-green-400' : 'text-slate-300'}`}>
                  {item.title}
                </p>
                {item.requiresUpgrade && !item.completed && (
                  <Crown className="h-3 w-3 text-accent-warn ml-2 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
              {item.requiresUpgrade && !item.completed && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpgrade()
                  }}
                  className="mt-1.5 h-6 text-xs text-accent-warn hover:text-accent-warn hover:bg-accent-warn/10 p-0"
                >
                  Upgrade to {item.upgradePlan === 'enterprise' ? 'Enterprise' : 'Pro'}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}


