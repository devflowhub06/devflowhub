'use client'

import { FileChange } from '@/components/modals/PreviewChangesModal'

export interface GitCommit {
  id: string
  message: string
  author: string
  timestamp: Date
  branch: string
  files: string[]
}

export interface GitBranch {
  name: string
  isCurrent: boolean
  lastCommit?: GitCommit
}

export class GitService {
  private projectId: string
  private baseUrl: string

  constructor(projectId: string) {
    this.projectId = projectId
    this.baseUrl = `/api/projects/${projectId}/git`
  }

  async createAssistantBranch(): Promise<string> {
    const branchName = `assistant/changes-${Date.now()}`
    
    try {
      const response = await fetch(`${this.baseUrl}/branches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branchName,
          fromBranch: 'main'
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create branch: ${response.statusText}`)
      }

      return branchName
    } catch (error) {
      console.error('Error creating assistant branch:', error)
      throw error
    }
  }

  async commitChanges(
    branchName: string,
    message: string,
    changes: FileChange[],
    author: string = 'AI Assistant'
  ): Promise<GitCommit> {
    try {
      const response = await fetch(`${this.baseUrl}/commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branchName,
          message,
          author,
          changes: changes.map(change => ({
            path: change.path,
            type: change.type,
            content: change.newContent,
            oldContent: change.oldContent
          }))
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to commit changes: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        id: result.commitId,
        message,
        author,
        timestamp: new Date(result.timestamp),
        branch: branchName,
        files: changes.map(c => c.path)
      }
    } catch (error) {
      console.error('Error committing changes:', error)
      throw error
    }
  }

  async getBranches(): Promise<GitBranch[]> {
    try {
      const response = await fetch(`${this.baseUrl}/branches`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch branches: ${response.statusText}`)
      }

      const result = await response.json()
      return result.branches.map((branch: any) => ({
        name: branch.name,
        isCurrent: branch.isCurrent,
        lastCommit: branch.lastCommit ? {
          id: branch.lastCommit.id,
          message: branch.lastCommit.message,
          author: branch.lastCommit.author,
          timestamp: new Date(branch.lastCommit.timestamp),
          branch: branch.name,
          files: branch.lastCommit.files || []
        } : undefined
      }))
    } catch (error) {
      console.error('Error fetching branches:', error)
      return []
    }
  }

  async getCommitHistory(branchName: string = 'main', limit: number = 10): Promise<GitCommit[]> {
    try {
      const response = await fetch(`${this.baseUrl}/history?branch=${branchName}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch commit history: ${response.statusText}`)
      }

      const result = await response.json()
      return result.commits.map((commit: any) => ({
        id: commit.id,
        message: commit.message,
        author: commit.author,
        timestamp: new Date(commit.timestamp),
        branch: commit.branch,
        files: commit.files || []
      }))
    } catch (error) {
      console.error('Error fetching commit history:', error)
      return []
    }
  }

  async mergeBranch(sourceBranch: string, targetBranch: string = 'main'): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceBranch,
          targetBranch
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to merge branch: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('Error merging branch:', error)
      return false
    }
  }

  async deleteBranch(branchName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/branches/${branchName}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete branch: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting branch:', error)
      return false
    }
  }
}
