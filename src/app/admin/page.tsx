import { Metadata } from 'next'
import RevenueDashboard from '@/components/admin/RevenueDashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard - DevFlowHub',
  description: 'Revenue analytics and subscription management dashboard',
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <RevenueDashboard />
    </div>
  )
}
