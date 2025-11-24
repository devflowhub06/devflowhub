/**
 * AI-powered deployment suggestions service
 */

import { GitCommit, GitStatus } from './git-service'

export interface DeploymentSuggestion {
  type: 'recommendation' | 'warning' | 'optimization' | 'security'
  title: string
  description: string
  action?: string
  priority: 'low' | 'medium' | 'high'
  icon: string
}

export interface AIDeploymentPlan {
  recommendedEnvironment: 'preview' | 'staging' | 'production'
  recommendedProvider: 'vercel' | 'netlify'
  estimatedCost: number
  estimatedBuildTime: number
  confidence: number
  rationale: string
  suggestions: DeploymentSuggestion[]
  risks: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
  }
}

export class AIDeploymentSuggestions {
  private projectId: string

  constructor(projectId: string) {
    this.projectId = projectId
  }

  /**
   * Generate AI-powered deployment plan
   */
  async generateDeploymentPlan(
    gitStatus: GitStatus,
    environment: string,
    changedFiles: string[]
  ): Promise<AIDeploymentPlan> {
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1000))

      const suggestions = this.analyzeSuggestions(gitStatus, changedFiles, environment)
      const risks = this.analyzeRisks(changedFiles, environment)
      const costs = this.estimateCosts(changedFiles, environment)

      return {
        recommendedEnvironment: this.getRecommendedEnvironment(gitStatus, environment),
        recommendedProvider: 'vercel', // Default to Vercel
        estimatedCost: costs.total,
        estimatedBuildTime: this.estimateBuildTime(changedFiles),
        confidence: this.calculateConfidence(suggestions, risks),
        rationale: this.generateRationale(gitStatus, suggestions, risks),
        suggestions,
        risks
      }
    } catch (error) {
      console.error('Failed to generate deployment plan:', error)
      throw new Error('Failed to generate deployment plan')
    }
  }

  private analyzeSuggestions(
    gitStatus: GitStatus,
    changedFiles: string[],
    environment: string
  ): DeploymentSuggestion[] {
    const suggestions: DeploymentSuggestion[] = []

    // Analyze commit frequency
    if (gitStatus.aheadBy > 5) {
      suggestions.push({
        type: 'recommendation',
        title: 'Multiple commits detected',
        description: `${gitStatus.aheadBy} commits since last deploy. Consider staging first.`,
        action: 'Deploy to staging environment first',
        priority: 'medium',
        icon: 'GitBranch'
      })
    }

    // Analyze file changes
    if (changedFiles.some(file => file.includes('prisma') || file.includes('migration'))) {
      suggestions.push({
        type: 'warning',
        title: 'Database changes detected',
        description: 'Schema changes require careful deployment planning.',
        action: 'Run migrations in staging first',
        priority: 'high',
        icon: 'AlertTriangle'
      })
    }

    // Check for large assets
    if (changedFiles.some(file => file.includes('.png') || file.includes('.jpg') || file.includes('.svg'))) {
      suggestions.push({
        type: 'optimization',
        title: 'Image assets detected',
        description: 'Consider optimizing images to reduce bundle size.',
        action: 'Enable automatic image optimization',
        priority: 'low',
        icon: 'Zap'
      })
    }

    // Environment-specific suggestions
    if (environment === 'production') {
      suggestions.push({
        type: 'security',
        title: 'Production deployment',
        description: 'Ensure all environment variables are properly configured.',
        action: 'Review production environment variables',
        priority: 'high',
        icon: 'Shield'
      })
    }

    // Performance suggestions
    if (changedFiles.length > 10) {
      suggestions.push({
        type: 'optimization',
        title: 'Large changeset detected',
        description: 'Consider incremental deployment strategy.',
        action: 'Deploy in smaller batches',
        priority: 'medium',
        icon: 'TrendingUp'
      })
    }

    return suggestions
  }

  private analyzeRisks(changedFiles: string[], environment: string): {
    level: 'low' | 'medium' | 'high'
    factors: string[]
  } {
    const factors: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' = 'low'

    // Database risks
    if (changedFiles.some(file => file.includes('prisma'))) {
      factors.push('Database schema changes')
      riskLevel = 'high'
    }

    // API risks
    if (changedFiles.some(file => file.includes('api/'))) {
      factors.push('API endpoint modifications')
      if (riskLevel === 'low') riskLevel = 'medium'
    }

    // Configuration risks
    if (changedFiles.some(file => file.includes('config') || file.includes('.env'))) {
      factors.push('Configuration changes')
      if (riskLevel === 'low') riskLevel = 'medium'
    }

    // Production-specific risks
    if (environment === 'production') {
      factors.push('Production environment deployment')
      if (riskLevel === 'low') riskLevel = 'medium'
    }

    return { level: riskLevel, factors }
  }

  private estimateCosts(changedFiles: string[], environment: string): {
    build: number
    hosting: number
    total: number
  } {
    let baseCost = 0.05 // Base cost in USD

    // Adjust based on file count
    baseCost += changedFiles.length * 0.001

    // Environment multiplier
    const multipliers = {
      preview: 1,
      staging: 1.5,
      production: 2
    }

    const multiplier = multipliers[environment as keyof typeof multipliers] || 1
    const buildCost = baseCost * multiplier
    const hostingCost = buildCost * 0.3 // Hosting is typically 30% of build cost

    return {
      build: buildCost,
      hosting: hostingCost,
      total: buildCost + hostingCost
    }
  }

  private estimateBuildTime(changedFiles: string[]): number {
    // Base build time in seconds
    let baseTime = 120

    // Adjust based on file types and count
    if (changedFiles.some(file => file.includes('node_modules') || file.includes('package.json'))) {
      baseTime += 60 // Extra time for dependency changes
    }

    if (changedFiles.length > 20) {
      baseTime += 30 // Extra time for large changesets
    }

    return baseTime
  }

  private getRecommendedEnvironment(
    gitStatus: GitStatus,
    requestedEnvironment: string
  ): 'preview' | 'staging' | 'production' {
    // If requesting production but there are many changes, recommend staging
    if (requestedEnvironment === 'production' && gitStatus.aheadBy > 3) {
      return 'staging'
    }

    // If there are uncommitted changes, recommend preview
    if (gitStatus.isDirty) {
      return 'preview'
    }

    return requestedEnvironment as 'preview' | 'staging' | 'production'
  }

  private calculateConfidence(
    suggestions: DeploymentSuggestion[],
    risks: { level: string }
  ): number {
    let confidence = 0.9 // Start with high confidence

    // Reduce confidence based on risks
    if (risks.level === 'high') {
      confidence -= 0.3
    } else if (risks.level === 'medium') {
      confidence -= 0.15
    }

    // Reduce confidence based on number of warnings
    const warnings = suggestions.filter(s => s.type === 'warning').length
    confidence -= warnings * 0.1

    return Math.max(0.1, Math.min(1.0, confidence))
  }

  private generateRationale(
    gitStatus: GitStatus,
    suggestions: DeploymentSuggestion[],
    risks: { level: string; factors: string[] }
  ): string {
    const parts: string[] = []

    // Git status rationale
    if (gitStatus.aheadBy > 0) {
      parts.push(`${gitStatus.aheadBy} commits ahead of last deployment`)
    }

    // Risk rationale
    if (risks.level === 'high') {
      parts.push('High-risk changes detected requiring careful deployment')
    } else if (risks.level === 'medium') {
      parts.push('Medium-risk changes requiring staging validation')
    } else {
      parts.push('Low-risk changes suitable for direct deployment')
    }

    // Suggestion rationale
    const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high').length
    if (highPrioritySuggestions > 0) {
      parts.push(`${highPrioritySuggestions} high-priority recommendations`)
    }

    return parts.join('. ') + '.'
  }
}
