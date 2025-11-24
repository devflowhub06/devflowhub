import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // Date range filtering (optional, default: all time)
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || 'all';
  let dateFilter: any = {};
  const now = new Date();
  if (range === '7d') {
    dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
  } else if (range === '30d') {
    dateFilter = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
  } else if (range === '3m') {
    dateFilter = { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
  }

  // Fetch projects
  const projects = await prisma.project.findMany({
    where: { userId, ...(dateFilter.gte ? { createdAt: dateFilter } : {}) },
    include: { usageLogs: true, activities: true },
  });

  // Overview metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p: any) => p.status === 'active').length;
  const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
  const totalToolSwitches = projects.reduce((sum: number, p: any) => sum + (p.totalToolSwitches || 0), 0);
  const averageRoutingAccuracy = projects.length > 0 ? (projects.reduce((sum: number, p: any) => sum + (p.routingAccuracy || 0), 0) / projects.length) : 0;
  const totalTimeSaved = projects.reduce((sum: number, p: any) => sum + (p.timeSavedMinutes || 0), 0);

  // Tool usage analytics
  const allToolUsages = projects.flatMap((p: any) => p.usageLogs);
  const toolNames = ['cursor', 'replit', 'v0', 'bolt'];
  const toolUsage = toolNames.map(tool => {
    const usages = allToolUsages.filter((u: any) => u.tool === tool);
    const totalUsage = usages.length;
    const successRate = totalUsage > 0 ? (usages.filter((u: any) => u.metadata?.successful).length / totalUsage) * 100 : 0;
    const averageDuration = totalUsage > 0 ? (usages.reduce((sum: number, u: any) => sum + (u.durationMs || 0), 0) / totalUsage) : 0;
    const recommendationAcceptance = totalUsage > 0 ? (usages.filter((u: any) => u.metadata?.accepted).length / totalUsage) * 100 : 0;
    return { tool, totalUsage, successRate, averageDuration, recommendationAcceptance };
  });

  // Project distribution
  const typeCounts: Record<string, number> = {};
  projects.forEach((p: any) => {
    typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
  });
  const projectDistribution = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
    percentage: totalProjects > 0 ? (count / totalProjects) * 100 : 0,
  }));

  // Recent activities (last 20)
  const allActivities = projects.flatMap((p: any) => p.activities);
  allActivities.sort((a: any, b: any) => (b.createdAt as any) - (a.createdAt as any));
  const recentActivities = allActivities.slice(0, 20).map((a: any) => ({
    id: a.id,
    type: a.type,
    description: a.details,
    tool: a.tool,
    timestamp: a.createdAt,
    success: a.success,
    projectName: projects.find((p: any) => p.id === a.projectId)?.name || '',
  }));

  // Routing patterns (tool switch sequences)
  // For simplicity, group by fromTool -> toTool
  const routingMap: Record<string, { frequency: number; success: number; total: number; timeSaved: number } > = {};
  allActivities.forEach((a: any) => {
    if (a.type === 'tool_switch' && a.fromTool && a.toTool) {
      const key = `${a.fromTool} → ${a.toTool}`;
      if (!routingMap[key]) routingMap[key] = { frequency: 0, success: 0, total: 0, timeSaved: 0 };
      routingMap[key].frequency++;
      routingMap[key].total++;
      if (a.success) routingMap[key].success++;
      if (a.timeTaken) routingMap[key].timeSaved += a.timeTaken;
    }
  });
  const routingPatterns = Object.entries(routingMap).map(([pattern, data]) => ({
    pattern,
    frequency: data.frequency,
    successRate: data.total > 0 ? (data.success / data.total) * 100 : 0,
    avgTimeSaved: data.frequency > 0 ? (data.timeSaved / data.frequency) : 0,
  }));

  return NextResponse.json({
    overview: {
      totalProjects,
      activeProjects,
      completedProjects,
      totalToolSwitches,
      averageRoutingAccuracy,
      totalTimeSaved,
    },
    toolUsage,
    projectDistribution,
    recentActivities,
    routingPatterns,
  });
} 