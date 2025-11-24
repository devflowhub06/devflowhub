import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import OpenAI from 'openai'
import { RagService } from '@/lib/rag'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// POST /api/editor/ai/tasks?projectId=xxx
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Get project context
    const projectContext = await RagService.getProjectContext(projectId)
    const documents = await RagService.getProjectDocuments(projectId)

    const systemPrompt = `You are a project management AI that analyzes codebases and generates actionable, prioritized tasks.

Generate a list of tasks that would help improve the project. Tasks should be:
1. Specific and actionable
2. Prioritized (high/medium/low)
3. Categorized (e.g., "refactor", "feature", "bug", "optimization", "documentation")
4. Based on actual codebase analysis

Return tasks as a JSON array with this structure:
[
  {
    "title": "Task title",
    "description": "Detailed description",
    "priority": "high" | "medium" | "low",
    "category": "category name"
  }
]`

    const userPrompt = `Analyze this codebase and generate 5-8 actionable tasks:

${projectContext}

Project has ${documents.length} files indexed.

Generate tasks that address:
- Code quality improvements
- Missing features or functionality
- Potential bugs or issues
- Performance optimizations
- Documentation needs
- Refactoring opportunities

Return ONLY valid JSON array, no other text.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500
    })

    const response = completion.choices[0]?.message?.content?.trim() || '[]'
    
    // Try to parse as JSON array or extract JSON from markdown
    let taskList: any[] = []
    try {
      // Remove markdown code blocks if present
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleaned)
      taskList = Array.isArray(parsed) ? parsed : (parsed.tasks || [])
    } catch (error) {
      // Fallback: try to extract JSON array from text
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          taskList = JSON.parse(jsonMatch[0])
        } catch (e) {
          console.error('Failed to parse tasks JSON:', e)
        }
      }
    }

    // Format tasks
    const tasks = taskList.map((task: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      title: task.title || 'Untitled task',
      description: task.description || '',
      completed: false,
      priority: task.priority || 'medium',
      category: task.category || 'general',
      createdAt: new Date(),
      aiGenerated: true
    }))

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error generating AI tasks:', error)
    return NextResponse.json(
      { error: 'Failed to generate tasks', tasks: [] },
      { status: 500 }
    )
  }
}

