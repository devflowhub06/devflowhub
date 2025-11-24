import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface EnhancedProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showPercentage?: boolean
  animated?: boolean
  color?: "default" | "blue" | "green" | "red" | "yellow" | "purple"
  size?: "sm" | "md" | "lg"
  label?: string
}

const colorVariants = {
  default: "bg-primary",
  blue: "bg-gradient-to-r from-blue-500 to-cyan-500",
  green: "bg-gradient-to-r from-green-500 to-emerald-500", 
  red: "bg-gradient-to-r from-red-500 to-rose-500",
  yellow: "bg-gradient-to-r from-yellow-500 to-orange-500",
  purple: "bg-gradient-to-r from-purple-500 to-pink-500"
}

const sizeVariants = {
  sm: "h-2",
  md: "h-3", 
  lg: "h-4"
}

const EnhancedProgress = React.forwardRef<HTMLDivElement, EnhancedProgressProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    showPercentage = true, 
    animated = true,
    color = "default",
    size = "md",
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
    
    return (
      <div className={cn("w-full space-y-2", className)} ref={ref} {...props}>
        {(label || showPercentage) && (
          <div className="flex justify-between items-center">
            {label && (
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
            )}
            {showPercentage && (
              <motion.span 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {Math.round(percentage)}%
              </motion.span>
            )}
          </div>
        )}
        
        <div className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          sizeVariants[size]
        )}>
          <motion.div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              color === "default" ? colorVariants.default : colorVariants[color]
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ 
              duration: animated ? 1 : 0,
              ease: "easeOut",
              delay: 0.2
            }}
          />
        </div>
      </div>
    )
  }
)
EnhancedProgress.displayName = "EnhancedProgress"

// Circular Progress Component
interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: "default" | "blue" | "green" | "red" | "yellow" | "purple"
  animated?: boolean
  showPercentage?: boolean
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    size = 120,
    strokeWidth = 8,
    color = "default",
    animated = true,
    showPercentage = true,
    ...props 
  }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference
    
    const colorClasses = {
      default: "stroke-primary",
      blue: "stroke-blue-500",
      green: "stroke-green-500",
      red: "stroke-red-500", 
      yellow: "stroke-yellow-500",
      purple: "stroke-purple-500"
    }
    
    return (
      <div 
        className={cn("relative inline-flex items-center justify-center", className)} 
        ref={ref} 
        {...props}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            className={colorClasses[color]}
            initial={{ strokeDasharray, strokeDashoffset: circumference }}
            animate={{ strokeDasharray, strokeDashoffset }}
            transition={{ 
              duration: animated ? 1.5 : 0,
              ease: "easeInOut"
            }}
          />
        </svg>
        
        {showPercentage && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-lg font-semibold">
              {Math.round(percentage)}%
            </span>
          </motion.div>
        )}
      </div>
    )
  }
)
CircularProgress.displayName = "CircularProgress"

export { EnhancedProgress, CircularProgress }
