import { useCallback } from 'react'
import { useWorkspaceStore } from '@/lib/stores/workspaceStore'

export const useUsage = () => {
  const { projectId, updateContext } = useWorkspaceStore()

  const logUsage = useCallback(async (
    tool: string,
    action: string,
    metadata?: any,
    durationMs?: number
  ) => {
    if (!projectId) return

    try {
      const response = await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          tool,
          action,
          durationMs,
          metadata
        })
      })

      if (response.ok) {
        // Update local context based on action type
        if (action === 'file_save') {
          updateContext({
            filesModified: [...(metadata?.files || [])]
          })
        } else if (action === 'ai_generation') {
          updateContext({
            aiGenerations: 1
          })
        } else if (action === 'deployment') {
          updateContext({
            deployments: 1
          })
        }
      }
    } catch (error) {
      console.error('Failed to log usage:', error)
    }
  }, [projectId, updateContext])

  const logToolSwitch = useCallback((fromTool: string, toTool: string) => {
    // Use the 'toTool' as the tool type since that's what the user is switching to
    logUsage(toTool.toUpperCase(), 'tool_switch', { fromTool, toTool })
  }, [logUsage])

  const logFileSave = useCallback((filePath: string, success: boolean) => {
    logUsage('CURSOR', 'file_save', { filePath, success })
  }, [logUsage])

  const logAIGeneration = useCallback((type: string, prompt: string, success: boolean) => {
    // Use 'CURSOR' as the tool since AI generation happens in the Cursor workspace
    logUsage('CURSOR', 'ai_generation', { type, prompt, success })
  }, [logUsage])

  const logDeployment = useCallback((environment: string, success: boolean) => {
    logUsage('BOLT', 'deployment', { environment, success })
  }, [logUsage])

  return {
    logUsage,
    logToolSwitch,
    logFileSave,
    logAIGeneration,
    logDeployment
  }
}
