export interface CursorProject {
  id: string
  name: string
  path: string
  language: string
  createdAt: Date
  updatedAt: Date
  isCollaborative: boolean
  collaborators: string[]
}

export interface CursorFile {
  path: string
  content: string
  lastModified: Date
  isOpen: boolean
  cursorPosition?: { line: number; column: number }
  selection?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

export interface CursorContext {
  projectId: string
  files: CursorFile[]
  dependencies: string[]
  environment: Record<string, string>
  activeFile?: string
  recentFiles: string[]
  workspaceSettings: Record<string, any>
}

export interface CursorSyncEvent {
  type: 'file_change' | 'cursor_move' | 'selection_change' | 'file_open' | 'file_close'
  filePath: string
  timestamp: Date
  data: any
}

class CursorAPIService {
  private apiKey: string
  private baseUrl = 'https://api.cursor.sh/v1'
  private syncCallbacks: Map<string, (event: CursorSyncEvent) => void> = new Map()

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
        throw new Error(`Cursor API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Cursor API request failed:', error)
      throw error
    }
  }

  // Project Management
  async createProject(name: string, language: string, template?: string): Promise<CursorProject> {
    const data = {
      name,
      language,
      template,
    }

    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProject(projectId: string): Promise<CursorProject> {
    return this.request(`/projects/${projectId}`)
  }

  async listProjects(): Promise<CursorProject[]> {
    return this.request('/projects')
  }

  async deleteProject(projectId: string): Promise<void> {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    })
  }

  // File Operations with Real-time Sync
  async readFile(projectId: string, filePath: string): Promise<CursorFile> {
    return this.request(`/projects/${projectId}/files/${encodeURIComponent(filePath)}`)
  }

  async writeFile(projectId: string, filePath: string, content: string): Promise<CursorFile> {
    const result = await this.request(`/projects/${projectId}/files/${encodeURIComponent(filePath)}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
    
    // Trigger sync event
    this.triggerSyncEvent(projectId, {
      type: 'file_change',
      filePath,
      timestamp: new Date(),
      data: { content }
    })
    
    return result
  }

  async listFiles(projectId: string): Promise<CursorFile[]> {
    return this.request(`/projects/${projectId}/files`)
  }

  async deleteFile(projectId: string, filePath: string): Promise<void> {
    await this.request(`/projects/${projectId}/files/${encodeURIComponent(filePath)}`, {
      method: 'DELETE',
    })
    
    // Trigger sync event
    this.triggerSyncEvent(projectId, {
      type: 'file_change',
      filePath,
      timestamp: new Date(),
      data: { deleted: true }
    })
  }

  // Real-time Code Editing
  async updateCursorPosition(projectId: string, filePath: string, line: number, column: number): Promise<void> {
    await this.request(`/projects/${projectId}/cursor`, {
      method: 'POST',
      body: JSON.stringify({ filePath, line, column }),
    })
    
    this.triggerSyncEvent(projectId, {
      type: 'cursor_move',
      filePath,
      timestamp: new Date(),
      data: { line, column }
    })
  }

  async updateSelection(projectId: string, filePath: string, selection: { start: { line: number; column: number }; end: { line: number; column: number } }): Promise<void> {
    await this.request(`/projects/${projectId}/selection`, {
      method: 'POST',
      body: JSON.stringify({ filePath, selection }),
    })
    
    this.triggerSyncEvent(projectId, {
      type: 'selection_change',
      filePath,
      timestamp: new Date(),
      data: { selection }
    })
  }

  async openFile(projectId: string, filePath: string): Promise<void> {
    await this.request(`/projects/${projectId}/files/${encodeURIComponent(filePath)}/open`, {
      method: 'POST',
    })
    
    this.triggerSyncEvent(projectId, {
      type: 'file_open',
      filePath,
      timestamp: new Date(),
      data: {}
    })
  }

  async closeFile(projectId: string, filePath: string): Promise<void> {
    await this.request(`/projects/${projectId}/files/${encodeURIComponent(filePath)}/close`, {
      method: 'POST',
    })
    
    this.triggerSyncEvent(projectId, {
      type: 'file_close',
      filePath,
      timestamp: new Date(),
      data: {}
    })
  }

  // File Sync Capabilities
  async syncFile(projectId: string, filePath: string, content: string, version: number): Promise<{ success: boolean; conflicts?: any[] }> {
    return this.request(`/projects/${projectId}/sync`, {
      method: 'POST',
      body: JSON.stringify({ filePath, content, version }),
    })
  }

  async getFileHistory(projectId: string, filePath: string): Promise<{ version: number; content: string; timestamp: Date }[]> {
    return this.request(`/projects/${projectId}/files/${encodeURIComponent(filePath)}/history`)
  }

  async resolveConflict(projectId: string, filePath: string, resolution: 'local' | 'remote' | 'merge'): Promise<void> {
    await this.request(`/projects/${projectId}/conflicts/${encodeURIComponent(filePath)}`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    })
  }

  // Project Context Transfer
  async getProjectContext(projectId: string): Promise<CursorContext> {
    return this.request(`/projects/${projectId}/context`)
  }

  async syncContext(projectId: string, context: Partial<CursorContext>): Promise<CursorContext> {
    return this.request(`/projects/${projectId}/context`, {
      method: 'POST',
      body: JSON.stringify(context),
    })
  }

  async exportContext(projectId: string): Promise<{ context: CursorContext; metadata: any }> {
    return this.request(`/projects/${projectId}/context/export`)
  }

  async importContext(projectId: string, contextData: { context: CursorContext; metadata: any }): Promise<void> {
    await this.request(`/projects/${projectId}/context/import`, {
      method: 'POST',
      body: JSON.stringify(contextData),
    })
  }

  // Real-time Collaboration
  async joinCollaboration(projectId: string, userId: string): Promise<void> {
    await this.request(`/projects/${projectId}/collaboration/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }

  async leaveCollaboration(projectId: string, userId: string): Promise<void> {
    await this.request(`/projects/${projectId}/collaboration/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }

  async getCollaborators(projectId: string): Promise<{ userId: string; name: string; activeFile?: string }[]> {
    return this.request(`/projects/${projectId}/collaborators`)
  }

  // Sync Event Management
  onSyncEvent(projectId: string, callback: (event: CursorSyncEvent) => void): void {
    this.syncCallbacks.set(projectId, callback)
  }

  private triggerSyncEvent(projectId: string, event: CursorSyncEvent): void {
    const callback = this.syncCallbacks.get(projectId)
    if (callback) {
      callback(event)
    }
  }

  // Deep Links
  generateDeepLink(projectId: string, filePath?: string): string {
    const baseUrl = `cursor://open?project=${projectId}`
    return filePath ? `${baseUrl}&file=${encodeURIComponent(filePath)}` : baseUrl
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
}

export default CursorAPIService 