'use client'

import { ConflictFile, SyncConflict, ConflictResolution } from '@/components/modals/SyncConflictModal'

export class SyncService {
  private projectId: string
  private baseUrl: string

  constructor(projectId: string) {
    this.projectId = projectId
    this.baseUrl = '/api/projects'
  }

  async checkForConflicts(): Promise<SyncConflict | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.projectId}/sync/check-conflicts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to check for conflicts')
      }

      const data = await response.json()
      return data.conflict || null
    } catch (error) {
      console.error('Error checking for conflicts:', error)
      return null
    }
  }

  async syncFiles(): Promise<{ success: boolean; conflict?: SyncConflict }> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.projectId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (response.ok) {
        return { success: true }
      } else if (data.conflict) {
        return { success: false, conflict: data.conflict }
      } else {
        throw new Error(data.error || 'Sync failed')
      }
    } catch (error) {
      console.error('Error syncing files:', error)
      return { success: false }
    }
  }

  async resolveConflicts(resolution: ConflictResolution): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.projectId}/sync/resolve-conflicts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resolution),
      })

      const data = await response.json()
      
      if (response.ok) {
        return { success: true }
      } else {
        throw new Error(data.error || 'Failed to resolve conflicts')
      }
    } catch (error) {
      console.error('Error resolving conflicts:', error)
      return { success: false }
    }
  }

  async getFileHistory(filePath: string): Promise<{ versions: Array<{ content: string; timestamp: string; source: 'local' | 'remote' }> }> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.projectId}/files/${encodeURIComponent(filePath)}/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to get file history')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting file history:', error)
      return { versions: [] }
    }
  }

  async createBackup(): Promise<{ backupId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.projectId}/sync/backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create backup')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating backup:', error)
      throw error
    }
  }

  async restoreFromBackup(backupId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.projectId}/sync/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupId }),
      })

      const data = await response.json()
      return { success: response.ok }
    } catch (error) {
      console.error('Error restoring from backup:', error)
      return { success: false }
    }
  }
}

export function useSyncService(projectId: string) {
  return new SyncService(projectId)
}
