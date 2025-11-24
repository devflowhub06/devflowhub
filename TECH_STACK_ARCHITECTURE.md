# DevFlowHub - Tech Stack & Architecture Analysis

## 📋 Table of Contents
1. [Tech Stack Overview](#tech-stack-overview)
2. [Architecture Overview](#architecture-overview)
3. [Core Technologies & Their Usage](#core-technologies--their-usage)
4. [System Architecture](#system-architecture)
5. [Key Features & Integrations](#key-features--integrations)
6. [Data Flow & State Management](#data-flow--state-management)
7. [Development Workflow](#development-workflow)

---

## 🛠️ Tech Stack Overview

### Frontend Stack
- **Next.js 14** (App Router) - React framework with Server Components
- **React 18.3** - UI library with concurrent features
- **TypeScript 5.8** - Type-safe development
- **TailwindCSS 3.4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion 12** - Animation library
- **Zustand 5** - Lightweight state management
- **SWR 2.3** - Data fetching and caching
- **React Hook Form 7** - Form state management
- **Zod 3** - Schema validation

### Backend Stack
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 6.10** - Next-generation ORM
- **PostgreSQL** - Primary database
- **NextAuth.js 4.24** - Authentication framework
- **bcryptjs 3** - Password hashing
- **jsonwebtoken 9** - JWT token management

### AI & ML Services
- **OpenAI API (GPT-4, GPT-4o-mini)** - Code generation, suggestions, and AI assistance
- **RAG (Retrieval-Augmented Generation)** - Codebase-aware AI responses

### Development Tools
- **Monaco Editor** - VS Code editor in browser
- **Sandpack** - In-browser code execution
- **XTerm.js** - Terminal emulator
- **jsdiff** - Code diff visualization

### Payment & Billing
- **Stripe** - Payment processing (US/International)
- **Razorpay** - Payment processing (India)
- **Subscription management** - Recurring billing

### Deployment & Infrastructure
- **Vercel** - Hosting and deployment platform
- **Vercel API** - Real deployment integration
- **AWS S3** - File storage (via @aws-sdk/client-s3)

### Analytics & Monitoring
- **PostHog** - Product analytics
- **Vercel Analytics** - Performance monitoring
- **Custom Analytics Events** - Usage tracking

### Testing
- **Jest** - Unit testing
- **Testing Library** - React component testing
- **Playwright** - E2E testing

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │   React      │  │  Components  │      │
│  │   App Router │  │   Components │  │   (Radix UI) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Monaco      │  │   Sandpack   │  │   XTerm.js   │      │
│  │  Editor      │  │   Preview    │  │   Terminal   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Server (API Routes)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth API    │  │  Projects    │  │  Tools API   │      │
│  │  (NextAuth)  │  │  API         │  │  (Editor,    │      │
│  └──────────────┘  └──────────────┘  │   Sandbox,   │      │
│  ┌──────────────┐  ┌──────────────┐  │   UI Studio, │      │
│  │  AI API      │  │  Deployment  │  │   Deployer)  │      │
│  │  (OpenAI)    │  │  API         │  └──────────────┘      │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
│   PostgreSQL    │ │   OpenAI     │ │   External   │
│   (Prisma ORM)  │ │   API        │ │   Services   │
└─────────────────┘ └──────────────┘ │ (Vercel,     │
                                     │  Stripe,      │
                                     │  Razorpay)    │
                                     └──────────────┘
```

---

## 🔧 Core Technologies & Their Usage

### 1. Next.js 14 (App Router)

**Purpose**: Full-stack React framework with server-side rendering

**How it's used**:
- **App Router**: File-based routing in `src/app/` directory
- **Server Components**: Default for better performance
- **API Routes**: RESTful endpoints in `src/app/api/`
- **Server Actions**: Form submissions and mutations
- **Middleware**: Authentication and route protection (`src/middleware.ts`)

**Key Features Used**:
- Dynamic routes: `[id]`, `[projectId]`
- Route groups: `(auth)`, `(authenticated)`
- Layout nesting: Root layout → Dashboard layout → Project layout
- Server-side data fetching with caching

**Example Usage**:
```typescript
// src/app/api/projects/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Server-side logic
}
```

### 2. Prisma ORM

**Purpose**: Type-safe database access

**How it's used**:
- **Schema Definition**: `prisma/schema.prisma` defines all models
- **Migrations**: Database version control
- **Type Generation**: Auto-generated TypeScript types
- **Query Builder**: Type-safe database queries

**Key Models**:
- `User` - Authentication and user data
- `Project` - Project metadata and configuration
- `Deployment` - Deployment tracking
- `UsageLog` - Analytics and usage tracking
- `Integration` - Third-party service connections
- `BillingUsage` - Subscription and usage tracking

**Example Usage**:
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()
```

### 3. NextAuth.js

**Purpose**: Authentication and session management

**How it's used**:
- **Multiple Providers**: Credentials + Google OAuth
- **JWT Strategy**: Stateless authentication
- **Session Management**: Server-side session handling
- **Middleware Integration**: Route protection

**Configuration**:
- Credentials provider for email/password
- Google OAuth provider
- Custom session callbacks
- Cookie configuration for production

**Example Usage**:
```typescript
// src/lib/authOptions.ts
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({...}),
    GoogleProvider({...})
  ],
  session: { strategy: 'jwt' }
}
```

### 4. OpenAI Integration

**Purpose**: AI-powered code generation and assistance

**How it's used**:
- **Code Generation**: Generate code from natural language
- **Code Suggestions**: AI-powered autocomplete
- **Code Analysis**: Refactoring and optimization suggestions
- **Chat Interface**: Conversational AI assistant
- **RAG Integration**: Codebase-aware responses

**Key Services**:
- `OpenAIService` - Main AI service class
- `AIService` - High-level AI operations
- `RagService` - Retrieval-Augmented Generation

**Example Usage**:
```typescript
// src/lib/ai/openai-service.ts
static async generateCodeSuggestion(
  code: string,
  filePath: string,
  action: 'refactor' | 'optimize' | 'test'
): Promise<AICodeSuggestion>
```

### 5. TailwindCSS + Radix UI

**Purpose**: UI styling and component library

**How it's used**:
- **TailwindCSS**: Utility classes for styling
- **Radix UI**: Accessible component primitives
- **Custom Design System**: Extended theme configuration
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Class-based dark mode support

**Key Features**:
- Custom color palette
- Responsive breakpoints (xs to 8xl)
- Animation utilities
- Component variants

---

## 🏛️ System Architecture

### Module-Based Architecture

The application is organized into **4 main modules** (branded as DevFlowHub tools):

1. **DevFlowHub Editor** (Provider: Cursor)
   - Monaco editor integration
   - File system management
   - Git operations
   - AI code completion
   - Terminal integration

2. **DevFlowHub Sandbox** (Provider: Replit)
   - In-browser code execution
   - Real-time preview
   - Package management
   - Terminal access

3. **DevFlowHub UI Studio** (Provider: v0)
   - AI-powered UI component generation
   - Component library
   - Live preview with Sandpack
   - Design system integration

4. **DevFlowHub Deployer** (Provider: Bolt/Vercel)
   - Multi-provider deployments (Vercel, Netlify, AWS, GCP)
   - Environment management
   - Deployment history
   - Rollback capabilities

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (157 endpoints)
│   │   ├── auth/         # Authentication
│   │   ├── projects/     # Project management
│   │   ├── editor/       # Editor operations
│   │   ├── sandbox/      # Sandbox operations
│   │   ├── ui-studio/    # UI Studio operations
│   │   ├── deployer/     # Deployment operations
│   │   ├── ai/           # AI services
│   │   ├── billing/      # Payment processing
│   │   └── analytics/    # Analytics tracking
│   ├── dashboard/         # Dashboard pages
│   │   └── projects/     # Project workspace
│   └── (auth)/           # Auth pages
├── components/            # React components (186 files)
│   ├── ui/              # Base UI components
│   ├── editor/          # Editor components
│   ├── sandbox/         # Sandbox components
│   ├── ui-studio/       # UI Studio components
│   ├── deployer/        # Deployer components
│   └── dashboard/       # Dashboard components
├── lib/                  # Utility libraries
│   ├── prisma.ts        # Database client
│   ├── authOptions.ts   # Auth configuration
│   ├── ai/              # AI services
│   ├── deployer/        # Deployment services
│   ├── services/        # Integration services
│   └── utils.ts         # Helper functions
└── types/               # TypeScript type definitions
```

### API Architecture

**RESTful API Design**:
- `GET /api/projects` - List projects
- `GET /api/projects/[id]` - Get project details
- `POST /api/projects` - Create project
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

**Nested Resources**:
- `/api/projects/[id]/files` - File operations
- `/api/projects/[id]/deploy` - Deployment operations
- `/api/projects/[id]/git` - Git operations

**Tool-Specific APIs**:
- `/api/editor/ai/*` - Editor AI features
- `/api/sandbox/[projectId]/run` - Sandbox execution
- `/api/ui-studio/generate` - UI generation
- `/api/deployer/[projectId]/deploy` - Deployment

---

## 🔌 Key Features & Integrations

### 1. Authentication System

**Components**:
- NextAuth.js with JWT strategy
- Credentials provider (email/password)
- Google OAuth provider
- Session management with cookies
- Middleware-based route protection

**Flow**:
1. User submits credentials/OAuth
2. NextAuth validates and creates session
3. JWT token stored in HTTP-only cookie
4. Middleware checks session on protected routes
5. Session data available in API routes and components

### 2. Project Management

**Features**:
- Project creation with templates
- Project metadata (language, framework, type)
- Active tool tracking (sticky state)
- Project context management
- File system integration

**Database Schema**:
- `Project` model with relationships to:
  - User (owner)
  - Files (ProjectFile)
  - Deployments
  - Usage logs
  - Integrations

### 3. AI Integration

**AI Capabilities**:
- **Code Generation**: Generate code from prompts
- **Code Completion**: Autocomplete suggestions
- **Code Analysis**: Refactoring and optimization
- **Chat Interface**: Conversational AI assistant
- **RAG**: Codebase-aware responses using vector search

**Implementation**:
- OpenAI API integration (GPT-4, GPT-4o-mini)
- Streaming responses for real-time updates
- Token usage tracking
- Cost estimation
- Error handling and fallbacks

### 4. File System Management

**Features**:
- Create, read, update, delete files
- File tree navigation
- Real-time file watching
- Auto-save functionality
- File versioning (via backups)

**Storage**:
- Database-backed (ProjectFile model)
- File content stored as text in PostgreSQL
- Metadata stored as JSON
- Workspace sync for real filesystem

### 5. Deployment System

**Providers Supported**:
- Vercel (primary)
- Netlify
- AWS
- GCP

**Features**:
- Multi-environment deployments (preview, staging, production)
- Deployment status tracking
- Rollback capabilities
- Build logs
- Cost estimation
- Quota management

**Architecture**:
- Adapter pattern for provider abstraction
- `DeployerService` for orchestration
- Provider-specific adapters (VercelAdapter, etc.)
- Background job processing for deployment monitoring

### 6. Payment & Billing

**Payment Providers**:
- Stripe (US/International)
- Razorpay (India)

**Features**:
- Subscription management
- Usage-based billing
- Invoice generation
- Payment webhooks
- Subscription tiers (Free, Pro, Enterprise)

**Models**:
- `Subscription` - Active subscriptions
- `Invoice` - Billing invoices
- `BillingUsage` - Usage tracking
- `StripeCustomer` / `RazorpaySubscription`

### 7. Analytics & Tracking

**Tracking**:
- User actions
- Tool usage patterns
- Project analytics
- Conversion funnels
- System health metrics

**Implementation**:
- Custom analytics events
- PostHog integration
- Vercel Analytics
- Database-backed analytics (AnalyticsEvent model)

---

## 📊 Data Flow & State Management

### Client-Side State Management

**Zustand Stores**:
- `workspaceStore` - Workspace state
- Lightweight state for UI state

**React Context**:
- `ProjectContext` - Project-wide state
- `BillingContext` - Billing state
- Theme context (via next-themes)

**Server State**:
- SWR for data fetching and caching
- Automatic revalidation
- Optimistic updates

### Data Flow Example: Creating a Project

```
1. User fills form → React Hook Form validation
2. Submit → POST /api/projects
3. API Route → Validate request
4. Prisma → Create project in database
5. Response → Return project data
6. SWR → Update cache
7. Router → Navigate to project workspace
8. Component → Load project data
```

### Data Flow Example: AI Code Generation

```
1. User types prompt → Editor component
2. Request → POST /api/editor/ai/chat-stream
3. API Route → Validate session
4. OpenAI API → Stream response
5. Server → Stream chunks to client
6. Client → Update UI in real-time
7. Completion → Save to project context
```

---

## 🚀 Development Workflow

### Building the Application

**Development**:
```bash
npm run dev          # Start dev server on port 3000
```

**Production Build**:
```bash
npm run build        # Prisma generate + Next.js build
npm start            # Start production server
```

**Database**:
```bash
npx prisma generate  # Generate Prisma client
npx prisma migrate   # Run migrations
npx prisma db seed   # Seed database
```

### Environment Variables

**Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Application URL
- `OPENAI_API_KEY` - OpenAI API key

**Optional**:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth
- `STRIPE_SECRET_KEY` / `RAZORPAY_KEY_ID` - Payments
- `VERCEL_TOKEN` / `VERCEL_ORG_ID` - Deployments
- `POSTHOG_KEY` - Analytics

### Testing

**Unit Tests**:
```bash
npm test             # Run Jest tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

**Type Checking**:
```bash
npm run type-check   # TypeScript validation
```

**Linting**:
```bash
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix issues
```

---

## 🎯 Key Design Patterns

### 1. Adapter Pattern
Used for deployment providers - abstracts provider-specific logic behind a common interface.

### 2. Service Layer Pattern
Business logic separated into service classes (DeployerService, AIService, etc.)

### 3. Repository Pattern
Prisma provides data access abstraction

### 4. Provider Pattern
React Context providers for global state

### 5. Middleware Pattern
Next.js middleware for cross-cutting concerns (auth, logging)

---

## 📈 Performance Optimizations

### Next.js Optimizations
- Server Components for reduced client bundle
- Image optimization
- Code splitting
- Static generation where possible
- SWC minification

### Database Optimizations
- Indexed queries
- Connection pooling
- Query optimization
- Caching strategies

### Frontend Optimizations
- Component lazy loading
- Code splitting
- Image lazy loading
- Memoization
- Virtual scrolling for large lists

---

## 🔐 Security Features

### Authentication Security
- JWT tokens in HTTP-only cookies
- CSRF protection
- Password hashing with bcrypt
- OAuth 2.0 for third-party auth

### API Security
- Session validation on all protected routes
- Input validation with Zod
- SQL injection prevention (Prisma parameterized queries)
- Rate limiting (where applicable)

### Data Security
- Encrypted sensitive data
- Secure cookie configuration
- Environment variable protection
- HTTPS enforcement in production

---

## 🌐 Deployment Architecture

### Vercel Deployment
- Automatic deployments from Git
- Preview deployments for PRs
- Production deployments from main branch
- Environment variable management
- Serverless function execution

### Database
- PostgreSQL (hosted separately)
- Connection pooling
- Automated backups
- Migration management

### File Storage
- AWS S3 for file uploads
- Database for code files
- CDN for static assets

---

## 📝 Summary

**DevFlowHub** is a comprehensive full-stack application built with modern web technologies:

- **Frontend**: Next.js 14 + React 18 + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes + Prisma + PostgreSQL
- **Authentication**: NextAuth.js with JWT
- **AI Integration**: OpenAI API with RAG
- **Payments**: Stripe + Razorpay
- **Deployment**: Vercel with multi-provider support
- **State Management**: Zustand + SWR + React Context
- **Testing**: Jest + Testing Library + Playwright

The architecture follows modern best practices:
- Modular design with clear separation of concerns
- Type-safe development with TypeScript
- Scalable database schema with Prisma
- RESTful API design
- Component-based UI architecture
- Security-first approach
- Performance optimizations throughout

The platform successfully integrates multiple development tools (Editor, Sandbox, UI Studio, Deployer) into a unified workspace, providing a seamless development experience with AI-powered assistance.

---

## 🛣️ Next-Gen Workspace Architecture Roadmap

To evolve the DevFlowHub Editor into a production-grade, AI-first development environment, we will layer a dedicated **Workspace Platform** alongside the existing Next.js application. This section captures the phased plan we aligned on.

### Phase 0 · Alignment
- ✅ Decide infrastructure target (managed service like Fly.io/Railway or self-hosted Kubernetes) and durable storage (e.g., S3 + git mirror).
- ✅ Create a standalone “Workspace Service” that exposes REST/WebSocket APIs for file sync, container lifecycle, terminal, and preview routing.

### Phase 1 · Workspace & Terminal MVP (Sprint 1)
- Provision per-project containers with Node runtime, mounted workspace volume, and metadata persisted in Postgres.
- Expose file APIs (`GET/PUT/POST /files`) and a WebSocket shell endpoint backed by `node-pty`.
- Update the Next.js editor to read/write through the workspace service and stream the new terminal output; wire the Run button to start dev servers in the container and surface preview URLs.

### Phase 2 · AI Suggestion Orchestration (Sprint 2)
- Introduce `/ai/suggest` (fast + deep modes) that collects multi-file context from the workspace, applies prompt templates, and returns structured completions/diff patches.
- Integrate fast inline completions (<400 ms) and diff-preview flows in the Monaco editor; allow applied patches to persist via the workspace API.

### Phase 3 · Git & Tests Integration (Sprint 3)
- Enable git operations inside the container (status, stage, commit, push) through dedicated APIs.
- Surface git state in the UI, add commit modal, and parse test output from container commands (`npm test`, etc.) to power the Tests panel and AI fix suggestions.

### Phase 4 · UI Studio & Deployer Bridge (Sprint 4)
- Route UI Studio generated components through the workspace service so files land in the repository automatically.
- Connect Deployer to real providers (e.g., Vercel deploy hooks) by packaging workspace contents and streaming logs back into the Deployer panel.
- Instrument usage metrics (suggestion latency, run frequency, AI adoption) for observability.

### Cross-Cutting Requirements
- **Security**: sandboxed containers, network egress controls, explicit user consent before exposing ports.
- **Performance**: sub-500 ms editor load on warm cache, inline completions under 400 ms.
- **Accessibility**: keyboard-first workflows, high-contrast dark theme, ARIA-labelled controls.
- **Monitoring**: latency dashboards, workspace lifecycle traces, container resource metrics.

This roadmap lets us iterate safely: ship a resilient foundation first (Phase 1), layer on AI/co-authoring (Phase 2), then deliver the Git/Test/Deploy story investors expect from a “best-in-class” AI editor.

