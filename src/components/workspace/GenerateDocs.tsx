'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Loader2, 
  CheckCircle,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface GenerateDocsProps {
  projectId: string
  onDocsGenerated?: (fileName: string) => void
}

export function GenerateDocs({ projectId, onDocsGenerated }: GenerateDocsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)

  const generateDocs = async (type: 'readme' | 'docs' = 'readme') => {
    try {
      setIsGenerating(true)
      const response = await fetch(`/api/projects/${projectId}/docs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, format: 'markdown' })
      })

      if (response.ok) {
        const data = await response.json()
        setLastGenerated(data.fileName)
        toast.success(`${type === 'readme' ? 'README' : 'Documentation'} generated successfully!`)
        
        if (onDocsGenerated) {
          onDocsGenerated(data.fileName)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to generate documentation')
      }
    } catch (error) {
      console.error('Error generating docs:', error)
      toast.error('Failed to generate documentation')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Generate Documentation</span>
        </CardTitle>
        <CardDescription>
          Use AI to automatically generate README or project documentation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastGenerated && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-900 dark:text-green-100">
                Generated: {lastGenerated}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => generateDocs('readme')}
            disabled={isGenerating}
            className="bg-accent-warn hover:bg-accent-warn/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate README
              </>
            )}
          </Button>

          <Button
            onClick={() => generateDocs('docs')}
            disabled={isGenerating}
            variant="outline"
            className="bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Docs
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-slate-400">
          AI will analyze your project structure, files, and activities to generate comprehensive documentation.
        </p>
      </CardContent>
    </Card>
  )
}

