'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Trash2, 
  Check, 
  AlertCircle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface NotificationsSettingsProps {
  notifications: Array<{
    id: string
    type: string
    title: string
    message: string
    read: boolean
    createdAt: string
  }> | null
  onUpdate: () => void
}

export function NotificationsSettings({ notifications, onUpdate }: NotificationsSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deploy_status':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'project_share':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'integration_error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'billing_event':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'deploy_status':
        return <Badge variant="default" className="bg-green-100 text-green-800">Deploy</Badge>
      case 'project_share':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Share</Badge>
      case 'integration_error':
        return <Badge variant="destructive">Error</Badge>
      case 'billing_event':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Billing</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      })

      if (response.ok) {
        toast.success('Notifications marked as read')
        onUpdate()
        setSelectedNotifications([])
      } else {
        toast.error('Failed to mark notifications as read')
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      toast.error('Failed to mark notifications as read')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNotifications = async (notificationIds: string[]) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/settings/notifications?ids=${notificationIds.join(',')}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Notifications deleted')
        onUpdate()
        setSelectedNotifications([])
      } else {
        toast.error('Failed to delete notifications')
      }
    } catch (error) {
      console.error('Error deleting notifications:', error)
      toast.error('Failed to delete notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(n => n !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedNotifications(notifications.map(n => n.id))
  }

  const clearSelection = () => {
    setSelectedNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications via email
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>In-App Notifications</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Show notifications within the application
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive push notifications in your browser
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Marketing Emails</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive product updates and promotional content
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Recent Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} unread
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Manage your recent notifications
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedNotifications.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead(selectedNotifications)}
                    disabled={isLoading}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteNotifications(selectedNotifications)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={selectedNotifications.length === notifications.length ? clearSelection : selectAll}
              >
                {selectedNotifications.length === notifications.length ? 'Clear All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border ${
                    notification.read 
                      ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                      : 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800'
                  } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getNotificationIcon(notification.type)}
                        <h4 className={`text-sm font-medium ${
                          notification.read 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-900 dark:text-white font-semibold'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getNotificationBadge(notification.type)}
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className={`mt-1 text-sm ${
                      notification.read 
                        ? 'text-gray-600 dark:text-gray-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
