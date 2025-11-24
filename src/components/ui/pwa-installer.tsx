'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HydrationSafe } from '@/components/ui/hydration-safe';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Bell
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Quick synchronous checks first
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // If already installed, don't proceed
    if (checkInstalled()) {
      return;
    }

    // Check if user has dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setHasDismissed(true);
        return; // Early return if dismissed
      } else {
        localStorage.removeItem('pwa-install-dismissed');
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('beforeinstallprompt event fired');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check conditions immediately
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const isCurrentlyDismissed = dismissed ? (Date.now() - parseInt(dismissed, 10)) / (1000 * 60 * 60 * 24) < 7 : false;
      const isCurrentlyInstalled = window.matchMedia('(display-mode: standalone)').matches;
      
      if (!isCurrentlyDismissed && !isCurrentlyInstalled) {
        // Show almost immediately - minimal delay just for smooth UX animation
        const delay = window.location.pathname === '/' ? 300 : 500;
        setTimeout(() => {
          console.log('Showing install prompt');
          setShowInstallPrompt(true);
        }, delay);
      }
    };

    // Check if service worker is already registered (non-blocking)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          console.log('Service worker is registered');
        }
      }).catch((error) => {
        console.log('Service worker check:', error);
      });
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check notification support
    const checkNotifications = () => {
      if ('Notification' in window) {
        setNotificationsSupported(true);
        setNotificationPermission(Notification.permission);
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkNotifications();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleNotificationRequest = async () => {
    if (!notificationsSupported) return;

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Don't show if already installed or dismissed
  if (isInstalled || hasDismissed) {
    return null;
  }

  return (
    <HydrationSafe>
      {/* Install Prompt */}
      {showInstallPrompt && deferredPrompt && (
        <Card className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-md sm:mx-0 mx-auto shadow-2xl border border-accent-warn/20 bg-surface-800/95 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-accent-warn/10 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-accent-warn" />
                </div>
                <CardTitle className="text-lg text-white font-bold">Install devflowhub</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowInstallPrompt(false);
                  setHasDismissed(true);
                  localStorage.setItem('pwa-install-dismissed', Date.now().toString());
                }}
                className="p-1 hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-gray-300">
              Install DevFlowHub as a native app for a better experience
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="text-sm text-gray-300 space-y-1.5">
                <p className="flex items-center">
                  <span className="text-accent-warn mr-2">✓</span>
                  Quick access from your home screen
                </p>
                <p className="flex items-center">
                  <span className="text-accent-warn mr-2">✓</span>
                  Works offline
                </p>
                <p className="flex items-center">
                  <span className="text-accent-warn mr-2">✓</span>
                  Native app performance
                </p>
                <p className="flex items-center">
                  <span className="text-accent-warn mr-2">✓</span>
                  Push notifications
                </p>
              </div>
              <Button 
                onClick={handleInstallClick} 
                className="w-full bg-accent-warn hover:bg-orange-600 text-white font-bold transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status indicators removed intentionally to reduce on-screen distractions */}

      {/* Notification Permission Request */}
      {notificationsSupported && notificationPermission === 'default' && !showInstallPrompt && (
        <Card className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-40 max-w-md sm:mx-0 mx-auto shadow-2xl border border-white/10 bg-surface-800/95 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent-warn/10 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-accent-warn" />
                </div>
                <div>
                  <p className="font-medium text-white">Enable Notifications</p>
                  <p className="text-sm text-gray-300">Get updates about your projects</p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={handleNotificationRequest}
                className="bg-accent-warn hover:bg-orange-600 text-white font-bold"
              >
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </HydrationSafe>
  );
}

// PWA Update Available Component
export function PWAUpdateAvailable() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        reg.addEventListener('updatefound', () => {
          setUpdateAvailable(true);
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <Card className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-md sm:mx-0 mx-auto shadow-2xl border border-accent-warn/20 bg-surface-800/95 backdrop-blur-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Monitor className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="font-medium text-white">Update Available</p>
              <p className="text-sm text-gray-300">A new version is ready</p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={handleUpdate}
            className="bg-accent-warn hover:bg-orange-600 text-white font-bold"
          >
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// PWA Service Worker Registration
export function PWAServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker in both dev and production for testing
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            console.log('Service Worker update found');
          });
        })
        .catch((registrationError) => {
          console.error('Service Worker registration failed:', registrationError);
        });
    } else {
      console.log('Service Workers are not supported in this browser');
    }
  }, []);

  return null;
}
