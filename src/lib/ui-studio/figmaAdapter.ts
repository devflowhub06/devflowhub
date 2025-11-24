import { UIStudioService } from './service'

export interface FigmaFrame {
  id: string
  name: string
  type: string
  absoluteBoundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  fills: Array<{
    type: string
    color?: {
      r: number
      g: number
      b: number
      a: number
    }
    gradientStops?: Array<{
      color: { r: number; g: number; b: number; a: number }
      position: number
    }>
  }>
  children?: FigmaFrame[]
  characters?: string
  style?: {
    fontFamily: string
    fontSize: number
    fontWeight: number
    textAlignHorizontal: string
    textAlignVertical: string
  }
  cornerRadius?: number
  effects?: Array<{
    type: string
    color?: { r: number; g: number; b: number; a: number }
    offset?: { x: number; y: number }
    radius?: number
    spread?: number
  }>
}

export interface FigmaResponse {
  document: {
    id: string
    name: string
    children: FigmaFrame[]
  }
}

export class FigmaAdapter {
  private static readonly FIGMA_API_BASE = 'https://api.figma.com/v1'

  /**
   * Import a Figma frame and generate a React component
   */
  static async importFrame(options: {
    figmaToken: string
    fileId: string
    frameId: string
    projectId: string
    userId: string
  }): Promise<any> {
    try {
      // Fetch frame data from Figma API
      const frameData = await this.fetchFigmaFrame(
        options.figmaToken,
        options.fileId,
        options.frameId
      )

      // Analyze the frame and generate component prompt
      const componentPrompt = this.analyzeFrameAndGeneratePrompt(frameData)

      // Use UI Studio service to generate component
      const result = await UIStudioService.generateComponent({
        projectId: options.projectId,
        prompt: componentPrompt,
        variants: 3,
        styleHints: this.extractStyleHints(frameData),
        themeHints: { figmaImported: true },
        projectContext: {
          framework: 'react',
          tailwindConfig: this.generateTailwindFromFigma(frameData)
        }
      })

      return result

    } catch (error) {
      console.error('Figma import failed:', error)
      throw new Error(`Figma import failed: ${(error as Error).message}`)
    }
  }

  /**
   * Fetch frame data from Figma API
   */
  private static async fetchFigmaFrame(
    token: string,
    fileId: string,
    frameId: string
  ): Promise<FigmaFrame> {
    const response = await fetch(
      `${this.FIGMA_API_BASE}/files/${fileId}/nodes?ids=${frameId}`,
      {
        headers: {
          'X-Figma-Token': token
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.nodes[frameId].document
  }

  /**
   * Analyze Figma frame and generate component prompt
   */
  private static analyzeFrameAndGeneratePrompt(frame: FigmaFrame): string {
    const frameInfo = this.analyzeFrame(frame)
    
    let prompt = `Create a ${frameInfo.componentType} component based on this Figma design:\n\n`
    
    prompt += `Design Analysis:\n`
    prompt += `- Component Type: ${frameInfo.componentType}\n`
    prompt += `- Dimensions: ${frame.width}x${frame.height}px\n`
    prompt += `- Background: ${frameInfo.backgroundColor}\n`
    prompt += `- Border Radius: ${frameInfo.borderRadius}px\n`
    prompt += `- Text Elements: ${frameInfo.textElements.length}\n`
    prompt += `- Interactive Elements: ${frameInfo.interactiveElements.length}\n`
    
    if (frameInfo.textElements.length > 0) {
      prompt += `\nText Content:\n`
      frameInfo.textElements.forEach((text, index) => {
        prompt += `- "${text.content}" (${text.fontSize}px, ${text.fontWeight})\n`
      })
    }

    if (frameInfo.interactiveElements.length > 0) {
      prompt += `\nInteractive Elements:\n`
      frameInfo.interactiveElements.forEach((element, index) => {
        prompt += `- ${element.type} with ${element.backgroundColor} background\n`
      })
    }

    prompt += `\nRequirements:\n`
    prompt += `- Make it fully responsive and accessible\n`
    prompt += `- Use modern design patterns with smooth animations\n`
    prompt += `- Include hover and focus states\n`
    prompt += `- Follow shadcn/ui design principles\n`
    prompt += `- Ensure excellent mobile experience\n`

    return prompt
  }

  /**
   * Analyze frame structure and extract information
   */
  private static analyzeFrame(frame: FigmaFrame): any {
    const textElements: Array<{
      content: string
      fontSize: number
      fontWeight: number
    }> = []

    const interactiveElements: Array<{
      type: string
      backgroundColor: string
    }> = []

    // Recursively analyze frame children
    const analyzeChildren = (node: FigmaFrame) => {
      if (node.characters) {
        textElements.push({
          content: node.characters,
          fontSize: node.style?.fontSize || 16,
          fontWeight: node.style?.fontWeight || 400
        })
      }

      if (node.type === 'FRAME' || node.type === 'COMPONENT') {
        // Check if it looks like an interactive element
        if (node.cornerRadius && node.cornerRadius > 0) {
          interactiveElements.push({
            type: this.determineInteractiveType(node),
            backgroundColor: this.extractBackgroundColor(node)
          })
        }
      }

      if (node.children) {
        node.children.forEach(analyzeChildren)
      }
    }

    analyzeChildren(frame)

    // Determine component type based on structure
    let componentType = 'Card'
    if (interactiveElements.some(el => el.type === 'Button')) {
      componentType = 'Button'
    } else if (textElements.length > 3) {
      componentType = 'Form'
    } else if (interactiveElements.length > 2) {
      componentType = 'Navigation'
    }

    return {
      componentType,
      textElements,
      interactiveElements,
      backgroundColor: this.extractBackgroundColor(frame),
      borderRadius: frame.cornerRadius || 0
    }
  }

  /**
   * Determine if a frame is an interactive element
   */
  private static determineInteractiveType(node: FigmaFrame): string {
    const hasText = node.children?.some(child => child.characters)
    const hasRoundedCorners = node.cornerRadius && node.cornerRadius > 0
    
    if (hasText && hasRoundedCorners) {
      return 'Button'
    } else if (node.type === 'COMPONENT') {
      return 'Component'
    } else {
      return 'Container'
    }
  }

  /**
   * Extract background color from frame
   */
  private static extractBackgroundColor(node: FigmaFrame): string {
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0]
      if (fill.type === 'SOLID' && fill.color) {
        const { r, g, b, a } = fill.color
        return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`
      }
    }
    return 'transparent'
  }

  /**
   * Extract style hints from Figma frame
   */
  private static extractStyleHints(frame: FigmaFrame): Record<string, any> {
    const analysis = this.analyzeFrame(frame)
    
    return {
      rounded: analysis.borderRadius > 0 ? 'lg' : 'none',
      shadow: frame.effects?.some(effect => effect.type === 'DROP_SHADOW') || false,
      gradient: frame.fills?.some(fill => fill.type === 'GRADIENT_LINEAR') || false,
      modern: true,
      figmaImported: true
    }
  }

  /**
   * Generate Tailwind config from Figma styles
   */
  private static generateTailwindFromFigma(frame: FigmaFrame): any {
    const analysis = this.analyzeFrame(frame)
    
    return {
      theme: {
        extend: {
          colors: {
            primary: this.extractPrimaryColor(frame),
            secondary: this.extractSecondaryColor(frame)
          },
          borderRadius: {
            custom: `${analysis.borderRadius}px`
          }
        }
      }
    }
  }

  /**
   * Extract primary color from frame
   */
  private static extractPrimaryColor(frame: FigmaFrame): string {
    // Find the most prominent color in the frame
    const colors = new Set<string>()
    
    const extractColors = (node: FigmaFrame) => {
      if (node.fills) {
        node.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            const { r, g, b } = fill.color
            colors.add(`rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`)
          }
        })
      }
      if (node.children) {
        node.children.forEach(extractColors)
      }
    }

    extractColors(frame)
    
    // Return the first color found, or default
    return colors.values().next().value || '#3b82f6'
  }

  /**
   * Extract secondary color from frame
   */
  private static extractSecondaryColor(frame: FigmaFrame): string {
    // For MVP, return a complementary color
    return '#64748b'
  }
}
