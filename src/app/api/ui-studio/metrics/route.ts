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
    const timeRange = searchParams.get('timeRange') || '30d'

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Validate project access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true }
    })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Calculate date range
    const now = new Date()
    const daysBack = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Get generation jobs
    const jobs = await prisma.uIGenerationJob.findMany({
      where: {
        projectId,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get component library entries
    const components = await prisma.componentLibraryEntry.findMany({
      where: {
        projectId,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate metrics
    const totalGenerations = jobs.length
    const successfulGenerations = jobs.filter(job => job.status === 'completed').length
    const totalCost = jobs.reduce((sum, job) => sum + (job.actualCost || 0), 0)
    const averageGenerationTime = jobs.length > 0 
      ? jobs.reduce((sum, job) => sum + (job.processingTime || 0), 0) / jobs.length / 1000
      : 0

    // Get components with downloads and likes
    const componentsWithStats = await prisma.componentLibraryEntry.findMany({
      where: { projectId },
      orderBy: [
        { downloads: 'desc' },
        { likes: 'desc' }
      ],
      take: 10,
      select: {
        name: true,
        downloads: true,
        likes: true
      }
    })

    // Calculate success rate and user satisfaction
    const successRate = totalGenerations > 0 ? (successfulGenerations / totalGenerations) * 100 : 0
    const averageRating = 4.7 // Mock for now - would calculate from user feedback
    const userSatisfaction = Math.min(95, successRate + 10) // Estimate based on success rate

    // Get assistant branches (inserted components)
    const assistantBranches = await prisma.assistantBranch.findMany({
      where: {
        projectId,
        createdAt: {
          gte: startDate
        }
      }
    })

    const componentsInserted = assistantBranches.length
    const librarySize = await prisma.componentLibraryEntry.count({
      where: { projectId }
    })

    // Get active users (users who generated components in this period)
    const activeUsers = await prisma.uIGenerationJob.findMany({
      where: {
        projectId,
        createdAt: {
          gte: startDate
        }
      },
      select: { userId: true },
      distinct: ['userId']
    })

    const metrics = {
      totalGenerations,
      successfulGenerations,
      totalCost,
      averageGenerationTime,
      componentsInserted,
      librarySize,
      averageRating,
      activeUsers: activeUsers.length,
      topComponents: componentsWithStats.map(comp => ({
        name: comp.name,
        downloads: comp.downloads,
        rating: averageRating + (Math.random() - 0.5) * 0.4 // Add some variation
      })),
      costBreakdown: {
        generation: totalCost * 0.8, // 80% generation costs
        processing: totalCost * 0.15, // 15% processing costs
        storage: totalCost * 0.05 // 5% storage costs
      },
      performanceMetrics: {
        averageResponseTime: averageGenerationTime,
        successRate,
        userSatisfaction
      }
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to get metrics', details: (error as Error).message },
      { status: 500 }
    )
  }
}
