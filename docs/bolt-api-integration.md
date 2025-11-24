# Bolt API Integration Guide

## Overview

Bolt is a modern deployment platform that provides comprehensive CI/CD pipelines, environment management, and deployment automation. This integration enables seamless deployment workflows with real-time monitoring and artifact management.

## Features

### 🚀 Deployment Pipelines
- **Multi-Stage Pipelines**: Build, test, deploy, and notify stages
- **Trigger Management**: Push, PR, manual, schedule, and webhook triggers
- **Pipeline Templates**: Pre-configured pipeline templates
- **Parallel Execution**: Run stages in parallel for faster deployments
- **Conditional Stages**: Execute stages based on conditions
- **Pipeline History**: Track all pipeline runs and their status

### 🌍 Environment Management
- **Multi-Environment Support**: Development, staging, production, preview
- **Environment Variables**: Secure variable management
- **Secrets Management**: Encrypted secret storage
- **Environment Isolation**: Complete separation between environments
- **Branch-based Deployments**: Deploy specific branches to environments
- **Environment Health Monitoring**: Real-time environment status

### 📦 Build Configuration
- **Framework Detection**: Automatic framework detection
- **Custom Build Commands**: Flexible build configuration
- **Node.js Version Management**: Specify Node.js versions
- **Dependency Installation**: Automatic package installation
- **Build Optimization**: Optimized build processes
- **Artifact Generation**: Build artifact management

### 📊 Real-time Monitoring
- **Live Logs**: Real-time deployment logs
- **Stage Monitoring**: Individual stage progress tracking
- **Performance Metrics**: Deployment performance analytics
- **Error Tracking**: Comprehensive error reporting
- **Deployment History**: Complete deployment audit trail
- **Rollback Capabilities**: Quick deployment rollbacks

## API Endpoints

### Project Management
```typescript
// Create project
POST /projects
{
  "name": "My Web App",
  "repository": "https://github.com/user/repo",
  "framework": "nextjs"
}

// Get project
GET /projects/{projectId}

// List projects
GET /projects

// Update project
PATCH /projects/{projectId}
{
  "description": "Updated description"
}
```

### Environment Management
```typescript
// Create environment
POST /projects/{projectId}/environments
{
  "name": "staging",
  "type": "staging"
}

// Get environment
GET /projects/{projectId}/environments/{environmentId}

// List environments
GET /projects/{projectId}/environments

// Set environment variable
POST /projects/{projectId}/environments/{environmentId}/variables
{
  "DATABASE_URL": "postgresql://..."
}

// Set environment secret
POST /projects/{projectId}/environments/{environmentId}/secrets
{
  "API_KEY": "secret-value"
}
```

### Pipeline Management
```typescript
// Create pipeline
POST /projects/{projectId}/pipelines
{
  "name": "Production Pipeline",
  "stages": [
    {
      "name": "build",
      "type": "build",
      "commands": ["npm install", "npm run build"],
      "timeout": 300
    },
    {
      "name": "test",
      "type": "test",
      "commands": ["npm test"],
      "dependencies": ["build"],
      "timeout": 120
    },
    {
      "name": "deploy",
      "type": "deploy",
      "environment": "production",
      "dependencies": ["test"],
      "timeout": 180
    }
  ]
}

// Add pipeline trigger
POST /projects/{projectId}/pipelines/{pipelineId}/triggers
{
  "type": "push",
  "branch": "main"
}
```

### Deployment Management
```typescript
// Create deployment
POST /projects/{projectId}/deployments
{
  "environmentId": "env_123",
  "pipelineId": "pipe_456",
  "commit": "abc123",
  "branch": "main"
}

// Get deployment
GET /projects/{projectId}/deployments/{deploymentId}

// List deployments
GET /projects/{projectId}/deployments?environmentId=env_123&status=success

// Cancel deployment
POST /projects/{projectId}/deployments/{deploymentId}/cancel

// Retry deployment
POST /projects/{projectId}/deployments/{deploymentId}/retry
```

### Build Configuration
```typescript
// Set build config
POST /projects/{projectId}/build-config
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "nodeVersion": "18.x",
  "environmentVariables": {
    "NODE_ENV": "production"
  }
}

// Get build config
GET /projects/{projectId}/build-config
```

## Usage Examples

### Basic Project Setup
```typescript
import BoltAPIService from '@/lib/services/bolt-api'

const boltService = new BoltAPIService(process.env.BOLT_API_KEY)

// Create a new project
const project = await boltService.createProject(
  "My Next.js App",
  "https://github.com/user/nextjs-app",
  "nextjs"
)

// Create environments
const devEnv = await boltService.createEnvironment(project.id, "development", "development")
const stagingEnv = await boltService.createEnvironment(project.id, "staging", "staging")
const prodEnv = await boltService.createEnvironment(project.id, "production", "production")

// Set environment variables
await boltService.setEnvironmentVariable(project.id, devEnv.id, "NODE_ENV", "development")
await boltService.setEnvironmentVariable(project.id, stagingEnv.id, "NODE_ENV", "staging")
await boltService.setEnvironmentVariable(project.id, prodEnv.id, "NODE_ENV", "production")
```

### Pipeline Creation
```typescript
// Create a comprehensive pipeline
const pipeline = await boltService.createPipeline(project.id, "Full Pipeline", [
  {
    id: "build",
    name: "Build",
    type: "build",
    commands: [
      "npm ci",
      "npm run build",
      "npm run type-check"
    ],
    dependencies: [],
    timeout: 300
  },
  {
    id: "test",
    name: "Test",
    type: "test",
    commands: [
      "npm run test",
      "npm run test:e2e"
    ],
    dependencies: ["build"],
    timeout: 180
  },
  {
    id: "lint",
    name: "Lint",
    type: "test",
    commands: [
      "npm run lint",
      "npm run lint:fix"
    ],
    dependencies: ["build"],
    timeout: 60
  },
  {
    id: "deploy-staging",
    name: "Deploy to Staging",
    type: "deploy",
    commands: [
      "npm run deploy:staging"
    ],
    environment: "staging",
    dependencies: ["test", "lint"],
    timeout: 120
  },
  {
    id: "deploy-production",
    name: "Deploy to Production",
    type: "deploy",
    commands: [
      "npm run deploy:production"
    ],
    environment: "production",
    dependencies: ["deploy-staging"],
    timeout: 120
  }
])

// Add triggers
await boltService.addPipelineTrigger(project.id, pipeline.id, {
  type: "push",
  branch: "main"
})

await boltService.addPipelineTrigger(project.id, pipeline.id, {
  type: "pull_request",
  branch: "develop"
})
```

### Deployment Management
```typescript
// Create a deployment
const deployment = await boltService.createDeployment(
  project.id,
  prodEnv.id,
  pipeline.id,
  "abc123def456",
  "main"
)

// Monitor deployment
const logs = await boltService.getDeploymentLogs(project.id, deployment.id)
console.log('Deployment logs:', logs)

// Stream logs in real-time
await boltService.streamLogs(project.id, deployment.id, (log) => {
  console.log(`[${log.level}] ${log.message}`)
})

// Get deployment artifacts
const artifacts = await boltService.getDeploymentArtifacts(project.id, deployment.id)
console.log('Build artifacts:', artifacts)
```

### Advanced Features
```typescript
// Create preview deployment for PR
const previewDeployment = await boltService.createPreviewDeployment(project.id, 123)

// Promote deployment to production
const promotedDeployment = await boltService.promoteDeployment(
  project.id,
  stagingDeployment.id,
  "production"
)

// Rollback deployment
const rollbackDeployment = await boltService.rollbackDeployment(
  project.id,
  prodEnv.id,
  previousDeployment.id
)
```

## Integration with DevFlowHub

### Tool Recommendation
Bolt is recommended for:
- **Full-Stack Applications**: Complete deployment pipeline management
- **Production Workloads**: Reliable and scalable deployment solutions
- **Team Collaboration**: Multi-environment team workflows
- **CI/CD Automation**: Automated build and deployment processes

### Workflow Integration
```typescript
// Create deployment workflow
const workflow = await integrationManager.createWorkflow(
  "Deployment Pipeline",
  "Automated deployment workflow",
  [
    {
      id: "build",
      tool: "bolt",
      action: "create_deployment",
      parameters: {
        projectId: "proj_123",
        environmentId: "env_456",
        pipelineId: "pipe_789",
        commit: "{{git.commit}}",
        branch: "{{git.branch}}"
      },
      dependencies: [],
      timeout: 600000 // 10 minutes
    },
    {
      id: "monitor",
      tool: "bolt",
      action: "stream_logs",
      parameters: {
        projectId: "{{build.projectId}}",
        deploymentId: "{{build.deploymentId}}"
      },
      dependencies: ["build"],
      timeout: 300000 // 5 minutes
    }
  ]
)
```

### Cross-Tool Integration
```typescript
// Deploy code from Cursor/Replit to Bolt
const syncResult = await integrationManager.syncContextBetweenTools(
  'cursor', // Source tool
  'bolt',   // Target tool
  cursorProjectId,
  boltProjectId
)

// Create deployment after sync
const deployment = await boltService.createDeployment(
  boltProjectId,
  environmentId,
  pipelineId,
  syncResult.commit,
  syncResult.branch
)
```

## Error Handling

```typescript
try {
  const deployment = await boltService.createDeployment(
    projectId,
    environmentId,
    pipelineId,
    commit,
    branch
  )
} catch (error) {
  if (error.message.includes('environment not found')) {
    // Handle missing environment
    console.error('Environment not configured')
  }
  
  if (error.message.includes('pipeline not found')) {
    // Handle missing pipeline
    console.error('Pipeline not configured')
  }
  
  if (error.message.includes('deployment failed')) {
    // Handle deployment failure
    console.error('Deployment failed, check logs')
  }
  
  // Handle other errors
  console.error('Bolt API error:', error)
  throw error
}
```

## Best Practices

### Pipeline Design
1. **Stage Separation**: Separate build, test, and deploy stages
2. **Dependency Management**: Use dependencies to control execution order
3. **Timeout Configuration**: Set appropriate timeouts for each stage
4. **Error Handling**: Implement proper error handling in each stage
5. **Parallel Execution**: Use parallel stages where possible

### Environment Management
1. **Environment Isolation**: Keep environments completely separate
2. **Variable Management**: Use environment variables for configuration
3. **Secret Security**: Store sensitive data as secrets
4. **Branch Strategy**: Use branch-based deployment strategies
5. **Health Monitoring**: Monitor environment health continuously

### Deployment Strategy
1. **Blue-Green Deployments**: Implement zero-downtime deployments
2. **Rollback Strategy**: Always have a rollback plan
3. **Monitoring**: Monitor deployments in real-time
4. **Testing**: Test deployments in staging first
5. **Documentation**: Document deployment procedures

## Environment Variables

```env
BOLT_API_KEY=your_bolt_api_key_here
BOLT_BASE_URL=https://api.bolt.dev/v1
```

## Rate Limits

- **Project Operations**: 100 requests/hour
- **Deployment Operations**: 50 requests/hour
- **Environment Operations**: 200 requests/hour
- **Pipeline Operations**: 100 requests/hour
- **Log Streaming**: 10 concurrent streams

## Support

For API support and documentation:
- **API Documentation**: https://bolt.dev/docs/api
- **Pipeline Templates**: https://bolt.dev/templates
- **Deployment Guide**: https://bolt.dev/deploy
- **Community**: https://discord.gg/bolt 