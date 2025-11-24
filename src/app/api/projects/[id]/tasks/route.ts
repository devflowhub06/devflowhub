import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// Helper to send webhook notifications
async function sendTaskWebhook(userId: string, task: any, action: 'created' | 'updated' | 'completed') {
  try {
    const integrations = await prisma.integration.findMany({
      where: {
        userId,
        provider: { in: ['linear', 'jira'] },
        connectionState: 'connected'
      }
    })

    for (const integration of integrations) {
      const config = integration.config as any
      if (config?.webhookEnabled && config?.webhookUrl) {
        try {
          await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: integration.provider,
              action,
              task: {
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority
              },
              timestamp: new Date().toISOString()
            })
          })
        } catch (error) {
          console.error(`Error sending webhook to ${integration.provider}:`, error)
        }
      }
    }
  } catch (error) {
    console.error('Error sending task webhooks:', error)
  }
}

// GET /api/projects/[id]/tasks
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id

    // For now, store tasks in a simple JSON structure
    // In production, you'd have a proper Task model
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { metadata: true }
    })

    const tasks = (project?.metadata as any)?.tasks || []

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/tasks
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id
    const { task } = await request.json()

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { metadata: true }
    })

    const currentTasks = (project?.metadata as any)?.tasks || []
    const updatedTasks = [task, ...currentTasks]

    await prisma.project.update({
      where: { id: projectId },
      data: {
        metadata: {
          ...(project?.metadata as any || {}),
          tasks: updatedTasks
        }
      }
    })

    // Send webhook notification if integrations are configured
    await sendTaskWebhook(session.user.id, task, 'created')

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

