import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = params

    const job = await prisma.uIGenerationJob.findUnique({
      where: { id: jobId },
      include: {
        project: {
          select: { name: true, userId: true }
        }
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check access permissions
    if (job.userId !== session.user.id && job.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      result: job.result,
      error: job.error,
      estimatedCost: job.estimatedCost,
      actualCost: job.actualCost,
      tokensUsed: job.tokensUsed,
      processingTime: job.processingTime,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    })

  } catch (error) {
    console.error('Job status error:', error)
    return NextResponse.json(
      { error: 'Failed to get job status', details: (error as Error).message },
      { status: 500 }
    )
  }
}
