'use client'

import { useState, useEffect } from 'react'

export interface LandingData {
  success: boolean
  data: {
    id: string
    name: string
    description: string
    workspace: {
      editor: WorkspaceData
      sandbox: WorkspaceData
      uiStudio: WorkspaceData
      deployer: WorkspaceData
      aiAssistant: WorkspaceData
    }
    codeSnippet: {
      language: string
      content: string
      highlights: Array<{
        line: number
        type: string
        text: string
      }>
    }
    metrics: {
      totalProjects: string
      activeDevelopers: string
      avgBuildTime: string
      uptime: string
      customerSatisfaction: string
    }
    socialProof: {
      testimonials: Array<{
        quote: string
        author: string
        role: string
        avatar: string
      }>
      logos: Array<{
        name: string
        logo: string
      }>
    }
  }
  timestamp: string
  version: string
}

export interface WorkspaceData {
  name: string
  description: string
  features: string[]
  icon: string
  color: string
  metrics: {
    [key: string]: string
  }
}

export function useLandingData() {
  const [data, setData] = useState<LandingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/public/landing/summary', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch landing data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

// Helper function to get workspace data by key
export function getWorkspaceData(data: LandingData | null, workspaceKey: keyof LandingData['data']['workspace']): WorkspaceData | null {
  if (!data) return null
  return data.data.workspace[workspaceKey] || null
}

// Helper function to get all workspaces as array
export function getAllWorkspaces(data: LandingData | null): WorkspaceData[] {
  if (!data) return []
  
  const workspaces = data.data.workspace
  return [
    workspaces.editor,
    workspaces.sandbox,
    workspaces.uiStudio,
    workspaces.deployer,
    workspaces.aiAssistant
  ]
}
