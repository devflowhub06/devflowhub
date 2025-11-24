'use client'

export interface AssistantMetrics {
  totalProposals: number
  approvedChanges: number
  rejectedChanges: number
  approvalRate: number
  averageFilesPerChange: number
  mostCommonFileTypes: Array<{ type: string; count: number }>
  averageCommitMessageLength: number
  timeToApproval: number // in minutes
}

export interface ChangeMetrics {
  changeId: string
  timestamp: Date
  action: 'proposed' | 'approved' | 'rejected'
  filesCount: number
  fileTypes: string[]
  commitMessageLength: number
  timeToDecision?: number // in minutes
}

export class MetricsTracker {
  private metrics: AssistantMetrics = {
    totalProposals: 0,
    approvedChanges: 0,
    rejectedChanges: 0,
    approvalRate: 0,
    averageFilesPerChange: 0,
    mostCommonFileTypes: [],
    averageCommitMessageLength: 0,
    timeToApproval: 0
  }

  private changeHistory: ChangeMetrics[] = []

  // Track a new proposal
  trackProposal(changeId: string, filesCount: number, fileTypes: string[]) {
    this.metrics.totalProposals++
    
    this.changeHistory.push({
      changeId,
      timestamp: new Date(),
      action: 'proposed',
      filesCount,
      fileTypes,
      commitMessageLength: 0
    })

    this.updateDerivedMetrics()
  }

  // Track approval
  trackApproval(changeId: string, commitMessage: string) {
    this.metrics.approvedChanges++
    
    const change = this.changeHistory.find(c => c.changeId === changeId)
    if (change) {
      change.action = 'approved'
      change.commitMessageLength = commitMessage.length
      change.timeToDecision = this.calculateTimeToDecision(change.timestamp)
    }

    this.updateDerivedMetrics()
  }

  // Track rejection
  trackRejection(changeId: string) {
    this.metrics.rejectedChanges++
    
    const change = this.changeHistory.find(c => c.changeId === changeId)
    if (change) {
      change.action = 'rejected'
      change.timeToDecision = this.calculateTimeToDecision(change.timestamp)
    }

    this.updateDerivedMetrics()
  }

  private calculateTimeToDecision(proposalTime: Date): number {
    return (Date.now() - proposalTime.getTime()) / (1000 * 60) // minutes
  }

  private updateDerivedMetrics() {
    // Calculate approval rate
    this.metrics.approvalRate = this.metrics.totalProposals > 0 
      ? (this.metrics.approvedChanges / this.metrics.totalProposals) * 100 
      : 0

    // Calculate average files per change
    const totalFiles = this.changeHistory.reduce((sum, change) => sum + change.filesCount, 0)
    this.metrics.averageFilesPerChange = this.changeHistory.length > 0 
      ? totalFiles / this.changeHistory.length 
      : 0

    // Calculate most common file types
    const fileTypeCounts: Record<string, number> = {}
    this.changeHistory.forEach(change => {
      change.fileTypes.forEach(type => {
        fileTypeCounts[type] = (fileTypeCounts[type] || 0) + 1
      })
    })

    this.metrics.mostCommonFileTypes = Object.entries(fileTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate average commit message length
    const approvedChanges = this.changeHistory.filter(c => c.action === 'approved')
    const totalMessageLength = approvedChanges.reduce((sum, change) => sum + change.commitMessageLength, 0)
    this.metrics.averageCommitMessageLength = approvedChanges.length > 0 
      ? totalMessageLength / approvedChanges.length 
      : 0

    // Calculate average time to approval
    const approvedWithTime = approvedChanges.filter(c => c.timeToDecision !== undefined)
    const totalTime = approvedWithTime.reduce((sum, change) => sum + (change.timeToDecision || 0), 0)
    this.metrics.timeToApproval = approvedWithTime.length > 0 
      ? totalTime / approvedWithTime.length 
      : 0
  }

  getMetrics(): AssistantMetrics {
    return { ...this.metrics }
  }

  getChangeHistory(): ChangeMetrics[] {
    return [...this.changeHistory]
  }

  getRecentChanges(limit: number = 10): ChangeMetrics[] {
    return this.changeHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // Export metrics for analytics
  exportMetrics() {
    return {
      metrics: this.getMetrics(),
      changeHistory: this.getChangeHistory(),
      exportedAt: new Date().toISOString()
    }
  }

  // Reset metrics (useful for testing or periodic resets)
  reset() {
    this.metrics = {
      totalProposals: 0,
      approvedChanges: 0,
      rejectedChanges: 0,
      approvalRate: 0,
      averageFilesPerChange: 0,
      mostCommonFileTypes: [],
      averageCommitMessageLength: 0,
      timeToApproval: 0
    }
    this.changeHistory = []
  }
}

// Global instance
export const metricsTracker = new MetricsTracker()
