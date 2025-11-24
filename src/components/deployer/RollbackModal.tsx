'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, RotateCcw, GitBranch, Calendar, User } from 'lucide-react'

interface Deployment {
  id: string
  branch: string
  commitHash?: string
  commitMessage?: string
  provider: string
  environment: string
  status: string
  url?: string
  createdAt: string
  user?: {
    name?: string
    email?: string
  }
}

interface RollbackModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  deployment: Deployment | null
  isLoading?: boolean
}

export function RollbackModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  deployment, 
  isLoading = false 
}: RollbackModalProps) {
  if (!deployment) return null

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <RotateCcw className="h-5 w-5 text-orange-600" />
            <span>Confirm Rollback</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Rollback Warning</h4>
              <p className="text-sm text-yellow-700">
                This will create a new deployment using the code from the selected deployment. 
                The current deployment will remain active until the rollback completes.
              </p>
            </div>
          </div>

          {/* Deployment Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Rollback Target</h4>
            
            <div className="p-3 bg-slate-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GitBranch className="h-4 w-4 text-slate-600" />
                  <span className="font-medium text-slate-900">{deployment.branch}</span>
                </div>
                <Badge className={getEnvironmentColor(deployment.environment)}>
                  {deployment.environment}
                </Badge>
              </div>
              
              <p className="text-sm text-slate-600 line-clamp-2">
                {deployment.commitMessage || 'No commit message'}
              </p>
              
              {deployment.commitHash && (
                <p className="text-xs text-slate-500 font-mono">
                  {deployment.commitHash.substring(0, 7)}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-xs text-slate-500">
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{deployment.user?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(deployment.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Provider:</span>
                <Badge variant="outline" className="text-xs">
                  {getProviderName(deployment.provider)}
                </Badge>
              </div>
            </div>
          </div>

          {/* What will happen */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900">What will happen:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• A new deployment will be created using this version</li>
              <li>• The deployment will use the same environment and provider</li>
              <li>• You can monitor the progress in the logs tab</li>
              <li>• The rollback will be tracked in deployment history</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Rolling back...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Confirm Rollback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
