# v0 API Integration Guide

## Overview

v0 is an AI-powered component generation platform that creates production-ready UI components from natural language descriptions. This integration provides comprehensive access to component generation, design system management, and UI preview capabilities.

## Features

### 🎨 Component Generation
- **Natural Language to Code**: Generate components from text descriptions
- **Multi-Framework Support**: React, Vue, Svelte, Angular
- **Image-to-Component**: Convert designs to code
- **Sketch-to-Component**: Transform sketches into components
- **Component Refinement**: Iterate and improve components
- **Variant Generation**: Create multiple versions of components

### 🎯 Design System Sync
- **Design System Management**: Create and manage design systems
- **Cross-Platform Sync**: Import from Figma, Sketch, Adobe
- **Export Capabilities**: JSON, CSS, SCSS, Tailwind formats
- **Version Control**: Track design system changes
- **Component Libraries**: Organize components by design system

### 👁️ UI Preview Capabilities
- **Interactive Previews**: Real-time component previews
- **Multi-Viewport Support**: Mobile, tablet, desktop views
- **Screenshot Capture**: Generate component images
- **Live Previews**: Interactive component testing
- **Responsive Testing**: Test across different screen sizes

## API Endpoints

### Component Generation
```typescript
// Generate component from text
POST /components/generate
{
  "prompt": "A modern login form with email and password fields",
  "framework": "react",
  "language": "tsx",
  "designSystem": "modern-design-system",
  "style": "modern"
}

// Generate from image
POST /components/generate-from-image
{
  "imageUrl": "https://example.com/design.png",
  "framework": "react"
}

// Generate from sketch
POST /components/generate-from-sketch
{
  "sketchData": "base64-sketch-data",
  "framework": "react"
}
```

### Component Management
```typescript
// Get component
GET /components/{componentId}

// List components with filters
GET /components?framework=react&category=forms&tags=login

// Save component
POST /components
{
  "name": "LoginForm",
  "description": "Modern login form component",
  "code": "// React component code...",
  "language": "tsx",
  "framework": "react",
  "category": "forms",
  "tags": ["login", "authentication"]
}

// Update component
PATCH /components/{componentId}
{
  "description": "Updated description",
  "tags": ["login", "authentication", "modern"]
}
```

### Design System Management
```typescript
// Create design system
POST /design-systems
{
  "name": "Modern Design System",
  "description": "A comprehensive design system",
  "colors": [...],
  "typography": [...],
  "spacing": [...],
  "isPublic": true
}

// Sync with external source
POST /design-systems/{id}/sync
{
  "source": "figma"
}

// Export design system
POST /design-systems/{id}/export
{
  "format": "tailwind"
}
```

### Preview Management
```typescript
// Create preview
POST /previews
{
  "componentId": "comp_123",
  "viewport": "desktop"
}

// Generate interactive preview
POST /previews/{componentId}/interactive

// Capture screenshot
POST /components/{componentId}/screenshot
{
  "viewport": "mobile"
}
```

## Usage Examples

### Basic Component Generation
```typescript
import V0APIService from '@/lib/services/v0-api'

const v0Service = new V0APIService(process.env.V0_API_KEY)

// Generate a login form
const response = await v0Service.generateComponent({
  prompt: "Create a modern login form with email, password, and remember me checkbox",
  framework: "react",
  language: "tsx",
  style: "modern"
})

console.log('Generated component:', response.component.code)
console.log('Preview URL:', response.preview.url)
```

### Design System Integration
```typescript
// Create a design system
const designSystem = await v0Service.createDesignSystem({
  name: "Company Design System",
  description: "Our brand design system",
  colors: [
    {
      name: "primary",
      value: "#3B82F6",
      category: "primary",
      variants: {
        light: "#60A5FA",
        dark: "#1D4ED8"
      }
    }
  ],
  typography: [
    {
      name: "heading-1",
      fontSize: "2.25rem",
      fontWeight: "700",
      lineHeight: "2.5rem",
      fontFamily: "Inter",
      category: "heading"
    }
  ],
  spacing: [
    {
      name: "sm",
      value: "0.5rem",
      category: "sm"
    }
  ],
  isPublic: false
})

// Generate component using design system
const component = await v0Service.generateComponent({
  prompt: "A button component",
  framework: "react",
  designSystem: designSystem.id
})
```

### Component Analysis and Optimization
```typescript
// Analyze component code
const analysis = await v0Service.analyzeComponent(componentCode)

console.log('Complexity score:', analysis.complexity)
console.log('Accessibility issues:', analysis.accessibility)
console.log('Performance suggestions:', analysis.performance)

// Optimize component
const optimizedComponent = await v0Service.optimizeComponent(componentId)
```

### Advanced Features
```typescript
// Generate component variants
const variants = await v0Service.generateVariants(componentId, 3)

// Generate Storybook stories
const stories = await v0Service.generateStorybookStories(componentId)

// Generate tests
const tests = await v0Service.generateTests(componentId, 'jest')

// Generate documentation
const docs = await v0Service.generateDocumentation(componentId)
```

## Integration with DevFlowHub

### Tool Recommendation
v0 is recommended for:
- **Component Libraries**: Building reusable UI components
- **Design System Projects**: Creating and maintaining design systems
- **UI/UX Projects**: Rapid prototyping and component generation
- **Frontend Development**: Quick component creation and iteration

### Workflow Integration
```typescript
// In your project workflow
const workflow = await integrationManager.createWorkflow(
  "Component Development",
  "Generate and refine UI components",
  [
    {
      id: "step1",
      tool: "v0",
      action: "generate_component",
      parameters: {
        prompt: "Modern navigation bar",
        framework: "react"
      },
      dependencies: [],
      timeout: 30000
    },
    {
      id: "step2",
      tool: "v0",
      action: "create_preview",
      parameters: {
        componentId: "{{step1.componentId}}",
        viewport: "desktop"
      },
      dependencies: ["step1"],
      timeout: 15000
    }
  ]
)
```

## Error Handling

```typescript
try {
  const component = await v0Service.generateComponent(request)
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Handle rate limiting
    await delay(5000)
    return await v0Service.generateComponent(request)
  }
  
  if (error.message.includes('invalid prompt')) {
    // Handle invalid prompts
    throw new Error('Please provide a more specific component description')
  }
  
  // Handle other errors
  console.error('v0 API error:', error)
  throw error
}
```

## Best Practices

### Component Generation
1. **Be Specific**: Provide detailed descriptions for better results
2. **Include Context**: Mention design system, framework, and style preferences
3. **Iterate**: Use refinement to improve generated components
4. **Test**: Always test generated components in your application

### Design System Management
1. **Version Control**: Track changes to your design system
2. **Consistency**: Maintain consistent naming conventions
3. **Documentation**: Document design decisions and usage guidelines
4. **Accessibility**: Ensure components meet accessibility standards

### Performance Optimization
1. **Code Analysis**: Regularly analyze component complexity
2. **Bundle Size**: Monitor component bundle sizes
3. **Lazy Loading**: Implement lazy loading for large component libraries
4. **Caching**: Cache frequently used components

## Environment Variables

```env
V0_API_KEY=your_v0_api_key_here
V0_BASE_URL=https://api.v0.dev/v1
```

## Rate Limits

- **Component Generation**: 100 requests/hour
- **Design System Operations**: 50 requests/hour
- **Preview Generation**: 200 requests/hour
- **Analysis Operations**: 300 requests/hour

## Support

For API support and documentation:
- **API Documentation**: https://v0.dev/docs/api
- **Component Gallery**: https://v0.dev/gallery
- **Design System Guide**: https://v0.dev/design-systems
- **Community**: https://discord.gg/v0 