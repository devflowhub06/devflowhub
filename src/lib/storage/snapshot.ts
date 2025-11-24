import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '@/lib/prisma'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'devflowhub-snapshots'

export interface SnapshotData {
  projectId: string
  files: Array<{
    path: string
    content: string
    lastModified: string
  }>
  gitStatus: {
    branch: string
    commit: string
    timestamp: string
  }
  metadata: {
    userId: string
    reason: string
    timestamp: string
  }
}

export class SnapshotService {
  /**
   * Create a snapshot before applying AI changes
   */
  static async createSnapshot(
    projectId: string, 
    userId: string, 
    reason: string = 'AI changes'
  ): Promise<string> {
    try {
      // Get all project files
      const files = await prisma.projectFile.findMany({
        where: { projectId },
        select: {
          path: true,
          content: true,
          updatedAt: true
        }
      })

      // Get current git status (mock for now)
      const gitStatus = {
        branch: 'main',
        commit: 'abc123',
        timestamp: new Date().toISOString()
      }

      const snapshotData: SnapshotData = {
        projectId,
        files: files.map(f => ({
          path: f.path,
          content: f.content,
          lastModified: f.updatedAt.toISOString()
        })),
        gitStatus,
        metadata: {
          userId,
          reason,
          timestamp: new Date().toISOString()
        }
      }

      // Generate snapshot ID
      const snapshotId = `${projectId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const key = `snapshots/${projectId}/${snapshotId}.json`

      // Upload to S3 (skip if not configured)
      let s3Success = false
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        try {
          await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: JSON.stringify(snapshotData, null, 2),
            ContentType: 'application/json',
            Metadata: {
              projectId,
              userId,
              reason,
              timestamp: new Date().toISOString()
            }
          }))
          s3Success = true
          console.log(`Uploaded snapshot ${snapshotId} to S3`)
        } catch (s3Error) {
          console.warn('S3 upload failed, continuing without S3:', s3Error)
        }
      } else {
        console.log('S3 credentials not configured, skipping S3 upload')
      }

      // Store snapshot reference in database
      await prisma.projectBackup.create({
        data: {
          projectId,
          backupData: {
            snapshotId,
            s3Key: s3Success ? key : null,
            reason,
            fileCount: files.length,
            createdBy: userId,
            s3Success
          }
        }
      })

      console.log(`Snapshot created: ${snapshotId}`)
      return snapshotId

    } catch (error) {
      console.error('Error creating snapshot:', error)
      throw new Error('Failed to create snapshot')
    }
  }

  /**
   * Restore from a snapshot
   */
  static async restoreSnapshot(
    snapshotId: string,
    projectId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Get snapshot from database
      const backup = await prisma.projectBackup.findFirst({
        where: {
          projectId,
          backupData: {
            path: ['snapshotId'],
            equals: snapshotId
          }
        }
      })

      if (!backup) {
        throw new Error('Snapshot not found')
      }

      const s3Key = (backup.backupData as any).s3Key

      // Get snapshot from S3
      const response = await s3Client.send(new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key
      }))

      if (!response.Body) {
        throw new Error('Snapshot data not found in S3')
      }

      const snapshotData: SnapshotData = JSON.parse(await response.Body.transformToString())

      // Restore files
      for (const file of snapshotData.files) {
        await prisma.projectFile.upsert({
          where: {
            projectId_path: {
              projectId,
              path: file.path
            }
          },
          update: {
            content: file.content,
            updatedAt: new Date()
          },
          create: {
            projectId,
            name: file.path.split('/').pop() || 'untitled',
            path: file.path,
            content: file.content,
            type: 'file'
          }
        })
      }

      console.log(`Snapshot restored: ${snapshotId}`)
      return true

    } catch (error) {
      console.error('Error restoring snapshot:', error)
      throw new Error('Failed to restore snapshot')
    }
  }

  /**
   * List all snapshots for a project
   */
  static async listSnapshots(projectId: string): Promise<any[]> {
    try {
      const backups = await prisma.projectBackup.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

      return backups.map(backup => ({
        id: (backup.backupData as any).snapshotId,
        reason: (backup.backupData as any).reason,
        fileCount: (backup.backupData as any).fileCount,
        createdBy: (backup.backupData as any).createdBy,
        createdAt: backup.createdAt
      }))

    } catch (error) {
      console.error('Error listing snapshots:', error)
      return []
    }
  }
}
