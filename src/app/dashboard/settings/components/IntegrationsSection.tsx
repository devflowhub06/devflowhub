'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'

export function IntegrationsSection() {
  const integrations = [
    {
      name: 'DevFlowHub Editor',
      provider: 'Cursor',
      status: 'connected',
      description: 'Code editing and file management',
      lastSync: '2 minutes ago'
    },
    {
      name: 'DevFlowHub Sandbox', 
      provider: 'Replit',
      status: 'connected',
      description: 'Cloud development environment',
      lastSync: '5 minutes ago'
    },
    {
      name: 'DevFlowHub UI Studio',
      provider: 'v0',
      status: 'available',
      description: 'AI-powered UI generation',
      lastSync: 'Never'
    },
    {
      name: 'DevFlowHub Deployer',
      provider: 'Bolt',
      status: 'available', 
      description: 'Deployment and hosting',
      lastSync: 'Never'
    }
  ]

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Tool Integrations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {integrations.map((integration) => (
          <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-gray-900">{integration.name}</h3>
                <Badge 
                  variant={integration.status === 'connected' ? 'default' : 'secondary'}
                  className={integration.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                >
                  {integration.status === 'connected' ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                  ) : (
                    <><AlertCircle className="h-3 w-3 mr-1" /> Available</>
                  )}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">{integration.description}</p>
              <p className="text-xs text-gray-500">Last sync: {integration.lastSync}</p>
              <p className="text-xs text-gray-400 mt-1">
                Powered by {integration.provider} API
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                Configure
              </Button>
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">About Tool Integrations</h4>
          <p className="text-sm text-blue-700">
            DevFlowHub integrates with leading development tools to provide a unified workspace experience. 
            Each module is powered by industry-standard APIs while maintaining a consistent DevFlowHub interface.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
