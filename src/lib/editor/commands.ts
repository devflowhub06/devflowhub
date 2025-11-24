export interface Command {
  id: string
  title: string
  description: string
  category: string
  shortcut?: string
  action: () => void
}

export const createEditorCommands = (
  onFileNew: () => void,
  onFileOpen: () => void,
  onFileSave: () => void,
  onFileRename: () => void,
  onFileDelete: () => void,
  onFileCopy: () => void,
  onFileMove: () => void,
  onFolderNew: () => void,
  onGitStatus: () => void,
  onGitCommit: () => void,
  onGitBranch: () => void,
  onGitPR: () => void,
  onTerminalRun: () => void,
  onTerminalClear: () => void,
  onAISuggest: () => void,
  onAIRefactor: () => void,
  onAITest: () => void,
  onAIExplain: () => void,
  onProjectRun: () => void,
  onProjectBuild: () => void,
  onProjectTest: () => void,
  onSettingsOpen: () => void
): Command[] => {
  return [
    // File Operations
    {
      id: 'file:new',
      title: 'New File',
      description: 'Create a new file',
      category: 'File',
      shortcut: 'Ctrl+N',
      action: onFileNew
    },
    {
      id: 'file:open',
      title: 'Open File',
      description: 'Open a file from the project',
      category: 'File',
      shortcut: 'Ctrl+O',
      action: onFileOpen
    },
    {
      id: 'file:save',
      title: 'Save File',
      description: 'Save the current file',
      category: 'File',
      shortcut: 'Ctrl+S',
      action: onFileSave
    },
    {
      id: 'file:rename',
      title: 'Rename File',
      description: 'Rename the current file',
      category: 'File',
      action: onFileRename
    },
    {
      id: 'file:delete',
      title: 'Delete File',
      description: 'Delete the current file',
      category: 'File',
      action: onFileDelete
    },
    {
      id: 'file:copy',
      title: 'Copy File',
      description: 'Copy the current file',
      category: 'File',
      action: onFileCopy
    },
    {
      id: 'file:move',
      title: 'Move File',
      description: 'Move the current file',
      category: 'File',
      action: onFileMove
    },
    {
      id: 'folder:new',
      title: 'New Folder',
      description: 'Create a new folder',
      category: 'File',
      action: onFolderNew
    },

    // Git Operations
    {
      id: 'git:status',
      title: 'Git Status',
      description: 'Show git status',
      category: 'Git',
      action: onGitStatus
    },
    {
      id: 'git:commit',
      title: 'Git Commit',
      description: 'Commit changes',
      category: 'Git',
      shortcut: 'Ctrl+Shift+C',
      action: onGitCommit
    },
    {
      id: 'git:branch',
      title: 'Create Branch',
      description: 'Create a new branch',
      category: 'Git',
      action: onGitBranch
    },
    {
      id: 'git:pr',
      title: 'Create Pull Request',
      description: 'Create a pull request',
      category: 'Git',
      action: onGitPR
    },

    // Terminal Operations
    {
      id: 'terminal:run',
      title: 'Run Terminal Command',
      description: 'Execute a terminal command',
      category: 'Terminal',
      action: onTerminalRun
    },
    {
      id: 'terminal:clear',
      title: 'Clear Terminal',
      description: 'Clear the terminal output',
      category: 'Terminal',
      action: onTerminalClear
    },

    // AI Assistant
    {
      id: 'ai:suggest',
      title: 'AI Code Suggestions',
      description: 'Get AI code suggestions',
      category: 'AI',
      shortcut: 'Ctrl+Shift+A',
      action: onAISuggest
    },
    {
      id: 'ai:refactor',
      title: 'AI Refactor',
      description: 'Refactor code with AI',
      category: 'AI',
      action: onAIRefactor
    },
    {
      id: 'ai:test',
      title: 'Generate Tests',
      description: 'Generate unit tests',
      category: 'AI',
      action: onAITest
    },
    {
      id: 'ai:explain',
      title: 'Explain Code',
      description: 'Explain the selected code',
      category: 'AI',
      action: onAIExplain
    },

    // Project Operations
    {
      id: 'project:run',
      title: 'Run Project',
      description: 'Run the project',
      category: 'Project',
      shortcut: 'F5',
      action: onProjectRun
    },
    {
      id: 'project:build',
      title: 'Build Project',
      description: 'Build the project',
      category: 'Project',
      action: onProjectBuild
    },
    {
      id: 'project:test',
      title: 'Run Tests',
      description: 'Run all tests',
      category: 'Project',
      action: onProjectTest
    },

    // Settings
    {
      id: 'settings:open',
      title: 'Open Settings',
      description: 'Open editor settings',
      category: 'Settings',
      shortcut: 'Ctrl+,',
      action: onSettingsOpen
    }
  ]
}
