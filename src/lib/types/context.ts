export interface ProjectFile {
  path: string
  content: string
  lastModified: Date
  tool: ToolType
}

export interface Requirement {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: Date
  updatedAt: Date
}

export interface CodeSnippet {
  id: string
  title: string
  code: string
  language: string
  description?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface DesignDecision {
  id: string
  title: string
  description: string
  rationale: string
  alternatives: string[]
  impact: string
  createdAt: Date
  updatedAt: Date
}

export interface ToolConfig {
  tool: ToolType
  config: Record<string, any>
  lastSynced: Date
  version: string
}

export interface ProjectContext {
  id: string
  projectId: string
  files: ProjectFile[]
  requirements: Requirement[]
  codeSnippets: CodeSnippet[]
  designDecisions: DesignDecision[]
  toolConfigs: ToolConfig[]
  version: number
  lastSynced: Date
  createdAt: Date
  updatedAt: Date
}

export interface SyncStatus {
  tool: ToolType
  status: 'synced' | 'pending' | 'conflict'
  lastSynced: Date
  conflicts?: {
    filePath: string
    localVersion: string
    remoteVersion: string
  }[]
}

export interface VersionHistory {
  id: string
  projectId: string
  version: number
  changes: {
    type: 'file' | 'requirement' | 'snippet' | 'design' | 'config'
    action: 'create' | 'update' | 'delete'
    path: string
    timestamp: Date
  }[]
  createdAt: Date
  createdBy: string
}

export type ToolType = 'replit' | 'cursor' | 'v0' | 'bolt'; 