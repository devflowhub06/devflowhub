export interface DeployOptions {
  branch: string
  environment: 'preview' | 'staging' | 'production'
  commitHash?: string
  commitMessage?: string
  buildCommand?: string
  envVariables?: Record<string, string>
  provider: 'vercel' | 'netlify' | 'aws' | 'gcp'
}

export interface DeployResult {
  id: string
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'rolled_back'
  url?: string
  logsUrl?: string
  buildTime?: number
  error?: string
  providerId?: string // External provider's deployment ID
}

export interface DeployStatus {
  id: string
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'rolled_back'
  url?: string
  buildTime?: number
  error?: string
  logs?: string[]
}

export interface DeployLog {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  source: 'build' | 'deploy' | 'runtime'
}

export interface DeployPreview {
  branch: string
  commitHash: string
  commitMessage: string
  changedFiles: string[]
  buildCommand: string
  envVariables: Record<string, string>
  estimatedCost: number
  estimatedBuildTime: number
  provider: string
  environment: string
}

export interface RollbackOptions {
  targetDeploymentId: string
  reason?: string
}

export interface DeployAdapter {
  // Core deployment methods
  createDeploy(projectId: string, options: DeployOptions): Promise<DeployResult>
  getDeployStatus(deployId: string): Promise<DeployStatus>
  getDeployLogs(deployId: string): Promise<DeployLog[]>
  cancelDeploy(deployId: string): Promise<void>
  
  // Rollback functionality
  rollbackDeploy(deployId: string, options: RollbackOptions): Promise<DeployResult>
  
  // Project management
  getProjectSettings(projectId: string): Promise<any>
  updateProjectSettings(projectId: string, settings: any): Promise<void>
  
  // Environment management
  getEnvironmentVariables(projectId: string, environment: string): Promise<Record<string, string>>
  setEnvironmentVariables(projectId: string, environment: string, variables: Record<string, string>): Promise<void>
  
  // Cost estimation
  estimateCost(options: DeployOptions): Promise<number>
  estimateBuildTime(options: DeployOptions): Promise<number>
}

export interface DeployMetrics {
  totalDeploys: number
  successfulDeploys: number
  failedDeploys: number
  averageBuildTime: number
  totalCost: number
  lastDeployAt?: Date
}

export interface DeployQuota {
  plan: 'free' | 'pro' | 'team' | 'enterprise'
  monthlyDeploys: {
    limit: number
    used: number
    remaining: number
  }
  environments: string[]
  features: {
    preview: boolean
    staging: boolean
    production: boolean
    rollback: boolean
    logs: boolean
    customDomains: boolean
  }
}
