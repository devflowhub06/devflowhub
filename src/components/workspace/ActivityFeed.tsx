'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Code, 
  GitBranch, 
  Rocket, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
  Terminal
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityFeedProps {
  projectId: string
}

interface ProjectActivity {
  id: string
  type: string
  description: string
  metadata?: any
  createdAt: string
}

export function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ProjectActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadActivities()
    // Refresh every 30 seconds
    const interval = setInterval(loadActivities, 30000)
    return () => clearInterval(interval)
  }, [projectId])

  const loadActivities = async () => {
    try {
      if (activities.length === 0) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      const response = await fetch(`/api/projects/${projectId}/activities`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const getActivityIcon = (type: string) => {
    if (type.includes('session')) {
      return <Clock className="h-4 w-4 text-indigo-500" />
    }
    if (type.includes('deploy') || type.includes('deployment')) {
      return <Rocket className="h-4 w-4 text-orange-500" />
    }
    if (type.includes('git') || type.includes('commit') || type.includes('pr')) {
      return <GitBranch className="h-4 w-4 text-blue-500" />
    }
    if (type.includes('file') || type.includes('edit') || type.includes('save')) {
      return <FileText className="h-4 w-4 text-green-500" />
    }
    if (type.includes('docs') || type.includes('readme')) {
      return <FileText className="h-4 w-4 text-purple-500" />
    }
    if (type.includes('share')) {
      return <Code className="h-4 w-4 text-cyan-500" />
    }
    if (type.includes('terminal') || type.includes('command')) {
      return <Terminal className="h-4 w-4 text-yellow-500" />
    }
    return <Activity className="h-4 w-4 text-slate-400" />
  }

  const getActivityColor = (type: string) => {
    if (type.includes('session')) {
      return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    }
    if (type.includes('deploy') || type.includes('deployment')) {
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    }
    if (type.includes('git') || type.includes('commit') || type.includes('pr')) {
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
    if (type.includes('file') || type.includes('edit') || type.includes('save')) {
      return 'bg-green-500/10 text-green-500 border-green-500/20'
    }
    if (type.includes('docs') || type.includes('readme')) {
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    }
    if (type.includes('terminal') || type.includes('command')) {
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    }
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-accent-warn" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Activity Feed</span>
            </CardTitle>
            <CardDescription>
              Recent project events and activities
            </CardDescription>
          </div>
          <button
            onClick={loadActivities}
            disabled={isRefreshing}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activities yet</p>
            <p className="text-sm mt-2">Activities will appear here as you work on your project</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge
                      variant="outline"
                      className={getActivityColor(activity.type)}
                    >
                      {activity.type.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-200">{activity.description}</p>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-slate-400">
                      {activity.metadata.tool && (
                        <span className="mr-2">Tool: {activity.metadata.tool}</span>
                      )}
                      {activity.metadata.fileName && (
                        <span>File: {activity.metadata.fileName}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

