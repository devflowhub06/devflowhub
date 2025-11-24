import { NextRequest, NextResponse } from 'next/server'
import * as diff from 'diff'

export async function POST(request: NextRequest) {
  try {
    const { projectId, changes, summary, rationale } = await request.json()

    if (!projectId || !changes || !Array.isArray(changes)) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, changes' },
        { status: 400 }
      )
    }

    // Generate diffs for each change
    const diffs = changes.map((change: any) => {
      const { path, op, newContent, oldContent } = change
      
      let unifiedDiff = ''
      let hunks: any[] = []

      if (op === 'edit' && oldContent && newContent) {
        const diffResult = diff.diffLines(oldContent, newContent)
        let oldLineNum = 1
        let newLineNum = 1
        let hunkStart = 1
        let hunkLines: string[] = []

        diffResult.forEach((part, index) => {
          if (part.added || part.removed) {
            if (hunkLines.length === 0) {
              hunkStart = part.added ? newLineNum : oldLineNum
            }
            hunkLines.push(part.value)
          } else {
            if (hunkLines.length > 0) {
              // Create hunk
              const oldLines = hunkLines.filter(line => line.startsWith('-') || !line.startsWith('+')).length
              const newLines = hunkLines.filter(line => line.startsWith('+') || !line.startsWith('-')).length
              
              hunks.push({
                oldStart: hunkStart,
                oldLines: oldLines,
                newStart: hunkStart,
                newLines: newLines,
                patch: hunkLines.join('')
              })
              
              hunkLines = []
            }
            oldLineNum += part.count || 0
            newLineNum += part.count || 0
          }
        })

        // Handle remaining hunk
        if (hunkLines.length > 0) {
          const oldLines = hunkLines.filter(line => line.startsWith('-') || !line.startsWith('+')).length
          const newLines = hunkLines.filter(line => line.startsWith('+') || !line.startsWith('-')).length
          
          hunks.push({
            oldStart: hunkStart,
            oldLines: oldLines,
            newStart: hunkStart,
            newLines: newLines,
            patch: hunkLines.join('')
          })
        }

        const oldLinesCount = hunkLines.filter(line => line.startsWith('-') || !line.startsWith('+')).length
        const newLinesCount = hunkLines.filter(line => line.startsWith('+') || !line.startsWith('-')).length
        unifiedDiff = `@@ -${hunkStart},${oldLinesCount} +${hunkStart},${newLinesCount} @@\n${hunkLines.join('')}`
      } else if (op === 'add') {
        const lines = newContent.split('\n')
        unifiedDiff = `@@ -0,0 +1,${lines.length} @@\n${lines.map(line => `+${line}`).join('\n')}`
        hunks.push({
          oldStart: 0,
          oldLines: 0,
          newStart: 1,
          newLines: lines.length,
          patch: lines.map(line => `+${line}`).join('\n')
        })
      } else if (op === 'delete') {
        const lines = oldContent?.split('\n') || []
        unifiedDiff = `@@ -1,${lines.length} +0,0 @@\n${lines.map(line => `-${line}`).join('\n')}`
        hunks.push({
          oldStart: 1,
          oldLines: lines.length,
          newStart: 0,
          newLines: 0,
          patch: lines.map(line => `-${line}`).join('\n')
        })
      }

      return {
        path,
        unifiedDiff,
        hunks
      }
    })

    // Calculate estimated cost (mock calculation)
    const estimatedCostTokens = changes.reduce((total: number, change: any) => {
      return total + (change.newContent?.length || 0) * 0.75 // Rough token estimation
    }, 0)

    return NextResponse.json({
      diffs,
      rationale: rationale || 'AI-generated code changes',
      estimatedCostTokens: Math.round(estimatedCostTokens)
    })

  } catch (error) {
    console.error('Error in assistant preview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}