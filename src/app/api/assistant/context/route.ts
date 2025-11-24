import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { RagService } from '@/lib/rag'

// GET /api/assistant/context?projectId=xxx&query=xxx
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const query = searchParams.get('query')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    let context: string

    if (query) {
      // Search for relevant documents
      const documents = await RagService.searchDocuments(projectId, query, 5)
      context = documents.map(doc => 
        `## ${doc.filename}\n\`\`\`\n${doc.content}\n\`\`\``
      ).join('\n\n')
    } else {
      // Get general project context
      context = await RagService.getProjectContext(projectId)
    }

    return NextResponse.json({
      success: true,
      context,
      projectId
    })
  } catch (error) {
    console.error('Error getting assistant context:', error)
    return NextResponse.json(
      { error: 'Failed to get project context' },
      { status: 500 }
    )
  }
}
