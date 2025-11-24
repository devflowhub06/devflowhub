import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all projects for the user
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        type: true,
        selectedTool: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Also get all projects in the database (for debugging)
    const allProjects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        userId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      userProjects: projects,
      allProjects: allProjects,
      userInfo: {
        userId: session.user.id,
        userEmail: session.user.email,
      },
      totalUserProjects: projects.length,
      totalAllProjects: allProjects.length,
    })
  } catch (error) {
    console.error('Debug projects error:', error)
    return NextResponse.json({ error: 'Failed to fetch debug data' }, { status: 500 })
  }
}
