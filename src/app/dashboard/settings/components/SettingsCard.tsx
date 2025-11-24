import { ReactNode } from 'react';

interface SettingsCardProps {
  title: string;
  description: string;
  children: ReactNode;
  id: string;
}

export function SettingsCard({ title, description, children, id }: SettingsCardProps) {
  return (
    <div 
      id={id}
      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
} 