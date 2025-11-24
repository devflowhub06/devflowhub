/**
 * DevFlowHub AI Router Service
 * Single entrypoint for AI requests that routes to appropriate modules
 */

import { isFeatureEnabled } from './feature-flags'
import { DevFlowHubModule, getModuleMappingByModule } from './module-mapping'

export interface AIRequest {
  type: 'code_completion' | 'code_explanation' | 'ui_generation' | 'deployment_help' | 'general'
  content: string
  context?: {
    projectId: string
    module: DevFlowHubModule
    provider: string
    language?: string
    framework?: string
  }
  userId: string
}

export interface AIResponse {
  success: boolean
  content: string
  module: DevFlowHubModule
  provider: string
  metadata?: Record<string, any>
  error?: string
}

export interface ModuleCapabilities {
  codeCompletion: boolean
  codeExplanation: boolean
  uiGeneration: boolean
  deploymentHelp: boolean
  general: boolean
}

class AIRouter {
  private moduleCapabilities: Record<DevFlowHubModule, ModuleCapabilities> = {
    editor: {
      codeCompletion: true,
      codeExplanation: true,
      uiGeneration: false,
      deploymentHelp: false,
      general: true
    },
    sandbox: {
      codeCompletion: true,
      codeExplanation: true,
      uiGeneration: false,
      deploymentHelp: false,
      general: true
    },
    ui_studio: {
      codeCompletion: false,
      codeExplanation: false,
      uiGeneration: true,
      deploymentHelp: false,
      general: true
    },
    deployer: {
      codeCompletion: false,
      codeExplanation: false,
      uiGeneration: false,
      deploymentHelp: true,
      general: true
    }
  }

  /**
   * Route AI request to appropriate module
   */
  async routeRequest(request: AIRequest): Promise<AIResponse> {
    if (!isFeatureEnabled('AI_ROUTER')) {
      // Fallback to legacy routing
      return this.legacyRoute(request)
    }

    try {
      // Determine target module based on request type
      const targetModule = this.determineTargetModule(request)
      
      // Get module mapping for provenance
      const mapping = getModuleMappingByModule(targetModule)
      
      // Route to appropriate service
      const response = await this.routeToModule(targetModule, request)
      
      return {
        success: true,
        content: response.content,
        module: targetModule,
        provider: mapping.provider,
        metadata: {
          routedAt: new Date().toISOString(),
          requestType: request.type,
          moduleCapabilities: this.moduleCapabilities[targetModule]
        }
      }
    } catch (error) {
      return {
        success: false,
        content: '',
        module: request.context?.module || 'editor',
        provider: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Determine target module based on request type and context
   */
  private determineTargetModule(request: AIRequest): DevFlowHubModule {
    // If context specifies a module, use it if it supports the request type
    if (request.context?.module) {
      const capabilities = this.moduleCapabilities[request.context.module]
      if (this.canHandleRequest(request.type, capabilities)) {
        return request.context.module
      }
    }

    // Route based on request type
    switch (request.type) {
      case 'code_completion':
      case 'code_explanation':
        return 'editor' // Default to editor for code-related requests
      
      case 'ui_generation':
        return 'ui_studio'
      
      case 'deployment_help':
        return 'deployer'
      
      case 'general':
      default:
        // If no specific context, default to editor
        return request.context?.module || 'editor'
    }
  }

  /**
   * Check if module can handle the request type
   */
  private canHandleRequest(requestType: AIRequest['type'], capabilities: ModuleCapabilities): boolean {
    switch (requestType) {
      case 'code_completion':
        return capabilities.codeCompletion
      case 'code_explanation':
        return capabilities.codeExplanation
      case 'ui_generation':
        return capabilities.uiGeneration
      case 'deployment_help':
        return capabilities.deploymentHelp
      case 'general':
        return capabilities.general
      default:
        return false
    }
  }

  /**
   * Route request to specific module
   */
  private async routeToModule(module: DevFlowHubModule, request: AIRequest): Promise<{ content: string }> {
    // This would integrate with the actual AI services
    // For now, return a placeholder response
    
    switch (module) {
      case 'editor':
        return await this.handleEditorRequest(request)
      
      case 'sandbox':
        return await this.handleSandboxRequest(request)
      
      case 'ui_studio':
        return await this.handleUIStudioRequest(request)
      
      case 'deployer':
        return await this.handleDeployerRequest(request)
      
      default:
        throw new Error(`Unknown module: ${module}`)
    }
  }

  /**
   * Handle editor-specific AI requests
   */
  private async handleEditorRequest(request: AIRequest): Promise<{ content: string }> {
    // This would call the actual Cursor/Editor AI service
    return {
      content: `Editor AI response for: ${request.content}`
    }
  }

  /**
   * Handle sandbox-specific AI requests
   */
  private async handleSandboxRequest(request: AIRequest): Promise<{ content: string }> {
    // This would call the actual Replit/Sandbox AI service
    return {
      content: `Sandbox AI response for: ${request.content}`
    }
  }

  /**
   * Handle UI Studio-specific AI requests
   */
  private async handleUIStudioRequest(request: AIRequest): Promise<{ content: string }> {
    // This would call the actual v0/UI Studio AI service
    return {
      content: `UI Studio AI response for: ${request.content}`
    }
  }

  /**
   * Handle deployer-specific AI requests
   */
  private async handleDeployerRequest(request: AIRequest): Promise<{ content: string }> {
    // This would call the actual Bolt/Deployer AI service
    return {
      content: `Deployer AI response for: ${request.content}`
    }
  }

  /**
   * Legacy routing (fallback when feature flag is disabled)
   */
  private async legacyRoute(request: AIRequest): Promise<AIResponse> {
    // This would use the existing routing logic
    return {
      success: true,
      content: `Legacy AI response for: ${request.content}`,
      module: 'editor',
      provider: 'cursor'
    }
  }

  /**
   * Get module capabilities
   */
  getModuleCapabilities(module: DevFlowHubModule): ModuleCapabilities {
    return this.moduleCapabilities[module]
  }

  /**
   * Update module capabilities (for configuration)
   */
  updateModuleCapabilities(module: DevFlowHubModule, capabilities: Partial<ModuleCapabilities>): void {
    this.moduleCapabilities[module] = {
      ...this.moduleCapabilities[module],
      ...capabilities
    }
  }
}

// Export singleton instance
export const aiRouter = new AIRouter()

// Export for testing
export { AIRouter }
