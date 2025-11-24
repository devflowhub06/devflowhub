import { prisma } from '@/lib/prisma'
import { VercelAdapter } from './adapters/vercel'
import { NetlifyAdapter } from './adapters/netlify'
import { GitService } from './git-service'
import { AIDeploymentSuggestions } from './ai-suggestions'
import { 
  DeployOptions, 
  DeployResult, 
  DeployStatus, 
  DeployLog, 
  RollbackOptions,
  DeployPreview,
  DeployMetrics,
  DeployQuota,
  DeployAdapter
} from './types'

export class DeployerService {
  private adapters: Map<string, DeployAdapter> = new Map()

  constructor() {
    // Initialize adapters
    this.adapters.set('vercel', new VercelAdapter())
    this.adapters.set('netlify', new NetlifyAdapter())
  }

  /**
   * Get deployer adapter by provider name
   */
  private getAdapter(provider: string): DeployAdapter {
    const adapter = this.adapters.get(provider)
    if (!adapter) {
      throw new Error(`Unsupported deployment provider: ${provider}`)
    }
    return adapter
  }

  /**
   * Create deployment preview
   */
  async createDeployPreview(projectId: string, options: DeployOptions): Promise<DeployPreview> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, name: true, framework: true }
      })

      if (!project) {
        throw new Error('Project not found')
      }

      const adapter = this.getAdapter(options.provider)
      
      // Get project settings
      const settings = await adapter.getProjectSettings(projectId)
      
      // Get environment variables
      const envVariables = await adapter.getEnvironmentVariables(projectId, options.environment)
      
      // Estimate costs and build time
      const estimatedCost = await adapter.estimateCost(options)
      const estimatedBuildTime = await adapter.estimateBuildTime(options)
      
      // Get changed files (mock for demo)
      const changedFiles = await this.getChangedFiles(projectId, options.branch)
      
      return {
        branch: options.branch,
        commitHash: options.commitHash || 'abc123def456',
        commitMessage: options.commitMessage || 'Latest commit',
        changedFiles,
        buildCommand: settings.buildCommand || 'npm run build',
        envVariables,
        estimatedCost,
        estimatedBuildTime,
        provider: options.provider,
        environment: options.environment
      }
    } catch (error) {
      console.error('Failed to create deploy preview:', error)
      throw new Error(`Failed to create deploy preview: ${(error as Error).message}`)
    }
  }

  /**
   * Create deployment
   */
  async createDeployment(projectId: string, userId: string, options: DeployOptions): Promise<DeployResult> {
    try {
      // Check user quota
      const quota = await this.checkUserQuota(userId)
      if (quota.monthlyDeploys.remaining <= 0) {
        throw new Error('Monthly deployment quota exceeded')
      }

      console.log(`🚀 Creating deployment for project ${projectId} to ${options.environment}`)
      
      // Get the appropriate adapter
      const adapter = this.getAdapter(options.provider)
      if (!adapter) {
        throw new Error(`Unsupported provider: ${options.provider}`)
      }

      // Create deployment via provider adapter
      const result = await adapter.createDeploy(projectId, options)
      
      // Save deployment to database
      const deployment = await prisma.deployment.create({
        data: {
          id: result.id,
          projectId,
          branch: options.branch || 'main',
          commitHash: options.commitHash,
          commitMessage: options.commitMessage,
          provider: options.provider,
          environment: options.environment,
          status: result.status,
          url: result.url,
          logsUrl: result.logsUrl,
          buildCommand: options.buildCommand,
          estimatedCost: result.estimatedCost,
          createdBy: userId
        }
      })

      console.log(`✅ Deployment created successfully: ${result.id}`)
      
      // In a real implementation, you would start a background job to monitor deployment status
      // For now, we'll simulate the deployment completion after some time
      this.simulateDeploymentCompletion(result.id, options.environment)
      
      return {
        ...result,
        url: result.url || `https://${options.environment}-${projectId.slice(0, 8)}.vercel.app`,
        logsUrl: result.logsUrl || `https://vercel.com/deployments/${result.id}/logs`,
        estimatedCost: result.estimatedCost || 0.05,
        estimatedBuildTime: result.estimatedBuildTime || 120
      }
    } catch (error) {
      console.error('Failed to create deployment:', error)
      throw new Error(`Failed to create deployment: ${(error as Error).message}`)
    }
  }

  private async simulateDeploymentCompletion(deploymentId: string, environment: string) {
    // Simulate deployment completion after realistic build time
    const buildTimes = {
      preview: 120000,    // 2 minutes
      staging: 180000,    // 3 minutes  
      production: 240000  // 4 minutes
    }
    
    setTimeout(async () => {
      try {
        const success = Math.random() > 0.15 // 85% success rate
        
        await prisma.deployment.update({
          where: { id: deploymentId },
          data: {
            status: success ? 'success' : 'failed',
            buildTime: Math.floor(buildTimes[environment] / 1000),
            actualCost: success ? (0.05 + Math.random() * 0.1) : (0.02 + Math.random() * 0.03),
            error: success ? null : 'Simulated build failure for demonstration'
          }
        })
        
        console.log(`🎯 Deployment ${deploymentId} completed with status: ${success ? 'success' : 'failed'}`)
      } catch (error) {
        console.error(`Failed to update deployment ${deploymentId}:`, error)
      }
    }, buildTimes[environment])
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<DeployStatus> {
    try {
      const deployment = await prisma.deployment.findUnique({
        where: { id: deploymentId }
      })

      if (!deployment) {
        throw new Error('Deployment not found')
      }

      const adapter = this.getAdapter(deployment.provider)
      const status = await adapter.getDeployStatus(deploymentId)

      // Update database with latest status
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: status.status,
          url: status.url,
          buildTime: status.buildTime,
          error: status.error,
          actualCost: status.status === 'success' ? deployment.estimatedCost : null
        }
      })

      return status
    } catch (error) {
      console.error('Failed to get deployment status:', error)
      throw new Error(`Failed to get deployment status: ${(error as Error).message}`)
    }
  }

  /**
   * Get deployment logs
   */
  async getDeploymentLogs(deploymentId: string): Promise<DeployLog[]> {
    try {
      const deployment = await prisma.deployment.findUnique({
        where: { id: deploymentId }
      })

      if (!deployment) {
        throw new Error('Deployment not found')
      }

      const adapter = this.getAdapter(deployment.provider)
      return await adapter.getDeployLogs(deploymentId)
    } catch (error) {
      console.error('Failed to get deployment logs:', error)
      throw new Error(`Failed to get deployment logs: ${(error as Error).message}`)
    }
  }

  /**
   * Rollback deployment
   */
  async rollbackDeployment(deploymentId: string, userId: string, options: RollbackOptions): Promise<DeployResult> {
    try {
      const deployment = await prisma.deployment.findUnique({
        where: { id: options.targetDeploymentId }
      })

      if (!deployment) {
        throw new Error('Target deployment not found')
      }

      if (deployment.status !== 'success') {
        throw new Error('Can only rollback to successful deployments')
      }

      const adapter = this.getAdapter(deployment.provider)
      
      // Create rollback deployment
      const rollbackOptions: DeployOptions = {
        branch: deployment.branch,
        environment: deployment.environment,
        commitHash: deployment.commitHash,
        commitMessage: `Rollback to ${deployment.commitHash}`,
        provider: deployment.provider
      }

      const result = await adapter.rollbackDeploy(deploymentId, options)
      
      // Save rollback deployment to database
      await prisma.deployment.create({
        data: {
          id: result.id,
          projectId: deployment.projectId,
          branch: deployment.branch,
          commitHash: deployment.commitHash,
          commitMessage: `Rollback to ${deployment.commitHash}`,
          provider: deployment.provider,
          environment: deployment.environment,
          status: result.status,
          url: result.url,
          logsUrl: result.logsUrl,
          rolledBackFrom: options.targetDeploymentId,
          createdBy: userId
        }
      })

      // Mark original deployment as rolled back
      await prisma.deployment.update({
        where: { id: options.targetDeploymentId },
        data: { status: 'rolled_back' }
      })

      return result
    } catch (error) {
      console.error('Failed to rollback deployment:', error)
      throw new Error(`Failed to rollback deployment: ${(error as Error).message}`)
    }
  }

  /**
   * Get deployment history
   */
  async getDeploymentHistory(projectId: string, limit: number = 20): Promise<any[]> {
    try {
      const deployments = await prisma.deployment.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })

      return deployments
    } catch (error) {
      console.error('Failed to get deployment history:', error)
      throw new Error(`Failed to get deployment history: ${(error as Error).message}`)
    }
  }

  /**
   * Get deployment metrics
   */
  async getDeploymentMetrics(projectId: string): Promise<DeployMetrics> {
    try {
      const deployments = await prisma.deployment.findMany({
        where: { projectId }
      })

      const totalDeploys = deployments.length
      const successfulDeploys = deployments.filter(d => d.status === 'success').length
      const failedDeploys = deployments.filter(d => d.status === 'failed').length
      
      const buildTimes = deployments.filter(d => d.buildTime).map(d => d.buildTime!)
      const averageBuildTime = buildTimes.length > 0 
        ? buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length 
        : 0

      const totalCost = deployments
        .filter(d => d.actualCost)
        .reduce((sum, d) => sum + (d.actualCost || 0), 0)

      const lastDeploy = deployments.length > 0 
        ? deployments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
        : undefined

      return {
        totalDeploys,
        successfulDeploys,
        failedDeploys,
        averageBuildTime,
        totalCost,
        lastDeployAt: lastDeploy
      }
    } catch (error) {
      console.error('Failed to get deployment metrics:', error)
      throw new Error(`Failed to get deployment metrics: ${(error as Error).message}`)
    }
  }

  /**
   * Check user quota
   */
  async checkUserQuota(userId: string): Promise<DeployQuota> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const plan = user.plan as 'free' | 'pro' | 'team' | 'enterprise'
      
      const quotaLimits = {
        free: { monthlyDeploys: 3, environments: ['preview'] },
        pro: { monthlyDeploys: 50, environments: ['preview', 'staging'] },
        team: { monthlyDeploys: 200, environments: ['preview', 'staging', 'production'] },
        enterprise: { monthlyDeploys: 1000, environments: ['preview', 'staging', 'production'] }
      }

      const limits = quotaLimits[plan]
      
      // Get current month's deployments
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const monthlyDeploys = await prisma.deployment.count({
        where: {
          createdBy: userId,
          createdAt: { gte: startOfMonth }
        }
      })

      return {
        plan,
        monthlyDeploys: {
          limit: limits.monthlyDeploys,
          used: monthlyDeploys,
          remaining: Math.max(0, limits.monthlyDeploys - monthlyDeploys)
        },
        environments: limits.environments,
        features: {
          preview: true,
          staging: plan !== 'free',
          production: plan === 'team' || plan === 'enterprise',
          rollback: plan !== 'free',
          logs: true,
          customDomains: plan === 'team' || plan === 'enterprise'
        }
      }
    } catch (error) {
      console.error('Failed to check user quota:', error)
      throw new Error(`Failed to check user quota: ${(error as Error).message}`)
    }
  }

  /**
   * Monitor deployment status (background process)
   */
  private async monitorDeployment(deploymentId: string, adapter: DeployAdapter): Promise<void> {
    // In a real implementation, this would be a background job
    // For demo purposes, we'll simulate monitoring
    console.log(`Monitoring deployment ${deploymentId}`)
    
    // Simulate status updates
    setTimeout(async () => {
      try {
        const status = await adapter.getDeployStatus(deploymentId)
        await prisma.deployment.update({
          where: { id: deploymentId },
          data: {
            status: status.status,
            url: status.url,
            buildTime: status.buildTime,
            error: status.error
          }
        })
      } catch (error) {
        console.error(`Failed to update deployment ${deploymentId}:`, error)
      }
    }, 10000) // Check after 10 seconds
  }

  /**
   * Get changed files (mock implementation)
   */
  private async getChangedFiles(projectId: string, branch: string): Promise<string[]> {
    // In a real implementation, this would check git diff
    return [
      'src/components/Header.tsx',
      'src/pages/index.tsx',
      'package.json'
    ]
  }
}
