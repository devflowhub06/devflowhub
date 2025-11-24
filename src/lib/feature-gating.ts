import { PlanType } from './stripe'

export interface FeatureGate {
  feature: string
  allowed: boolean
  reason?: string
  upgradeRequired?: PlanType
}

export interface FeatureConfig {
  [key: string]: {
    free: boolean
    pro: boolean
    enterprise: boolean
  }
}

// Define which features are available in each plan
export const FEATURE_CONFIG: FeatureConfig = {
  // AI Features
  ai_autocomplete: { free: true, pro: true, enterprise: true },
  ai_assistant: { free: true, pro: true, enterprise: true },
  ai_refactor: { free: false, pro: true, enterprise: true },
  ai_multi_file: { free: false, pro: true, enterprise: true },
  ai_context_panel: { free: false, pro: true, enterprise: true },
  ai_semantic_search: { free: false, pro: true, enterprise: true },
  
  // Collaboration
  share_workspace: { free: true, pro: true, enterprise: true },
  team_collaboration: { free: false, pro: true, enterprise: true },
  comments: { free: false, pro: true, enterprise: true },
  
  // Deployment
  deployments: { free: true, pro: true, enterprise: true },
  custom_domains: { free: false, pro: true, enterprise: true },
  preview_environments: { free: true, pro: true, enterprise: true },
  
  // Projects
  unlimited_projects: { free: false, pro: false, enterprise: true },
  project_templates: { free: true, pro: true, enterprise: true },
  
  // Integrations
  github_integration: { free: true, pro: true, enterprise: true },
  linear_integration: { free: false, pro: true, enterprise: true },
  jira_integration: { free: false, pro: true, enterprise: true },
  
  // Analytics
  usage_analytics: { free: false, pro: true, enterprise: true },
  advanced_analytics: { free: false, pro: false, enterprise: true },
  
  // Support
  priority_support: { free: false, pro: true, enterprise: true },
  dedicated_support: { free: false, pro: false, enterprise: true },
}

/**
 * Check if a feature is available for a given plan
 */
export function isFeatureAvailable(feature: string, plan: PlanType): boolean {
  const config = FEATURE_CONFIG[feature]
  if (!config) {
    // Unknown feature, default to false for safety
    return false
  }
  
  return config[plan] || false
}

/**
 * Get feature gate information
 */
export function getFeatureGate(feature: string, plan: PlanType): FeatureGate {
  const allowed = isFeatureAvailable(feature, plan)
  
  if (allowed) {
    return {
      feature,
      allowed: true
    }
  }
  
  // Determine which plan is required
  let upgradeRequired: PlanType = 'pro'
  if (FEATURE_CONFIG[feature]?.enterprise && !FEATURE_CONFIG[feature]?.pro) {
    upgradeRequired = 'enterprise'
  }
  
  return {
    feature,
    allowed: false,
    reason: `This feature requires ${upgradeRequired === 'enterprise' ? 'Enterprise' : 'Pro'} plan`,
    upgradeRequired
  }
}

/**
 * Check multiple features at once
 */
export function checkFeatures(features: string[], plan: PlanType): Record<string, FeatureGate> {
  const gates: Record<string, FeatureGate> = {}
  for (const feature of features) {
    gates[feature] = getFeatureGate(feature, plan)
  }
  return gates
}

/**
 * Get upgrade message for a feature
 */
export function getUpgradeMessage(feature: string, plan: PlanType): string {
  const gate = getFeatureGate(feature, plan)
  if (gate.allowed) {
    return ''
  }
  
  const planName = gate.upgradeRequired === 'enterprise' ? 'Enterprise' : 'Pro'
  return `Upgrade to ${planName} to unlock ${feature.replace(/_/g, ' ')}`
}


