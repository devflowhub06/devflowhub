'use client'

import { DeploymentPreview, DeploymentChange } from '@/components/modals/DeployPreviewModal'

export interface DeploymentStatus {
  id: string
  projectId: string
  environment: 'staging' | 'production'
  status: 'pending' | 'building' | 'deployed' | 'failed' | 'rolled_back'
  url?: string
  deployedAt?: string
  rollbackUrl?: string
  error?: string
}

export interface RollbackInfo {
  id: string
  previousDeploymentId: string
  rollbackUrl: string
  status: 'pending' | 'completed' | 'failed'
}

export class DeploymentService {
  private projectId: string
  private baseUrl: string

  constructor(projectId: string) {
    this.projectId = projectId
    this.baseUrl = '/api/projects'
  }

  async createDeploymentPreview(): Promise<DeploymentPreview | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.projectId}/deploy/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create deployment preview')
      }

      const data = await response.json()
      return data.preview
    } catch (error) {
      console.error('Error creating deployment preview:', error)
      return null
    }
  }

  async deployToEnvironment(environment: 'staging' | 'production'): Promise<{ success: boolean; deploymentId?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.projectId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ environment }),
      })

      const data = await response.json()
      
      if (response.ok) {
        return { success: true, deploymentId: data.deploymentId }
      } else {
        throw new Error(data.error || 'Deployment failed')
      }
    } catch (error) {
      console.error('Error deploying:', error)
      return { success: false }
    }
  }

  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.projectId}/deploy/${deploymentId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to get deployment status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting deployment status:', error)
      return null
    }
  }

  async rollbackDeployment(deploymentId: string): Promise<{ success: boolean; rollbackId?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.projectId}/deploy/${deploymentId}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (response.ok) {
        return { success: true, rollbackId: data.rollbackId }
      } else {
        throw new Error(data.error || 'Rollback failed')
      }
    } catch (error) {
      console.error('Error rolling back deployment:', error)
      return { success: false }
    }
  }

  async getDeploymentHistory(): Promise<DeploymentStatus[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.projectId}/deploy/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to get deployment history')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting deployment history:', error)
      return []
    }
  }

  async getRollbackInfo(deploymentId: string): Promise<RollbackInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.projectId}/deploy/${deploymentId}/rollback-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to get rollback info')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting rollback info:', error)
      return null
    }
  }

  async cancelDeployment(deploymentId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.projectId}/deploy/${deploymentId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      return { success: response.ok }
    } catch (error) {
      console.error('Error canceling deployment:', error)
      return { success: false }
    }
  }
}

export function useDeploymentService(projectId: string) {
  return new DeploymentService(projectId)
}
