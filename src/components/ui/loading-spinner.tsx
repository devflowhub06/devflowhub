import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { HydrationSafe } from "./hydration-safe"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
  xl: "h-12 w-12"
}

export function LoadingSpinner({ 
  size = "md", 
  className,
  text 
}: LoadingSpinnerProps) {
  return (
    <HydrationSafe>
      <div className="flex flex-col items-center justify-center space-y-2">
        <Loader2 
          className={cn(
            "animate-spin text-primary",
            sizeClasses[size],
            className
          )} 
        />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    </HydrationSafe>
  )
}

// Pulse animation for content loading
export function PulseLoader({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="flex space-x-4">
        <div className="rounded-full bg-muted h-10 w-10"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
}

// Dots animation for AI processing
export function DotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

// Progress bar with smooth animation
export function ProgressLoader({ 
  progress, 
  className 
}: { 
  progress: number
  className?: string 
}) {
  return (
    <div className={cn("w-full bg-muted rounded-full h-2", className)}>
      <div
        className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}
