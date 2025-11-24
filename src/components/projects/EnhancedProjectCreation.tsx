'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Code, 
  GitBranch, 
  Container, 
  Database,
  Play,
  Sparkles,
  Settings,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface ProjectTemplate {
  id: string
  name: string
  description: string
  type: string
  language: string
  framework: string
  recommendedTool: string
  files: any[]
  tags: string[]
}

interface ProvisioningStatus {
  jobId: string
  projectId: string
  status: 'running' | 'completed' | 'failed' | 'unknown'
  currentStep: string | null
  completedSteps: string[]
  progress: number
  logs: string[]
  error: string | null
  previewUrl: string | null
  estimatedTimeRemaining: number
}

interface EnhancedProjectCreationProps {
  isOpen: boolean
  onClose: () => void
}

export function EnhancedProjectCreation({ isOpen, onClose }: EnhancedProjectCreationProps) {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'provisioning' | 'completed'>('form')
  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [provisioningStatus, setProvisioningStatus] = useState<ProvisioningStatus | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: 'JavaScript',
    framework: 'React',
    connectGit: false,
    gitProvider: 'github',
    enableSandbox: true,
    addSampleComponents: false,
    privateRepo: true
  })

  // Load templates on mount
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  // Poll provisioning status
  useEffect(() => {
    if (provisioningStatus && provisioningStatus.status === 'running') {
      const interval = setInterval(() => {
        fetchProvisioningStatus()
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [provisioningStatus])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const fetchProvisioningStatus = async () => {
    if (!provisioningStatus) return

    try {
      const response = await fetch(
        `/api/projects/${provisioningStatus.projectId}/provision/${provisioningStatus.jobId}/status`
      )
      if (response.ok) {
        const status = await response.json()
        setProvisioningStatus(status)

        if (status.status === 'completed') {
          setStep('completed')
          toast.success('Project created successfully!')
          // Auto-redirect to the project workspace after a short delay
          setTimeout(() => {
            router.push(`/dashboard/projects/${provisioningStatus.projectId}/workspace`)
            onClose()
          }, 2000)
        } else if (status.status === 'failed') {
          toast.error('Project creation failed: ' + status.error)
        }
      }
    } catch (error) {
      console.error('Error fetching provisioning status:', error)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        name: template.name,
        language: template.language,
        framework: template.framework
      }))
    }
  }

  const handleCreateProject = async () => {
    setIsLoading(true)
    
    try {
      const payload = {
        ...formData,
        templateId: selectedTemplate,
        parameters: {
          projectName: formData.name,
          projectDescription: formData.description
        }
      }

      const response = await fetch('/api/projects/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        setProvisioningStatus({
          jobId: data.jobId,
          projectId: data.project.id,
          status: 'running',
          currentStep: null,
          completedSteps: [],
          progress: 0,
          logs: [],
          error: null,
          previewUrl: null,
          estimatedTimeRemaining: 150
        })
        setStep('provisioning')
      } else {
        const error = await response.json()
        toast.error('Failed to create project: ' + error.error)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenProject = () => {
    if (provisioningStatus) {
      router.push(`/dashboard/projects/${provisioningStatus.projectId}/workspace`)
      onClose()
    }
  }

  const getStepIcon = (stepName: string) => {
    switch (stepName) {
      case 'seed_files': return <Code className="h-4 w-4" />
      case 'create_git_repo': return <GitBranch className="h-4 w-4" />
      case 'provision_sandbox': return <Container className="h-4 w-4" />
      case 'index_project': return <Database className="h-4 w-4" />
      case 'run_initial_build': return <Play className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getStepName = (stepName: string) => {
    switch (stepName) {
      case 'seed_files': return 'Seeding Files'
      case 'create_git_repo': return 'Creating Git Repository'
      case 'provision_sandbox': return 'Provisioning Sandbox'
      case 'index_project': return 'Indexing for AI'
      case 'run_initial_build': return 'Running Initial Build'
      default: return stepName
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && 'Create a new project with templates or start from scratch'}
            {step === 'provisioning' && 'Setting up your project...'}
            {step === 'completed' && 'Project created successfully!'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-6">
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates">From Template</TabsTrigger>
                <TabsTrigger value="scratch">Start from Scratch</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {template.description}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">
                            {template.framework}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {template.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="scratch" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Start from Scratch</CardTitle>
                    <CardDescription>
                      Create a minimal project skeleton
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Language</label>
                        <Select
                          value={formData.language}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="JavaScript">JavaScript</SelectItem>
                            <SelectItem value="TypeScript">TypeScript</SelectItem>
                            <SelectItem value="Python">Python</SelectItem>
                            <SelectItem value="Java">Java</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Framework</label>
                        <Select
                          value={formData.framework}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, framework: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="React">React</SelectItem>
                            <SelectItem value="Vue">Vue</SelectItem>
                            <SelectItem value="Angular">Angular</SelectItem>
                            <SelectItem value="Svelte">Svelte</SelectItem>
                            <SelectItem value="Vanilla">Vanilla</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Project Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="TypeScript">TypeScript</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Java">Java</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Advanced Options</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="connectGit"
                    checked={formData.connectGit}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, connectGit: !!checked }))}
                  />
                  <label htmlFor="connectGit" className="text-sm">
                    Connect Git repository
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableSandbox"
                    checked={formData.enableSandbox}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableSandbox: !!checked }))}
                  />
                  <label htmlFor="enableSandbox" className="text-sm">
                    Enable sandbox preview
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="addSampleComponents"
                    checked={formData.addSampleComponents}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, addSampleComponents: !!checked }))}
                  />
                  <label htmlFor="addSampleComponents" className="text-sm">
                    Add sample UI components
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProject}
                disabled={!formData.name || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'provisioning' && provisioningStatus && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-blue-600 animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold">Creating Your Project</h3>
                <p className="text-gray-600">
                  Setting up your development environment...
                </p>
              </div>

              <Progress value={provisioningStatus.progress} className="mb-4" />
              <p className="text-sm text-gray-500">
                {provisioningStatus.progress}% complete
              </p>
            </div>

            <div className="space-y-3">
              {['seed_files', 'create_git_repo', 'provision_sandbox', 'index_project', 'run_initial_build'].map((stepName) => {
                const isCompleted = provisioningStatus.completedSteps.includes(stepName)
                const isCurrent = provisioningStatus.currentStep === stepName
                
                return (
                  <div
                    key={stepName}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isCompleted
                        ? 'bg-green-50 border border-green-200'
                        : isCurrent
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      isCompleted
                        ? 'bg-green-100 text-green-600'
                        : isCurrent
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        getStepIcon(stepName)
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        isCompleted ? 'text-green-800' : isCurrent ? 'text-blue-800' : 'text-gray-600'
                      }`}>
                        {getStepName(stepName)}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-blue-600">In progress...</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {provisioningStatus.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Error occurred</span>
                </div>
                <p className="text-red-700 mt-1">{provisioningStatus.error}</p>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Estimated time remaining: {provisioningStatus.estimatedTimeRemaining}s
              </p>
            </div>
          </div>
        )}

        {step === 'completed' && provisioningStatus && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Project Created Successfully!</h3>
              <p className="text-gray-600">
                Your project is ready to use. You can now start coding in the editor.
              </p>
            </div>

            {provisioningStatus.previewUrl && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">Preview URL:</p>
                <a 
                  href={provisioningStatus.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {provisioningStatus.previewUrl}
                </a>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button 
                onClick={handleOpenProject}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Open in Editor
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
