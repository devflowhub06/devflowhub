'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ResponsiveContainer, ResponsiveGrid, ResponsiveText } from '@/components/layout/ResponsiveContainer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  GitBranch,
  ExternalLink,
  Rocket,
  RotateCcw,
  Trash2,
  DollarSign,
  Clock,
  Activity,
  TrendingUp,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface PreviewEnvironment {
  id: string
  projectId: string
  branchName: string
  prNumber: number | null
  url: string
  status: string
  logs: any
  estimatedCost: number
  actualCost: number
  createdAt: string
  destroyedAt: string | null
  lastAccessedAt: string | null
  project?: {
    id: string
    name: string
  }
}

interface PreviewLogs {
  events: Array<{
    timestamp: string
    message: string
    level: string
  }>
}

export default function PreviewsPage() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const [previews, setPreviews] = useState<PreviewEnvironment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPreview, setSelectedPreview] = useState<PreviewEnvironment | null>(null)
  const [previewLogs, setPreviewLogs] = useState<any>(null)
  const [showLogsDialog, setShowLogsDialog] = useState(false)

  useEffect(() => {
    fetchPreviews()
  }, [])

  const fetchPreviews = async () => {
    try {
      setLoading(true)
      // Fetch all user's projects and their previews
      const projectsResponse = await fetch('/api/projects', {
        credentials: 'include',
      })

      if (!projectsResponse.ok) {
        throw new Error('Failed to fetch projects')
      }

      const projectsData = await projectsResponse.json()
      const projects = projectsData.projects || []

      // Fetch previews for each project
      const allPreviews: PreviewEnvironment[] = []
      for (const project of projects) {
        const previewResponse = await fetch(`/api/preview/${project.id}`, {
          credentials: 'include',
        })

        if (previewResponse.ok) {
          const data = await previewResponse.json()
          const projectPreviews = data.previews.map((p: PreviewEnvironment) => ({
            ...p,
            project: { id: project.id, name: project.name },
          }))
          allPreviews.push(...projectPreviews)
        }
      }

      setPreviews(allPreviews)
    } catch (error) {
      console.error('Error fetching previews:', error)
      toast.error('Failed to load preview environments')
    } finally {
      setLoading(false)
    }
  }

  const viewLogs = async (preview: PreviewEnvironment) => {
    try {
      const response = await fetch(
        `/api/preview/${preview.projectId}/${preview.id}/logs`,
        {
          credentials: 'include',
        }
      )

      if (response.ok) {
        const data = await response.json()
        setPreviewLogs(data)
        setSelectedPreview(preview)
        setShowLogsDialog(true)
      } else {
        toast.error('Failed to fetch logs')
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Error loading logs')
    }
  }

  const promoteToStaging = async (preview: PreviewEnvironment) => {
    try {
      const response = await fetch(
        `/api/preview/${preview.projectId}/${preview.id}/promote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ environment: 'staging' }),
        }
      )

      if (response.ok) {
        toast.success('Promoting to staging...')
        fetchPreviews()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to promote')
      }
    } catch (error) {
      console.error('Error promoting:', error)
      toast.error('Error promoting to staging')
    }
  }

  const destroyPreview = async (preview: PreviewEnvironment) => {
    if (!confirm('Are you sure you want to destroy this preview environment?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/preview/${preview.projectId}/${preview.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      if (response.ok) {
        toast.success('Preview environment destroyed')
        fetchPreviews()
      } else {
        toast.error('Failed to destroy preview')
      }
    } catch (error) {
      console.error('Error destroying preview:', error)
      toast.error('Error destroying preview')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'provisioning':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'provisioning':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalCost = previews.reduce((sum, p) => sum + (p.actualCost || 0), 0)
  const activePreviews = previews.filter((p) => p.status === 'active').length

  if (loading) {
    return (
      <ResponsiveContainer maxWidth="4xl">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer maxWidth="4xl" padding="responsive">
      {/* Header */}
      <div className="mb-responsive">
        <ResponsiveText size="3xl" className="font-bold text-gray-900 dark:text-white">
          Preview Environments
        </ResponsiveText>
        <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400 mt-2">
          Ephemeral preview URLs for every branch and pull request
        </ResponsiveText>
      </div>

      {/* Stats Cards */}
      <ResponsiveGrid cols="auto" gap="responsive" className="mb-responsive">
        <Card className="card-responsive">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <GitBranch className="icon-responsive-md text-blue-600" />
            </div>
            <div>
              <ResponsiveText size="xs" className="text-gray-500">
                Total Previews
              </ResponsiveText>
              <ResponsiveText size="2xl" className="font-bold text-gray-900">
                {previews.length}
              </ResponsiveText>
            </div>
          </div>
        </Card>

        <Card className="card-responsive">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="icon-responsive-md text-green-600" />
            </div>
            <div>
              <ResponsiveText size="xs" className="text-gray-500">
                Active
              </ResponsiveText>
              <ResponsiveText size="2xl" className="font-bold text-gray-900">
                {activePreviews}
              </ResponsiveText>
            </div>
          </div>
        </Card>

        <Card className="card-responsive">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="icon-responsive-md text-purple-600" />
            </div>
            <div>
              <ResponsiveText size="xs" className="text-gray-500">
                Total Cost
              </ResponsiveText>
              <ResponsiveText size="2xl" className="font-bold text-gray-900">
                ${totalCost.toFixed(2)}
              </ResponsiveText>
            </div>
          </div>
        </Card>
      </ResponsiveGrid>

      {/* Previews List */}
      {previews.length === 0 ? (
        <Card className="card-responsive text-center">
          <div className="py-12">
            <GitBranch className="icon-responsive-xl mx-auto text-gray-400 mb-4" />
            <ResponsiveText size="xl" className="font-semibold text-gray-900 mb-2">
              No preview environments
            </ResponsiveText>
            <ResponsiveText size="sm" className="text-gray-600 mb-6">
              Create a preview environment to test changes before deploying
            </ResponsiveText>
          </div>
        </Card>
      ) : (
        <ResponsiveGrid cols="auto" gap="responsive">
          {previews.map((preview) => (
            <Card key={preview.id} className="card-responsive">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-responsive-lg flex items-center gap-2">
                      {getStatusIcon(preview.status)}
                      {preview.branchName}
                      {preview.prNumber && (
                        <Badge variant="outline" className="text-xs">
                          PR #{preview.prNumber}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-responsive-sm mt-1">
                      {preview.project?.name || 'Unknown Project'}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(preview.status)}>
                    {preview.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Preview URL */}
                  <div>
                    <ResponsiveText size="xs" className="text-gray-500 mb-1">
                      Preview URL
                    </ResponsiveText>
                    <a
                      href={preview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      {preview.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                      <ResponsiveText size="xs" className="text-gray-500">
                        Estimated Cost
                      </ResponsiveText>
                      <ResponsiveText size="lg" className="font-semibold text-green-600">
                        ${preview.estimatedCost.toFixed(2)}
                      </ResponsiveText>
                    </div>
                    <div>
                      <ResponsiveText size="xs" className="text-gray-500">
                        Actual Cost
                      </ResponsiveText>
                      <ResponsiveText size="lg" className="font-semibold">
                        ${preview.actualCost.toFixed(2)}
                      </ResponsiveText>
                    </div>
                    <div className="col-span-2">
                      <ResponsiveText size="xs" className="text-gray-500">
                        Created
                      </ResponsiveText>
                      <ResponsiveText size="sm" className="font-medium">
                        {new Date(preview.createdAt).toLocaleString()}
                      </ResponsiveText>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => viewLogs(preview)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Logs
                    </Button>
                    {preview.status === 'active' && (
                      <>
                        <Button
                          onClick={() => promoteToStaging(preview)}
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Rocket className="h-4 w-4 mr-2" />
                          Promote
                        </Button>
                        <Button
                          onClick={() => destroyPreview(preview)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>
      )}

      {/* Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Environment Logs</DialogTitle>
            <DialogDescription>
              {selectedPreview?.branchName} - {selectedPreview?.url}
            </DialogDescription>
          </DialogHeader>

          {previewLogs && (
            <div className="space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Uptime</p>
                  <p className="text-sm font-medium">
                    {previewLogs.metadata?.uptime?.formatted || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cost</p>
                  <p className="text-sm font-medium">
                    ${previewLogs.metadata?.cost?.actual?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge className={getStatusColor(previewLogs.metadata?.status || 'unknown')}>
                    {previewLogs.metadata?.status || 'Unknown'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Accessed</p>
                  <p className="text-sm font-medium">
                    {previewLogs.metadata?.lastAccessedAt
                      ? new Date(previewLogs.metadata.lastAccessedAt).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
              </div>

              {/* Logs */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Logs</h4>
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
                  {previewLogs.logs?.events?.map((log: any, i: number) => (
                    <div key={i} className="mb-1">
                      <span className="text-gray-500">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>{' '}
                      <span
                        className={
                          log.level === 'error'
                            ? 'text-red-400'
                            : log.level === 'success'
                            ? 'text-green-400'
                            : 'text-green-400'
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  )) || 'No logs available'}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ResponsiveContainer>
  )
}

