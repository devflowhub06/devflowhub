export interface UsageEvent {
  projectId: string
  tool: 'cursor' | 'replit' | 'v0' | 'bolt' | 'ai_assistant'
  action: string
  durationMs?: number
  metadata?: Record<string, any>
}

export const logUsage = async (event: UsageEvent) => {
  try {
    const response = await fetch('/api/usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      console.warn('Failed to log usage:', event)
    }
  } catch (error) {
    console.warn('Error logging usage:', error)
  }
}

// Convenience functions for common actions
export const usageHelpers = {
  toolSwitch: (projectId: string, fromTool: string, toTool: string) =>
    logUsage({
      projectId,
      tool: toTool as any,
      action: 'tool_switch',
      metadata: { fromTool, toTool }
    }),

  fileEdit: (projectId: string, tool: string, filePath: string, durationMs?: number) =>
    logUsage({
      projectId,
      tool: tool as any,
      action: 'file_edit',
      durationMs,
      metadata: { filePath }
    }),

  aiRequest: (projectId: string, tool: string, requestType: string, tokensUsed?: number) =>
    logUsage({
      projectId,
      tool: tool as any,
      action: 'ai_request',
      metadata: { requestType, tokensUsed }
    }),

  deployment: (projectId: string, tool: string, environment: string, success: boolean) =>
    logUsage({
      projectId,
      tool: tool as any,
      action: 'deployment',
      metadata: { environment, success }
    }),

  componentGenerated: (projectId: string, framework: string, category: string) =>
    logUsage({
      projectId,
      tool: 'v0',
      action: 'component_generated',
      metadata: { framework, category }
    }),

  replCreated: (projectId: string, language: string) =>
    logUsage({
      projectId,
      tool: 'replit',
      action: 'repl_created',
      metadata: { language }
    })
}
