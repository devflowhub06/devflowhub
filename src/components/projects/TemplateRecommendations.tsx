'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Database, 
  Palette, 
  Rocket, 
  CheckCircle,
  ArrowRight 
} from 'lucide-react'

interface TemplateRecommendationsProps {
  templateId: string | null
  onRecommendationClick: (recommendation: string) => void
}

const recommendations = {
  'todo-app': [
    {
      id: 'auth',
      title: 'Add Authentication',
      description: 'Secure your todo app with user authentication',
      icon: Shield,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      action: 'Add Auth'
    },
    {
      id: 'database',
      title: 'Database Setup',
      description: 'Connect to a real database for data persistence',
      icon: Database,
      color: 'bg-green-50 border-green-200 text-green-800',
      action: 'Setup DB'
    },
    {
      id: 'ui-components',
      title: 'UI Components',
      description: 'Add beautiful UI components and styling',
      icon: Palette,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      action: 'Add UI'
    },
    {
      id: 'deployment',
      title: 'Deployment Setup',
      description: 'Deploy your app to production',
      icon: Rocket,
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      action: 'Deploy'
    }
  ],
  'blog-nextjs': [
    {
      id: 'auth',
      title: 'Admin Authentication',
      description: 'Add admin panel with secure authentication',
      icon: Shield,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      action: 'Add Auth'
    },
    {
      id: 'database',
      title: 'CMS Database',
      description: 'Setup content management system',
      icon: Database,
      color: 'bg-green-50 border-green-200 text-green-800',
      action: 'Setup CMS'
    },
    {
      id: 'ui-components',
      title: 'Blog Components',
      description: 'Add blog-specific UI components',
      icon: Palette,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      action: 'Add Components'
    },
    {
      id: 'deployment',
      title: 'Static Deployment',
      description: 'Deploy as static site with Vercel',
      icon: Rocket,
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      action: 'Deploy'
    }
  ],
  'api-server': [
    {
      id: 'auth',
      title: 'API Authentication',
      description: 'Add JWT authentication to your API',
      icon: Shield,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      action: 'Add JWT'
    },
    {
      id: 'database',
      title: 'Database Integration',
      description: 'Connect to PostgreSQL or MongoDB',
      icon: Database,
      color: 'bg-green-50 border-green-200 text-green-800',
      action: 'Setup DB'
    },
    {
      id: 'ui-components',
      title: 'API Documentation',
      description: 'Generate interactive API documentation',
      icon: Palette,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      action: 'Add Docs'
    },
    {
      id: 'deployment',
      title: 'API Deployment',
      description: 'Deploy to cloud platform',
      icon: Rocket,
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      action: 'Deploy API'
    }
  ],
  'empty-project': [
    {
      id: 'auth',
      title: 'Authentication System',
      description: 'Start with a complete auth system',
      icon: Shield,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      action: 'Add Auth'
    },
    {
      id: 'database',
      title: 'Database Setup',
      description: 'Choose and setup your database',
      icon: Database,
      color: 'bg-green-50 border-green-200 text-green-800',
      action: 'Setup DB'
    },
    {
      id: 'ui-components',
      title: 'UI Framework',
      description: 'Add a UI framework and components',
      icon: Palette,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      action: 'Add UI'
    },
    {
      id: 'deployment',
      title: 'Deployment Pipeline',
      description: 'Setup CI/CD and deployment',
      icon: Rocket,
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      action: 'Setup Deploy'
    }
  ]
}

export function TemplateRecommendations({ 
  templateId, 
  onRecommendationClick 
}: TemplateRecommendationsProps) {
  if (!templateId) return null

  const templateRecommendations = recommendations[templateId as keyof typeof recommendations] || []

  if (templateRecommendations.length === 0) return null

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Recommended Next Steps
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enhance your project with these recommended features
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templateRecommendations.map((rec) => {
            const Icon = rec.icon
            return (
              <Card
                key={rec.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${rec.color}`}
                onClick={() => onRecommendationClick(rec.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/50">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{rec.title}</h4>
                        <p className="text-xs opacity-80 mt-1">{rec.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-6 px-2"
                    >
                      {rec.action}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
