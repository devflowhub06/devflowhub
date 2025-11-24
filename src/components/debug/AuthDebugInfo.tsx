'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'

export function AuthDebugInfo() {
  const { data: session, status } = useSession()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">🔧 Auth Debug Info</h3>
        <div className="text-xs text-yellow-700 space-y-1">
          <div><strong>Status:</strong> {status}</div>
          <div><strong>Has Session:</strong> {session ? 'Yes' : 'No'}</div>
          {session?.user && (
            <>
              <div><strong>User ID:</strong> {session.user.id}</div>
              <div><strong>Email:</strong> {session.user.email}</div>
              <div><strong>Name:</strong> {session.user.name}</div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
