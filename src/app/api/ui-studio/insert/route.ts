import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      projectId,
      componentData,
      targetPath,
      commitMessage,
      createTests = true,
      createStory = true
    } = await request.json()

    // Validate project access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true, name: true }
    })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Create assistant branch name
    const timestamp = Date.now()
    const branchName = `assistant/ui-studio/${componentData.name.toLowerCase()}-${timestamp}`
    
    // Prepare files to create
    const filesToCreate = []
    
    // Main component file
    filesToCreate.push({
      path: targetPath,
      content: componentData.code,
      type: 'component'
    })

    // Test file
    if (createTests && componentData.test) {
      const testPath = targetPath.replace(/\.tsx?$/, '.test.tsx')
      filesToCreate.push({
        path: testPath,
        content: componentData.test,
        type: 'test'
      })
    }

    // Story file
    if (createStory && componentData.story) {
      const storyPath = targetPath.replace(/\.tsx?$/, '.stories.tsx')
      filesToCreate.push({
        path: storyPath,
        content: componentData.story,
        type: 'story'
      })
    }

    // Create assistant branch record
    const assistantBranch = await prisma.assistantBranch.create({
      data: {
        projectId,
        branchName,
        status: 'created',
        summary: `Add ${componentData.name} component via UI Studio`,
        rationale: componentData.rationale || `Generated ${componentData.name} component with AI`,
        changesCount: filesToCreate.length,
        createdAt: new Date()
      }
    })

    // Store files in database (simulating git operations)
    for (const file of filesToCreate) {
      await prisma.projectFile.create({
        data: {
          projectId,
          name: file.path.split('/').pop() || file.path,
          path: `${branchName}/${file.path}`,
          content: file.content,
          type: 'file',
          metadata: {
            branch: branchName,
            fileType: file.type,
            generatedBy: 'ui-studio'
          }
        }
      })
    }

    // Save component to library if it doesn't exist
    try {
      const existingComponent = await prisma.componentLibraryEntry.findFirst({
        where: {
          name: componentData.name,
          projectId: projectId
        }
      })

      if (!existingComponent) {
        await prisma.componentLibraryEntry.create({
          data: {
            name: componentData.name,
            description: componentData.rationale || `AI-generated ${componentData.name} component`,
            category: determineCategory(componentData.name),
            tags: extractTags(componentData),
            code: componentData.code,
            props: componentData.props,
            variants: componentData.variants,
            previewHtml: componentData.previewHtml,
            story: componentData.story,
            test: componentData.test,
            projectId: projectId,
            createdBy: session.user.id,
            visibility: 'project'
          }
        })
      }
    } catch (libraryError) {
      console.warn('Failed to save to component library:', libraryError)
      // Continue anyway - the main insertion is more important
    }

    // Return preview data for frontend
    const preview = {
      branchName,
      diffs: filesToCreate.map(file => ({
        path: file.path,
        type: 'create',
        additions: file.content.split('\n').length,
        deletions: 0,
        preview: file.content.substring(0, 500) + (file.content.length > 500 ? '...' : '')
      })),
      estimatedCost: 0.0, // No cost for insertion
      filesCreated: filesToCreate.length
    }

    return NextResponse.json({
      success: true,
      assistantBranchId: assistantBranch.id,
      branchName,
      preview,
      message: `Successfully created ${filesToCreate.length} files in assistant branch`
    })

  } catch (error) {
    console.error('Component insertion error:', error)
    return NextResponse.json(
      { error: 'Failed to insert component', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// Helper function to determine component category
function determineCategory(componentName: string): string {
  const name = componentName.toLowerCase()
  
  if (name.includes('button')) return 'Button'
  if (name.includes('form') || name.includes('input')) return 'Form'
  if (name.includes('card')) return 'Data Display'
  if (name.includes('nav') || name.includes('menu')) return 'Navigation'
  if (name.includes('modal') || name.includes('dialog')) return 'Overlay'
  if (name.includes('layout') || name.includes('container')) return 'Layout'
  
  return 'Other'
}

// Helper function to extract tags from component
function extractTags(componentData: any): string[] {
  const tags = []
  const name = componentData.name.toLowerCase()
  const code = (componentData.code || '').toLowerCase()
  
  if (name.includes('button') || code.includes('button')) tags.push('button')
  if (name.includes('form') || code.includes('form')) tags.push('form')
  if (name.includes('card') || code.includes('card')) tags.push('card')
  if (code.includes('accessible') || code.includes('aria-')) tags.push('accessible')
  if (code.includes('tailwind')) tags.push('tailwind')
  if (code.includes('typescript')) tags.push('typescript')
  
  return tags
}
