'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  Settings, 
  User, 
  Bell,
  Search,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HydrationSafe } from '@/components/ui/hydration-safe';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  notifications?: number;
}

export function MobileLayout({
  children,
  title,
  showBackButton = false,
  onBack,
  actions,
  notifications = 0,
}: MobileLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) {
    return <>{children}</>;
  }

  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', active: true },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
  ];

  return (
    <HydrationSafe>
      <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center space-x-3">
            {showBackButton ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            ) : (
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <MobileNavigation 
                    items={navigationItems}
                    onItemClick={() => setIsMenuOpen(false)}
                    notifications={notifications}
                  />
                </SheetContent>
              </Sheet>
            )}
            
            {title && (
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {notifications > 0 && (
              <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {notifications > 9 ? '9+' : notifications}
              </Badge>
            )}
            
            {actions || (
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="p-2">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-around h-16">
          {navigationItems.map((item, index) => (
            <Button
              key={item.href}
              variant={item.active ? "default" : "ghost"}
              size="sm"
              className={cn(
                "flex flex-col items-center space-y-1 h-auto py-2 px-3",
                item.active ? "text-white" : "text-gray-600"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
      </div>
    </HydrationSafe>
  );
}

function MobileNavigation({ 
  items, 
  onItemClick,
  notifications 
}: { 
  items: Array<{ icon: any; label: string; href: string; active?: boolean }>;
  onItemClick: () => void;
  notifications: number;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">DevFlowHub</h2>
        <p className="text-sm text-gray-600">AI Development OS</p>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {items.map((item) => (
            <Button
              key={item.href}
              variant={item.active ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={onItemClick}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
              {item.label === 'Dashboard' && notifications > 0 && (
                <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          DevFlowHub v2.0
        </div>
      </div>
    </div>
  );
}

// Mobile-specific card component
export function MobileCard({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 mx-4 mb-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Mobile-specific button group
export function MobileButtonGroup({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex space-x-2 px-4", className)}>
      {children}
    </div>
  );
}

// Mobile-specific list item
export function MobileListItem({ 
  children, 
  onClick,
  className 
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        "px-4 py-3 border-b border-gray-100 last:border-b-0",
        onClick && "cursor-pointer hover:bg-gray-50",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Mobile-specific input
export function MobileInput({ 
  className,
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        className
      )}
      {...props}
    />
  );
}

// Mobile-specific textarea
export function MobileTextarea({ 
  className,
  ...props 
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none",
        className
      )}
      {...props}
    />
  );
}
