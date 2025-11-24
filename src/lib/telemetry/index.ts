// Telemetry and metrics tracking for DevFlowHub
export interface TelemetryEvent {
  event: string
  userId?: string
  projectId?: string
  metadata?: Record<string, any>
  timestamp: string
  sessionId?: string
}

export interface ProjectMetrics {
  projectsCreated: number
  templatesUsed: Record<string, number>
  timeToPreview: number[]
  firstDeployConversion: number
  assistantUsage: {
    tokensUsed: number
    requestsCount: number
    acceptanceRate: number
  }
  provisioningFailures: Record<string, number>
}

class TelemetryService {
  private events: TelemetryEvent[] = []
  private metrics: ProjectMetrics = {
    projectsCreated: 0,
    templatesUsed: {},
    timeToPreview: [],
    firstDeployConversion: 0,
    assistantUsage: {
      tokensUsed: 0,
      requestsCount: 0,
      acceptanceRate: 0
    },
    provisioningFailures: {}
  }

  // Track events
  trackEvent(event: TelemetryEvent) {
    this.events.push(event)
    
    // Update metrics based on event type
    this.updateMetrics(event)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry]', event)
    }
    
    // TODO: Send to external analytics service (PostHog, Mixpanel, etc.)
    this.sendToExternalService(event)
  }

  // Track project creation
  trackProjectCreated(projectId: string, userId: string, templateId?: string) {
    this.trackEvent({
      event: 'project.created',
      userId,
      projectId,
      metadata: {
        templateId,
        timestamp: Date.now()
      },
      timestamp: new Date().toISOString()
    })
  }

  // Track template usage
  trackTemplateUsed(templateId: string, userId: string) {
    this.trackEvent({
      event: 'template.used',
      userId,
      metadata: {
        templateId,
        timestamp: Date.now()
      },
      timestamp: new Date().toISOString()
    })
  }

  // Track time to preview
  trackTimeToPreview(projectId: string, userId: string, timeMs: number) {
    this.trackEvent({
      event: 'project.time_to_preview',
      userId,
      projectId,
      metadata: {
        timeMs,
        timestamp: Date.now()
      },
      timestamp: new Date().toISOString()
    })
  }

  // Track assistant usage
  trackAssistantUsage(
    userId: string, 
    projectId: string, 
    tokensUsed: number, 
    accepted: boolean
  ) {
    this.trackEvent({
      event: 'assistant.used',
      userId,
      projectId,
      metadata: {
        tokensUsed,
        accepted,
        timestamp: Date.now()
      },
      timestamp: new Date().toISOString()
    })
  }

  // Track provisioning failures
  trackProvisioningFailure(
    projectId: string, 
    userId: string, 
    step: string, 
    error: string
  ) {
    this.trackEvent({
      event: 'provisioning.failed',
      userId,
      projectId,
      metadata: {
        step,
        error,
        timestamp: Date.now()
      },
      timestamp: new Date().toISOString()
    })
  }

  // Track first deploy conversion
  trackFirstDeploy(projectId: string, userId: string) {
    this.trackEvent({
      event: 'deploy.first',
      userId,
      projectId,
      metadata: {
        timestamp: Date.now()
      },
      timestamp: new Date().toISOString()
    })
  }

  // Get metrics
  getMetrics(): ProjectMetrics {
    return { ...this.metrics }
  }

  // Get conversion funnel
  getConversionFunnel() {
    const totalProjects = this.metrics.projectsCreated
    const withPreview = this.metrics.timeToPreview.length
    const withFirstDeploy = this.metrics.firstDeployConversion

    return {
      create: totalProjects,
      preview: withPreview,
      deploy: withFirstDeploy,
      conversionRates: {
        createToPreview: totalProjects > 0 ? (withPreview / totalProjects) * 100 : 0,
        previewToDeploy: withPreview > 0 ? (withFirstDeploy / withPreview) * 100 : 0,
        createToDeploy: totalProjects > 0 ? (withFirstDeploy / totalProjects) * 100 : 0
      }
    }
  }

  // Update metrics based on events
  private updateMetrics(event: TelemetryEvent) {
    switch (event.event) {
      case 'project.created':
        this.metrics.projectsCreated++
        if (event.metadata?.templateId) {
          const templateId = event.metadata.templateId
          this.metrics.templatesUsed[templateId] = (this.metrics.templatesUsed[templateId] || 0) + 1
        }
        break

      case 'template.used':
        if (event.metadata?.templateId) {
          const templateId = event.metadata.templateId
          this.metrics.templatesUsed[templateId] = (this.metrics.templatesUsed[templateId] || 0) + 1
        }
        break

      case 'project.time_to_preview':
        if (event.metadata?.timeMs) {
          this.metrics.timeToPreview.push(event.metadata.timeMs)
        }
        break

      case 'assistant.used':
        this.metrics.assistantUsage.requestsCount++
        if (event.metadata?.tokensUsed) {
          this.metrics.assistantUsage.tokensUsed += event.metadata.tokensUsed
        }
        // Update acceptance rate
        const acceptedRequests = this.events.filter(e => 
          e.event === 'assistant.used' && e.metadata?.accepted
        ).length
        this.metrics.assistantUsage.acceptanceRate = 
          this.metrics.assistantUsage.requestsCount > 0 
            ? (acceptedRequests / this.metrics.assistantUsage.requestsCount) * 100 
            : 0
        break

      case 'provisioning.failed':
        if (event.metadata?.step) {
          const step = event.metadata.step
          this.metrics.provisioningFailures[step] = (this.metrics.provisioningFailures[step] || 0) + 1
        }
        break

      case 'deploy.first':
        this.metrics.firstDeployConversion++
        break
    }
  }

  // Send to external service
  private async sendToExternalService(event: TelemetryEvent) {
    try {
      // TODO: Implement actual external service integration
      // For now, we'll just log it
      if (process.env.NODE_ENV === 'production') {
        // Send to PostHog, Mixpanel, or other analytics service
        console.log('[Production Telemetry]', event)
      }
    } catch (error) {
      console.error('Failed to send telemetry event:', error)
    }
  }

  // Estimate costs
  estimateCosts(projectId: string): {
    sandbox: { cpu: number; memory: number; storage: number }
    assistant: { tokens: number; cost: number }
    deployment: { bandwidth: number; compute: number }
  } {
    // TODO: Implement actual cost estimation based on usage
    return {
      sandbox: { cpu: 0.1, memory: 512, storage: 1 },
      assistant: { tokens: 0, cost: 0 },
      deployment: { bandwidth: 0, compute: 0 }
    }
  }
}

// Export singleton instance
export const telemetry = new TelemetryService()

// Helper functions for common tracking scenarios
export function trackProjectCreation(projectId: string, userId: string, templateId?: string) {
  telemetry.trackProjectCreated(projectId, userId, templateId)
}

export function trackTemplateUsage(templateId: string, userId: string) {
  telemetry.trackTemplateUsed(templateId, userId)
}

export function trackPreviewTime(projectId: string, userId: string, timeMs: number) {
  telemetry.trackTimeToPreview(projectId, userId, timeMs)
}

export function trackAssistantCall(
  userId: string, 
  projectId: string, 
  tokensUsed: number, 
  accepted: boolean
) {
  telemetry.trackAssistantUsage(userId, projectId, tokensUsed, accepted)
}

export function trackProvisioningError(
  projectId: string, 
  userId: string, 
  step: string, 
  error: string
) {
  telemetry.trackProvisioningFailure(projectId, userId, step, error)
}

export function trackDeployment(projectId: string, userId: string) {
  telemetry.trackFirstDeploy(projectId, userId)
}
