import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const where: any = {
      userId: session.user.id
    }

    if (projectId) {
      where.projectId = projectId
    }

    const jobs = await prisma.uIGenerationJob.findMany({
      where,
      select: {
        id: true,
        prompt: true,
        status: true,
        result: true,
        error: true,
        estimatedCost: true,
        actualCost: true,
        tokensUsed: true,
        processingTime: true,
        createdAt: true,
        project: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Format jobs for frontend
    const formattedJobs = jobs.map(job => ({
      jobId: job.id,
      prompt: job.prompt,
      status: job.status,
      result: job.result,
      error: job.error,
      estimatedCost: job.estimatedCost,
      actualCost: job.actualCost,
      tokensUsed: job.tokensUsed,
      processingTime: job.processingTime,
      createdAt: job.createdAt.toISOString(),
      projectName: job.project.name
    }))

    return NextResponse.json({ jobs: formattedJobs })

  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json(
      { error: 'Failed to load jobs', details: (error as Error).message },
      { status: 500 }
    )
  }
}
