interface Project {
  name: string;
  type?: string;
  framework?: string;
  context?: {
    files?: any[];
  };
}

export const generateV0Url = (project: Project) => {
  const baseUrl = 'https://v0.dev';
  if (!project.context?.files) return `${baseUrl}?ref=devflow`;
  const params = new URLSearchParams({
    ref: 'devflow',
    project: project.name,
    type: project.type || 'web-app',
    framework: project.framework || 'react'
  });
  return `${baseUrl}?${params.toString()}`;
};

export const SUPPORTED_TOOLS = {
  v0: {
    name: 'v0',
    displayName: 'v0.dev',
    description: 'AI-powered UI generation',
    capabilities: ['ui-generation', 'component-creation', 'rapid-prototyping'],
    baseUrl: 'https://v0.dev',
    icon: 'palette',
    isExternal: true,
    getUrl: (project: Project) => generateV0Url(project),
    isAvailable: () => true,
    lastUsed: null
  },
  // ... other tools
}; 