'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import { Analytics as VercelAnalytics } from '@vercel/analytics/react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { ErrorProvider } from '@/components/providers/ErrorProvider'
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider'
import { PWAInstaller, PWAUpdateAvailable, PWAServiceWorker } from '@/components/ui/pwa-installer'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ErrorProvider>
          <AnalyticsProvider>
            {children}
            <Toaster position="top-right" richColors />
            <PWAInstaller />
            <PWAUpdateAvailable />
            <PWAServiceWorker />
            <VercelAnalytics />
          </AnalyticsProvider>
        </ErrorProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
} 