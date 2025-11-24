'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { uiStudioClient, MetricsData } from '@/lib/ui-studio/client'
import { 
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  Target,
  Award,
  Activity,
  Users,
  Star
} from 'lucide-react'


interface MetricsPanelProps {
  projectId: string
}

export function MetricsPanel({ projectId }: MetricsPanelProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Load metrics data
  useEffect(() => {
    loadMetrics()
  }, [projectId, timeRange])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      const realMetrics = await uiStudioClient.getMetrics(projectId, timeRange)
      setMetrics(realMetrics)
    } catch (error) {
      console.error('Failed to load metrics:', error)
      // Fallback to mock data if API fails
      const mockMetrics: MetricsData = {
        totalGenerations: 0,
        successfulGenerations: 0,
        totalCost: 0,
        averageGenerationTime: 0,
        componentsInserted: 0,
        librarySize: 0,
        averageRating: 0,
        activeUsers: 0,
        topComponents: [],
        costBreakdown: {
          generation: 0,
          processing: 0,
          storage: 0
        },
        performanceMetrics: {
          averageResponseTime: 0,
          successRate: 0,
          userSatisfaction: 0
        }
      }
      setMetrics(mockMetrics)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) return null

  const successRate = (metrics.successfulGenerations / metrics.totalGenerations) * 100

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Analytics Dashboard</h3>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              size="sm"
              variant={timeRange === range ? "default" : "outline"}
              onClick={() => setTimeRange(range)}
              className="text-xs"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-slate-300">Generations</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.totalGenerations}</div>
            <div className="text-xs text-green-400 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% this month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">{successRate.toFixed(1)}%</div>
            <div className="text-xs text-green-400 flex items-center mt-1">
              <Award className="h-3 w-3 mr-1" />
              Excellent
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Total Cost</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">${metrics.totalCost}</div>
            <div className="text-xs text-slate-400 mt-1">
              ${(metrics.totalCost / metrics.totalGenerations).toFixed(3)} avg
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-slate-300">Avg Time</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.averageGenerationTime}s</div>
            <div className="text-xs text-blue-400 flex items-center mt-1">
              <Activity className="h-3 w-3 mr-1" />
              Fast
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Components */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-white text-sm">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>Top Components</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topComponents.map((component, index) => (
                <div key={component.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium">{component.name}</div>
                      <div className="text-xs text-slate-400">{component.downloads} downloads</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-slate-300">{component.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-white text-sm">
              <BarChart3 className="h-4 w-4 text-green-400" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Response Time</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-400 rounded-full" 
                      style={{ width: `${Math.min(100, (metrics.performanceMetrics.averageResponseTime / 15) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-300">{metrics.performanceMetrics.averageResponseTime}s</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Success Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 rounded-full" 
                      style={{ width: `${metrics.performanceMetrics.successRate}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-300">{metrics.performanceMetrics.successRate}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">User Satisfaction</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-400 rounded-full" 
                      style={{ width: `${metrics.performanceMetrics.userSatisfaction}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-300">{metrics.performanceMetrics.userSatisfaction}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white text-sm">
            <DollarSign className="h-4 w-4 text-yellow-400" />
            <span>Cost Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-white">${metrics.costBreakdown.generation}</div>
              <div className="text-xs text-slate-400">Generation</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">${metrics.costBreakdown.processing}</div>
              <div className="text-xs text-slate-400">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">${metrics.costBreakdown.storage}</div>
              <div className="text-xs text-slate-400">Storage</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{metrics.componentsInserted}</div>
          <div className="text-xs text-slate-400">Components Inserted</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{metrics.librarySize}</div>
          <div className="text-xs text-slate-400">Library Size</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{metrics.averageRating}</div>
          <div className="text-xs text-slate-400">Avg Rating</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{metrics.activeUsers}</div>
          <div className="text-xs text-slate-400">Active Users</div>
        </div>
      </div>
    </div>
  )
}
