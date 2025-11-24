'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Rocket,
  GitBranch,
  Hash,
  Clock,
  DollarSign,
  FileText,
  Settings,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Globe,
  Server,
  Brain,
  Shield,
  Zap,
  TrendingUp,
  Info,
  ChevronRight
} from 'lucide-react'

interface DeployPreviewModalProps {
  projectId: string
  deployOptions?: { environment: string; provider: string } | null
  onClose: () => void
  onDeploy: (options: any) => void
}

interface DeploymentSuggestion {
  type: 'recommendation' | 'warning' | 'optimization' | 'security'
  title: string
  description: string
  action?: string
  priority: 'low' | 'medium' | 'high'
  icon: string
}

interface DeployPreview {
  branch: string
  commitHash: string
  commitMessage: string
  changedFiles: string[]
  buildCommand: string
  envVariables: Record<string, string>
  estimatedCost: number
  estimatedBuildTime: number
  provider: string
  environment: string
  aiSuggestions?: DeploymentSuggestion[]
  risks?: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
  }
  confidence?: number
  rationale?: string
  recommendedEnvironment?: string
  aheadBy?: number
  isDirty?: boolean
}

interface DeployQuota {
  plan: string
  monthlyDeploys: {
    limit: number
    used: number
    remaining: number
  }
  environments: string[]
}

export function DeployPreviewModal({ projectId, deployOptions, onClose, onDeploy }: DeployPreviewModalProps) {
  const [preview, setPreview] = useState<DeployPreview | null>(null)
  const [quota, setQuota] = useState<DeployQuota | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)

  // Default deployment options
  const defaultOptions = {
    branch: 'main',
    environment: (deployOptions?.environment || 'preview') as const,
    provider: (deployOptions?.provider || 'vercel') as const,
    commitHash: 'abc123def456',
    commitMessage: 'Latest commit from DevFlowHub',
    buildCommand: 'npm run build',
    envVariables: {}
  }

  useEffect(() => {
    loadPreview()
  }, [])

  const loadPreview = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/deployer/${projectId}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultOptions),
      })

      const data = await response.json()
      
      if (data.success) {
        setPreview(data.preview)
        setQuota(data.quota)
      } else {
        console.error('Failed to load preview:', data.error)
      }
    } catch (error) {
      console.error('Error loading preview:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeploy = async () => {
    try {
      setIsDeploying(true)
      
      const response = await fetch(`/api/deployer/${projectId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultOptions),
      })

      const data = await response.json()
      
      if (data.success) {
        onDeploy(data.deployment)
      } else {
        console.error('Deployment failed:', data.error)
        alert(`Deployment failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deploying:', error)
      alert(`Deployment failed: ${(error as Error).message}`)
    } finally {
      setIsDeploying(false)
    }
  }

  const getEnvironmentIcon = (environment: string) => {
    switch (environment) {
      case 'preview':
        return <Globe className="h-4 w-4" />
      case 'staging':
        return <Server className="h-4 w-4" />
      case 'production':
        return <Rocket className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
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

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'security':
        return <Shield className="h-4 w-4" />
      case 'optimization':
        return <Zap className="h-4 w-4" />
      case 'recommendation':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getSuggestionColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return type === 'warning' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
    } else if (priority === 'medium') {
      return 'bg-yellow-50 border-yellow-200'
    }
    return 'bg-blue-50 border-blue-200'
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Preparing deployment preview...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!preview || !quota) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Preview Failed</h3>
            <p className="text-slate-600 mb-4">Unable to generate deployment preview.</p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Rocket className="h-5 w-5 text-purple-600" />
            <span>Deployment Preview</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Deployment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Deployment Summary</span>
                <Badge className={getEnvironmentColor(preview.environment)}>
                  {getEnvironmentIcon(preview.environment)}
                  <span className="ml-1 capitalize">{preview.environment}</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <GitBranch className="h-4 w-4 text-slate-500" />
                  <div>
                    <div className="text-sm text-slate-600">Branch</div>
                    <div className="font-medium">{preview.branch}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-slate-500" />
                  <div>
                    <div className="text-sm text-slate-600">Commit</div>
                    <div className="font-mono text-sm">{preview.commitHash}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <div>
                    <div className="text-sm text-slate-600">Build Time</div>
                    <div className="font-medium">{Math.round(preview.estimatedBuildTime / 60)}m</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <div>
                    <div className="text-sm text-slate-600">Est. Cost</div>
                    <div className="font-medium">${preview.estimatedCost.toFixed(3)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commit Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Commit Message</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
                {preview.commitMessage}
              </p>
            </CardContent>
          </Card>

          {/* Changed Files */}
          <Card>
            <CardHeader>
              <CardTitle>Changed Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {preview.changedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-mono text-slate-700">{file}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          {preview.aiSuggestions && preview.aiSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span>AI Deployment Intelligence</span>
                  {preview.confidence && (
                    <Badge variant="outline" className="ml-2">
                      {Math.round(preview.confidence * 100)}% confidence
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {preview.rationale && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-700">{preview.rationale}</p>
                  </div>
                )}
                
                <div className="space-y-3">
                  {preview.aiSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg ${getSuggestionColor(suggestion.type, suggestion.priority)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-1 rounded ${
                          suggestion.priority === 'high' ? 'text-red-600' :
                          suggestion.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {getSuggestionIcon(suggestion.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-slate-900">{suggestion.title}</h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                suggestion.priority === 'high' ? 'border-red-300 text-red-700' :
                                suggestion.priority === 'medium' ? 'border-yellow-300 text-yellow-700' : 
                                'border-blue-300 text-blue-700'
                              }`}
                            >
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{suggestion.description}</p>
                          {suggestion.action && (
                            <div className="flex items-center space-x-1 text-xs text-slate-500">
                              <ChevronRight className="h-3 w-3" />
                              <span>{suggestion.action}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Assessment */}
          {preview.risks && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Risk Assessment</span>
                  <Badge className={getRiskColor(preview.risks.level)}>
                    {preview.risks.level.toUpperCase()} RISK
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {preview.risks.factors.map((factor, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        preview.risks!.level === 'high' ? 'bg-red-500' :
                        preview.risks!.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-slate-700">{factor}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Git Status */}
          {(preview.aheadBy || preview.isDirty) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GitBranch className="h-4 w-4" />
                  <span>Git Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {preview.aheadBy && preview.aheadBy > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-700">{preview.aheadBy} commits ahead of last deployment</span>
                    </div>
                  )}
                  {preview.isDirty && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-slate-700">Uncommitted changes detected</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Build Command */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Build Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                {preview.buildCommand}
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(preview.envVariables).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="font-mono text-sm">{key}</span>
                    <span className="font-mono text-sm text-slate-500">
                      {value.length > 20 ? `${value.substring(0, 20)}...` : value}
                    </span>
                  </div>
                ))}
                {Object.keys(preview.envVariables).length === 0 && (
                  <p className="text-slate-500 text-sm">No environment variables</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quota Information */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600">Monthly Deployments</div>
                  <div className="text-lg font-semibold">
                    {quota.monthlyDeploys.used + 1} / {quota.monthlyDeploys.limit}
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {quota.plan} Plan
                </Badge>
              </div>
              
              {quota.monthlyDeploys.remaining <= 1 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      This deployment will use your last remaining deployment for this month.
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button onClick={onClose} variant="outline" disabled={isDeploying}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeploy} 
              disabled={isDeploying || quota.monthlyDeploys.remaining <= 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isDeploying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
