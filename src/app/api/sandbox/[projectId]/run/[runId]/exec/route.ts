import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { K8sRuntimeAdapter } from '@/lib/runtime/k8sAdapter'

const runtimeAdapter = new K8sRuntimeAdapter()

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; runId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, runId } = params
    const { cmd } = await request.json()

    if (!cmd || typeof cmd !== 'string') {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 })
    }

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

    // Check if run is active
    if (run.status !== 'running') {
      return NextResponse.json({ error: 'Run is not active' }, { status: 400 })
    }

    // Execute command via runtime adapter
    const result = await runtimeAdapter.execCommand(runId, cmd)

    return NextResponse.json({
      execId: result.execId,
      status: result.status,
      output: result.output,
      exitCode: result.exitCode
    })

  } catch (error) {
    console.error('Command execution error:', error)
    return NextResponse.json(
      { error: 'Failed to execute command' },
      { status: 500 }
    )
  }
}
