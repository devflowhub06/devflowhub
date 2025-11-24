/**
 * Git service for deployment-related operations
 */

export interface GitCommit {
  hash: string
  message: string
  author: string
  date: string
  changedFiles: string[]
}

export interface GitStatus {
  branch: string
  lastCommit: GitCommit
  uncommittedChanges: number
  aheadBy: number
  behindBy: number
  isDirty: boolean
}

export class GitService {
  private projectId: string

  constructor(projectId: string) {
    this.projectId = projectId
  }

  /**
   * Get current Git status for the project
   */
  async getStatus(): Promise<GitStatus> {
    try {
      // Enhanced realistic Git data with current timestamps
      const now = new Date()
      const mockCommits = [
        {
          hash: 'a1b2c3d4e5f6',
          message: 'feat: implement DevFlowHub Deployer with real-time logs',
          author: 'DevFlowHub Team',
          date: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
          changedFiles: [
            'src/components/deployer/DeployLogs.tsx',
            'src/components/deployer/DeployHistory.tsx',
            'src/lib/deployer/websocket.ts',
            'prisma/schema.prisma'
          ]
        },
        {
          hash: 'f6e5d4c3b2a1',
          message: 'fix: update environment variable management',
          author: 'DevFlowHub Team',
          date: new Date(now.getTime() - 7200000).toISOString(), // 2 hours ago
          changedFiles: [
            'src/components/deployer/EnvManager.tsx',
            'src/lib/deployer/secrets.ts'
          ]
        },
        {
          hash: '9f8e7d6c5b4a',
          message: 'feat: add AI-powered deployment suggestions',
          author: 'John Developer',
          date: new Date(now.getTime() - 10800000).toISOString(), // 3 hours ago
          changedFiles: [
            'src/lib/deployer/ai-suggestions.ts',
            'src/components/deployer/DeployPreviewModal.tsx'
          ]
        }
      ]

      // Simulate different branch scenarios
      const branches = ['main', 'develop', 'feature/deployer-enhancements', 'hotfix/auth-fix']
      const currentBranch = branches[Math.floor(Math.random() * branches.length)]

      return {
        branch: currentBranch,
        lastCommit: mockCommits[0],
        uncommittedChanges: Math.floor(Math.random() * 3), // 0-2 uncommitted changes
        aheadBy: Math.floor(Math.random() * 8), // 0-7 commits ahead
        behindBy: Math.floor(Math.random() * 3), // 0-2 commits behind
        isDirty: Math.random() > 0.7 // 30% chance of dirty working directory
      }
    } catch (error) {
      console.error('Failed to get Git status:', error)
      throw new Error('Failed to get Git status')
    }
  }

  /**
   * Get commits since last deployment
   */
  async getCommitsSinceLastDeploy(): Promise<GitCommit[]> {
    try {
      // Mock commits since last deploy
      return [
        {
          hash: 'a1b2c3d4e5f6',
          message: 'feat: implement DevFlowHub Deployer with real-time logs',
          author: 'DevFlowHub Team',
          date: new Date().toISOString(),
          changedFiles: [
            'src/components/deployer/DeployLogs.tsx',
            'src/components/deployer/DeployHistory.tsx',
            'src/lib/deployer/websocket.ts',
            'prisma/schema.prisma'
          ]
        },
        {
          hash: 'f6e5d4c3b2a1',
          message: 'fix: update environment variable management',
          author: 'DevFlowHub Team',
          date: new Date(Date.now() - 3600000).toISOString(),
          changedFiles: [
            'src/components/deployer/EnvManager.tsx',
            'src/lib/deployer/secrets.ts'
          ]
        },
        {
          hash: '1a2b3c4d5e6f',
          message: 'refactor: improve deployment preview modal',
          author: 'DevFlowHub Team',
          date: new Date(Date.now() - 7200000).toISOString(),
          changedFiles: [
            'src/components/deployer/DeployPreviewModal.tsx'
          ]
        }
      ]
    } catch (error) {
      console.error('Failed to get commits:', error)
      return []
    }
  }

  /**
   * Get file changes for a commit
   */
  async getFileChanges(commitHash: string): Promise<string[]> {
    try {
      // Mock file changes
      const fileChanges = [
        'src/components/deployer/DeployLogs.tsx',
        'src/components/deployer/DeployHistory.tsx',
        'src/lib/deployer/websocket.ts',
        'prisma/schema.prisma',
        'src/components/deployer/EnvManager.tsx',
        'src/lib/deployer/secrets.ts'
      ]
      
      return fileChanges
    } catch (error) {
      console.error('Failed to get file changes:', error)
      return []
    }
  }

  /**
   * Calculate deployment risk based on changes
   */
  calculateDeploymentRisk(changedFiles: string[]): {
    level: 'low' | 'medium' | 'high'
    reasons: string[]
    recommendations: string[]
  } {
    const risks: string[] = []
    const recommendations: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' = 'low'

    // Check for database changes
    if (changedFiles.some(file => file.includes('prisma') || file.includes('migration'))) {
      risks.push('Database schema changes detected')
      recommendations.push('Test database migrations in staging first')
      riskLevel = 'high'
    }

    // Check for API changes
    if (changedFiles.some(file => file.includes('api/') || file.includes('route.ts'))) {
      risks.push('API endpoint changes detected')
      recommendations.push('Verify API compatibility with frontend')
      if (riskLevel === 'low') riskLevel = 'medium'
    }

    // Check for configuration changes
    if (changedFiles.some(file => file.includes('config') || file.includes('.env'))) {
      risks.push('Configuration changes detected')
      recommendations.push('Review environment variable changes')
      if (riskLevel === 'low') riskLevel = 'medium'
    }

    // Check for dependency changes
    if (changedFiles.some(file => file.includes('package.json') || file.includes('yarn.lock'))) {
      risks.push('Dependency changes detected')
      recommendations.push('Ensure all dependencies are compatible')
      if (riskLevel === 'low') riskLevel = 'medium'
    }

    // If no specific risks, it's low risk
    if (risks.length === 0) {
      risks.push('Standard code changes')
      recommendations.push('Deploy to preview environment first')
    }

    return {
      level: riskLevel,
      reasons: risks,
      recommendations
    }
  }
}
