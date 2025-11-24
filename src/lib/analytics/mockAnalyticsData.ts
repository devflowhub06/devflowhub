// Mock analytics data for DevFlowHub Analytics Dashboard
// Typescript interface for reference
export interface AnalyticsData {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalToolSwitches: number;
    averageRoutingAccuracy: number;
    totalTimeSaved: number;
  };
  toolUsage: {
    tool: string;
    totalUsage: number;
    successRate: number;
    averageDuration: number;
    recommendationAcceptance: number;
    color?: string;
  }[];
  projectDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
  routingPatterns: {
    pattern: string;
    frequency: number;
    successRate: number;
    avgTimeSaved: number;
  }[];
  recentActivities: {
    id: string;
    type: string;
    description: string;
    tool?: string;
    timestamp: string | Date;
    success: boolean;
    projectName?: string;
  }[];
}

// Tool color scheme
const toolColors = {
  Cursor: '#3b82f6', // blue
  Replit: '#f59e42', // orange
  v0: '#a78bfa',     // purple
  Bolt: '#10b981',   // green
};

export const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalProjects: 18,
    activeProjects: 10,
    completedProjects: 8,
    totalToolSwitches: 42,
    averageRoutingAccuracy: 92,
    totalTimeSaved: 47 * 60, // minutes
  },
  toolUsage: [
    { tool: 'Cursor', totalUsage: 38, successRate: 93, averageDuration: 12, recommendationAcceptance: 80, color: toolColors.Cursor },
    { tool: 'Replit', totalUsage: 52, successRate: 89, averageDuration: 15, recommendationAcceptance: 75, color: toolColors.Replit },
    { tool: 'v0', totalUsage: 21, successRate: 95, averageDuration: 10, recommendationAcceptance: 90, color: toolColors.v0 },
    { tool: 'Bolt', totalUsage: 29, successRate: 91, averageDuration: 14, recommendationAcceptance: 70, color: toolColors.Bolt },
  ],
  projectDistribution: [
    { type: 'Web Apps', count: 7, percentage: 39 },
    { type: 'APIs', count: 4, percentage: 22 },
    { type: 'Mobile Apps', count: 3, percentage: 17 },
    { type: 'Desktop Apps', count: 2, percentage: 11 },
    { type: 'Other', count: 2, percentage: 11 },
  ],
  routingPatterns: [
    { pattern: 'Replit → Cursor → v0', frequency: 12, successRate: 96, avgTimeSaved: 8 },
    { pattern: 'Bolt → Cursor', frequency: 8, successRate: 91, avgTimeSaved: 7 },
    { pattern: 'Cursor → v0', frequency: 6, successRate: 93, avgTimeSaved: 6 },
    { pattern: 'Replit → Bolt', frequency: 4, successRate: 88, avgTimeSaved: 5 },
  ],
  recentActivities: Array.from({ length: 20 }).map((_, i) => {
    const types = ['tool_switch', 'project_complete', 'context_sync'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    const success = Math.random() > 0.08;
    const tool = ['Cursor', 'Replit', 'v0', 'Bolt'][Math.floor(Math.random() * 4)];
    return {
      id: `activity-${i}`,
      type,
      description:
        type === 'tool_switch'
          ? `Switched to ${tool}`
          : type === 'project_complete'
          ? `Completed project with ${tool}`
          : `Context sync with ${tool}`,
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000 * 6), // every 6 hours
      tool,
      success,
      projectName: `Project ${Math.floor(Math.random() * 10) + 1}`,
    };
  }),
}; 