'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Clock,
  BarChart3,
  Activity
} from 'lucide-react'
import { metricsTracker, type AssistantMetrics } from '@/lib/services/metrics-tracker'

export function AssistantMetrics() {
  const [metrics, setMetrics] = useState<AssistantMetrics>(metricsTracker.getMetrics())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      setMetrics(metricsTracker.getMetrics())
    }, 5000)

    setIsLoading(false)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>AI Assistant Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Proposals</p>
                <p className="text-2xl font-bold">{metrics.totalProposals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{metrics.approvedChanges}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{metrics.rejectedChanges}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold">{metrics.approvalRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Rate Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Approval Rate</span>
                <span className="text-sm font-medium">{metrics.approvalRate.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.approvalRate} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Files Per Change */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Complexity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Average Files per Change</p>
                  <p className="text-2xl font-bold">{metrics.averageFilesPerChange.toFixed(1)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Avg. Time to Decision</p>
                  <p className="text-lg font-semibold">{metrics.timeToApproval.toFixed(1)} min</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Type Distribution */}
      {metrics.mostCommonFileTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Common File Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.mostCommonFileTypes.map((fileType, index) => (
                <div key={fileType.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {fileType.type}
                    </Badge>
                    <span className="text-sm text-gray-600">{fileType.count} changes</span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(fileType.count / metrics.mostCommonFileTypes[0].count) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commit Message Analysis */}
      {metrics.averageCommitMessageLength > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Commit Message Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Average Commit Message Length</p>
                  <p className="text-lg font-semibold">{metrics.averageCommitMessageLength.toFixed(0)} characters</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Based on {metrics.approvedChanges} approved changes
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {metrics.totalProposals === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Assistant Activity Yet</h3>
            <p className="text-gray-600">
              Start using the AI Assistant to see metrics and insights about your development workflow.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
