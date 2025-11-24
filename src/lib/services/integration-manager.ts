import CursorAPIService, { CursorProject, CursorContext } from './cursor-api'
import ReplitAPIService, { ReplitRepl, ReplitEnvironment } from './replit-api'
import V0APIService, { V0Component, V0DesignSystem } from './v0-api'
import BoltAPIService, { BoltProject as BoltProjectType, BoltEnvironment } from './bolt-api'

export interface ToolConnection {
  tool: 'cursor' | 'replit' | 'v0' | 'bolt'
  isConnected: boolean
  lastSync?: Date
  error?: string
}

export interface ProjectSync {
  projectId: string
  sourceTool: string
  targetTool: string
  files: string[]
  status: 'pending' | 'syncing' | 'completed' | 'failed'
  progress: number
  error?: string
}

export interface SyncContext {
  projectId: string
  files: Array<{
    path: string
    content: string
    lastModified: Date
  }>
  dependencies: string[]
  environment: Record<string, string>
  metadata: Record<string, any>
}

export interface CrossToolWorkflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  status: 'active' | 'inactive' | 'running'
  createdAt: Date
  lastRun?: Date
}

export interface WorkflowStep {
  id: string
  tool: 'cursor' | 'replit' | 'v0' | 'bolt'
  action: string
  parameters: Record<string, any>
  dependencies: string[]
  timeout: number
}

class IntegrationManager {
  private cursorService?: CursorAPIService
  private replitService?: ReplitAPIService
  private v0Service?: V0APIService
  private boltService?: BoltAPIService
  private connections: Map<string, ToolConnection> = new Map()
  private workflows: Map<string, CrossToolWorkflow> = new Map()

  constructor() {
    this.initializeConnections()
  }

  private initializeConnections() {
    // Initialize tool connections
    this.connections.set('cursor', { tool: 'cursor', isConnected: false })
    this.connections.set('replit', { tool: 'replit', isConnected: false })
    this.connections.set('v0', { tool: 'v0', isConnected: false })
    this.connections.set('bolt', { tool: 'bolt', isConnected: false })
  }

  // Tool Connection Management
  async connectCursor(apiKey: string): Promise<boolean> {
    try {
      this.cursorService = new CursorAPIService(apiKey)
      const isConnected = await this.cursorService.checkConnection()
      
      this.connections.set('cursor', {
        tool: 'cursor',
        isConnected,
        lastSync: isConnected ? new Date() : undefined,
      })

      return isConnected
    } catch (error) {
      this.connections.set('cursor', {
        tool: 'cursor',
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return false
    }
  }

  async connectReplit(apiKey: string): Promise<boolean> {
    try {
      this.replitService = new ReplitAPIService(apiKey)
      const isConnected = await this.replitService.checkConnection()
      
      this.connections.set('replit', {
        tool: 'replit',
        isConnected,
        lastSync: isConnected ? new Date() : undefined,
      })

      return isConnected
    } catch (error) {
      this.connections.set('replit', {
        tool: 'replit',
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return false
    }
  }

  async connectV0(apiKey: string): Promise<boolean> {
    try {
      this.v0Service = new V0APIService(apiKey)
      const isConnected = await this.v0Service.checkConnection()
      
      this.connections.set('v0', {
        tool: 'v0',
        isConnected,
        lastSync: isConnected ? new Date() : undefined,
      })

      return isConnected
    } catch (error) {
      this.connections.set('v0', {
        tool: 'v0',
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return false
    }
  }

  async connectBolt(apiKey: string): Promise<boolean> {
    try {
      this.boltService = new BoltAPIService(apiKey)
      const isConnected = await this.boltService.checkConnection()
      
      this.connections.set('bolt', {
        tool: 'bolt',
        isConnected,
        lastSync: isConnected ? new Date() : undefined,
      })

      return isConnected
    } catch (error) {
      this.connections.set('bolt', {
        tool: 'bolt',
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return false
    }
  }

  getConnections(): ToolConnection[] {
    return Array.from(this.connections.values())
  }

  // Project Creation & Management
  async createProjectInTool(
    tool: 'cursor' | 'replit' | 'v0' | 'bolt',
    name: string,
    language: string,
    template?: string
  ): Promise<{ projectId: string; url: string }> {
    switch (tool) {
      case 'cursor':
        if (!this.cursorService) throw new Error('Cursor service not connected')
        const cursorProject = await this.cursorService.createProject(name, language, template)
        return {
          projectId: cursorProject.id,
          url: this.cursorService.generateDeepLink(cursorProject.id)
        }

      case 'replit':
        if (!this.replitService) throw new Error('Replit service not connected')
        const replitProject = await this.replitService.createRepl(name, language)
        return {
          projectId: replitProject.id,
          url: this.replitService.generateReplUrl(replitProject.id)
        }

      case 'v0':
        if (!this.v0Service) throw new Error('v0 service not connected')
        // v0 doesn't create projects, it generates components
        throw new Error('v0 is for component generation, not project creation')

      case 'bolt':
        if (!this.boltService) throw new Error('Bolt service not connected')
        const boltProject = await this.boltService.createProject(name, '', language)
        return {
          projectId: boltProject.id,
          url: this.boltService.generateProjectUrl(boltProject.id)
        }

      default:
        throw new Error(`Unsupported tool: ${tool}`)
    }
  }

  // Context Synchronization
  async syncContextBetweenTools(
    sourceTool: 'cursor' | 'replit' | 'v0' | 'bolt',
    targetTool: 'cursor' | 'replit' | 'v0' | 'bolt',
    sourceProjectId: string,
    targetProjectId: string
  ): Promise<ProjectSync> {
    const syncId = `${sourceTool}-${targetTool}-${sourceProjectId}-${targetProjectId}`
    
    try {
      // Extract context from source tool
      const context = await this.extractContext(sourceTool, sourceProjectId)
      
      // Apply context to target tool
      await this.applyContext(targetTool, targetProjectId, context)
      
      this.updateLastSync(sourceTool)
      this.updateLastSync(targetTool)
      
      return {
        projectId: syncId,
        sourceTool,
        targetTool,
        files: context.files.map(f => f.path),
        status: 'completed',
        progress: 100
      }
    } catch (error) {
      return {
        projectId: syncId,
        sourceTool,
        targetTool,
        files: [],
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async extractContext(tool: 'cursor' | 'replit' | 'v0' | 'bolt', projectId: string): Promise<SyncContext> {
    switch (tool) {
      case 'cursor':
        if (!this.cursorService) throw new Error('Cursor service not connected')
        const cursorContext = await this.cursorService.getProjectContext(projectId)
        return {
          projectId,
          files: cursorContext.files.map(f => ({
            path: f.path,
            content: f.content,
            lastModified: f.lastModified
          })),
          dependencies: cursorContext.dependencies,
          environment: cursorContext.environment,
          metadata: cursorContext.workspaceSettings
        }

      case 'replit':
        if (!this.replitService) throw new Error('Replit service not connected')
        const replitFiles = await this.replitService.listFiles(projectId)
        const replitEnv = await this.replitService.getEnvironment(projectId)
        return {
          projectId,
          files: replitFiles.map(f => ({
            path: f.path,
            content: f.content,
            lastModified: f.lastModified
          })),
          dependencies: replitEnv.packages,
          environment: replitEnv.variables,
          metadata: { runtime: replitEnv.runtime, language: replitEnv.language }
        }

      case 'v0':
        if (!this.v0Service) throw new Error('v0 service not connected')
        const component = await this.v0Service.getComponent(projectId)
        return {
          projectId,
          files: [{
            path: `${component.name}.${component.language}`,
            content: component.code,
            lastModified: component.updatedAt
          }],
          dependencies: [],
          environment: {},
          metadata: { framework: component.framework, category: component.category }
        }

      case 'bolt':
        if (!this.boltService) throw new Error('Bolt service not connected')
        const boltProject = await this.boltService.getProject(projectId)
        return {
          projectId,
          files: [],
          dependencies: [],
          environment: {},
          metadata: { framework: boltProject.framework, repository: boltProject.repository }
        }

      default:
        throw new Error(`Unsupported tool: ${tool}`)
    }
  }

  private async applyContext(
    tool: 'cursor' | 'replit' | 'v0' | 'bolt',
    projectId: string,
    context: SyncContext
  ): Promise<void> {
    switch (tool) {
      case 'cursor':
        if (!this.cursorService) throw new Error('Cursor service not connected')
        await this.cursorService.syncContext(projectId, {
          files: context.files.map(f => ({
            path: f.path,
            content: f.content,
            lastModified: f.lastModified,
            isOpen: false
          })),
          dependencies: context.dependencies,
          environment: context.environment
        })
        break

      case 'replit':
        if (!this.replitService) throw new Error('Replit service not connected')
        // Write files to Replit
        for (const file of context.files) {
          await this.replitService.writeFile(projectId, file.path, file.content)
        }
        // Set environment variables
        for (const [key, value] of Object.entries(context.environment)) {
          await this.replitService.setEnvironmentVariable(projectId, key, value)
        }
        break

      case 'v0':
        if (!this.v0Service) throw new Error('v0 service not connected')
        // v0 is for component generation, not context application
        throw new Error('v0 does not support context application')

      case 'bolt':
        if (!this.boltService) throw new Error('Bolt service not connected')
        // Bolt manages deployments, not file content
        for (const [key, value] of Object.entries(context.environment)) {
          await this.boltService.setEnvironmentVariable(projectId, 'production', key, value)
        }
        break

      default:
        throw new Error(`Unsupported tool: ${tool}`)
    }
  }

  private updateLastSync(tool: 'cursor' | 'replit' | 'v0' | 'bolt') {
    const connection = this.connections.get(tool)
    if (connection) {
      connection.lastSync = new Date()
      this.connections.set(tool, connection)
    }
  }

  // Tool Recommendation Engine
  getRecommendedTool(projectType: string, requirements: string[]): 'cursor' | 'replit' | 'v0' | 'bolt' {
    const toolScores = {
      cursor: 0,
      replit: 0,
      v0: 0,
      bolt: 0
    }

    // Score based on project type
    switch (projectType) {
      case 'web-app':
        toolScores.cursor += 3
        toolScores.replit += 2
        toolScores.v0 += 1
        break
      case 'component-library':
        toolScores.v0 += 4
        toolScores.cursor += 2
        break
      case 'api-service':
        toolScores.cursor += 3
        toolScores.replit += 2
        break
      case 'full-stack':
        toolScores.cursor += 3
        toolScores.replit += 2
        toolScores.bolt += 1
        break
    }

    // Score based on requirements
    requirements.forEach(req => {
      switch (req) {
        case 'real-time-collaboration':
          toolScores.cursor += 2
          toolScores.replit += 3
          break
        case 'component-generation':
          toolScores.v0 += 4
          break
        case 'deployment-pipeline':
          toolScores.bolt += 4
          break
        case 'live-environment':
          toolScores.replit += 3
          break
        case 'file-sync':
          toolScores.cursor += 3
          break
        case 'design-system':
          toolScores.v0 += 3
          break
      }
    })

    // Return the tool with the highest score
    return Object.entries(toolScores).reduce((a, b) => 
      toolScores[a[0] as keyof typeof toolScores] > toolScores[b[0] as keyof typeof toolScores] ? a : b
    )[0] as 'cursor' | 'replit' | 'v0' | 'bolt'
  }

  // Cross-Tool Workflows
  async createWorkflow(name: string, description: string, steps: WorkflowStep[]): Promise<CrossToolWorkflow> {
    const workflow: CrossToolWorkflow = {
      id: `workflow-${Date.now()}`,
      name,
      description,
      steps,
      status: 'active',
      createdAt: new Date()
    }

    this.workflows.set(workflow.id, workflow)
    return workflow
  }

  async executeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) throw new Error('Workflow not found')

    workflow.status = 'running'
    workflow.lastRun = new Date()

    try {
      for (const step of workflow.steps) {
        await this.executeWorkflowStep(step)
      }
    } finally {
      workflow.status = 'active'
    }
  }

  private async executeWorkflowStep(step: WorkflowStep): Promise<void> {
    switch (step.tool) {
      case 'cursor':
        if (!this.cursorService) throw new Error('Cursor service not connected')
        // Execute cursor-specific actions
        break
      case 'replit':
        if (!this.replitService) throw new Error('Replit service not connected')
        // Execute replit-specific actions
        break
      case 'v0':
        if (!this.v0Service) throw new Error('v0 service not connected')
        // Execute v0-specific actions
        break
      case 'bolt':
        if (!this.boltService) throw new Error('Bolt service not connected')
        // Execute bolt-specific actions
        break
    }
  }

  // Health Check
  async checkAllConnections(): Promise<ToolConnection[]> {
    const connections = this.getConnections()
    
    for (const connection of connections) {
      try {
        let isConnected = false
        
        switch (connection.tool) {
          case 'cursor':
            isConnected = this.cursorService ? await this.cursorService.checkConnection() : false
            break
          case 'replit':
            isConnected = this.replitService ? await this.replitService.checkConnection() : false
            break
          case 'v0':
            isConnected = this.v0Service ? await this.v0Service.checkConnection() : false
            break
          case 'bolt':
            isConnected = this.boltService ? await this.boltService.checkConnection() : false
            break
        }
        
        connection.isConnected = isConnected
        connection.lastSync = isConnected ? new Date() : connection.lastSync
        connection.error = isConnected ? undefined : connection.error
      } catch (error) {
        connection.isConnected = false
        connection.error = error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    return connections
  }

  // Get Service Instances
  getCursorService(): CursorAPIService | undefined {
    return this.cursorService
  }

  getReplitService(): ReplitAPIService | undefined {
    return this.replitService
  }

  getV0Service(): V0APIService | undefined {
    return this.v0Service
  }

  getBoltService(): BoltAPIService | undefined {
    return this.boltService
  }
}

export default IntegrationManager 