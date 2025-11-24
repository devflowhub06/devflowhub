'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, MoreVertical, Clock, Users, ArrowRight } from 'lucide-react'

interface Workflow {
  id: string
  name: string
  description: string
  status: 'planning' | 'in-progress' | 'review' | 'completed'
  assignee: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
}

const workflows: Workflow[] = [
  {
    id: '1',
    name: 'User Authentication Flow',
    description: 'Implement OAuth2 authentication with social providers',
    status: 'in-progress',
    assignee: 'John Doe',
    dueDate: '2024-03-15',
    priority: 'high'
  },
  {
    id: '2',
    name: 'API Documentation',
    description: 'Generate OpenAPI documentation for all endpoints',
    status: 'planning',
    assignee: 'Jane Smith',
    dueDate: '2024-03-20',
    priority: 'medium'
  },
  {
    id: '3',
    name: 'Database Migration',
    description: 'Migrate to PostgreSQL with zero downtime',
    status: 'review',
    assignee: 'Mike Johnson',
    dueDate: '2024-03-10',
    priority: 'high'
  }
]

const statusConfig = {
  planning: { label: 'Planning', color: 'bg-blue-100 text-blue-700' },
  'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  review: { label: 'Review', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' }
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-red-100 text-red-700'
}

export default function WorkflowsPage() {
  const router = useRouter()
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)

  const groupedWorkflows = workflows.reduce((acc, workflow) => {
    if (!acc[workflow.status]) {
      acc[workflow.status] = []
    }
    acc[workflow.status].push(workflow)
    return acc
  }, {} as Record<string, Workflow[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-gray-500 mt-1">Manage your development workflows and tasks</p>
        </div>
        <Button onClick={() => router.push('/workflows/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">{config.label}</h2>
              <Badge variant="secondary" className={config.color}>
                {groupedWorkflows[status]?.length || 0}
              </Badge>
            </div>

            <div className="space-y-4">
              {groupedWorkflows[status]?.map((workflow) => (
                <Card
                  key={workflow.id}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedWorkflow === workflow.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedWorkflow(workflow.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </div>

                    <p className="text-sm text-gray-500">{workflow.description}</p>

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={priorityColors[workflow.priority]}>
                        {workflow.priority}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {workflow.dueDate}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {workflow.assignee}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/workflows/${workflow.id}`)
                        }}
                      >
                        View
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 