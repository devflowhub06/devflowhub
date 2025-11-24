'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToolType, getToolRecommendation, getRecommendationMessage } from '@/lib/tool-recommendations'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ToolRecommendationProps {
  projectType: string
  projectName: string
  selectedTool: ToolType | null; // Now received as a prop
  onToolSelect: (tool: ToolType) => void
}

export function ToolRecommendation({ projectType, projectName, selectedTool, onToolSelect }: ToolRecommendationProps) {
  // Early return if projectType is empty or invalid
  if (!projectType || projectType.trim() === '') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Tool</CardTitle>
          <CardDescription>Please select a project type first</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Choose a project type to see tool recommendations.</p>
        </CardContent>
      </Card>
    )
  }

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
  
  let recommendation
  let message
  
  try {
    recommendation = getToolRecommendation(mappedType as any)
    message = getRecommendationMessage(mappedType as any, projectName)
  } catch (error) {
    console.error('Error in ToolRecommendation:', error)
    // Fallback values
    recommendation = { tool: 'editor', reason: 'Best for general development' }
    message = 'Recommended: DevFlowHub Editor — Best for general development'
  }
  
  // Determine if the currently selected tool is different from the recommendation
  const isOverridden = selectedTool !== null && selectedTool !== recommendation.tool;

  const handleToolSelect = (tool: ToolType) => {
    onToolSelect(tool)
  }

  const handleUseRecommended = () => {
    onToolSelect(recommendation.tool)
  }

  const getToolExplanation = (tool: string, projectType: string) => {
    const explanations: Record<string, Record<string, string>> = {
      'DevFlowHub Editor': {
        'Web App': 'Perfect for React/Next.js development with AI-powered code completion',
        'API': 'Excellent for backend logic and complex algorithms',
        'Mobile App': 'Great for React Native and cross-platform development',
        'default': 'Best for professional code editing and refactoring'
      },
      'DevFlowHub Sandbox': {
        'Web App': 'Ideal for rapid prototyping and quick iterations',
        'API': 'Perfect for testing APIs and backend services',
        'default': 'Great for collaborative coding and instant deployment'
      },
      'DevFlowHub UI Studio': {
        'Web App': 'AI-powered UI generation for React components',
        'default': 'Perfect for creating beautiful user interfaces'
      },
      'DevFlowHub Deployer': {
        'Web App': 'Lightning-fast development with instant preview',
        'default': 'Great for quick iterations and immediate feedback'
      }
    }
    return explanations[tool]?.[projectType] || explanations[tool]?.default
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Tool</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOverridden && (
          <Alert variant="warning">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              You've chosen a different tool than recommended. This might affect the development workflow.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex items-center gap-2">
          <Badge variant={selectedTool === recommendation.tool ? 'default' : 'secondary'}>
            {selectedTool === recommendation.tool ? 'Recommended' : 'Available'}
          </Badge>
          {selectedTool === recommendation.tool && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{getToolExplanation(recommendation.tool.charAt(0).toUpperCase() + recommendation.tool.slice(1), projectType)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can switch to any tool anytime
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={selectedTool || recommendation.tool}
            onValueChange={(value) => handleToolSelect(value as ToolType)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">DevFlowHub Sandbox</SelectItem>
              <SelectItem value="editor">DevFlowHub Editor</SelectItem>
              <SelectItem value="ui-studio">DevFlowHub UI Studio</SelectItem>
              <SelectItem value="deployer">DevFlowHub Deployer</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUseRecommended}
            className="text-muted-foreground"
          >
            Use Recommended
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 