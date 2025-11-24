import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectId,
      projectName,
      projectLanguage,
      currentTool,
      currentFile,
      currentCode,
      userMessage
    } = body

    // Validate required fields
    if (!projectId || !userMessage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Prepare context for AI
    const context = {
      project: {
        name: projectName,
        language: projectLanguage,
        type: project.type,
        framework: project.framework,
        complexity: project.complexity
      },
      currentTool,
      currentFile,
      currentCode,
      userMessage
    }

    // Call OpenAI API using the official SDK (same path as editor)
    const aiResponse = await callOpenAI(context)

    // Log the interaction
    // Map provided tool to valid Prisma ToolType enum
    const toolType: any = ((): string => {
      const t = String(currentTool || '').toUpperCase()
      if (t === 'EDITOR' || t === 'CURSOR') return 'EDITOR'
      if (t === 'SANDBOX' || t === 'REPLIT') return 'SANDBOX'
      if (t === 'UI_STUDIO' || t === 'V0' || t === 'UISTUDIO') return 'UI_STUDIO'
      if (t === 'DEPLOYER' || t === 'BOLT' || t === 'DEPLOY') return 'DEPLOYER'
      // Dashboard and unknown contexts default to EDITOR for logging
      return 'EDITOR'
    })()

    await prisma.usageLog.create({
      data: {
        projectId,
        userId: session.user.id,
        tool: toolType,
        action: 'ai_assistant_used',
        metadata: {
          prompt: userMessage,
          response: aiResponse,
          tool: toolType,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      response: aiResponse.response,
      action: aiResponse.action,
      code: aiResponse.code,
      filePath: aiResponse.filePath
    })

  } catch (error) {
    console.error('AI Assistant API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function callOpenAI(context: any) {
  // Prefer a valid env key; if placeholder or missing, fallback to the known working key (same as Editor)
  const envKey = process.env.OPENAI_API_KEY
  const openaiApiKey = envKey && !/sk-your/i.test(envKey) ? envKey : null

  // Minimal debug to verify which key path is used (prefix only)
  console.log('Dashboard Assistant: using OPENAI key prefix:', openaiApiKey ? openaiApiKey.substring(0, 12) + '...' : 'NONE')

  if (!openaiApiKey) {
    return {
      response: "OpenAI is not configured. Please set OPENAI_API_KEY to enable AI replies.",
      action: 'info',
      code: null,
      filePath: null
    }
  }

  const openai = new OpenAI({ apiKey: openaiApiKey })

  const systemPrompt = `You are an AI coding assistant integrated into DevFlowHub. You help developers with code analysis, generation, optimization, and problem-solving.

Current Context:
- Project: ${context.project.name} (${context.project.language})
- Project Type: ${context.project.type}
- Framework: ${context.project.framework || 'None specified'}
- Complexity: ${context.project.complexity}
- Current Tool: ${context.currentTool}
- Current File: ${context.currentFile || 'None'}
${context.currentCode ? '- Current Code included below.' : ''}

Guidelines:
1. Provide helpful, actionable advice
2. If generating code, ensure it's production-ready and follows best practices
3. Consider the project's language and framework
4. Be concise but thorough
5. If suggesting code changes, explain why they're beneficial
6. Always consider security and performance implications`

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: context.userMessage + (context.currentCode ? `\n\nCurrent Code:\n\`\`\`\n${context.currentCode}\n\`\`\`` : '') }
  ]

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1000
    })

    const aiMessage = completion.choices[0]?.message?.content || ''

    const codeMatch = aiMessage.match(/```[\w]*\n([\s\S]*?)\n```/)
    const code = codeMatch ? codeMatch[1] : null

    let action = 'assist'
    const msg = context.userMessage.toLowerCase()
    if (msg.includes('generate') || msg.includes('create')) action = 'generate'
    else if (msg.includes('explain') || msg.includes('analyze')) action = 'explain'
    else if (msg.includes('optimize') || msg.includes('improve')) action = 'optimize'
    else if (msg.includes('fix') || msg.includes('debug')) action = 'fix'

    return { response: aiMessage, action, code, filePath: context.currentFile }
  } catch (err: any) {
    console.error('OpenAI API error (dashboard assistant):', err?.message || err)
    return {
      response: `AI error: ${err?.message || 'unknown error'}. Please verify OPENAI_API_KEY and model access.`,
      action: 'error',
      code: null,
      filePath: null
    }
  }
}
