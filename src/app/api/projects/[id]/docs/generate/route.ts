import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// POST /api/projects/[id]/docs/generate - Generate README/documentation
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
    const { type = 'readme', format = 'markdown' } = await request.json().catch(() => ({}))

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get project files
    const files = await prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    })

    // Build project context
    const projectContext = {
      name: project.name,
      description: project.description,
      type: project.type,
      language: project.language,
      framework: project.framework,
      files: files.map(f => ({
        path: f.path,
        name: f.name,
        type: f.type,
        content: f.content.substring(0, 500) // First 500 chars for context
      })),
      recentActivities: project.activities.map(a => ({
        type: a.type,
        description: a.description,
        createdAt: a.createdAt
      }))
    }

    // Get more file content for better context (up to 5 key files)
    const keyFiles = files
      .filter(f => f.type === 'file' && !f.path.includes('node_modules') && !f.path.includes('.git'))
      .slice(0, 5)
      .map(f => ({
        path: f.path,
        content: f.content.substring(0, 2000) // First 2000 chars for better context
      }))

    // Generate documentation using AI
    const systemPrompt = `You are a technical documentation expert. Generate comprehensive ${type === 'readme' ? 'README.md' : 'documentation'} for the given project.

Requirements:
- Use ${format} format
- Include project overview, setup instructions, usage examples
- Document key files and their purposes
- Include any relevant configuration details
- Make it professional and easy to understand
- If this is a README, include sections: Overview, Features, Installation, Usage, Project Structure, Contributing
- Analyze the code structure and provide accurate technical details
- Include code examples where relevant
- Make it production-ready and professional`

    const userPrompt = `Generate ${type === 'readme' ? 'a README.md' : 'documentation'} for this project:

Project Name: ${projectContext.name}
Description: ${projectContext.description || 'No description'}
Type: ${projectContext.type}
Language: ${projectContext.language}
Framework: ${projectContext.framework || 'None'}

Project Files:
${projectContext.files.map(f => `- ${f.path} (${f.type})`).join('\n')}

Key File Contents:
${keyFiles.map(f => `\n## ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join('\n')}

Recent Activities:
${projectContext.recentActivities.map(a => `- ${a.type}: ${a.description}`).join('\n')}

Generate comprehensive ${type === 'readme' ? 'README.md' : 'documentation'} in ${format} format. Be specific about the project structure, dependencies, and how to use it.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000 // Increased for more comprehensive docs
    })

    const generatedDocs = completion.choices[0]?.message?.content || ''

    // Save generated documentation as a file
    const docFileName = type === 'readme' ? 'README.md' : 'DOCUMENTATION.md'
    const existingDoc = files.find(f => f.path === docFileName || f.name === docFileName)

    if (existingDoc) {
      await prisma.projectFile.update({
        where: { id: existingDoc.id },
        data: { content: generatedDocs }
      })
    } else {
      await prisma.projectFile.create({
        data: {
          projectId,
          name: docFileName,
          path: docFileName,
          content: generatedDocs,
          type: 'file'
        }
      })
    }

    // Create activity
    await prisma.projectActivity.create({
      data: {
        projectId,
        type: 'docs_generated',
        description: `Generated ${type} documentation`,
        metadata: {
          type,
          format,
          fileName: docFileName
        }
      }
    })

    return NextResponse.json({
      success: true,
      documentation: generatedDocs,
      fileName: docFileName,
      saved: true
    })
  } catch (error) {
    console.error('Error generating documentation:', error)
    return NextResponse.json(
      { error: 'Failed to generate documentation' },
      { status: 500 }
    )
  }
}

