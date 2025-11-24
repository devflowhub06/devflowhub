import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const componentId = params.id

    // Check if component exists
    const component = await prisma.componentLibraryEntry.findUnique({
      where: { id: componentId }
    })

    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 })
    }

    // Increment likes
    const updatedComponent = await prisma.componentLibraryEntry.update({
      where: { id: componentId },
      data: {
        likes: {
          increment: 1
        }
      },
      select: {
        id: true,
        likes: true
      }
    })

    return NextResponse.json({ 
      message: 'Component liked successfully',
      likes: updatedComponent.likes
    })

  } catch (error) {
    console.error('Like component API error:', error)
    return NextResponse.json(
      { error: 'Failed to like component', details: (error as Error).message },
      { status: 500 }
    )
  }
}
