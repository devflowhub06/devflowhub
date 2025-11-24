'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Rocket, 
  Eye, 
  Undo2, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  ExternalLink,
  GitBranch,
  FileText,
  Loader2,
  ArrowRight,
  Shield
} from 'lucide-react'

export interface DeploymentChange {
  type: 'added' | 'modified' | 'deleted'
  path: string
  size: number
  lastModified: string
  preview?: string
}

export interface DeploymentPreview {
  id: string
  projectId: string
  environment: 'staging' | 'production'
  branch: string
  commitMessage: string
  changes: DeploymentChange[]
  estimatedSize: number
  estimatedTime: string
  previewUrl?: string
  createdAt: string
  status: 'pending' | 'ready' | 'deployed' | 'failed'
}

interface DeployPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  preview: DeploymentPreview | null
  onDeploy: (environment: 'staging' | 'production') => void
  onRollback?: () => void
  isProcessing: boolean
  canRollback: boolean
}

export function DeployPreviewModal({
  isOpen,
  onClose,
  preview,
  onDeploy,
  onRollback,
  isProcessing,
  canRollback
}: DeployPreviewModalProps) {
  const [selectedEnvironment, setSelectedEnvironment] = useState<'staging' | 'production'>('staging')
  const [activeTab, setActiveTab] = useState('summary')

  if (!preview) return null

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'modified':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case 'deleted':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getChangeLabel = (type: string) => {
    switch (type) {
      case 'added':
        return 'Added'
      case 'modified':
        return 'Modified'
      case 'deleted':
        return 'Deleted'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'deployed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    }
  }

  const totalChanges = preview.changes.length
  const addedFiles = preview.changes.filter(c => c.type === 'added').length
  const modifiedFiles = preview.changes.filter(c => c.type === 'modified').length
  const deletedFiles = preview.changes.filter(c => c.type === 'deleted').length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Rocket className="h-5 w-5 text-blue-600" />
            <span>Deploy Preview</span>
            <Badge className={getStatusColor(preview.status)}>
              {preview.status.charAt(0).toUpperCase() + preview.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Environment Selection */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800">Deployment Environment</h4>
                <p className="text-sm text-slate-600">Choose where to deploy your changes</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={selectedEnvironment === 'staging' ? 'default' : 'outline'}
                  onClick={() => setSelectedEnvironment('staging')}
                  className="flex items-center space-x-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Staging</span>
                </Button>
                <Button
                  size="sm"
                  variant={selectedEnvironment === 'production' ? 'default' : 'outline'}
                  onClick={() => setSelectedEnvironment('production')}
                  className="flex items-center space-x-2"
                >
                  <Rocket className="h-4 w-4" />
                  <span>Production</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Deployment Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <GitBranch className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Branch</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">{preview.branch}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Changes</span>
              </div>
              <p className="text-sm text-green-600 mt-1">{totalChanges} files</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Est. Time</span>
              </div>
              <p className="text-sm text-purple-600 mt-1">{preview.estimatedTime}</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="changes">File Changes</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-800 mb-3">Deployment Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Commit Message:</span>
                      <span className="text-sm font-medium text-slate-800">{preview.commitMessage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Size:</span>
                      <span className="text-sm font-medium text-slate-800">{(preview.estimatedSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Files Added:</span>
                      <span className="text-sm font-medium text-green-600">{addedFiles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Files Modified:</span>
                      <span className="text-sm font-medium text-amber-600">{modifiedFiles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Files Deleted:</span>
                      <span className="text-sm font-medium text-red-600">{deletedFiles}</span>
                    </div>
                  </div>
                </div>

                {preview.previewUrl && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-800">Preview Available</h4>
                        <p className="text-sm text-blue-600">Test your changes before deploying</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(preview.previewUrl, '_blank')}
                        className="flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Preview</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="changes" className="space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {preview.changes.map((change, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {getChangeIcon(change.type)}
                      <div>
                        <div className="font-medium text-sm">{change.path}</div>
                        <div className="text-xs text-gray-500">
                          {change.size} bytes • {change.lastModified}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getChangeLabel(change.type)}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 mb-3">Deployment Preview</h4>
                {preview.previewUrl ? (
                  <div className="space-y-3">
                    <div className="bg-white border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Live Preview</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(preview.previewUrl, '_blank')}
                          className="flex items-center space-x-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Open</span>
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Preview URL: {preview.previewUrl}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No preview available for this deployment</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4 border-t">
            <div className="flex space-x-2">
              {canRollback && onRollback && (
                <Button
                  variant="outline"
                  onClick={onRollback}
                  disabled={isProcessing}
                  className="flex items-center space-x-2"
                >
                  <Undo2 className="h-4 w-4" />
                  <span>Rollback</span>
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={() => onDeploy(selectedEnvironment)}
                disabled={isProcessing || preview.status !== 'ready'}
                className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                <span>
                  {isProcessing 
                    ? 'Deploying...' 
                    : `Deploy to ${selectedEnvironment.charAt(0).toUpperCase() + selectedEnvironment.slice(1)}`
                  }
                </span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
