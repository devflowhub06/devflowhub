import { analytics } from '../analytics'

// Feedback types
export type FeedbackType = 
  | 'bug_report'
  | 'feature_request'
  | 'general_feedback'
  | 'usability_issue'
  | 'performance_issue'
  | 'integration_issue'

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical'

export interface FeedbackData {
  type: FeedbackType
  title: string
  description: string
  priority: FeedbackPriority
  category?: string
  userAgent?: string
  url?: string
  userId?: string
  sessionId?: string
  attachments?: File[]
  metadata?: Record<string, any>
}

// Feedback service class
export class FeedbackService {
  private static instance: FeedbackService

  private constructor() {}

  static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService()
    }
    return FeedbackService.instance
  }

  // Submit feedback
  async submitFeedback(data: FeedbackData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Add metadata
      const enrichedData = {
        ...data,
        timestamp: new Date().toISOString(),
        userAgent: data.userAgent || (typeof window !== 'undefined' ? window.navigator.userAgent : undefined),
        url: data.url || (typeof window !== 'undefined' ? window.location.href : undefined),
        sessionId: data.sessionId || this.generateSessionId(),
      }

      // Track in analytics
      analytics.trackEvent('feedback_submitted', {
        type: data.type,
        priority: data.priority,
        category: data.category,
      })

      // Send to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrichedData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      return { success: true, id: result.id }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      
      // Track error in analytics
      analytics.trackError(error as Error, {
        context: 'feedback_submission',
        feedbackData: data,
      })

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Quick feedback submission
  async submitQuickFeedback(
    type: FeedbackType, 
    message: string, 
    priority: FeedbackPriority = 'medium'
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    return this.submitFeedback({
      type,
      title: message.substring(0, 100),
      description: message,
      priority,
    })
  }

  // Bug report with automatic context
  async submitBugReport(
    title: string,
    description: string,
    steps: string[],
    expectedBehavior: string,
    actualBehavior: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const bugData: FeedbackData = {
      type: 'bug_report',
      title,
      description: `${description}\n\nSteps to reproduce:\n${steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\nExpected behavior: ${expectedBehavior}\nActual behavior: ${actualBehavior}`,
      priority: 'high',
      category: 'bug',
      metadata: {
        steps,
        expectedBehavior,
        actualBehavior,
      },
    }

    return this.submitFeedback(bugData)
  }

  // Feature request
  async submitFeatureRequest(
    title: string,
    description: string,
    useCase: string,
    impact: 'low' | 'medium' | 'high'
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const featureData: FeedbackData = {
      type: 'feature_request',
      title,
      description: `${description}\n\nUse case: ${useCase}\nImpact: ${impact}`,
      priority: impact === 'high' ? 'high' : 'medium',
      category: 'feature',
      metadata: {
        useCase,
        impact,
      },
    }

    return this.submitFeedback(featureData)
  }

  // Generate session ID
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Get user context for feedback
  getUserContext(): Record<string, any> {
    if (typeof window === 'undefined') return {}

    return {
      url: window.location.href,
      userAgent: window.navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: window.navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
    }
  }
}

// Export singleton instance
export const feedback = FeedbackService.getInstance()

// React hook for feedback
export const useFeedback = () => {
  return {
    submitFeedback: feedback.submitFeedback.bind(feedback),
    submitQuickFeedback: feedback.submitQuickFeedback.bind(feedback),
    submitBugReport: feedback.submitBugReport.bind(feedback),
    submitFeatureRequest: feedback.submitFeatureRequest.bind(feedback),
    getUserContext: feedback.getUserContext.bind(feedback),
  }
} 