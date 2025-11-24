'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Crown, 
  Shield, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface TeamSettingsProps {
  memberships: Array<{
    id: string
    role: string
    team: {
      id: string
      name: string
      description: string
      createdAt: string
    }
  }> | null
  teamMembers: Array<{
    id: string
    role: string
    user: {
      id: string
      name: string
      email: string
      image: string
    }
    team: {
      id: string
      name: string
    }
    invitedAt: string
    acceptedAt: string
  }> | null
  onUpdate: () => void
}

export function TeamSettings({ memberships, teamMembers, onUpdate }: TeamSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />
      case 'editor':
        return <Edit className="h-4 w-4 text-green-500" />
      case 'viewer':
        return <Users className="h-4 w-4 text-gray-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Owner</Badge>
      case 'admin':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Admin</Badge>
      case 'editor':
        return <Badge variant="default" className="bg-green-100 text-green-800">Editor</Badge>
      case 'viewer':
        return <Badge variant="secondary">Viewer</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const inviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.inviteUrl) {
          toast.success('Invitation sent successfully')
          // In production, you would send the email with the inviteUrl
        } else {
          toast.success('Team member added successfully')
        }
        onUpdate()
        setInviteEmail('')
        setInviteRole('editor')
        setShowInviteForm(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to invite team member')
      }
    } catch (error) {
      console.error('Error inviting team member:', error)
      toast.error('Failed to invite team member')
    } finally {
      setIsLoading(false)
    }
  }

  const removeMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/settings/team/${memberId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Team member removed successfully')
        onUpdate()
      } else {
        toast.error('Failed to remove team member')
      }
    } catch (error) {
      console.error('Error removing team member:', error)
      toast.error('Failed to remove team member')
    } finally {
      setIsLoading(false)
    }
  }

  const roleOptions = [
    { value: 'viewer', label: 'Viewer', description: 'Can view projects and files' },
    { value: 'editor', label: 'Editor', description: 'Can edit projects and files' },
    { value: 'admin', label: 'Admin', description: 'Can manage team settings and members' },
    { value: 'owner', label: 'Owner', description: 'Full access to all team features' }
  ]

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Overview
          </CardTitle>
          <CardDescription>
            Manage your team members and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Members</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {teamMembers.filter(m => m.acceptedAt).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Members</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {teamMembers.filter(m => !m.acceptedAt).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Invites</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Team Member */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Team Member
              </CardTitle>
              <CardDescription>
                Add new members to your team
              </CardDescription>
            </div>
            <Button onClick={() => setShowInviteForm(!showInviteForm)}>
              {showInviteForm ? 'Cancel' : 'Invite Member'}
            </Button>
          </div>
        </CardHeader>
        {showInviteForm && (
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-sm text-gray-500">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInviteForm(false)
                    setInviteEmail('')
                    setInviteRole('editor')
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={inviteMember} disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No team members
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Invite team members to start collaborating
              </p>
              <Button onClick={() => setShowInviteForm(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite First Member
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {member.user.image ? (
                        <img
                          src={member.user.image}
                          alt={member.user.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{member.user.name || member.user.email}</h3>
                        {getRoleIcon(member.role)}
                        {getRoleBadge(member.role)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.user.email}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          Joined {new Date(member.acceptedAt || member.invitedAt).toLocaleDateString()}
                        </span>
                        {!member.acceptedAt && (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {member.role !== 'owner' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMember(member.id, member.user.name || member.user.email)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Team Settings</CardTitle>
          <CardDescription>
            Configure team-wide settings and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Member Invites</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Allow team members to invite new members
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Project Visibility</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Control who can see team projects
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>API Access</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage team API key permissions
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Help */}
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>
            Learn more about team features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • <strong>Owners</strong> have full access to all team features and settings
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • <strong>Admins</strong> can manage team members and most settings
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • <strong>Editors</strong> can create and edit projects
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • <strong>Viewers</strong> can only view shared projects
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
