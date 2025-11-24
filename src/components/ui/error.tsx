'use client'

import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import { Button } from './button'

interface ErrorProps {
  title?: string
  message?: string
  className?: string
  onRetry?: () => void
}

export function Error({ 
  title = 'Something went wrong', 
  message = 'An error occurred while processing your request.',
  className,
  onRetry 
}: ErrorProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 p-6 text-center', className)}>
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-6 w-6 text-destructive animate-bounce" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="animate-fade-in"
        >
          Try Again
        </Button>
      )}
    </div>
  )
} 