export type TemplateId = 'nextjs-app' | 'react-app' | 'express-api' | 'python-fastapi' | 'nextjs-fullstack' | 'express-prisma' | 'todo-app' | 'blog-next' | 'api-server' | 'empty'

export interface TemplateFile {
  path: string
  content: string
  type?: 'file' | 'dir'
}

export interface ProjectTemplate {
  id: TemplateId
  name: string
  description: string
  language: string
  framework?: string
  type: string
  files: TemplateFile[]
}

export const templates: ProjectTemplate[] = [
  {
    id: 'nextjs-app',
    name: 'Next.js App',
    description: 'Modern React framework with SSR, API routes, and file-based routing',
    language: 'TypeScript',
    framework: 'Next.js',
    type: 'quick-iteration',
    files: [
      { path: 'README.md', content: '# Next.js App\n\nA modern Next.js application with TypeScript.\n\n## Getting Started\n\n```bash\nnpm install\nnpm run dev\n```' },
      { path: 'package.json', content: JSON.stringify({ name: 'nextjs-app', version: '0.1.0', scripts: { dev: 'next dev', build: 'next build', start: 'next start' }, dependencies: { next: '^14.0.0', react: '^18.0.0', 'react-dom': '^18.0.0' } }, null, 2) },
      { path: 'src/app/page.tsx', content: "export default function Home() {\n  return (\n    <main className=\"flex min-h-screen flex-col items-center justify-center p-24\">\n      <h1 className=\"text-4xl font-bold\">Welcome to Next.js!</h1>\n    </main>\n  )\n}" },
      { path: 'tsconfig.json', content: JSON.stringify({ compilerOptions: { target: 'es5', lib: ['dom', 'dom.iterable', 'esnext'], allowJs: true, skipLibCheck: true, strict: true, forceConsistentCasingInFileNames: true, noEmit: true, esModuleInterop: true, module: 'esnext', moduleResolution: 'bundler', resolveJsonModule: true, isolatedModules: true, jsx: 'preserve', incremental: true, plugins: [{ name: 'next' }], paths: { '@/*': ['./src/*'] } }, include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'], exclude: ['node_modules'] }, null, 2) },
    ],
  },
  {
    id: 'react-app',
    name: 'React App',
    description: 'Single-page application with React and Vite',
    language: 'TypeScript',
    framework: 'React',
    type: 'ui-design',
    files: [
      { path: 'README.md', content: '# React App\n\nA React application with Vite and TypeScript.\n\n## Getting Started\n\n```bash\nnpm install\nnpm run dev\n```' },
      { path: 'package.json', content: JSON.stringify({ name: 'react-app', version: '0.1.0', type: 'module', scripts: { dev: 'vite', build: 'tsc && vite build', preview: 'vite preview' }, dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' }, devDependencies: { '@types/react': '^18.2.0', '@types/react-dom': '^18.2.0', '@vitejs/plugin-react': '^4.0.0', typescript: '^5.0.0', vite: '^4.4.0' } }, null, 2) },
      { path: 'src/App.tsx', content: "import { useState } from 'react'\n\nfunction App() {\n  return (\n    <div className=\"App\">\n      <h1>React App</h1>\n    </div>\n  )\n}\n\nexport default App" },
      { path: 'src/main.tsx', content: "import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App'\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)" },
      { path: 'vite.config.ts', content: "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})" },
    ],
  },
  {
    id: 'express-api',
    name: 'Express API',
    description: 'RESTful API server with Express and TypeScript',
    language: 'TypeScript',
    framework: 'Express',
    type: 'api-server',
    files: [
      { path: 'README.md', content: '# Express API\n\nA RESTful API server built with Express and TypeScript.\n\n## Getting Started\n\n```bash\nnpm install\nnpm run dev\n```' },
      { path: 'package.json', content: JSON.stringify({ name: 'express-api', version: '0.1.0', scripts: { dev: 'ts-node-dev --respawn --transpile-only src/index.ts', build: 'tsc', start: 'node dist/index.js' }, dependencies: { express: '^4.18.0', cors: '^2.8.5' }, devDependencies: { '@types/express': '^4.17.0', '@types/cors': '^2.8.0', '@types/node': '^20.0.0', 'ts-node-dev': '^2.0.0', typescript: '^5.0.0' } }, null, 2) },
      { path: 'src/index.ts', content: "import express from 'express'\nimport cors from 'cors'\n\nconst app = express()\nconst PORT = process.env.PORT || 3000\n\napp.use(cors())\napp.use(express.json())\n\napp.get('/api/health', (req, res) => {\n  res.json({ status: 'ok', timestamp: new Date().toISOString() })\n})\n\napp.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`)\n})" },
      { path: 'tsconfig.json', content: JSON.stringify({ compilerOptions: { target: 'ES2020', module: 'commonjs', lib: ['ES2020'], outDir: './dist', rootDir: './src', strict: true, esModuleInterop: true, skipLibCheck: true, forceConsistentCasingInFileNames: true, resolveJsonModule: true }, include: ['src/**/*'], exclude: ['node_modules'] }, null, 2) },
    ],
  },
  {
    id: 'python-fastapi',
    name: 'FastAPI',
    description: 'Modern Python API with automatic docs and async support',
    language: 'Python',
    framework: 'FastAPI',
    type: 'api-server',
    files: [
      { path: 'README.md', content: '# FastAPI Application\n\nA modern Python API built with FastAPI.\n\n## Getting Started\n\n```bash\npip install -r requirements.txt\nuvicorn main:app --reload\n```' },
      { path: 'main.py', content: "from fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\n\napp = FastAPI(title=\"FastAPI App\", version=\"1.0.0\")\n\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=[\"*\"],\n    allow_credentials=True,\n    allow_methods=[\"*\"],\n    allow_headers=[\"*\"],\n)\n\n@app.get(\"/\")\ndef read_root():\n    return {\"message\": \"Hello from FastAPI\"}\n\n@app.get(\"/api/health\")\ndef health_check():\n    return {\"status\": \"ok\"}" },
      { path: 'requirements.txt', content: 'fastapi==0.104.1\nuvicorn[standard]==0.24.0' },
    ],
  },
  {
    id: 'nextjs-fullstack',
    name: 'Next.js Full-Stack',
    description: 'Complete app with frontend, API routes, and database',
    language: 'TypeScript',
    framework: 'Next.js',
    type: 'quick-iteration',
    files: [
      { path: 'README.md', content: '# Next.js Full-Stack App\n\nA complete full-stack application with Next.js, Prisma, and PostgreSQL.\n\n## Getting Started\n\n```bash\nnpm install\nnpx prisma migrate dev\nnpm run dev\n```' },
      { path: 'package.json', content: JSON.stringify({ name: 'nextjs-fullstack', version: '0.1.0', scripts: { dev: 'next dev', build: 'next build', start: 'next start', 'db:migrate': 'prisma migrate dev' }, dependencies: { next: '^14.0.0', react: '^18.0.0', 'react-dom': '^18.0.0', '@prisma/client': '^5.0.0' }, devDependencies: { prisma: '^5.0.0', typescript: '^5.0.0' } }, null, 2) },
      { path: 'src/app/page.tsx', content: "export default function Home() {\n  return (\n    <main>\n      <h1>Next.js Full-Stack App</h1>\n    </main>\n  )\n}" },
      { path: 'src/app/api/health/route.ts', content: "import { NextResponse } from 'next/server'\n\nexport async function GET() {\n  return NextResponse.json({ status: 'ok' })\n}" },
      { path: 'prisma/schema.prisma', content: 'generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\nmodel User {\n  id    String @id @default(cuid())\n  email String @unique\n  name  String?\n}' },
    ],
  },
  {
    id: 'express-prisma',
    name: 'Express + Prisma',
    description: 'Backend API with Express, Prisma ORM, and PostgreSQL',
    language: 'TypeScript',
    framework: 'Express',
    type: 'api-server',
    files: [
      { path: 'README.md', content: '# Express + Prisma API\n\nA backend API with Express, Prisma ORM, and PostgreSQL.\n\n## Getting Started\n\n```bash\nnpm install\nnpx prisma migrate dev\nnpm run dev\n```' },
      { path: 'package.json', content: JSON.stringify({ name: 'express-prisma', version: '0.1.0', scripts: { dev: 'ts-node-dev --respawn --transpile-only src/index.ts', build: 'tsc', start: 'node dist/index.js', 'db:migrate': 'prisma migrate dev' }, dependencies: { express: '^4.18.0', '@prisma/client': '^5.0.0', cors: '^2.8.5' }, devDependencies: { '@types/express': '^4.17.0', '@types/cors': '^2.8.0', '@types/node': '^20.0.0', prisma: '^5.0.0', 'ts-node-dev': '^2.0.0', typescript: '^5.0.0' } }, null, 2) },
      { path: 'src/index.ts', content: "import express from 'express'\nimport cors from 'cors'\nimport { PrismaClient } from '@prisma/client'\n\nconst app = express()\nconst prisma = new PrismaClient()\nconst PORT = process.env.PORT || 3000\n\napp.use(cors())\napp.use(express.json())\n\napp.get('/api/health', async (req, res) => {\n  res.json({ status: 'ok' })\n})\n\napp.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`)\n})" },
      { path: 'prisma/schema.prisma', content: 'generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\nmodel User {\n  id    String @id @default(cuid())\n  email String @unique\n  name  String?\n}' },
    ],
  },
  {
    id: 'todo-app',
    name: 'Todo App (React + Node)',
    description: 'Full-stack todo app starter using React and Node.',
    language: 'JavaScript',
    framework: 'Next.js',
    type: 'quick-iteration',
    files: [
      { path: 'README.md', content: '# Todo App\n\nGetting started...' },
      { path: 'src/pages/index.tsx', content: "export default function Home(){return (<div>Todo App</div>)}" },
      { path: 'src/server/index.ts', content: "import express from 'express'; const app=express(); app.get('/api/health',(_,res)=>res.json({ok:true})); app.listen(4000);" },
      { path: 'package.json', content: JSON.stringify({ name: 'todo-app', private: true }, null, 2) },
    ],
  },
  {
    id: 'blog-next',
    name: 'Blog (Next.js)',
    description: 'Content-driven blog with Next.js.',
    language: 'TypeScript',
    framework: 'Next.js',
    type: 'ui-design',
    files: [
      { path: 'README.md', content: '# Blog Starter' },
      { path: 'src/pages/index.tsx', content: "export default function Blog(){return (<main><h1>Blog</h1></main>)}" },
      { path: 'package.json', content: JSON.stringify({ name: 'blog-next', private: true }, null, 2) },
    ],
  },
  {
    id: 'api-server',
    name: 'API Server (Express + Prisma)',
    description: 'API server with Express and Prisma.',
    language: 'TypeScript',
    framework: 'Express',
    type: 'api-server',
    files: [
      { path: 'README.md', content: '# API Server' },
      { path: 'src/index.ts', content: "import express from 'express'; const app=express(); app.get('/health',(_,res)=>res.json({ok:true})); app.listen(4000);" },
      { path: 'prisma/schema.prisma', content: 'datasource db { provider = "postgresql" url = env("DATABASE_URL") } generator client { provider = "prisma-client-js" }' },
      { path: 'package.json', content: JSON.stringify({ name: 'api-server', private: true }, null, 2) },
    ],
  },
  {
    id: 'empty',
    name: 'Empty Project',
    description: 'Start from a blank slate.',
    language: 'JavaScript',
    framework: '',
    type: 'quick-iteration',
    files: [
      { path: 'README.md', content: '# New Project' },
    ],
  },
]

export function getTemplate(id: TemplateId) {
  return templates.find(t => t.id === id)
}


