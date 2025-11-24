'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Users, 
  Code, 
  Zap, 
  Clock, 
  DollarSign,
  Activity,
  Target,
  Brain,
  GitBranch,
  Play,
  Rocket
} from 'lucide-react'

interface LiveStats {
  totalProjects: number
  templatesUsed: { [key: string]: number }
  timeToPreviewAvgMs: number
  firstDeployConversionRate: number
  assistantUsageCount: number
  provisioningFailureRate: number
  activeProjects: number
  totalUsers: number
  avgSessionTime: number
  conversionFunnel: {
    create: number
    preview: number
    deploy: number
  }
}

export function LiveDashboardStats() {
  const [stats, setStats] = useState<LiveStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/metrics')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setLastUpdated(new Date())
      } else {
        console.error('Failed to fetch metrics:', response.status, response.statusText)
        // Set default stats for unauthenticated users
        setStats({
          totalProjects: 0,
          templatesUsed: {},
          timeToPreviewAvgMs: 0,
          firstDeployConversionRate: 0,
          assistantUsageCount: 0,
          provisioningFailureRate: 0,
          activeProjects: 0,
          totalUsers: 0,
          avgSessionTime: 0,
          conversionFunnel: {
            create: 0,
            preview: 0,
            deploy: 0
          }
        })
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching live stats:', error)
      // Set default stats on error
      setStats({
        totalProjects: 0,
        templatesUsed: {},
        timeToPreviewAvgMs: 0,
        firstDeployConversionRate: 0,
        assistantUsageCount: 0,
        provisioningFailureRate: 0,
        activeProjects: 0,
        totalUsers: 0,
        avgSessionTime: 0,
        conversionFunnel: {
          create: 0,
          preview: 0,
          deploy: 0
        }
      })
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
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

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-gray-500 mb-2">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Loading dashboard statistics...</p>
          </div>
          <p className="text-sm text-gray-400">This may take a moment</p>
        </CardContent>
      </Card>
    )
  }

  const conversionRates = {
    createToPreview: stats.conversionFunnel.preview / stats.conversionFunnel.create * 100,
    previewToDeploy: stats.conversionFunnel.deploy / stats.conversionFunnel.preview * 100,
    createToDeploy: stats.conversionFunnel.deploy / stats.conversionFunnel.create * 100
  }

  return (
    <div className="space-y-6">
      {/* Header with last updated */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Dashboard Statistics</h2>
        {lastUpdated && (
          <Badge variant="outline" className="text-xs">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Code className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalProjects)}</div>
            <p className="text-xs text-blue-100">
              {stats.totalProjects === 0 ? 'Start building!' : 'Projects created'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time to Preview</CardTitle>
            <Clock className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.timeToPreviewAvgMs > 0 ? formatTime(stats.timeToPreviewAvgMs) : '--'}
            </div>
            <p className="text-xs text-green-100">
              {stats.timeToPreviewAvgMs > 0 ? 'First preview load' : 'Create a project to see'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deploy Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalProjects > 0 ? `${(stats.firstDeployConversionRate * 100).toFixed(1)}%` : '--'}
            </div>
            <p className="text-xs text-purple-100">
              {stats.totalProjects > 0 ? 'Users who deploy' : 'Deploy your first project'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Assistant Usage</CardTitle>
            <Brain className="h-4 w-4 text-yellow-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.assistantUsageCount)}</div>
            <p className="text-xs text-yellow-100">
              {stats.assistantUsageCount > 0 ? 'Total AI interactions' : 'Try the AI Assistant'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Create Project</span>
              <span className="text-sm text-gray-600">{formatNumber(stats.conversionFunnel.create)}</span>
            </div>
            <Progress value={100} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Preview Project</span>
              <span className="text-sm text-gray-600">
                {formatNumber(stats.conversionFunnel.preview)} ({conversionRates.createToPreview.toFixed(1)}%)
              </span>
            </div>
            <Progress value={conversionRates.createToPreview} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Deploy Project</span>
              <span className="text-sm text-gray-600">
                {formatNumber(stats.conversionFunnel.deploy)} ({conversionRates.createToDeploy.toFixed(1)}%)
              </span>
            </div>
            <Progress value={conversionRates.createToDeploy} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Template Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Template Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(stats.templatesUsed).length > 0 ? (
              Object.entries(stats.templatesUsed)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([templateName, count]) => (
                  <div key={templateName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{templateName}</span>
                    <Badge variant="secondary">{count} uses</Badge>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 col-span-full">No templates used yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {((1 - stats.provisioningFailureRate) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(stats.activeProjects)}
              </div>
              <p className="text-sm text-gray-600">Active Projects</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatTime(stats.avgSessionTime)}
              </div>
              <p className="text-sm text-gray-600">Avg Session Time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
