import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Use environment OPENAI_API_KEY
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      files, 
      projectContext,
      mode = 'edit' // edit, refactor, add-feature, fix-bug
    } = await request.json()

    if (!prompt || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Prompt and files array are required' },
        { status: 400 }
      )
    }

    // Build context for the AI
    const fileContents = files.map(file => 
      `File: ${file.path}\n\`\`\`${file.language || 'javascript'}\n${file.content}\n\`\`\``
    ).join('\n\n')

    const systemPrompt = `You are an expert software developer. ${getModeInstructions(mode)}

IMPORTANT RULES:
1. Return ONLY a JSON object with this exact structure:
{
  "files": [
    {
      "path": "file/path.js",
      "content": "new file content",
      "action": "modify|create|delete"
    }
  ],
  "explanation": "Brief explanation of changes",
  "confidence": 0.95
}

2. For each file, provide the COMPLETE new content, not just diffs
3. Use "modify" for existing files, "create" for new files, "delete" for removed files
4. Maintain code style and formatting
5. Include proper imports and exports
6. Add helpful comments where appropriate`

    const userPrompt = `Project Context: ${projectContext || 'No additional context'}

Current Files:
${fileContents}

User Request: ${prompt}

Please analyze the request and provide the necessary file changes. Return the JSON response as specified.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.1,
      stream: false,
    })

    const response = completion.choices[0]?.message?.content?.trim()
    
    if (!response) {
      throw new Error('No response from AI')
    }

    // Parse the JSON response
    let aiResponse
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      throw new Error('Invalid JSON response from AI')
    }

    // Validate the response structure
    if (!aiResponse.files || !Array.isArray(aiResponse.files)) {
      throw new Error('Invalid response structure')
    }

    // Generate diffs for each file
    const filesWithDiffs = aiResponse.files.map((file: any) => {
      const originalFile = files.find(f => f.path === file.path)
      const diff = originalFile ? generateDiff(originalFile.content, file.content) : null
      
      return {
        ...file,
        diff,
        originalContent: originalFile?.content || null
      }
    })

    return NextResponse.json({
      files: filesWithDiffs,
      explanation: aiResponse.explanation || 'AI-generated changes',
      confidence: aiResponse.confidence || 0.8,
      mode
    })

  } catch (error) {
    console.error('AI edit error:', error)
    
    return NextResponse.json({
      error: 'Failed to generate AI edits',
      details: error instanceof Error ? error.message : 'Unknown error',
      files: [],
      explanation: 'Error occurred while processing your request',
      confidence: 0
    }, { status: 500 })
  }
}

function getModeInstructions(mode: string): string {
  switch (mode) {
    case 'refactor':
      return 'Refactor the code to improve structure, readability, and maintainability while preserving functionality.'
    case 'add-feature':
      return 'Add the requested feature by creating or modifying files as needed. Ensure proper integration with existing code.'
    case 'fix-bug':
      return 'Identify and fix bugs in the code. Focus on correctness and robustness.'
    case 'explain':
      return 'Explain the code and suggest improvements with detailed comments.'
    default:
      return 'Make the requested changes to the codebase.'
  }
}

function generateDiff(original: string, modified: string): string {
  const originalLines = original.split('\n')
  const modifiedLines = modified.split('\n')
  
  const diff: string[] = []
  const maxLines = Math.max(originalLines.length, modifiedLines.length)
  
  for (let i = 0; i < maxLines; i++) {
    const originalLine = originalLines[i] || ''
    const modifiedLine = modifiedLines[i] || ''
    
    if (originalLine === modifiedLine) {
      diff.push(`  ${originalLine}`)
    } else if (originalLine && !modifiedLine) {
      diff.push(`- ${originalLine}`)
    } else if (!originalLine && modifiedLine) {
      diff.push(`+ ${modifiedLine}`)
    } else {
      diff.push(`- ${originalLine}`)
      diff.push(`+ ${modifiedLine}`)
    }
  }
  
  return diff.join('\n')
}
