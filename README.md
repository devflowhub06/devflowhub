# DevFlowHub - Unified AI Development Workspace

DevFlowHub is a comprehensive development platform that integrates multiple development tools into a single, unified workspace. Built with Next.js 14, TypeScript, and TailwindCSS, it provides a seamless development experience with AI-powered assistance.

## 🚀 Features

### 🔧 Integrated Development Tools

#### **Replit Workspace**
- Create and manage Replit projects directly from DevFlowHub
- Real-time embed integration with fallback support
- Language-specific project templates
- Project metadata and status tracking

#### **Cursor IDE Workspace**
- Full-featured Monaco editor with TypeScript support
- Real file system integration with project files
- Integrated terminal with real command execution
- AI-powered code suggestions and edits
- Git integration (init, commit, push)
- Autosave functionality with usage tracking

#### **V0 Component Generator**
- AI-powered React/Tailwind component generation
- Live preview using Sandpack
- Code viewer with syntax highlighting
- "Insert into Project" functionality
- Component metadata storage

#### **Bolt Deployment**
- Real Vercel API integration
- Staging and production deployments
- Deployment status tracking and polling
- Environment URL management
- Recent deployments history

### 🎯 Core Capabilities

- **Active Tool Sticky State**: Remembers your last used tool per project
- **Real-time File Operations**: Create, read, update, and delete project files
- **AI Integration**: OpenAI-powered code generation and suggestions
- **Usage Analytics**: Track tool usage, actions, and duration
- **Error Handling**: Comprehensive error boundaries and toast notifications
- **Responsive Design**: Modern UI with TailwindCSS and Radix UI components

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS, Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI API
- **Deployment**: Vercel API integration
- **Terminal**: Real command execution with workspace management
- **File System**: Database-backed file storage with real workspace sync

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd devFlow
npm install
```

### 2. Environment Setup

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/devflowhub"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (for AI suggestions)
OPENAI_API_KEY="your-openai-api-key"

# Vercel (for deployments)
VERCEL_TOKEN="your-vercel-token"
VERCEL_ORG_ID="your-vercel-org-id"
VERCEL_PROJECT_ID="your-vercel-project-id"

# Replit (optional, for real API integration)
REPLIT_TOKEN="your-replit-token"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 API Endpoints

### File Operations
- `GET /api/files/list` - List project files
- `GET /api/files/read` - Read file content
- `POST /api/files/save` - Save file content
- `POST /api/files/patch` - Apply AI-generated patches

### Terminal
- `POST /api/terminal/start` - Start terminal session
- `POST /api/terminal/input` - Execute terminal command

### Git Operations
- `POST /api/git/init` - Initialize Git repository
- `POST /api/git/commit` - Commit changes
- `POST /api/git/push` - Push to remote

### AI Integration
- `POST /api/ai/suggest` - Generate AI code suggestions

### Tool Integrations
- `POST /api/replit/create` - Create Replit project
- `GET /api/replit/status` - Get Replit status
- `POST /api/bolt/deploy` - Deploy to Vercel
- `GET /api/bolt/status` - Get deployment status
- `POST /api/v0/generate` - Generate V0 component

### Usage Tracking
- `POST /api/usage` - Log usage events

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   └── ui/               # UI components
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Database client
│   └── authOptions.ts    # Auth configuration
└── prisma/               # Database schema and migrations
```

## 🔐 Authentication

DevFlowHub uses NextAuth.js for authentication. Users can:
- Sign up with email/password
- Sign in with existing credentials
- Access project-specific workspaces
- Manage their development projects

## 📊 Usage Analytics

The platform tracks comprehensive usage metrics:
- Tool usage patterns
- Action frequency and duration
- Project-specific analytics
- Development workflow insights

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Deploy
vercel --prod
```

### Environment Variables for Production

Ensure all environment variables are configured in your production environment:
- Database connection string
- Authentication secrets
- API keys for integrations
- Deployment tokens

## 🧪 Testing

```bash
# Run tests
npm test

# Run Playwright tests
npm run test:e2e

# Run type checking
npm run type-check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
3. Add tests if applicable
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Roadmap

- [ ] Enhanced AI code generation
- [ ] Real-time collaboration features
- [ ] Additional deployment providers
- [ ] Advanced terminal features
- [ ] Mobile app support
- [ ] Plugin system for custom integrations

---

Built with ❤️ by the DevFlowHub team
