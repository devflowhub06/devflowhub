import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, codeContext, fileChanges, currentFile, language } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Get project context
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      },
      include: {
        files: {
          take: 20,
          orderBy: { updatedAt: 'desc' }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Build context for AI
    const recentFiles = project.files.slice(0, 5).map(f => ({
      name: f.name,
      language: f.language || 'javascript',
      recent: true
    }))

    const systemPrompt = `You are a terminal command suggestion AI for DevFlowHub. Your job is to suggest the most appropriate terminal command based on:

1. **Code Context**: What the user is working on
2. **File Changes**: Recent modifications to files
3. **Project Type**: The type of project (${project.type || 'new-project'})
4. **Language**: Primary programming language (${project.language || 'JavaScript'})
5. **Current File**: The file currently being edited

**Rules:**
- Only suggest safe, common commands (npm, yarn, git, node, python, etc.)
- Suggest commands that are relevant to the current context
- If the user just modified a package.json, suggest "npm install"
- If the user added a new file, suggest relevant build/test commands
- If the code has errors, suggest commands to check/test
- Keep commands concise and actionable
- Return ONLY the command, no explanations

**Recent Files:**
${recentFiles.map(f => `- ${f.name} (${f.language})`).join('\n')}

**Current Context:**
${codeContext ? `Code: ${codeContext.substring(0, 500)}` : 'No specific code context'}
${fileChanges ? `Recent changes: ${fileChanges}` : ''}
${currentFile ? `Current file: ${currentFile}` : ''}

Suggest the most appropriate terminal command as a single line.`

    const userPrompt = codeContext || fileChanges || currentFile
      ? `Based on this context, suggest a terminal command: ${codeContext ? `\n\nCode:\n${codeContext.substring(0, 1000)}` : ''}${fileChanges ? `\n\nChanges: ${fileChanges}` : ''}${currentFile ? `\n\nFile: ${currentFile}` : ''}`
      : `Suggest a useful terminal command for a ${project.language || 'JavaScript'} project.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 50
    })

    const suggestion = completion.choices[0]?.message?.content?.trim() || null

    // Clean up the suggestion (remove markdown, quotes, etc.)
    const cleanedSuggestion = suggestion
      ?.replace(/^```[\w]*\n?/g, '')
      ?.replace(/\n?```$/g, '')
      ?.replace(/^["']|["']$/g, '')
      ?.trim() || null

    // Validate it's a safe command
    if (cleanedSuggestion) {
      const safeCommands = [
        'npm', 'yarn', 'pnpm', 'node', 'npx',
        'git', 'ls', 'cat', 'grep', 'find',
        'pwd', 'cd', 'echo', 'mkdir',
        'python', 'python3', 'pip', 'pip3',
        'go', 'rustc', 'cargo',
        'java', 'javac', 'mvn', 'gradle'
      ]
      
      const firstWord = cleanedSuggestion.split(/\s+/)[0]?.toLowerCase()
      if (!safeCommands.includes(firstWord)) {
        // Default to a safe command based on project type
        if (project.language === 'Python') {
          return NextResponse.json({ command: 'python -m pip install -r requirements.txt' })
        } else if (project.language === 'TypeScript' || project.language === 'JavaScript') {
          return NextResponse.json({ command: 'npm install' })
        } else {
          return NextResponse.json({ command: 'git status' })
        }
      }
    }

    return NextResponse.json({ 
      command: cleanedSuggestion || 'npm install',
      reasoning: 'AI-generated suggestion based on code context'
    })

  } catch (error) {
    console.error('Terminal suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to generate terminal suggestion' },
      { status: 500 }
    )
  }
}

