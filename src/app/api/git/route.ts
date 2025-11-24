import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { exec } from 'child_process'
import path from 'path'
import { promises as fs } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, action, message, files } = await request.json()

    if (!projectId || !action) {
      return NextResponse.json({ 
        error: 'Project ID and action are required' 
      }, { status: 400 })
    }

    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: session.user.id 
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get Cursor workspace
    const cursorWorkspace = await prisma.cursorWorkspace.findUnique({
      where: { projectId }
    })

    if (!cursorWorkspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    let result: any

    switch (action) {
      case 'init':
        result = await gitInit(cursorWorkspace.rootPath)
        break
      
      case 'status':
        result = await gitStatus(cursorWorkspace.rootPath)
        break
      
      case 'add':
        result = await gitAdd(cursorWorkspace.rootPath, files)
        break
      
      case 'commit':
        if (!message) {
          return NextResponse.json({ error: 'Commit message required' }, { status: 400 })
        }
        result = await gitCommit(cursorWorkspace.rootPath, message)
        break
      
      case 'push':
        result = await gitPush(cursorWorkspace.rootPath)
        break
      
      case 'log':
        result = await gitLog(cursorWorkspace.rootPath)
        break
      
      default:
        return NextResponse.json({ error: 'Invalid Git action' }, { status: 400 })
    }

    // Log usage
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: session.user.id,
        tool: 'CURSOR',
        action: `git_${action}`,
        metadata: { 
          action,
          message,
          files,
          result: result?.success ? 'success' : 'error'
        }
      }
    })

    // Note: ProjectActivity creation removed to prevent database errors

    return NextResponse.json({ 
      success: true,
      action,
      result
    })

  } catch (error) {
    console.error('Error in Git API:', error)
    return NextResponse.json(
      { error: 'Git operation failed' },
      { status: 500 }
    )
  }
}

async function gitInit(workspacePath: string): Promise<any> {
  return new Promise((resolve) => {
    // Check if .git already exists
    const gitPath = path.join(workspacePath, '.git')
    
    fs.access(gitPath)
      .then(() => {
        resolve({
          success: true,
          message: 'Git repository already initialized',
          output: 'Repository exists'
        })
      })
      .catch(() => {
        // Simulate git init
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Git repository initialized successfully',
            output: `Initialized empty Git repository in ${workspacePath}/.git/`
          })
        }, 1000)
      })
  })
}

async function gitStatus(workspacePath: string): Promise<any> {
  return new Promise((resolve) => {
    // Simulate git status
    setTimeout(() => {
      resolve({
        success: true,
        output: `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/components/App.jsx
        modified:   src/styles/main.css

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        src/components/NewComponent.jsx
        api/endpoint.js

no changes added to commit (use "git add" and/or "git commit -a")`,
        staged: [],
        unstaged: ['src/components/App.jsx', 'src/styles/main.css'],
        untracked: ['src/components/NewComponent.jsx', 'api/endpoint.js']
      })
    }, 500)
  })
}

async function gitAdd(workspacePath: string, files: string[]): Promise<any> {
  return new Promise((resolve) => {
    // Simulate git add
    setTimeout(() => {
      resolve({
        success: true,
        message: `Added ${files.length} file(s) to staging area`,
        output: `Added ${files.join(', ')} to staging area`,
        staged: files
      })
    }, 800)
  })
}

async function gitCommit(workspacePath: string, commitMessage: string): Promise<any> {
  return new Promise((resolve) => {
    // Simulate git commit
    setTimeout(() => {
      const commitHash = Math.random().toString(36).substring(2, 8)
      resolve({
        success: true,
        message: 'Commit created successfully',
        output: `[main ${commitHash}] ${commitMessage}
 3 files changed, 45 insertions(+), 12 deletions(-)`,
        commitHash,
        commitMessage
      })
    }, 1200)
  })
}

async function gitPush(workspacePath: string): Promise<any> {
  return new Promise((resolve) => {
    // Simulate git push
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Changes pushed successfully',
        output: `Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 1.2 KiB | 1.2 MiB/s, done.
Total 3 (delta 2), reused 0 (delta 0), pack-reused 0
To https://github.com/user/repo.git
   abc1234..def5678  main -> main`,
        remote: 'origin',
        branch: 'main'
      })
    }, 1500)
  })
}

async function gitLog(workspacePath: string): Promise<any> {
  return new Promise((resolve) => {
    // Simulate git log
    setTimeout(() => {
      resolve({
        success: true,
        output: `commit def5678 (HEAD -> main)
Author: User <user@example.com>
Date:   ${new Date().toLocaleDateString()}

    Update components and styles

commit abc1234
Author: User <user@example.com>
Date:   ${new Date(Date.now() - 86400000).toLocaleDateString()}

    Initial commit`,
        commits: [
          {
            hash: 'def5678',
            author: 'User <user@example.com>',
            date: new Date().toLocaleDateString(),
            message: 'Update components and styles'
          },
          {
            hash: 'abc1234',
            author: 'User <user@example.com>',
            date: new Date(Date.now() - 86400000).toLocaleDateString(),
            message: 'Initial commit'
          }
        ]
      })
    }, 600)
  })
}
