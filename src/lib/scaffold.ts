import { prisma } from '@/lib/prisma'
import { RagService } from '@/lib/rag'
import { promises as fs } from 'fs'
import path from 'path'
import simpleGit from 'simple-git'

export interface ScaffoldOptions {
  name: string
  language: string
  framework?: string | null
  template: string
  useAiScaffolding?: boolean
}

export interface ScaffoldResult {
  path: string
  commitHash: string
  files: Array<{
    name: string
    path: string
    content: string
  }>
}

/**
 * Scaffold a project with files, git initialization, and RAG ingestion
 */
export async function scaffoldProject(
  projectId: string, 
  options: ScaffoldOptions
): Promise<ScaffoldResult> {
  const { name, language, framework, template, useAiScaffolding = false } = options
  
  // Verify project exists first
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  })
  
  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`)
  }
  
  // Create project directory (serverless-safe)
  // On Vercel/serverless, the filesystem is read-only except for /tmp. Persist content in DB regardless.
  const isVercel = !!process.env.VERCEL
  const baseDir = isVercel
    ? path.join('/tmp', 'devflowhub', 'projects')
    : path.join(process.cwd(), 'storage', 'projects')
  let projectPath = path.join(baseDir, projectId)
  try {
    await fs.mkdir(projectPath, { recursive: true })
  } catch (dirError) {
    console.error('Scaffold: failed to create project directory, falling back to DB-only mode:', dirError)
    projectPath = 'db-only'
  }
  
  // Generate files based on template and language
  const files = await generateProjectFiles(name, language, framework, template, useAiScaffolding)
  
  // Write files to disk (best-effort; DB remains source of truth)
  if (projectPath !== 'db-only') {
    try {
      for (const file of files) {
        const filePath = path.join(projectPath, file.path)
        await fs.mkdir(path.dirname(filePath), { recursive: true })
        await fs.writeFile(filePath, file.content, 'utf-8')
      }
    } catch (writeError) {
      console.error('Scaffold: error writing files to FS, continuing with DB-only mode:', writeError)
      projectPath = 'db-only'
    }
  }
  
  // Initialize git repository (skip if DB-only or FS failed)
  const commitHash = projectPath === 'db-only'
    ? 'initial-scaffold-' + Date.now()
    : await initializeGitRepository(projectPath, name)
  
  // Store files in database (non-blocking, best effort)
  try {
    await storeProjectFiles(projectId, files)
  } catch (fileError) {
    console.error('Failed to store project files in database (non-critical), continuing:', fileError)
    // Don't throw - file storage can be retried later
  }
  
  // Ingest files for RAG (non-blocking, best effort)
  try {
    await RagService.ingestDocuments(projectId, files.map(f => ({
      filename: f.name,
      content: f.content,
      metadata: { path: f.path, type: 'scaffold' }
    })))
  } catch (ragError) {
    console.error('RAG ingestion failed (non-critical), continuing:', ragError)
    // Don't throw - RAG is nice-to-have for scaffolding
  }
  
  return {
    path: projectPath,
    commitHash,
    files
  }
}

/**
 * Generate project files based on language and template
 */
async function generateProjectFiles(
  name: string, 
  language: string, 
  framework: string | null, 
  template: string,
  useAiScaffolding: boolean
): Promise<Array<{ name: string; path: string; content: string }>> {
  const files: Array<{ name: string; path: string; content: string }> = []
  
  // Generate README.md
  files.push({
    name: 'README.md',
    path: 'README.md',
    content: generateReadme(name, language, framework)
  })
  
  // Generate .gitignore
  files.push({
    name: '.gitignore',
    path: '.gitignore',
    content: generateGitignore(language)
  })
  
  // Generate main files based on language
  if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'typescript') {
    files.push(...generateJavaScriptFiles(name, language, framework, template))
  } else if (language.toLowerCase() === 'python') {
    files.push(...generatePythonFiles(name, framework, template))
  } else if (language.toLowerCase() === 'java') {
    files.push(...generateJavaFiles(name, framework, template))
  } else {
    // Generic fallback
    files.push({
      name: 'main.txt',
      path: 'main.txt',
      content: `# ${name}\n\nThis is a ${language} project created with DevFlowHub.\n\nStart coding here!`
    })
  }
  
  // Add AI-generated files if requested
  if (useAiScaffolding) {
    const aiFiles = await generateAiScaffoldedFiles(name, language, framework)
    files.push(...aiFiles)
  }
  
  return files
}

/**
 * Generate JavaScript/TypeScript files
 */
function generateJavaScriptFiles(
  name: string, 
  language: string, 
  framework: string | null, 
  template: string
): Array<{ name: string; path: string; content: string }> {
  const files: Array<{ name: string; path: string; content: string }> = []
  const isTypeScript = language.toLowerCase() === 'typescript'
  const ext = isTypeScript ? 'ts' : 'js'
  
  // Package.json
  files.push({
    name: 'package.json',
    path: 'package.json',
    content: generatePackageJson(name, framework, isTypeScript)
  })
  
  // Main entry point
  if (framework === 'react' || framework === 'next') {
    files.push({
      name: `App.${ext}`,
      path: `src/App.${ext}`,
      content: generateReactApp(name, isTypeScript)
    })
    files.push({
      name: `index.${ext}`,
      path: `src/index.${ext}`,
      content: generateReactIndex(isTypeScript)
    })
  } else if (framework === 'express') {
    files.push({
      name: `server.${ext}`,
      path: `src/server.${ext}`,
      content: generateExpressServer(name, isTypeScript)
    })
  } else {
    files.push({
      name: `index.${ext}`,
      path: `src/index.${ext}`,
      content: generateBasicIndex(name, isTypeScript)
    })
  }
  
  // TypeScript config if needed
  if (isTypeScript) {
    files.push({
      name: 'tsconfig.json',
      path: 'tsconfig.json',
      content: generateTsConfig()
    })
  }
  
  return files
}

/**
 * Generate Python files
 */
function generatePythonFiles(
  name: string, 
  framework: string | null, 
  template: string
): Array<{ name: string; path: string; content: string }> {
  const files: Array<{ name: string; path: string; content: string }> = []
  
  // Requirements.txt
  files.push({
    name: 'requirements.txt',
    path: 'requirements.txt',
    content: generatePythonRequirements(framework)
  })
  
  // Main Python file
  files.push({
    name: 'main.py',
    path: 'main.py',
    content: generatePythonMain(name, framework)
  })
  
  return files
}

/**
 * Generate Java files
 */
function generateJavaFiles(
  name: string, 
  framework: string | null, 
  template: string
): Array<{ name: string; path: string; content: string }> {
  const files: Array<{ name: string; path: string; content: string }> = []
  const className = name.replace(/[^a-zA-Z0-9]/g, '')
  
  files.push({
    name: `${className}.java`,
    path: `src/main/java/${className}.java`,
    content: generateJavaMain(className)
  })
  
  return files
}

/**
 * Generate AI-scaffolded files using OpenAI
 */
async function generateAiScaffoldedFiles(
  name: string, 
  language: string, 
  framework: string | null
): Promise<Array<{ name: string; path: string; content: string }>> {
  // This would integrate with OpenAI to generate additional starter files
  // For now, return empty array as placeholder
  return []
}

/**
 * Initialize git repository and make initial commit
 */
async function initializeGitRepository(projectPath: string, name: string): Promise<string> {
  try {
    const git = simpleGit(projectPath)
    
    // Initialize git repository
    await git.init()
    
    // Add all files
    await git.add('.')
    
    // Make initial commit
    await git.commit(`Initial commit: ${name} project scaffold`)
    
    // Get commit hash
    const hash = await git.revparse(['HEAD'])
    return hash.trim()
  } catch (error) {
    console.error('Git initialization failed:', error)
    // Return a placeholder hash if git fails
    return 'initial-scaffold-' + Date.now()
  }
}

/**
 * Store project files in database
 */
async function storeProjectFiles(
  projectId: string, 
  files: Array<{ name: string; path: string; content: string }>
): Promise<void> {
  const filesData = files.map(file => ({
    projectId,
    name: file.name,
    path: file.path,
    content: file.content,
    type: 'file'
  }))
  
  await prisma.projectFile.createMany({
    data: filesData,
    skipDuplicates: true
  })
}


// File generation helper functions
function generateReadme(name: string, language: string, framework: string | null): string {
  return `# ${name}

A ${language} project${framework ? ` built with ${framework}` : ''} created with DevFlowHub.

## Getting Started

This project was scaffolded with DevFlowHub's AI-powered development environment.

## Development

Start coding in the \`src/\` directory.

## Features

- Modern development setup
- AI-powered assistance
- Real-time collaboration
- Integrated deployment

Happy coding! 🚀
`
}

function generateGitignore(language: string): string {
  const common = `# Dependencies
node_modules/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`

  if (language.toLowerCase() === 'python') {
    return common + `
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
`
  }

  return common
}

function generatePackageJson(name: string, framework: string | null, isTypeScript: boolean): string {
  const basePackage = {
    name: name.toLowerCase().replace(/\s+/g, '-'),
    version: '0.0.1',
    description: `A ${framework || 'vanilla'} project created with DevFlowHub`,
    main: 'src/index.js',
    scripts: {
      start: 'node src/index.js',
      dev: 'node src/index.js',
      build: isTypeScript ? 'tsc' : 'echo "No build step needed"'
    },
    keywords: ['devflowhub', 'ai', 'development'],
    author: 'DevFlowHub User',
    license: 'MIT'
  }

  if (framework === 'react') {
    basePackage.scripts = {
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test',
      eject: 'react-scripts eject'
    }
  } else if (framework === 'express') {
    basePackage.scripts = {
      start: 'node src/server.js',
      dev: 'nodemon src/server.js'
    }
  }

  return JSON.stringify(basePackage, null, 2)
}

function generateBasicIndex(name: string, isTypeScript: boolean): string {
  const typeAnnotation = isTypeScript ? ': string' : ''
  return `// ${name} - Main entry point
// Created with DevFlowHub

function main() {
  const message${typeAnnotation} = "Welcome to ${name}!";
  console.log(message);
  
  // Start coding here!
}

main();
`
}

function generateReactApp(name: string, isTypeScript: boolean): string {
  const typeAnnotation = isTypeScript ? ': React.FC' : ''
  return `import React from 'react';

const App${typeAnnotation} = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to ${name}</h1>
        <p>This React app was created with DevFlowHub</p>
      </header>
    </div>
  );
};

export default App;
`
}

function generateReactIndex(isTypeScript: boolean): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
}

function generateExpressServer(name: string, isTypeScript: boolean): string {
  return `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to ${name}!',
    created: 'DevFlowHub'
  });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`
}

function generatePythonMain(name: string, framework: string | null): string {
  return `#!/usr/bin/env python3
"""
${name} - Main entry point
Created with DevFlowHub
"""

def main():
    print("Welcome to ${name}!")
    print("This Python project was created with DevFlowHub")
    
    # Start coding here!

if __name__ == "__main__":
    main()
`
}

function generatePythonRequirements(framework: string | null): string {
  const base = `# Core dependencies
requests>=2.28.0
python-dotenv>=0.19.0
`

  if (framework === 'flask') {
    return base + `flask>=2.0.0
flask-cors>=3.0.0
`
  } else if (framework === 'django') {
    return base + `django>=4.0.0
djangorestframework>=3.13.0
`
  }

  return base
}

function generateJavaMain(className: string): string {
  return `public class ${className} {
    public static void main(String[] args) {
        System.out.println("Welcome to ${className}!");
        System.out.println("This Java project was created with DevFlowHub");
        
        // Start coding here!
    }
}
`
}

function generateTsConfig(): string {
  return `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`
}
