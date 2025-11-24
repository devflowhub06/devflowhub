import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Debug API key loading
console.log('🔑 OPENAI_API_KEY available:', process.env.OPENAI_API_KEY ? 'YES' : 'NO')
console.log('🔑 API Key preview:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...')

// Use environment OPENAI_API_KEY
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      code, 
      cursorPosition, 
      language, 
      projectContext,
      maxTokens = 100,
      projectId,
      relatedFiles 
    } = await request.json()

    if (!code || cursorPosition === undefined) {
      return NextResponse.json(
        { error: 'Code and cursor position are required' },
        { status: 400 }
      )
    }

    // Get full file context (much better than just 10 lines)
    const lines = code.split('\n')
    const cursorLine = cursorPosition.line
    const cursorChar = cursorPosition.character
    
    // Build intelligent context window (more lines for better understanding)
    // Use up to 50 lines before and 30 lines after for better context
    const contextBefore = Math.min(50, cursorLine)
    const contextAfter = Math.min(30, lines.length - cursorLine - 1)
    const contextStart = Math.max(0, cursorLine - contextBefore)
    const contextEnd = Math.min(lines.length, cursorLine + contextAfter + 1)
    const contextLines = lines.slice(contextStart, contextEnd)
    
    // Get file structure hints (imports, exports, function names)
    const fileStructure = extractFileStructure(code, language || 'javascript')
    
    // Mark the cursor position
    const contextCode = contextLines.map((line, index) => {
      const actualLine = contextStart + index
      if (actualLine === cursorLine) {
        return line.substring(0, cursorChar) + '|CURSOR|' + line.substring(cursorChar)
      }
      return line
    }).join('\n')

    // Enhanced: Get context from related files using RAG
    let relatedFilesContext = ''
    if (projectId && relatedFiles && relatedFiles.length > 0) {
      try {
        const { RagService } = await import('@/lib/rag')
        for (const filePath of relatedFiles.slice(0, 3)) {
          const docs = await RagService.searchDocuments(projectId, filePath, 1)
          if (docs.length > 0) {
            relatedFilesContext += `\n### Related file: ${filePath}\n\`\`\`\n${docs[0].content.substring(0, 400)}\n\`\`\`\n`
          }
        }
      } catch (ragError) {
        console.error('Related files context error (non-critical):', ragError)
      }
    }

    // Build enhanced prompt with full context awareness
    const systemPrompt = `You are DevFlowHub's expert ${language || 'JavaScript'} AI pair programmer with DEEP codebase understanding - equivalent to Cursor's AI.

Your goal: Provide intelligent, context-aware code completions that:
1. Understand the full file context (not just immediate surroundings)
2. Understand related files, imports, and function signatures across the codebase
3. Follow project patterns and conventions from projectContext
4. Complete with modern best practices and patterns
5. Suggest logical next steps based on code flow and project structure
6. Reference functions and patterns from other files when relevant

File Structure Context:
${fileStructure}

${relatedFilesContext ? `\nRelated Files Context:${relatedFilesContext}` : ''}

Project Context: ${projectContext || 'No additional context'}

Provide ONLY the completion text (no explanations, no cursor marker).`

    const userPrompt = `Complete this ${language || 'JavaScript'} code at the cursor position |CURSOR|.

Full file context (${contextStart + 1} to ${contextEnd} of ${lines.length} total lines):
\`\`\`${language || 'javascript'}
${contextCode}
\`\`\`

Current line ${cursorLine + 1} at character ${cursorChar}.

Analyze the code flow, understand the intent, and provide the most likely continuation.
Focus on:
- Completing the current statement or block
- Suggesting the next logical code based on patterns in the file
- Following the same coding style and patterns already established
- Being practical and concise

Provide ONLY the completion text (no markdown, no explanations).`

          // Use real OpenAI API for AI autocomplete
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: userPrompt
              }
            ],
            max_tokens: Math.min(maxTokens, 150), // Slightly more tokens for better completions
            temperature: 0.2, // Slightly higher for more natural completions
            stream: false
          })

          const suggestion = completion.choices[0]?.message?.content?.trim() || ''

          return NextResponse.json({
            suggestion: suggestion,
            confidence: 0.9,
            language: language || 'javascript',
            mock: false
          })

        } catch (error) {
          console.error('AI completion error:', error)
          
          // Fallback to simple pattern-based completion
          const fallbackSuggestion = generateFallbackCompletion(code, cursorPosition, language)
    
    return NextResponse.json({
      suggestion: fallbackSuggestion,
      confidence: 0.3,
      language: language || 'javascript',
      fallback: true
    })
  }
}

// Extract file structure for better context
function extractFileStructure(code: string, language: string): string {
  const structure: string[] = []
  
  // Extract imports
  const importRegex = /^(import|from|require)\s+.*/gm
  const imports = code.match(importRegex) || []
  if (imports.length > 0) {
    structure.push(`Imports: ${imports.slice(0, 5).join(', ')}`)
  }
  
  // Extract function/class names
  const functionRegex = /(?:function|const|let|var|class|interface|type)\s+(\w+)/g
  const functions: string[] = []
  let match
  while ((match = functionRegex.exec(code)) !== null && functions.length < 10) {
    functions.push(match[1])
  }
  if (functions.length > 0) {
    structure.push(`Functions/Classes: ${functions.slice(0, 10).join(', ')}`)
  }
  
  return structure.length > 0 ? structure.join('\n') : 'Standard file structure'
}

function generateFallbackCompletion(code: string, cursorPosition: any, language?: string): string {
  const lines = code.split('\n')
  const currentLine = lines[cursorPosition.line] || ''
  const beforeCursor = currentLine.substring(0, cursorPosition.character)
  
  // Simple pattern-based completions
  if (beforeCursor.endsWith('function ')) {
    return '() {\n  \n}'
  }
  if (beforeCursor.endsWith('if (')) {
    return ') {\n  \n}'
  }
  if (beforeCursor.endsWith('for (')) {
    return 'let i = 0; i < length; i++) {\n  \n}'
  }
  if (beforeCursor.endsWith('const ') || beforeCursor.endsWith('let ') || beforeCursor.endsWith('var ')) {
    return '= '
  }
  if (beforeCursor.endsWith('import ')) {
    return 'from \'\''
  }
  if (beforeCursor.endsWith('export ')) {
    return 'default '
  }
  if (beforeCursor.endsWith('return ')) {
    return 'null'
  }
  if (beforeCursor.endsWith('console.')) {
    return 'log('
  }
  
  return ''
}
