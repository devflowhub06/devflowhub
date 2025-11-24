/**
 * DevFlowHub Module Mapping System
 * Maps external tool names to DevFlowHub module names
 * Maintains provenance while providing unified branding
 */

import { isFeatureEnabled } from './feature-flags'

// Legacy tool types (for backward compatibility)
export type LegacyToolType = 'CURSOR' | 'REPLIT' | 'V0' | 'BOLT'
export type LegacyToolKey = 'cursor' | 'replit' | 'v0' | 'bolt'

// New DevFlowHub module types
export type DevFlowHubModule = 'editor' | 'sandbox' | 'ui_studio' | 'deployer'
export type DevFlowHubModuleName = 'DevFlowHub Editor' | 'DevFlowHub Sandbox' | 'DevFlowHub UI Studio' | 'DevFlowHub Deployer'

// Provider types (for provenance tracking)
export type ProviderType = 'cursor' | 'replit' | 'v0' | 'bolt'

export interface ModuleMapping {
  legacyTool: LegacyToolType
  legacyKey: LegacyToolKey
  module: DevFlowHubModule
  moduleName: DevFlowHubModuleName
  provider: ProviderType
  icon: string
  color: string
  description: string
}

export const MODULE_MAPPINGS: Record<LegacyToolType, ModuleMapping> = {
  CURSOR: {
    legacyTool: 'CURSOR',
    legacyKey: 'cursor',
    module: 'editor',
    moduleName: 'DevFlowHub Editor',
    provider: 'cursor',
    icon: 'Terminal',
    color: 'bg-green-600',
    description: 'Code editor with AI assistance'
  },
  REPLIT: {
    legacyTool: 'REPLIT',
    legacyKey: 'replit',
    module: 'sandbox',
    moduleName: 'DevFlowHub Sandbox',
    provider: 'replit',
    icon: 'Code2',
    color: 'bg-blue-600',
    description: 'Cloud development environment'
  },
  V0: {
    legacyTool: 'V0',
    legacyKey: 'v0',
    module: 'ui_studio',
    moduleName: 'DevFlowHub UI Studio',
    provider: 'v0',
    icon: 'Sparkles',
    color: 'bg-purple-600',
    description: 'AI-powered UI component generation'
  },
  BOLT: {
    legacyTool: 'BOLT',
    legacyKey: 'bolt',
    module: 'deployer',
    moduleName: 'DevFlowHub Deployer',
    provider: 'bolt',
    icon: 'Rocket',
    color: 'bg-orange-600',
    description: 'Deployment and hosting pipeline'
  }
}

/**
 * Get module mapping by legacy tool type
 */
export function getModuleMapping(legacyTool: LegacyToolType): ModuleMapping {
  return MODULE_MAPPINGS[legacyTool]
}

/**
 * Get module mapping by legacy tool key
 */
export function getModuleMappingByKey(legacyKey: LegacyToolKey): ModuleMapping {
  const mapping = Object.values(MODULE_MAPPINGS).find(m => m.legacyKey === legacyKey)
  if (!mapping) {
    throw new Error(`No module mapping found for legacy key: ${legacyKey}`)
  }
  return mapping
}

/**
 * Get module mapping by DevFlowHub module
 */
export function getModuleMappingByModule(module: DevFlowHubModule): ModuleMapping {
  const mapping = Object.values(MODULE_MAPPINGS).find(m => m.module === module)
  if (!mapping) {
    throw new Error(`No module mapping found for module: ${module}`)
  }
  return mapping
}

/**
 * Convert legacy tool to DevFlowHub module (with feature flag check)
 */
export function toDevFlowHubModule(legacyTool: LegacyToolType): DevFlowHubModule {
  if (isFeatureEnabled('REBRAND_V1_0')) {
    return getModuleMapping(legacyTool).module
  }
  // Fallback to legacy behavior
  return legacyTool.toLowerCase() as DevFlowHubModule
}

/**
 * Get display name for tool/module (with feature flag check)
 */
export function getDisplayName(legacyTool: LegacyToolType): string {
  if (isFeatureEnabled('REBRAND_V1_0')) {
    return getModuleMapping(legacyTool).moduleName
  }
  // Fallback to legacy names
  const legacyNames: Record<LegacyToolType, string> = {
    CURSOR: 'Editor',
    REPLIT: 'Sandbox', 
    V0: 'UI Studio',
    BOLT: 'Deployer'
  }
  return legacyNames[legacyTool]
}

/**
 * Get short label for tool/module (with feature flag check)
 */
export function getShortLabel(legacyTool: LegacyToolType): string {
  if (isFeatureEnabled('REBRAND_V1_0')) {
    return getModuleMapping(legacyTool).module.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  // Fallback to legacy labels
  const legacyLabels: Record<LegacyToolType, string> = {
    CURSOR: 'Editor',
    REPLIT: 'Sandbox',
    V0: 'UI Studio', 
    BOLT: 'Deployer'
  }
  return legacyLabels[legacyTool]
}

/**
 * Get all available modules
 */
export function getAllModules(): ModuleMapping[] {
  return Object.values(MODULE_MAPPINGS)
}

/**
 * Get all DevFlowHub modules
 */
export function getAllDevFlowHubModules(): DevFlowHubModule[] {
  return Object.values(MODULE_MAPPINGS).map(m => m.module)
}

/**
 * Convert URL tool parameter to module parameter
 */
export function toolParamToModuleParam(toolParam: string): string {
  const legacyKey = toolParam.toLowerCase() as LegacyToolKey
  if (isFeatureEnabled('REBRAND_V1_0')) {
    return getModuleMappingByKey(legacyKey).module
  }
  return toolParam
}

/**
 * Convert module parameter to tool parameter (for backward compatibility)
 */
export function moduleParamToToolParam(moduleParam: string): string {
  if (isFeatureEnabled('REBRAND_V1_0')) {
    const mapping = getModuleMappingByModule(moduleParam as DevFlowHubModule)
    return mapping.legacyKey
  }
  return moduleParam
}
