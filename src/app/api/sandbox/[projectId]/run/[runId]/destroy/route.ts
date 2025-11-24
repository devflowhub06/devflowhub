import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { K8sRuntimeAdapter } from '@/lib/runtime/k8sAdapter'

const runtimeAdapter = new K8sRuntimeAdapter()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; runId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, runId } = params

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

    // Destroy runtime via adapter
    const destroyed = await runtimeAdapter.destroyRun(runId)

    if (destroyed) {
      // Update database
      await prisma.run.update({
        where: { id: runId },
        data: { 
          status: 'destroyed',
          endsAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Runtime destroyed successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to destroy runtime' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Runtime destruction error:', error)
    return NextResponse.json(
      { error: 'Failed to destroy runtime' },
      { status: 500 }
    )
  }
}
