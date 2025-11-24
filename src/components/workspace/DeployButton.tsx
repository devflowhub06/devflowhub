'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Rocket, 
  Eye, 
  Undo2, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  ExternalLink,
  Clock
} from 'lucide-react'
import { DeployPreviewModal, DeploymentPreview } from '@/components/modals/DeployPreviewModal'
import { useDeploymentService } from '@/lib/services/deployment-service'
import { toast } from 'sonner'

interface DeployButtonProps {
  projectId: string
  className?: string
}

export function DeployButton({ projectId, className }: DeployButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<DeploymentPreview | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lastDeployment, setLastDeployment] = useState<{ url: string; environment: string; deployedAt: string } | null>(null)
  const [canRollback, setCanRollback] = useState(false)
  
  const deploymentService = useDeploymentService(projectId)

  const handleCreatePreview = async () => {
    setIsLoading(true)
    
    try {
      const previewData = await deploymentService.createDeploymentPreview()
      
      if (previewData) {
        setPreview(previewData)
        setIsModalOpen(true)
        toast.success('Deployment preview created')
      } else {
        toast.error('Failed to create deployment preview')
      }
    } catch (error) {
      console.error('Preview creation error:', error)
      toast.error('Failed to create deployment preview')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeploy = async (environment: 'staging' | 'production') => {
    setIsLoading(true)
    
    try {
      const result = await deploymentService.deployToEnvironment(environment)
      
      if (result.success) {
        setLastDeployment({
          url: environment === 'staging' 
            ? `https://staging-${projectId}.devflowhub.app`
            : `https://${projectId}.devflowhub.app`,
          environment,
          deployedAt: new Date().toISOString()
        })
        setCanRollback(true)
        setIsModalOpen(false)
        toast.success(`Deployed to ${environment} successfully`)
      } else {
        toast.error('Deployment failed')
      }
    } catch (error) {
      console.error('Deployment error:', error)
      toast.error('Deployment failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRollback = async () => {
    if (!lastDeployment) return
    
    setIsLoading(true)
    
    try {
      // In a real implementation, you'd need the deployment ID
      // For now, we'll simulate a rollback
      const result = await deploymentService.rollbackDeployment('latest')
      
      if (result.success) {
        setCanRollback(false)
        toast.success('Rollback completed successfully')
      } else {
        toast.error('Rollback failed')
      }
    } catch (error) {
      console.error('Rollback error:', error)
      toast.error('Rollback failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setPreview(null)
  }

  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button
          onClick={handleCreatePreview}
          disabled={isLoading}
          size="sm"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4" />
          )}
          <span>
            {isLoading ? 'Creating Preview...' : 'Deploy'}
          </span>
        </Button>

        {lastDeployment && (
          <Badge variant="outline" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            {lastDeployment.environment} • {new Date(lastDeployment.deployedAt).toLocaleTimeString()}
          </Badge>
        )}

        {canRollback && (
          <Button
            onClick={handleRollback}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex items-center space-x-1 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Undo2 className="h-3 w-3" />
            <span>Rollback</span>
          </Button>
        )}

        {lastDeployment && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(lastDeployment.url, '_blank')}
            className="flex items-center space-x-1"
          >
            <ExternalLink className="h-3 w-3" />
            <span>View</span>
          </Button>
        )}
      </div>

      <DeployPreviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        preview={preview}
        onDeploy={handleDeploy}
        onRollback={canRollback ? handleRollback : undefined}
        isProcessing={isLoading}
        canRollback={canRollback}
      />
    </>
  )
}

export function DeploymentStatus({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState<'idle' | 'deploying' | 'deployed' | 'failed'>('idle')
  const [lastDeployment, setLastDeployment] = useState<{ environment: string; deployedAt: string } | null>(null)

  // This would be connected to real-time deployment status updates
  // For now, it's a placeholder for the deployment status indicator

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      {status === 'idle' && (
        <>
          <Clock className="h-4 w-4 text-gray-400" />
          <span>Ready to deploy</span>
        </>
      )}
      {status === 'deploying' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span>Deploying...</span>
        </>
      )}
      {status === 'deployed' && (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Deployed</span>
        </>
      )}
      {status === 'failed' && (
        <>
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span>Deployment Failed</span>
        </>
      )}
    </div>
  )
}
