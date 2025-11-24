'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  Code, 
  Zap, 
  Clock, 
  DollarSign,
  Activity,
  Target
} from 'lucide-react'

interface ProjectMetrics {
  projectsCreated: number
  templatesUsed: Record<string, number>
  timeToPreview: number[]
  firstDeployConversion: number
  assistantUsage: {
    tokensUsed: number
    requestsCount: number
    acceptanceRate: number
  }
  provisioningFailures: Record<string, number>
}

interface ConversionFunnel {
  create: number
  preview: number
  deploy: number
  conversionRates: {
    createToPreview: number
    previewToDeploy: number
    createToDeploy: number
  }
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null)
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
        setConversionFunnel(data.conversionFunnel)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No metrics data available</p>
        </CardContent>
      </Card>
    )
  }

  const avgTimeToPreview = metrics.timeToPreview.length > 0 
    ? metrics.timeToPreview.reduce((a, b) => a + b, 0) / metrics.timeToPreview.length 
    : 0

  const totalTemplatesUsed = Object.values(metrics.templatesUsed).reduce((a, b) => a + b, 0)
  const topTemplate = Object.entries(metrics.templatesUsed).sort(([,a], [,b]) => b - a)[0]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Projects Created */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Created</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.projectsCreated}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        {/* Templates Used */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Used</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTemplatesUsed}</div>
            <p className="text-xs text-muted-foreground">
              {topTemplate ? `Top: ${topTemplate[0]}` : 'No templates used'}
            </p>
          </CardContent>
        </Card>

        {/* Average Time to Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Preview</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(avgTimeToPreview)}</div>
            <p className="text-xs text-muted-foreground">
              Target: &lt;5 minutes
            </p>
          </CardContent>
        </Card>

        {/* First Deploy Conversion */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deploy Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.firstDeployConversion}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.projectsCreated > 0 
                ? `${((metrics.firstDeployConversion / metrics.projectsCreated) * 100).toFixed(1)}% rate`
                : 'No projects yet'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      {conversionFunnel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Conversion Funnel
            </CardTitle>
            <CardDescription>
              Track user journey from project creation to deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{conversionFunnel.create}</div>
                  <div className="text-sm text-gray-600">Projects Created</div>
                  <div className="text-xs text-gray-500">100%</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{conversionFunnel.preview}</div>
                  <div className="text-sm text-gray-600">With Preview</div>
                  <div className="text-xs text-gray-500">
                    {conversionFunnel.conversionRates.createToPreview.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{conversionFunnel.deploy}</div>
                  <div className="text-sm text-gray-600">First Deploy</div>
                  <div className="text-xs text-gray-500">
                    {conversionFunnel.conversionRates.createToDeploy.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Create → Preview</span>
                  <span>{conversionFunnel.conversionRates.createToPreview.toFixed(1)}%</span>
                </div>
                <Progress value={conversionFunnel.conversionRates.createToPreview} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Preview → Deploy</span>
                  <span>{conversionFunnel.conversionRates.previewToDeploy.toFixed(1)}%</span>
                </div>
                <Progress value={conversionFunnel.conversionRates.previewToDeploy} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assistant Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              AI Assistant Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{metrics.assistantUsage.requestsCount}</div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{metrics.assistantUsage.acceptanceRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Acceptance Rate</div>
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold">{metrics.assistantUsage.tokensUsed.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Tokens Used</div>
            </div>
          </CardContent>
        </Card>

        {/* Template Popularity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Popular Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.templatesUsed)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([templateId, count]) => (
                  <div key={templateId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{templateId}</Badge>
                    </div>
                    <div className="text-sm font-medium">{count} uses</div>
                  </div>
                ))}
              {Object.keys(metrics.templatesUsed).length === 0 && (
                <p className="text-sm text-gray-500 text-center">No templates used yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provisioning Failures */}
      {Object.keys(metrics.provisioningFailures).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Provisioning Issues
            </CardTitle>
            <CardDescription>
              Track common failure points in project provisioning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.provisioningFailures).map(([step, count]) => (
                <div key={step} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{step}</Badge>
                  </div>
                  <div className="text-sm font-medium">{count} failures</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
