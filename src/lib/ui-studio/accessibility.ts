export interface AccessibilityIssue {
  id: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string
  help: string
  helpUrl: string
  nodes: Array<{
    target: string[]
    html: string
    failureSummary?: string
  }>
}

export interface AccessibilityResult {
  score: number
  issues: Array<{
    severity: 'critical' | 'serious' | 'moderate' | 'minor'
    description: string
    suggestion: string
    count: number
  }>
  summary: {
    total: number
    critical: number
    serious: number
    moderate: number
    minor: number
  }
}

export class AccessibilityChecker {
  /**
   * Run accessibility checks on generated component code
   */
  static async checkComponentAccessibility(componentCode: string): Promise<AccessibilityResult> {
    // For MVP, we'll do static analysis of the code
    // In production, this would use axe-core to test the actual rendered component
    
    const issues: Array<{
      severity: 'critical' | 'serious' | 'moderate' | 'minor'
      description: string
      suggestion: string
      count: number
    }> = []

    // Check for common accessibility issues in the code
    const checks = [
      {
        pattern: /<button[^>]*>/g,
        test: (match: string) => !match.includes('aria-label') && !match.includes('aria-describedby'),
        issue: {
          severity: 'moderate' as const,
          description: 'Button missing accessible label',
          suggestion: 'Add aria-label or ensure button has descriptive text content'
        }
      },
      {
        pattern: /<input[^>]*>/g,
        test: (match: string) => !match.includes('aria-label') && !match.includes('aria-labelledby'),
        issue: {
          severity: 'serious' as const,
          description: 'Input missing accessible label',
          suggestion: 'Add aria-label or associate with a label element using aria-labelledby'
        }
      },
      {
        pattern: /<img[^>]*>/g,
        test: (match: string) => !match.includes('alt='),
        issue: {
          severity: 'critical' as const,
          description: 'Image missing alt attribute',
          suggestion: 'Add alt attribute with descriptive text or empty string for decorative images'
        }
      },
      {
        pattern: /<div[^>]*role=["']button["'][^>]*>/g,
        test: (match: string) => !match.includes('tabindex='),
        issue: {
          severity: 'serious' as const,
          description: 'Button role missing keyboard accessibility',
          suggestion: 'Add tabindex="0" to make the element keyboard focusable'
        }
      },
      {
        pattern: /<div[^>]*role=["']button["'][^>]*>/g,
        test: (match: string) => !match.includes('onKeyDown') && !match.includes('onKeyPress'),
        issue: {
          severity: 'moderate' as const,
          description: 'Button role missing keyboard event handlers',
          suggestion: 'Add onKeyDown handler to support Enter and Space key activation'
        }
      },
      {
        pattern: /<button[^>]*disabled[^>]*>/g,
        test: (match: string) => !match.includes('aria-disabled'),
        issue: {
          severity: 'minor' as const,
          description: 'Disabled button missing aria-disabled',
          suggestion: 'Add aria-disabled="true" for better screen reader support'
        }
      },
      {
        pattern: /<input[^>]*required[^>]*>/g,
        test: (match: string) => !match.includes('aria-required'),
        issue: {
          severity: 'moderate' as const,
          description: 'Required input missing aria-required',
          suggestion: 'Add aria-required="true" for better screen reader support'
        }
      },
      {
        pattern: /<div[^>]*role=["']alert["'][^>]*>/g,
        test: (match: string) => !match.includes('aria-live'),
        issue: {
          severity: 'moderate' as const,
          description: 'Alert role missing aria-live',
          suggestion: 'Add aria-live="polite" or aria-live="assertive" for live regions'
        }
      },
      {
        pattern: /<img[^>]*alt="[^"]*"[^>]*>/g,
        test: (match: string) => match.includes('alt=""'),
        issue: {
          severity: 'moderate' as const,
          description: 'Image has empty alt attribute',
          suggestion: 'Provide meaningful alt text or use alt="" for decorative images'
        }
      },
      {
        pattern: /<h([1-6])[^>]*>/g,
        // Per-match check: flag any heading that is not h1; avoids aggregate array.map usage
        test: (match: string) => {
          const level = parseInt(match.match(/<h([1-6])/i)?.[1] || '0')
          return level !== 1
        },
        issue: {
          severity: 'moderate' as const,
          description: 'Page should start with h1 heading',
          suggestion: 'Use h1 for the main page heading'
        }
      },
      {
        pattern: /<table[^>]*>/g,
        // Per-match check: if any table exists and no headers are present in overall code
        test: () => {
          const hasHeaders = componentCode.includes('<th') || componentCode.includes('aria-label=')
          return !hasHeaders
        },
        issue: {
          severity: 'serious' as const,
          description: 'Table missing proper headers',
          suggestion: 'Use <th> elements or add aria-label for table headers'
        }
      },
      {
        pattern: /<ul[^>]*>|<ol[^>]*>/g,
        // Per-match check: if any list exists and there are no <li> items in overall code
        test: () => {
          const hasListItems = componentCode.includes('<li')
          return !hasListItems
        },
        issue: {
          severity: 'critical' as const,
          description: 'List missing list items',
          suggestion: 'Add <li> elements inside <ul> or <ol>'
        }
      },
      {
        pattern: /text-gray-[4-5]00/g,
        test: () => true,
        issue: {
          severity: 'minor' as const,
          description: 'Text color may have insufficient contrast',
          suggestion: 'Use darker text colors for better accessibility'
        }
      },
      {
        pattern: /focus:/g,
        test: (match: string) => !componentCode.includes('focus-visible:'),
        issue: {
          severity: 'minor' as const,
          description: 'Consider using focus-visible for better focus indicators',
          suggestion: 'Use focus-visible: instead of focus: for keyboard-only focus'
        }
      },
      {
        pattern: /<div[^>]*onClick[^>]*>/g,
        test: (match: string) => !match.includes('onKeyDown') && !match.includes('onKeyPress'),
        issue: {
          severity: 'moderate' as const,
          description: 'Interactive div missing keyboard support',
          suggestion: 'Add onKeyDown handler or use button element'
        }
      },
      {
        pattern: /<main[^>]*>/g,
        test: (matches: string[]) => {
          const hasSkipLink = componentCode.includes('skip') || componentCode.includes('Skip')
          return matches.length > 0 && !hasSkipLink
        },
        issue: {
          severity: 'minor' as const,
          description: 'Consider adding skip links for keyboard navigation',
          suggestion: 'Add skip links to help keyboard users navigate quickly'
        }
      }
    ]

    // Run all checks
    checks.forEach(check => {
      const matches = componentCode.match(check.pattern)
      if (matches) {
        matches.forEach(match => {
          if (check.test(match)) {
            const existingIssue = issues.find(issue => issue.description === check.issue.description)
            if (existingIssue) {
              existingIssue.count++
            } else {
              issues.push({
                ...check.issue,
                count: 1
              })
            }
          }
        })
      }
    })

    // Calculate score
    const summary = {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      serious: issues.filter(i => i.severity === 'serious').length,
      moderate: issues.filter(i => i.severity === 'moderate').length,
      minor: issues.filter(i => i.severity === 'minor').length
    }

    // Calculate accessibility score (0-100)
    let score = 100
    score -= summary.critical * 25  // Critical issues heavily impact score
    score -= summary.serious * 15   // Serious issues significantly impact score
    score -= summary.moderate * 8   // Moderate issues moderately impact score
    score -= summary.minor * 3      // Minor issues slightly impact score

    score = Math.max(0, Math.min(100, score))

    return {
      score,
      issues,
      summary
    }
  }

  /**
   * Get accessibility recommendations for improvement
   */
  static getAccessibilityRecommendations(): Array<{
    category: string
    recommendations: string[]
  }> {
    return [
      {
        category: 'Semantic HTML',
        recommendations: [
          'Use semantic HTML elements (button, input, label, etc.) instead of divs with roles',
          'Ensure proper heading hierarchy (h1, h2, h3, etc.)',
          'Use list elements (ul, ol, li) for lists and menus'
        ]
      },
      {
        category: 'Keyboard Navigation',
        recommendations: [
          'Ensure all interactive elements are keyboard accessible',
          'Provide visible focus indicators',
          'Implement proper tab order',
          'Support keyboard shortcuts for common actions'
        ]
      },
      {
        category: 'Screen Reader Support',
        recommendations: [
          'Provide descriptive text for images using alt attributes',
          'Use aria-label for elements without visible text',
          'Associate labels with form controls',
          'Provide context with aria-describedby'
        ]
      },
      {
        category: 'Visual Design',
        recommendations: [
          'Ensure sufficient color contrast (4.5:1 for normal text)',
          'Don\'t rely solely on color to convey information',
          'Provide multiple ways to identify interactive elements',
          'Ensure text is readable at different zoom levels'
        ]
      },
      {
        category: 'Interactive Elements',
        recommendations: [
          'Provide clear feedback for user actions',
          'Use consistent interaction patterns',
          'Ensure touch targets are at least 44px',
          'Provide loading states for async operations'
        ]
      }
    ]
  }

  /**
   * Generate accessibility improvements for a component
   */
  static generateAccessibilityImprovements(
    componentCode: string,
    issues: AccessibilityResult
  ): string[] {
    const improvements: string[] = []

    issues.issues.forEach(issue => {
      switch (issue.description) {
        case 'Button missing accessible label':
          improvements.push('Add aria-label or ensure button has descriptive text content')
          break
        case 'Input missing accessible label':
          improvements.push('Add aria-label or associate with a label element')
          break
        case 'Image missing alt attribute':
          improvements.push('Add alt attribute with descriptive text')
          break
        case 'Button role missing keyboard accessibility':
          improvements.push('Add tabindex="0" and keyboard event handlers')
          break
        case 'Disabled button missing aria-disabled':
          improvements.push('Add aria-disabled="true" for better screen reader support')
          break
        case 'Required input missing aria-required':
          improvements.push('Add aria-required="true" for better screen reader support')
          break
        default:
          improvements.push(issue.suggestion)
      }
    })

    return improvements
  }
}
