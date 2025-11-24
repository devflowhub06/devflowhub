# 🚀 DevFlowHub - The World's First AI Development OS

**A unified, AI-powered development workspace that brings together code editing, sandboxing, UI generation, and deployment in one seamless platform.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Core Modules](#core-modules)
- [API Documentation](#api-documentation)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

DevFlowHub is a comprehensive, production-ready platform that integrates four powerful development tools into a single unified workspace:

1. **DevFlowHub Editor** - Full-featured code editor with AI assistance (Monaco-based)
2. **DevFlowHub Sandbox** - In-browser code execution and testing environment
3. **DevFlowHub UI Studio** - AI-powered UI component generation
4. **DevFlowHub Deployer** - Multi-provider deployment system

Built with modern web technologies and AI-first architecture, DevFlowHub provides developers with everything they need to code, test, and deploy applications without leaving the browser.

---

## ✨ Key Features

### 🤖 AI-Powered Development
- **Code Generation**: Generate code from natural language prompts
- **Intelligent Autocomplete**: AI-powered code suggestions and completions
- **Code Analysis**: Automated refactoring and optimization suggestions
- **Chat Assistant**: Conversational AI for development questions
- **RAG Integration**: Codebase-aware AI responses using retrieval-augmented generation
- **Test Generation**: Automated test case generation
- **Terminal Suggestions**: AI-powered terminal command recommendations

### 📝 Unified Editor Experience
- Monaco Editor (VS Code in browser) with full TypeScript support
- Real file system integration
- Integrated terminal with command execution
- Git operations (init, commit, push, branches, PRs)
- Multi-file editing and operations
- Live preview and hot reload
- Autosave functionality
- Code diff visualization

### 🧪 Sandbox Environment
- Real-time code execution
- Live preview environment
- Package management (npm, yarn, pnpm)
- Terminal access
- Snapshot support for state management
- Run management and process control
- Cost tracking and usage monitoring

### 🎨 UI Studio
- AI-powered component generation from prompts
- Component library and marketplace
- Live preview with Sandpack
- Design system integration
- Figma import capabilities
- Component customization and editing

### 🚀 Deployment System
- Multi-provider support (Vercel, Netlify, AWS, GCP)
- Preview environments per branch
- Deployment history and rollback
- Environment variable management
- Build logs and status tracking
- Cost estimation and quota management

### 💳 Payment & Billing
- Stripe integration (US/International)
- Razorpay integration (India)
- Subscription management
- Usage-based billing
- Invoice generation
- Multiple pricing tiers

### 📊 Analytics & Monitoring
- User action tracking
- Tool usage analytics
- Conversion funnels
- System health metrics
- Cost tracking
- Performance monitoring

### 🔐 Security & Authentication
- NextAuth.js with JWT strategy
- Email/password authentication
- Google OAuth integration
- Session management
- Route protection
- CSRF protection
- Secure password hashing

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework with Server Components
- **React 18.3** - UI library with concurrent features
- **TypeScript 5.8** - Type-safe development
- **TailwindCSS 3.4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion 12** - Animation library
- **Zustand 5** - Lightweight state management
- **SWR 2.3** - Data fetching and caching

### Backend
- **Next.js API Routes** - 157+ RESTful endpoints
- **Prisma 6.10** - Next-generation ORM
- **PostgreSQL** - Primary database
- **NextAuth.js 4.24** - Authentication framework

### AI & Services
- **OpenAI API** (GPT-4, GPT-4o-mini) - Code generation and AI assistance
- **RAG** (Retrieval-Augmented Generation) - Codebase-aware responses
- **Vercel API** - Deployment integration
- **Stripe + Razorpay** - Payment processing

### Development Tools
- **Monaco Editor** - VS Code editor in browser
- **Sandpack** - In-browser code execution
- **XTerm.js** - Terminal emulator
- **jsdiff** - Code diff visualization

### Testing & Quality
- **Jest** - Unit testing
- **Testing Library** - React component testing
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **TypeScript** - Type checking

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- OpenAI API key (for AI features)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/devflowhub06/devflowhub.git
   cd devflowhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/devflowhub"
   
   # Authentication
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # OpenAI
   OPENAI_API_KEY="sk-..."
   
   # Optional: OAuth
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   
   # Optional: Payments
   STRIPE_SECRET_KEY="sk_..."
   RAZORPAY_KEY_ID="..."
   RAZORPAY_KEY_SECRET="..."
   
   # Optional: Deployment
   VERCEL_TOKEN="..."
   VERCEL_ORG_ID="..."
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # (Optional) Seed database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
devFlow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (157+ endpoints)
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── projects/     # Project management
│   │   │   ├── editor/       # Editor operations
│   │   │   ├── sandbox/      # Sandbox operations
│   │   │   ├── ui-studio/    # UI Studio operations
│   │   │   ├── deployer/     # Deployment operations
│   │   │   ├── ai/           # AI services
│   │   │   ├── billing/      # Payment processing
│   │   │   └── analytics/    # Analytics tracking
│   │   ├── dashboard/         # Dashboard pages
│   │   │   └── projects/     # Project workspace
│   │   └── (auth)/           # Auth pages
│   ├── components/            # React components (200+ files)
│   │   ├── ui/               # Base UI components
│   │   ├── editor/           # Editor components
│   │   ├── sandbox/          # Sandbox components
│   │   ├── ui-studio/        # UI Studio components
│   │   ├── deployer/         # Deployer components
│   │   └── dashboard/        # Dashboard components
│   ├── lib/                   # Utility libraries
│   │   ├── prisma.ts         # Database client
│   │   ├── authOptions.ts    # Auth configuration
│   │   ├── ai/               # AI services
│   │   ├── deployer/         # Deployment services
│   │   └── services/         # Integration services
│   └── types/                # TypeScript type definitions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── public/                    # Static assets
├── scripts/                   # Utility scripts
└── workspace-service/         # Standalone workspace service
```

---

## 🎯 Core Modules

### 1. DevFlowHub Editor

Full-featured code editor with AI assistance, built on Monaco Editor.

**Key Features:**
- Monaco editor with TypeScript support
- Real file system integration
- AI-powered code suggestions
- Git integration
- Integrated terminal
- Multi-file operations
- Code analysis and refactoring

**API Endpoints:**
- `POST /api/editor/ai/chat-stream` - Streaming AI chat
- `POST /api/editor/ai/complete` - Code completion
- `POST /api/editor/ai/edit` - AI code editing
- `POST /api/editor/ai/multi-file` - Multi-file operations
- `POST /api/editor/ai/tests` - Test generation

### 2. DevFlowHub Sandbox

In-browser code execution and testing environment.

**Key Features:**
- Real-time code execution
- Live preview
- Package management
- Terminal access
- Snapshot support
- Run management

**API Endpoints:**
- `POST /api/sandbox/[projectId]/run` - Execute code
- `GET /api/sandbox/[projectId]/run/[runId]/status` - Check status
- `GET /api/sandbox/[projectId]/run/[runId]/logs` - Get logs

### 3. DevFlowHub UI Studio

AI-powered UI component generation.

**Key Features:**
- Component generation from prompts
- Component library
- Live preview
- Figma import
- Design system integration

**API Endpoints:**
- `POST /api/ui-studio/generate` - Generate component
- `GET /api/ui-studio/components` - List components
- `POST /api/ui-studio/insert` - Insert component

### 4. DevFlowHub Deployer

Multi-provider deployment system.

**Key Features:**
- Multi-provider support (Vercel, Netlify, AWS, GCP)
- Preview environments
- Deployment history
- Rollback capabilities
- Environment management

**API Endpoints:**
- `POST /api/deployer/[projectId]/deploy` - Deploy project
- `GET /api/deployer/[projectId]/deploy/[deployId]/status` - Check status
- `POST /api/deployer/[projectId]/deploy/[deployId]/rollback` - Rollback

---

## 📚 API Documentation

The API consists of 157+ RESTful endpoints organized by feature:

- **Authentication**: `/api/auth/*`
- **Projects**: `/api/projects/*`
- **Editor**: `/api/editor/*`
- **Sandbox**: `/api/sandbox/*`
- **UI Studio**: `/api/ui-studio/*`
- **Deployer**: `/api/deployer/*`
- **AI Services**: `/api/ai/*`
- **Billing**: `/api/billing/*`
- **Analytics**: `/api/analytics/*`

All endpoints require authentication (except public routes) and return JSON responses.

---

## ⚙️ Environment Setup

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/devflowhub"

# Authentication
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (Required for AI features)
OPENAI_API_KEY="sk-..."
```

### Optional Environment Variables

```env
# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Payments
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."

# Deployment
VERCEL_TOKEN="..."
VERCEL_ORG_ID="..."

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="..."
NEXT_PUBLIC_POSTHOG_HOST="..."
```

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server on port 3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate   # Run migrations
npx prisma studio    # Open Prisma Studio
npx prisma db seed   # Seed database

# Testing
npm test             # Run Jest tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report

# Type Checking
npm run type-check   # TypeScript validation

# Linting
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix issues
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting (if configured)
- Component-based architecture
- Server Components by default
- Client Components when needed

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically deploy on push

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Database Migration

```bash
# Run migrations in production
npx prisma migrate deploy
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Ensure all tests pass before submitting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Repository**: [https://github.com/devflowhub06/devflowhub](https://github.com/devflowhub06/devflowhub)
- **Documentation**: See `PRODUCT_ANALYSIS.md` and `TECH_STACK_ARCHITECTURE.md`
- **Issues**: [GitHub Issues](https://github.com/devflowhub06/devflowhub/issues)

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [OpenAI](https://openai.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons and assets from various open-source projects

---

## 📞 Support

For support, email support@devflowhub.com or open an issue on GitHub.

---

**Made with ❤️ by the DevFlowHub team**
