'use client'

import React from 'react'
import { DevFlowHubUIStudio } from '@/components/workspace/DevFlowHubUIStudio'

interface UIStudioPageProps {
  params: { id: string }
}

export default function UIStudioPage({ params }: UIStudioPageProps) {
  return <DevFlowHubUIStudio projectId={params.id} />
}
