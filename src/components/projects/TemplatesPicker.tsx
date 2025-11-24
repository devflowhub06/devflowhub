'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { templates, ProjectTemplate } from '@/lib/templates'
import { Check, Sparkles, Code, Globe, Server } from 'lucide-react'

interface TemplatesPickerProps {
  selectedTemplate: string | null
  onTemplateSelect: (templateId: string | null) => void
  onContinue: () => void
  onBack?: () => void
}

const templateIcons = {
  'todo-app': Code,
  'blog-nextjs': Globe,
  'api-server': Server,
  'empty-project': Sparkles
}

export function TemplatesPicker({ 
  selectedTemplate, 
  onTemplateSelect, 
  onContinue,
  onBack 
}: TemplatesPickerProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)

  const getTemplateIcon = (template: ProjectTemplate) => {
    const Icon = templateIcons[template.id as keyof typeof templateIcons] || Sparkles
    return <Icon className="h-6 w-6" />
  }

  const getTemplateColor = (template: ProjectTemplate) => {
    switch (template.id) {
      case 'todo-app':
        return 'bg-blue-50 border-blue-200 hover:border-blue-300'
      case 'blog-nextjs':
        return 'bg-green-50 border-green-200 hover:border-green-300'
      case 'api-server':
        return 'bg-purple-50 border-purple-200 hover:border-purple-300'
      case 'empty-project':
        return 'bg-gray-50 border-gray-200 hover:border-gray-300'
      default:
        return 'bg-gray-50 border-gray-200 hover:border-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose a Template
        </h2>
        <p className="text-gray-600">
          Start with a pre-built template or create from scratch
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id
          const isHovered = hoveredTemplate === template.id
          
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-500' 
                  : getTemplateColor(template)
              } ${isHovered ? 'shadow-lg scale-105' : 'shadow-sm'}`}
              onClick={() => onTemplateSelect(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-100' : 'bg-white'
                  }`}>
                    {getTemplateIcon(template)}
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {template.language}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.framework}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 2 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        +{template.tags.length - 2}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {template.files.length} files included
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex space-x-3">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
            >
              ← Back to Form
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onTemplateSelect(null)}
            className={selectedTemplate ? '' : 'hidden'}
          >
            Clear Selection
          </Button>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              onTemplateSelect(null)
              onContinue() // Immediately continue with empty template
            }}
          >
            Start from Scratch
          </Button>
          
          <Button
            onClick={onContinue}
            disabled={!selectedTemplate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continue with Template
          </Button>
        </div>
      </div>
    </div>
  )
}
