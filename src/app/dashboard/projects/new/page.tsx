'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToolRecommendation } from '@/components/projects/ToolRecommendation'
import { TemplatesPicker } from '@/components/projects/TemplatesPicker'
import { TemplateRecommendations } from '@/components/projects/TemplateRecommendations'
import { projectTypes, ToolType, getToolRecommendation } from '@/lib/tool-recommendations'
import { Zap, Sparkles } from 'lucide-react'
import { templates } from '@/lib/templates'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

export default function NewProjectPage() {
  const router = useRouter()
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: 'My Project',
    description: 'A new project',
    type: 'new-project', // Default to "New Project + Rapid Prototype"
    selectedTool: null as ToolType | null
  })
  const [language, setLanguage] = useState('JavaScript')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    // Allow unauthenticated users to create projects
    // They will be prompted to sign up after project creation
    if (status === 'unauthenticated') {
      console.log('User is unauthenticated, allowing project creation')
    }
  }, [status])

  useEffect(() => {
    if (step === 2 && formData.type && formData.selectedTool === null) {
      const recommended = getToolRecommendation(formData.type as any);
      setFormData(prev => ({ ...prev, selectedTool: recommended.tool }));
    }
  }, [step, formData.type, formData.selectedTool, setFormData]);

  // Apply template prefill
  useEffect(() => {
    if (selectedTemplate) {
      const tpl = templates.find(t => t.id === selectedTemplate)
      if (tpl) {
        setFormData(prev => ({
          ...prev,
          name: tpl.name,
          type: tpl.type,
          description: tpl.description,
        }))
        setLanguage(tpl.language)
      }
    } else {
      // Handle "Start from Scratch" case - ensure we have valid defaults
      setFormData(prev => ({
        ...prev,
        name: prev.name || 'My Project',
        type: prev.type || 'new-project',
        description: prev.description || 'A new project',
        selectedTool: prev.selectedTool || null
      }))
      setLanguage('JavaScript')
    }
  }, [selectedTemplate])

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  const handleToolSelect = useCallback((tool: ToolType) => {
    setFormData(prev => ({ ...prev, selectedTool: tool }))
    setError(null)
  }, [])

  const handleTemplateContinue = () => {
    console.log('Template continue clicked, selectedTemplate:', selectedTemplate)
    setShowTemplates(false)
    setStep(1) // Start with step 1 (project details form)
    
        // If starting from scratch, ensure we have proper defaults
        if (!selectedTemplate) {
          setFormData(prev => ({
            ...prev,
            name: prev.name || 'My Project',
            type: prev.type || 'new-project',
            description: prev.description || 'A new project',
            selectedTool: prev.selectedTool || null
          }))
          setLanguage('JavaScript')
        }
  }

  const handleRecommendationClick = (recommendation: string) => {
    console.log('Recommendation clicked:', recommendation)
    toast.success(`Added ${recommendation} to your project!`, {
      description: 'This feature will be available in your workspace'
    })
  }

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Project name is required')
      return
    }
    if (!formData.description.trim()) {
      setError('Project description is required')
      return
    }
    if (!formData.type) {
      setError('Project type is required')
      return
    }

    setStep(2);
  }

  const handleFinalSubmit = async (tool: ToolType | null) => {
    if (isLoading) return; // Prevent double submission
    setError(null)
    if (!tool) {
      console.error("Attempted to create project with no tool selected.")
      setError('Please select a development tool')
      return
    }

    console.log("Attempting to create project with formData:", formData)
    console.log("Selected tool for submission:", tool)

    setIsLoading(true)
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          selectedTool: tool,
          language,
          templateId: selectedTemplate || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create project')
      }

      const data = await response.json()
      getRoutingToast(formData.type, language)
      
      console.log('Project creation response:', data)
      console.log('Session status:', { session, status })
      
      // For both authenticated and unauthenticated users, use workspaceUrl if available
      if (data.workspaceUrl) {
        console.log('Redirecting to workspace:', data.workspaceUrl)
        router.push(data.workspaceUrl)
        return
      }
      
      // For authenticated users without workspace URL, go to dashboard
      if (session) {
        console.log('Authenticated user, redirecting to dashboard')
        router.push('/dashboard')
        return
      }
      
      // For unauthenticated users without workspace URL, redirect to signup with project data
      console.log('No session found, redirecting to signup with project data')
      const projectData = encodeURIComponent(JSON.stringify({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        language: language,
        templateId: selectedTemplate,
        isDemo: data.isDemo || false
      }))
      router.push(`/signup?project=${projectData}`)
    } catch (error) {
      console.error('Error creating project:', error)
      setError(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoutingToast = (projectType: string, language: string) => {
    try {
      // Map common project types to valid ProjectType values
      const projectTypeMap: Record<string, string> = {
        'web-app': 'new-project',
        'api': 'new-project',
        'mobile-app': 'new-project',
        'desktop-app': 'new-project',
        'library': 'existing-code',
        'microservice': 'new-project',
        'fullstack': 'new-project',
        'frontend': 'ui-design',
        'backend': 'new-project',
        'data-science': 'complex-logic',
        'machine-learning': 'complex-logic',
        'blockchain': 'complex-logic',
        'game': 'new-project',
        'cli': 'new-project',
        'plugin': 'existing-code',
        'extension': 'existing-code',
        'integration': 'existing-code',
        'migration': 'existing-code',
        'refactor': 'existing-code',
        'optimization': 'existing-code',
        'testing': 'existing-code',
        'documentation': 'existing-code',
        'deployment': 'deployment-ready',
        'devops': 'deployment-ready',
        'infrastructure': 'deployment-ready',
        'monitoring': 'deployment-ready',
        'analytics': 'deployment-ready'
      }
      
      // Get the mapped project type or default to 'new-project'
      const mappedType = projectTypeMap[projectType.toLowerCase()] || 'new-project'
      
      const recommendation = getToolRecommendation(mappedType as any)
      const toolName = recommendation.tool
      const reasons: Record<string, string> = {
        'editor': 'best for code editing and refactoring',
        'sandbox': 'perfect for rapid prototyping',
        'ui-studio': 'ideal for UI/UX design',
        'deployer': 'great for quick iterations'
      }
      toast.success(`✨ Project created successfully!`, {
        icon: '🚀',
        duration: 4000,
        description: 'Your project is ready to use'
      })
    } catch (error) {
      console.error('Error in getRoutingToast:', error)
      toast.success(`✨ Project created successfully!`, {
        icon: '🚀',
        duration: 4000,
        description: 'Your project is ready to use'
      })
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Zap className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Allow both authenticated and unauthenticated users to create projects

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          <Zap className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
          <p className="text-muted-foreground">
            Create a new project and select the appropriate DevFlowHub module
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showTemplates ? (
        <TemplatesPicker
          selectedTemplate={selectedTemplate}
          onTemplateSelect={setSelectedTemplate}
          onContinue={handleTemplateContinue}
          onBack={() => setShowTemplates(false)}
        />
      ) : (
        <form onSubmit={step === 1 ? handleInitialSubmit : (e) => { e.preventDefault(); handleFinalSubmit(formData.selectedTool); }} className="space-y-6">
          {step === 1 ? (
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Enter the basic information about your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Project Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter project name"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your project"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Project Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Language *</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  required
                  disabled={isLoading}
                >
                  <option value="JavaScript">JavaScript</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="Go">Go</option>
                  <option value="Rust">Rust</option>
                  <option value="PHP">PHP</option>
                  <option value="C#">C#</option>
                  <option value="C++">C++</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* Choose Template Button */}
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTemplates(true)}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Choose from Templates (Optional)
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          formData.type && (
            <ToolRecommendation
              projectType={formData.type}
              projectName={formData.name}
              selectedTool={formData.selectedTool}
              onToolSelect={handleToolSelect}
            />
          )
        )}

        {/* Template Recommendations */}
        {selectedTemplate && step === 2 && (
          <TemplateRecommendations
            templateId={selectedTemplate}
            onRecommendationClick={handleRecommendationClick}
          />
        )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Zap className="animate-spin h-5 w-5 mr-2" />
                  {step === 1 ? 'Next' : 'Creating Project...'}
                </>
              ) : (
                step === 1 ? 'Next' : 'Create Project'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
} 