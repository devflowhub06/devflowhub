'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { 
  Bot, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Zap,
  Brain,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface AIUsageData {
  requests: number
  acceptanceRate: number
  tokensUsed: number
  accepted: number
  rejected: number
}

interface AIUsageStatsProps {
  data: AIUsageData
  dailyData?: Array<{
    date: string
    requests: number
    accepted: number
    rejected: number
    tokensUsed: number
  }>
  isLoading?: boolean
}

export function AIUsageStats({ data, dailyData = [], isLoading = false }: AIUsageStatsProps) {
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Prepare data for charts
  const acceptanceData = [
    { name: 'Accepted', value: data.accepted, color: '#10b981' },
    { name: 'Rejected', value: data.rejected, color: '#ef4444' }
  ]

  const dailyChartData = dailyData.map(day => ({
    date: formatDate(day.date),
    requests: day.requests,
    accepted: day.accepted,
    rejected: day.rejected,
    tokensUsed: day.tokensUsed
  }))

  const avgTokensPerRequest = data.requests > 0 ? Math.round(data.tokensUsed / data.requests) : 0

  return (
    <div className="space-y-6">
      {/* AI Usage Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>Total Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.requests)}</div>
            <div className="text-xs text-muted-foreground">AI interactions</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Acceptance Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.acceptanceRate}%</div>
            <div className="text-xs text-muted-foreground">
              {data.accepted} of {data.accepted + data.rejected} suggestions
            </div>
            <Progress value={data.acceptanceRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Tokens Used</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.tokensUsed)}</div>
            <div className="text-xs text-muted-foreground">
              {avgTokensPerRequest} avg per request
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>AI Efficiency</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.acceptanceRate >= 80 ? 'Excellent' : data.acceptanceRate >= 60 ? 'Good' : 'Needs Work'}
            </div>
            <div className="text-xs text-muted-foreground">
              Based on acceptance rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily AI Usage Chart */}
      {dailyChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Daily AI Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      formatNumber(value),
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Total Requests"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accepted" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Accepted"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rejected" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Rejected"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acceptance Rate Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Acceptance Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={acceptanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {acceptanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatNumber(value), 'Suggestions']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="font-medium">Accepted Suggestions</h3>
                    <p className="text-sm text-muted-foreground">Successfully implemented</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{formatNumber(data.accepted)}</div>
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>{data.acceptanceRate}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <h3 className="font-medium">Rejected Suggestions</h3>
                    <p className="text-sm text-muted-foreground">Not implemented</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">{formatNumber(data.rejected)}</div>
                  <div className="flex items-center space-x-1 text-xs text-red-600">
                    <ArrowDownRight className="h-3 w-3" />
                    <span>{100 - data.acceptanceRate}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="font-medium">Token Efficiency</h3>
                    <p className="text-sm text-muted-foreground">Average per request</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatNumber(avgTokensPerRequest)}</div>
                  <div className="text-xs text-muted-foreground">tokens</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Usage Trends */}
      {dailyChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Token Usage Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      formatNumber(value),
                      name === 'tokensUsed' ? 'Tokens Used' : name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Bar dataKey="tokensUsed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Performance Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {data.acceptanceRate >= 80 ? 'Excellent' : data.acceptanceRate >= 60 ? 'Good' : 'Needs Improvement'}
              </div>
              <div className="text-sm text-muted-foreground">Overall Performance</div>
              <Badge 
                variant={data.acceptanceRate >= 80 ? "default" : data.acceptanceRate >= 60 ? "secondary" : "destructive"}
                className="mt-2"
              >
                {data.acceptanceRate >= 80 ? "High Quality" : data.acceptanceRate >= 60 ? "Moderate Quality" : "Low Quality"}
              </Badge>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {data.acceptanceRate >= 70 ? 'Efficient' : 'Inefficient'}
              </div>
              <div className="text-sm text-muted-foreground">Token Usage</div>
              <div className="text-xs text-muted-foreground mt-1">
                {avgTokensPerRequest} tokens per request
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {data.requests >= 100 ? 'High' : data.requests >= 50 ? 'Medium' : 'Low'}
              </div>
              <div className="text-sm text-muted-foreground">Usage Frequency</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatNumber(data.requests)} total requests
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
