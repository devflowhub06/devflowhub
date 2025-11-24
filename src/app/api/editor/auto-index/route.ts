import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { RagService } from '@/lib/rag'

/**
 * Auto-index file when created or modified for deep codebase understanding
 * This enables Cursor-level AI that understands the entire codebase
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, filePath, content, action } = await request.json()

    if (!projectId || !filePath) {
      return NextResponse.json(
        { error: 'Project ID and file path are required' },
        { status: 400 }
      )
    }

    // Index file for RAG (codebase understanding)
    if (action === 'create' || action === 'update') {
      try {
        await RagService.updateDocument(
          projectId,
          filePath,
          content || '',
          {
            action,
            indexedAt: new Date().toISOString(),
            fileSize: content ? Buffer.byteLength(content, 'utf8') : 0
          }
        )
      } catch (ragError) {
        console.error('Auto-indexing error (non-critical):', ragError)
        // Don't fail the request if indexing fails
      }
    } else if (action === 'delete') {
      try {
        await RagService.deleteDocument(projectId, filePath)
      } catch (ragError) {
        console.error('Auto-deindexing error (non-critical):', ragError)
      }
    }

    return NextResponse.json({
      success: true,
      indexed: true,
      projectId,
      filePath
    })
  } catch (error) {
    console.error('Auto-index error:', error)
    return NextResponse.json(
      { error: 'Failed to index file', indexed: false },
      { status: 500 }
    )
  }
}

