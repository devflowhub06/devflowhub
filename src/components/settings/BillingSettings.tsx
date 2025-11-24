'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { 
  CreditCard, 
  Download, 
  TrendingUp, 
  Zap, 
  Eye, 
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface BillingSettingsProps {
  user: {
    id: string
    name: string
    email: string
    image: string
    bio: string
    plan: string
    twoFactorEnabled: boolean
    createdAt: string
  } | null
  billingUsage: {
    aiTokensUsed: number
    previewMinutes: number
    sandboxesStarted: number
    deployments: number
    storageBytes: number
    cost: number
  } | null
  onUpdate: () => void
}

export function BillingSettings({ user, billingUsage, onUpdate }: BillingSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getPlanLimits = (plan: string) => {
    const limits = {
      free: {
        aiTokens: 10000,
        previewMinutes: 60,
        sandboxes: 5,
        deployments: 3,
        storageGB: 1,
        price: 0
      },
      pro: {
        aiTokens: 100000,
        previewMinutes: 600,
        sandboxes: 50,
        deployments: 30,
        storageGB: 10,
        price: 29
      },
      team: {
        aiTokens: 500000,
        previewMinutes: 3000,
        sandboxes: 250,
        deployments: 150,
        storageGB: 50,
        price: 99
      },
      enterprise: {
        aiTokens: -1,
        previewMinutes: -1,
        sandboxes: -1,
        deployments: -1,
        storageGB: -1,
        price: 299
      }
    }
    return limits[plan as keyof typeof limits] || limits.free
  }

  const limits = getPlanLimits(user.plan)
  const isUnlimited = (value: number) => value === -1

  const getUsagePercentage = (used: number, limit: number) => {
    if (isUnlimited(limit)) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatStorage = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(2)} GB`
  }

  const upgradePlan = async (newPlan: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: newPlan }),
      })

      if (response.ok) {
        toast.success(`Upgraded to ${newPlan} plan`)
        onUpdate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upgrade plan')
      }
    } catch (error) {
      console.error('Error upgrading plan:', error)
      toast.error('Failed to upgrade plan')
    } finally {
      setIsLoading(false)
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Perfect for getting started',
      features: ['10K AI tokens', '60 preview minutes', '5 sandboxes', '3 deployments', '1GB storage']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      description: 'For individual developers',
      features: ['100K AI tokens', '600 preview minutes', '50 sandboxes', '30 deployments', '10GB storage']
    },
    {
      id: 'team',
      name: 'Team',
      price: 99,
      description: 'For growing teams',
      features: ['500K AI tokens', '3000 preview minutes', '250 sandboxes', '150 deployments', '50GB storage']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      description: 'For large organizations',
      features: ['Unlimited tokens', 'Unlimited preview', 'Unlimited sandboxes', 'Unlimited deployments', 'Unlimited storage']
    }
  ]

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your current subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{plans.find(p => p.id === user.plan)?.name}</h3>
                <Badge variant={user.plan === 'free' ? 'secondary' : 'default'}>
                  ${plans.find(p => p.id === user.plan)?.price}/month
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {plans.find(p => p.id === user.plan)?.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Next billing date
              </p>
              <p className="font-medium">
                {new Date(new Date(user.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage This Month
          </CardTitle>
          <CardDescription>
            Track your current usage against plan limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Tokens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">AI Tokens</Label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {billingUsage.aiTokensUsed.toLocaleString()} / {isUnlimited(limits.aiTokens) ? '∞' : limits.aiTokens.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(billingUsage.aiTokensUsed, limits.aiTokens)} 
              className="h-2"
            />
            {getUsagePercentage(billingUsage.aiTokensUsed, limits.aiTokens) > 80 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Approaching limit
              </p>
            )}
          </div>

          {/* Preview Minutes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Preview Minutes</Label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {billingUsage.previewMinutes} / {isUnlimited(limits.previewMinutes) ? '∞' : limits.previewMinutes}
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(billingUsage.previewMinutes, limits.previewMinutes)} 
              className="h-2"
            />
          </div>

          {/* Sandboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Sandboxes Started</Label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {billingUsage.sandboxesStarted} / {isUnlimited(limits.sandboxes) ? '∞' : limits.sandboxes}
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(billingUsage.sandboxesStarted, limits.sandboxes)} 
              className="h-2"
            />
          </div>

          {/* Deployments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Deployments</Label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {billingUsage.deployments} / {isUnlimited(limits.deployments) ? '∞' : limits.deployments}
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(billingUsage.deployments, limits.deployments)} 
              className="h-2"
            />
          </div>

          {/* Storage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Storage Used</Label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatStorage(billingUsage.storageBytes)} / {isUnlimited(limits.storageGB) ? '∞' : `${limits.storageGB} GB`}
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(billingUsage.storageBytes / (1024 * 1024 * 1024), limits.storageGB)} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 border rounded-lg ${
                  plan.id === user.plan 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {plan.description}
                  </p>
                </div>

                <ul className="mt-6 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {plan.id === user.plan ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.id === 'pro' ? 'default' : 'outline'}
                      onClick={() => upgradePlan(plan.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Upgrading...' : 'Upgrade'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">October 2024</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {plans.find(p => p.id === user.plan)?.name} Plan
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  ${plans.find(p => p.id === user.plan)?.price}
                </span>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">September 2024</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {plans.find(p => p.id === user.plan)?.name} Plan
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  ${plans.find(p => p.id === user.plan)?.price}
                </span>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-8 w-8 text-gray-400" />
              <div>
                <p className="font-medium">No payment method</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add a payment method to upgrade your plan
                </p>
              </div>
            </div>
            <Button variant="outline">
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
