'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  FolderPlus, 
  FileText, 
  Clock, 
  Rocket, 
  Bot,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface KPIData {
  projectsCreated: {
    value: number
    trend: number
    previousValue: number
  }
  templatesUsed: {
    value: number
    topTemplate: string
    breakdown: Record<string, number>
  }
  avgTimeToPreview: {
    value: number
    unit: string
  }
  deployConversionRate: {
    value: number
    deployedProjects: number
    totalProjects: number
  }
  aiAssistantUsage: {
    requests: number
    acceptanceRate: number
    tokensUsed: number
    accepted: number
    rejected: number
  }
}

interface AnalyticsKPIProps {
  data: KPIData
  isLoading?: boolean
}

export function AnalyticsKPI({ data, isLoading = false }: AnalyticsKPIProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return null
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {/* Projects Created */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projects Created</CardTitle>
          <FolderPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.projectsCreated.value)}</div>
          <div className="flex items-center space-x-1 text-xs">
            {getTrendIcon(data.projectsCreated.trend)}
            <span className={getTrendColor(data.projectsCreated.trend)}>
              {Math.abs(data.projectsCreated.trend)}% from last period
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Templates Used */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Templates Used</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.templatesUsed.value}</div>
          <div className="text-xs text-muted-foreground">
            Top: {data.templatesUsed.topTemplate}
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {Object.keys(data.templatesUsed.breakdown).length} unique
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Avg Time to Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Time to Preview</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatTime(data.avgTimeToPreview.value)}
          </div>
          <div className="text-xs text-muted-foreground">
            From creation to first preview
          </div>
        </CardContent>
      </Card>

      {/* Deploy Conversion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deploy Conversion</CardTitle>
          <Rocket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.deployConversionRate.value}%</div>
          <div className="text-xs text-muted-foreground">
            {data.deployConversionRate.deployedProjects} of {data.deployConversionRate.totalProjects} projects
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
          <Bot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.aiAssistantUsage.requests)}</div>
          <div className="text-xs text-muted-foreground">
            {data.aiAssistantUsage.acceptanceRate}% acceptance rate
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {formatNumber(data.aiAssistantUsage.tokensUsed)} tokens
            </Badge>
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>{data.aiAssistantUsage.accepted}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-red-600">
              <ArrowDownRight className="h-3 w-3" />
              <span>{data.aiAssistantUsage.rejected}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
