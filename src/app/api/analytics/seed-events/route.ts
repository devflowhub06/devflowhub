import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get all projects for the user
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    })

    console.log(`Creating analytics events for ${projects.length} projects`)

    // Create analytics events for each project
    for (const project of projects) {
      // Project created event
      await prisma.analyticsEvent.create({
        data: {
          projectId: project.id,
          userId: userId,
          eventName: 'project_created',
          payload: {
            projectName: project.name,
            projectType: project.type,
            template: project.template || 'blank'
          },
          createdAt: project.createdAt
        }
      })

      // Add some tool usage events based on project status
      if (project.status === 'scaffolded' || project.status === 'provisioning') {
        // Editor opened event
        await prisma.analyticsEvent.create({
          data: {
            projectId: project.id,
            userId: userId,
            eventName: 'editor_opened',
            payload: {
              projectName: project.name,
              tool: 'editor'
            },
            createdAt: new Date(project.createdAt.getTime() + 1000 * 60 * 5) // 5 minutes after creation
          }
        })

        // Tool switched to sandbox
        await prisma.analyticsEvent.create({
          data: {
            projectId: project.id,
            userId: userId,
            eventName: 'tool_switched',
            payload: {
              fromTool: 'editor',
              toTool: 'sandbox',
              projectName: project.name
            },
            createdAt: new Date(project.createdAt.getTime() + 1000 * 60 * 10) // 10 minutes after creation
          }
        })

        // Sandbox opened
        await prisma.analyticsEvent.create({
          data: {
            projectId: project.id,
            userId: userId,
            eventName: 'sandbox_opened',
            payload: {
              projectName: project.name,
              tool: 'sandbox'
            },
            createdAt: new Date(project.createdAt.getTime() + 1000 * 60 * 15) // 15 minutes after creation
          }
        })

        // AI Assistant usage (randomly for some projects)
        if (Math.random() > 0.5) {
          await prisma.analyticsEvent.create({
            data: {
              projectId: project.id,
              userId: userId,
              eventName: 'ai_assistant_requested',
              payload: {
                projectName: project.name,
                requestType: 'code_generation',
                tokensUsed: Math.floor(Math.random() * 1000) + 500
              },
              createdAt: new Date(project.createdAt.getTime() + 1000 * 60 * 20) // 20 minutes after creation
            }
          })

          await prisma.analyticsEvent.create({
            data: {
              projectId: project.id,
              userId: userId,
              eventName: 'ai_suggestion_accepted',
              payload: {
                projectName: project.name,
                suggestionType: 'code_improvement'
              },
              createdAt: new Date(project.createdAt.getTime() + 1000 * 60 * 25) // 25 minutes after creation
            }
          })
        }

        // UI Studio usage for some projects
        if (project.type === 'ui-design' || Math.random() > 0.7) {
          await prisma.analyticsEvent.create({
            data: {
              projectId: project.id,
              userId: userId,
              eventName: 'ui_studio_opened',
              payload: {
                projectName: project.name,
                tool: 'ui_studio'
              },
              createdAt: new Date(project.createdAt.getTime() + 1000 * 60 * 30) // 30 minutes after creation
            }
          })
        }

        // Deploy events for some projects
        if (Math.random() > 0.6) {
          await prisma.analyticsEvent.create({
            data: {
              projectId: project.id,
              userId: userId,
              eventName: 'deploy_started',
              payload: {
                projectName: project.name,
                deployType: 'preview'
              },
              createdAt: new Date(project.createdAt.getTime() + 1000 * 60 * 45) // 45 minutes after creation
            }
          })

          // 90% success rate for deploys
          if (Math.random() > 0.1) {
            await prisma.analyticsEvent.create({
              data: {
                projectId: project.id,
                userId: userId,
                eventName: 'deploy_completed',
                payload: {
                  projectName: project.name,
                  deployType: 'preview',
                  success: true
                },
                createdAt: new Date(project.createdAt.getTime() + 1000 * 60 * 50) // 50 minutes after creation
              }
            })
          } else {
            await prisma.analyticsEvent.create({
              data: {
                projectId: project.id,
                userId: userId,
                eventName: 'deploy_failed',
                payload: {
                  projectName: project.name,
                  deployType: 'preview',
                  error: 'Build timeout'
                },
                createdAt: new Date(project.createdAt.getTime() + 1000 * 60 * 50) // 50 minutes after creation
              }
            })
          }
        }
      }
    }

    // Create some session events
    const sessionStartTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    await prisma.analyticsEvent.create({
      data: {
        projectId: projects[0]?.id || '',
        userId: userId,
        eventName: 'session_started',
        payload: {
          sessionId: 'session_' + Date.now(),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        createdAt: sessionStartTime
      }
    })

    await prisma.analyticsEvent.create({
      data: {
        projectId: projects[0]?.id || '',
        userId: userId,
        eventName: 'session_ended',
        payload: {
          sessionId: 'session_' + Date.now(),
          duration: 45 // 45 minutes
        },
        createdAt: new Date(sessionStartTime.getTime() + 45 * 60 * 1000)
      }
    })

    const eventsCreated = await prisma.analyticsEvent.count({
      where: { userId }
    })

    return NextResponse.json({
      success: true,
      message: `Created analytics events for ${projects.length} projects`,
      totalEvents: eventsCreated
    })
  } catch (error) {
    console.error('Error seeding analytics events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
