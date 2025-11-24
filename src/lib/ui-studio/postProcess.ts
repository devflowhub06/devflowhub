import prettier from 'prettier'

export interface PostProcessResult {
  formattedCode: string
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    message: string
    line?: number
    column?: number
  }>
  suggestions: string[]
}

export class PostProcessor {
  /**
   * Post-process generated component code
   */
  static async processComponentCode(code: string): Promise<PostProcessResult> {
    const issues: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      line?: number
      column?: number
    }> = []

    const suggestions: string[] = []

    try {
      // 1. Format code with Prettier
      const formattedCode = await this.formatCode(code)

      // 2. Run basic static analysis
      const analysisIssues = this.analyzeCode(formattedCode)
      issues.push(...analysisIssues)

      // 3. Generate suggestions for improvement
      const codeSuggestions = this.generateSuggestions(formattedCode)
      suggestions.push(...codeSuggestions)

      return {
        formattedCode,
        issues,
        suggestions
      }

    } catch (error) {
      issues.push({
        type: 'error',
        message: `Post-processing failed: ${(error as Error).message}`
      })

      return {
        formattedCode: code,
        issues,
        suggestions
      }
    }
  }

  /**
   * Format code with Prettier
   */
  private static async formatCode(code: string): Promise<string> {
    try {
      const formatted = await prettier.format(code, {
        parser: 'typescript',
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        tabWidth: 2,
        printWidth: 80,
        jsxSingleQuote: true,
        arrowParens: 'avoid'
      })

      return formatted
    } catch (error) {
      console.warn('Prettier formatting failed:', error)
      return code
    }
  }

  /**
   * Run basic static analysis on the code
   */
  private static analyzeCode(code: string): Array<{
    type: 'error' | 'warning' | 'info'
    message: string
    line?: number
    column?: number
  }> {
    const issues: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      line?: number
      column?: number
    }> = []

    const lines = code.split('\n')

    // Check for common issues
    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // Check for console.log statements
      if (line.includes('console.log')) {
        issues.push({
          type: 'warning',
          message: 'Remove console.log statements in production code',
          line: lineNumber
        })
      }

      // Check for TODO comments
      if (line.includes('TODO') || line.includes('FIXME')) {
        issues.push({
          type: 'info',
          message: 'Consider addressing TODO/FIXME comments',
          line: lineNumber
        })
      }

      // Check for hardcoded values
      if (line.includes('http://') && !line.includes('localhost')) {
        issues.push({
          type: 'warning',
          message: 'Consider using environment variables for URLs',
          line: lineNumber
        })
      }

      // Check for accessibility issues
      if (line.includes('<img') && !line.includes('alt=')) {
        issues.push({
          type: 'warning',
          message: 'Images should have alt attributes for accessibility',
          line: lineNumber
        })
      }

      if (line.includes('<button') && !line.includes('aria-')) {
        issues.push({
          type: 'info',
          message: 'Consider adding ARIA attributes for better accessibility',
          line: lineNumber
        })
      }

      // Check for React best practices
      if (line.includes('useEffect') && line.includes('[]') && line.includes('fetch')) {
        issues.push({
          type: 'info',
          message: 'Consider adding error handling and loading states for fetch calls',
          line: lineNumber
        })
      }

      // Check for Tailwind classes
      if (line.includes('className=') && line.includes('bg-') && line.includes('text-')) {
        // This is good - has background and text colors
      } else if (line.includes('className=') && line.includes('bg-') && !line.includes('text-')) {
        issues.push({
          type: 'warning',
          message: 'Consider adding text color classes for better contrast',
          line: lineNumber
        })
      }
    })

    // Check for missing imports
    if (code.includes('useState') && !code.includes("import { useState }")) {
      issues.push({
        type: 'error',
        message: 'Missing React useState import'
      })
    }

    if (code.includes('useEffect') && !code.includes("import { useEffect }")) {
      issues.push({
        type: 'error',
        message: 'Missing React useEffect import'
      })
    }

    // Check for TypeScript interface usage
    if (code.includes('interface') && !code.includes('export')) {
      issues.push({
        type: 'info',
        message: 'Consider exporting TypeScript interfaces for reusability'
      })
    }

    return issues
  }

  /**
   * Generate suggestions for code improvement
   */
  private static generateSuggestions(code: string): string[] {
    const suggestions: string[] = []

    // Performance suggestions
    if (code.includes('useEffect') && code.includes('[]')) {
      suggestions.push('Consider memoizing expensive calculations with useMemo')
    }

    if (code.includes('onClick') && code.includes('=>')) {
      suggestions.push('Consider using useCallback to memoize event handlers')
    }

    // Accessibility suggestions
    if (code.includes('<div') && code.includes('onClick')) {
      suggestions.push('Consider using semantic HTML elements (button, link) instead of div for clickable elements')
    }

    if (code.includes('className=') && !code.includes('focus:')) {
      suggestions.push('Add focus styles for keyboard navigation accessibility')
    }

    // Code organization suggestions
    if (code.length > 1000) {
      suggestions.push('Consider breaking this component into smaller, more focused components')
    }

    if (code.includes('const') && code.includes('=') && !code.includes('interface')) {
      suggestions.push('Consider adding TypeScript interfaces for better type safety')
    }

    // Styling suggestions
    if (code.includes('className=') && !code.includes('hover:')) {
      suggestions.push('Add hover states for better user interaction feedback')
    }

    if (code.includes('className=') && !code.includes('sm:') && !code.includes('md:')) {
      suggestions.push('Consider adding responsive design classes for mobile devices')
    }

    // Security suggestions
    if (code.includes('dangerouslySetInnerHTML')) {
      suggestions.push('Be cautious with dangerouslySetInnerHTML - ensure content is sanitized')
    }

    if (code.includes('eval(') || code.includes('new Function')) {
      suggestions.push('Avoid using eval() or new Function() for security reasons')
    }

    return suggestions
  }

  /**
   * Validate component structure
   */
  static validateComponentStructure(code: string): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for React component structure
    if (!code.includes('export function') && !code.includes('export const')) {
      errors.push('Component should be exported as a function')
    }

    if (!code.includes('return') || !code.includes('(')) {
      errors.push('Component should return JSX')
    }

    // Check for TypeScript
    if (!code.includes('interface') && code.includes('props')) {
      warnings.push('Consider adding TypeScript interfaces for props')
    }

    // Check for accessibility
    if (!code.includes('aria-') && (code.includes('<button') || code.includes('<input'))) {
      warnings.push('Consider adding ARIA attributes for accessibility')
    }

    // Check for Tailwind usage
    if (!code.includes('className=')) {
      warnings.push('Consider using Tailwind CSS classes for styling')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Optimize bundle size
   */
  static analyzeBundleSize(code: string): {
    estimatedSize: number
    optimizationSuggestions: string[]
    metrics: {
      lines: number
      characters: number
      imports: number
      functions: number
      classes: number
      jsxElements: number
      complexity: 'low' | 'medium' | 'high'
    }
  } {
    const lines = code.split('\n').length
    const characters = code.length
    const imports = (code.match(/import\s+.*?from\s+['"][^'"]+['"]/g) || []).length
    const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length
    const classes = (code.match(/class\s+\w+/g) || []).length
    const jsxElements = (code.match(/<[A-Z]\w*[^>]*>/g) || []).length
    
    // Calculate complexity score
    const complexityScore = lines * 0.1 + functions * 2 + classes * 3 + jsxElements * 0.5
    const complexity: 'low' | 'medium' | 'high' = 
      complexityScore < 20 ? 'low' : 
      complexityScore < 50 ? 'medium' : 'high'
    
    // More sophisticated size estimation
    const baseSize = new Blob([code]).size
    const estimatedSize = Math.round(baseSize * (1 + (complexityScore / 100)))
    
    const optimizationSuggestions: string[] = []

    // Check for large dependencies
    if (code.includes('import') && code.includes('lodash')) {
      optimizationSuggestions.push('Consider importing specific lodash functions instead of the entire library')
    }

    if (code.includes('import') && code.includes('moment')) {
      optimizationSuggestions.push('Consider using date-fns or native Date API instead of moment.js for smaller bundle size')
    }

    // Check for unused imports
    const importMatches = code.match(/import.*from/g) || []
    const usedImports = importMatches.filter(imp => {
      const importName = imp.match(/import\s+{\s*([^}]+)\s*}/)?.[1]
      if (importName) {
        return code.includes(importName.split(',')[0].trim())
      }
      return true
    })

    if (importMatches.length !== usedImports.length) {
      optimizationSuggestions.push('Remove unused imports to reduce bundle size')
    }

    // Check for inline styles
    if (code.includes('style=') && !code.includes('className=')) {
      optimizationSuggestions.push('Consider using Tailwind classes instead of inline styles for better performance')
    }

    // Performance-specific suggestions
    if (functions > 8) {
      optimizationSuggestions.push('Consider breaking down into smaller, more focused components')
    }

    if (jsxElements > 15) {
      optimizationSuggestions.push('Consider extracting complex JSX into separate components')
    }

    if (code.includes('useEffect') && !code.includes('useCallback') && !code.includes('useMemo')) {
      optimizationSuggestions.push('Consider using useCallback and useMemo for performance optimization')
    }

    if (code.includes('map(') && !code.includes('key=')) {
      optimizationSuggestions.push('Add key prop to mapped elements for better React performance')
    }

    if (code.includes('onClick') && code.includes('onChange') && !code.includes('useCallback')) {
      optimizationSuggestions.push('Consider memoizing event handlers with useCallback')
    }

    if (complexity === 'high') {
      optimizationSuggestions.push('Component has high complexity - consider refactoring into smaller pieces')
    }

    if (estimatedSize > 5000) {
      optimizationSuggestions.push('Component is large - consider code splitting or lazy loading')
    }

    return {
      estimatedSize,
      optimizationSuggestions,
      metrics: {
        lines,
        characters,
        imports,
        functions,
        classes,
        jsxElements,
        complexity
      }
    }
  }
}
