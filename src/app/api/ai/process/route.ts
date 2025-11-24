import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, projectId, activeTool, projectContext, action } = await request.json()

    console.log('AI Processing request:', { prompt, projectId, activeTool, action })

    // Create a context-aware system prompt
    const systemPrompt = `You are an AI development assistant for DevFlowHub. Your job is to:

1. Analyze user requests and recommend the best tool to use
2. Provide specific code changes and file operations
3. Understand the project context and suggest improvements

Available modules (UI-branded):
- DevFlowHub Sandbox (provider: Replit): For running/testing code, terminal operations
- DevFlowHub Editor (provider: Cursor): For code editing, file management, refactoring
- DevFlowHub UI Studio (provider: v0): For UI component generation, design
- DevFlowHub Deployer (provider: Bolt): For deployment, environment management

Project Context:
- Language: ${projectContext?.language || 'unknown'}
- Files: ${projectContext?.files?.map((f: any) => f.name).join(', ') || 'none'}
- Dependencies: ${projectContext?.dependencies?.join(', ') || 'none'}
- Git Status: ${projectContext?.gitStatus || 'unknown'}

Current Active Tool: ${activeTool}

Respond with JSON in this format:
{
  "message": "Clear explanation of what will be done",
  "recommendedTool": "tool_name",
  "codeChanges": [{"file": "path", "operation": "create/edit/delete", "content": "code"}],
  "fileOperations": [{"type": "create/edit/delete", "path": "path", "content": "content"}],
  "reasoning": "Why this tool is recommended"
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'No response from AI'

    // Parse the AI response (it should be JSON)
    let parsedResponse
    try {
      parsedResponse = JSON.parse(aiResponse)
    } catch (e) {
      // Fallback if AI doesn't return valid JSON
      parsedResponse = {
        message: aiResponse,
        recommendedTool: (activeTool || '').toLowerCase(),
        codeChanges: [],
        fileOperations: [],
        reasoning: "AI provided a response but couldn't parse structured data"
      }
    }

    // Log usage (simplified)
    try {
      console.log('Usage logged:', {
        projectId,
        tool: 'ai_assistant',
        action: 'ai_process',
        metadata: {
          prompt,
          recommendedTool: parsedResponse.recommendedTool,
          tokensUsed: completion.usage?.total_tokens || 0
        }
      })
    } catch (error) {
      console.error('Failed to log usage:', error)
    }

    return NextResponse.json(parsedResponse)

  } catch (error) {
    console.error('AI processing error:', error)
    return NextResponse.json(
      { error: 'AI processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
