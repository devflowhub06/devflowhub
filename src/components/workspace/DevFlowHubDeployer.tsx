'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Rocket,
  History,
  BarChart3,
  Settings,
  Play,
  RotateCcw,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Globe,
  Server,
  Cloud,
  Terminal,
  Brain
} from 'lucide-react'
import { DeployPreviewModal } from '@/components/deployer/DeployPreviewModal'
import { DeployHistory } from '@/components/deployer/DeployHistory'
import { DeployMetrics } from '@/components/deployer/DeployMetrics'
import { DeployLogs } from '@/components/deployer/DeployLogs'
import { EnvManager } from '@/components/deployer/EnvManager'

interface DevFlowHubDeployerProps {
  projectId: string
}

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

interface DeployMetrics {
  totalDeploys: number
  successfulDeploys: number
  failedDeploys: number
  averageBuildTime: number
  totalCost: number
  lastDeployAt?: string
}

interface DeployQuota {
  plan: string
  monthlyDeploys: {
    limit: number
    used: number
    remaining: number
  }
  environments: string[]
  features: {
    preview: boolean
    staging: boolean
    production: boolean
    rollback: boolean
    logs: boolean
    customDomains: boolean
  }
}

export function DevFlowHubDeployer({ projectId }: DevFlowHubDeployerProps) {
  const [activeTab, setActiveTab] = useState<'deploy' | 'logs' | 'history' | 'metrics' | 'env'>('deploy')
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [metrics, setMetrics] = useState<DeployMetrics | null>(null)
  const [quota, setQuota] = useState<DeployQuota | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [deployOptions, setDeployOptions] = useState<{ environment: string; provider: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Load deployments
      const deploymentsResponse = await fetch(`/api/deployer/${projectId}/deploy`)
      const deploymentsData = await deploymentsResponse.json()
      if (deploymentsData.success) setDeployments(deploymentsData.deployments)

      // Load metrics and quota
      const metricsResponse = await fetch(`/api/deployer/${projectId}/metrics`)
      const metricsData = await metricsResponse.json()
      if (metricsData.success) {
        setMetrics(metricsData.metrics)
        setQuota(metricsData.quota)
      }
    } catch (error) {
      console.error('Failed to load deployer data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDeploy = (options: { environment: string; provider: string }) => {
    // Set deployment options and show preview modal
    setDeployOptions(options)
    setShowPreviewModal(true)
  }

  const handleDeploymentSelect = (deployment: Deployment) => {
    setSelectedDeployment(deployment)
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
        return 'bg-blue-100 text-blue-800'
      case 'staging':
        return 'bg-yellow-100 text-yellow-800'
      case 'production':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'vercel':
        return <Cloud className="h-4 w-4" />
      case 'netlify':
        return <Globe className="h-4 w-4" />
      case 'aws':
        return <Server className="h-4 w-4" />
      default:
        return <Rocket className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading deployer...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Rocket className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">DevFlowHub Deployer</h1>
              <p className="text-slate-600">Deploy your applications with confidence</p>
            </div>
          </div>
          
          {quota && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-600">Deployments this month</div>
                <div className="text-lg font-semibold text-slate-900">
                  {quota.monthlyDeploys.used} / {quota.monthlyDeploys.limit}
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {quota.plan} Plan
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full">
            <TabsList className="grid w-full grid-cols-5 bg-white border border-slate-200">
              <TabsTrigger value="deploy" className="flex items-center space-x-2">
                <Rocket className="h-4 w-4" />
                <span>Deploy</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center space-x-2">
                <Terminal className="h-4 w-4" />
                <span>Logs</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2">
                <History className="h-4 w-4" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Metrics</span>
              </TabsTrigger>
              <TabsTrigger value="env" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Environment</span>
              </TabsTrigger>
            </TabsList>

            <div className="h-full pt-6">
              <TabsContent value="deploy" className="h-full m-0">
                <div className="h-full flex flex-col space-y-6">
                  {/* Quick Deploy */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Play className="h-5 w-5 text-green-600" />
                        <span>Quick Deploy</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                          onClick={() => handleDeploy({ environment: 'preview', provider: 'vercel' })}
                          className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
                          disabled={!quota?.environments.includes('preview')}
                        >
                          <Globe className="h-6 w-6 text-blue-600" />
                          <span className="text-sm font-medium">Preview</span>
                        </Button>
                        
                        <Button
                          onClick={() => handleDeploy({ environment: 'staging', provider: 'vercel' })}
                          className={`h-20 flex flex-col items-center justify-center space-y-2 ${
                            quota?.environments.includes('staging') 
                              ? 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-800' 
                              : 'bg-gray-50 border-gray-200 text-gray-400'
                          }`}
                          disabled={!quota?.environments.includes('staging')}
                        >
                          <Server className={`h-6 w-6 ${quota?.environments.includes('staging') ? 'text-yellow-600' : 'text-gray-400'}`} />
                          <span className="text-sm font-medium">Staging</span>
                          {!quota?.environments.includes('staging') && (
                            <span className="text-xs text-gray-500">Upgrade Required</span>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => handleDeploy({ environment: 'production', provider: 'vercel' })}
                          className={`h-20 flex flex-col items-center justify-center space-y-2 ${
                            quota?.environments.includes('production') 
                              ? 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800' 
                              : 'bg-gray-50 border-gray-200 text-gray-400'
                          }`}
                          disabled={!quota?.environments.includes('production')}
                        >
                          <Rocket className={`h-6 w-6 ${quota?.environments.includes('production') ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className="text-sm font-medium">Production</span>
                          {!quota?.environments.includes('production') && (
                            <span className="text-xs text-gray-500">Upgrade Required</span>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Assistant Suggestion */}
                  <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Brain className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-purple-900 mb-1">AI Deployment Assistant</h4>
                          <p className="text-sm text-purple-700 mb-2">
                            💡 <strong>Smart Recommendation:</strong> Start with Preview deployment to test your changes safely. 
                            The AI will analyze your code changes and provide deployment suggestions.
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-purple-600">
                            <span>✅ Risk Assessment</span>
                            <span>💰 Cost Estimation</span>
                            <span>🔍 Change Analysis</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Deployments */}
                  {deployments.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Deployments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {deployments.slice(0, 3).map((deployment) => (
                            <div
                              key={deployment.id}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100"
                              onClick={() => handleDeploymentSelect(deployment)}
                            >
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(deployment.status)}
                                <div>
                                  <div className="font-medium text-slate-900">
                                    {deployment.branch}
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    {deployment.commitMessage || 'No commit message'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Badge className={getEnvironmentColor(deployment.environment)}>
                                  {deployment.environment}
                                </Badge>
                                {getProviderIcon(deployment.provider)}
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
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="h-full m-0">
                {selectedDeployment ? (
                  <DeployLogs
                    deployId={selectedDeployment.id}
                    projectId={projectId}
                    status={selectedDeployment.status as any}
                    onStatusChange={(status) => {
                      setSelectedDeployment({ ...selectedDeployment, status })
                      loadData()
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Terminal className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Deployment Selected</h3>
                      <p className="text-slate-600 mb-4">Select a deployment from the history to view its logs.</p>
                      <Button onClick={() => setActiveTab('history')}>
                        View Deployment History
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="h-full m-0">
                <DeployHistory
                  projectId={projectId}
                  deployments={deployments}
                  onDeploymentSelect={(deployment) => {
                    handleDeploymentSelect(deployment)
                    setActiveTab('logs')
                  }}
                  onRefresh={loadData}
                />
              </TabsContent>

              <TabsContent value="metrics" className="h-full m-0">
                <DeployMetrics
                  projectId={projectId}
                  metrics={metrics}
                  quota={quota}
                  onRefresh={loadData}
                />
              </TabsContent>

              <TabsContent value="env" className="h-full m-0">
                <EnvManager projectId={projectId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Deployment Preview Modal */}
      {showPreviewModal && (
        <DeployPreviewModal
          projectId={projectId}
          deployOptions={deployOptions}
          onClose={() => {
            setShowPreviewModal(false)
            setDeployOptions(null)
          }}
          onDeploy={async (options) => {
            setShowPreviewModal(false)
            setDeployOptions(null)
            
            try {
              // Start actual deployment
              console.log('Starting deployment with options:', options)
              
              const response = await fetch(`/api/deployer/${projectId}/deploy`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  branch: options.branch || 'main',
                  environment: options.environment,
                  provider: options.provider,
                  commitHash: options.commitHash,
                  commitMessage: options.commitMessage,
                  buildCommand: options.buildCommand,
                  envVariables: options.envVariables || {}
                })
              })

              const result = await response.json()
              
              if (result.success) {
                console.log('Deployment started successfully:', result.deployment)
                // Refresh data to show new deployment
                await loadData()
                // Switch to logs tab to show deployment progress
                setActiveTab('logs')
                setSelectedDeployment(result.deployment)
              } else {
                console.error('Deployment failed:', result.error)
                // You could show a toast notification here
              }
            } catch (error) {
              console.error('Failed to start deployment:', error)
              // You could show a toast notification here
            }
          }}
        />
      )}

    </div>
  )
}
