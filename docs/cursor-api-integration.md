# Cursor API Integration Guide

## Overview

Cursor is an AI-powered code editor that provides advanced code analysis, real-time collaboration, and intelligent code generation. This integration enables seamless file synchronization, real-time code editing, and cross-tool project context transfer.

## Features

### 🔄 File Sync Capabilities
- **Real-time Synchronization**: Instant file updates across tools
- **Conflict Resolution**: Automatic conflict detection and resolution
- **Version Control**: Track file changes and history
- **Cross-Platform Sync**: Sync between different development environments
- **Selective Sync**: Choose specific files or directories to sync
- **Sync Status Monitoring**: Real-time sync status and progress tracking

### ✏️ Real-time Code Editing
- **Live Cursor Tracking**: See other developers' cursor positions
- **Selection Sharing**: Share text selections in real-time
- **File Open/Close Events**: Track which files are being edited
- **Collaborative Editing**: Multiple developers editing simultaneously
- **Change Broadcasting**: Instant notification of code changes
- **Edit History**: Track all editing activities

### 🎯 Project Context Transfer
- **Context Export/Import**: Transfer project context between tools
- **Workspace Settings**: Sync editor preferences and configurations
- **Dependency Management**: Transfer package dependencies
- **Environment Variables**: Sync environment configurations
- **Recent Files**: Track recently opened files
- **Active File Tracking**: Know which file is currently active

## API Endpoints

### Project Management
```typescript
// Create project
POST /projects
{
  "name": "My Project",
  "language": "typescript",
  "template": "nextjs"
}

// Get project
GET /projects/{projectId}

// List projects
GET /projects

// Delete project
DELETE /projects/{projectId}
```

### File Operations with Real-time Sync
```typescript
// Read file
GET /projects/{projectId}/files/{filePath}

// Write file (triggers sync event)
POST /projects/{projectId}/files/{filePath}
{
  "content": "// Updated file content"
}

// List files
GET /projects/{projectId}/files

// Delete file (triggers sync event)
DELETE /projects/{projectId}/files/{filePath}
```

### Real-time Code Editing
```typescript
// Update cursor position
POST /projects/{projectId}/cursor
{
  "filePath": "src/components/Button.tsx",
  "line": 15,
  "column": 25
}

// Update selection
POST /projects/{projectId}/selection
{
  "filePath": "src/components/Button.tsx",
  "selection": {
    "start": { "line": 10, "column": 5 },
    "end": { "line": 12, "column": 15 }
  }
}

// Open file
POST /projects/{projectId}/files/{filePath}/open

// Close file
POST /projects/{projectId}/files/{filePath}/close
```

### File Sync Capabilities
```typescript
// Sync file with version control
POST /projects/{projectId}/sync
{
  "filePath": "src/components/Button.tsx",
  "content": "// Updated content",
  "version": 5
}

// Get file history
GET /projects/{projectId}/files/{filePath}/history

// Resolve conflicts
POST /projects/{projectId}/conflicts/{filePath}
{
  "resolution": "merge" // "local", "remote", or "merge"
}
```

### Project Context Transfer
```typescript
// Get project context
GET /projects/{projectId}/context

// Sync context
POST /projects/{projectId}/context
{
  "files": [...],
  "dependencies": [...],
  "environment": {...}
}

// Export context
GET /projects/{projectId}/context/export

// Import context
POST /projects/{projectId}/context/import
{
  "context": {...},
  "metadata": {...}
}
```

### Real-time Collaboration
```typescript
// Join collaboration
POST /projects/{projectId}/collaboration/join
{
  "userId": "user_123"
}

// Leave collaboration
POST /projects/{projectId}/collaboration/leave
{
  "userId": "user_123"
}

// Get collaborators
GET /projects/{projectId}/collaborators
```

## Usage Examples

### Basic File Operations
```typescript
import CursorAPIService from '@/lib/services/cursor-api'

const cursorService = new CursorAPIService(process.env.CURSOR_API_KEY)

// Create a new project
const project = await cursorService.createProject(
  "My React App",
  "typescript",
  "react"
)

// Write a file (triggers sync event)
await cursorService.writeFile(
  project.id,
  "src/components/Button.tsx",
  `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button 
      className="px-4 py-2 bg-blue-500 text-white rounded"
      onClick={onClick}
    >
      {children}
    </button>
  );
};`
)

// Read the file
const file = await cursorService.readFile(project.id, "src/components/Button.tsx")
console.log('File content:', file.content)
```

### Real-time Collaboration
```typescript
// Join collaboration session
await cursorService.joinCollaboration(project.id, "user_123")

// Update cursor position (visible to other collaborators)
await cursorService.updateCursorPosition(
  project.id,
  "src/components/Button.tsx",
  15,
  25
)

// Share text selection
await cursorService.updateSelection(
  project.id,
  "src/components/Button.tsx",
  {
    start: { line: 10, column: 5 },
    end: { line: 12, column: 15 }
  }
)

// Get active collaborators
const collaborators = await cursorService.getCollaborators(project.id)
console.log('Active collaborators:', collaborators)
```

### File Sync and Conflict Resolution
```typescript
// Sync file with version control
const syncResult = await cursorService.syncFile(
  project.id,
  "src/components/Button.tsx",
  updatedContent,
  5
)

if (syncResult.conflicts && syncResult.conflicts.length > 0) {
  console.log('Conflicts detected:', syncResult.conflicts)
  
  // Resolve conflicts
  await cursorService.resolveConflict(
    project.id,
    "src/components/Button.tsx",
    "merge"
  )
}

// Get file history
const history = await cursorService.getFileHistory(
  project.id,
  "src/components/Button.tsx"
)
console.log('File history:', history)
```

### Context Transfer
```typescript
// Export project context
const contextData = await cursorService.exportContext(project.id)
console.log('Exported context:', contextData)

// Import context to another project
await cursorService.importContext(anotherProjectId, contextData)

// Get current project context
const context = await cursorService.getProjectContext(project.id)
console.log('Current context:', {
  files: context.files.length,
  dependencies: context.dependencies,
  activeFile: context.activeFile,
  recentFiles: context.recentFiles
})
```

### Sync Event Handling
```typescript
// Listen for sync events
cursorService.onSyncEvent(project.id, (event) => {
  switch (event.type) {
    case 'file_change':
      console.log(`File changed: ${event.filePath}`)
      break
    case 'cursor_move':
      console.log(`Cursor moved in ${event.filePath}: ${event.data.line}:${event.data.column}`)
      break
    case 'selection_change':
      console.log(`Selection changed in ${event.filePath}`)
      break
    case 'file_open':
      console.log(`File opened: ${event.filePath}`)
      break
    case 'file_close':
      console.log(`File closed: ${event.filePath}`)
      break
  }
})
```

## Integration with DevFlowHub

### Tool Recommendation
Cursor is recommended for:
- **Code Analysis Projects**: Advanced code analysis and refactoring
- **Team Collaboration**: Real-time collaborative development
- **File Sync Requirements**: Projects requiring cross-tool synchronization
- **Context Transfer**: Projects that need to maintain context across tools

### Workflow Integration
```typescript
// Create development workflow
const workflow = await integrationManager.createWorkflow(
  "Development Workflow",
  "Real-time development with context sync",
  [
    {
      id: "open_project",
      tool: "cursor",
      action: "open_file",
      parameters: {
        projectId: "proj_123",
        filePath: "src/main.tsx"
      },
      dependencies: [],
      timeout: 5000
    },
    {
      id: "sync_context",
      tool: "cursor",
      action: "sync_context",
      parameters: {
        projectId: "proj_123",
        targetTool: "replit"
      },
      dependencies: ["open_project"],
      timeout: 30000
    }
  ]
)
```

### Cross-Tool Integration
```typescript
// Sync context from Cursor to Replit
const syncResult = await integrationManager.syncContextBetweenTools(
  'cursor',  // Source tool
  'replit',  // Target tool
  cursorProjectId,
  replitProjectId
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
  await cursorService.writeFile(projectId, filePath, content)
} catch (error) {
  if (error.message.includes('file not found')) {
    // Handle missing file
    console.error('File does not exist')
  }
  
  if (error.message.includes('sync conflict')) {
    // Handle sync conflicts
    console.error('Sync conflict detected')
    await cursorService.resolveConflict(projectId, filePath, 'merge')
  }
  
  if (error.message.includes('permission denied')) {
    // Handle permission issues
    console.error('Permission denied')
  }
  
  // Handle other errors
  console.error('Cursor API error:', error)
  throw error
}
```

## Best Practices

### File Sync
1. **Version Control**: Always use version control with sync operations
2. **Conflict Resolution**: Implement proper conflict resolution strategies
3. **Selective Sync**: Only sync necessary files to avoid performance issues
4. **Backup Strategy**: Keep backups before major sync operations
5. **Monitoring**: Monitor sync status and handle failures gracefully

### Real-time Collaboration
1. **Cursor Management**: Be mindful of cursor positions in collaborative editing
2. **Selection Sharing**: Use selection sharing for focused collaboration
3. **File Management**: Coordinate file opening/closing with team members
4. **Communication**: Use chat or other communication tools alongside editing
5. **Conflict Prevention**: Communicate changes to avoid conflicts

### Context Transfer
1. **Context Size**: Keep context data manageable in size
2. **Selective Transfer**: Transfer only relevant context information
3. **Validation**: Validate context data before and after transfer
4. **Backup**: Keep backups of context data
5. **Documentation**: Document context structure and dependencies

## Environment Variables

```env
CURSOR_API_KEY=your_cursor_api_key_here
CURSOR_BASE_URL=https://api.cursor.sh/v1
```

## Rate Limits

- **File Operations**: 1000 requests/hour
- **Sync Operations**: 100 requests/hour
- **Context Operations**: 50 requests/hour
- **Collaboration Events**: 500 events/hour
- **Real-time Events**: 1000 events/hour

## Support

For API support and documentation:
- **API Documentation**: https://cursor.sh/docs/api
- **Developer Guide**: https://cursor.sh/developers
- **Community**: https://discord.gg/cursor
- **GitHub**: https://github.com/cursor-ai 