import { SettingsCard } from './SettingsCard';

export function BillingSection() {
  return (
    <SettingsCard 
      title="Billing" 
      description="Manage your subscription and payment methods"
      id="billing"
    >
      <div className="space-y-4">
        <div className="text-gray-500 text-center py-8">
          <span className="text-lg">Billing management coming soon.</span>
        </div>
      </div>
    </SettingsCard>
  );
} 