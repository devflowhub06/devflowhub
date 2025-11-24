'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Loader2,
  Sparkles,
  X,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { clientTrackEvent } from '@/lib/client-analytics'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  category?: string
  createdAt: Date
  aiGenerated?: boolean
}

interface TasksListProps {
  isOpen?: boolean
  onClose?: () => void
  projectId?: string
  onTaskClick?: (task: Task) => void
}

export default function TasksList({
  isOpen = false,
  onClose,
  projectId,
  onTaskClick
}: TasksListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const loadTasks = useCallback(async () => {
    if (!projectId) return

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }, [projectId])

  const generateAITasks = useCallback(async () => {
    if (!projectId || isGenerating) return

    setIsGenerating(true)
    
    clientTrackEvent('ai_tasks_generated', { projectId })

    try {
      const response = await fetch(`/api/editor/ai/tasks?projectId=${projectId}`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(prev => [...prev, ...(data.tasks || [])])
      }
    } catch (error) {
      console.error('Error generating AI tasks:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [projectId, isGenerating])

  const addTask = useCallback(async () => {
    if (!newTaskTitle.trim() || !projectId) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
      aiGenerated: false
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask })
      })

      if (response.ok) {
        setTasks(prev => [newTask, ...prev])
        setNewTaskTitle('')
        clientTrackEvent('task_created', { projectId, aiGenerated: false })
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }, [newTaskTitle, projectId])

  const toggleTask = useCallback(async (taskId: string) => {
    if (!projectId) return

    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))

    try {
      await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !tasks.find(t => t.id === taskId)?.completed })
      })

      clientTrackEvent('task_toggled', { projectId, taskId })
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }, [projectId, tasks])

  const deleteTask = useCallback(async (taskId: string) => {
    if (!projectId) return

    setTasks(prev => prev.filter(task => task.id !== taskId))

    try {
      await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE'
      })

      clientTrackEvent('task_deleted', { projectId, taskId })
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }, [projectId])

  useEffect(() => {
    if (isOpen && projectId) {
      loadTasks()
    }
  }, [isOpen, projectId, loadTasks])

  if (!isOpen) return null

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const activeTasksCount = tasks.filter(t => !t.completed).length
  const completedTasksCount = tasks.filter(t => t.completed).length

  return (
    <Card className="h-full flex flex-col border-white/10 bg-slate-950/40 backdrop-blur-xl">
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent-warn" />
            <CardTitle className="text-sm font-semibold">Tasks</CardTitle>
            {tasks.length > 0 && (
              <Badge variant="outline" className="bg-accent-warn/10 text-accent-warn border-accent-warn/20">
                {activeTasksCount} active
              </Badge>
            )}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 overflow-hidden p-0">
        {/* Actions */}
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addTask()
                }
              }}
              placeholder="Add a task..."
              className="flex-1 bg-slate-900/60 border-white/10 text-sm"
            />
            <Button
              onClick={addTask}
              disabled={!newTaskTitle.trim()}
              size="sm"
              className="bg-accent-warn hover:bg-orange-500"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={generateAITasks}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="flex-1 border-accent-warn/30 text-accent-warn hover:bg-accent-warn/10"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Generate AI Tasks
                </>
              )}
            </Button>
            <Button
              onClick={loadTasks}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-1">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f)}
                className={cn(
                  'text-xs capitalize',
                  filter === f 
                    ? 'bg-accent-warn/20 text-accent-warn border border-accent-warn/30' 
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {f}
                {f === 'active' && activeTasksCount > 0 && (
                  <Badge className="ml-1 bg-accent-warn/20 text-accent-warn border-0 text-[10px]">
                    {activeTasksCount}
                  </Badge>
                )}
                {f === 'completed' && completedTasksCount > 0 && (
                  <Badge className="ml-1 bg-slate-500/20 text-slate-400 border-0 text-[10px]">
                    {completedTasksCount}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <CheckCircle2 className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">
                  {filter === 'all' ? 'No tasks yet' : filter === 'active' ? 'No active tasks' : 'No completed tasks'}
                </p>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  {filter === 'all' && 'Add a task or generate AI suggestions'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                      task.completed
                        ? 'bg-slate-900/20 border-white/5 opacity-60'
                        : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60',
                      onTaskClick && 'cursor-pointer'
                    )}
                    onClick={() => onTaskClick?.(task)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleTask(task.id)
                      }}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-400 hover:text-accent-warn" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn(
                          'text-sm flex-1',
                          task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        )}>
                          {task.title}
                        </p>
                        {task.aiGenerated && (
                          <Badge className="bg-accent-warn/10 text-accent-warn border-accent-warn/20 text-[10px]">
                            AI
                          </Badge>
                        )}
                        {task.priority === 'high' && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
                            High
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                      )}
                      {task.category && (
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {task.category}
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTask(task.id)
                      }}
                      className="flex-shrink-0 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

