'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Database,
  Plus,
  Download,
  Upload,
  Clock,
  HardDrive,
  Trash2,
  RotateCcw,
  Camera,
  History
} from 'lucide-react'

interface Snapshot {
  id: string
  projectId: string
  description: string
  createdAt: Date
  size: string
}

interface SnapshotManagerProps {
  projectId: string
}

export function SnapshotManager({ projectId }: SnapshotManagerProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newSnapshotDesc, setNewSnapshotDesc] = useState('')

  // Load snapshots
  const loadSnapshots = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/sandbox/${projectId}/snapshot`)
      if (response.ok) {
        const data = await response.json()
        setSnapshots(data.snapshots || [])
      }
    } catch (error) {
      console.error('Error loading snapshots:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Create snapshot
  const createSnapshot = async () => {
    if (!newSnapshotDesc.trim()) return

    try {
      setIsCreating(true)
      const response = await fetch(`/api/sandbox/${projectId}/snapshot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: newSnapshotDesc
        })
      })

      if (response.ok) {
        const data = await response.json()
        setNewSnapshotDesc('')
        await loadSnapshots()
        alert('Snapshot created successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to create snapshot: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating snapshot:', error)
      alert('Failed to create snapshot')
    } finally {
      setIsCreating(false)
    }
  }

  // Restore snapshot
  const restoreSnapshot = async (snapshotId: string, description: string) => {
    if (!confirm(`Are you sure you want to restore "${description}"? This will overwrite current project state.`)) {
      return
    }

    try {
      // In production, this would call a restore API
      alert('Snapshot restore functionality coming soon!')
    } catch (error) {
      console.error('Error restoring snapshot:', error)
      alert('Failed to restore snapshot')
    }
  }

  // Delete snapshot
  const deleteSnapshot = async (snapshotId: string, description: string) => {
    if (!confirm(`Are you sure you want to delete "${description}"?`)) {
      return
    }

    try {
      // In production, this would call a delete API
      alert('Snapshot delete functionality coming soon!')
    } catch (error) {
      console.error('Error deleting snapshot:', error)
      alert('Failed to delete snapshot')
    }
  }

  useEffect(() => {
    loadSnapshots()
  }, [projectId])

  return (
    <div className="space-y-4">
      {/* Create Snapshot */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-400" />
            <span>Create Snapshot</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label className="text-slate-300">Description</Label>
              <Input
                value={newSnapshotDesc}
                onChange={(e) => setNewSnapshotDesc(e.target.value)}
                placeholder="e.g., Before AI changes, Pre-deployment backup"
                className="bg-slate-700 border-slate-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && createSnapshot()}
              />
            </div>
            
            <Button
              onClick={createSnapshot}
              disabled={!newSnapshotDesc.trim() || isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Snapshot</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Snapshots List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center space-x-2">
              <History className="h-5 w-5 text-purple-400" />
              <span>Snapshots</span>
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={loadSnapshots}
              disabled={isLoading}
              className="flex items-center space-x-1"
            >
              <RotateCcw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading snapshots...</p>
            </div>
          ) : snapshots.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto mb-4 text-slate-400 opacity-50" />
              <p className="text-slate-400">No snapshots available</p>
              <p className="text-slate-500 text-sm">Create your first snapshot to enable rollback functionality</p>
            </div>
          ) : (
            <div className="space-y-3">
              {snapshots.map((snapshot) => (
                <div key={snapshot.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{snapshot.description}</h4>
                    <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                      {snapshot.size}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(snapshot.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HardDrive className="h-3 w-3" />
                      <span>{snapshot.size}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreSnapshot(snapshot.id, snapshot.description)}
                      className="flex items-center space-x-1 text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
                    >
                      <Upload className="h-3 w-3" />
                      <span>Restore</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center space-x-1 text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSnapshot(snapshot.id, snapshot.description)}
                      className="flex items-center space-x-1 text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
