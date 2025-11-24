import { prisma } from '@/lib/prisma'
import { PlanType, PaymentStatus } from '@prisma/client'

export interface SubscriptionInfo {
  plan: PlanType
  status: PaymentStatus
  nextBillingDate?: Date
  isActive: boolean
  features: {
    aiWorkspaces: boolean
    advancedAnalytics: boolean
    deploymentTools: boolean
    collaborationTools: boolean
    customDomains: boolean
    prioritySupport: boolean
  }
}

export class SubscriptionService {
  static async getUserSubscription(userId: string): Promise<SubscriptionInfo> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        paymentStatus: true,
        nextBillingDate: true,
        trialEndsAt: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const isActive = user.paymentStatus === 'ACTIVE' || 
                    (user.plan === 'FREE' && (!user.trialEndsAt || user.trialEndsAt > new Date()))

    return {
      plan: user.plan,
      status: user.paymentStatus,
      nextBillingDate: user.nextBillingDate || undefined,
      isActive,
      features: this.getPlanFeatures(user.plan, isActive)
    }
  }

  static getPlanFeatures(plan: PlanType, isActive: boolean) {
    const features = {
      aiWorkspaces: false,
      advancedAnalytics: false,
      deploymentTools: false,
      collaborationTools: false,
      customDomains: false,
      prioritySupport: false
    }

    if (!isActive) return features

    switch (plan) {
      case 'FREE':
        features.aiWorkspaces = true
        features.deploymentTools = true
        break
      
      case 'PRO':
        features.aiWorkspaces = true
        features.advancedAnalytics = true
        features.deploymentTools = true
        features.collaborationTools = true
        features.customDomains = true
        features.prioritySupport = true
        break
      
      case 'ENTERPRISE':
        features.aiWorkspaces = true
        features.advancedAnalytics = true
        features.deploymentTools = true
        features.collaborationTools = true
        features.customDomains = true
        features.prioritySupport = true
        break
    }

    return features
  }

  static async upgradeUserPlan(userId: string, plan: PlanType) {
    const nextBillingDate = new Date()
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

    return await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        paymentStatus: 'ACTIVE',
        nextBillingDate
      }
    })
  }

  static async downgradeUserPlan(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        plan: 'FREE',
        paymentStatus: 'CANCELLED',
        nextBillingDate: null
      }
    })
  }

  static async startTrial(userId: string, plan: PlanType = 'PRO') {
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14) // 14-day trial

    return await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        trialEndsAt,
        paymentStatus: 'PENDING'
      }
    })
  }

  static async cancelSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { razorpaySubscriptions: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Cancel active subscription
    if (user.razorpaySubscriptionId) {
      await prisma.razorpaySubscription.updateMany({
        where: { razorpaySubscriptionId: user.razorpaySubscriptionId },
        data: { status: 'cancelled' }
      })
    }

    // Update user status
    return await prisma.user.update({
      where: { id: userId },
      data: {
        plan: 'FREE',
        paymentStatus: 'CANCELLED',
        nextBillingDate: null
      }
    })
  }

  static async getRevenueAnalytics(startDate?: Date, endDate?: Date) {
    const whereClause: any = {
      status: 'paid'
    }

    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) whereClause.createdAt.gte = startDate
      if (endDate) whereClause.createdAt.lte = endDate
    }

    const payments = await prisma.razorpayPayment.findMany({
      where: whereClause,
      include: { user: true }
    })

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalUsers = new Set(payments.map(p => p.userId)).size

    const planStats = payments.reduce((stats, payment) => {
      const plan = payment.plan
      stats[plan] = (stats[plan] || 0) + 1
      return stats
    }, {} as Record<string, number>)

    return {
      totalRevenue: totalRevenue / 100, // Convert paise to rupees
      totalUsers,
      totalPayments: payments.length,
      planStats,
      averageRevenuePerUser: totalUsers > 0 ? (totalRevenue / 100) / totalUsers : 0
    }
  }
}
