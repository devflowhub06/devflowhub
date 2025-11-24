'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Eye,
  RotateCcw,
  Trash2
} from 'lucide-react'

interface GenerationJob {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  prompt: string
  estimatedCost: number
  result?: any
  error?: string
  createdAt: string
}

interface GenerationJobViewProps {
  jobs: GenerationJob[]
  currentJob: GenerationJob | null
  onSelectJob: (job: GenerationJob) => void
}

export function GenerationJobView({ jobs, currentJob, onSelectJob }: GenerationJobViewProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />
      case 'processing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
      case 'queued':
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      case 'processing':
        return 'bg-blue-500'
      case 'queued':
      default:
        return 'bg-yellow-500'
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Job */}
      {currentJob && (
        <Card className="bg-slate-800 border-slate-700 border-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-white text-sm">
              <Zap className="h-4 w-4 text-purple-400" />
              <span>Current Generation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(currentJob.status)}
              <Badge className={`${getStatusColor(currentJob.status)} text-white text-xs`}>
                {currentJob.status}
              </Badge>
            </div>
            
            <div className="text-sm text-slate-300 line-clamp-2">
              "{currentJob.prompt}"
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>${currentJob.estimatedCost}</span>
              </div>
              <span>{new Date(currentJob.createdAt).toLocaleTimeString()}</span>
            </div>

            {currentJob.status === 'completed' && currentJob.result && (
              <Button
                size="sm"
                onClick={() => onSelectJob(currentJob)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Eye className="h-3 w-3 mr-1" />
                View Component
              </Button>
            )}

            {currentJob.status === 'failed' && currentJob.error && (
              <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
                Error: {currentJob.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Job History */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Generation History</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {jobs.length} jobs
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-auto">
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-8 w-8 mx-auto mb-3 text-slate-400 opacity-50" />
                <p className="text-slate-400 text-sm">No generation jobs yet</p>
                <p className="text-slate-500 text-xs">Start generating components to see history</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div 
                  key={job.jobId}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentJob?.jobId === job.jobId 
                      ? 'bg-purple-900/30 border-purple-500' 
                      : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => onSelectJob(job)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                      <Badge className={`${getStatusColor(job.status)} text-white text-xs`}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400">
                      ${job.estimatedCost}
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-300 line-clamp-2 mb-2">
                    "{job.prompt}"
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    {job.status === 'completed' && (
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-400">
                {jobs.filter(j => j.status === 'completed').length}
              </div>
              <div className="text-slate-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-400">
                ${jobs.reduce((sum, j) => sum + j.estimatedCost, 0).toFixed(2)}
              </div>
              <div className="text-slate-400">Total Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
