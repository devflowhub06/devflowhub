export interface ProjectTemplate {
  id: string
  name: string
  description: string
  type: string
  language: string
  framework: string
  recommendedTool: string
  files: TemplateFile[]
  tags: string[]
}

export interface TemplateFile {
  name: string
  path: string
  content: string
  type: 'file' | 'folder'
}

export const templates: ProjectTemplate[] = [
  {
    id: 'todo-app',
    name: 'Todo App',
    description: 'A full-stack todo application with React frontend and Node.js backend',
    type: 'web-app',
    language: 'JavaScript',
    framework: 'React + Node.js',
    recommendedTool: 'sandbox',
    tags: ['react', 'node', 'fullstack', 'todo'],
    files: [
      {
        name: 'package.json',
        path: 'package.json',
        type: 'file',
        content: `{
  "name": "todo-app",
  "version": "1.0.0",
  "description": "A full-stack todo application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "client": "cd client && npm start",
    "build": "cd client && npm run build"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}`
      },
      {
        name: 'server.js',
        path: 'server.js',
        type: 'file',
        content: `const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage (replace with database in production)
let todos = [
  { id: uuidv4(), text: 'Learn DevFlowHub', completed: false },
  { id: uuidv4(), text: 'Build amazing projects', completed: false }
];

// Routes
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  const newTodo = {
    id: uuidv4(),
    text,
    completed: false
  };
  
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  
  const todo = todos.find(t => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  todo.completed = completed;
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  todos = todos.filter(t => t.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
      },
      {
        name: 'client',
        path: 'client',
        type: 'folder',
        content: ''
      },
      {
        name: 'package.json',
        path: 'client/package.json',
        type: 'file',
        content: `{
  "name": "todo-client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "axios": "^1.4.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`
      },
      {
        name: 'App.js',
        path: 'client/src/App.js',
        type: 'file',
        content: `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(\`\${API_URL}/todos\`);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await axios.post(\`\${API_URL}/todos\`, {
        text: newTodo
      });
      setTodos([...todos, response.data]);
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      await axios.put(\`\${API_URL}/todos/\${id}\`, { completed });
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(\`\${API_URL}/todos/\${id}\`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo App</h1>
        <form onSubmit={addTodo} className="todo-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="todo-input"
          />
          <button type="submit" className="add-button">Add</button>
        </form>
        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo.id} className={\`todo-item \${todo.completed ? 'completed' : ''}\`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                className="todo-checkbox"
              />
              <span className="todo-text">{todo.text}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="delete-button"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;`
      },
      {
        name: 'App.css',
        path: 'client/src/App.css',
        type: 'file',
        content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.App {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  border-radius: 10px;
  margin-bottom: 20px;
}

.todo-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.todo-input {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
}

.add-button {
  padding: 10px 20px;
  background-color: #61dafb;
  color: #282c34;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  margin-bottom: 5px;
  border-radius: 5px;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
}

.todo-text {
  flex: 1;
  text-align: left;
}

.delete-button {
  padding: 5px 10px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}`
      }
    ]
  },
  {
    id: 'blog-nextjs',
    name: 'Blog (Next.js)',
    description: 'A modern blog built with Next.js, featuring SSG and dynamic routing',
    type: 'web-app',
    language: 'TypeScript',
    framework: 'Next.js',
    recommendedTool: 'editor',
    tags: ['nextjs', 'typescript', 'blog', 'ssg'],
    files: [
      {
        name: 'package.json',
        path: 'package.json',
        type: 'file',
        content: `{
  "name": "nextjs-blog",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0"
  }
}`
      },
      {
        name: 'next.config.js',
        path: 'next.config.js',
        type: 'file',
        content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig`
      },
      {
        name: 'tsconfig.json',
        path: 'tsconfig.json',
        type: 'file',
        content: `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`
      },
      {
        name: 'app/layout.tsx',
        path: 'app/layout.tsx',
        type: 'file',
        content: `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Blog',
  description: 'A modern blog built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="header">
          <h1>My Blog</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <p>&copy; 2024 My Blog. Built with Next.js</p>
        </footer>
      </body>
    </html>
  )
}`
      },
      {
        name: 'app/page.tsx',
        path: 'app/page.tsx',
        type: 'file',
        content: `import Link from 'next/link'
import { getPosts } from '@/lib/posts'

export default async function Home() {
  const posts = await getPosts()

  return (
    <div className="container">
      <h1>Welcome to My Blog</h1>
      <p>Discover amazing stories and insights.</p>
      
      <div className="posts-grid">
        {posts.map((post) => (
          <article key={post.slug} className="post-card">
            <h2>
              <Link href={\`/posts/\${post.slug}\`}>
                {post.title}
              </Link>
            </h2>
            <p className="post-meta">
              {post.date} • {post.readTime} min read
            </p>
            <p className="post-excerpt">{post.excerpt}</p>
            <Link href={\`/posts/\${post.slug}\`} className="read-more">
              Read More →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}`
      },
      {
        name: 'app/posts/[slug]/page.tsx',
        path: 'app/posts/[slug]/page.tsx',
        type: 'file',
        content: `import { notFound } from 'next/navigation'
import { getPost, getPosts } from '@/lib/posts'
import Link from 'next/link'

interface PostPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="post">
      <header className="post-header">
        <h1>{post.title}</h1>
        <p className="post-meta">
          {post.date} • {post.readTime} min read
        </p>
      </header>
      
      <div className="post-content">
        {post.content}
      </div>
      
      <footer className="post-footer">
        <Link href="/" className="back-link">
          ← Back to Home
        </Link>
      </footer>
    </article>
  )
}`
      },
      {
        name: 'lib/posts.ts',
        path: 'lib/posts.ts',
        type: 'file',
        content: `export interface Post {
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: number
}

const posts: Post[] = [
  {
    slug: 'getting-started-with-nextjs',
    title: 'Getting Started with Next.js',
    excerpt: 'Learn the basics of Next.js and how to build modern web applications.',
    content: \`<h2>Introduction</h2>
<p>Next.js is a React framework that provides a great developer experience with features like server-side rendering, static site generation, and more.</p>

<h2>Key Features</h2>
<ul>
  <li>Server-Side Rendering (SSR)</li>
  <li>Static Site Generation (SSG)</li>
  <li>Automatic Code Splitting</li>
  <li>Built-in CSS Support</li>
  <li>API Routes</li>
</ul>

<h2>Getting Started</h2>
<p>To create a new Next.js project, run:</p>
<pre><code>npx create-next-app@latest my-app</code></pre>

<p>This will create a new Next.js application with all the necessary files and dependencies.</p>\`,
    date: '2024-01-15',
    readTime: 5
  },
  {
    slug: 'building-modern-blogs',
    title: 'Building Modern Blogs',
    excerpt: 'Tips and tricks for creating engaging blog content and user experiences.',
    content: \`<h2>Content Strategy</h2>
<p>Great blog content starts with a solid strategy. Focus on providing value to your readers.</p>

<h2>Writing Tips</h2>
<ul>
  <li>Write clear, concise headlines</li>
  <li>Use subheadings to break up content</li>
  <li>Include relevant images and media</li>
  <li>End with a clear call-to-action</li>
</ul>

<h2>Technical Considerations</h2>
<p>Make sure your blog is fast, accessible, and SEO-friendly.</p>\`,
    date: '2024-01-10',
    readTime: 3
  }
]

export async function getPosts(): Promise<Post[]> {
  return posts
}

export async function getPost(slug: string): Promise<Post | null> {
  return posts.find(post => post.slug === slug) || null
}`
      },
      {
        name: 'app/globals.css',
        path: 'app/globals.css',
        type: 'file',
        content: `* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: #333;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
}

.header {
  background: #f8f9fa;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  color: #2c3e50;
}

.header nav {
  display: flex;
  gap: 2rem;
}

.header nav a {
  color: #6c757d;
  text-decoration: none;
  font-weight: 500;
}

.header nav a:hover {
  color: #2c3e50;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.posts-grid {
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
}

.post-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.post-card h2 a {
  color: #2c3e50;
  text-decoration: none;
}

.post-card h2 a:hover {
  color: #007bff;
}

.post-meta {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.post-excerpt {
  color: #555;
  margin: 1rem 0;
}

.read-more {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.post {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.post-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.post-content {
  line-height: 1.8;
  margin-bottom: 2rem;
}

.post-content h2 {
  margin: 2rem 0 1rem 0;
  color: #2c3e50;
}

.post-content p {
  margin-bottom: 1rem;
}

.post-content ul {
  margin: 1rem 0;
  padding-left: 2rem;
}

.post-content pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1rem 0;
}

.post-footer {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.back-link {
  color: #6c757d;
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  color: #007bff;
}

.footer {
  background: #f8f9fa;
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  border-top: 1px solid #e9ecef;
  margin-top: 4rem;
}`
      }
    ]
  },
  {
    id: 'api-server',
    name: 'API Server',
    description: 'A RESTful API server with Express.js, Prisma ORM, and PostgreSQL',
    type: 'api',
    language: 'TypeScript',
    framework: 'Express + Prisma',
    recommendedTool: 'editor',
    tags: ['express', 'prisma', 'postgresql', 'api', 'typescript'],
    files: [
      {
        name: 'package.json',
        path: 'package.json',
        type: 'file',
        content: `{
  "name": "api-server",
  "version": "1.0.0",
  "description": "A RESTful API server with Express and Prisma",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/morgan": "^1.9.4",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node-dev": "^2.0.0",
    "prisma": "^5.0.0"
  }
}`
      },
      {
        name: 'tsconfig.json',
        path: 'tsconfig.json',
        type: 'file',
        content: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`
      },
      {
        name: 'prisma/schema.prisma',
        path: 'prisma/schema.prisma',
        type: 'file',
        content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`
      },
      {
        name: 'src/server.ts',
        path: 'src/server.ts',
        type: 'file',
        content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Users routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { posts: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, name } = req.body;
    const user = await prisma.user.create({
      data: { email, name }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create user' });
  }
});

// Posts routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: true }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, authorId } = req.body;
    const post = await prisma.post.create({
      data: { title, content, authorId },
      include: { author: true }
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create post' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, published } = req.body;
    
    const post = await prisma.post.update({
      where: { id },
      data: { title, content, published },
      include: { author: true }
    });
    
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update post' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.post.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete post' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
  console.log(\`Health check: http://localhost:\${PORT}/health\`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});`
      },
      {
        name: '.env.example',
        path: '.env.example',
        type: 'file',
        content: `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/api_server_db"

# Server
PORT=3000
NODE_ENV=development`
      },
      {
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        content: `# API Server

A RESTful API server built with Express.js, TypeScript, and Prisma ORM.

## Features

- RESTful API endpoints
- PostgreSQL database with Prisma ORM
- TypeScript for type safety
- CORS enabled
- Security headers with Helmet
- Request logging with Morgan

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your database URL
   \`\`\`

3. Set up the database:
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## API Endpoints

### Health Check
- \`GET /health\` - Server health status

### Users
- \`GET /api/users\` - Get all users
- \`POST /api/users\` - Create a new user

### Posts
- \`GET /api/posts\` - Get all posts
- \`POST /api/posts\` - Create a new post
- \`GET /api/posts/:id\` - Get a specific post
- \`PUT /api/posts/:id\` - Update a post
- \`DELETE /api/posts/:id\` - Delete a post

## Database Schema

The API uses a simple schema with Users and Posts:

- **User**: id, email, name, createdAt, updatedAt
- **Post**: id, title, content, published, authorId, createdAt, updatedAt`
      }
    ]
  },
  {
    id: 'empty-project',
    name: 'Empty Project',
    description: 'A clean slate to start your project from scratch',
    type: 'custom',
    language: 'JavaScript',
    framework: 'None',
    recommendedTool: 'sandbox',
    tags: ['empty', 'starter', 'custom'],
    files: [
      {
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        content: `# My Project

Welcome to your new project! This is a clean slate for you to build upon.

## Getting Started

1. Add your project files here
2. Update this README with your project details
3. Start building something amazing!

## Project Structure

\`\`\`
.
├── README.md
└── (your files will go here)
\`\`\`

Happy coding! 🚀`
      }
    ]
  }
]
