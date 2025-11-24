import { DeployAdapter, DeployOptions, DeployResult, DeployStatus, DeployLog, RollbackOptions } from '../types'

export abstract class BaseDeployAdapter implements DeployAdapter {
  protected provider: string
  protected apiKey?: string
  protected baseUrl: string

  constructor(provider: string, apiKey?: string, baseUrl?: string) {
    this.provider = provider
    this.apiKey = apiKey
    this.baseUrl = baseUrl || this.getDefaultBaseUrl()
  }

  protected abstract getDefaultBaseUrl(): string

  // Abstract methods that must be implemented by subclasses
  abstract createDeploy(projectId: string, options: DeployOptions): Promise<DeployResult>
  abstract getDeployStatus(deployId: string): Promise<DeployStatus>
  abstract getDeployLogs(deployId: string): Promise<DeployLog[]>
  abstract cancelDeploy(deployId: string): Promise<void>
  abstract rollbackDeploy(deployId: string, options: RollbackOptions): Promise<DeployResult>
  abstract getProjectSettings(projectId: string): Promise<any>
  abstract updateProjectSettings(projectId: string, settings: any): Promise<void>
  abstract getEnvironmentVariables(projectId: string, environment: string): Promise<Record<string, string>>
  abstract setEnvironmentVariables(projectId: string, environment: string, variables: Record<string, string>): Promise<void>

  // Default implementations
  async estimateCost(options: DeployOptions): Promise<number> {
    // Base cost estimation logic
    const baseCost = 0.001 // $0.001 per deployment
    const environmentMultiplier = {
      preview: 1.0,
      staging: 2.0,
      production: 5.0
    }
    
    return baseCost * environmentMultiplier[options.environment]
  }

  async estimateBuildTime(options: DeployOptions): Promise<number> {
    // Base build time estimation in seconds
    const baseTime = 60 // 1 minute base
    const environmentMultiplier = {
      preview: 1.0,
      staging: 1.5,
      production: 2.0
    }
    
    return baseTime * environmentMultiplier[options.environment]
  }

  protected async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  protected generateDeployId(): string {
    return `${this.provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  protected parseLogLine(line: string): DeployLog {
    // Parse log line format: [timestamp] [level] [source] message
    const match = line.match(/^\[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] (.+)$/)
    if (match) {
      return {
        timestamp: match[1],
        level: match[2] as DeployLog['level'],
        source: match[3] as DeployLog['source'],
        message: match[4]
      }
    }

    // Fallback for simple log lines
    return {
      timestamp: new Date().toISOString(),
      level: 'info',
      source: 'build',
      message: line
    }
  }
}
