import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Use environment variable for API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      code,
      testFramework = 'jest', // jest, vitest, mocha
      language = 'javascript',
      projectContext,
      testType = 'unit' // unit, integration, e2e
    } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an expert ${language} developer and testing specialist.
Generate comprehensive ${testType} tests using ${testFramework}.

IMPORTANT RULES:
1. Return ONLY a JSON object with this exact structure:
{
  "testFile": "path/to/test/file.test.js",
  "testCode": "complete test file content",
  "setupInstructions": "npm install commands and setup steps",
  "testCases": [
    {
      "name": "test case description",
      "type": "unit|integration|e2e",
      "coverage": "what this test covers"
    }
  ],
  "explanation": "brief explanation of the tests"
}

2. Generate tests that cover:
   - Happy path scenarios
   - Edge cases and error conditions
   - Input validation
   - Boundary conditions
   - Integration points

3. Use modern testing practices:
   - Descriptive test names
   - Arrange-Act-Assert pattern
   - Proper mocking where needed
   - Good assertions

4. Include proper imports and setup
5. Make tests maintainable and readable`

    const userPrompt = `Language: ${language}
Test Framework: ${testFramework}
Test Type: ${testType}

Project Context: ${projectContext || 'No additional context'}

Code to test:
\`\`\`${language}
${code}
\`\`\`

Please generate comprehensive tests for this code.`

    // Use real OpenAI API for test generation
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
      max_tokens: 2000,
      temperature: 0.2,
      stream: false
    })

    const testCode = completion.choices[0]?.message?.content?.trim() || ''

    return NextResponse.json({
      testFile: 'test.test.js',
      testCode: testCode,
      setupInstructions: `npm install ${testFramework} --save-dev`,
      testCases: ['AI-generated test cases'],
      explanation: 'AI-generated tests using OpenAI GPT-4o-mini',
      framework: testFramework,
      language,
      testType,
      confidence: 0.9,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI test generation error:', error)
    
    return NextResponse.json({
      error: 'Failed to generate tests',
      details: error instanceof Error ? error.message : 'Unknown error',
      testFile: 'test.test.js',
      testCode: generateFallbackTest(requestBody.code, testFramework, language),
      setupInstructions: `npm install ${testFramework} --save-dev`,
      testCases: [],
      explanation: 'Fallback test generated due to error',
      framework: testFramework,
      language,
      testType,
      confidence: 0.3,
      fallback: true
    }, { status: 500 })
  }
}

function generateFallbackTest(code: string, framework: string, language: string): string {
  const isReact = code.includes('React') || code.includes('jsx')
  const isFunction = code.includes('function') || code.includes('=>')
  
  if (isReact) {
    return `import React from 'react'
import { render, screen } from '@testing-library/react'
import Component from './Component'

describe('Component', () => {
  test('renders without crashing', () => {
    render(<Component />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})`
  }
  
  if (isFunction) {
    return `import { functionName } from './module'

describe('functionName', () => {
  test('should work correctly', () => {
    const result = functionName()
    expect(result).toBeDefined()
  })
})`
  }
  
  return `// Basic test template
describe('Module', () => {
  test('should work', () => {
    expect(true).toBe(true)
  })
})`
}
