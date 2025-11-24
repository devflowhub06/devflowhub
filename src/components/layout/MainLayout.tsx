'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import DevFlowHubLogo from '../ui/DevFlowHubLogo';

interface MainLayoutProps {
  children: ReactNode;
}

// Custom FolderKanban icon for Projects
const FolderKanban = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={
      `mr-3 h-6 w-6 transition-colors duration-200 group-hover:stroke-[#3B82F6] text-muted-foreground ${props.className || ''}`
    }
    {...props}
  >
    <path d="M2 7a2 2 0 0 1 2-2h3.17a2 2 0 0 1 1.41.59l1.83 1.82A2 2 0 0 0 12.83 8H20a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" />
    <path d="M8 13h.01" />
    <path d="M12 13h.01" />
    <path d="M16 13h.01" />
  </svg>
);

// Custom Lucide Settings (cog) icon
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`mr-3 h-6 w-6 text-gray-500 group-hover:text-slate-900 transition-colors duration-200 ${props.className || ''}`}
    {...props}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 5 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.6 5a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 16 5a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19 8.6c.22.36.34.78.34 1.21 0 .43-.12.85-.34 1.21Z" />
  </svg>
);

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
    { name: 'Upgrade', href: '/dashboard/settings/plan', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} aria-modal="true" role="dialog">
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-background border-r transition-transform duration-300" style={{ transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center space-x-2">
              <DevFlowHubLogo size={32} />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              className="rounded-md p-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="text-lg">✕</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-md px-3 py-4 text-base font-medium text-muted-foreground hover:bg-gray-100 hover:text-slate-900 transition-colors duration-200`}
                  aria-label={item.name}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="mr-3 h-6 w-6" />}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r bg-background">
          <div className="flex h-16 items-center px-4">
            <Link href="/" className="flex items-center space-x-2">
              <DevFlowHubLogo size={32} />
            </Link>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-4 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-gray-100 hover:text-slate-900 transition-colors duration-200`}
                >
                  {item.icon && <item.icon className="mr-3 h-6 w-6" />}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-background border-b lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            className="px-4 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring min-h-[44px]"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="text-lg">☰</span>
          </button>
          <div className="flex flex-1 justify-center px-4">
            <Link href="/" className="flex items-center">
              <DevFlowHubLogo size={32} />
            </Link>
          </div>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 