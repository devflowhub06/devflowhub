export interface BoltProject {
  id: string
  name: string
  description: string
  repository: string
  framework: string
  createdAt: Date
  updatedAt: Date
  environments: BoltEnvironment[]
  pipelines: BoltPipeline[]
}

export interface BoltEnvironment {
  id: string
  name: string
  type: 'development' | 'staging' | 'production' | 'preview'
  url: string
  status: 'active' | 'inactive' | 'building' | 'failed'
  variables: Record<string, string>
  secrets: Record<string, string>
  createdAt: Date
  lastDeploy?: Date
  branch?: string
}

export interface BoltPipeline {
  id: string
  name: string
  description: string
  triggers: BoltTrigger[]
  stages: BoltStage[]
  status: 'active' | 'inactive' | 'running' | 'failed'
  createdAt: Date
  lastRun?: Date
}

export interface BoltTrigger {
  type: 'push' | 'pull_request' | 'manual' | 'schedule' | 'webhook'
  branch?: string
  pattern?: string
  schedule?: string
  webhookUrl?: string
}

export interface BoltStage {
  id: string
  name: string
  type: 'build' | 'test' | 'deploy' | 'notify' | 'custom'
  commands: string[]
  environment?: string
  dependencies: string[]
  timeout: number
  retries: number
}

export interface BoltDeployment {
  id: string
  projectId: string
  environmentId: string
  pipelineId: string
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'cancelled'
  commit: string
  branch: string
  message: string
  startedAt: Date
  completedAt?: Date
  logs: BoltLog[]
  artifacts: BoltArtifact[]
}

export interface BoltLog {
  id: string
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  timestamp: Date
  stage?: string
}

export interface BoltArtifact {
  id: string
  name: string
  type: 'build' | 'test' | 'deployment'
  url: string
  size: number
  createdAt: Date
}

export interface BoltBuildConfig {
  framework: string
  buildCommand: string
  outputDirectory: string
  installCommand?: string
  nodeVersion?: string
  environmentVariables?: Record<string, string>
}

class BoltAPIService {
  private apiKey: string
  private baseUrl = 'https://api.bolt.dev/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`Bolt API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Bolt API request failed:', error)
      throw error
    }
  }

  // Project Management
  async createProject(name: string, repository: string, framework: string): Promise<BoltProject> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, repository, framework }),
    })
  }

  async getProject(projectId: string): Promise<BoltProject> {
    return this.request(`/projects/${projectId}`)
  }

  async listProjects(): Promise<BoltProject[]> {
    return this.request('/projects')
  }

  async updateProject(projectId: string, updates: Partial<BoltProject>): Promise<BoltProject> {
    return this.request(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    })
  }

  // Environment Management
  async createEnvironment(projectId: string, name: string, type: 'development' | 'staging' | 'production' | 'preview'): Promise<BoltEnvironment> {
    return this.request(`/projects/${projectId}/environments`, {
      method: 'POST',
      body: JSON.stringify({ name, type }),
    })
  }

  async getEnvironment(projectId: string, environmentId: string): Promise<BoltEnvironment> {
    return this.request(`/projects/${projectId}/environments/${environmentId}`)
  }

  async listEnvironments(projectId: string): Promise<BoltEnvironment[]> {
    return this.request(`/projects/${projectId}/environments`)
  }

  async updateEnvironment(projectId: string, environmentId: string, updates: Partial<BoltEnvironment>): Promise<BoltEnvironment> {
    return this.request(`/projects/${projectId}/environments/${environmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async deleteEnvironment(projectId: string, environmentId: string): Promise<void> {
    await this.request(`/projects/${projectId}/environments/${environmentId}`, {
      method: 'DELETE',
    })
  }

  async setEnvironmentVariable(projectId: string, environmentId: string, key: string, value: string): Promise<void> {
    await this.request(`/projects/${projectId}/environments/${environmentId}/variables`, {
      method: 'POST',
      body: JSON.stringify({ [key]: value }),
    })
  }

  async setEnvironmentSecret(projectId: string, environmentId: string, key: string, value: string): Promise<void> {
    await this.request(`/projects/${projectId}/environments/${environmentId}/secrets`, {
      method: 'POST',
      body: JSON.stringify({ [key]: value }),
    })
  }

  // Deployment Pipelines
  async createPipeline(projectId: string, name: string, stages: BoltStage[]): Promise<BoltPipeline> {
    return this.request(`/projects/${projectId}/pipelines`, {
      method: 'POST',
      body: JSON.stringify({ name, stages }),
    })
  }

  async getPipeline(projectId: string, pipelineId: string): Promise<BoltPipeline> {
    return this.request(`/projects/${projectId}/pipelines/${pipelineId}`)
  }

  async listPipelines(projectId: string): Promise<BoltPipeline[]> {
    return this.request(`/projects/${projectId}/pipelines`)
  }

  async updatePipeline(projectId: string, pipelineId: string, updates: Partial<BoltPipeline>): Promise<BoltPipeline> {
    return this.request(`/projects/${projectId}/pipelines/${pipelineId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async deletePipeline(projectId: string, pipelineId: string): Promise<void> {
    await this.request(`/projects/${projectId}/pipelines/${pipelineId}`, {
      method: 'DELETE',
    })
  }

  async addPipelineTrigger(projectId: string, pipelineId: string, trigger: BoltTrigger): Promise<void> {
    await this.request(`/projects/${projectId}/pipelines/${pipelineId}/triggers`, {
      method: 'POST',
      body: JSON.stringify(trigger),
    })
  }

  // Deployment Management
  async createDeployment(projectId: string, environmentId: string, pipelineId: string, commit: string, branch: string): Promise<BoltDeployment> {
    return this.request(`/projects/${projectId}/deployments`, {
      method: 'POST',
      body: JSON.stringify({ environmentId, pipelineId, commit, branch }),
    })
  }

  async getDeployment(projectId: string, deploymentId: string): Promise<BoltDeployment> {
    return this.request(`/projects/${projectId}/deployments/${deploymentId}`)
  }

  async listDeployments(projectId: string, filters?: {
    environmentId?: string
    status?: string
    limit?: number
  }): Promise<BoltDeployment[]> {
    const params = new URLSearchParams()
    if (filters?.environmentId) params.append('environmentId', filters.environmentId)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.limit) params.append('limit', filters.limit.toString())

    return this.request(`/projects/${projectId}/deployments?${params.toString()}`)
  }

  async cancelDeployment(projectId: string, deploymentId: string): Promise<void> {
    await this.request(`/projects/${projectId}/deployments/${deploymentId}/cancel`, {
      method: 'POST',
    })
  }

  async retryDeployment(projectId: string, deploymentId: string): Promise<BoltDeployment> {
    return this.request(`/projects/${projectId}/deployments/${deploymentId}/retry`, {
      method: 'POST',
    })
  }

  // Build Configuration
  async setBuildConfig(projectId: string, config: BoltBuildConfig): Promise<void> {
    await this.request(`/projects/${projectId}/build-config`, {
      method: 'POST',
      body: JSON.stringify(config),
    })
  }

  async getBuildConfig(projectId: string): Promise<BoltBuildConfig> {
    return this.request(`/projects/${projectId}/build-config`)
  }

  // Logs and Monitoring
  async getDeploymentLogs(projectId: string, deploymentId: string): Promise<BoltLog[]> {
    return this.request(`/projects/${projectId}/deployments/${deploymentId}/logs`)
  }

  async getStageLogs(projectId: string, deploymentId: string, stageId: string): Promise<BoltLog[]> {
    return this.request(`/projects/${projectId}/deployments/${deploymentId}/stages/${stageId}/logs`)
  }

  async streamLogs(projectId: string, deploymentId: string, callback: (log: BoltLog) => void): Promise<void> {
    // Implementation for real-time log streaming
    const response = await fetch(`${this.baseUrl}/projects/${projectId}/deployments/${deploymentId}/logs/stream`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    const reader = response.body?.getReader()
    if (!reader) return

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = new TextDecoder().decode(value)
      const lines = text.split('\n').filter(line => line.trim())

      for (const line of lines) {
        try {
          const log = JSON.parse(line)
          callback(log)
        } catch (error) {
          console.error('Failed to parse log line:', line)
        }
      }
    }
  }

  // Artifacts Management
  async getDeploymentArtifacts(projectId: string, deploymentId: string): Promise<BoltArtifact[]> {
    return this.request(`/projects/${projectId}/deployments/${deploymentId}/artifacts`)
  }

  async downloadArtifact(projectId: string, deploymentId: string, artifactId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/projects/${projectId}/deployments/${deploymentId}/artifacts/${artifactId}/download`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to download artifact: ${response.status}`)
    }

    return response.blob()
  }

  // Advanced Features
  async createPreviewDeployment(projectId: string, pullRequestNumber: number): Promise<BoltDeployment> {
    return this.request(`/projects/${projectId}/preview-deployments`, {
      method: 'POST',
      body: JSON.stringify({ pullRequestNumber }),
    })
  }

  async promoteDeployment(projectId: string, deploymentId: string, targetEnvironment: string): Promise<BoltDeployment> {
    return this.request(`/projects/${projectId}/deployments/${deploymentId}/promote`, {
      method: 'POST',
      body: JSON.stringify({ targetEnvironment }),
    })
  }

  async rollbackDeployment(projectId: string, environmentId: string, deploymentId: string): Promise<BoltDeployment> {
    return this.request(`/projects/${projectId}/environments/${environmentId}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ deploymentId }),
    })
  }

  // Health Check
  async checkConnection(): Promise<boolean> {
    try {
      await this.request('/health')
      return true
    } catch {
      return false
    }
  }

  // Generate URLs
  generateProjectUrl(projectId: string): string {
    return `https://bolt.dev/projects/${projectId}`
  }

  generateDeploymentUrl(projectId: string, deploymentId: string): string {
    return `https://bolt.dev/projects/${projectId}/deployments/${deploymentId}`
  }

  generateEnvironmentUrl(projectId: string, environmentId: string): string {
    return `https://bolt.dev/projects/${projectId}/environments/${environmentId}`
  }
}

export default BoltAPIService 