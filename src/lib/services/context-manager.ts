import { ProjectContext, SyncStatus, VersionHistory, ToolType, ProjectFile, Requirement, CodeSnippet, DesignDecision } from '@/lib/types/context'
import JSZip from 'jszip'

export class ContextManager {
  private context: ProjectContext
  private syncStatus: Map<ToolType, SyncStatus>
  private versionHistory: VersionHistory[]

  constructor(projectId: string) {
    this.context = {
      id: crypto.randomUUID(),
      projectId,
      files: [],
      requirements: [],
      codeSnippets: [],
      designDecisions: [],
      toolConfigs: [],
      version: 1,
      lastSynced: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.syncStatus = new Map()
    this.versionHistory = []
  }

  // File Management
  async addFile(file: Omit<ProjectFile, 'lastModified'>) {
    const newFile = {
      ...file,
      lastModified: new Date()
    }
    this.context.files.push(newFile)
    await this.createVersionEntry('file', 'create', file.path)
  }

  async updateFile(path: string, content: string) {
    const fileIndex = this.context.files.findIndex(f => f.path === path)
    if (fileIndex === -1) throw new Error('File not found')
    
    this.context.files[fileIndex] = {
      ...this.context.files[fileIndex],
      content,
      lastModified: new Date()
    }
    await this.createVersionEntry('file', 'update', path)
  }

  // Requirements Management
  async addRequirement(requirement: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt'>) {
    const newRequirement = {
      ...requirement,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.context.requirements.push(newRequirement)
    await this.createVersionEntry('requirement', 'create', newRequirement.id)
  }

  // Code Snippets Management
  async addCodeSnippet(snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt'>) {
    const newSnippet = {
      ...snippet,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.context.codeSnippets.push(newSnippet)
    await this.createVersionEntry('snippet', 'create', newSnippet.id)
  }

  // Design Decisions Management
  async addDesignDecision(decision: Omit<DesignDecision, 'id' | 'createdAt' | 'updatedAt'>) {
    const newDecision = {
      ...decision,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.context.designDecisions.push(newDecision)
    await this.createVersionEntry('design', 'create', newDecision.id)
  }

  // Tool Configuration Management
  async updateToolConfig(tool: ToolType, config: Record<string, any>) {
    const configIndex = this.context.toolConfigs.findIndex(c => c.tool === tool)
    const newConfig = {
      tool,
      config,
      lastSynced: new Date(),
      version: (this.context.toolConfigs[configIndex]?.version || '0.0.0')
    }

    if (configIndex === -1) {
      this.context.toolConfigs.push(newConfig)
    } else {
      this.context.toolConfigs[configIndex] = newConfig
    }
    await this.createVersionEntry('config', 'update', tool)
  }

  // Sync Management
  async syncToTool(tool: ToolType) {
    const status: SyncStatus = {
      tool,
      status: 'pending',
      lastSynced: new Date()
    }
    this.syncStatus.set(tool, status)

    try {
      // Implement tool-specific sync logic here
      // This would typically involve:
      // 1. Fetching remote state
      // 2. Comparing with local state
      // 3. Resolving conflicts
      // 4. Updating both local and remote

      status.status = 'synced'
    } catch (error) {
      status.status = 'conflict'
      // Add conflict details
    }

    this.syncStatus.set(tool, status)
  }

  // Version Control
  private async createVersionEntry(
    type: VersionHistory['changes'][0]['type'],
    action: VersionHistory['changes'][0]['action'],
    path: string
  ) {
    const version: VersionHistory = {
      id: crypto.randomUUID(),
      projectId: this.context.projectId,
      version: this.context.version + 1,
      changes: [{
        type,
        action,
        path,
        timestamp: new Date()
      }],
      createdAt: new Date(),
      createdBy: 'system' // Replace with actual user ID
    }

    this.versionHistory.push(version)
    this.context.version = version.version
    this.context.updatedAt = new Date()
  }

  // Export Context
  async exportContext(): Promise<Blob> {
    const zip = new JSZip()

    // Add files
    this.context.files.forEach(file => {
      zip.file(file.path, file.content)
    })

    // Add metadata
    zip.file('context.json', JSON.stringify({
      requirements: this.context.requirements,
      codeSnippets: this.context.codeSnippets,
      designDecisions: this.context.designDecisions,
      toolConfigs: this.context.toolConfigs,
      version: this.context.version,
      lastSynced: this.context.lastSynced
    }, null, 2))

    // Add version history
    zip.file('version-history.json', JSON.stringify(this.versionHistory, null, 2))

    return await zip.generateAsync({ type: 'blob' })
  }

  // Getters
  getContext(): ProjectContext {
    return this.context
  }

  getSyncStatus(tool: ToolType): SyncStatus | undefined {
    return this.syncStatus.get(tool)
  }

  getVersionHistory(): VersionHistory[] {
    return this.versionHistory
  }
} 