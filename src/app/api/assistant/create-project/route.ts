import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'

// Use environment variable for API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// POST /api/assistant/create-project - AI-driven project creation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, language = 'JavaScript', framework = 'React' } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Use AI to analyze the prompt and generate project plan
    const systemPrompt = `You are DevFlowHub's AI project creation assistant. Analyze the user's prompt and create a detailed project plan.

User prompt: "${prompt}"

Generate a JSON response with:
1. projectName: A suitable project name
2. description: Brief project description
3. templateId: Best matching template ID or "scratch" if no template fits
4. parameters: Template parameters needed
5. estimatedTokens: Estimated tokens for this operation
6. steps: Array of steps to create this project
7. costEstimate: Estimated cost breakdown

Available templates: todo-app, blog-nextjs, api-server, react-starter, vue-starter, python-flask

Respond with valid JSON only.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const aiResponse = completion.choices[0]?.message?.content || '{}'
    let projectPlan
    
    try {
      projectPlan = JSON.parse(aiResponse)
    } catch (parseError) {
      // Fallback if AI response is not valid JSON
      projectPlan = {
        projectName: prompt.split(' ').slice(0, 3).join('-').toLowerCase(),
        description: `Project created from prompt: ${prompt}`,
        templateId: 'scratch',
        parameters: {},
        estimatedTokens: 500,
        steps: ['Create project', 'Setup basic structure', 'Configure environment'],
        costEstimate: { tokens: 500, cost: 0.001 }
      }
    }

    // Generate unique project ID and job ID
    const projectId = uuidv4()
    const jobId = uuidv4()

    // Create project record
    const project = await prisma.project.create({
      data: {
        id: projectId,
        name: projectPlan.projectName,
        description: projectPlan.description,
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
          aiGenerated: true,
          originalPrompt: prompt,
          projectPlan,
          provisioning: {
            jobId,
            status: 'started',
            steps: projectPlan.steps || [],
            templateId: projectPlan.templateId,
            parameters: projectPlan.parameters || {},
            estimatedTokens: projectPlan.estimatedTokens || 500,
            costEstimate: projectPlan.costEstimate || { tokens: 500, cost: 0.001 }
          }
        }
      }
    })

    // Track telemetry
    console.log(`AI Assistant created project: ${projectId} for user: ${session.user.id}`)

    return NextResponse.json({
      success: true,
      project,
      jobId,
      projectPlan,
      provisioningUrl: `/api/projects/${projectId}/provision/${jobId}/status`,
      requiresApproval: projectPlan.estimatedTokens > 1000 // Require approval for high-cost operations
    })
  } catch (error) {
    console.error('Error in AI project creation:', error)
    return NextResponse.json(
      { error: 'Failed to create AI project' },
      { status: 500 }
    )
  }
}
