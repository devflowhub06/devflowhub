import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Inline code editing - Apply AI suggestions directly to code with diff
 * This enables Cursor-like inline editing capabilities
 */
export async function POST(request: NextRequest) {
  try {
    const {
      code,
      selection,
      instruction,
      language = 'javascript',
      projectContext,
      projectId
    } = await request.json()

    if (!code || !selection || !instruction) {
      return NextResponse.json(
        { error: 'Code, selection, and instruction are required' },
        { status: 400 }
      )
    }

    // Get codebase context for better edits
    let codebaseContext = ''
    if (projectId) {
      try {
        const { RagService } = await import('@/lib/rag')
        const relevantFiles = await RagService.searchDocuments(projectId, instruction, 5)
        if (relevantFiles.length > 0) {
          codebaseContext = relevantFiles.map(file =>
            `### ${file.filename}\n\`\`\`\n${file.content.substring(0, 500)}\n\`\`\`\n`
          ).join('\n')
        }
      } catch (ragError) {
        console.error('Codebase context error (non-critical):', ragError)
      }
    }

    const systemPrompt = `You are DevFlowHub's inline code editor - equivalent to Cursor's inline editing. You make precise, surgical edits to code based on user instructions.

Rules:
1. **Preserve existing code** - Only modify what's necessary
2. **Maintain style** - Follow the existing code style and patterns
3. **Complete edits** - Provide the FULL modified code section, not just diffs
4. **Context-aware** - Consider how changes affect related code
5. **Type-safe** - Ensure edits are syntactically correct

Return ONLY the modified code section as a complete, ready-to-use code block.`

    const userPrompt = `Original code:
\`\`\`${language}
${code}
\`\`\`

Selected code to edit (lines ${selection.startLine} to ${selection.endLine}):
\`\`\`${language}
${selection.text}
\`\`\`

User instruction: ${instruction}

${codebaseContext ? `\nRelevant codebase context:\n${codebaseContext}` : ''}

${projectContext ? `Project context: ${projectContext}` : ''}

Provide the COMPLETE modified code section that replaces the selected code. Return ONLY the code, no explanations.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.2
    })

    const editedCode = completion.choices[0]?.message?.content?.trim() || code

    // Clean up markdown code blocks if present
    const cleanedCode = editedCode.replace(/^```[\w]*\n?/gm, '').replace(/\n?```$/gm, '').trim()

    // Generate diff
    const diff = generateDiff(selection.text, cleanedCode)

    return NextResponse.json({
      originalCode: selection.text,
      editedCode: cleanedCode,
      diff,
      confidence: 0.9
    })
  } catch (error) {
    console.error('Inline edit error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate inline edit',
        originalCode: code,
        editedCode: code,
        diff: []
      },
      { status: 500 }
    )
  }
}

function generateDiff(original: string, edited: string): Array<{ type: 'added' | 'removed' | 'modified'; line: number; content: string }> {
  const originalLines = original.split('\n')
  const editedLines = edited.split('\n')
  const diff: Array<{ type: 'added' | 'removed' | 'modified'; line: number; content: string }> = []

  const maxLines = Math.max(originalLines.length, editedLines.length)

  for (let i = 0; i < maxLines; i++) {
    const originalLine = originalLines[i]
    const editedLine = editedLines[i]

    if (!originalLine && editedLine) {
      diff.push({ type: 'added', line: i + 1, content: editedLine })
    } else if (originalLine && !editedLine) {
      diff.push({ type: 'removed', line: i + 1, content: originalLine })
    } else if (originalLine !== editedLine) {
      diff.push({ type: 'modified', line: i + 1, content: editedLine || originalLine })
    }
  }

  return diff
}

