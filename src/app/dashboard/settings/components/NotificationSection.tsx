'use client';
import { useState } from 'react';
import { Bell, Mail, MessageSquare, Zap } from 'lucide-react';
import { SettingsCard } from './SettingsCard';

type NotificationType = 'email' | 'push' | 'sms' | 'marketing';

export function NotificationSection() {
  const [notifications, setNotifications] = useState<Record<NotificationType, boolean>>({
    email: true,
    push: true,
    sms: false,
    marketing: false
  });

  const toggleNotification = (type: NotificationType) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <SettingsCard 
      title="Notifications" 
      description="Control how you receive updates and alerts"
      id="notifications"
    >
      <div className="space-y-6">
        {[
          { key: 'email', label: 'Email Notifications', icon: Mail, description: 'Get notified about project updates via email' },
          { key: 'push', label: 'Push Notifications', icon: Bell, description: 'Receive push notifications in your browser' },
          { key: 'sms', label: 'SMS Notifications', icon: MessageSquare, description: 'Get important alerts via SMS' },
          { key: 'marketing', label: 'Marketing Updates', icon: Zap, description: 'Receive product updates and tips' }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{item.label}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification(item.key as NotificationType)}
                className={`
                  relative w-12 h-6 rounded-full transition-colors duration-200
                  ${notifications[item.key as NotificationType] ? 'bg-blue-500' : 'bg-gray-300'}
                `}
              >
                <div className={`
                  absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200
                  ${notifications[item.key as NotificationType] ? 'transform translate-x-6' : 'transform translate-x-0.5'}
                `} />
              </button>
            </div>
          );
        })}
      </div>
    </SettingsCard>
  );
} 