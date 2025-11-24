import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

interface FileOperation {
  type: 'create' | 'edit' | 'delete'
  path: string
  content?: string
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, operations }: { projectId: string; operations: FileOperation[] } = await request.json()

    if (!projectId || !operations || !Array.isArray(operations)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const projectRoot = path.join(process.cwd(), 'projects', projectId)
    const results = []

    for (const operation of operations) {
      try {
        const filePath = path.join(projectRoot, operation.path)
        const dirPath = path.dirname(filePath)

        switch (operation.type) {
          case 'create':
            // Ensure directory exists
            if (!existsSync(dirPath)) {
              await mkdir(dirPath, { recursive: true })
            }
            
            // Create file with content
            if (operation.content) {
              await writeFile(filePath, operation.content, 'utf-8')
              results.push({ 
                path: operation.path, 
                status: 'created', 
                message: 'File created successfully' 
              })
            }
            break

          case 'edit':
            if (existsSync(filePath)) {
              // Read existing content and apply AI changes
              const existingContent = await readFile(filePath, 'utf-8')
              const newContent = operation.content || existingContent
              
              await writeFile(filePath, newContent, 'utf-8')
              results.push({ 
                path: operation.path, 
                status: 'updated', 
                message: 'File updated successfully' 
              })
            } else {
              results.push({ 
                path: operation.path, 
                status: 'error', 
                message: 'File does not exist' 
              })
            }
            break

          case 'delete':
            if (existsSync(filePath)) {
              await unlink(filePath)
              results.push({ 
                path: operation.path, 
                status: 'deleted', 
                message: 'File deleted successfully' 
              })
            } else {
              results.push({ 
                path: operation.path, 
                status: 'error', 
                message: 'File does not exist' 
              })
            }
            break

          default:
            results.push({ 
              path: operation.path, 
              status: 'error', 
              message: 'Invalid operation type' 
            })
        }
      } catch (error) {
        results.push({ 
          path: operation.path, 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    // Log usage
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          tool: 'ai_assistant',
          action: 'file_patch',
          metadata: { 
            operations: operations.length,
            results: results.map(r => ({ path: r.path, status: r.status }))
          }
        })
      })
    } catch (error) {
      console.error('Failed to log usage:', error)
    }

    return NextResponse.json({ 
      success: true, 
      results,
      message: `Processed ${operations.length} file operations` 
    })

  } catch (error) {
    console.error('File patch error:', error)
    return NextResponse.json(
      { error: 'File patch failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
