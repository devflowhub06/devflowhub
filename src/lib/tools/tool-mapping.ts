// Note: server-safe module (do not mark as 'use client') so API routes can import.

export type ModuleId = 'editor' | 'sandbox' | 'ui-studio' | 'deployer'
export type ProviderId = 'cursor' | 'replit' | 'v0' | 'bolt'
export type DbEnum = 'EDITOR' | 'SANDBOX' | 'UI_STUDIO' | 'DEPLOYER'

export const moduleToBrandName: Record<ModuleId, string> = {
  'editor': 'DevFlowHub Editor',
  'sandbox': 'DevFlowHub Sandbox',
  'ui-studio': 'DevFlowHub UI Studio',
  'deployer': 'DevFlowHub Deployer',
}

export const providerToModule: Record<ProviderId, ModuleId> = {
  'cursor': 'editor',
  'replit': 'sandbox',
  'v0': 'ui-studio',
  'bolt': 'deployer',
}

export const moduleToProvider: Record<ModuleId, ProviderId> = {
  'editor': 'cursor',
  'sandbox': 'replit',
  'ui-studio': 'v0',
  'deployer': 'bolt',
}

export const providerToDb: Record<ProviderId, DbEnum> = {
  'cursor': 'EDITOR',
  'replit': 'SANDBOX',
  'v0': 'UI_STUDIO',
  'bolt': 'DEPLOYER',
}

export const dbToProvider: Record<DbEnum, ProviderId> = {
  'EDITOR': 'cursor',
  'SANDBOX': 'replit',
  'UI_STUDIO': 'v0',
  'DEPLOYER': 'bolt',
}

export function toModuleId(input: string): ModuleId | null {
  const lower = input.toLowerCase() as ProviderId | ModuleId
  if ((['editor','sandbox','ui-studio','deployer'] as string[]).includes(lower)) return lower as ModuleId
  if ((['cursor','replit','v0','bolt'] as string[]).includes(lower)) return providerToModule[lower as ProviderId]
  return null
}

export function toProviderId(input: string): ProviderId | null {
  const lower = input.toLowerCase()
  if ((['cursor','replit','v0','bolt'] as string[]).includes(lower)) return lower as ProviderId
  if ((['editor','sandbox','ui-studio','deployer'] as string[]).includes(lower)) return moduleToProvider[lower as ModuleId]
  return null
}

export function toDbEnum(input: string): DbEnum | null {
  const provider = toProviderId(input)
  return provider ? providerToDb[provider] : null
}

export function brandLabelFromAny(input: string): string {
  const module = toModuleId(input)
  return module ? moduleToBrandName[module] : input
}


