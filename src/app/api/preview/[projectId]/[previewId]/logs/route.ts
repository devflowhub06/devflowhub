import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// GET /api/preview/[projectId]/[previewId]/logs - Get preview environment logs
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; previewId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project access
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get preview environment with logs
    const preview = await prisma.previewEnvironment.findFirst({
      where: {
        id: params.previewId,
        projectId: params.projectId,
      },
    })

    if (!preview) {
      return NextResponse.json(
        { error: 'Preview environment not found' },
        { status: 404 }
      )
    }

    // Calculate uptime
    const uptime = preview.destroyedAt
      ? new Date(preview.destroyedAt).getTime() - new Date(preview.createdAt).getTime()
      : Date.now() - new Date(preview.createdAt).getTime()

    const uptimeHours = uptime / (1000 * 60 * 60)

    // Calculate cost based on uptime
    const hourlyCost = 0.05 // $0.05/hour
    const calculatedCost = uptimeHours * hourlyCost

    return NextResponse.json({
      logs: preview.logs || { events: [] },
      metadata: {
        status: preview.status,
        branchName: preview.branchName,
        url: preview.url,
        createdAt: preview.createdAt,
        destroyedAt: preview.destroyedAt,
        lastAccessedAt: preview.lastAccessedAt,
        uptime: {
          milliseconds: uptime,
          hours: uptimeHours,
          formatted: formatUptime(uptime),
        },
        cost: {
          estimated: preview.estimatedCost,
          actual: preview.actualCost || calculatedCost,
          hourlyRate: hourlyCost,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching preview logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preview logs' },
      { status: 500 }
    )
  }
}

function formatUptime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

