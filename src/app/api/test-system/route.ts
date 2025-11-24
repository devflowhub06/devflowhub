import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/test-system - Test all system components
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const testResults = {
      timestamp: new Date().toISOString(),
      userId: session.user.id,
      tests: {
        database: { status: 'pending', details: null },
        templates: { status: 'pending', details: null },
        aiAssistant: { status: 'pending', details: null },
        projectCreation: { status: 'pending', details: null },
        provisioning: { status: 'pending', details: null }
      },
      overall: 'pending'
    }

    // Test 1: Database connection
    try {
      await prisma.$connect()
      const userProjects = await prisma.project.count({
        where: { userId: session.user.id }
      })
      testResults.tests.database = {
        status: 'passed',
        details: { connected: true, userProjects }
      }
    } catch (error) {
      testResults.tests.database = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    // Test 2: Templates API
    try {
      const templatesResponse = await fetch(`${request.nextUrl.origin}/api/templates`)
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json()
        testResults.tests.templates = {
          status: 'passed',
          details: { 
            available: true, 
            count: templatesData.templates?.length || 0 
          }
        }
      } else {
        testResults.tests.templates = {
          status: 'failed',
          details: { error: 'Templates API not responding' }
        }
      }
    } catch (error) {
      testResults.tests.templates = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    // Test 3: AI Assistant
    try {
      const aiResponse = await fetch(`${request.nextUrl.origin}/api/editor/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'explain',
          code: 'console.log("Hello World")',
          language: 'javascript',
          message: 'Test message'
        })
      })
      
      if (aiResponse.ok) {
        testResults.tests.aiAssistant = {
          status: 'passed',
          details: { 
            working: true, 
            statusCode: aiResponse.status 
          }
        }
      } else {
        const errorData = await aiResponse.json()
        testResults.tests.aiAssistant = {
          status: 'failed',
          details: { 
            error: errorData.error || 'AI Assistant not working',
            statusCode: aiResponse.status 
          }
        }
      }
    } catch (error) {
      testResults.tests.aiAssistant = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    // Test 4: Project Creation API
    try {
      const projectResponse = await fetch(`${request.nextUrl.origin}/api/projects/enhanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Project',
          language: 'JavaScript',
          framework: 'React',
          templateId: null,
          connectGit: false,
          enableSandbox: true
        })
      })
      
      if (projectResponse.ok) {
        const projectData = await projectResponse.json()
        testResults.tests.projectCreation = {
          status: 'passed',
          details: { 
            working: true, 
            projectId: projectData.project?.id,
            jobId: projectData.jobId 
          }
        }
        
        // Clean up test project
        if (projectData.project?.id) {
          try {
            await prisma.project.delete({
              where: { id: projectData.project.id }
            })
          } catch (cleanupError) {
            console.log('Failed to cleanup test project:', cleanupError)
          }
        }
      } else {
        const errorData = await projectResponse.json()
        testResults.tests.projectCreation = {
          status: 'failed',
          details: { 
            error: errorData.error || 'Project creation failed',
            statusCode: projectResponse.status 
          }
        }
      }
    } catch (error) {
      testResults.tests.projectCreation = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    // Test 5: Metrics API
    try {
      const metricsResponse = await fetch(`${request.nextUrl.origin}/api/metrics`)
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        testResults.tests.provisioning = {
          status: 'passed',
          details: { 
            working: true, 
            hasMetrics: !!metricsData.metrics 
          }
        }
      } else {
        testResults.tests.provisioning = {
          status: 'failed',
          details: { error: 'Metrics API not responding' }
        }
      }
    } catch (error) {
      testResults.tests.provisioning = {
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    // Calculate overall status
    const failedTests = Object.values(testResults.tests).filter(test => test.status === 'failed')
    testResults.overall = failedTests.length === 0 ? 'passed' : 'failed'

    return NextResponse.json(testResults)
  } catch (error) {
    console.error('Error in system test:', error)
    return NextResponse.json(
      { error: 'System test failed' },
      { status: 500 }
    )
  }
}
