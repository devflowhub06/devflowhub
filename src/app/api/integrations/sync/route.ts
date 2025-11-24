import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import IntegrationManager from '@/lib/services/integration-manager'

const integrationManager = new IntegrationManager()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sourceTool, targetTool, sourceProjectId, targetProjectId } = await request.json()

    if (!sourceTool || !targetTool || !sourceProjectId || !targetProjectId) {
      return NextResponse.json(
        { error: 'All parameters are required: sourceTool, targetTool, sourceProjectId, targetProjectId' },
        { status: 400 }
      )
    }

    // Validate supported tools
    const supportedTools = ['cursor', 'replit']
    if (!supportedTools.includes(sourceTool) || !supportedTools.includes(targetTool)) {
      return NextResponse.json(
        { error: 'Only cursor and replit are currently supported for syncing' },
        { status: 400 }
      )
    }

    // Start sync process
    const syncResult = await integrationManager.syncContextBetweenTools(
      sourceTool as 'cursor' | 'replit',
      targetTool as 'cursor' | 'replit',
      sourceProjectId,
      targetProjectId
    )

    if (syncResult.status === 'completed') {
      return NextResponse.json({
        success: true,
        message: `Successfully synced from ${sourceTool} to ${targetTool}`,
        sync: syncResult,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        { 
          error: `Sync failed: ${syncResult.error}`,
          sync: syncResult,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Project sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync project' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Get sync status for a specific project
    // This would typically query a database for sync history
    // For now, return a mock response
    return NextResponse.json({
      projectId,
      lastSync: new Date().toISOString(),
      syncHistory: [],
      status: 'ready',
    })
  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
} 