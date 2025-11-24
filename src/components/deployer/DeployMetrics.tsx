'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Zap
} from 'lucide-react'

interface DeployMetrics {
  totalDeploys: number
  successfulDeploys: number
  failedDeploys: number
  averageBuildTime: number
  totalCost: number
  lastDeployAt?: string
}

interface DeployQuota {
  plan: string
  monthlyDeploys: {
    limit: number
    used: number
    remaining: number
  }
  environments: string[]
  features: {
    preview: boolean
    staging: boolean
    production: boolean
    rollback: boolean
    logs: boolean
    customDomains: boolean
  }
}

interface DeployMetricsProps {
  projectId: string
  metrics: DeployMetrics | null
  quota: DeployQuota | null
  onRefresh: () => void
}

export function DeployMetrics({ projectId, metrics, quota, onRefresh }: DeployMetricsProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getSuccessRate = () => {
    if (!metrics || metrics.totalDeploys === 0) return 0
    return Math.round((metrics.successfulDeploys / metrics.totalDeploys) * 100)
  }

  const getQuotaUsagePercentage = () => {
    if (!quota) return 0
    return Math.round((quota.monthlyDeploys.used / quota.monthlyDeploys.limit) * 100)
  }

  const getQuotaColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (!metrics || !quota) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Metrics Available</h3>
          <p className="text-slate-600 mb-4">
            Deployment metrics will appear here once you start deploying.
          </p>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Deployment Metrics</h2>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Deployments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <Zap className="h-4 w-4 text-blue-600" />
                <span>Total Deployments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.totalDeploys}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                All time deployments
              </p>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Success Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {getSuccessRate()}%
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {metrics.successfulDeploys} successful
              </p>
            </CardContent>
          </Card>

          {/* Average Build Time */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>Avg Build Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatDuration(metrics.averageBuildTime)}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Average deployment time
              </p>
            </CardContent>
          </Card>

          {/* Total Cost */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Total Cost</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ${metrics.totalCost.toFixed(2)}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                All time spending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Deployment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Deployment Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Successful</span>
                  </div>
                  <span className="font-semibold">{metrics.successfulDeploys}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Failed</span>
                  </div>
                  <span className="font-semibold">{metrics.failedDeploys}</span>
                </div>
                
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${getSuccessRate()}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Deployment */}
          <Card>
            <CardHeader>
              <CardTitle>Last Deployment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  {formatDate(metrics.lastDeployAt)}
                </span>
              </div>
              {!metrics.lastDeployAt && (
                <p className="text-slate-500 text-sm mt-2">No deployments yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Quota */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Monthly Usage</span>
              <Badge variant="outline" className="capitalize">
                {quota.plan} Plan
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Deployments used</span>
                <span className="font-semibold">
                  {quota.monthlyDeploys.used} / {quota.monthlyDeploys.limit}
                </span>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getQuotaColor(getQuotaUsagePercentage())}`}
                  style={{ width: `${getQuotaUsagePercentage()}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Remaining</span>
                <span className="font-semibold">{quota.monthlyDeploys.remaining}</span>
              </div>
              
              {quota.monthlyDeploys.remaining <= 2 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      {quota.monthlyDeploys.remaining === 0 
                        ? 'Monthly quota reached. Upgrade your plan for more deployments.'
                        : `Only ${quota.monthlyDeploys.remaining} deployment${quota.monthlyDeploys.remaining === 1 ? '' : 's'} remaining this month.`
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Features */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Available Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(quota.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center space-x-2">
                  {enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
