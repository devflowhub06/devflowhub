import { prisma } from './prisma';

// Database query optimizations
export const dbOptimizations = {
  // Optimized user query with select only needed fields
  getUserOptimized: (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        createdAt: true,
        // Don't select password or other sensitive fields
      },
    });
  },

  // Optimized project query with pagination
  getProjectsOptimized: (userId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    return prisma.project.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        currentTool: true,
        totalToolSwitches: true,
        createdAt: true,
        updatedAt: true,
        // Don't select large fields unless needed
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    });
  },

  // Optimized activity query with pagination
  getActivitiesOptimized: (projectId: string, page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;
    return prisma.projectActivity.findMany({
      where: { projectId },
      select: {
        id: true,
        type: true,
        description: true,
        metadata: true,
        createdAt: true,
        // Don't select details unless needed
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  },

  // Batch operations for better performance
  batchCreateActivities: (activities: any[]) => {
    return prisma.projectActivity.createMany({
      data: activities,
      skipDuplicates: true,
    });
  },

  // Optimized count queries
  getProjectStats: (userId: string) => {
    return prisma.$transaction([
      prisma.project.count({ where: { userId } }),
      prisma.usageLog.count({ where: { userId } }),
    ]);
  },
};

// Connection pooling optimization
export const optimizeConnection = () => {
  // Prisma automatically handles connection pooling
  // But we can add custom optimizations here
  return {
    // Add any custom connection optimizations
    maxConnections: 10,
    idleTimeout: 30000,
  };
}; 