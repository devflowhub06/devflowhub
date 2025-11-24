import { prisma } from '@/lib/prisma'

export interface RagDocument {
  id: string
  projectId: string
  filename: string
  content: string
  metadata?: any
  vectorId?: string
}

/**
 * Simple RAG implementation using PostgreSQL full-text search
 * In production, this would integrate with pgvector, Chroma, or Pinecone
 */
export class RagService {
  /**
   * Ingest documents for a project
   */
  static async ingestDocuments(
    projectId: string, 
    documents: Array<{ filename: string; content: string; metadata?: any }>
  ): Promise<void> {
    try {
      const ragDocuments = documents.map(doc => ({
        projectId,
        filename: doc.filename,
        content: doc.content,
        metadata: {
          ...doc.metadata,
          ingestedAt: new Date().toISOString()
        }
      }))

      await prisma.ragDocument.createMany({
        data: ragDocuments,
        skipDuplicates: true
      })

      console.log(`Ingested ${documents.length} documents for project ${projectId}`)
    } catch (error) {
      console.error('Error ingesting RAG documents:', error)
      throw error
    }
  }

  /**
   * Search for relevant documents using full-text search
   */
  static async searchDocuments(
    projectId: string,
    query: string,
    limit: number = 5
  ): Promise<RagDocument[]> {
    try {
      // Use PostgreSQL full-text search
      const documents = await prisma.ragDocument.findMany({
        where: {
          projectId,
          OR: [
            {
              content: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              filename: {
                contains: query,
                mode: 'insensitive'
              }
            }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })

      return documents
    } catch (error) {
      console.error('Error searching RAG documents:', error)
      return []
    }
  }

  /**
   * Get project context for AI Assistant
   */
  static async getProjectContext(projectId: string): Promise<string> {
    try {
      const documents = await prisma.ragDocument.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      if (documents.length === 0) {
        return 'No project context available.'
      }

      const context = documents.map(doc => {
        return `## ${doc.filename}\n\`\`\`\n${doc.content.substring(0, 500)}${doc.content.length > 500 ? '...' : ''}\n\`\`\``
      }).join('\n\n')

      return `# Project Context\n\n${context}`
    } catch (error) {
      console.error('Error getting project context:', error)
      return 'Error retrieving project context.'
    }
  }

  /**
   * Update document content
   */
  static async updateDocument(
    projectId: string,
    filename: string,
    content: string,
    metadata?: any
  ): Promise<void> {
    try {
      await prisma.ragDocument.upsert({
        where: {
          projectId_path: {
            projectId,
            path: filename
          }
        },
        update: {
          content,
          metadata: {
            ...metadata,
            updatedAt: new Date().toISOString()
          }
        },
        create: {
          projectId,
          filename,
          content,
          metadata: {
            ...metadata,
            createdAt: new Date().toISOString()
          }
        }
      })
    } catch (error) {
      console.error('Error updating RAG document:', error)
      throw error
    }
  }

  /**
   * Delete document
   */
  static async deleteDocument(projectId: string, filename: string): Promise<void> {
    try {
      await prisma.ragDocument.deleteMany({
        where: {
          projectId,
          filename
        }
      })
    } catch (error) {
      console.error('Error deleting RAG document:', error)
      throw error
    }
  }

  /**
   * Get all documents for a project
   */
  static async getProjectDocuments(projectId: string): Promise<RagDocument[]> {
    try {
      const documents = await prisma.ragDocument.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
      })

      return documents
    } catch (error) {
      console.error('Error getting project documents:', error)
      return []
    }
  }
}

/**
 * Enhanced RAG service with vector search (placeholder for future implementation)
 */
export class VectorRagService {
  /**
   * Ingest documents with vector embeddings
   * This would integrate with pgvector, Chroma, or Pinecone
   */
  static async ingestWithEmbeddings(
    projectId: string,
    documents: Array<{ filename: string; content: string; metadata?: any }>
  ): Promise<void> {
    // Placeholder for vector embedding implementation
    console.log(`Vector ingestion for project ${projectId}:`, documents.length, 'documents')
    
    // For now, fall back to simple RAG
    await RagService.ingestDocuments(projectId, documents)
  }

  /**
   * Semantic search using vector similarity
   */
  static async semanticSearch(
    projectId: string,
    query: string,
    limit: number = 5
  ): Promise<RagDocument[]> {
    // Placeholder for semantic search implementation
    console.log(`Semantic search for project ${projectId}:`, query)
    
    // For now, fall back to text search
    return await RagService.searchDocuments(projectId, query, limit)
  }
}
