import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { trackProjectCreation, trackTemplateUsage, trackProvisioningError } from '@/lib/telemetry'

// Enhanced project creation with provisioning orchestration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      templateId,
      language,
      framework,
      connectGit = false,
      gitProvider = 'github',
      gitRepoSettings = {},
      enableSandbox = true,
      addSampleComponents = false,
      parameters = {}
    } = body

    if (!name || !language) {
      return NextResponse.json(
        { error: 'Name and language are required' },
        { status: 400 }
      )
    }

    // Generate unique project ID and job ID
    const projectId = uuidv4()
    const jobId = uuidv4()

    // Create project record
    const project = await prisma.project.create({
      data: {
        id: projectId,
        name,
        description: description || '',
        type: 'web-app',
        selectedTool: 'SANDBOX',
        language,
        complexity: 'Medium',
        userId: session.user.id,
        status: 'provisioning',
        activeTool: 'SANDBOX',
        context: {
          files: [],
          requirements: [],
          codeSnippets: [],
          designDecisions: [],
          provisioning: {
            jobId,
            status: 'started',
            steps: [],
            templateId,
            parameters,
            connectGit,
            gitProvider,
            gitRepoSettings,
            enableSandbox,
            addSampleComponents
          }
        }
      }
    })

    // Enqueue provisioning job
    await enqueueProvisioningJob(jobId, projectId, {
      templateId,
      parameters,
      connectGit,
      gitProvider,
      gitRepoSettings,
      enableSandbox,
      addSampleComponents,
      userId: session.user.id
    })

    // Update onboarding progress
    await prisma.onboardingProgress.upsert({
      where: { userId: session.user.id },
      update: { createdFirstProject: true },
      create: { 
        userId: session.user.id,
        createdFirstProject: true 
      }
    })

    // Track telemetry
    trackProjectCreation(projectId, session.user.id, templateId)
    if (templateId) {
      trackTemplateUsage(templateId, session.user.id)
    }

    return NextResponse.json({
      project,
      jobId,
      provisioningUrl: `/api/projects/${projectId}/provision/${jobId}/status`
    })
  } catch (error) {
    console.error('Error creating enhanced project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

// Helper function to enqueue provisioning job
async function enqueueProvisioningJob(
  jobId: string,
  projectId: string,
  options: any
) {
  // TODO: Implement actual job queue (BullMQ + Redis)
  // For now, we'll simulate with a setTimeout
  console.log(`Enqueueing provisioning job ${jobId} for project ${projectId}`)
  
  // Simulate async job processing
  setTimeout(async () => {
    try {
      await processProvisioningJob(jobId, projectId, options)
    } catch (error) {
      console.error(`Provisioning job ${jobId} failed:`, error)
      await updateProvisioningStatus(projectId, jobId, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Track provisioning failure
      trackProvisioningError(projectId, options.userId, 'provisioning', error instanceof Error ? error.message : 'Unknown error')
    }
  }, 1000)
}

// Process provisioning job steps
async function processProvisioningJob(
  jobId: string,
  projectId: string,
  options: any
) {
  const steps = [
    'seed_files',
    'create_git_repo',
    'provision_sandbox',
    'index_project',
    'run_initial_build'
  ]

  for (const step of steps) {
    await updateProvisioningStatus(projectId, jobId, 'running', {
      currentStep: step,
      completedSteps: steps.slice(0, steps.indexOf(step))
    })

    await processProvisioningStep(step, projectId, options)
    
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate work
  }

  // Mark as completed
  await updateProvisioningStatus(projectId, jobId, 'completed', {
    completedSteps: steps,
    previewUrl: `https://preview-${projectId}.devflowhub.com`
  })

  // Update project status
  await prisma.project.update({
    where: { id: projectId },
    data: { status: 'active' }
  })
}

// Process individual provisioning step
async function processProvisioningStep(step: string, projectId: string, options: any) {
  try {
    switch (step) {
      case 'seed_files':
        if (options.templateId) {
          console.log(`Seeding files from template ${options.templateId}`)
          // Call template instantiation API
          const templateResponse = await fetch(`http://localhost:3000/api/templates/${options.templateId}/instantiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectName: options.parameters?.projectName || 'New Project',
              projectDescription: options.parameters?.projectDescription || '',
              parameters: options.parameters || {},
              userId: options.userId
            })
          })
          
          if (templateResponse.ok) {
            const templateData = await templateResponse.json()
            // Call seed endpoint
            await fetch(`http://localhost:3000/api/projects/${projectId}/seed`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                files: templateData.files,
                templateId: options.templateId
              })
            })
          }
        } else {
          console.log('Creating minimal project skeleton')
          // Create minimal skeleton files
          const skeletonFiles = [
            {
              name: 'README.md',
              path: 'README.md',
              content: `# ${options.parameters?.projectName || 'New Project'}\n\n${options.parameters?.projectDescription || 'A project created with DevFlowHub'}`,
              type: 'file'
            },
            {
              name: 'package.json',
              path: 'package.json',
              content: JSON.stringify({
                name: options.parameters?.projectName?.toLowerCase().replace(/\s+/g, '-') || 'new-project',
                version: '1.0.0',
                description: options.parameters?.projectDescription || '',
                main: 'index.js',
                scripts: {
                  start: 'node index.js',
                  dev: 'node index.js'
                }
              }, null, 2),
              type: 'file'
            }
          ]
          
          await fetch(`http://localhost:3000/api/projects/${projectId}/seed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              files: skeletonFiles,
              templateId: 'scratch'
            })
          })
        }
        break

      case 'create_git_repo':
        console.log('Creating git repository')
        await fetch(`http://localhost:3000/api/projects/${projectId}/git/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connectGit: options.connectGit,
            gitProvider: options.gitProvider,
            gitRepoSettings: options.gitRepoSettings
          })
        })
        break

      case 'provision_sandbox':
        if (options.enableSandbox) {
          console.log('Provisioning sandbox environment')
          await fetch(`http://localhost:3000/api/projects/${projectId}/sandbox/provision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              enableSandbox: true,
              sandboxType: 'sandpack'
            })
          })
        }
        break

      case 'index_project':
        console.log('Indexing project for AI assistant')
        await fetch(`http://localhost:3000/api/projects/${projectId}/index`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
        break

      case 'run_initial_build':
        console.log('Running initial build and tests')
        await fetch(`http://localhost:3000/api/projects/${projectId}/build`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buildType: 'initial',
            runTests: true,
            installDeps: true
          })
        })
        break
    }
  } catch (error) {
    console.error(`Error in provisioning step ${step}:`, error)
    throw error
  }
}

// Update provisioning status
async function updateProvisioningStatus(
  projectId: string,
  jobId: string,
  status: string,
  data: any
) {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        context: {
          update: {
            provisioning: {
              jobId,
              status,
              ...data
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('Error updating provisioning status:', error)
  }
}
