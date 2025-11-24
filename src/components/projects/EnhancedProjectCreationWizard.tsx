'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Zap, 
  Sparkles, 
  Code, 
  Rocket, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Brain,
  GitBranch,
  Settings,
  Target
} from 'lucide-react'
import { toast } from 'sonner'

interface ProjectFormData {
  name: string
  description: string
  type: string
  language: string
  framework: string
  template: string
  useAiScaffolding: boolean
  initGit: boolean
  goal: string
  timeline: string
}

interface ProvisioningStatus {
  jobId: string
  projectId: string
  status: 'queued' | 'running' | 'completed' | 'failed' | 'unknown'
  currentStep: string | null
  completedSteps: string[]
  progress: number
  logs: any[]
  error: string | null
  previewUrl: string | null
  estimatedTimeRemaining: number
}

const PROJECT_TYPES = [
  { id: 'web-app', label: 'Web Application', description: 'Frontend web apps, SPAs, PWAs' },
  { id: 'api', label: 'API/Backend', description: 'REST APIs, GraphQL, microservices' },
  { id: 'mobile-app', label: 'Mobile App', description: 'React Native, Flutter, native apps' },
  { id: 'desktop-app', label: 'Desktop App', description: 'Electron, native desktop apps' },
  { id: 'library', label: 'Library/Package', description: 'NPM packages, Python libraries' },
  { id: 'data-science', label: 'Data Science', description: 'ML models, data analysis, notebooks' },
  { id: 'blockchain', label: 'Blockchain', description: 'Smart contracts, DApps, Web3' },
  { id: 'game', label: 'Game', description: 'Web games, mobile games, desktop games' }
]

const LANGUAGES = [
  { id: 'JavaScript', label: 'JavaScript', icon: '🟨' },
  { id: 'TypeScript', label: 'TypeScript', icon: '🔷' },
  { id: 'Python', label: 'Python', icon: '🐍' },
  { id: 'Java', label: 'Java', icon: '☕' },
  { id: 'Go', label: 'Go', icon: '🐹' },
  { id: 'Rust', label: 'Rust', icon: '🦀' },
  { id: 'PHP', label: 'PHP', icon: '🐘' },
  { id: 'C#', label: 'C#', icon: '🔷' },
  { id: 'C++', label: 'C++', icon: '⚡' }
]

const FRAMEWORKS = {
  'JavaScript': [
    { id: 'react', label: 'React', description: 'UI library for web apps' },
    { id: 'vue', label: 'Vue.js', description: 'Progressive framework' },
    { id: 'angular', label: 'Angular', description: 'Full-featured framework' },
    { id: 'express', label: 'Express.js', description: 'Web framework for Node.js' },
    { id: 'next', label: 'Next.js', description: 'React framework with SSR' },
    { id: 'nuxt', label: 'Nuxt.js', description: 'Vue framework with SSR' },
    { id: 'svelte', label: 'Svelte', description: 'Compile-time framework' },
    { id: 'none', label: 'None', description: 'Vanilla JavaScript' }
  ],
  'TypeScript': [
    { id: 'react', label: 'React + TypeScript', description: 'Type-safe React apps' },
    { id: 'vue', label: 'Vue.js + TypeScript', description: 'Type-safe Vue apps' },
    { id: 'angular', label: 'Angular', description: 'Full-featured TypeScript framework' },
    { id: 'express', label: 'Express.js + TypeScript', description: 'Type-safe Node.js API' },
    { id: 'next', label: 'Next.js + TypeScript', description: 'Type-safe React with SSR' },
    { id: 'nest', label: 'NestJS', description: 'Enterprise Node.js framework' },
    { id: 'none', label: 'None', description: 'Vanilla TypeScript' }
  ],
  'Python': [
    { id: 'django', label: 'Django', description: 'Full-featured web framework' },
    { id: 'flask', label: 'Flask', description: 'Lightweight web framework' },
    { id: 'fastapi', label: 'FastAPI', description: 'Modern API framework' },
    { id: 'streamlit', label: 'Streamlit', description: 'Data app framework' },
    { id: 'jupyter', label: 'Jupyter', description: 'Data science notebooks' },
    { id: 'none', label: 'None', description: 'Vanilla Python' }
  ],
  'Java': [
    { id: 'spring', label: 'Spring Boot', description: 'Enterprise Java framework' },
    { id: 'quarkus', label: 'Quarkus', description: 'Cloud-native Java' },
    { id: 'micronaut', label: 'Micronaut', description: 'Modern Java framework' },
    { id: 'none', label: 'None', description: 'Vanilla Java' }
  ],
  'Go': [
    { id: 'gin', label: 'Gin', description: 'HTTP web framework' },
    { id: 'echo', label: 'Echo', description: 'High performance framework' },
    { id: 'fiber', label: 'Fiber', description: 'Express-inspired framework' },
    { id: 'none', label: 'None', description: 'Vanilla Go' }
  ],
  'Rust': [
    { id: 'actix', label: 'Actix Web', description: 'Actor-based web framework' },
    { id: 'warp', label: 'Warp', description: 'Lightweight web framework' },
    { id: 'axum', label: 'Axum', description: 'Ergonomic web framework' },
    { id: 'none', label: 'None', description: 'Vanilla Rust' }
  ],
  'PHP': [
    { id: 'laravel', label: 'Laravel', description: 'Elegant PHP framework' },
    { id: 'symfony', label: 'Symfony', description: 'Component-based framework' },
    { id: 'codeigniter', label: 'CodeIgniter', description: 'Lightweight framework' },
    { id: 'none', label: 'None', description: 'Vanilla PHP' }
  ],
  'C#': [
    { id: 'aspnet', label: 'ASP.NET Core', description: 'Microsoft web framework' },
    { id: 'blazor', label: 'Blazor', description: 'Web UI framework' },
    { id: 'none', label: 'None', description: 'Vanilla C#' }
  ],
  'C++': [
    { id: 'qt', label: 'Qt', description: 'Cross-platform framework' },
    { id: 'none', label: 'None', description: 'Vanilla C++' }
  ]
}

const GOALS = [
  { id: 'prototype', label: 'Prototype', description: 'Quick proof of concept' },
  { id: 'production', label: 'Production', description: 'Full-scale application' },
  { id: 'learning', label: 'Learning', description: 'Educational project' },
  { id: 'client', label: 'Client Work', description: 'Professional project' },
  { id: 'startup', label: 'Startup', description: 'Business venture' },
  { id: 'open-source', label: 'Open Source', description: 'Community project' }
]

const TIMELINES = [
  { id: '1-day', label: '1 Day', description: 'Quick hack' },
  { id: '1-week', label: '1 Week', description: 'Sprint project' },
  { id: '1-month', label: '1 Month', description: 'Short-term project' },
  { id: '3-months', label: '3 Months', description: 'Medium-term project' },
  { id: '6-months', label: '6 Months', description: 'Long-term project' },
  { id: 'ongoing', label: 'Ongoing', description: 'Continuous development' }
]

export function EnhancedProjectCreationWizard({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provisioningStatus, setProvisioningStatus] = useState<ProvisioningStatus | null>(null)
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    type: 'web-app',
    language: 'JavaScript',
    framework: 'react',
    template: 'blank',
    useAiScaffolding: false,
    initGit: true,
    goal: 'prototype',
    timeline: '1-week'
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = useCallback((field: keyof ProjectFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, totalSteps])

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const handleSubmit = async () => {
    if (isLoading) return
    
    setError(null)
    setIsLoading(true)

    try {
      // Use enhanced provisioning API (emits analytics and simulates scaffold job)
      const response = await fetch('/api/projects/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          language: formData.language,
          framework: formData.framework === 'none' ? null : formData.framework,
          templateId: formData.template !== 'blank' ? formData.template : undefined,
          enableSandbox: true,
          addSampleComponents: false,
          parameters: {
            projectName: formData.name,
            projectDescription: formData.description
          }
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create project')
      }

      const data = await response.json()

      // Start provisioning progress UI
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

      // Fire client-side analytics (server already tracks too)
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName: 'project_created',
            payload: { projectId: data.project.id, language: formData.language, framework: formData.framework }
          })
        })
      } catch {}
    } catch (error) {
      console.error('Error creating project:', error)
      setError(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  // Poll provisioning status while running
  useEffect(() => {
    if (!provisioningStatus || provisioningStatus.status !== 'running') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/projects/${provisioningStatus.projectId}/provision/${provisioningStatus.jobId}/status`)
        if (!res.ok) return
        const status = await res.json()
        setProvisioningStatus(status)

        if (status.status === 'completed') {
          clearInterval(interval)
          toast.success('Project is ready!')
          setTimeout(() => {
            router.push(`/dashboard/projects/${status.projectId}/workspace`)
            onClose()
          }, 1200)
        }
      } catch {}
    }, 2000)

    return () => clearInterval(interval)
  }, [provisioningStatus, router, onClose])

  const getAvailableFrameworks = () => {
    return FRAMEWORKS[formData.language as keyof typeof FRAMEWORKS] || []
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create New Project</h2>
              <p className="text-gray-600">Build something amazing with DevFlowHub</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Provisioning Progress */}
          {provisioningStatus ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-xl font-semibold">Setting up your project…</h3>
                <p className="text-gray-600 mt-1">This usually takes ~2–3 minutes.</p>
              </div>

              <Progress value={provisioningStatus.progress} className="mb-2" />
              <p className="text-sm text-gray-500 text-center">{provisioningStatus.progress}% complete</p>

              <div className="space-y-3">
                {['seed_files', 'create_git_repo', 'provision_sandbox', 'index_project', 'run_initial_build'].map((stepName) => {
                  const isCompleted = provisioningStatus.completedSteps.includes(stepName)
                  const isCurrent = provisioningStatus.currentStep === stepName
                  return (
                    <div key={stepName} className={`flex items-center justify-between p-3 rounded-md border ${isCurrent ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 text-sm">
                        {stepName === 'seed_files' && <Code className="h-4 w-4" />}
                        {stepName === 'create_git_repo' && <GitBranch className="h-4 w-4" />}
                        {stepName === 'provision_sandbox' && <Settings className="h-4 w-4" />}
                        {stepName === 'index_project' && <Brain className="h-4 w-4" />}
                        {stepName === 'run_initial_build' && <Rocket className="h-4 w-4" />}
                        <span className="capitalize">{stepName.replaceAll('_', ' ')}</span>
                      </div>
                      <div className="text-xs">{isCompleted ? 'Done' : isCurrent ? 'In progress' : 'Queued'}</div>
                    </div>
                  )
                })}
              </div>

              {provisioningStatus.previewUrl && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">Preview URL:</p>
                  <a href={provisioningStatus.previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {provisioningStatus.previewUrl}
                  </a>
                </div>
              )}

              {provisioningStatus.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-800 text-sm">{provisioningStatus.error}</div>
                </div>
              )}
            </div>
          ) : (
          /* Step 1: Project Basics */
          currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Project Basics</h3>
                <p className="text-gray-600">Tell us about your project</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="My Awesome Project"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Type *</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what you're building..."
                  rows={3}
                />
              </div>
            </div>
          ))}

          {/* Step 2: Technical Stack */}
          {!provisioningStatus && currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Technical Stack</h3>
                <p className="text-gray-600">Choose your development tools</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Language *</label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => {
                      handleInputChange('language', value)
                      handleInputChange('framework', 'none') // Reset framework when language changes
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          <div className="flex items-center space-x-2">
                            <span>{lang.icon}</span>
                            <span>{lang.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Framework</label>
                  <Select
                    value={formData.framework}
                    onValueChange={(value) => handleInputChange('framework', value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableFrameworks().map((framework) => (
                        <SelectItem key={framework.id} value={framework.id}>
                          <div>
                            <div className="font-medium">{framework.label}</div>
                            <div className="text-xs text-gray-500">{framework.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="initGit"
                    checked={formData.initGit}
                    onCheckedChange={(checked) => handleInputChange('initGit', checked as boolean)}
                  />
                  <label htmlFor="initGit" className="text-sm font-medium">
                    Initialize Git repository
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useAiScaffolding"
                    checked={formData.useAiScaffolding}
                    onCheckedChange={(checked) => handleInputChange('useAiScaffolding', checked as boolean)}
                  />
                  <label htmlFor="useAiScaffolding" className="text-sm font-medium">
                    Use AI Assistant to scaffold files
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Goals & Timeline */}
          {!provisioningStatus && currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Goals & Timeline</h3>
                <p className="text-gray-600">Help us understand your project goals</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Goal</label>
                  <Select
                    value={formData.goal}
                    onValueChange={(value) => handleInputChange('goal', value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOALS.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          <div>
                            <div className="font-medium">{goal.label}</div>
                            <div className="text-xs text-gray-500">{goal.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Timeline</label>
                  <Select
                    value={formData.timeline}
                    onValueChange={(value) => handleInputChange('timeline', value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMELINES.map((timeline) => (
                        <SelectItem key={timeline.id} value={timeline.id}>
                          <div>
                            <div className="font-medium">{timeline.label}</div>
                            <div className="text-xs text-gray-500">{timeline.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm & Create */}
          {!provisioningStatus && currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to Create!</h3>
                <p className="text-gray-600">Review your project settings</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Rocket className="w-5 h-5" />
                    <span>Project Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <p className="font-medium">
                        {PROJECT_TYPES.find(t => t.id === formData.type)?.label}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Language</label>
                      <p className="font-medium">{formData.language}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Framework</label>
                      <p className="font-medium">
                        {formData.framework === 'none' ? 'None' : 
                         getAvailableFrameworks().find(f => f.id === formData.framework)?.label}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Goal</label>
                      <p className="font-medium">
                        {GOALS.find(g => g.id === formData.goal)?.label}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Timeline</label>
                      <p className="font-medium">
                        {TIMELINES.find(t => t.id === formData.timeline)?.label}
                      </p>
                    </div>
                  </div>

                  {formData.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-sm">{formData.description}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {formData.initGit && (
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <GitBranch className="w-3 h-3" />
                        <span>Git</span>
                      </Badge>
                    )}
                    {formData.useAiScaffolding && (
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Brain className="w-3 h-3" />
                        <span>AI Assistant</span>
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onClose : handleBack}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>

            <div className="flex items-center space-x-3">
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} disabled={!formData.name || !formData.type}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
