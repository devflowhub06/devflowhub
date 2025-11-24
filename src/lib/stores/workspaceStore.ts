import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ToolType = 'REPLIT' | 'CURSOR' | 'V0' | 'BOLT'

export interface WorkspaceState {
  activeTool: ToolType
  projectId: string | null
  context: {
    lastModified: Date | null
    filesModified: string[]
    aiGenerations: number
    deployments: number
  }
  setActiveTool: (tool: ToolType) => void
  setProjectId: (id: string) => void
  updateContext: (updates: Partial<WorkspaceState['context']>) => void
  resetWorkspace: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      activeTool: 'REPLIT',
      projectId: null,
      context: {
        lastModified: null,
        filesModified: [],
        aiGenerations: 0,
        deployments: 0
      },
      
      setActiveTool: (tool: ToolType) => {
        set({ activeTool: tool })
        // Log tool switch to API
        const { projectId } = get()
        if (projectId) {
          fetch(`/api/projects/${projectId}/update-tool`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activeTool: tool })
          }).catch(console.error)
        }
      },
      
      setProjectId: (id: string) => set({ projectId: id }),
      
      updateContext: (updates) => {
        set((state) => ({
          context: {
            ...state.context,
            ...updates,
            lastModified: new Date()
          }
        }))
      },
      
      resetWorkspace: () => set({
        activeTool: 'REPLIT',
        projectId: null,
        context: {
          lastModified: null,
          filesModified: [],
          aiGenerations: 0,
          deployments: 0
        }
      })
    }),
    {
      name: 'devflow-workspace',
      partialize: (state) => ({
        activeTool: state.activeTool,
        projectId: state.projectId
      })
    }
  )
)
