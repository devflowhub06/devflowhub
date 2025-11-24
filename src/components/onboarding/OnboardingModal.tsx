'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  Sparkles, 
  Rocket, 
  Database, 
  Globe,
  Server,
  Zap,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  description: string
  language: string
  framework: string
  category: 'frontend' | 'backend' | 'fullstack' | 'api' | 'empty'
  icon: React.ReactNode
  tags: string[]
}

const templates: Template[] = [
  {
    id: 'nextjs-app',
    name: 'Next.js App',
    description: 'Modern React framework with SSR, API routes, and file-based routing',
    language: 'TypeScript',
    framework: 'Next.js',
    category: 'frontend',
    icon: <Globe className="h-6 w-6" />,
    tags: ['React', 'SSR', 'TypeScript']
  },
  {
    id: 'react-app',
    name: 'React App',
    description: 'Single-page application with React and Vite',
    language: 'TypeScript',
    framework: 'React',
    category: 'frontend',
    icon: <Code className="h-6 w-6" />,
    tags: ['React', 'Vite', 'TypeScript']
  },
  {
    id: 'express-api',
    name: 'Express API',
    description: 'RESTful API server with Express and TypeScript',
    language: 'TypeScript',
    framework: 'Express',
    category: 'backend',
    icon: <Server className="h-6 w-6" />,
    tags: ['Node.js', 'Express', 'REST']
  },
  {
    id: 'python-fastapi',
    name: 'FastAPI',
    description: 'Modern Python API with automatic docs and async support',
    language: 'Python',
    framework: 'FastAPI',
    category: 'api',
    icon: <Zap className="h-6 w-6" />,
    tags: ['Python', 'FastAPI', 'Async']
  },
  {
    id: 'nextjs-fullstack',
    name: 'Next.js Full-Stack',
    description: 'Complete app with frontend, API routes, and database',
    language: 'TypeScript',
    framework: 'Next.js',
    category: 'fullstack',
    icon: <Rocket className="h-6 w-6" />,
    tags: ['Next.js', 'Prisma', 'Full-Stack']
  },
  {
    id: 'express-prisma',
    name: 'Express + Prisma',
    description: 'Backend API with Express, Prisma ORM, and PostgreSQL',
    language: 'TypeScript',
    framework: 'Express',
    category: 'backend',
    icon: <Database className="h-6 w-6" />,
    tags: ['Express', 'Prisma', 'PostgreSQL']
  },
  {
    id: 'empty',
    name: 'Empty Project',
    description: 'Start from scratch with a blank project',
    language: 'JavaScript',
    framework: 'None',
    category: 'empty',
    icon: <Sparkles className="h-6 w-6" />,
    tags: ['Blank']
  }
]

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (templateId: string) => void
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isCreating, setIsCreating] = useState(false)

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'frontend', name: 'Frontend' },
    { id: 'backend', name: 'Backend' },
    { id: 'fullstack', name: 'Full-Stack' },
    { id: 'api', name: 'API' }
  ]

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

  const handleCreateProject = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template')
      return
    }

    setIsCreating(true)
    try {
      const template = templates.find(t => t.id === selectedTemplate)
      if (!template) return

      // Create project with selected template
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `My ${template.name} Project`,
          description: `A new ${template.name} project`,
          type: 'new-project',
          language: template.language,
          framework: template.framework === 'None' ? null : template.framework,
          templateId: selectedTemplate === 'empty' ? null : selectedTemplate,
          selectedTool: 'EDITOR'
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Project created successfully!')
        
        // Mark onboarding step complete
        await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: 'createdFirstProject' })
        })

        // Close modal and navigate to workspace with onboarding flag
        onComplete(selectedTemplate)
        // Navigate to workspace with onboarding=true to trigger tour
        router.push(`/dashboard/projects/${data.project.id}/workspace?module=editor&onboarding=true`)
      } else {
        throw new Error('Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'backend': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'fullstack': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'api': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-accent-warn" />
            <span>Welcome to DevFlowHub!</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Choose a template to get started, or start from scratch. We'll set up your workspace automatically.
          </DialogDescription>
        </DialogHeader>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={
                selectedCategory === category.id
                  ? 'bg-accent-warn text-white border-accent-warn'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedTemplate === template.id
                  ? 'border-accent-warn bg-accent-warn/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-700 text-accent-warn">
                      {template.icon}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-white">
                        {template.name}
                      </CardTitle>
                      <Badge className={`mt-1 text-xs ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  {selectedTemplate === template.id && (
                    <CheckCircle2 className="h-5 w-5 text-accent-warn flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs text-slate-400 mb-3">
                  {template.description}
                </CardDescription>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs border-slate-600 text-slate-400"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleCreateProject}
            disabled={!selectedTemplate || isCreating}
            className="bg-accent-warn hover:bg-accent-warn/90 text-white"
          >
            {isCreating ? (
              <>Creating...</>
            ) : (
              <>
                Create Project
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

