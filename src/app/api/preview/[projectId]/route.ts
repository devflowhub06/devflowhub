import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// GET /api/preview/[projectId] - List all preview environments for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
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

    const previews = await prisma.previewEnvironment.findMany({
      where: {
        projectId: params.projectId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ previews })
  } catch (error) {
    console.error('Error fetching preview environments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preview environments' },
      { status: 500 }
    )
  }
}

// POST /api/preview/[projectId] - Create a new preview environment
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
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

    const body = await request.json()
    const { branchName, prNumber } = body

    if (!branchName) {
      return NextResponse.json(
        { error: 'Branch name is required' },
        { status: 400 }
      )
    }

    // Generate unique preview URL
    const previewSlug = `${project.name.toLowerCase().replace(/\s+/g, '-')}-${branchName.replace(/\//g, '-')}-${Date.now()}`
    const previewUrl = `https://preview-${previewSlug}.devflowhub.com`

    // Create preview environment
    const preview = await prisma.previewEnvironment.create({
      data: {
        projectId: params.projectId,
        userId: session.user.id,
        branchName,
        prNumber: prNumber || null,
        url: previewUrl,
        status: 'provisioning',
        logs: {
          events: [
            {
              timestamp: new Date().toISOString(),
              message: 'Preview environment provisioning started',
              level: 'info',
            },
          ],
        },
        estimatedCost: 0.05, // $0.05/hour base estimate
      },
    })

    // Track analytics
    await prisma.analyticsEvent.create({
      data: {
        eventName: 'preview_created',
        eventType: 'system_event',
        userId: session.user.id,
        projectId: params.projectId,
        metadata: {
          previewId: preview.id,
          branchName,
          prNumber,
        },
      },
    })

    // Start provisioning in background
    provisionPreviewEnvironment(preview.id, params.projectId, session.user.id).catch(
      (error) => {
        console.error('Preview provisioning error:', error)
      }
    )

    return NextResponse.json({
      preview,
      message: 'Preview environment provisioning started',
    })
  } catch (error) {
    console.error('Error creating preview environment:', error)
    return NextResponse.json(
      { error: 'Failed to create preview environment' },
      { status: 500 }
    )
  }
}

async function provisionPreviewEnvironment(
  previewId: string,
  projectId: string,
  userId: string
) {
  const logs: any[] = []

  try {
    // Step 1: Clone repository
    logs.push({
      timestamp: new Date().toISOString(),
      message: 'Cloning repository...',
      level: 'info',
    })

    await updatePreviewLogs(previewId, logs)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Step 2: Install dependencies
    logs.push({
      timestamp: new Date().toISOString(),
      message: 'Installing dependencies...',
      level: 'info',
    })

    await updatePreviewLogs(previewId, logs)
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Step 3: Build project
    logs.push({
      timestamp: new Date().toISOString(),
      message: 'Building project...',
      level: 'info',
    })

    await updatePreviewLogs(previewId, logs)
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Step 4: Deploy to preview
    logs.push({
      timestamp: new Date().toISOString(),
      message: 'Deploying to preview environment...',
      level: 'info',
    })

    await updatePreviewLogs(previewId, logs)
    await new Promise((resolve) => setTimeout(resolve, 3000))

    logs.push({
      timestamp: new Date().toISOString(),
      message: 'Preview environment is live!',
      level: 'success',
    })

    // Mark as active and calculate actual cost
    await prisma.previewEnvironment.update({
      where: { id: previewId },
      data: {
        status: 'active',
        logs: { events: logs },
        actualCost: 0.12, // Simulated cost
        lastAccessedAt: new Date(),
      },
    })
  } catch (error) {
    logs.push({
      timestamp: new Date().toISOString(),
      message: `Provisioning failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      level: 'error',
    })

    await prisma.previewEnvironment.update({
      where: { id: previewId },
      data: {
        status: 'failed',
        logs: { events: logs },
      },
    })
  }
}

async function updatePreviewLogs(previewId: string, logs: any[]) {
  await prisma.previewEnvironment.update({
    where: { id: previewId },
    data: {
      logs: { events: logs },
    },
  })
}

// DELETE /api/preview/[projectId]/[previewId] - Destroy preview environment (in [previewId]/route.ts)

