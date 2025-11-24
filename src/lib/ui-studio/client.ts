export interface ComponentLibraryEntry {
  id: string
  name: string
  description: string | null
  category: string
  tags: string[]
  code: string
  props: any
  variants: any
  previewHtml: string | null
  story: string | null
  test: string | null
  projectId: string | null
  createdBy: string
  visibility: string
  version: string
  downloads: number
  likes: number
  createdAt: string
  updatedAt: string
}

export interface GenerationJob {
  id: string
  projectId: string
  userId: string
  prompt: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  result: any | null
  error: string | null
  estimatedCost: number
  actualCost: number | null
  tokensUsed: number | null
  processingTime: number | null
  createdAt: string
  updatedAt: string
}

export interface MetricsData {
  totalGenerations: number
  successfulGenerations: number
  totalCost: number
  averageGenerationTime: number
  componentsInserted: number
  librarySize: number
  averageRating: number
  activeUsers: number
  topComponents: Array<{
    name: string
    downloads: number
    rating: number
  }>
  costBreakdown: {
    generation: number
    processing: number
    storage: number
  }
  performanceMetrics: {
    averageResponseTime: number
    successRate: number
    userSatisfaction: number
  }
}

export class UIStudioClient {
  private baseUrl = '/api/ui-studio'

  /**
   * Generate a new component
   */
  async generateComponent(
    projectId: string,
    prompt: string,
    options: {
      variants?: number
      styleHints?: Record<string, any>
      themeHints?: Record<string, any>
    } = {}
  ): Promise<{ jobId: string; estimatedCost: number; status: string }> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        prompt,
        variants: options.variants || 3,
        styleHints: options.styleHints || {},
        themeHints: options.themeHints || { tailwindConfig: true }
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate component')
    }

    return response.json()
  }

  /**
   * Poll job status
   */
  async getJobStatus(jobId: string): Promise<GenerationJob> {
    const response = await fetch(`${this.baseUrl}/job/${jobId}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get job status')
    }

    return response.json()
  }

  /**
   * Get all generation jobs for a project
   */
  async getJobs(projectId: string): Promise<GenerationJob[]> {
    const response = await fetch(`${this.baseUrl}/jobs?projectId=${projectId}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get jobs')
    }

    return response.json()
  }

  /**
   * Get component library entries
   */
  async getComponents(projectId: string, options: {
    search?: string
    category?: string
    tags?: string[]
    limit?: number
    offset?: number
  } = {}): Promise<ComponentLibraryEntry[]> {
    const params = new URLSearchParams()
    params.set('projectId', projectId)
    
    if (options.search) params.set('search', options.search)
    if (options.category) params.set('category', options.category)
    if (options.tags?.length) params.set('tags', options.tags.join(','))
    if (options.limit) params.set('limit', options.limit.toString())
    if (options.offset) params.set('offset', options.offset.toString())

    const response = await fetch(`${this.baseUrl}/components?${params}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get components')
    }

    return response.json()
  }

  /**
   * Get a specific component by ID
   */
  async getComponent(componentId: string): Promise<ComponentLibraryEntry> {
    const response = await fetch(`${this.baseUrl}/components/${componentId}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get component')
    }

    return response.json()
  }

  /**
   * Insert component into project
   */
  async insertComponent(
    projectId: string,
    componentData: any,
    targetPath: string,
    options: {
      commitMessage?: string
      createTests?: boolean
      createStory?: boolean
    } = {}
  ): Promise<{
    branchName: string
    preview: {
      diffs: Array<{
        filePath: string
        type: 'added' | 'modified' | 'deleted'
        content: string
        diff: string
      }>
      filesCreated: number
      estimatedCost: number
    }
  }> {
    const response = await fetch(`${this.baseUrl}/insert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        componentData,
        targetPath,
        commitMessage: options.commitMessage || `AI: Add ${componentData.name} component`,
        createTests: options.createTests ?? true,
        createStory: options.createStory ?? true
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to insert component')
    }

    return response.json()
  }

  /**
   * Get metrics data
   */
  async getMetrics(projectId: string, timeRange: '7d' | '30d' | '90d' = '30d'): Promise<MetricsData> {
    const response = await fetch(`${this.baseUrl}/metrics?projectId=${projectId}&timeRange=${timeRange}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get metrics')
    }

    return response.json()
  }

  /**
   * Import from Figma
   */
  async importFromFigma(
    projectId: string,
    figmaToken: string,
    fileId: string,
    frameId: string
  ): Promise<{ jobId: string; estimatedCost: number; status: string }> {
    const response = await fetch(`${this.baseUrl}/figma/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        figmaToken,
        fileId,
        frameId
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to import from Figma')
    }

    return response.json()
  }

  /**
   * Like a component
   */
  async likeComponent(componentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/components/${componentId}/like`, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to like component')
    }
  }

  /**
   * Download a component (increment download count)
   */
  async downloadComponent(componentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/components/${componentId}/download`, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to download component')
    }
  }

  /**
   * Delete a component
   */
  async deleteComponent(componentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/components/${componentId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete component')
    }
  }

  /**
   * Update component visibility
   */
  async updateComponentVisibility(
    componentId: string,
    visibility: 'project' | 'private' | 'public'
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/components/${componentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ visibility }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update component visibility')
    }
  }
}

// Export a singleton instance
export const uiStudioClient = new UIStudioClient()
