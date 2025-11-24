export interface ReplitRepl {
  id: string
  name: string
  language: string
  description?: string
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
  url: string
  isLive: boolean
  collaborators: ReplitCollaborator[]
  repository?: ReplitRepository
}

export interface ReplitCollaborator {
  id: string
  username: string
  role: 'owner' | 'admin' | 'write' | 'read'
  joinedAt: Date
  isOnline: boolean
  lastActivity: Date
}

export interface ReplitRepository {
  id: string
  name: string
  url: string
  branch: string
  isConnected: boolean
  lastSync: Date
}

export interface ReplitFile {
  path: string
  content: string
  size: number
  lastModified: Date
  isDirectory: boolean
  permissions: string
}

export interface ReplitEnvironment {
  variables: Record<string, string>
  packages: string[]
  secrets: Record<string, string>
  runtime: string
  language: string
  version: string
}

export interface ReplitLiveSession {
  id: string
  replId: string
  isActive: boolean
  participants: string[]
  startedAt: Date
  lastActivity: Date
}

class ReplitAPIService {
  private apiKey: string
  private baseUrl = 'https://api.replit.com/v0'
  private liveSessions: Map<string, ReplitLiveSession> = new Map()

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
        throw new Error(`Replit API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Replit API request failed:', error)
      throw error
    }
  }

  // Repl Management
  async createRepl(name: string, language: string, isPrivate: boolean = false): Promise<ReplitRepl> {
    const data = {
      name,
      language,
      isPrivate,
    }

    return this.request('/repls', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getRepl(replId: string): Promise<ReplitRepl> {
    return this.request(`/repls/${replId}`)
  }

  async listRepls(): Promise<ReplitRepl[]> {
    return this.request('/repls')
  }

  async deleteRepl(replId: string): Promise<void> {
    return this.request(`/repls/${replId}`, {
      method: 'DELETE',
    })
  }

  async cloneRepl(replId: string, newName?: string): Promise<ReplitRepl> {
    const data = newName ? { name: newName } : {}
    return this.request(`/repls/${replId}/clone`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Repository Creation/Import
  async createRepository(replId: string, repoName: string, isPrivate: boolean = false): Promise<ReplitRepository> {
    return this.request(`/repls/${replId}/repository`, {
      method: 'POST',
      body: JSON.stringify({ name: repoName, isPrivate }),
    })
  }

  async importRepository(replId: string, repoUrl: string, branch: string = 'main'): Promise<ReplitRepository> {
    return this.request(`/repls/${replId}/repository/import`, {
      method: 'POST',
      body: JSON.stringify({ url: repoUrl, branch }),
    })
  }

  async connectRepository(replId: string, repoUrl: string, branch: string = 'main'): Promise<ReplitRepository> {
    return this.request(`/repls/${replId}/repository/connect`, {
      method: 'POST',
      body: JSON.stringify({ url: repoUrl, branch }),
    })
  }

  async syncRepository(replId: string, direction: 'push' | 'pull' | 'both' = 'both'): Promise<void> {
    await this.request(`/repls/${replId}/repository/sync`, {
      method: 'POST',
      body: JSON.stringify({ direction }),
    })
  }

  async getRepositoryStatus(replId: string): Promise<{ isConnected: boolean; lastSync: Date; changes: any[] }> {
    return this.request(`/repls/${replId}/repository/status`)
  }

  // File Operations
  async readFile(replId: string, filePath: string): Promise<ReplitFile> {
    return this.request(`/repls/${replId}/files/${encodeURIComponent(filePath)}`)
  }

  async writeFile(replId: string, filePath: string, content: string): Promise<ReplitFile> {
    return this.request(`/repls/${replId}/files/${encodeURIComponent(filePath)}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  async listFiles(replId: string): Promise<ReplitFile[]> {
    return this.request(`/repls/${replId}/files`)
  }

  async deleteFile(replId: string, filePath: string): Promise<void> {
    return this.request(`/repls/${replId}/files/${encodeURIComponent(filePath)}`, {
      method: 'DELETE',
    })
  }

  async createDirectory(replId: string, dirPath: string): Promise<void> {
    await this.request(`/repls/${replId}/files/${encodeURIComponent(dirPath)}`, {
      method: 'POST',
      body: JSON.stringify({ type: 'directory' }),
    })
  }

  // Live Environment Management
  async startLiveSession(replId: string): Promise<ReplitLiveSession> {
    const session = await this.request(`/repls/${replId}/live/start`, {
      method: 'POST',
    })
    this.liveSessions.set(replId, session)
    return session
  }

  async joinLiveSession(replId: string, userId: string): Promise<ReplitLiveSession> {
    const session = await this.request(`/repls/${replId}/live/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
    this.liveSessions.set(replId, session)
    return session
  }

  async leaveLiveSession(replId: string, userId: string): Promise<void> {
    await this.request(`/repls/${replId}/live/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }

  async getLiveSession(replId: string): Promise<ReplitLiveSession | null> {
    try {
      return await this.request(`/repls/${replId}/live`)
    } catch {
      return null
    }
  }

  async endLiveSession(replId: string): Promise<void> {
    await this.request(`/repls/${replId}/live/end`, {
      method: 'POST',
    })
    this.liveSessions.delete(replId)
  }

  // Collaborative Editing
  async inviteCollaborator(replId: string, username: string, role: 'view' | 'comment' | 'edit' = 'edit'): Promise<void> {
    return this.request(`/repls/${replId}/collaborators`, {
      method: 'POST',
      body: JSON.stringify({ username, role }),
    })
  }

  async removeCollaborator(replId: string, username: string): Promise<void> {
    return this.request(`/repls/${replId}/collaborators/${username}`, {
      method: 'DELETE',
    })
  }

  async getCollaborators(replId: string): Promise<ReplitCollaborator[]> {
    return this.request(`/repls/${replId}/collaborators`)
  }

  async updateCollaboratorRole(replId: string, username: string, role: 'view' | 'comment' | 'edit'): Promise<void> {
    await this.request(`/repls/${replId}/collaborators/${username}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  }

  // Real-time Collaboration Features
  async sendChatMessage(replId: string, message: string, userId: string): Promise<void> {
    await this.request(`/repls/${replId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, userId }),
    })
  }

  async getChatHistory(replId: string): Promise<{ id: string; message: string; userId: string; timestamp: Date }[]> {
    return this.request(`/repls/${replId}/chat`)
  }

  async shareCursorPosition(replId: string, filePath: string, line: number, column: number, userId: string): Promise<void> {
    await this.request(`/repls/${replId}/cursor`, {
      method: 'POST',
      body: JSON.stringify({ filePath, line, column, userId }),
    })
  }

  async getActiveCursors(replId: string): Promise<{ userId: string; filePath: string; line: number; column: number }[]> {
    return this.request(`/repls/${replId}/cursors`)
  }

  // Environment Management
  async getEnvironment(replId: string): Promise<ReplitEnvironment> {
    return this.request(`/repls/${replId}/env`)
  }

  async setEnvironmentVariable(replId: string, key: string, value: string): Promise<void> {
    return this.request(`/repls/${replId}/env`, {
      method: 'POST',
      body: JSON.stringify({ [key]: value }),
    })
  }

  async installPackage(replId: string, packageName: string): Promise<void> {
    return this.request(`/repls/${replId}/packages`, {
      method: 'POST',
      body: JSON.stringify({ package: packageName }),
    })
  }

  async getInstalledPackages(replId: string): Promise<string[]> {
    return this.request(`/repls/${replId}/packages`)
  }

  async updateRuntime(replId: string, runtime: string, version: string): Promise<void> {
    await this.request(`/repls/${replId}/runtime`, {
      method: 'PATCH',
      body: JSON.stringify({ runtime, version }),
    })
  }

  // Deployment
  async deployRepl(replId: string, domain?: string): Promise<{ url: string }> {
    const data = domain ? { domain } : {}
    return this.request(`/repls/${replId}/deploy`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getDeployments(replId: string): Promise<{ id: string; url: string; status: string; createdAt: Date }[]> {
    return this.request(`/repls/${replId}/deployments`)
  }

  // Health Check
  async checkConnection(): Promise<boolean> {
    try {
      await this.request('/user')
      return true
    } catch {
      return false
    }
  }

  // Generate Repl URL
  generateReplUrl(replId: string): string {
    return `https://replit.com/@${replId}`
  }

  // Generate Live Session URL
  generateLiveUrl(replId: string): string {
    return `https://replit.com/@${replId}?live=true`
  }
}

export default ReplitAPIService 