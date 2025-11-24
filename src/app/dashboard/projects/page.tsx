'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import useSWR from 'swr'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'archived'
  type: string
  selectedTool: string
  userId: string
  createdAt: string
  updatedAt: string
}

const statusColors = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-gray-100 text-gray-700'
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed ${res.status}: ${text}`)
  }
  return res.json()
}

// Memoized project card component for better performance
const ProjectCard = React.memo(({ project, onClick }: { project: Project, onClick: () => void }) => (
  <Card
    className="group hover:shadow-lg transition-all duration-200 cursor-pointer min-h-[120px]"
    onClick={onClick}
  >
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold group-hover:text-gray-900">
            {project.name}
          </h3>
          <Badge className="text-xs bg-blue-100 text-blue-800">
            {project.status}
          </Badge>
        </div>
        <Zap className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
      </div>
      <p className="mt-3 text-sm text-gray-500 group-hover:text-gray-700">
        {project.description}
      </p>
      <div className="mt-4 space-y-3">
        <div className="flex items-center text-sm text-gray-500">
          <Zap className="h-4 w-4 mr-2" />
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Zap className="h-4 w-4 mr-2" />
          Updated: {new Date(project.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  </Card>
))

ProjectCard.displayName = 'ProjectCard'

function FirstProjectTour({ isFirstProject }: { isFirstProject: boolean }) {
  useEffect(() => {
    if (isFirstProject) {
      setTimeout(() => {
        toast.success('Welcome to DevFlow! ✨', {
          icon: <Sparkles className="w-4 h-4" />,
          duration: 6000,
          description: "We'll handle tool routing for you. Just focus on building amazing projects!",
          action: {
            label: 'Got it!',
            onClick: () => toast.dismiss()
          }
        })
      }, 1500)
    }
  }, [isFirstProject])
  return null
}

export default function ProjectsPage() {
  const router = useRouter()
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const limit = 6 // Reduced from 9 to improve initial load

  const { data, error, isLoading } = useSWR(
    status === 'authenticated' ? `/api/projects?page=${page}&limit=${limit}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // Cache for 10 seconds
      errorRetryCount: 3,
      errorRetryInterval: 1000
    }
  )
  const projects: Project[] = data?.projects || []

  // Debug logging
  console.log('Projects page debug:', {
    status,
    isLoading,
    error: error?.message,
    data,
    projects: projects.length,
    session: session?.user?.id
  })

  // Memoized filtering for better performance
  const filteredProjects = useMemo(() => {
    const uniqueProjects = Array.from(new Map(projects.map(p => [p.name, p])).values())
    
    return uniqueProjects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = !selectedStatus || project.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, selectedStatus])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
        <Zap className="h-8 w-8 animate-spin text-gray-500" />
        <p className="mt-4 text-gray-600">Loading projects...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto mt-8 max-w-2xl">
        <AlertDescription className="flex items-center space-x-2">
          <Zap className="h-4 w-4" />
          <span>Error: {error.message || 'Failed to load projects'}</span>
        </AlertDescription>
        <Button onClick={() => {
          if (typeof window !== 'undefined') {
            window.location.reload()
          }
        }} className="mt-4">Retry</Button>
      </Alert>
    )
  }

  if (filteredProjects.length === 0 && searchQuery === '' && !selectedStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
        <h2 className="text-xl font-semibold mb-2">No Projects Found</h2>
        <p className="text-gray-500 mb-4">It looks like you haven't created any projects yet.</p>
        <Button onClick={() => router.push('/dashboard/projects/new')}>
          <Zap className="h-4 w-4 mr-2" />
          Create Your First Project
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FirstProjectTour isFirstProject={projects.length === 0} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-500 mt-1">Manage and track your development projects</p>
        </div>
        <Button onClick={() => router.push('/dashboard/projects/new')}>
          <Zap className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['active', 'completed', 'archived'].map((status) => (
            <Button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
          />
        ))}
      </div>
      
      <div className="flex justify-center gap-4 mt-8">
        <Button 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={page === 1}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          Previous
        </Button>
        <span className="text-gray-400">Page {page}</span>
        <Button 
          onClick={() => setPage(p => p + 1)} 
          disabled={projects.length < limit}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  )
} 