import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId parameter' },
        { status: 400 }
      )
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get Replit integration
    const replitIntegration = await prisma.replitIntegration.findUnique({
      where: { projectId }
    })

    if (!replitIntegration) {
      return NextResponse.json({ error: 'Replit integration not found' }, { status: 404 })
    }

    // Check if URLs need to be updated
    if (replitIntegration.replUrl?.includes('@user')) {
      const updatedReplUrl = replitIntegration.replUrl.replace('@user', '@devflow')
      const updatedEmbedUrl = replitIntegration.embedUrl?.replace('@user', '@devflow') || `https://replit.com/@devflow/${replitIntegration.replId}?embed=true&lite=true`
      
      const updatedIntegration = await prisma.replitIntegration.update({
        where: { projectId },
        data: {
          replUrl: updatedReplUrl,
          embedUrl: updatedEmbedUrl,
          status: 'ready'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Replit URLs updated successfully',
        replit: updatedIntegration
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Replit URLs are already correct',
      replit: replitIntegration
    })

  } catch (error) {
    console.error('Error fixing Replit URLs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
