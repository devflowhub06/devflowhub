import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'
import { trackAITokenUsage, extractUsageFromResponse } from '@/lib/ai-token-tracker'

console.log('🔍 OpenAI API Key loaded:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 20)}...` : 'NOT FOUND')
console.log('🔍 Full API Key:', process.env.OPENAI_API_KEY)
console.log('🔍 API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0)

// Use environment OPENAI_API_KEY
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Get user session for token tracking
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const { mode, code = '', selectedText = '', projectContext, language = 'javascript', message, projectId } = await request.json()

    if (!mode) {
      return NextResponse.json(
        { error: 'Mode is required' },
        { status: 400 }
      )
    }

    const hasCodePayload = Boolean(code && code.trim().length > 0)
    const hasMessagePayload = Boolean(message && message.trim().length > 0)

    if (mode !== 'chat' && !hasCodePayload) {
      return NextResponse.json(
        { error: 'Code is required for explain/debug/refactor modes' },
        { status: 400 }
      )
    }

    if (mode === 'chat' && !hasMessagePayload && !hasCodePayload) {
      return NextResponse.json(
        { error: 'Message or code is required for chat mode' },
        { status: 400 }
      )
    }

    let response: any = {}

    switch (mode) {
      case 'chat':
        response = await handleChat(message || '', code, projectContext, language, projectId, userId)
        break
      case 'explain':
        response = await handleExplain(code, selectedText, language, projectContext, message, projectId, userId)
        break
      case 'debug':
        response = await handleDebug(code, selectedText, language, projectContext, message, projectId, userId)
        break
      case 'refactor':
        response = await handleRefactor(code, selectedText, language, projectContext, message, projectId, userId)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid mode. Use: explain, debug, or refactor' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      mode,
      response,
      confidence: 0.8,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI assistant error:', error)
    
    return NextResponse.json({
      error: 'Failed to process assistant request',
      details: error instanceof Error ? error.message : 'Unknown error',
      mode: 'error',
      response: 'Sorry, I encountered an error. Please try again.',
      confidence: 0.0,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Helper to get context files for inspector
async function getContextFiles(projectId: string | undefined, query: string, limit: number = 5) {
  if (!projectId) return []
  
  try {
    const { RagService } = await import('@/lib/rag')
    const relevantFiles = await RagService.searchDocuments(projectId, query, limit)
    return relevantFiles.map(file => ({
      filename: file.filename,
      content: file.content,
      snippet: file.content.substring(0, 300),
      relevance: 0.8
    }))
  } catch (ragError) {
    console.error('Context files error (non-critical):', ragError)
    return []
  }
}

async function handleExplain(code: string, selectedText: string, language: string, projectContext?: string, userMessage?: string, projectId?: string, userId?: string) {
  try {
    // Enhanced: Get codebase context for better explanations
    let codebaseContext = ''
    const contextFiles = await getContextFiles(projectId, selectedText || code, 5)
    
    if (contextFiles.length > 0) {
      codebaseContext = `\n\n## Related Files in Codebase:\n${contextFiles.map(file =>
        `### ${file.filename}\n\`\`\`\n${file.content.substring(0, 500)}\n\`\`\`\n`
      ).join('\n')}`
    }

    const systemPrompt = `You are DevFlowHub's expert ${language} code explainer with deep codebase understanding. You provide comprehensive, educational explanations that help developers understand:

1. **Code Purpose**: What the code accomplishes and why
2. **Mechanisms**: How it works (algorithms, patterns, data flow)
3. **Context**: How it fits into the broader project
4. **Quality Assessment**: Code quality, best practices, and potential issues
5. **Learning Opportunities**: Key concepts and patterns worth noting

Format explanations clearly with:
- High-level overview first
- Detailed breakdown of important sections
- Code quality and best practice assessment
- Potential improvements (when relevant)
- Related concepts or patterns`

    const userPrompt = `${userMessage ? `${userMessage}\n\n` : ''}Explain the following ${language} code in detail:

\`\`\`${language}
${selectedText || code}
\`\`\`

${codebaseContext}

Project Context: ${projectContext || 'No additional context provided'}

Provide a comprehensive explanation that helps developers fully understand this code, including how it relates to other files in the codebase when relevant.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1500, // More tokens for detailed explanations
      temperature: 0.2 // Lower temperature for accurate explanations
    })

    // Track token usage
    if (userId && completion.usage) {
      await trackAITokenUsage(userId, extractUsageFromResponse(completion), {
        model: 'gpt-4o-mini',
        endpoint: '/api/editor/ai/assistant',
        projectId,
        mode: 'explain'
      })
    }

    const explanation = completion.choices[0]?.message?.content?.trim() || ''

    return {
      type: 'explanation',
      explanations: [{
        title: 'AI Code Explanation',
        content: explanation,
        details: [],
        suggestions: []
      }],
      summary: `AI-generated explanation for ${language} code using OpenAI GPT-4o-mini`,
      metadata: {
        contextFiles,
        query: selectedText || code.substring(0, 100)
      }
    }
  } catch (error) {
    console.error('Error in handleExplain:', error)
    return {
      type: 'explanation',
      explanations: [{
        title: 'Code Explanation',
        content: `This ${language} code appears to be a ${getCodeType(code)}. Here's what it does:`,
        details: ['The code follows modern programming practices'],
        suggestions: ['Add JSDoc comments for better documentation']
      }],
      summary: `Fallback explanation for ${language} code`
    }
  }
}

async function handleDebug(code: string, selectedText: string, language: string, projectContext?: string, userMessage?: string, projectId?: string, userId?: string) {
  try {
    // Enhanced: Get codebase context for better debugging
    let codebaseContext = ''
    const contextFiles = await getContextFiles(projectId, selectedText || code, 5)
    
    if (contextFiles.length > 0) {
      codebaseContext = `\n\n## Related Files for Context:\n${contextFiles.map(file =>
        `### ${file.filename}\n\`\`\`\n${file.content.substring(0, 500)}\n\`\`\`\n`
      ).join('\n')}`
    }

    const systemPrompt = `You are DevFlowHub's expert ${language} debugger with deep codebase understanding. You excel at identifying:

1. **Runtime Bugs**: Logic errors, null references, type mismatches, edge cases
2. **Performance Issues**: Inefficient algorithms, memory leaks, unnecessary computations
3. **Security Vulnerabilities**: Injection risks, XSS, insecure data handling, missing validation
4. **Code Quality**: Maintainability issues, complexity, code smells
5. **Best Practice Violations**: Anti-patterns, outdated patterns, style inconsistencies

Your analysis should be:
- Specific with line numbers when possible
- Prioritized by severity (critical → minor)
- Actionable with clear fix suggestions
- Context-aware of project patterns
- Educational (explain why it's an issue)`

    const userPrompt = `${userMessage ? `${userMessage}\n\n` : ''}Analyze and debug the following ${language} code:

\`\`\`${language}
${selectedText || code}
\`\`\`

${codebaseContext}

Project Context: ${projectContext || 'No additional context provided'}

Provide a comprehensive analysis identifying all potential issues, prioritized by severity, with specific line references and actionable fix suggestions. Consider how issues might affect related files in the codebase.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1800, // More tokens for comprehensive debug analysis
      temperature: 0.1 // Very low temperature for precise bug detection
    })

    // Track token usage
    if (userId && completion.usage) {
      await trackAITokenUsage(userId, extractUsageFromResponse(completion), {
        model: 'gpt-4o-mini',
        endpoint: '/api/editor/ai/assistant',
        projectId,
        mode: 'debug'
      })
    }

    const debugAnalysis = completion.choices[0]?.message?.content?.trim() || ''

    return {
      type: 'debug',
      issues: [{
        type: 'analysis',
        line: 0,
        message: 'AI Debug Analysis',
        suggestion: debugAnalysis
      }],
      fixes: [],
      summary: `AI-generated debug analysis for ${language} code using OpenAI GPT-4o-mini`,
      metadata: {
        contextFiles,
        query: selectedText || code.substring(0, 100)
      }
    }
  } catch (error) {
    console.error('Error in handleDebug:', error)
    return {
      type: 'debug',
      issues: [{
        type: 'warning',
        line: 1,
        message: 'Potential null reference',
        suggestion: 'Add null check before accessing properties'
      }],
      fixes: [],
      summary: 'Fallback debug analysis'
    }
  }
}

async function handleRefactor(code: string, selectedText: string, language: string, projectContext?: string, userMessage?: string, projectId?: string, userId?: string) {
  try {
    // Enhanced: Get codebase context for better refactoring
    let codebaseContext = ''
    const contextFiles = await getContextFiles(projectId, selectedText || code, 5)
    
    if (contextFiles.length > 0) {
      codebaseContext = `\n\n## Related Files for Refactoring Context:\n${contextFiles.map(file =>
        `### ${file.filename}\n\`\`\`\n${file.content.substring(0, 500)}\n\`\`\`\n`
      ).join('\n')}`
    }

    const systemPrompt = `You are DevFlowHub's expert ${language} refactoring specialist with deep codebase understanding. You transform code into:

1. **Clean Architecture**: Better structure, separation of concerns, modularity
2. **Performance**: Optimized algorithms, reduced complexity, efficient patterns
3. **Maintainability**: Readable, well-documented, follows SOLID principles
4. **Modern Patterns**: Uses latest language features, idiomatic code, best practices
5. **Quality**: Testable, debuggable, extensible code

Your refactorings should:
- Preserve functionality while improving quality
- Include clear before/after comparisons
- Explain the benefits and trade-offs
- Suggest multiple approaches when applicable
- Consider project-wide patterns and conventions`

    const userPrompt = `${userMessage ? `${userMessage}\n\n` : ''}Refactor the following ${language} code to improve quality, performance, and maintainability:

\`\`\`${language}
${selectedText || code}
\`\`\`

${codebaseContext}

Project Context: ${projectContext || 'No additional context provided'}

Provide detailed refactoring suggestions with:
1. Clear explanation of what's being improved
2. Before/after code examples
3. Benefits of the refactoring
4. How changes affect related files in the codebase
5. Potential considerations or trade-offs
6. Multiple approaches if applicable

Ensure refactored code maintains consistency with existing codebase patterns.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000, // More tokens for comprehensive refactoring examples
      temperature: 0.25 // Balanced for creative but sensible refactorings
    })

    // Track token usage
    if (userId && completion.usage) {
      await trackAITokenUsage(userId, extractUsageFromResponse(completion), {
        model: 'gpt-4o-mini',
        endpoint: '/api/editor/ai/assistant',
        projectId,
        mode: 'refactor'
      })
    }

    const refactorAnalysis = completion.choices[0]?.message?.content?.trim() || ''

    return {
      type: 'refactor',
      refactors: [{
        name: 'AI Refactoring Suggestions',
        description: 'AI-generated refactoring recommendations',
        originalCode: code,
        refactoredCode: refactorAnalysis,
        benefits: ['Improved code quality', 'Better maintainability', 'Enhanced performance'],
        confidence: 0.9
      }],
      summary: `AI-generated refactoring suggestions for ${language} code using OpenAI GPT-4o-mini`,
      metadata: {
        contextFiles,
        query: selectedText || code.substring(0, 100)
      }
    }
  } catch (error) {
    console.error('Error in handleRefactor:', error)
    return {
      type: 'refactor',
      refactors: [{
        name: 'Extract Function',
        description: 'Break down the code into smaller, reusable functions',
        originalCode: code,
        refactoredCode: code,
        benefits: ['Better readability', 'Improved testability'],
        confidence: 0.7
      }],
      summary: 'Fallback refactoring suggestions'
    }
  }
}

async function handleChat(message: string, code: string, projectContext?: string, language: string = 'javascript', projectId?: string, userId?: string) {
  try {
    // Enhanced: Search entire codebase using RAG for deep context
    let codebaseContext = ''
    const contextFiles = await getContextFiles(projectId, message, 10)
    
    if (contextFiles.length > 0) {
      codebaseContext = `\n\n## Relevant Codebase Files (${contextFiles.length} files found):\n\n` +
        contextFiles.map(file => 
          `### ${file.filename}\n\`\`\`${language}\n${file.content.substring(0, 800)}${file.content.length > 800 ? '...' : ''}\n\`\`\`\n`
        ).join('\n')
    }

    const systemPrompt = `You are DevFlowHub's expert AI pair programmer - equivalent to Cursor's AI. You have DEEP understanding of the ENTIRE codebase. You excel at:

1. **Codebase-Wide Understanding**: You understand ALL files, their relationships, imports, exports, and architecture
2. **Multi-File Reasoning**: You can reason across multiple files, understand data flow, and identify cross-file dependencies
3. **Code Intelligence**: You understand function signatures, type definitions, and code patterns across the entire project
4. **Problem Solving**: Analyzing issues across the codebase and providing solutions that consider all related files
5. **Best Practices**: Recommending patterns that work with the existing codebase structure
6. **Developer Experience**: Providing actionable, code-focused guidance with examples

Your responses should be:
- **Codebase-aware**: Reference specific files, functions, and patterns from the project
- **Actionable**: Provide specific code changes with file paths
- **Contextual**: Consider how changes affect other files
- **Educational**: Explain why your suggestions work with the existing codebase
- **Precise**: Reference line numbers, function names, and file locations when relevant

Project Context: ${projectContext || 'No additional context provided'}${codebaseContext ? '\n\n' + codebaseContext : ''}`

    const userPrompt = `${message}

${code ? `Here is the current ${language} code:

\`\`\`${language}
${code}
\`\`\`

` : ''}${projectContext ? `Additional Project Context:
${projectContext}

` : ''}Use your deep codebase understanding to provide helpful, actionable guidance. Reference specific files and functions when relevant.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1200, // Increased for more detailed responses
      temperature: 0.3 // Lower temperature for more focused, consistent responses
    })

    // Track token usage
    if (userId && completion.usage) {
      await trackAITokenUsage(userId, extractUsageFromResponse(completion), {
        model: 'gpt-4o-mini',
        endpoint: '/api/editor/ai/assistant',
        projectId,
        mode: 'chat'
      })
    }

    const chatReply = completion.choices[0]?.message?.content?.trim() || 'I could not generate a response.'

    return {
      type: 'chat',
      message: chatReply,
      summary: chatReply,
      metadata: {
        contextFiles,
        query: message.substring(0, 100)
      }
    }
  } catch (error) {
    console.error('Error in handleChat:', error)
    return {
      type: 'chat',
      message: 'I had trouble responding. Please try again.',
      summary: 'Chat fallback response'
    }
  }
}

function getCodeType(code: string): string {
  if (code.includes('function') || code.includes('=>')) return 'function'
  if (code.includes('class')) return 'class'
  if (code.includes('import') || code.includes('export')) return 'module'
  if (code.includes('if') || code.includes('for') || code.includes('while')) return 'control flow'
  return 'code block'
}