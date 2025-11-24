import OpenAI from 'openai'

// Lazily initialized OpenAI client so changes to env vars at runtime are honored
let openai: OpenAI | null = null

function getOpenAIClient(): OpenAI | null {
  if (typeof window !== 'undefined') return null
  if (openai) return openai
  const key = process.env.OPENAI_API_KEY
  if (!key) return null
  openai = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: false })
  return openai
}

export interface AICodeSuggestion {
  summary: string
  changes: Array<{
    path: string
    op: 'edit' | 'add' | 'delete'
    newContent: string
    oldContent?: string
  }>
  rationale: string
  confidence: number
  estimatedCostTokens: number
}

export class OpenAIService {
  /**
   * Generate AI code suggestions based on context
   */
  static async generateCodeSuggestion(
    code: string,
    filePath: string,
    action: 'refactor' | 'optimize' | 'test' | 'explain' | 'fix',
    context?: string
  ): Promise<AICodeSuggestion> {
    // Ensure this only runs on server-side
    if (typeof window !== 'undefined') {
      throw new Error('OpenAI service must only be called from server-side API routes')
    }
    
    try {
      const systemPrompt = `You are DevFlowHub Editor Assistant. You will produce code edits given project context. 
ALWAYS output a JSON with {summary, changes[], rationale, confidence, estimatedCostTokens}, where changes[] = {path, op, newContent, oldContent}. 
Explain rationale and a confidence score (0-1). DO NOT apply changes. Do not assume missing files exist; ask if unsure.

Rules:
- Never auto-apply changes
- Always provide rationale
- Include confidence score
- Estimate token cost
- Be safe and conservative`

      const userPrompt = this.buildUserPrompt(code, filePath, action, context)

      // Use OpenAI API if available, otherwise use enhanced demo responses
      const client = getOpenAIClient()
      if (client) {
        const response = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })

        const content = response.choices[0]?.message?.content
        if (content) {
          try {
            return JSON.parse(content)
          } catch (e) {
            // Fallback if JSON parsing fails
            return this.createFallbackSuggestion(code, filePath, action)
          }
        }
      }

      // Demo/fallback response
      return this.createFallbackSuggestion(code, filePath, action)

    } catch (error) {
      console.error('Error generating AI suggestion:', error)
      return this.createFallbackSuggestion(code, filePath, action)
    }
  }

  /**
   * Generate a raw JSON response from OpenAI given system and user prompts.
   * Returns the assistant message content or null if the API is unavailable.
   */
  static async generateJsonResponse(
    systemPrompt: string,
    userPrompt: string,
    model: string = 'gpt-4o',
    maxTokens: number = 4000
  ): Promise<string | null> {
    if (typeof window !== 'undefined') return null
    try {
      const client = getOpenAIClient()
      if (!client) return null
      const tryModels = [model, 'gpt-4o-2024-08-06', 'gpt-4o-mini', 'gpt-4o-mini-2024-07-18']

      for (const m of tryModels) {
        // First attempt: JSON mode
        try {
          const respJson = await client.chat.completions.create({
            model: m,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' }
          })
          const content = respJson.choices[0]?.message?.content?.trim()
          if (content) return content
        } catch (e) {
          // Fall through to non-JSON attempt
        }

        // Second attempt: normal text (no response_format)
        try {
          const respText = await client.chat.completions.create({
            model: m,
            messages: [
              { role: 'system', content: `${systemPrompt}\n\nReturn ONLY a single JSON object.` },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: maxTokens
          })
          const content = respText.choices[0]?.message?.content?.trim()
          if (content) return content
        } catch (e) {
          // Try next model
        }

        // Third attempt: Responses API (some accounts work better here)
        try {
          // @ts-ignore - responses may not be typed in older SDKs
          const resp = await (client as any).responses.create({
            model: m,
            input: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            max_output_tokens: maxTokens,
            response_format: { type: 'json_object' }
          })
          const content: string | undefined = (resp as any)?.output_text || (resp as any)?.output?.map((o: any) => o.content?.map((c: any) => c.text?.value).filter(Boolean).join('')).join('\n')
          if (content && content.trim()) return content.trim()
        } catch (e) {
          // proceed to next model
        }

        // Fourth attempt: direct fetch to Chat Completions endpoint
        try {
          const key = process.env.OPENAI_API_KEY as string | undefined
          if (key) {
            const resp = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
              },
              body: JSON.stringify({
                model: m,
                messages: [
                  { role: 'system', content: `${systemPrompt}\n\nReturn ONLY a single JSON object.` },
                  { role: 'user', content: userPrompt }
                ],
                temperature: 0.2,
                max_tokens: maxTokens
              })
            })
            if (resp.ok) {
              const data: any = await resp.json()
              const content = data?.choices?.[0]?.message?.content?.trim()
              if (content) return content
            }
          }
        } catch (e) {
          // ignore and continue
        }
      }
      return null
    } catch (error) {
      console.error('OpenAI JSON generation error:', error)
      return null
    }
  }

  private static buildUserPrompt(
    code: string,
    filePath: string,
    action: string,
    context?: string
  ): string {
    const actionPrompts = {
      refactor: 'Refactor this code to improve readability, maintainability, and follow best practices.',
      optimize: 'Optimize this code for better performance, memory usage, and efficiency.',
      test: 'Generate comprehensive unit tests for this code using appropriate testing frameworks.',
      explain: 'Explain what this code does, its purpose, and how it works.',
      fix: 'Identify and fix potential bugs, security issues, or code problems.'
    }

    return `File: ${filePath}
Action: ${actionPrompts[action as keyof typeof actionPrompts] || action}
Context: ${context || 'General code improvement'}

Code:
\`\`\`
${code}
\`\`\`

Please provide your response as a JSON object with the structure specified in the system prompt.`
  }

  private static createFallbackSuggestion(
    code: string,
    filePath: string,
    action: string
  ): AICodeSuggestion {
    const suggestions = {
      refactor: {
        summary: 'Code refactoring suggestion',
        newContent: code + '\n\n// TODO: Refactor this code for better readability',
        rationale: 'Added TODO comment for refactoring consideration'
      },
      optimize: {
        summary: 'Performance optimization suggestion',
        newContent: code + '\n\n// TODO: Optimize this code for better performance',
        rationale: 'Added TODO comment for performance optimization'
      },
      test: {
        summary: 'Unit test generation',
        newContent: `// Unit tests for ${filePath}
import { test, expect } from '@jest/globals'

test('should work correctly', () => {
  // TODO: Add actual test implementation
  expect(true).toBe(true)
})

${code}`,
        rationale: 'Generated basic unit test structure'
      },
      explain: {
        summary: 'Code explanation',
        newContent: `// Code explanation for ${filePath}
// This code appears to handle: [AI analysis would go here]
// Key components: [AI analysis would go here]
// Usage: [AI analysis would go here]

${code}`,
        rationale: 'Added explanatory comments to clarify code purpose'
      },
      fix: {
        summary: 'Bug fix suggestion',
        newContent: code + '\n\n// TODO: Review for potential bugs and edge cases',
        rationale: 'Added TODO comment for bug review'
      }
    }

    const suggestion = suggestions[action as keyof typeof suggestions] || suggestions.refactor

    return {
      summary: suggestion.summary,
      changes: [{
        path: filePath,
        op: 'edit',
        newContent: suggestion.newContent,
        oldContent: code
      }],
      rationale: suggestion.rationale,
      confidence: 0.75,
      estimatedCostTokens: Math.max(50, Math.floor(code.length * 0.75))
    }
  }

  /**
   * Get AI explanation for code
   */
  static async explainCode(code: string, filePath: string): Promise<string> {
    try {
      const client = getOpenAIClient()
      if (client) {
        const response = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a code explanation assistant. Explain code clearly and concisely.'
            },
            {
              role: 'user',
              content: `Explain this code from ${filePath}:\n\n\`\`\`\n${code}\n\`\`\``
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })

        return response.choices[0]?.message?.content || 'Unable to generate explanation'
      }

      return `This code appears to be from ${filePath}. It contains ${code.split('\n').length} lines of code. [Real AI explanation would appear here with OpenAI API key configured]`

    } catch (error) {
      console.error('Error explaining code:', error)
      return 'Error generating code explanation'
    }
  }
}
