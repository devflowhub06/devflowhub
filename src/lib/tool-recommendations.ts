export type ProjectType = 
  | 'new-project'
  | 'existing-code'
  | 'ui-design'
  | 'quick-iteration'
  | 'complex-logic'
  | 'deployment-ready'

// Branded module identifiers
export type ToolType = 'editor' | 'sandbox' | 'ui-studio' | 'deployer'

interface ToolRecommendation {
  tool: ToolType
  reason: string
}

const routingRules: Record<ProjectType, ToolRecommendation> = {
  'new-project': {
    tool: 'sandbox',
    reason: 'Rapid prototyping and quick setup'
  },
  'existing-code': {
    tool: 'editor',
    reason: 'Advanced refactoring and code analysis'
  },
  'ui-design': {
    tool: 'ui-studio',
    reason: 'Specialized UI/UX design tools'
  },
  'quick-iteration': {
    tool: 'deployer',
    reason: 'Fast development cycles and quick feedback'
  },
  'complex-logic': {
    tool: 'editor',
    reason: 'Advanced code intelligence and refactoring'
  },
  'deployment-ready': {
    tool: 'deployer',
    reason: 'Integrated deployment and hosting'
  }
}

// Type guard to check if a string is a valid ProjectType
function isValidProjectType(type: string): type is ProjectType {
  return type in routingRules
}

export function getToolRecommendation(projectType: ProjectType): ToolRecommendation {
  // Add type validation
  if (!isValidProjectType(projectType)) {
    console.warn('Invalid project type:', projectType)
    return {
      tool: 'editor',
      reason: 'Best for general development'
    }
  }
  
  const recommendation = routingRules[projectType]
  if (!recommendation) {
    console.warn('Unknown project type:', projectType)
    return {
      tool: 'editor',
      reason: 'Best for general development'
    }
  }
  return recommendation
}

export function getRecommendationMessage(projectType: ProjectType, projectName: string): string {
  try {
    const recommendation = getToolRecommendation(projectType)
    
    // Add safety check for undefined recommendation
    if (!recommendation || !recommendation.tool) {
      console.warn('Invalid project type or recommendation:', projectType)
      return 'Recommended: DevFlowHub Editor — Best for general development'
    }
    
    const nameMap: Record<ToolType, string> = {
      'editor': 'DevFlowHub Editor',
      'sandbox': 'DevFlowHub Sandbox',
      'ui-studio': 'DevFlowHub UI Studio',
      'deployer': 'DevFlowHub Deployer'
    }
    return `Recommended: ${nameMap[recommendation.tool]} — ${recommendation.reason}`
  } catch (error) {
    console.error('Error in getRecommendationMessage:', error)
    return 'Recommended: DevFlowHub Editor — Best for general development'
  }
}

export const projectTypes = [
  { id: 'new-project', label: 'New Project + Rapid Prototype' },
  { id: 'existing-code', label: 'Existing Code + Refactoring' },
  { id: 'ui-design', label: 'UI/Design needs' },
  { id: 'quick-iteration', label: 'Quick iterations' },
  { id: 'complex-logic', label: 'Complex logic' },
  { id: 'deployment-ready', label: 'Deployment ready' }
] as const 