'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { ContextManager } from '@/lib/services/context-manager'
import { ProjectContext, ToolType, ProjectFile, Requirement, CodeSnippet, DesignDecision, SyncStatus, VersionHistory } from '@/lib/types/context'

interface ProjectContextProviderProps {
  children: React.ReactNode
  projectId: string
}

interface ProjectContextValue {
  context: ProjectContext
  addFile: (file: Omit<ProjectFile, 'lastModified'>) => Promise<void>
  updateFile: (path: string, content: string) => Promise<void>
  addRequirement: (requirement: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  addCodeSnippet: (snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  addDesignDecision: (decision: Omit<DesignDecision, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateToolConfig: (tool: ToolType, config: Record<string, any>) => Promise<void>
  syncToTool: (tool: ToolType) => Promise<void>
  exportContext: () => Promise<Blob>
  getSyncStatus: (tool: ToolType) => SyncStatus | undefined
  getVersionHistory: () => VersionHistory[]
}

const ProjectContextContext = createContext<ProjectContextValue | null>(null)

export function ProjectContextProvider({ children, projectId }: ProjectContextProviderProps) {
  const [contextManager] = useState(() => new ContextManager(projectId))
  const [context, setContext] = useState<ProjectContext>(contextManager.getContext())

  // Update context when changes occur
  useEffect(() => {
    setContext(contextManager.getContext())
  }, [contextManager])

  const value: ProjectContextValue = {
    context,
    addFile: async (file) => {
      await contextManager.addFile(file)
      setContext(contextManager.getContext())
    },
    updateFile: async (path, content) => {
      await contextManager.updateFile(path, content)
      setContext(contextManager.getContext())
    },
    addRequirement: async (requirement) => {
      await contextManager.addRequirement(requirement)
      setContext(contextManager.getContext())
    },
    addCodeSnippet: async (snippet) => {
      await contextManager.addCodeSnippet(snippet)
      setContext(contextManager.getContext())
    },
    addDesignDecision: async (decision) => {
      await contextManager.addDesignDecision(decision)
      setContext(contextManager.getContext())
    },
    updateToolConfig: async (tool, config) => {
      await contextManager.updateToolConfig(tool, config)
      setContext(contextManager.getContext())
    },
    syncToTool: async (tool) => {
      await contextManager.syncToTool(tool)
      setContext(contextManager.getContext())
    },
    exportContext: () => contextManager.exportContext(),
    getSyncStatus: (tool) => contextManager.getSyncStatus(tool),
    getVersionHistory: () => contextManager.getVersionHistory()
  }

  return (
    <ProjectContextContext.Provider value={value}>
      {children}
    </ProjectContextContext.Provider>
  )
}

export function useProjectContext() {
  const context = useContext(ProjectContextContext)
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectContextProvider')
  }
  return context
} 