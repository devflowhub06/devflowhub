'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Gauge, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Server,
  Zap
} from 'lucide-react'

interface SystemHealthData {
  deploySuccessRate: number
  avgSessionTime: number
  activeUsers: number
  systemUptime: number
  errorRate: number
  responseTime: number
  totalDeployments: number
  failedDeployments: number
}

interface SystemHealthProps {
  data: SystemHealthData
  isLoading?: boolean
}

export function SystemHealth({ data, isLoading = false }: SystemHealthProps) {
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

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const formatUptime = (uptime: number) => {
    if (uptime >= 99.9) return '99.9%'
    return `${uptime.toFixed(1)}%`
  }

  const getHealthStatus = (rate: number) => {
    if (rate >= 95) return { status: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (rate >= 90) return { status: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' }
    if (rate >= 80) return { status: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    return { status: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  const getPerformanceStatus = (time: number) => {
    if (time <= 200) return { status: 'Fast', color: 'text-green-600' }
    if (time <= 500) return { status: 'Good', color: 'text-blue-600' }
    if (time <= 1000) return { status: 'Slow', color: 'text-yellow-600' }
    return { status: 'Very Slow', color: 'text-red-600' }
  }

  const deployStatus = getHealthStatus(data.deploySuccessRate)
  const performanceStatus = getPerformanceStatus(data.responseTime)

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>Deploy Success Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.deploySuccessRate}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge 
                variant={data.deploySuccessRate >= 95 ? "default" : data.deploySuccessRate >= 90 ? "secondary" : "destructive"}
                className="text-xs"
              >
                {deployStatus.status}
              </Badge>
              <Progress value={data.deploySuccessRate} className="h-2 flex-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Avg Session Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(data.avgSessionTime)}</div>
            <div className="text-xs text-muted-foreground">
              Per active session
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Active Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.activeUsers)}</div>
            <div className="text-xs text-muted-foreground">
              Currently online
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>System Uptime</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(data.systemUptime)}</div>
            <div className="text-xs text-muted-foreground">
              Last 30 days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <h3 className="font-medium">Response Time</h3>
                    <p className="text-sm text-muted-foreground">Average API response</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${performanceStatus.color}`}>
                    {data.responseTime}ms
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {performanceStatus.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <h3 className="font-medium">Error Rate</h3>
                    <p className="text-sm text-muted-foreground">Failed requests</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    {data.errorRate}%
                  </div>
                  <Badge 
                    variant={data.errorRate <= 1 ? "default" : data.errorRate <= 5 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {data.errorRate <= 1 ? "Low" : data.errorRate <= 5 ? "Medium" : "High"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Deployment Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatNumber(data.totalDeployments - data.failedDeployments)}
                </div>
                <div className="text-sm text-muted-foreground">Successful Deployments</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-lg font-bold">{formatNumber(data.totalDeployments)}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-lg font-bold text-red-600">{formatNumber(data.failedDeployments)}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-lg font-bold text-green-600">{data.deploySuccessRate}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>

              <Progress value={data.deploySuccessRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {data.deploySuccessRate >= 95 ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : data.deploySuccessRate >= 90 ? (
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                )}
              </div>
              <div className="text-lg font-bold">Deployment System</div>
              <div className={`text-sm ${deployStatus.color}`}>
                {deployStatus.status}
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {data.responseTime <= 500 ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : data.responseTime <= 1000 ? (
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                )}
              </div>
              <div className="text-lg font-bold">API Performance</div>
              <div className={`text-sm ${performanceStatus.color}`}>
                {performanceStatus.status}
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {data.systemUptime >= 99.5 ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : data.systemUptime >= 99.0 ? (
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                )}
              </div>
              <div className="text-lg font-bold">System Uptime</div>
              <div className={`text-sm ${data.systemUptime >= 99.5 ? 'text-green-600' : data.systemUptime >= 99.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {data.systemUptime >= 99.5 ? 'Excellent' : data.systemUptime >= 99.0 ? 'Good' : 'Needs Attention'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Overall Health Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {Math.round((data.deploySuccessRate + (100 - data.errorRate) + data.systemUptime) / 3)}%
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Based on deployment success, error rate, and uptime
            </div>
            <Progress 
              value={Math.round((data.deploySuccessRate + (100 - data.errorRate) + data.systemUptime) / 3)} 
              className="h-3 mb-4" 
            />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">Deployments</div>
                <div className="text-muted-foreground">{data.deploySuccessRate}% success</div>
              </div>
              <div>
                <div className="font-medium">Reliability</div>
                <div className="text-muted-foreground">{data.systemUptime}% uptime</div>
              </div>
              <div>
                <div className="font-medium">Performance</div>
                <div className="text-muted-foreground">{100 - data.errorRate}% success</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
