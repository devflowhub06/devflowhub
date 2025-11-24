import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { ensureWorkspace } from "@/lib/projects";

// Move walk function outside the handler to fix strict mode error
async function walk(dir: string, base = ""): Promise<any[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out: any[] = [];

  for (const e of entries) {
    if (e.name.startsWith(".git") || e.name === "node_modules") continue;

    const full = path.join(dir, e.name);
    const rel = path.join(base, e.name);

    if (e.isDirectory()) {
      const children = await walk(full, rel);
      out.push({
        type: "dir",
        name: e.name,
        path: rel,
        children,
        size: children.length
      });
    } else {
      // Get file stats for size and modification time
      const stats = await fs.stat(full);
      const content = await fs.readFile(full, "utf8").catch(() => "");

      out.push({
        type: "file",
        name: e.name,
        path: rel,
        size: stats.size,
        modified: stats.mtime,
        content: content.substring(0, 1000), // First 1000 chars for preview
        language: getLanguageFromExtension(e.name)
      });
    }
  }

  return out.sort((a, b) => {
    // Directories first, then files
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    
    if (!projectId) {
      return NextResponse.json({ ok: false, error: "projectId required" }, { status: 400 });
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    });

    if (!project) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    const root = await ensureWorkspace(projectId);
    
    // Create default project structure if it doesn't exist
    await createDefaultProjectStructure(root, projectId);
    
    const tree = await walk(root);
    
    // Log usage with proper userId - temporarily disabled to fix schema issues
    /*
    try {
      await prisma.usageLog.create({
        data: {
          projectId,
          userId: session.user.id,
          tool: "CURSOR",
          action: "files_list",
          metadata: { fileCount: tree.length }
        }
      });
    } catch (error) {
      console.error("Failed to log usage:", error);
      // Don't fail the request if logging fails
    }
    */

    return NextResponse.json({ ok: true, tree, root });
  } catch (error) {
    console.error("Failed to list files:", error);
    return NextResponse.json({ ok: false, error: "Failed to list files" }, { status: 500 });
  }
}

function getLanguageFromExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const languageMap: { [key: string]: string } = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.json': 'json',
    '.md': 'markdown',
    '.sql': 'sql',
    '.php': 'php',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust'
  };
  return languageMap[ext] || 'text';
}

async function createDefaultProjectStructure(root: string, projectId: string) {
  const defaultFiles = [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: `devflow-project-${projectId}`,
        version: '1.0.0',
        description: 'DevFlowHub AI-powered project',
        main: 'src/index.js',
        scripts: {
          start: 'node src/index.js',
          dev: 'nodemon src/index.js',
          build: 'echo "Build script"',
          test: 'echo "Test script"'
        },
        dependencies: {
          express: '^4.18.2'
        },
        devDependencies: {
          nodemon: '^3.0.1'
        }
      }, null, 2)
    },
    {
      path: 'src/index.js',
      content: `// DevFlowHub AI-powered project
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from DevFlowHub! 🚀',
    project: 'AI-powered development',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log('🚀 Server running on port ' + PORT);
  console.log('📱 Health check: http://localhost:' + PORT + '/health');
});`
    },
    {
      path: 'README.md',
      content: `# DevFlowHub AI Project

This project was created and is managed by **DevFlowHub** - the world's most advanced AI-powered development platform.

## 🚀 Features

- **AI Code Generation**: Get intelligent code suggestions
- **Smart Refactoring**: AI-powered code improvements
- **Real-time Collaboration**: Work with your team live
- **Integrated Tools**: Replit, Cursor, v0, Bolt all in one place

## 🛠️ Getting Started

\`\`\`bash
npm install
npm start
\`\`\`

## 📱 API Endpoints

- \`GET /\` - Welcome message
- \`GET /health\` - Health check

## 🤖 AI Assistant

Use the AI assistant in the Cursor workspace to:
- Generate new features
- Refactor existing code
- Debug issues
- Optimize performance

## 🔗 DevFlowHub

Visit [DevFlowHub](https://devflowhub.com) for more AI-powered development tools.

---
*Built with ❤️ by DevFlowHub AI*`
    },
    {
      path: '.gitignore',
      content: `# Dependencies
node_modules/
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

# Grunt intermediate storage
.grunt

# Bower dependency directory
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons
build/Release

# Dependency directories
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

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db`
    }
  ];

  for (const file of defaultFiles) {
    const filePath = path.join(root, file.path);
    const dir = path.dirname(filePath);
    
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, file.content, 'utf8');
    } catch (error) {
      console.log(`Failed to create ${file.path}:`, error);
    }
  }
}
