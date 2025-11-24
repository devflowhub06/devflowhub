import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      )
    }

    // Get project files to analyze
    const files = await prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' }
    })

    // Generate mock AI suggestions based on file content
    const suggestions = []

    for (const file of files.slice(0, 3)) { // Analyze first 3 files
      const content = file.content || ''
      
      // Generate suggestions based on content patterns
      if (content.includes('console.log')) {
        suggestions.push({
          id: `suggestion-${file.id}-1`,
          type: 'refactor',
          title: 'Replace console.log with proper logging',
          description: 'Consider using a proper logging library instead of console.log for production code',
          confidence: 0.85,
          estimatedCost: 150,
          changes: [{
            path: file.path,
            op: 'edit',
            oldContent: content,
            newContent: content.replace(/console\.log\(/g, 'logger.info(')
          }]
        })
      }

      if (content.includes('function') && !content.includes('test')) {
        suggestions.push({
          id: `suggestion-${file.id}-2`,
          type: 'test',
          title: 'Add unit tests for functions',
          description: 'This file contains functions that should have unit tests',
          confidence: 0.90,
          estimatedCost: 200,
          changes: [{
            path: file.path.replace(/\.(js|ts)$/, '.test.$1'),
            op: 'add',
            newContent: `// Unit tests for ${file.path}\nimport { describe, it, expect } from 'vitest'\n\n// TODO: Add test cases`
          }]
        })
      }

      if (content.includes('for(') || content.includes('while(')) {
        suggestions.push({
          id: `suggestion-${file.id}-3`,
          type: 'optimize',
          title: 'Consider using array methods',
          description: 'Modern JavaScript array methods like map, filter, reduce are often more readable',
          confidence: 0.75,
          estimatedCost: 100,
          changes: [{
            path: file.path,
            op: 'edit',
            oldContent: content,
            newContent: content // Would contain optimized version
          }]
        })
      }

      if (content.includes('var ')) {
        suggestions.push({
          id: `suggestion-${file.id}-4`,
          type: 'fix',
          title: 'Replace var with let/const',
          description: 'Using var can cause hoisting issues. Prefer let or const',
          confidence: 0.95,
          estimatedCost: 50,
          changes: [{
            path: file.path,
            op: 'edit',
            oldContent: content,
            newContent: content.replace(/\bvar\b/g, 'const')
          }]
        })
      }
    }

    // Add some general project suggestions
    if (files.length > 0) {
      suggestions.push({
        id: 'suggestion-general-1',
        type: 'optimize',
        title: 'Add TypeScript support',
        description: 'Consider migrating to TypeScript for better type safety',
        confidence: 0.80,
        estimatedCost: 500,
        changes: [
          {
            path: 'tsconfig.json',
            op: 'add',
            newContent: JSON.stringify({
              compilerOptions: {
                target: 'ES2020',
                module: 'commonjs',
                strict: true,
                esModuleInterop: true
              }
            }, null, 2)
          }
        ]
      })

      suggestions.push({
        id: 'suggestion-general-2',
        type: 'test',
        title: 'Add ESLint configuration',
        description: 'Set up ESLint to catch common JavaScript errors',
        confidence: 0.85,
        estimatedCost: 100,
        changes: [
          {
            path: '.eslintrc.json',
            op: 'add',
            newContent: JSON.stringify({
              extends: ['eslint:recommended'],
              env: {
                browser: true,
                node: true,
                es2020: true
              },
              rules: {
                'no-console': 'warn',
                'no-unused-vars': 'error'
              }
            }, null, 2)
          }
        ]
      })
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
      totalSuggestions: suggestions.length,
      projectId
    })

  } catch (error) {
    console.error('Assistant suggestions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}