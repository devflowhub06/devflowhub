import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      code, 
      language = 'javascript',
      projectContext,
      cursorPosition
    } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are DevFlowHub's proactive code analyzer. You automatically detect:

1. **Syntax Errors**: Missing brackets, semicolons, typos
2. **Logic Errors**: Potential runtime bugs, null references, type mismatches
3. **Performance Issues**: Inefficient operations, unnecessary computations
4. **Security Vulnerabilities**: Injection risks, insecure patterns
5. **Code Quality**: Complexity, maintainability, best practices
6. **Optimization Opportunities**: Better patterns, modern syntax

Provide actionable suggestions prioritized by:
- Critical (breaks code)
- Warning (potential issues)
- Suggestion (improvements)

Format as JSON array of issues.`

    const userPrompt = `Analyze this ${language} code for issues:

\`\`\`${language}
${code}
\`\`\`

Project Context: ${projectContext || 'No additional context'}
${cursorPosition ? `Cursor Position: Line ${cursorPosition.line + 1}, Column ${cursorPosition.character + 1}` : ''}

Provide a JSON array of detected issues in this format:
[
  {
    "type": "error" | "warning" | "suggestion",
    "severity": "critical" | "high" | "medium" | "low",
    "line": number,
    "column": number,
    "message": "clear description",
    "suggestion": "how to fix"
  }
]`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.1, // Low for accurate detection
      response_format: { type: 'json_object' }
    })

    const response = completion.choices[0]?.message?.content?.trim() || '{}'
    let issues = []
    
    try {
      const parsed = JSON.parse(response)
      issues = parsed.issues || parsed.items || []
    } catch {
      // If JSON parsing fails, try to extract issues from text
      issues = []
    }

    return NextResponse.json({
      issues,
      timestamp: new Date().toISOString(),
      analyzed: true
    })

  } catch (error) {
    console.error('Code analysis error:', error)
    return NextResponse.json({
      issues: [],
      timestamp: new Date().toISOString(),
      analyzed: false,
      error: error instanceof Error ? error.message : 'Analysis failed'
    })
  }
}

