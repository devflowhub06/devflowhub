import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { K8sRuntimeAdapter } from '@/lib/runtime/k8sAdapter'

const runtimeAdapter = new K8sRuntimeAdapter()

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; runId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, runId } = params
    const { searchParams } = new URL(request.url)
    const tail = parseInt(searchParams.get('tail') || '100')

    // Get run from database
    const run = await prisma.run.findUnique({
      where: { id: runId },
      include: {
        project: {
          select: { userId: true }
        }
      }
    })

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    // Check permissions
    if (run.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // For now, return mock logs
    // In production, this would stream logs from the runtime adapter
    const mockLogs = [
      {
        timestamp: new Date(Date.now() - 300000),
        level: 'info',
        source: 'build',
        message: `[${runId}] Starting build process...`
      },
      {
        timestamp: new Date(Date.now() - 240000),
        level: 'info',
        source: 'build',
        message: `[${runId}] Installing dependencies...`
      },
      {
        timestamp: new Date(Date.now() - 180000),
        level: 'info',
        source: 'build',
        message: `[${runId}] Build completed successfully`
      },
      {
        timestamp: new Date(Date.now() - 120000),
        level: 'info',
        source: 'runtime',
        message: `[${runId}] Starting application server...`
      },
      {
        timestamp: new Date(Date.now() - 60000),
        level: 'info',
        source: 'runtime',
        message: `[${runId}] Server running on port 3000`
      },
      {
        timestamp: new Date(),
        level: 'info',
        source: 'system',
        message: `[${runId}] Runtime ready - preview available`
      }
    ].slice(-tail)

    return NextResponse.json({ 
      logs: mockLogs,
      hasMore: false,
      totalCount: mockLogs.length
    })

  } catch (error) {
    console.error('Logs fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
