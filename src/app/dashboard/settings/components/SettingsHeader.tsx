import { Settings } from 'lucide-react';

export function SettingsHeader() {
  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20">
          <Settings className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>
      {/* Decorative gradient orb */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-violet-400/20 rounded-full blur-3xl -z-10" />
    </div>
  );
} 