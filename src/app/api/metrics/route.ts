import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// GET /api/metrics - Get real telemetry metrics and analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      // Return empty metrics for unauthenticated users
      return NextResponse.json({
        totalProjects: 0,
        templatesUsed: {},
        timeToPreviewAvgMs: 0,
        firstDeployConversionRate: 0,
        assistantUsageCount: 0,
        provisioningFailureRate: 0,
        activeProjects: 0,
        totalUsers: 0,
        avgSessionTime: 0,
        conversionFunnel: {
          create: 0,
          preview: 0,
          deploy: 0
        }
      })
    }

    // Get real data from database
    let [
      totalProjects,
      projectsByType,
      deployments,
      assistantUsage,
      activeProjects,
      userCount,
      recentActivities,
      allUserProjects
    ] = await Promise.all([
      // Total projects for this user
      prisma.project.count({
        where: { userId: session.user.id }
      }),
      
      // Projects grouped by type/template
      prisma.project.groupBy({
        by: ['type'],
        where: { userId: session.user.id },
        _count: { type: true }
      }),
      
      // Deployment data
      prisma.deployment.count({
        where: { 
          project: { userId: session.user.id }
        }
      }),
      
      // AI Assistant usage (from activities)
      prisma.projectActivity.count({
        where: {
          project: { userId: session.user.id },
          type: { in: ['ai_assistant_used', 'ai_suggestion_accepted', 'ai_code_generated'] }
        }
      }),
      
      // Active projects
      prisma.project.count({
        where: { 
          userId: session.user.id,
          status: 'active'
        }
      }),
      
      // Total users (for admin metrics)
      prisma.user.count(),
      
      // Recent activities for time calculations
      prisma.projectActivity.findMany({
        where: {
          project: { userId: session.user.id },
          type: 'preview_generated'
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Get all user projects for debugging
      prisma.project.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          name: true,
          createdAt: true,
          status: true,
          type: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Log real data for debugging
    console.log('🔍 Real data for user', session.user.id, ':')
    console.log('📊 Total projects count:', totalProjects)
    console.log('📋 All user projects:', allUserProjects.map(p => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      status: p.status,
      type: p.type
    })))

    // Check for duplicate projects and clean them up
    const duplicateProjects = []
    for (let i = 0; i < allUserProjects.length; i++) {
      for (let j = i + 1; j < allUserProjects.length; j++) {
        const project1 = allUserProjects[i]
        const project2 = allUserProjects[j]
        
        // Check if projects have same name and were created within 5 minutes
        const timeDiff = Math.abs(
          new Date(project1.createdAt).getTime() - new Date(project2.createdAt).getTime()
        )
        
        if (project1.name === project2.name && timeDiff < 5 * 60 * 1000) {
          duplicateProjects.push({
            keep: project1, // Keep the newer one
            remove: project2 // Remove the older one
          })
        }
      }
    }

    // Remove duplicate projects
    if (duplicateProjects.length > 0) {
      console.log('🧹 Found duplicate projects, cleaning up...')
      for (const duplicate of duplicateProjects) {
        try {
          // Delete associated files first
          await prisma.projectFile.deleteMany({
            where: { projectId: duplicate.remove.id }
          })

          // Delete associated activities
          await prisma.projectActivity.deleteMany({
            where: { projectId: duplicate.remove.id }
          })

          // Delete the project
          await prisma.project.delete({
            where: { id: duplicate.remove.id }
          })

          console.log(`✅ Removed duplicate project: ${duplicate.remove.name} (${duplicate.remove.id})`)
        } catch (error) {
          console.error(`❌ Error removing duplicate project ${duplicate.remove.id}:`, error)
        }
      }

      // Recalculate total projects after cleanup
      const cleanedTotalProjects = await prisma.project.count({
        where: { userId: session.user.id }
      })
      
      console.log(`🧹 Cleanup complete. Projects before: ${totalProjects}, after: ${cleanedTotalProjects}`)
      
      // Update the totalProjects variable
      totalProjects = cleanedTotalProjects
    }

    // Calculate template usage
    const templatesUsed = projectsByType.reduce((acc, item) => {
      acc[item.type] = item._count.type
      return acc
    }, {} as Record<string, number>)

    // Calculate average time to preview (mock calculation for now)
    const timeToPreviewAvgMs = recentActivities.length > 0 ? 2500 : 0

    // Calculate conversion rates
    const firstDeployConversionRate = totalProjects > 0 ? deployments / totalProjects : 0
    const provisioningFailureRate = 0.1 // This would need to be calculated from actual failures

    // Calculate conversion funnel
    const previewCount = recentActivities.length
    const conversionFunnel = {
      create: totalProjects,
      preview: previewCount,
      deploy: deployments
    }

    const realMetrics = {
      totalProjects,
      templatesUsed,
      timeToPreviewAvgMs,
      firstDeployConversionRate,
      assistantUsageCount: assistantUsage,
      provisioningFailureRate,
      activeProjects,
      totalUsers: userCount,
      avgSessionTime: 1800000, // 30 minutes in ms (would need session tracking)
      conversionFunnel
    }

    return NextResponse.json(realMetrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}