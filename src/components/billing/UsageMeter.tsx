'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Zap, 
  Eye, 
  Play, 
  Rocket, 
  AlertTriangle, 
  Crown,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface UsageData {
  plan: {
    name: string
    displayName: string
    limits: {
      aiTokens: number
      previewMinutes: number
      sandboxRuns: number
      deployments: number
    }
    isTrial?: boolean
    trialDaysRemaining?: number | null
    paymentStatus: string
  }
  usage: {
    aiTokens: number
    previewMinutes: number
    sandboxRuns: number
    deployments: number
    period: string
  }
  usagePercentage: {
    aiTokens: number
    previewMinutes: number
    sandboxRuns: number
    deployments: number
  }
  exceeded: boolean
  canUpgrade: boolean
}

export function UsageMeter() {
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadUsageData()
    // Refresh every 30 seconds
    const interval = setInterval(loadUsageData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadUsageData = async () => {
    try {
      const response = await fetch('/api/usage/limits')
      if (response.ok) {
        const data = await response.json()
        setUsageData(data)
      }
    } catch (error) {
      console.error('Error loading usage data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-orange-500'
    return 'bg-accent-warn'
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

  if (!usageData) {
    return null
  }

  const { plan, usage, usagePercentage, exceeded, canUpgrade } = usageData

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Zap className="h-4 w-4 text-accent-warn" />
              <span>Usage This Month</span>
              {plan.isTrial && plan.trialDaysRemaining && (
                <span className="text-xs font-normal text-accent-warn">
                  (Trial: {plan.trialDaysRemaining} days left)
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {plan.displayName} Plan • Resets on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </CardDescription>
          </div>
          {canUpgrade && (
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
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Tokens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5">
              <Zap className="h-3.5 w-3.5 text-accent-warn" />
              <span className="text-slate-300">AI Tokens</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${exceeded && usagePercentage.aiTokens >= 100 ? 'text-red-400' : 'text-slate-300'}`}>
                {formatNumber(usage.aiTokens)}
              </span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-500">
                {plan.limits.aiTokens === -1 ? '∞' : formatNumber(plan.limits.aiTokens)}
              </span>
            </div>
          </div>
          <Progress 
            value={Math.min(usagePercentage.aiTokens, 100)} 
            className="h-1.5 bg-slate-700"
          />
          {usagePercentage.aiTokens >= 90 && (
            <p className="text-xs text-orange-400 flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3" />
              <span>
                {usagePercentage.aiTokens >= 100 
                  ? 'Limit reached. Upgrade for more tokens.'
                  : 'Approaching limit. Consider upgrading.'}
              </span>
            </p>
          )}
        </div>

        {/* Preview Minutes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5">
              <Eye className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-slate-300">Preview Time</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-300">
                {usage.previewMinutes}
              </span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-500">
                {plan.limits.previewMinutes === -1 ? '∞' : plan.limits.previewMinutes}
              </span>
              <span className="text-slate-500 text-xs">min</span>
            </div>
          </div>
          <Progress 
            value={Math.min(usagePercentage.previewMinutes, 100)} 
            className="h-1.5 bg-slate-700"
          />
        </div>

        {/* Sandbox Runs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5">
              <Play className="h-3.5 w-3.5 text-green-400" />
              <span className="text-slate-300">Sandbox Runs</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-300">
                {usage.sandboxRuns}
              </span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-500">
                {plan.limits.sandboxRuns === -1 ? '∞' : plan.limits.sandboxRuns}
              </span>
            </div>
          </div>
          <Progress 
            value={Math.min(usagePercentage.sandboxRuns, 100)} 
            className="h-1.5 bg-slate-700"
          />
        </div>

        {/* Deployments */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5">
              <Rocket className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-slate-300">Deployments</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-300">
                {usage.deployments}
              </span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-500">
                {plan.limits.deployments === -1 ? '∞' : plan.limits.deployments}
              </span>
            </div>
          </div>
          <Progress 
            value={Math.min(usagePercentage.deployments, 100)} 
            className="h-1.5 bg-slate-700"
          />
        </div>

        {/* Upgrade CTA if approaching limits */}
        {(usagePercentage.aiTokens >= 75 || exceeded) && canUpgrade && (
          <div className="pt-2 border-t border-slate-700">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-accent-warn hover:bg-accent-warn/90 text-white text-xs h-8"
              size="sm"
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Upgrade to Pro
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


