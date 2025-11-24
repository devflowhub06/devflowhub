'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  GitBranch,
  Download,
  Upload
} from 'lucide-react'
import { SyncConflictModal, SyncConflict, ConflictResolution } from '@/components/modals/SyncConflictModal'
import { useSyncService } from '@/lib/services/sync-service'
import { toast } from 'sonner'

interface SyncButtonProps {
  projectId: string
  className?: string
}

export function SyncButton({ projectId, className }: SyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasConflicts, setHasConflicts] = useState(false)
  const [conflict, setConflict] = useState<SyncConflict | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  
  const syncService = useSyncService(projectId)

  const handleSync = async () => {
    setIsLoading(true)
    setHasConflicts(false)
    
    try {
      const result = await syncService.syncFiles()
      
      if (result.success) {
        setLastSyncTime(new Date())
        toast.success('Files synced successfully')
      } else if (result.conflict) {
        setConflict(result.conflict)
        setHasConflicts(true)
        setIsModalOpen(true)
        toast.warning('Sync conflicts detected')
      } else {
        toast.error('Sync failed')
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Sync failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolveConflicts = async (resolution: ConflictResolution) => {
    try {
      const result = await syncService.resolveConflicts(resolution)
      
      if (result.success) {
        setHasConflicts(false)
        setConflict(null)
        setIsModalOpen(false)
        setLastSyncTime(new Date())
        toast.success('Conflicts resolved and synced')
      } else {
        toast.error('Failed to resolve conflicts')
      }
    } catch (error) {
      console.error('Error resolving conflicts:', error)
      toast.error('Failed to resolve conflicts')
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setConflict(null)
  }

  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button
          onClick={handleSync}
          disabled={isLoading}
          size="sm"
          variant={hasConflicts ? "destructive" : "outline"}
          className="flex items-center space-x-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasConflicts ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>
            {isLoading ? 'Syncing...' : hasConflicts ? 'Conflicts' : 'Sync'}
          </span>
        </Button>

        {lastSyncTime && !hasConflicts && (
          <Badge variant="outline" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Synced {lastSyncTime.toLocaleTimeString()}
          </Badge>
        )}

        {hasConflicts && (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {conflict?.files.length || 0} conflicts
          </Badge>
        )}
      </div>

      <SyncConflictModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        conflict={conflict}
        onResolve={handleResolveConflicts}
        isProcessing={isLoading}
      />
    </>
  )
}

export function SyncStatus({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState<'synced' | 'conflicts' | 'pending' | 'error'>('pending')
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // This would be connected to real-time sync status updates
  // For now, it's a placeholder for the sync status indicator

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      {status === 'synced' && (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Synced</span>
        </>
      )}
      {status === 'conflicts' && (
        <>
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>Conflicts</span>
        </>
      )}
      {status === 'pending' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span>Syncing...</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span>Sync Error</span>
        </>
      )}
    </div>
  )
}
