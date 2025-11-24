'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Rocket, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  Download,
  Settings,
  Play
} from 'lucide-react'
import AIAssistant from '@/components/workspace/AIAssistant'
import { DeployButton } from '@/components/workspace/DeployButton'

interface BoltWorkspaceProps {
  projectId: string
  onStatusChange: (status: { status: string; message: string; progress?: number }) => void
  onToolSwitch?: (tool: string) => void
}

interface Deployment {
  id: string
  environment: string
  branch: string
  buildCommand: string
  message: string
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed'
  url?: string
  createdAt: Date
  completedAt?: Date
  logs: string[]
}

export default function BoltWorkspace({ projectId, onStatusChange, onToolSwitch }: BoltWorkspaceProps) {
  // Add validation for projectId
  if (!projectId || projectId === 'undefined' || projectId === 'null') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Invalid Project ID</div>
          <p className="text-gray-600 text-sm">Project ID is missing or invalid.</p>
        </div>
      </div>
    )
  }

  // State management
  const [environment, setEnvironment] = useState('staging')
  const [branch, setBranch] = useState('main')
  const [buildCommand, setBuildCommand] = useState('npm run build')
  const [deploymentMessage, setDeploymentMessage] = useState('')
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([])

  // Load deployment history - only on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadDeployments()
    }
  }, [projectId])

  const loadDeployments = async () => {
    if (typeof window === 'undefined') return
    
    try {
      // In a real implementation, this would load from the database
      // For now, we'll use localStorage to persist deployments
      const saved = localStorage.getItem(`bolt-deployments-${projectId}`)
      if (saved) {
        const deploymentData = JSON.parse(saved || '[]').map((dep: any) => ({
          ...dep,
          createdAt: new Date(dep.createdAt),
          completedAt: dep.completedAt ? new Date(dep.completedAt) : undefined
        }))
        setDeployments(deploymentData)
      }
    } catch (error) {
      console.error('Failed to load deployments:', error)
    }
  }

  const saveDeployments = (deploymentList: Deployment[]) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(`bolt-deployments-${projectId}`, JSON.stringify(deploymentList))
    } catch (error) {
      console.error('Failed to save deployments:', error)
    }
  }

  const handleDeploy = async () => {
    if (!deploymentMessage.trim()) {
      alert('Please provide a deployment message')
      return
    }

    try {
      setIsDeploying(true)
      
      // Create new deployment
      const newDeployment: Deployment = {
        id: Date.now().toString(),
        environment,
        branch,
        buildCommand,
        message: deploymentMessage,
        status: 'pending',
        createdAt: new Date(),
        logs: []
      }

      // Add to deployments list
      const updatedDeployments = [newDeployment, ...deployments]
      setDeployments(updatedDeployments)
      setSelectedDeployment(newDeployment)
      saveDeployments(updatedDeployments)

      // Simulate deployment process
      await simulateDeployment(newDeployment, updatedDeployments)
      
      // Clear form
      setDeploymentMessage('')
      
    } catch (error) {
      console.error('Deployment failed:', error)
      alert('Deployment failed. Please try again.')
    } finally {
      setIsDeploying(false)
    }
  }

  const simulateDeployment = async (deployment: Deployment, deploymentList: Deployment[]) => {
    const updateDeployment = (updates: Partial<Deployment>) => {
      const updated = (deploymentList || []).map(dep => 
        dep.id === deployment.id ? { ...dep, ...updates } : dep
      )
      setDeployments(updated)
      saveDeployments(updated)
    }

    // Simulate deployment stages
    updateDeployment({ status: 'building', logs: ['🚀 Starting deployment...', '📦 Building project...'] })
    await new Promise(resolve => setTimeout(resolve, 2000))

    updateDeployment({ 
      status: 'building', 
      logs: [...deployment.logs, '🔨 Running build command...', '📋 Installing dependencies...'] 
    })
    await new Promise(resolve => setTimeout(resolve, 3000))

    updateDeployment({ 
      status: 'deploying', 
      logs: [...deployment.logs, '🚀 Deploying to Vercel...', '🌐 Setting up CDN...'] 
    })
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate success or failure
    const isSuccess = Math.random() > 0.1 // 90% success rate
    
    if (isSuccess) {
      const url = `https://${projectId}-${environment}-${Date.now()}.vercel.app`
      updateDeployment({ 
        status: 'success', 
        url,
        completedAt: new Date(),
        logs: [...deployment.logs, '✅ Deployment successful!', `🌐 Live at: ${url}`] 
      })
    } else {
      updateDeployment({ 
        status: 'failed', 
        completedAt: new Date(),
        logs: [...deployment.logs, '❌ Deployment failed', '💡 Check build logs for details'] 
      })
    }
  }

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'building':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
      case 'deploying':
        return <Rocket className="w-4 h-4 animate-pulse text-purple-600" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: Deployment['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'building':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'deploying':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDeploymentCount = (status: Deployment['status']) => {
    return deployments.filter(dep => dep.status === status).length
  }

  const handleAIAction = (action: any) => {
    console.log('AI Action received in Bolt:', action)
    
    // Handle code changes - show deployment info
    if (action.codeChanges && action.codeChanges.length > 0) {
      const codeChange = action.codeChanges[0]
      onStatusChange({ status: 'info', message: `AI generated code for deployment: ${codeChange.file}` })
    } else if (action.type === 'deploy' && action.fileOperations && action.fileOperations.length > 0) {
      // Handle deployment configuration
      onStatusChange({ status: 'info', message: `AI configured deployment: ${action.description}` })
    } else if (action.type === 'create_file' && action.fileOperations && action.fileOperations.length > 0) {
      const fileOp = action.fileOperations[0]
      onStatusChange({ status: 'info', message: `AI created file: ${fileOp.path}` })
    } else if (action.type === 'edit_file' && action.fileOperations && action.fileOperations.length > 0) {
      const fileOp = action.fileOperations[0]
      onStatusChange({ status: 'info', message: `AI updated file: ${fileOp.path}` })
    } else {
      onStatusChange({ status: 'info', message: action.result || 'AI action completed' })
    }
  }

  const openDeploymentUrl = (url: string) => {
    window.open(url, '_blank')
  }

  const downloadDeploymentLogs = (deployment: Deployment) => {
    const logs = deployment.logs.join('\n')
    const blob = new Blob([logs], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deployment-${deployment.id}-logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-300px)]">
      <div className="lg:col-span-3 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Rocket className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-orange-900">DevFlowHub Deployer</CardTitle>
                <CardDescription className="text-orange-700">
                  Deploy your projects to staging and production
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DeployButton projectId={projectId} />
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                Project: {projectId}
              </Badge>
              <Button
                variant="outline"
                onClick={loadDeployments}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Deployment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-orange-600" />
            <span>Deployment Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure your deployment settings and build process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="preview">Preview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">main</SelectItem>
                  <SelectItem value="develop">develop</SelectItem>
                  <SelectItem value="feature">feature/*</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="buildCommand">Build Command</Label>
            <Input
              id="buildCommand"
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
              placeholder="npm run build"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deploymentMessage">Deployment Message</Label>
            <Textarea
              id="deploymentMessage"
              value={deploymentMessage}
              onChange={(e) => setDeploymentMessage(e.target.value)}
              placeholder="Describe what's being deployed..."
              rows={2}
              className="resize-none"
            />
          </div>
          
          <Button 
            onClick={handleDeploy} 
            disabled={!deploymentMessage.trim() || isDeploying}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isDeploying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Deploying to {environment}...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Deploy to {environment}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Deployment Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{getDeploymentCount('success')}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            
            <div className="p-4 border rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {getDeploymentCount('pending') + getDeploymentCount('building') + getDeploymentCount('deploying')}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            
            <div className="p-4 border rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{getDeploymentCount('failed')}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Deployments */}
      {deployments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Deployments</CardTitle>
              <Badge variant="outline">
                {deployments.length} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(deployments || []).map((deployment) => (
                <div
                  key={deployment.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDeployment?.id === deployment.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDeployment(deployment)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(deployment.status)}
                        <div>
                          <h4 className="font-medium">
                            {deployment.environment.charAt(0).toUpperCase() + deployment.environment.slice(1)} Deployment
                          </h4>
                          <p className="text-sm text-gray-600">{deployment.message}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Branch: {deployment.branch}</span>
                        <span>Build: {deployment.buildCommand}</span>
                        <span>{deployment.createdAt.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(deployment.status)}>
                        {deployment.status}
                      </Badge>
                      
                      {deployment.url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDeploymentUrl(deployment.url!)
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadDeploymentLogs(deployment)
                        }}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Logs
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment Details */}
      {selectedDeployment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-orange-600" />
              <span>Deployment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Environment:</strong> {selectedDeployment.environment}</div>
                    <div><strong>Branch:</strong> {selectedDeployment.branch}</div>
                    <div><strong>Build Command:</strong> {selectedDeployment.buildCommand}</div>
                    <div><strong>Message:</strong> {selectedDeployment.message}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Status:</strong> 
                      <Badge className={`ml-2 ${getStatusColor(selectedDeployment.status)}`}>
                        {selectedDeployment.status}
                      </Badge>
                    </div>
                    <div><strong>Created:</strong> {selectedDeployment.createdAt.toLocaleString()}</div>
                    {selectedDeployment.completedAt && (
                      <div><strong>Completed:</strong> {selectedDeployment.completedAt.toLocaleString()}</div>
                    )}
                    {selectedDeployment.url && (
                      <div><strong>URL:</strong> 
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-2"
                          onClick={() => openDeploymentUrl(selectedDeployment.url!)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {selectedDeployment.url}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Deployment Logs</h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                  {(selectedDeployment?.logs || []).map((log, index) => (
                    <div key={index} className="mb-1">
                      <span className="text-gray-400">[{index + 1}]</span> {log}
                    </div>
                  ))}
                  {selectedDeployment.logs.length === 0 && (
                    <div className="text-gray-500">No logs available</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Deployments State */}
      {deployments.length === 0 && !isDeploying && (
        <Card>
          <CardContent className="text-center py-12">
            <Rocket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Deployments Yet</h3>
            <p className="text-gray-600 mb-4">
              Configure your deployment settings above and deploy your project to get started.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Multiple Environments</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Build Automation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Deployment Tracking</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>

      {/* AI Assistant */}
      <div className="lg:col-span-1">
        <AIAssistant
          projectId={projectId}
          activeTool="deployer"
          projectContext={{
            files: [],
            language: 'javascript',
            dependencies: ['react', 'next', 'tailwindcss'],
            gitStatus: 'clean'
          }}
          onActionExecute={handleAIAction}
          onToolSwitch={onToolSwitch}
        />
      </div>
    </div>
  )
}
