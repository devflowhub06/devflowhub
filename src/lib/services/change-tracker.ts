'use client'

import { FileChange, ProposedChange } from '@/components/modals/PreviewChangesModal'
import { metricsTracker } from './metrics-tracker'

export interface ChangeTrackerState {
  proposedChanges: ProposedChange[]
  isModalOpen: boolean
  currentChange: ProposedChange | null
  isProcessing: boolean
}

export class ChangeTracker {
  private state: ChangeTrackerState = {
    proposedChanges: [],
    isModalOpen: false,
    currentChange: null,
    isProcessing: false
  }

  private listeners: Set<(state: ChangeTrackerState) => void> = new Set()

  subscribe(listener: (state: ChangeTrackerState) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state))
  }

  private updateState(updates: Partial<ChangeTrackerState>) {
    this.state = { ...this.state, ...updates }
    this.notify()
  }

  proposeChange(change: Omit<ProposedChange, 'id' | 'timestamp'>) {
    const proposedChange: ProposedChange = {
      ...change,
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    // Track metrics
    const fileTypes = proposedChange.files.map(f => f.language || 'unknown')
    metricsTracker.trackProposal(proposedChange.id, proposedChange.files.length, fileTypes)

    this.updateState({
      proposedChanges: [...this.state.proposedChanges, proposedChange],
      currentChange: proposedChange,
      isModalOpen: true
    })

    return proposedChange.id
  }

  approveChange(changeId: string, commitMessage: string) {
    const change = this.state.proposedChanges.find(c => c.id === changeId)
    if (!change) return

    // Track metrics
    metricsTracker.trackApproval(changeId, commitMessage)

    this.updateState({
      isProcessing: true
    })

    // This will be handled by the parent component
    return { change, commitMessage }
  }

  rejectChange(changeId: string) {
    const change = this.state.proposedChanges.find(c => c.id === changeId)
    if (!change) return

    // Track metrics
    metricsTracker.trackRejection(changeId)

    this.updateState({
      proposedChanges: this.state.proposedChanges.filter(c => c.id !== changeId),
      isModalOpen: false,
      currentChange: null
    })

    return change
  }

  closeModal() {
    this.updateState({
      isModalOpen: false,
      currentChange: null
    })
  }

  setProcessing(processing: boolean) {
    this.updateState({
      isProcessing: processing
    })
  }

  getState() {
    return this.state
  }

  // Helper method to create a proposed change from AI Assistant response
  static createProposedChange(
    summary: string,
    rationale: string,
    files: FileChange[],
    assistantId: string = 'ai-assistant'
  ): Omit<ProposedChange, 'id' | 'timestamp'> {
    const suggestedCommitMessage = `AI Assistant: ${summary}`
    
    return {
      summary,
      rationale,
      files,
      suggestedCommitMessage,
      assistantId
    }
  }

  // Helper method to parse AI response into file changes
  static parseFileChanges(aiResponse: {
    codeChanges?: Array<{
      file: string
      content: string
      action: 'create' | 'modify' | 'delete'
    }>
    fileOperations?: Array<{
      path: string
      content?: string
      operation: 'create' | 'update' | 'delete'
    }>
  }): FileChange[] {
    const changes: FileChange[] = []

    // Parse codeChanges
    if (aiResponse.codeChanges) {
      aiResponse.codeChanges.forEach(change => {
        changes.push({
          path: change.file,
          type: change.action,
          newContent: change.content,
          language: this.getLanguageFromPath(change.file)
        })
      })
    }

    // Parse fileOperations
    if (aiResponse.fileOperations) {
      aiResponse.fileOperations.forEach(op => {
        const existingChange = changes.find(c => c.path === op.path)
        if (existingChange) {
          // Update existing change
          if (op.operation === 'create' || op.operation === 'update') {
            existingChange.newContent = op.content
            existingChange.type = existingChange.type === 'delete' ? 'modify' : existingChange.type
          } else if (op.operation === 'delete') {
            existingChange.type = 'delete'
            delete existingChange.newContent
          }
        } else {
          changes.push({
            path: op.path,
            type: op.operation === 'create' ? 'create' : 
                  op.operation === 'update' ? 'modify' : 'delete',
            newContent: op.content,
            language: this.getLanguageFromPath(op.path)
          })
        }
      })
    }

    return changes
  }

  private static getLanguageFromPath(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'fish': 'bash'
    }
    return languageMap[ext || ''] || 'text'
  }
}

// Global instance
export const changeTracker = new ChangeTracker()
