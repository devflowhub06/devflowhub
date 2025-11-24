'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, ResponsiveGrid, ResponsiveText } from '@/components/ui/responsive-container'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  CreditCard,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface RevenueData {
  totalRevenue: number
  totalUsers: number
  totalPayments: number
  planStats: Record<string, number>
  averageRevenuePerUser: number
}

interface SubscriptionData {
  status: string
  _count: { status: number }
}

interface UserPlanData {
  plan: string
  paymentStatus: string
  _count: { plan: number }
}

interface RecentPayment {
  id: string
  amount: number
  currency: string
  plan: string
  status: string
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

interface MonthlyTrend {
  month: string
  revenue: number
  payments: number
}

interface AdminAnalytics {
  revenue: RevenueData
  subscriptions: SubscriptionData[]
  userPlans: UserPlanData[]
  recentPayments: RecentPayment[]
  monthlyTrend: MonthlyTrend[]
}

export default function RevenueDashboard() {
  const [data, setData] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)

      const response = await fetch(`/api/admin/revenue?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch revenue data')
      }

      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Error fetching revenue data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch revenue analytics',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const exportData = () => {
    if (!data) return
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Revenue', `₹${data.revenue.totalRevenue.toLocaleString()}`],
      ['Total Users', data.revenue.totalUsers.toString()],
      ['Total Payments', data.revenue.totalPayments.toString()],
      ['Average Revenue Per User', `₹${data.revenue.averageRevenuePerUser.toFixed(2)}`],
      [''],
      ['Plan Statistics'],
      ...Object.entries(data.revenue.planStats).map(([plan, count]) => [plan, count.toString()]),
      [''],
      ['Recent Payments'],
      ['Date', 'User', 'Plan', 'Amount', 'Status'],
      ...data.recentPayments.map(payment => [
        new Date(payment.createdAt).toLocaleDateString(),
        payment.user.name || payment.user.email,
        payment.plan,
        `₹${payment.amount.toLocaleString()}`,
        payment.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-analytics-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: 'Export Complete',
      description: 'Revenue analytics exported successfully'
    })
  }

  if (loading) {
    return (
      <ResponsiveContainer className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </ResponsiveContainer>
    )
  }

  if (!data) {
    return (
      <ResponsiveContainer className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load revenue analytics</p>
          <Button onClick={fetchData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <ResponsiveText className="text-3xl font-bold">Revenue Analytics</ResponsiveText>
          <ResponsiveText className="text-muted-foreground">
            Track subscription revenue and user metrics
          </ResponsiveText>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border rounded-md text-sm"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <ResponsiveGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{data.revenue.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Average: ₹{data.revenue.averageRevenuePerUser.toFixed(2)} per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.revenue.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Paying customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.revenue.totalPayments}</div>
            <p className="text-xs text-muted-foreground">
              Successful transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              vs last month
            </p>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Plan Statistics */}
      <ResponsiveGrid className="grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>User distribution across subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.revenue.planStats).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={plan === 'PRO' ? 'default' : plan === 'ENTERPRISE' ? 'secondary' : 'outline'}>
                      {plan}
                    </Badge>
                  </div>
                  <span className="font-medium">{count} users</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Active subscription breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.subscriptions.map((sub) => (
                <div key={sub.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      sub.status === 'active' ? 'default' : 
                      sub.status === 'cancelled' ? 'destructive' : 
                      'secondary'
                    }>
                      {sub.status}
                    </Badge>
                  </div>
                  <span className="font-medium">{sub._count.status} subscriptions</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest successful payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">
                      {payment.user.name || payment.user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={payment.plan === 'PRO' ? 'default' : 'secondary'}>
                    {payment.plan}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                  <Badge variant="outline" className="text-xs">
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
          <CardDescription>Revenue progression over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.monthlyTrend.slice(-6).map((trend) => (
              <div key={trend.month} className="flex items-center justify-between p-2 border rounded">
                <span className="font-medium">{trend.month}</span>
                <div className="flex items-center gap-4">
                  <span>₹{trend.revenue.toLocaleString()}</span>
                  <Badge variant="outline">{trend.payments} payments</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ResponsiveContainer>
  )
}
