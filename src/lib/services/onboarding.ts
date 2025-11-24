'use server'

import { prisma } from '@/lib/prisma'

export type OnboardingStep =
  | 'createdFirstProject'
  | 'connectedIntegration'
  | 'ranInSandbox'
  | 'deployedToStaging'
  | 'usedAssistant'

export async function getOnboardingProgress(userId: string) {
  const existing = await prisma.onboardingProgress.findUnique({ where: { userId } })
  if (existing) return existing
  return prisma.onboardingProgress.create({ data: { userId } })
}

export async function completeOnboardingStep(userId: string, step: OnboardingStep) {
  const fieldMap: Record<OnboardingStep, any> = {
    createdFirstProject: { createdFirstProject: true },
    connectedIntegration: { connectedIntegration: true },
    ranInSandbox: { ranInSandbox: true },
    deployedToStaging: { deployedToStaging: true },
    usedAssistant: { usedAssistant: true },
  }
  return prisma.onboardingProgress.upsert({
    where: { userId },
    create: { userId, ...fieldMap[step] },
    update: fieldMap[step],
  })
}


