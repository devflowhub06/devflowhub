'use client'

import React from 'react'
import { DevFlowHubDeployer } from '@/components/workspace/DevFlowHubDeployer'

interface DeployerPageProps {
  params: {
    id: string
  }
}

export default function DeployerPage({ params }: DeployerPageProps) {
  return (
    <div className="h-full">
      <DevFlowHubDeployer projectId={params.id} />
    </div>
  )
}
