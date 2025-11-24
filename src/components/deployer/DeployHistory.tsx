'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  History,
  RotateCcw,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  User,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { RollbackModal } from './RollbackModal'

interface Deployment {
  id: string
  branch: string
  commitHash?: string
  commitMessage?: string
  provider: string
  environment: string
  status: string
  url?: string
  buildTime?: number
  error?: string
  createdAt: string
  user?: {
    name?: string
    email?: string
  }
}

interface DeployHistoryProps {
  projectId: string
  deployments: Deployment[]
  onDeploymentSelect: (deployment: Deployment) => void
  onRefresh: () => void
}

export function DeployHistory({ projectId, deployments, onDeploymentSelect, onRefresh }: DeployHistoryProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [rollbackModal, setRollbackModal] = useState<{
    isOpen: boolean
    deployment: Deployment | null
  }>({
    isOpen: false,
    deployment: null
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setIsRefreshing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'deploying':
        return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'rolled_back':
        return <RotateCcw className="h-4 w-4 text-orange-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'preview':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'staging':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'production':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'vercel':
        return 'Vercel'
      case 'netlify':
        return 'Netlify'
      case 'aws':
        return 'AWS'
      case 'gcp':
        return 'GCP'
      default:
        return provider
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const handleRollback = (deployment: Deployment) => {
    setRollbackModal({
      isOpen: true,
      deployment
    })
  }

  const confirmRollback = async () => {
    if (!rollbackModal.deployment) return

    try {
      setIsRefreshing(true)
      
      // Call rollback API
      const response = await fetch(`/api/deployer/${projectId}/deploy/${rollbackModal.deployment.id}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetDeploymentId: rollbackModal.deployment.id
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Show success message
        alert(`Rollback initiated successfully! New deployment ID: ${result.deployment.id}`)
        // Refresh deployments list
        onRefresh()
        // Close modal
        setRollbackModal({ isOpen: false, deployment: null })
      } else {
        alert(`Rollback failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to rollback deployment:', error)
      alert('Failed to rollback deployment. Please try again.')
    } finally {
      setIsRefreshing(false)
    }
  }

  if (deployments.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <History className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Deployments Yet</h3>
          <p className="text-slate-600 mb-4">
            Your deployment history will appear here once you start deploying.
          </p>
          <Button onClick={handleRefresh} variant="outline">
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
          <History className="h-5 w-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Deployment History</h2>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {deployments.map((deployment) => (
            <Card 
              key={deployment.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onDeploymentSelect(deployment)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {getStatusIcon(deployment.status)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {deployment.branch}
                        </h3>
                        <Badge className={getEnvironmentColor(deployment.environment)}>
                          {deployment.environment}
                        </Badge>
                        <Badge variant="outline">
                          {getProviderName(deployment.provider)}
                        </Badge>
                      </div>
                      
                      <p className="text-slate-600 text-sm mb-2 line-clamp-2">
                        {deployment.commitMessage || 'No commit message'}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{deployment.user?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(deployment.createdAt)}</span>
                        </div>
                        {deployment.buildTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(deployment.buildTime)}</span>
                          </div>
                        )}
                      </div>
                      
                      {deployment.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {deployment.error}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {deployment.url && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(deployment.url, '_blank')
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {deployment.status === 'success' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRollback(deployment)
                        }}
                        disabled={isRefreshing}
                        title="Rollback to this deployment"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rollback Modal */}
      <RollbackModal
        isOpen={rollbackModal.isOpen}
        onClose={() => setRollbackModal({ isOpen: false, deployment: null })}
        onConfirm={confirmRollback}
        deployment={rollbackModal.deployment}
        isLoading={isRefreshing}
      />
    </div>
  )
}
