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

// PATCH /api/projects/[id]/tasks/[taskId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id
    const taskId = params.taskId
    const { completed } = await request.json()

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { metadata: true }
    })

    const tasks = (project?.metadata as any)?.tasks || []
    const updatedTask = tasks.find((task: any) => task.id === taskId)
    const updatedTasks = tasks.map((task: any) =>
      task.id === taskId ? { ...task, completed } : task
    )

    await prisma.project.update({
      where: { id: projectId },
      data: {
        metadata: {
          ...(project?.metadata as any || {}),
          tasks: updatedTasks
        }
      }
    })

    // Send webhook notification if task was completed
    if (updatedTask && completed) {
      await sendTaskWebhook(session.user.id, { ...updatedTask, completed }, 'completed')
    } else if (updatedTask) {
      await sendTaskWebhook(session.user.id, { ...updatedTask, completed }, 'updated')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]/tasks/[taskId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id
    const taskId = params.taskId

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { metadata: true }
    })

    const tasks = (project?.metadata as any)?.tasks || []
    const updatedTasks = tasks.filter((task: any) => task.id !== taskId)

    await prisma.project.update({
      where: { id: projectId },
      data: {
        metadata: {
          ...(project?.metadata as any || {}),
          tasks: updatedTasks
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}

