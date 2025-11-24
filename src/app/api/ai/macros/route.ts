import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// GET /api/ai/macros - List all macros for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const where: any = {
      userId: session.user.id,
    }

    if (projectId) {
      where.projectId = projectId
    }

    const macros = await prisma.aIMacro.findMany({
      where,
      include: {
        runs: {
          orderBy: { startedAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { runs: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ macros })
  } catch (error) {
    console.error('Error fetching macros:', error)
    return NextResponse.json(
      { error: 'Failed to fetch macros' },
      { status: 500 }
    )
  }
}

// POST /api/ai/macros - Create a new macro
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, projectId, steps, gitTrigger } = body

    if (!name || !steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { error: 'Name and steps are required' },
        { status: 400 }
      )
    }

    const macro = await prisma.aIMacro.create({
      data: {
        name,
        description: description || '',
        userId: session.user.id,
        projectId: projectId || null,
        steps,
        gitTrigger: gitTrigger || null,
      },
    })

    // Track macro creation
    await prisma.analyticsEvent.create({
      data: {
        eventName: 'ai_macro_created',
        eventType: 'ai_event',
        userId: session.user.id,
        projectId: projectId || null,
        metadata: {
          macroId: macro.id,
          stepCount: steps.length,
        },
      },
    })

    return NextResponse.json({ macro })
  } catch (error) {
    console.error('Error creating macro:', error)
    return NextResponse.json(
      { error: 'Failed to create macro' },
      { status: 500 }
    )
  }
}

