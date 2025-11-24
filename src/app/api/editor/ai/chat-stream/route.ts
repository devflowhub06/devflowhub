import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, code, projectContext, language = 'javascript', projectId } = await request.json()

    // Enhanced: Search codebase using RAG
    let codebaseContext = ''
    if (projectId && message.length > 10) {
      try {
        const { RagService } = await import('@/lib/rag')
        const relevantFiles = await RagService.searchDocuments(projectId, message, 8)
        if (relevantFiles.length > 0) {
          codebaseContext = `\n\n## Relevant Codebase Context:\n\n` +
            relevantFiles.map(file => 
              `### ${file.filename}\n\`\`\`\n${file.content.substring(0, 600)}${file.content.length > 600 ? '...' : ''}\n\`\`\`\n`
            ).join('\n')
        }
      } catch (ragError) {
        console.error('RAG search error:', ragError)
      }
    }

    const systemPrompt = `You are DevFlowHub's AI coding assistant with deep codebase understanding. You understand the entire project structure and can reference specific files, functions, and patterns.`

    const userPrompt = `${message}

${code ? `Current code:\n\`\`\`${language}\n${code}\n\`\`\`` : ''}
${projectContext ? `Project context: ${projectContext}` : ''}${codebaseContext}`

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      stream: true,
      max_tokens: 2000,
      temperature: 0.3
    })

    // Create a readable stream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Streaming error:', error)
    return new Response(
      JSON.stringify({ error: 'Streaming failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

