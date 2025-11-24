# Replit API Integration Guide

## Overview

Replit is a powerful online IDE that provides collaborative coding environments, live deployment, and comprehensive project management. This integration enables repository creation/import, live environment management, and real-time collaborative editing capabilities.

## Features

### 📚 Repository Creation/Import
- **Repository Creation**: Create new Git repositories directly in Replit
- **Repository Import**: Import existing repositories from GitHub, GitLab, etc.
- **Repository Connection**: Connect Replit projects to external repositories
- **Branch Management**: Work with different branches and sync changes
- **Repository Status**: Monitor repository connection and sync status
- **Change Tracking**: Track repository changes and sync history

### 🌍 Live Environment Management
- **Live Sessions**: Start and manage live coding sessions
- **Real-time Collaboration**: Multiple developers working simultaneously
- **Session Management**: Join, leave, and monitor live sessions
- **Participant Tracking**: Track active participants in live sessions
- **Session History**: Maintain session history and activity logs
- **Environment Isolation**: Separate environments for different sessions

### 👥 Collaborative Editing
- **Real-time Collaboration**: Multiple users editing simultaneously
- **Role-based Access**: View, comment, and edit permissions
- **Collaborator Management**: Invite, remove, and manage collaborators
- **Real-time Chat**: Built-in chat for team communication
- **Cursor Position Sharing**: See other users' cursor positions
- **Active Cursor Tracking**: Track all active cursors in real-time

## API Endpoints

### Repl Management
```typescript
// Create repl
POST /repls
{
  "name": "My Project",
  "language": "javascript",
  "isPrivate": false
}

// Get repl
GET /repls/{replId}

// List repls
GET /repls

// Delete repl
DELETE /repls/{replId}

// Clone repl
POST /repls/{replId}/clone
{
  "name": "My Project Copy"
}
```

### Repository Management
```typescript
// Create repository
POST /repls/{replId}/repository
{
  "name": "my-project",
  "isPrivate": false
}

// Import repository
POST /repls/{replId}/repository/import
{
  "url": "https://github.com/user/repo",
  "branch": "main"
}

// Connect repository
POST /repls/{replId}/repository/connect
{
  "url": "https://github.com/user/repo",
  "branch": "main"
}

// Sync repository
POST /repls/{replId}/repository/sync
{
  "direction": "both" // "push", "pull", or "both"
}

// Get repository status
GET /repls/{replId}/repository/status
```

### Live Environment Management
```typescript
// Start live session
POST /repls/{replId}/live/start

// Join live session
POST /repls/{replId}/live/join
{
  "userId": "user_123"
}

// Leave live session
POST /repls/{replId}/live/leave
{
  "userId": "user_123"
}

// Get live session
GET /repls/{replId}/live

// End live session
POST /repls/{replId}/live/end
```

### Collaborative Editing
```typescript
// Invite collaborator
POST /repls/{replId}/collaborators
{
  "username": "john_doe",
  "role": "edit" // "view", "comment", or "edit"
}

// Remove collaborator
DELETE /repls/{replId}/collaborators/{username}

// Get collaborators
GET /repls/{replId}/collaborators

// Update collaborator role
PATCH /repls/{replId}/collaborators/{username}
{
  "role": "comment"
}
```

### Real-time Collaboration Features
```typescript
// Send chat message
POST /repls/{replId}/chat
{
  "message": "Hello team!",
  "userId": "user_123"
}

// Get chat history
GET /repls/{replId}/chat

// Share cursor position
POST /repls/{replId}/cursor
{
  "filePath": "index.js",
  "line": 15,
  "column": 25,
  "userId": "user_123"
}

// Get active cursors
GET /repls/{replId}/cursors
```

### File Operations
```typescript
// Read file
GET /repls/{replId}/files/{filePath}

// Write file
POST /repls/{replId}/files/{filePath}
{
  "content": "// Updated file content"
}

// List files
GET /repls/{replId}/files

// Delete file
DELETE /repls/{replId}/files/{filePath}

// Create directory
POST /repls/{replId}/files/{dirPath}
{
  "type": "directory"
}
```

### Environment Management
```typescript
// Get environment
GET /repls/{replId}/env

// Set environment variable
POST /repls/{replId}/env
{
  "DATABASE_URL": "postgresql://..."
}

// Install package
POST /repls/{replId}/packages
{
  "package": "express"
}

// Get installed packages
GET /repls/{replId}/packages

// Update runtime
PATCH /repls/{replId}/runtime
{
  "runtime": "nodejs",
  "version": "18.x"
}
```

## Usage Examples

### Basic Repl Management
```typescript
import ReplitAPIService from '@/lib/services/replit-api'

const replitService = new ReplitAPIService(process.env.REPLIT_API_KEY)

// Create a new repl
const repl = await replitService.createRepl(
  "My React App",
  "javascript",
  false
)

console.log('Created repl:', repl.url)

// Write initial files
await replitService.writeFile(
  repl.id,
  "index.html",
  `<!DOCTYPE html>
<html>
<head>
    <title>My React App</title>
</head>
<body>
    <div id="root"></div>
    <script src="index.js"></script>
</body>
</html>`
)

await replitService.writeFile(
  repl.id,
  "index.js",
  `import React from 'react';
import ReactDOM from 'react-dom';

function App() {
  return <h1>Hello from Replit!</h1>;
}

ReactDOM.render(<App />, document.getElementById('root'));`
)
```

### Repository Integration
```typescript
// Import an existing repository
const repository = await replitService.importRepository(
  repl.id,
  "https://github.com/user/my-react-app",
  "main"
)

console.log('Repository imported:', repository.url)

// Check repository status
const status = await replitService.getRepositoryStatus(repl.id)
console.log('Repository status:', {
  isConnected: status.isConnected,
  lastSync: status.lastSync,
  changes: status.changes.length
})

// Sync repository changes
await replitService.syncRepository(repl.id, "both")
```

### Live Environment Management
```typescript
// Start a live session
const liveSession = await replitService.startLiveSession(repl.id)
console.log('Live session started:', liveSession.id)

// Join the session
await replitService.joinLiveSession(repl.id, "user_123")

// Get session info
const session = await replitService.getLiveSession(repl.id)
if (session) {
  console.log('Active participants:', session.participants)
  console.log('Session started:', session.startedAt)
}

// End the session
await replitService.endLiveSession(repl.id)
```

### Collaborative Editing
```typescript
// Invite collaborators
await replitService.inviteCollaborator(repl.id, "alice_dev", "edit")
await replitService.inviteCollaborator(repl.id, "bob_reviewer", "comment")

// Get all collaborators
const collaborators = await replitService.getCollaborators(repl.id)
console.log('Collaborators:', collaborators.map(c => ({
  username: c.username,
  role: c.role,
  isOnline: c.isOnline
})))

// Send a chat message
await replitService.sendChatMessage(
  repl.id,
  "Working on the login component now!",
  "user_123"
)

// Get chat history
const chatHistory = await replitService.getChatHistory(repl.id)
console.log('Chat messages:', chatHistory)

// Share cursor position
await replitService.shareCursorPosition(
  repl.id,
  "src/components/Login.jsx",
  25,
  10,
  "user_123"
)

// Get all active cursors
const activeCursors = await replitService.getActiveCursors(repl.id)
console.log('Active cursors:', activeCursors)
```

### Environment Configuration
```typescript
// Set environment variables
await replitService.setEnvironmentVariable(repl.id, "NODE_ENV", "development")
await replitService.setEnvironmentVariable(repl.id, "PORT", "3000")

// Install packages
await replitService.installPackage(repl.id, "react")
await replitService.installPackage(repl.id, "react-dom")
await replitService.installPackage(repl.id, "express")

// Get installed packages
const packages = await replitService.getInstalledPackages(repl.id)
console.log('Installed packages:', packages)

// Update runtime
await replitService.updateRuntime(repl.id, "nodejs", "18.x")

// Get environment info
const environment = await replitService.getEnvironment(repl.id)
console.log('Environment:', {
  variables: environment.variables,
  packages: environment.packages,
  runtime: environment.runtime,
  language: environment.language
})
```

### Deployment
```typescript
// Deploy the repl
const deployment = await replitService.deployRepl(repl.id, "my-app")
console.log('Deployed to:', deployment.url)

// Get deployment history
const deployments = await replitService.getDeployments(repl.id)
console.log('Deployments:', deployments.map(d => ({
  id: d.id,
  url: d.url,
  status: d.status,
  createdAt: d.createdAt
})))
```

## Integration with DevFlowHub

### Tool Recommendation
Replit is recommended for:
- **Rapid Prototyping**: Quick project setup and iteration
- **Team Collaboration**: Real-time collaborative development
- **Educational Projects**: Learning and teaching environments
- **Live Demonstrations**: Real-time code demonstrations
- **Multi-language Projects**: Support for 50+ programming languages

### Workflow Integration
```typescript
// Create collaborative development workflow
const workflow = await integrationManager.createWorkflow(
  "Collaborative Development",
  "Real-time collaborative coding workflow",
  [
    {
      id: "create_repl",
      tool: "replit",
      action: "create_repl",
      parameters: {
        name: "Team Project",
        language: "javascript",
        isPrivate: false
      },
      dependencies: [],
      timeout: 30000
    },
    {
      id: "start_live_session",
      tool: "replit",
      action: "start_live_session",
      parameters: {
        replId: "{{create_repl.replId}}"
      },
      dependencies: ["create_repl"],
      timeout: 15000
    },
    {
      id: "invite_collaborators",
      tool: "replit",
      action: "invite_collaborators",
      parameters: {
        replId: "{{create_repl.replId}}",
        collaborators: ["alice", "bob", "charlie"]
      },
      dependencies: ["create_repl"],
      timeout: 30000
    }
  ]
)
```

### Cross-Tool Integration
```typescript
// Sync code from Replit to Cursor
const syncResult = await integrationManager.syncContextBetweenTools(
  'replit',  // Source tool
  'cursor',  // Target tool
  replitReplId,
  cursorProjectId
)

console.log('Sync completed:', {
  files: syncResult.files.length,
  status: syncResult.status,
  progress: syncResult.progress
})
```

## Error Handling

```typescript
try {
  await replitService.createRepl(name, language, isPrivate)
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Handle rate limiting
    console.error('Rate limit exceeded, please wait')
  }
  
  if (error.message.includes('invalid language')) {
    // Handle invalid language
    console.error('Unsupported programming language')
  }
  
  if (error.message.includes('repository not found')) {
    // Handle repository issues
    console.error('Repository not found or inaccessible')
  }
  
  if (error.message.includes('collaborator not found')) {
    // Handle collaborator issues
    console.error('User not found on Replit')
  }
  
  // Handle other errors
  console.error('Replit API error:', error)
  throw error
}
```

## Best Practices

### Repository Management
1. **Branch Strategy**: Use feature branches for development
2. **Regular Sync**: Sync repository changes frequently
3. **Conflict Resolution**: Handle merge conflicts promptly
4. **Backup Strategy**: Keep backups of important changes
5. **Documentation**: Document repository structure and setup

### Live Collaboration
1. **Session Management**: Start and end sessions properly
2. **Communication**: Use chat for team coordination
3. **Cursor Awareness**: Be mindful of cursor positions
4. **File Coordination**: Coordinate file opening/closing
5. **Session Cleanup**: End sessions when finished

### Environment Management
1. **Variable Security**: Use secrets for sensitive data
2. **Package Management**: Keep dependencies up to date
3. **Runtime Selection**: Choose appropriate runtime versions
4. **Environment Isolation**: Separate dev/staging/prod environments
5. **Monitoring**: Monitor environment health and performance

## Environment Variables

```env
REPLIT_API_KEY=your_replit_api_key_here
REPLIT_BASE_URL=https://api.replit.com/v0
```

## Rate Limits

- **Repl Operations**: 100 requests/hour
- **File Operations**: 1000 requests/hour
- **Environment Operations**: 200 requests/hour
- **Collaboration Operations**: 500 requests/hour
- **Live Session Operations**: 50 requests/hour

## Support

For API support and documentation:
- **API Documentation**: https://docs.replit.com/api
- **Developer Guide**: https://docs.replit.com/developers
- **Community**: https://replit.com/community
- **Discord**: https://discord.gg/replit 