import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// GET /api/ai/macros/[id] - Get macro details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const macro = await prisma.aIMacro.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        runs: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!macro) {
      return NextResponse.json({ error: 'Macro not found' }, { status: 404 })
    }

    return NextResponse.json({ macro })
  } catch (error) {
    console.error('Error fetching macro:', error)
    return NextResponse.json(
      { error: 'Failed to fetch macro' },
      { status: 500 }
    )
  }
}

// PATCH /api/ai/macros/[id] - Update macro
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, steps, gitTrigger } = body

    const macro = await prisma.aIMacro.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!macro) {
      return NextResponse.json({ error: 'Macro not found' }, { status: 404 })
    }

    const updated = await prisma.aIMacro.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(steps && { steps }),
        ...(gitTrigger !== undefined && { gitTrigger }),
      },
    })

    return NextResponse.json({ macro: updated })
  } catch (error) {
    console.error('Error updating macro:', error)
    return NextResponse.json(
      { error: 'Failed to update macro' },
      { status: 500 }
    )
  }
}

// DELETE /api/ai/macros/[id] - Delete macro
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const macro = await prisma.aIMacro.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!macro) {
      return NextResponse.json({ error: 'Macro not found' }, { status: 404 })
    }

    await prisma.aIMacro.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting macro:', error)
    return NextResponse.json(
      { error: 'Failed to delete macro' },
      { status: 500 }
    )
  }
}

