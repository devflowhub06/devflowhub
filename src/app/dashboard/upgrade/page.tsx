export default function UpgradePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Upgrade Your Plan</h1>
      <div className="text-center">
        <p className="text-gray-400 mb-8">Visit our pricing page to upgrade your plan and unlock all features.</p>
        <a 
          href="/pricing" 
          className="inline-block bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          View Pricing Plans
        </a>
      </div>
    </div>
  )
} 