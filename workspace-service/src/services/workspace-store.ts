import { randomUUID } from 'node:crypto'

interface WorkspaceOptions {
  template: string
  ttlMinutes: number
}

const DEFAULT_STATUS: WorkspaceStatus = {
  state: 'provisioning',
  message: 'Workspace scheduler not yet connected',
  ports: [],
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
}

export type WorkspaceStatus = {
  state: 'provisioning' | 'ready' | 'error' | 'destroyed'
  message: string
  ports: Array<{ name: string; port: number; protocol: 'http' | 'https' | 'tcp' }>
  createdAt: string
  expiresAt: string
}

export type WorkspaceRecord = {
  id: string
  projectId: string
  template: string
  status: WorkspaceStatus
}

class WorkspaceStore {
  private workspaces = new Map<string, WorkspaceRecord>()

  public create(projectId: string, opts: WorkspaceOptions): WorkspaceRecord {
    const id = randomUUID()
    const now = Date.now()
    const record: WorkspaceRecord = {
      id,
      projectId,
      template: opts.template,
      status: {
        ...DEFAULT_STATUS,
        createdAt: new Date(now).toISOString(),
        expiresAt: new Date(now + opts.ttlMinutes * 60 * 1000).toISOString(),
        message: 'Workspace scheduled — awaiting orchestrator connection',
      },
    }
    this.workspaces.set(id, record)
    return record
  }

  public get(id: string): WorkspaceRecord | undefined {
    return this.workspaces.get(id)
  }

  public updateStatus(id: string, status: WorkspaceStatus): WorkspaceRecord | undefined {
    const existing = this.workspaces.get(id)
    if (!existing) return undefined
    const updated: WorkspaceRecord = { ...existing, status }
    this.workspaces.set(id, updated)
    return updated
  }

  public delete(id: string): boolean {
    return this.workspaces.delete(id)
  }
}

export const workspaceStore = new WorkspaceStore()

