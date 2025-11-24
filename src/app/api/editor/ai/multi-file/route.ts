import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Use environment OPENAI_API_KEY
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      operation, 
      files, 
      projectContext, 
      prompt,
      language = 'javascript'
    } = await request.json()

    if (!operation || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Operation, files array, and prompt are required' },
        { status: 400 }
      )
    }

    // Analyze all files to understand the project structure
    const projectStructure = files.map(file => ({
      path: file.path,
      name: file.name,
      type: file.type,
      content: file.content,
      size: file.content.length
    }))

    const systemPrompt = `You are an expert ${language} developer with deep understanding of project architecture and multi-file operations.

You can analyze and modify multiple files simultaneously to implement complex features, refactor code, or fix issues across the entire project.

Available operations:
- add_feature: Add a new feature across multiple files
- refactor: Refactor code across multiple files for better structure
- fix_bugs: Fix bugs that span multiple files
- optimize: Optimize performance across multiple files
- migrate: Migrate code to new patterns or frameworks
- analyze: Analyze project structure and provide insights

IMPORTANT: For each file you modify, provide the COMPLETE new file content in a code block with the format:
\`\`\`file:path/to/file.${language}
[COMPLETE NEW FILE CONTENT HERE]
\`\`\`

Always provide:
1. Clear explanation of what you're doing
2. Specific file changes with complete new content
3. Reasoning for each change
4. Impact analysis
5. Testing recommendations`

    const userPrompt = `Operation: ${operation}

Project Context: ${projectContext || 'No additional context'}

User Request: ${prompt}

Project Files:
${projectStructure.map(file => `
File: ${file.path}
Type: ${file.type}
Size: ${file.size} characters
Content:
\`\`\`${language}
${file.content}
\`\`\`
`).join('\n---\n')}

Please analyze the project and provide a comprehensive plan for the ${operation} operation. Include specific file changes, reasoning, and implementation steps.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 3000,
      temperature: 0.3
    })

    const aiResponse = completion.choices[0]?.message?.content?.trim() || ''

    // Parse the response to extract file changes
    const fileChanges = parseFileChanges(aiResponse, files)
    
    return NextResponse.json({
      operation,
      response: aiResponse,
      fileChanges,
      summary: `Multi-file ${operation} operation completed`,
      confidence: 0.9,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Multi-file AI operation error:', error)
    return NextResponse.json({
      error: 'Failed to process multi-file operation',
      details: error instanceof Error ? error.message : 'Unknown error',
      operation: 'error',
      response: 'Sorry, I encountered an error processing your multi-file operation.',
      fileChanges: [],
      confidence: 0.0,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function parseFileChanges(response: string, originalFiles: any[]): any[] {
  const changes: any[] = []
  
  // Enhanced parsing: Extract file blocks with format ```file:path/to/file.ext
  const fileBlockRegex = /```(?:file:)?([^\n]+)\n([\s\S]*?)```/g
  const fileBlocks: Map<string, string> = new Map()
  
  let match
  while ((match = fileBlockRegex.exec(response)) !== null) {
    const filePath = match[1].trim()
    const newContent = match[2].trim()
    fileBlocks.set(filePath, newContent)
  }
  
  // Process each file block found
  fileBlocks.forEach((newContent, filePath) => {
    // Find matching original file
    const originalFile = originalFiles.find(f => 
      f.path === filePath || 
      f.path.endsWith(filePath) ||
      f.name === filePath.split('/').pop()
    )
    
    if (originalFile) {
      const diff = generateDiff(originalFile.content, newContent)
      changes.push({
        filePath: originalFile.path,
        fileName: originalFile.name,
        originalContent: originalFile.content,
        newContent: newContent,
        diff: diff,
        changeType: 'modified',
        reasoning: 'AI suggested modification based on multi-file analysis'
      })
    } else {
      // New file being created
      changes.push({
        filePath: filePath,
        fileName: filePath.split('/').pop() || filePath,
        originalContent: '',
        newContent: newContent,
        diff: `+${newContent.split('\n').map((line: string) => `+${line}`).join('\n')}`,
        changeType: 'created',
        reasoning: 'AI suggested creating new file'
      })
    }
  })
  
  // Fallback: If no structured blocks found, look for file mentions
  if (changes.length === 0) {
    originalFiles.forEach(file => {
      if (response.toLowerCase().includes(file.path.toLowerCase()) || 
          response.toLowerCase().includes(file.name.toLowerCase())) {
        changes.push({
          filePath: file.path,
          fileName: file.name,
          originalContent: file.content,
          newContent: file.content, // No actual changes extracted
          diff: 'No changes detected (AI response format not recognized)',
          changeType: 'modified',
          reasoning: 'AI mentioned this file but no structured changes were found'
        })
      }
    })
  }
  
  return changes
}

function generateDiff(oldContent: string, newContent: string): string {
  // Enhanced diff generation
  if (oldContent === newContent) {
    return 'No changes detected'
  }
  
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  const maxLines = Math.max(oldLines.length, newLines.length)
  const diffLines: string[] = []
  
  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i]
    const newLine = newLines[i]
    
    if (oldLine === undefined && newLine !== undefined) {
      diffLines.push(`+${newLine}`)
    } else if (oldLine !== undefined && newLine === undefined) {
      diffLines.push(`-${oldLine}`)
    } else if (oldLine !== newLine) {
      diffLines.push(`-${oldLine}`)
      diffLines.push(`+${newLine}`)
    } else {
      diffLines.push(` ${oldLine}`)
    }
  }
  
  return diffLines.join('\n')
}
