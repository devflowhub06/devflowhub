'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Zap, 
  Terminal, 
  Code, 
  Palette, 
  Rocket,
  Bot,
  Users,
  FileText,
  Activity,
  Calendar,
  Filter,
  RefreshCw,
  Settings
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { AnalyticsKPI } from '@/components/analytics/AnalyticsKPI'
import { ConversionFunnel } from '@/components/analytics/ConversionFunnel'
import { ToolUsageChart } from '@/components/analytics/ToolUsageChart'
import { AIUsageStats } from '@/components/analytics/AIUsageStats'
import { SystemHealth } from '@/components/analytics/SystemHealth'
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics'

interface AnalyticsData {
  kpis: any
  conversion: any
  toolUsage: any
  aiUsage: any
  systemHealth: any
  templates: any
}

export default function AnalyticsPage() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState('7d')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    // Fetch analytics regardless of session status to show demo data
    fetchAnalytics()
  }, [timeRange])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchAnalytics()
    }, 60000) // Refresh every 60 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      
      const startDate = getStartDate(timeRange)
      const endDate = new Date().toISOString()
      
      // Fetch all analytics data in parallel
      const [kpisResponse, conversionResponse, toolUsageResponse, aiUsageResponse, systemHealthResponse, templatesResponse] = await Promise.all([
        fetch(`/api/v1/analytics/overview`, {
          credentials: 'include'
        }),
        fetch(`/api/v1/analytics/conversion`, {
          credentials: 'include'
        }),
        fetch(`/api/v1/analytics/tool-usage`, {
          credentials: 'include'
        }),
        fetch(`/api/v1/analytics/overview`, {
          credentials: 'include'
        }), // AI usage is in overview
        fetch(`/api/v1/analytics/system-health`, {
          credentials: 'include'
        }),
        fetch(`/api/v1/analytics/templates`, {
          credentials: 'include'
        })
      ])

      const [kpis, conversion, toolUsage, aiUsage, systemHealth, templates] = await Promise.all([
        kpisResponse.ok ? kpisResponse.json() : null,
        conversionResponse.ok ? conversionResponse.json() : null,
        toolUsageResponse.ok ? toolUsageResponse.json() : null,
        aiUsageResponse.ok ? aiUsageResponse.json() : null,
        systemHealthResponse.ok ? systemHealthResponse.json() : null,
        templatesResponse.ok ? templatesResponse.json() : null
      ])

      // Log any failed responses
      if (!kpisResponse.ok) console.error('KPIs API failed:', kpisResponse.status, kpisResponse.statusText)
      if (!conversionResponse.ok) console.error('Conversion API failed:', conversionResponse.status, conversionResponse.statusText)
      if (!toolUsageResponse.ok) console.error('Tool usage API failed:', toolUsageResponse.status, toolUsageResponse.statusText)
      if (!aiUsageResponse.ok) console.error('AI usage API failed:', aiUsageResponse.status, aiUsageResponse.statusText)
      if (!systemHealthResponse.ok) console.error('System health API failed:', systemHealthResponse.status, systemHealthResponse.statusText)
      if (!templatesResponse.ok) console.error('Templates API failed:', templatesResponse.status, templatesResponse.statusText)

      // Debug logging
      console.log('Analytics API responses:', {
        kpisResponse: { ok: kpisResponse.ok, status: kpisResponse.status },
        kpis: kpis,
        conversionResponse: { ok: conversionResponse.ok, status: conversionResponse.status },
        toolUsageResponse: { ok: toolUsageResponse.ok, status: toolUsageResponse.status },
        systemHealthResponse: { ok: systemHealthResponse.ok, status: systemHealthResponse.status },
        templatesResponse: { ok: templatesResponse.ok, status: templatesResponse.status }
      })

      const finalAnalyticsData = {
        kpis: kpis?.kpis || null,
        conversion: conversion?.funnel || null,
        toolUsage: toolUsage || null,
        aiUsage: aiUsage?.kpis?.aiAssistantUsage || null,
        systemHealth: systemHealth || null,
        templates: templates || null
      }

      console.log('Final analytics data:', finalAnalyticsData)
      setAnalyticsData(finalAnalyticsData)
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStartDate = (range: string) => {
    const now = new Date()
    switch (range) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '24h': return 'Last 24 Hours'
      case '7d': return 'Last 7 Days'
      case '30d': return 'Last 30 Days'
      case '90d': return 'Last 90 Days'
      default: return 'Last 7 Days'
    }
  }

  // Debug logging for render
  console.log('Analytics page render:', { 
    isLoading, 
    analyticsData, 
    hasKpis: analyticsData?.kpis ? 'yes' : 'no',
    kpisKeys: analyticsData?.kpis ? Object.keys(analyticsData.kpis) : 'none'
  })

  if (isLoading && !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Track your development workflow, tool usage, and AI interactions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <Button 
                onClick={() => setAutoRefresh(!autoRefresh)} 
                variant={autoRefresh ? "default" : "outline"} 
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Empty State */}
        {analyticsData && (!analyticsData.kpis || Object.keys(analyticsData.kpis).length === 0) && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Analytics Loading</h3>
              <p className="text-gray-600 mb-4">
                We're setting up your analytics dashboard with real project data...
              </p>
              <Button onClick={() => fetchAnalytics()}>
                Refresh Analytics
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Analytics Content */}
        {analyticsData && analyticsData.kpis && (
          <>
            {/* KPIs Section */}
            <div className="mb-8">
              <AnalyticsKPI data={analyticsData.kpis} isLoading={isLoading} />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Advanced</span>
                </TabsTrigger>
                <TabsTrigger value="conversion" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Conversion</span>
                </TabsTrigger>
                <TabsTrigger value="tools" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Tools</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <span>AI Usage</span>
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>System Health</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Activity feed coming soon</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Time Range</span>
                          <span className="text-sm font-medium">{getTimeRangeLabel()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Data Points</span>
                          <span className="text-sm font-medium">Real-time</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Auto-refresh</span>
                          <span className="text-sm font-medium">{autoRefresh ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Advanced Analytics Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <AdvancedAnalytics />
              </TabsContent>

              {/* Conversion Funnel Tab */}
              <TabsContent value="conversion" className="space-y-6">
                <ConversionFunnel data={analyticsData.conversion} isLoading={isLoading} />
              </TabsContent>

              {/* Tool Usage Tab */}
              <TabsContent value="tools" className="space-y-6">
                <ToolUsageChart data={analyticsData.toolUsage} isLoading={isLoading} />
              </TabsContent>

              {/* AI Usage Tab */}
              <TabsContent value="ai" className="space-y-6">
                <AIUsageStats data={analyticsData.aiUsage} isLoading={isLoading} />
              </TabsContent>

              {/* System Health Tab */}
              <TabsContent value="health" className="space-y-6">
                <SystemHealth data={analyticsData.systemHealth} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
} 