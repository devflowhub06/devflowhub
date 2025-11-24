'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Users,
  Clock
} from 'lucide-react'

interface FunnelStage {
  name: string
  count: number
  percentage: number
}

interface ConversionData {
  stages: FunnelStage[]
  conversionRates: {
    createdToPreview: number
    previewToDeploy: number
    deployToComplete: number
    overall: number
  }
  avgConversionTimes: {
    createdToPreview: number
    previewToDeploy: number
    deployToComplete: number
  }
  dropOffPoints: Array<{
    stage: string
    dropOffRate: number
    users: number
  }>
}

interface ConversionFunnelProps {
  data: ConversionData
  isLoading?: boolean
}

export function ConversionFunnel({ data, isLoading = false }: ConversionFunnelProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const chartData = data.stages.map((stage, index) => ({
    name: stage.name,
    count: stage.count,
    percentage: stage.percentage,
    color: getStageColor(index)
  }))

  const getStageColor = (index: number) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
    return colors[index] || '#6b7280'
  }

  const getStageIcon = (stageName: string) => {
    switch (stageName) {
      case 'Created': return <Users className="h-4 w-4" />
      case 'Previewed': return <CheckCircle className="h-4 w-4" />
      case 'Deployed': return <TrendingUp className="h-4 w-4" />
      case 'Completed': return <CheckCircle className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
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

  return (
    <div className="space-y-6">
      {/* Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="h-5 w-5" />
            <span>Conversion Funnel</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'count' ? formatNumber(value) : `${value}%`,
                    name === 'count' ? 'Users' : 'Conversion Rate'
                  ]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Funnel Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.stages.map((stage, index) => (
          <Card key={stage.name} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                {getStageIcon(stage.name)}
                <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stage.count)}</div>
              <div className="text-xs text-muted-foreground mb-2">
                {stage.percentage}% conversion rate
              </div>
              <Progress value={stage.percentage} className="h-2" />
              
              {/* Arrow to next stage */}
              {index < data.stages.length - 1 && (
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversion Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Conversion Rates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.conversionRates.createdToPreview}%
              </div>
              <div className="text-sm text-muted-foreground">Created → Previewed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.conversionRates.previewToDeploy}%
              </div>
              <div className="text-sm text-muted-foreground">Previewed → Deployed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.conversionRates.deployToComplete}%
              </div>
              <div className="text-sm text-muted-foreground">Deployed → Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.conversionRates.overall}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Conversion</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Conversion Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Average Conversion Times</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">
                {formatTime(data.avgConversionTimes.createdToPreview)}
              </div>
              <div className="text-sm text-muted-foreground">Created → Previewed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">
                {formatTime(data.avgConversionTimes.previewToDeploy)}
              </div>
              <div className="text-sm text-muted-foreground">Previewed → Deployed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">
                {formatTime(data.avgConversionTimes.deployToComplete)}
              </div>
              <div className="text-sm text-muted-foreground">Deployed → Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drop-off Analysis */}
      {data.dropOffPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Drop-off Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.dropOffPoints.map((dropOff, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{dropOff.stage}</h3>
                    <p className="text-sm text-muted-foreground">
                      {dropOff.users} users dropped off
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      {dropOff.dropOffRate}%
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      High Drop-off
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
