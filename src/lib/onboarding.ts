export interface OnboardingProgress {
  id: string
  userId: string
  createdFirstProject: boolean
  connectedIntegration: boolean
  ranInSandbox: boolean
  deployedToStaging: boolean
  usedAssistant: boolean
  createdAt: string
  updatedAt: string
}

export async function fetchOnboardingProgress(): Promise<OnboardingProgress | null> {
  try {
    const response = await fetch('/api/onboarding')
    if (!response.ok) {
      throw new Error('Failed to fetch onboarding progress')
    }
    const data = await response.json()
    return data.progress
  } catch (error) {
    console.error('Error fetching onboarding progress:', error)
    return null
  }
}

export async function markOnboardingStep(step: string): Promise<boolean> {
  try {
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step })
    })
    return response.ok
  } catch (error) {
    console.error('Error marking onboarding step:', error)
    return false
  }
}

export function getOnboardingProgress(progress: OnboardingProgress | null) {
  if (!progress) return { completed: 0, total: 5, percentage: 0 }
  
  const completed = [
    progress.createdFirstProject,
    progress.connectedIntegration,
    progress.ranInSandbox,
    progress.deployedToStaging,
    progress.usedAssistant
  ].filter(Boolean).length
  
  return {
    completed,
    total: 5,
    percentage: (completed / 5) * 100
  }
}
