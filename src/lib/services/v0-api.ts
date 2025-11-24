export interface V0Component {
  id: string
  name: string
  description: string
  code: string
  language: 'tsx' | 'jsx' | 'vue' | 'svelte'
  framework: 'react' | 'vue' | 'svelte' | 'angular'
  category: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  previewUrl?: string
}

export interface V0DesignSystem {
  id: string
  name: string
  description: string
  colors: V0Color[]
  typography: V0Typography[]
  spacing: V0Spacing[]
  components: V0Component[]
  version: string
  isPublic: boolean
}

export interface V0Color {
  name: string
  value: string
  category: 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic'
  variants: Record<string, string>
}

export interface V0Typography {
  name: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  fontFamily: string
  category: 'heading' | 'body' | 'caption' | 'button'
}

export interface V0Spacing {
  name: string
  value: string
  category: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export interface V0Preview {
  id: string
  componentId: string
  url: string
  thumbnail: string
  isInteractive: boolean
  viewport: 'mobile' | 'tablet' | 'desktop'
  createdAt: Date
}

export interface V0GenerationRequest {
  prompt: string
  framework: 'react' | 'vue' | 'svelte' | 'angular'
  language: 'tsx' | 'jsx' | 'vue' | 'svelte'
  designSystem?: string
  style?: 'modern' | 'minimal' | 'playful' | 'professional'
  features?: string[]
}

export interface V0GenerationResponse {
  component: V0Component
  preview: V0Preview
  alternatives: V0Component[]
  estimatedTime: number
}

class V0APIService {
  private apiKey: string
  private baseUrl = 'https://api.v0.dev/v1'

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
        throw new Error(`v0 API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('v0 API request failed:', error)
      throw error
    }
  }

  // Component Generation
  async generateComponent(request: V0GenerationRequest): Promise<V0GenerationResponse> {
    return this.request('/components/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async generateComponentFromImage(imageUrl: string, framework: 'react' | 'vue' | 'svelte' = 'react'): Promise<V0GenerationResponse> {
    return this.request('/components/generate-from-image', {
      method: 'POST',
      body: JSON.stringify({ imageUrl, framework }),
    })
  }

  async generateComponentFromSketch(sketchData: string, framework: 'react' | 'vue' | 'svelte' = 'react'): Promise<V0GenerationResponse> {
    return this.request('/components/generate-from-sketch', {
      method: 'POST',
      body: JSON.stringify({ sketchData, framework }),
    })
  }

  async refineComponent(componentId: string, feedback: string): Promise<V0Component> {
    return this.request(`/components/${componentId}/refine`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    })
  }

  async generateVariants(componentId: string, count: number = 3): Promise<V0Component[]> {
    return this.request(`/components/${componentId}/variants`, {
      method: 'POST',
      body: JSON.stringify({ count }),
    })
  }

  // Component Management
  async getComponent(componentId: string): Promise<V0Component> {
    return this.request(`/components/${componentId}`)
  }

  async listComponents(filters?: {
    framework?: string
    category?: string
    tags?: string[]
  }): Promise<V0Component[]> {
    const params = new URLSearchParams()
    if (filters?.framework) params.append('framework', filters.framework)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.tags) filters.tags.forEach(tag => params.append('tags', tag))

    return this.request(`/components?${params.toString()}`)
  }

  async saveComponent(component: Omit<V0Component, 'id' | 'createdAt' | 'updatedAt'>): Promise<V0Component> {
    return this.request('/components', {
      method: 'POST',
      body: JSON.stringify(component),
    })
  }

  async updateComponent(componentId: string, updates: Partial<V0Component>): Promise<V0Component> {
    return this.request(`/components/${componentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async deleteComponent(componentId: string): Promise<void> {
    await this.request(`/components/${componentId}`, {
      method: 'DELETE',
    })
  }

  // Design System Sync
  async createDesignSystem(designSystem: Omit<V0DesignSystem, 'id' | 'version'>): Promise<V0DesignSystem> {
    return this.request('/design-systems', {
      method: 'POST',
      body: JSON.stringify(designSystem),
    })
  }

  async getDesignSystem(designSystemId: string): Promise<V0DesignSystem> {
    return this.request(`/design-systems/${designSystemId}`)
  }

  async listDesignSystems(): Promise<V0DesignSystem[]> {
    return this.request('/design-systems')
  }

  async updateDesignSystem(designSystemId: string, updates: Partial<V0DesignSystem>): Promise<V0DesignSystem> {
    return this.request(`/design-systems/${designSystemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async syncDesignSystem(designSystemId: string, source: 'figma' | 'sketch' | 'adobe' | 'custom'): Promise<V0DesignSystem> {
    return this.request(`/design-systems/${designSystemId}/sync`, {
      method: 'POST',
      body: JSON.stringify({ source }),
    })
  }

  async exportDesignSystem(designSystemId: string, format: 'json' | 'css' | 'scss' | 'tailwind'): Promise<string> {
    const response = await this.request(`/design-systems/${designSystemId}/export`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    })
    return response.data
  }

  async importDesignSystem(data: any, source: 'figma' | 'sketch' | 'adobe' | 'custom'): Promise<V0DesignSystem> {
    return this.request('/design-systems/import', {
      method: 'POST',
      body: JSON.stringify({ data, source }),
    })
  }

  // UI Preview Capabilities
  async createPreview(componentId: string, viewport: 'mobile' | 'tablet' | 'desktop' = 'desktop'): Promise<V0Preview> {
    return this.request('/previews', {
      method: 'POST',
      body: JSON.stringify({ componentId, viewport }),
    })
  }

  async getPreview(previewId: string): Promise<V0Preview> {
    return this.request(`/previews/${previewId}`)
  }

  async updatePreview(previewId: string, updates: Partial<V0Preview>): Promise<V0Preview> {
    return this.request(`/previews/${previewId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async generateInteractivePreview(componentId: string): Promise<V0Preview> {
    return this.request(`/previews/${componentId}/interactive`, {
      method: 'POST',
    })
  }

  async captureScreenshot(componentId: string, viewport: 'mobile' | 'tablet' | 'desktop' = 'desktop'): Promise<string> {
    const response = await this.request(`/components/${componentId}/screenshot`, {
      method: 'POST',
      body: JSON.stringify({ viewport }),
    })
    return response.imageUrl
  }

  // Advanced Features
  async generateStorybookStories(componentId: string): Promise<string> {
    const response = await this.request(`/components/${componentId}/stories`, {
      method: 'POST',
    })
    return response.stories
  }

  async generateTests(componentId: string, framework: 'jest' | 'vitest' | 'cypress' = 'jest'): Promise<string> {
    const response = await this.request(`/components/${componentId}/tests`, {
      method: 'POST',
      body: JSON.stringify({ framework }),
    })
    return response.tests
  }

  async generateDocumentation(componentId: string): Promise<string> {
    const response = await this.request(`/components/${componentId}/docs`, {
      method: 'POST',
    })
    return response.documentation
  }

  // Code Analysis
  async analyzeComponent(code: string): Promise<{
    complexity: number
    accessibility: string[]
    performance: string[]
    suggestions: string[]
  }> {
    return this.request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async optimizeComponent(componentId: string): Promise<V0Component> {
    return this.request(`/components/${componentId}/optimize`, {
      method: 'POST',
    })
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

  // Generate Deep Links
  generateComponentUrl(componentId: string): string {
    return `https://v0.dev/component/${componentId}`
  }

  generatePreviewUrl(previewId: string): string {
    return `https://v0.dev/preview/${previewId}`
  }

  generateDesignSystemUrl(designSystemId: string): string {
    return `https://v0.dev/design-system/${designSystemId}`
  }
}

export default V0APIService 