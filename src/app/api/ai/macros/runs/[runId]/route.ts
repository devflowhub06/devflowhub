import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// GET /api/ai/macros/runs/[runId] - Get macro run status
export async function GET(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const run = await prisma.aIMacroRun.findFirst({
      where: {
        id: params.runId,
        userId: session.user.id,
      },
      include: {
        macro: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    return NextResponse.json({ run })
  } catch (error) {
    console.error('Error fetching macro run:', error)
    return NextResponse.json(
      { error: 'Failed to fetch macro run' },
      { status: 500 }
    )
  }
}

