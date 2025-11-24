'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Code, 
  Palette, 
  Terminal, 
  Rocket,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react'

interface ToolUsageData {
  tool: string
  name: string
  totalSessions: number
  totalTimeMinutes: number
  lastUsed: string | null
  dailyUsage: Record<string, number>
  successRate: number
}

interface ToolUsageChartProps {
  data: {
    toolUsage: ToolUsageData[]
    dailyData: Array<Record<string, any>>
    summary: {
      totalSessions: number
      totalTimeMinutes: number
      mostUsedTool: string
    }
  }
  isLoading?: boolean
}

export function ToolUsageChart({ data, isLoading = false }: ToolUsageChartProps) {
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

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'editor': return <Code className="h-4 w-4" />
      case 'ui_studio': return <Palette className="h-4 w-4" />
      case 'sandbox': return <Terminal className="h-4 w-4" />
      case 'deployer': return <Rocket className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getToolColor = (tool: string) => {
    const colors = {
      editor: '#3b82f6',
      ui_studio: '#8b5cf6',
      sandbox: '#10b981',
      deployer: '#f59e0b'
    }
    return colors[tool as keyof typeof colors] || '#6b7280'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Prepare data for pie chart (usage distribution)
  const pieData = data.toolUsage.map(tool => ({
    name: tool.name,
    value: tool.totalSessions,
    color: getToolColor(tool.tool)
  }))

  // Prepare data for daily usage chart
  const dailyChartData = data.dailyData.map(day => ({
    date: formatDate(day.date),
    ...day
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.summary.totalSessions)}</div>
            <div className="text-xs text-muted-foreground">Across all tools</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(data.summary.totalTimeMinutes)}</div>
            <div className="text-xs text-muted-foreground">Active development time</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Used Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getToolIcon(data.summary.mostUsedTool)}
              <span className="text-lg font-bold capitalize">
                {data.summary.mostUsedTool.replace('_', ' ')}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">By session count</div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Daily Tool Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    formatNumber(value),
                    name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' ')
                  ]}
                />
                <Area type="monotone" dataKey="editor" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="ui_studio" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="sandbox" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="deployer" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tool Usage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Usage Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatNumber(value), 'Sessions']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tool Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Tool Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.toolUsage.map((tool) => (
                <div key={tool.tool} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div style={{ color: getToolColor(tool.tool) }}>
                      {getToolIcon(tool.tool)}
                    </div>
                    <div>
                      <h3 className="font-medium">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(tool.totalSessions)} sessions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {formatTime(tool.totalTimeMinutes)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tool.successRate}% success
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tool Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tool Usage Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.toolUsage.map((tool) => (
              <div key={tool.tool} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div style={{ color: getToolColor(tool.tool) }}>
                    {getToolIcon(tool.tool)}
                  </div>
                  <div>
                    <h3 className="font-medium">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Last used: {tool.lastUsed ? formatDate(tool.lastUsed) : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-bold">{formatNumber(tool.totalSessions)}</div>
                    <div className="text-xs text-muted-foreground">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{formatTime(tool.totalTimeMinutes)}</div>
                    <div className="text-xs text-muted-foreground">Total Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{tool.successRate}%</div>
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                  </div>
                  <Badge 
                    variant={tool.successRate >= 80 ? "default" : tool.successRate >= 60 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {tool.successRate >= 80 ? "Excellent" : tool.successRate >= 60 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
