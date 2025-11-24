export interface AI_Tool {
  method: string;
  auth: string;
  features: string[];
  capabilities: string[];
  api_endpoints: string[];
}

export interface PaymentIntegration {
  products: string[];
  webhooks: string[];
}

export interface CommunicationIntegration {
  provider: string;
  templates: string;
  use_cases: string[];
}

export interface MonitoringIntegration {
  errors: string;
  analytics: string;
  uptime: string;
}

export interface ExternalIntegrations {
  ai_tools: {
    replit: AI_Tool;
    cursor: AI_Tool;
    v0: AI_Tool;
    bolt: AI_Tool;
  };
  payments: {
    stripe: PaymentIntegration;
  };
  communication: {
    email: CommunicationIntegration;
  };
  monitoring: {
    errors: string;
    analytics: string;
    uptime: string;
  };
}

export const integrations: ExternalIntegrations = {
  ai_tools: {
    replit: {
      method: "REST API",
      auth: "API Key",
      features: [
        "Repository Creation/Import",
        "Live Environment Management", 
        "Collaborative Editing",
        "Real-time Chat",
        "Cursor Position Sharing",
        "Package Management",
        "Runtime Configuration",
        "Deployment Management"
      ],
      capabilities: [
        "Multi-language Support",
        "Real-time Collaboration",
        "Live Sessions",
        "Environment Variables",
        "Secrets Management",
        "File Operations",
        "Directory Management"
      ],
      api_endpoints: [
        "/repls",
        "/repls/{id}/files",
        "/repls/{id}/env",
        "/repls/{id}/live",
        "/repls/{id}/collaborators",
        "/repls/{id}/repository",
        "/repls/{id}/deploy"
      ]
    },
    cursor: {
      method: "REST API + Deep Links",
      auth: "API Key",
      features: [
        "File Sync Capabilities",
        "Real-time Code Editing",
        "Project Context Transfer",
        "Cross-tool Synchronization",
        "Conflict Resolution",
        "File History",
        "Real-time Collaboration",
        "Cursor Position Tracking"
      ],
      capabilities: [
        "Multi-project Management",
        "Context Export/Import",
        "Real-time Sync Events",
        "Collaboration Management",
        "Deep Link Generation",
        "File Operations",
        "Workspace Settings"
      ],
      api_endpoints: [
        "/projects",
        "/projects/{id}/files",
        "/projects/{id}/context",
        "/projects/{id}/sync",
        "/projects/{id}/collaboration",
        "/projects/{id}/cursor"
      ]
    },
    v0: {
      method: "REST API",
      auth: "API Key",
      features: [
        "Component Generation",
        "Design System Sync",
        "UI Preview Capabilities",
        "Component Variants",
        "Code Analysis",
        "Storybook Generation",
        "Test Generation",
        "Documentation Generation"
      ],
      capabilities: [
        "Multi-framework Support",
        "Design System Management",
        "Interactive Previews",
        "Screenshot Capture",
        "Component Optimization",
        "Accessibility Analysis",
        "Performance Analysis"
      ],
      api_endpoints: [
        "/components/generate",
        "/components/{id}",
        "/design-systems",
        "/previews",
        "/analyze",
        "/components/{id}/variants",
        "/components/{id}/stories"
      ]
    },
    bolt: {
      method: "REST API",
      auth: "API Key",
      features: [
        "Deployment Pipelines",
        "Environment Management",
        "Build Configuration",
        "Real-time Logs",
        "Artifact Management",
        "Preview Deployments",
        "Rollback Capabilities",
        "Pipeline Triggers"
      ],
      capabilities: [
        "Multi-environment Support",
        "CI/CD Pipelines",
        "Real-time Monitoring",
        "Artifact Storage",
        "Environment Variables",
        "Secrets Management",
        "Deployment History"
      ],
      api_endpoints: [
        "/projects",
        "/projects/{id}/environments",
        "/projects/{id}/pipelines",
        "/projects/{id}/deployments",
        "/projects/{id}/build-config",
        "/projects/{id}/logs"
      ]
    },
  },
  payments: {
    stripe: {
      products: ["Subscription Management", "Usage Billing"],
      webhooks: ["Payment Success", "Subscription Changes"],
    },
  },
  communication: {
    email: {
      provider: "Resend",
      templates: "React Email",
      use_cases: ["Verification", "Notifications", "Billing"],
    },
  },
  monitoring: {
    errors: "Sentry",
    analytics: "Vercel Analytics + PostHog",
    uptime: "Vercel Monitoring",
  },
}; 