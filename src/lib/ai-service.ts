import OpenAI from 'openai'

// Use environment variable for API key
// Initialize OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side usage
}) : null

export interface AIResponse {
  success: boolean
  content: string
  metadata?: any
  error?: string
}

export interface CodeGenerationRequest {
  prompt: string
  language: string
  framework?: string
  context?: string
}

export interface CodeAnalysisRequest {
  code: string
  language: string
  task: 'explain' | 'optimize' | 'debug' | 'refactor'
}

export interface AIAssistantRequest {
  message: string
  context: string
  projectType: string
}

export class AIService {
  // Generate code based on natural language description
  static async generateCode(request: CodeGenerationRequest): Promise<AIResponse> {
    try {
      const systemPrompt = `You are an expert software developer. Generate production-ready code based on the user's request.
      
Language: ${request.language}
Framework: ${request.framework || 'vanilla'}
Context: ${request.context || 'No additional context provided'}

Requirements:
- Write clean, well-documented code
- Include proper error handling
- Follow best practices for ${request.language}
- Add helpful comments
- Ensure the code is production-ready

User Request: ${request.prompt}`

      if (!openai) {
        throw new Error('OpenAI API key not configured')
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: request.prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })

      const generatedCode = completion.choices[0]?.message?.content || ''

      return {
        success: true,
        content: generatedCode,
        metadata: {
          model: "gpt-4",
          tokens: completion.usage?.total_tokens,
          language: request.language,
          framework: request.framework
        }
      }
    } catch (error) {
      console.error('AI Code Generation Error:', error)
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Analyze and improve existing code
  static async analyzeCode(request: CodeAnalysisRequest): Promise<AIResponse> {
    try {
      const systemPrompt = `You are an expert code reviewer and optimizer. Analyze the provided code and ${request.task} it.
      
Language: ${request.language}
Task: ${request.task}

For each task, provide:
- Detailed explanation of what the code does
- Specific improvements and optimizations
- Code examples where applicable
- Best practices recommendations
- Security considerations if relevant

Code to analyze:
\`\`\`${request.language}
${request.code}
\`\`\``

      if (!openai) {
        throw new Error('OpenAI API key not configured')
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please ${request.task} this ${request.language} code.` }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })

      const analysis = completion.choices[0]?.message?.content || ''

      return {
        success: true,
        content: analysis,
        metadata: {
          model: "gpt-4",
          task: request.task,
          language: request.language,
          tokens: completion.usage?.total_tokens
        }
      }
    } catch (error) {
      console.error('AI Code Analysis Error:', error)
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // AI Assistant for general development questions
  static async getAssistant(request: AIAssistantRequest): Promise<AIResponse> {
    try {
      const systemPrompt = `You are an expert software development mentor and AI coding assistant. Help the user with their development questions and challenges.

Project Type: ${request.projectType}
Context: ${request.context}

Provide:
- Clear, actionable advice
- Code examples when relevant
- Best practices and industry standards
- Step-by-step solutions for complex problems
- Links to relevant resources and documentation

Be helpful, encouraging, and thorough in your responses.`

      if (!openai) {
        throw new Error('OpenAI API key not configured')
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: request.message }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content || ''

      return {
        success: true,
        content: response,
        metadata: {
          model: "gpt-4",
          projectType: request.projectType,
          tokens: completion.usage?.total_tokens
        }
      }
    } catch (error) {
      console.error('AI Assistant Error:', error)
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Generate project structure and setup
  static async generateProjectStructure(projectType: string, language: string): Promise<AIResponse> {
    try {
      const systemPrompt = `You are an expert project architect. Generate a complete project structure for a ${projectType} project using ${language}.

Provide:
- Directory structure
- Essential files with basic content
- Package.json or equivalent configuration
- README with setup instructions
- Basic starter code
- Development scripts and commands

Make it production-ready and follow industry best practices.`

      if (!openai) {
        throw new Error('OpenAI API key not configured')
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a project structure for ${projectType} using ${language}` }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })

      const structure = completion.choices[0]?.message?.content || ''

      return {
        success: true,
        content: structure,
        metadata: {
          model: "gpt-4",
          projectType,
          language,
          tokens: completion.usage?.total_tokens
        }
      }
    } catch (error) {
      console.error('AI Project Structure Generation Error:', error)
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

// Mock AI service for development (when API key is not available)
export class MockAIService {
  static async generateCode(request: CodeGenerationRequest): Promise<AIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockCode = `// Generated ${request.language} code for: ${request.prompt}
// This is a mock response - add your OpenAI API key for real AI generation

function ${request.prompt.toLowerCase().replace(/\s+/g, '_')}() {
  console.log("Hello from ${request.language}!");
  
  // TODO: Implement your logic here
  return "Generated response";
}

// Export for use in other modules
export default ${request.prompt.toLowerCase().replace(/\s+/g, '_')};`

    return {
      success: true,
      content: mockCode,
      metadata: {
        model: "mock-ai",
        language: request.language,
        framework: request.framework,
        note: "Mock response - add OpenAI API key for real AI"
      }
    }
  }

  static async analyzeCode(request: CodeAnalysisRequest): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const mockAnalysis = `## Code Analysis: ${request.task}

**Language:** ${request.language}
**Task:** ${request.task}

### Current Code Review:
The provided code appears to be well-structured and follows good practices.

### Recommendations:
1. **Documentation**: Add JSDoc comments for better code understanding
2. **Error Handling**: Implement try-catch blocks for robust error management
3. **Testing**: Add unit tests to ensure code reliability
4. **Performance**: Consider optimizing loops and data structures

### Example Improvements:
\`\`\`${request.language}
// Add proper error handling
try {
  // Your code here
} catch (error) {
  console.error('Error occurred:', error);
  // Handle error appropriately
}
\`\`\`

*Note: This is a mock analysis. Add your OpenAI API key for real AI-powered code review.*`

    return {
      success: true,
      content: mockAnalysis,
      metadata: {
        model: "mock-ai",
        task: request.task,
        language: request.language,
        note: "Mock analysis - add OpenAI API key for real AI"
      }
    }
  }

  static async getAssistant(request: AIAssistantRequest): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockResponse = `## AI Development Assistant

**Project Type:** ${request.projectType}
**Context:** ${request.context}

### General Advice:
1. **Start Small**: Begin with a minimal viable product (MVP)
2. **Version Control**: Use Git for code management
3. **Testing**: Implement testing from the beginning
4. **Documentation**: Document your code and APIs

### Next Steps:
- Set up your development environment
- Create a project structure
- Implement core features incrementally
- Add error handling and validation

### Resources:
- Official documentation for your chosen technology
- Community forums and Stack Overflow
- GitHub repositories for similar projects

*Note: This is a mock response. Add your OpenAI API key for real AI assistance.*`

    return {
      success: true,
      content: mockResponse,
      metadata: {
        model: "mock-ai",
        projectType: request.projectType,
        note: "Mock response - add OpenAI API key for real AI"
      }
    }
  }

  static async generateProjectStructure(projectType: string, language: string): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    const mockStructure = `## Project Structure for ${projectType} (${language})

\`\`\`
project-root/
├── src/
│   ├── components/
│   ├── utils/
│   └── index.${language === 'javascript' ? 'js' : 'ts'}
├── public/
├── tests/
├── package.json
├── README.md
└── .gitignore
\`\`\`

### Essential Files:

**package.json:**
\`\`\`json
{
  "name": "${projectType.toLowerCase().replace(/\s+/g, '-')}",
  "version": "1.0.0",
  "description": "A ${projectType} project built with ${language}",
  "main": "src/index.${language === 'javascript' ? 'js' : 'ts'}",
  "scripts": {
    "start": "node src/index.${language === 'javascript' ? 'js' : 'ts'}",
    "dev": "nodemon src/index.${language === 'javascript' ? 'js' : 'ts'}",
    "test": "jest"
  }
}
\`\`\`

**README.md:**
\`\`\`markdown
# ${projectType}

A ${projectType} project built with ${language}.

## Setup
1. Clone the repository
2. Run \`npm install\`
3. Run \`npm start\`

## Development
- \`npm run dev\` - Start development server
- \`npm test\` - Run tests
\`\`\`

*Note: This is a mock structure. Add your OpenAI API key for real AI-generated project setup.*`

    return {
      success: true,
      content: mockStructure,
      metadata: {
        model: "mock-ai",
        projectType,
        language,
        note: "Mock structure - add OpenAI API key for real AI"
      }
    }
  }
}

// Export the appropriate service based on API key availability
export const aiService = process.env.OPENAI_API_KEY ? AIService : MockAIService
