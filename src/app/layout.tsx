import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'DevFlowHub – The AI Development OS',
  description: 'Build, test, and deploy apps in minutes with DevFlowHub\'s unified AI workspaces.',
  keywords: 'AI development, coding tools, AI workspace, development OS, DevFlowHub, AI coding assistant',
  authors: [{ name: 'DevFlowHub Team' }],
  creator: 'DevFlowHub',
  publisher: 'DevFlowHub',
  robots: 'index, follow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'devflowhub',
  },
  openGraph: {
    title: 'DevFlowHub – The AI Development OS',
    description: 'Build, test, and deploy apps in minutes with DevFlowHub\'s unified AI workspaces.',
    url: 'https://devflowhub.com',
    siteName: 'DevFlowHub',
    images: [
      {
        url: 'https://devflowhub.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DevFlowHub - AI Development OS',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevFlowHub – The AI Development OS',
    description: 'Build, test, and deploy apps in minutes with DevFlowHub\'s unified AI workspaces.',
    images: ['https://devflowhub.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://devflowhub.com',
  },
  icons: {
    icon: '/devflowhub-original-logo.png',
    shortcut: '/devflowhub-original-logo.png',
    apple: '/devflowhub-original-logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <PerformanceMonitor />
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  )
}