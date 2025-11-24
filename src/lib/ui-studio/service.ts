import { OpenAIService } from '@/lib/ai/openai-service'
import { PostProcessor } from './postProcess'
import { AccessibilityChecker } from './accessibility'

export interface ComponentGenerationRequest {
  projectId: string
  prompt: string
  variants: number
  styleHints: Record<string, any>
  themeHints: Record<string, any>
  projectContext: {
    framework?: string
    tailwindConfig?: any
  }
}

export interface ComponentGenerationResult {
  name: string
  code: string
  props: Array<{
    name: string
    type: string
    default?: any
    description: string
    required?: boolean
  }>
  variants: Array<{
    name: string
    code: string
    previewProps: Record<string, any>
    description: string
  }>
  story: string
  test: string
  previewHtml: string
  sandpackFiles: Record<string, string>
  rationale: string
  confidence: number
  actualCost: number
  tokensUsed: number
  processingTime: number
  accessibility: {
    score: number
    issues: Array<{
      severity: 'critical' | 'serious' | 'moderate' | 'minor'
      description: string
      suggestion: string
    }>
  }
}

export interface UserQuota {
  daily: {
    limit: number
    used: number
    remaining: number
  }
  monthly: {
    limit: number
    used: number
    remaining: number
  }
  exceeded: boolean
}

export class UIStudioService {
  /**
   * Estimate the cost of component generation
   */
  static estimateGenerationCost(prompt: string, variants: number): number {
    const baseTokens = Math.min(prompt.length * 1.5, 2000) // Rough token estimate
    const variantMultiplier = Math.max(variants, 1)
    const totalTokens = baseTokens * variantMultiplier
    
    // GPT-4 pricing: ~$0.03 per 1K tokens (input) + $0.06 per 1K tokens (output)
    const estimatedOutputTokens = totalTokens * 3 // Components generate more output
    const inputCost = (totalTokens / 1000) * 0.03
    const outputCost = (estimatedOutputTokens / 1000) * 0.06
    
    return Math.round((inputCost + outputCost) * 100) / 100
  }

  /**
   * Check user's generation quota
   */
  static async checkUserQuota(userId: string): Promise<UserQuota> {
    // For MVP, implement simple limits
    // In production, this would check actual usage from database
    
    return {
      daily: {
        limit: 50, // Free tier: 50 generations per day
        used: 12,  // Mock usage
        remaining: 38
      },
      monthly: {
        limit: 500, // Free tier: 500 generations per month
        used: 145,  // Mock usage
        remaining: 355
      },
      exceeded: false
    }
  }

  /**
   * Extract Tailwind configuration from project files
   */
  static extractTailwindConfig(files: Array<{ path: string; content: string }>): any {
    const tailwindFile = files.find(f => 
      f.path.includes('tailwind.config') || f.path.includes('tailwind.js')
    )
    
    if (!tailwindFile) {
      return {
        theme: {
          colors: {
            primary: '#3b82f6',
            secondary: '#64748b',
            accent: '#f59e0b'
          }
        }
      }
    }

    try {
      // Simple extraction - in production, use proper JS parser
      const content = tailwindFile.content
      return {
        theme: {
          colors: {
            primary: '#3b82f6',
            secondary: '#64748b', 
            accent: '#f59e0b'
          },
          // Add more theme extraction logic here
        }
      }
    } catch (error) {
      console.warn('Failed to parse Tailwind config:', error)
      return {}
    }
  }

  /**
   * Generate a React component using AI
   */
  static async generateComponent(request: ComponentGenerationRequest): Promise<ComponentGenerationResult> {
    const startTime = Date.now()
    
    try {
      // Build sophisticated system prompt for UI generation
      const systemPrompt = `You are "DevFlowHub UI Studio", the world's most advanced AI component generator. You create production-ready, accessible, beautiful React + TypeScript + Tailwind components that rival the best design systems.

CRITICAL REQUIREMENTS:
- Generate MODERN, BEAUTIFUL components with excellent UX
- Use TypeScript with proper interfaces and type safety
- Follow Tailwind CSS best practices with responsive design
- Include comprehensive ARIA attributes for accessibility
- Add smooth animations and micro-interactions
- Follow shadcn/ui design patterns and conventions
- Ensure components are fully responsive and mobile-friendly
- Include proper error states and loading states
- Add hover, focus, active, and disabled states
- Use modern React patterns (hooks, proper state management)

DESIGN PRINCIPLES:
- Clean, minimalist design with excellent spacing
- Consistent color schemes and typography
- Smooth transitions and subtle animations
- Professional shadows and borders
- Accessible contrast ratios and touch targets
- Modern glassmorphism or neumorphism effects where appropriate

Return ONLY a valid JSON object with this exact structure:
{
  "name": "ComponentName",
  "code": "// Complete, beautiful TSX component code with proper imports",
  "props": [{"name":"text","type":"string","default":"Button","description":"Button text","required":false}],
  "variants": [{"name":"primary","code":"// variant code","previewProps":{"variant":"primary"},"description":"Primary style"}],
  "story": "// Complete Storybook story with all variants",
  "test": "// Comprehensive Jest + RTL test suite", 
  "previewHtml": "// Beautiful HTML preview with proper styling",
  "rationale": "Detailed explanation of design decisions and features",
  "confidence": 0.95
}

Project context: ${JSON.stringify(request.projectContext, null, 2)}

Remember: This component will be used in production applications. Make it exceptional!`

      const userPrompt = `Generate an EXCEPTIONAL component: ${request.prompt}

DETAILED REQUIREMENTS:
- Create ${request.variants} beautiful variants (size/color/state/style variations)
- Use modern Tailwind classes with excellent design aesthetics
- Include comprehensive TypeScript interfaces with proper typing
- Add full accessibility support (ARIA labels, roles, keyboard navigation, screen reader support)
- Generate a complete Storybook story showcasing all variants
- Create comprehensive Jest + React Testing Library tests
- Ensure perfect responsive design (mobile-first approach)
- Include smooth hover/focus/active/disabled state transitions
- Add subtle animations and micro-interactions
- Follow modern design trends (glassmorphism, gradients, shadows)
- Use consistent spacing and typography scales
- Include proper loading and error states
- Add support for dark/light themes
- Ensure touch-friendly design for mobile devices

DESIGN QUALITY:
- Make it look like it belongs in a premium design system
- Use modern color palettes and gradients
- Add subtle shadows and depth
- Include smooth transitions and hover effects
- Ensure excellent visual hierarchy
- Make it feel polished and professional

Style hints: ${JSON.stringify(request.styleHints)}
Theme hints: ${JSON.stringify(request.themeHints)}

Return the JSON object as specified in the system prompt. Make this component exceptional!`

      // Call AI service (enhanced for UI generation)
      const aiResult = await this.callAIForUIGeneration(systemPrompt, userPrompt)
      
      // Post-process the generated component
      const normalized = this.normalizeAIResult(aiResult)
      const processedResult = await this.postProcessComponent(normalized, request)
      
      const processingTime = Date.now() - startTime
      
      return {
        ...processedResult,
        actualCost: this.estimateGenerationCost(request.prompt, request.variants),
        tokensUsed: Math.floor(request.prompt.length * 1.5 + 3000), // Estimate
        processingTime
      }

    } catch (error) {
      console.error('Component generation failed:', error)
      throw new Error(`Generation failed: ${(error as Error).message}`)
    }
  }

  /**
   * Call AI service for UI generation with enhanced prompts
   */
  private static async callAIForUIGeneration(systemPrompt: string, userPrompt: string): Promise<any> {
    try {
      // Check if we should use real AI or demo mode
      // Enable real AI whenever an API key is present (including development)
      const useRealAI = !!process.env.OPENAI_API_KEY
      
      if (useRealAI) {
        // Real AI generation using generic JSON generator
        const raw = await OpenAIService.generateJsonResponse(systemPrompt, userPrompt, 'gpt-4o', 6000)
        if (!raw) {
          throw new Error('Empty response from OpenAI')
        }
        // With response_format: json_object, content should be pure JSON
        try {
          return JSON.parse(raw)
        } catch (jsonErr) {
          // As a fallback, try to extract first JSON object and parse
          const match = raw.match(/\{[\s\S]*\}/)
          if (match) {
            return JSON.parse(match[0])
          }
          throw new Error('OpenAI returned non-JSON content')
        }
      } else {
        // Enhanced demo mode with more realistic responses
        return this.getEnhancedDemoComponent(userPrompt)
      }
    } catch (error) {
      // Surface the error so the route can report failure instead of silently returning demo content
      throw error
    }
  }

  /**
   * Get enhanced demo component with more realistic data
   */
  private static getEnhancedDemoComponent(prompt: string): any {
    // Analyze prompt to determine component type with more sophisticated detection
    const promptLower = prompt.toLowerCase()
    
    // More sophisticated component type detection
    const isButton = promptLower.includes('button') || promptLower.includes('cta') || promptLower.includes('click')
    const isCard = promptLower.includes('card') || promptLower.includes('panel') || promptLower.includes('container')
    const isForm = promptLower.includes('form') || promptLower.includes('input') || promptLower.includes('field')
    const isNav = promptLower.includes('nav') || promptLower.includes('menu') || promptLower.includes('header')
    const isModal = promptLower.includes('modal') || promptLower.includes('dialog') || promptLower.includes('popup')
    const isTable = promptLower.includes('table') || promptLower.includes('grid') || promptLower.includes('list')
    const isChart = promptLower.includes('chart') || promptLower.includes('graph') || promptLower.includes('visualization')
    
    // Add some randomness to make it feel more realistic
    const randomFactor = Math.random()
    
    if (isModal) {
      return this.getDemoModal()
    } else if (isNav) {
      return this.getDemoNavigation()
    } else if (isTable) {
      return this.getDemoTable()
    } else if (isChart) {
      return this.getDemoChart()
    } else if (isCard) {
      return this.getDemoCard()
    } else if (isForm) {
      return this.getDemoForm()
    } else if (isButton) {
      return this.getDemoButton()
    } else {
      // Random selection for unknown prompts
      const components = [
        () => this.getDemoButton(),
        () => this.getDemoCard(),
        () => this.getDemoForm(),
        () => this.getDemoNavigation(),
        () => this.getDemoModal()
      ]
      const randomComponent = components[Math.floor(randomFactor * components.length)]
      return randomComponent()
    }
  }

  /**
   * Get demo component for fallback
   */
  private static getDemoComponent(prompt: string): any {
    // Analyze prompt to determine component type
    const isButton = prompt.toLowerCase().includes('button')
    const isCard = prompt.toLowerCase().includes('card')
    const isForm = prompt.toLowerCase().includes('form') || prompt.toLowerCase().includes('input')
    
    if (isCard) {
      return this.getDemoCard()
    } else if (isForm) {
      return this.getDemoForm()
    } else {
      return this.getDemoButton()
    }
  }

  /**
   * Demo button component
   */
  private static getDemoButton(): any {
    return {
      name: "PrimaryButton",
      code: `import React from 'react'
import { cn } from '@/lib/utils'

interface PrimaryButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  onClick,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait',
        className
      )}
      aria-disabled={disabled || loading}
      aria-label={typeof children === 'string' ? children : 'Button'}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}`,
      props: [
        { name: "children", type: "React.ReactNode", description: "Button content", required: true },
        { name: "variant", type: "'primary' | 'secondary' | 'outline'", default: "primary", description: "Button style variant" },
        { name: "size", type: "'sm' | 'md' | 'lg'", default: "md", description: "Button size" },
        { name: "disabled", type: "boolean", default: false, description: "Disable button interaction" },
        { name: "loading", type: "boolean", default: false, description: "Show loading spinner" },
        { name: "icon", type: "React.ReactNode", description: "Optional icon element" },
        { name: "onClick", type: "() => void", description: "Click handler function" }
      ],
      variants: [
        {
          name: "primary",
          code: `<PrimaryButton variant="primary">Primary Button</PrimaryButton>`,
          previewProps: { variant: "primary", children: "Primary Button" },
          description: "Main call-to-action button"
        },
        {
          name: "secondary", 
          code: `<PrimaryButton variant="secondary">Secondary</PrimaryButton>`,
          previewProps: { variant: "secondary", children: "Secondary" },
          description: "Secondary action button"
        },
        {
          name: "outline",
          code: `<PrimaryButton variant="outline">Outline Button</PrimaryButton>`,
          previewProps: { variant: "outline", children: "Outline Button" },
          description: "Outline style button"
        }
      ],
      story: `import type { Meta, StoryObj } from '@storybook/react'
import { PrimaryButton } from './PrimaryButton'

const meta: Meta<typeof PrimaryButton> = {
  title: 'UI/PrimaryButton',
  component: PrimaryButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button', 
    variant: 'secondary',
  },
}

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
}`,
      test: `import { render, screen, fireEvent } from '@testing-library/react'
import { PrimaryButton } from './PrimaryButton'

describe('PrimaryButton', () => {
  it('renders with correct text', () => {
    render(<PrimaryButton>Test Button</PrimaryButton>)
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<PrimaryButton onClick={handleClick}>Click Me</PrimaryButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<PrimaryButton loading>Loading Button</PrimaryButton>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })

  it('applies variant classes correctly', () => {
    render(<PrimaryButton variant="secondary">Secondary</PrimaryButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-600')
  })
})`,
      previewHtml: `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-8 bg-gray-50">
  <div class="space-y-4">
    <button class="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 px-4 py-2 text-base">
      Primary Button
    </button>
    <button class="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 px-4 py-2 text-base">
      Secondary Button
    </button>
    <button class="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 px-4 py-2 text-base">
      Outline Button
    </button>
  </div>
</body>
</html>`,
      rationale: "Generated a comprehensive button component with proper accessibility, TypeScript interfaces, multiple variants, and Tailwind styling that follows modern React patterns.",
      confidence: 0.92,
      sandpackFiles: {
        '/App.js': `import React from 'react'
import { PrimaryButton } from './PrimaryButton'

export default function App() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">PrimaryButton Preview</h1>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Primary</h3>
            <PrimaryButton variant="primary">Primary Button</PrimaryButton>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Secondary</h3>
            <PrimaryButton variant="secondary">Secondary Button</PrimaryButton>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Outline</h3>
            <PrimaryButton variant="outline">Outline Button</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}`,
        '/PrimaryButton.jsx': `import React from 'react'
import { PrimaryButton } from './PrimaryButton'

const cn = (...classes) => classes.filter(Boolean).join(' ')

interface PrimaryButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  onClick,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait',
        className
      )}
      aria-disabled={disabled || loading}
      aria-label={typeof children === 'string' ? children : 'Button'}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}`,
        '/package.json': JSON.stringify({
          dependencies: {
            react: '^18.0.0',
            'react-dom': '^18.0.0'
          }
        }, null, 2),
        '/styles.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`
      }
    }
  }

  /**
   * Post-process generated component (formatting, validation, a11y checks)
   */
  private static async postProcessComponent(
    aiResult: any, 
    request: ComponentGenerationRequest
  ): Promise<ComponentGenerationResult> {
    
    // Post-process the generated code
    const postProcessResult = await PostProcessor.processComponentCode(aiResult.code)
    
    // Run accessibility checks
    const accessibilityResult = await AccessibilityChecker.checkComponentAccessibility(postProcessResult.formattedCode)
    
    // Validate component structure
    const validationResult = PostProcessor.validateComponentStructure(postProcessResult.formattedCode)
    
    // Analyze bundle size
    const bundleAnalysis = PostProcessor.analyzeBundleSize(postProcessResult.formattedCode)
    
    // Create Sandpack files for live preview
    const variantsArray = Array.isArray(aiResult.variants) ? aiResult.variants : []
    const sandpackFiles = {
      '/App.js': `import React from 'react'
import { ${aiResult.name} } from './${aiResult.name}'

export default function App() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Component Preview</h1>
      ${variantsArray.map((variant: any) => 
        `<div className="space-y-2">
          <h3 className="text-lg font-semibold">${variant.name}</h3>
          ${variant.code}
        </div>`
      ).join('\n      ')}
    </div>
  )
}`,
      [`/${aiResult.name}.tsx`]: postProcessResult.formattedCode,
      '/package.json': JSON.stringify({
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0',
          '@types/react': '^18.0.0',
          'tailwindcss': '^3.0.0'
        }
      }, null, 2)
    }

    // Run accessibility checks (mock for MVP)
    const accessibility = {
      score: 95,
      issues: [
        {
          severity: 'minor' as const,
          description: 'Consider adding aria-describedby for additional context',
          suggestion: 'Add aria-describedby attribute to provide more context for screen readers'
        }
      ]
    }

    return {
      ...aiResult,
      code: postProcessResult.formattedCode,
      sandpackFiles,
      accessibility: accessibilityResult,
      postProcessing: {
        issues: postProcessResult.issues,
        suggestions: postProcessResult.suggestions,
        validation: validationResult,
        bundleAnalysis
      }
    }
  }

  /**
   * Normalize AI response to guaranteed structure used by UI Studio.
   */
  private static normalizeAIResult(ai: any): any {
    const safeVariants = Array.isArray(ai?.variants)
      ? ai.variants
      : ai?.variants && typeof ai.variants === 'object'
        ? Object.keys(ai.variants).map(key => ({ name: key, ...(ai.variants[key] || {}) }))
        : []

    const safeProps = Array.isArray(ai?.props) ? ai.props : []

    return {
      name: ai?.name || 'GeneratedComponent',
      code: typeof ai?.code === 'string' ? ai.code : '// No code returned',
      props: safeProps,
      variants: safeVariants,
      story: typeof ai?.story === 'string' ? ai.story : '',
      test: typeof ai?.test === 'string' ? ai.test : '',
      previewHtml: typeof ai?.previewHtml === 'string' ? ai.previewHtml : '',
      rationale: typeof ai?.rationale === 'string' ? ai.rationale : '',
      confidence: typeof ai?.confidence === 'number' ? ai.confidence : 0.9
    }
  }

  /**
   * Demo card component
   */
  private static getDemoCard(): any {
    return {
      name: "InfoCard",
      code: `import React from 'react'
import { cn } from '@/lib/utils'

interface InfoCardProps {
  title: string
  description: string
  image?: string
  action?: React.ReactNode
  className?: string
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  image,
  action,
  className
}) => {
  return (
    <div className={cn(
      'bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300',
      className
    )}>
      {image && (
        <div className="h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {action && (
          <div className="flex justify-end">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}`,
      props: [
        { name: "title", type: "string", description: "Card title", required: true },
        { name: "description", type: "string", description: "Card description", required: true },
        { name: "image", type: "string", description: "Optional image URL" },
        { name: "action", type: "React.ReactNode", description: "Optional action element" }
      ],
      variants: [
        {
          name: "basic",
          code: `<InfoCard title="Card Title" description="This is a basic card description." />`,
          previewProps: { title: "Card Title", description: "This is a basic card description." },
          description: "Basic card without image"
        },
        {
          name: "with-image",
          code: `<InfoCard title="Image Card" description="Card with image." image="/api/placeholder/300/200" />`,
          previewProps: { title: "Image Card", description: "Card with image.", image: "/api/placeholder/300/200" },
          description: "Card with header image"
        }
      ],
      story: `import type { Meta, StoryObj } from '@storybook/react'
import { InfoCard } from './InfoCard'

const meta: Meta<typeof InfoCard> = {
  title: 'UI/InfoCard',
  component: InfoCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {
    title: 'Card Title',
    description: 'This is a basic card description.',
  },
}`,
      test: `import { render, screen } from '@testing-library/react'
import { InfoCard } from './InfoCard'

describe('InfoCard', () => {
  it('renders with title and description', () => {
    render(<InfoCard title="Test Title" description="Test description" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
})`,
      previewHtml: `<div class="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-sm">
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Card Title</h3>
        <p class="text-gray-600">This is a beautiful card component with clean design.</p>
      </div>`,
      rationale: "Generated a clean, accessible card component with proper hover states and flexible content options.",
      confidence: 0.89
    }
  }

  /**
   * Demo form component
   */
  private static getDemoForm(): any {
    return {
      name: "ContactForm",
      code: `import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface ContactFormProps {
  onSubmit?: (data: FormData) => void
  className?: string
}

interface FormData {
  name: string
  email: string
  message: string
}

export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  className
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn('space-y-4 max-w-md', className)}
    >
      <div>
        <label 
          htmlFor="name" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          aria-describedby="name-help"
        />
      </div>
      
      <div>
        <label 
          htmlFor="email" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div>
        <label 
          htmlFor="message" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Message
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
      >
        Send Message
      </button>
    </form>
  )
}`,
      props: [
        { name: "onSubmit", type: "(data: FormData) => void", description: "Form submission handler" }
      ],
      variants: [
        {
          name: "default",
          code: `<ContactForm onSubmit={(data) => console.log(data)} />`,
          previewProps: {},
          description: "Standard contact form"
        }
      ],
      story: `import type { Meta, StoryObj } from '@storybook/react'
import { ContactForm } from './ContactForm'

const meta: Meta<typeof ContactForm> = {
  title: 'UI/ContactForm',
  component: ContactForm,
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onSubmit: (data) => console.log('Form submitted:', data),
  },
}`,
      test: `import { render, screen, fireEvent } from '@testing-library/react'
import { ContactForm } from './ContactForm'

describe('ContactForm', () => {
  it('renders form fields', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
  })
})`,
      previewHtml: `<form class="space-y-4 max-w-md">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Send Message</button>
      </form>`,
      rationale: "Generated a complete contact form with proper accessibility, validation, and responsive design.",
      confidence: 0.92
    }
  }

  /**
   * Demo navigation component
   */
  private static getDemoNavigation(): any {
    return {
      name: "ModernNavigation",
      code: `import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X, User, Search, Bell } from 'lucide-react'

interface ModernNavigationProps {
  logo?: string
  menuItems?: Array<{
    label: string
    href: string
    active?: boolean
  }>
  user?: {
    name: string
    avatar?: string
  }
  onSearch?: (query: string) => void
  className?: string
}

export const ModernNavigation: React.FC<ModernNavigationProps> = ({
  logo = "DevFlowHub",
  menuItems = [
    { label: "Dashboard", href: "/dashboard", active: true },
    { label: "Projects", href: "/projects" },
    { label: "Components", href: "/components" },
    { label: "Settings", href: "/settings" }
  ],
  user,
  onSearch,
  className
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <nav className={cn(
      'bg-white border-b border-gray-200 sticky top-0 z-50',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">{logo}</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </form>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Bell className="h-6 w-6" />
              </button>
              {user && (
                <div className="ml-3 relative">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  item.active
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}`,
      props: [
        { name: "logo", type: "string", default: "DevFlowHub", description: "Brand logo text" },
        { name: "menuItems", type: "Array<{label: string, href: string, active?: boolean}>", description: "Navigation menu items" },
        { name: "user", type: "{name: string, avatar?: string}", description: "User information for user menu" },
        { name: "onSearch", type: "(query: string) => void", description: "Search handler function" }
      ],
      variants: [
        {
          name: "default",
          code: `<ModernNavigation />`,
          previewProps: {},
          description: "Default navigation with logo and menu"
        },
        {
          name: "with-search",
          code: `<ModernNavigation onSearch={(query) => console.log(query)} />`,
          previewProps: { onSearch: (query: string) => console.log(query) },
          description: "Navigation with search functionality"
        },
        {
          name: "with-user",
          code: `<ModernNavigation user={{name: "John Doe"}} />`,
          previewProps: { user: { name: "John Doe" } },
          description: "Navigation with user menu"
        }
      ],
      story: `import type { Meta, StoryObj } from '@storybook/react'
import { ModernNavigation } from './ModernNavigation'

const meta: Meta<typeof ModernNavigation> = {
  title: 'Navigation/ModernNavigation',
  component: ModernNavigation,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithSearch: Story = {
  args: {
    onSearch: (query) => console.log('Search:', query),
  },
}`,
      test: `import { render, screen, fireEvent } from '@testing-library/react'
import { ModernNavigation } from './ModernNavigation'

describe('ModernNavigation', () => {
  it('renders with logo', () => {
    render(<ModernNavigation />)
    expect(screen.getByText('DevFlowHub')).toBeInTheDocument()
  })

  it('renders menu items', () => {
    render(<ModernNavigation />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })

  it('handles search', () => {
    const onSearch = jest.fn()
    render(<ModernNavigation onSearch={onSearch} />)
    
    const searchInput = screen.getByPlaceholderText('Search components...')
    fireEvent.change(searchInput, { target: { value: 'test' } })
    fireEvent.submit(searchInput)
    
    expect(onSearch).toHaveBeenCalledWith('test')
  })
})`,
      previewHtml: `<nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <div class="flex items-center">
        <h1 class="text-2xl font-bold text-gray-900">DevFlowHub</h1>
      </div>
      <div class="hidden md:block">
        <div class="ml-10 flex items-baseline space-x-4">
          <a href="/dashboard" class="px-3 py-2 rounded-md text-sm font-medium bg-gray-900 text-white">Dashboard</a>
          <a href="/projects" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Projects</a>
          <a href="/components" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Components</a>
        </div>
      </div>
    </div>
  </div>
</nav>`,
      rationale: "Generated a modern, responsive navigation component with search, user menu, and mobile support.",
      confidence: 0.94
    }
  }

  /**
   * Demo modal component
   */
  private static getDemoModal(): any {
    return {
      name: "ConfirmationModal",
      code: `import React from 'react'
import { cn } from '@/lib/utils'
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type?: 'warning' | 'success' | 'info' | 'danger'
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  className?: string
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  className
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'info':
        return <Info className="h-6 w-6 text-blue-600" />
      case 'danger':
        return <AlertTriangle className="h-6 w-6 text-red-600" />
      case 'warning':
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
    }
  }

  const getButtonStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      case 'warning':
      default:
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={cn(
          'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full',
          className
        )}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
                {getIcon()}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
                getButtonStyles(),
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : null}
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}`,
      props: [
        { name: "isOpen", type: "boolean", description: "Whether the modal is open", required: true },
        { name: "onClose", type: "() => void", description: "Close handler function", required: true },
        { name: "onConfirm", type: "() => void", description: "Confirm handler function", required: true },
        { name: "title", type: "string", description: "Modal title", required: true },
        { name: "message", type: "string", description: "Modal message", required: true },
        { name: "type", type: "'warning' | 'success' | 'info' | 'danger'", default: "warning", description: "Modal type" },
        { name: "confirmText", type: "string", default: "Confirm", description: "Confirm button text" },
        { name: "cancelText", type: "string", default: "Cancel", description: "Cancel button text" },
        { name: "isLoading", type: "boolean", default: false, description: "Loading state" }
      ],
      variants: [
        {
          name: "warning",
          code: `<ConfirmationModal isOpen={true} onClose={() => {}} onConfirm={() => {}} title="Warning" message="Are you sure?" type="warning" />`,
          previewProps: { isOpen: true, onClose: () => {}, onConfirm: () => {}, title: "Warning", message: "Are you sure?", type: "warning" },
          description: "Warning modal"
        },
        {
          name: "success",
          code: `<ConfirmationModal isOpen={true} onClose={() => {}} onConfirm={() => {}} title="Success" message="Operation completed!" type="success" />`,
          previewProps: { isOpen: true, onClose: () => {}, onConfirm: () => {}, title: "Success", message: "Operation completed!", type: "success" },
          description: "Success modal"
        }
      ],
      story: `import type { Meta, StoryObj } from '@storybook/react'
import { ConfirmationModal } from './ConfirmationModal'

const meta: Meta<typeof ConfirmationModal> = {
  title: 'Overlay/ConfirmationModal',
  component: ConfirmationModal,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Warning: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    title: 'Warning',
    message: 'Are you sure you want to delete this item?',
    type: 'warning',
  },
}`,
      test: `import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmationModal } from './ConfirmationModal'

describe('ConfirmationModal', () => {
  it('renders when open', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Test"
        message="Test message"
      />
    )
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = jest.fn()
    render(
      <ConfirmationModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        title="Test"
        message="Test message"
      />
    )
    fireEvent.click(screen.getByText('Confirm'))
    expect(onConfirm).toHaveBeenCalled()
  })
})`,
      previewHtml: `<div class="fixed inset-0 z-50 overflow-y-auto">
  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Warning</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">Are you sure you want to delete this item?</p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm">Confirm</button>
        <button class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
      </div>
    </div>
  </div>
</div>`,
      rationale: "Generated a comprehensive confirmation modal with different types, loading states, and accessibility features.",
      confidence: 0.93
    }
  }

  /**
   * Demo table component
   */
  private static getDemoTable(): any {
    return {
      name: "DataTable",
      code: `import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, MoreHorizontal, Search, Filter } from 'lucide-react'

interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  data: any[]
  columns: Column[]
  searchable?: boolean
  sortable?: boolean
  pagination?: boolean
  pageSize?: number
  onRowClick?: (row: any) => void
  className?: string
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  searchable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  onRowClick,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search term
  const filteredData = data.filter(row =>
    columns.some(column =>
      String(row[column.key]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize)

  const handleSort = (key: string) => {
    if (!sortable) return

    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-gray-600" />
      : <ChevronDown className="h-4 w-4 text-gray-600" />
  }

  return (
    <div className={cn('bg-white shadow rounded-lg', className)}>
      {/* Header */}
      {searchable && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    sortable && column.sortable !== false && 'cursor-pointer hover:bg-gray-100'
                  )}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortable && column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  'hover:bg-gray-50',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}`,
      props: [
        { name: "data", type: "any[]", description: "Table data array", required: true },
        { name: "columns", type: "Column[]", description: "Column configuration", required: true },
        { name: "searchable", type: "boolean", default: true, description: "Enable search functionality" },
        { name: "sortable", type: "boolean", default: true, description: "Enable sorting functionality" },
        { name: "pagination", type: "boolean", default: true, description: "Enable pagination" },
        { name: "pageSize", type: "number", default: 10, description: "Number of rows per page" },
        { name: "onRowClick", type: "(row: any) => void", description: "Row click handler" }
      ],
      variants: [
        {
          name: "basic",
          code: `<DataTable data={[]} columns={[]} />`,
          previewProps: { data: [], columns: [] },
          description: "Basic data table"
        },
        {
          name: "with-data",
          code: `<DataTable data={[{id: 1, name: "John", email: "john@example.com"}]} columns={[{key: "name", label: "Name"}, {key: "email", label: "Email"}]} />`,
          previewProps: { 
            data: [{id: 1, name: "John", email: "john@example.com"}], 
            columns: [{key: "name", label: "Name"}, {key: "email", label: "Email"}] 
          },
          description: "Table with sample data"
        }
      ],
      story: `import type { Meta, StoryObj } from '@storybook/react'
import { DataTable } from './DataTable'

const meta: Meta<typeof DataTable> = {
  title: 'Data/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
]

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
]

export const Default: Story = {
  args: {
    data: sampleData,
    columns,
  },
}`,
      test: `import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable } from './DataTable'

describe('DataTable', () => {
  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ]

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ]

  it('renders table with data', () => {
    render(<DataTable data={sampleData} columns={columns} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('handles search', () => {
    render(<DataTable data={sampleData} columns={columns} />)
    const searchInput = screen.getByPlaceholderText('Search...')
    fireEvent.change(searchInput, { target: { value: 'John' } })
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })
})`,
      previewHtml: `<div class="bg-white shadow rounded-lg">
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Doe</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">john@example.com</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Admin</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`,
      rationale: "Generated a comprehensive data table with search, sorting, pagination, and responsive design.",
      confidence: 0.91
    }
  }

  /**
   * Demo chart component
   */
  private static getDemoChart(): any {
    return {
      name: "SimpleChart",
      code: `import React from 'react'
import { cn } from '@/lib/utils'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface SimpleChartProps {
  data: ChartData[]
  type?: 'bar' | 'line' | 'pie'
  title?: string
  height?: number
  showLegend?: boolean
  className?: string
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  type = 'bar',
  title,
  height = 300,
  showLegend = true,
  className
}) => {
  const maxValue = Math.max(...data.map(d => d.value))
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']

  const renderBarChart = () => (
    <div className="flex items-end space-x-2 h-full">
      {data.map((item, index) => (
        <div key={item.label} className="flex flex-col items-center flex-1">
          <div
            className="w-full rounded-t"
            style={{
              height: String((item.value / maxValue) * 100) + '%',
              backgroundColor: item.color || colors[index % colors.length],
              minHeight: '4px'
            }}
          />
          <span className="text-xs text-gray-600 mt-2 text-center">{item.label}</span>
          <span className="text-xs text-gray-500">{item.value}</span>
        </div>
      ))}
    </div>
  )

  const renderLineChart = () => (
    <div className="relative h-full">
      <svg width="100%" height="100%" className="overflow-visible">
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          points={data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - (item.value / maxValue) * 100
            return x + ',' + y
          }).join(' ')}
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - (item.value / maxValue) * 100
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#3b82f6"
            />
          )
        })}
      </svg>
    </div>
  )

  const renderPieChart = () => {
    let cumulativePercentage = 0
    const radius = 80
    const centerX = 100
    const centerY = 100

    return (
      <div className="flex items-center justify-center h-full">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {data.map((item, index) => {
            const percentage = (item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100
            const startAngle = (cumulativePercentage / 100) * 360
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360
            
            cumulativePercentage += percentage

            const startAngleRad = (startAngle - 90) * (Math.PI / 180)
            const endAngleRad = (endAngle - 90) * (Math.PI / 180)

            const x1 = centerX + radius * Math.cos(startAngleRad)
            const y1 = centerY + radius * Math.sin(startAngleRad)
            const x2 = centerX + radius * Math.cos(endAngleRad)
            const y2 = centerY + radius * Math.sin(endAngleRad)

            const largeArcFlag = percentage > 50 ? 1 : 0

            const pathData = [
              'M ' + centerX + ' ' + centerY,
              'L ' + x1 + ' ' + y1,
              'A ' + radius + ' ' + radius + ' 0 ' + largeArcFlag + ' 1 ' + x2 + ' ' + y2,
              'Z'
            ].join(' ')

            return (
              <path
                key={item.label}
                d={pathData}
                fill={item.color || colors[index % colors.length]}
              />
            )
          })}
        </svg>
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart()
      case 'pie':
        return renderPieChart()
      case 'bar':
      default:
        return renderBarChart()
    }
  }

  return (
    <div className={cn('bg-white p-6 rounded-lg shadow', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div style={{ height: String(height) + 'px' }} className="w-full">
        {renderChart()}
      </div>

      {showLegend && (
        <div className="mt-4 flex flex-wrap gap-4">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm text-gray-500">({'{'}item.value{'}'})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}`,
      props: [
        { name: "data", type: "ChartData[]", description: "Chart data array", required: true },
        { name: "type", type: "'bar' | 'line' | 'pie'", default: "bar", description: "Chart type" },
        { name: "title", type: "string", description: "Chart title" },
        { name: "height", type: "number", default: 300, description: "Chart height in pixels" },
        { name: "showLegend", type: "boolean", default: true, description: "Show legend" }
      ],
      variants: [
        {
          name: "bar",
          code: `<SimpleChart data={[{label: "Jan", value: 100}, {label: "Feb", value: 150}]} type="bar" />`,
          previewProps: { 
            data: [{label: "Jan", value: 100}, {label: "Feb", value: 150}], 
            type: "bar" 
          },
          description: "Bar chart"
        },
        {
          name: "line",
          code: `<SimpleChart data={[{label: "Jan", value: 100}, {label: "Feb", value: 150}]} type="line" />`,
          previewProps: { 
            data: [{label: "Jan", value: 100}, {label: "Feb", value: 150}], 
            type: "line" 
          },
          description: "Line chart"
        },
        {
          name: "pie",
          code: `<SimpleChart data={[{label: "Desktop", value: 60}, {label: "Mobile", value: 40}]} type="pie" />`,
          previewProps: { 
            data: [{label: "Desktop", value: 60}, {label: "Mobile", value: 40}], 
            type: "pie" 
          },
          description: "Pie chart"
        }
      ],
      story: `import type { Meta, StoryObj } from '@storybook/react'
import { SimpleChart } from './SimpleChart'

const meta: Meta<typeof SimpleChart> = {
  title: 'Charts/SimpleChart',
  component: SimpleChart,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const sampleData = [
  { label: 'Desktop', value: 60, color: '#3b82f6' },
  { label: 'Mobile', value: 30, color: '#10b981' },
  { label: 'Tablet', value: 10, color: '#f59e0b' },
]

export const BarChart: Story = {
  args: {
    data: sampleData,
    type: 'bar',
    title: 'Device Usage',
  },
}`,
      test: `import { render, screen } from '@testing-library/react'
import { SimpleChart } from './SimpleChart'

describe('SimpleChart', () => {
  const sampleData = [
    { label: 'Jan', value: 100 },
    { label: 'Feb', value: 150 },
  ]

  it('renders bar chart', () => {
    render(<SimpleChart data={sampleData} type="bar" />)
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Feb')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(<SimpleChart data={sampleData} title="Sales Data" />)
    expect(screen.getByText('Sales Data')).toBeInTheDocument()
  })
})`,
      previewHtml: `<div class="bg-white p-6 rounded-lg shadow">
  <h3 class="text-lg font-semibold text-gray-900 mb-4">Sales Data</h3>
  <div style="height: 300px" class="w-full">
    <div class="flex items-end space-x-2 h-full">
      <div class="flex flex-col items-center flex-1">
        <div class="w-full rounded-t bg-blue-500" style="height: 66.67%; min-height: 4px;"></div>
        <span class="text-xs text-gray-600 mt-2 text-center">Jan</span>
        <span class="text-xs text-gray-500">100</span>
      </div>
      <div class="flex flex-col items-center flex-1">
        <div class="w-full rounded-t bg-green-500" style="height: 100%; min-height: 4px;"></div>
        <span class="text-xs text-gray-600 mt-2 text-center">Feb</span>
        <span class="text-xs text-gray-500">150</span>
      </div>
    </div>
  </div>
</div>`,
      rationale: "Generated a flexible chart component supporting bar, line, and pie charts with customizable styling.",
      confidence: 0.89
    }
  }
}
