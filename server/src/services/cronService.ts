import * as cron from 'node-cron';
import { WeatherService } from '@/services/weatherService';
import { MarketService } from '@/services/marketService';
import { NotificationService } from '@/services/notificationService';
import CropListing from '@/models/CropListing';
import SchemeApplication from '@/models/SchemeApplication';
import LoanApplication from '@/models/LoanApplication';
import { logger } from '@/utils/logger';

export class CronService {
  static init(): void {
    logger.info('Initializing cron jobs...');

    // Weather monitoring - every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      try {
        logger.info('Running weather monitoring job');
        await WeatherService.monitorAndAlert();
      } catch (error) {
        logger.error('Weather monitoring job failed:', error);
      }
    });

    // Market price monitoring - every hour
    cron.schedule('0 * * * *', async () => {
      try {
        logger.info('Running market price monitoring job');
        await MarketService.monitorPricesAndAlert();
      } catch (error) {
        logger.error('Market monitoring job failed:', error);
      }
    });

    // Expire old crop listings - daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Running crop listing expiry job');
        await this.expireOldListings();
      } catch (error) {
        logger.error('Crop listing expiry job failed:', error);
      }
    });

    // Send scheme application reminders - daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      try {
        logger.info('Running scheme application reminder job');
        await this.sendSchemeReminders();
      } catch (error) {
        logger.error('Scheme reminder job failed:', error);
      }
    });

    // Send loan EMI reminders - daily at 10 AM
    cron.schedule('0 10 * * *', async () => {
      try {
        logger.info('Running loan EMI reminder job');
        await this.sendLoanReminders();
      } catch (error) {
        logger.error('Loan reminder job failed:', error);
      }
    });

    // Clean up old notifications - daily at 3 AM
    cron.schedule('0 3 * * *', async () => {
      try {
        logger.info('Running notification cleanup job');
        await this.cleanupOldNotifications();
      } catch (error) {
        logger.error('Notification cleanup job failed:', error);
      }
    });

    // Generate daily reports - daily at 11 PM
    cron.schedule('0 23 * * *', async () => {
      try {
        logger.info('Running daily report generation job');
        await this.generateDailyReports();
      } catch (error) {
        logger.error('Daily report generation job failed:', error);
      }
    });

    // Weekly analytics - every Sunday at 1 AM
    cron.schedule('0 1 * * 0', async () => {
      try {
        logger.info('Running weekly analytics job');
        await this.generateWeeklyAnalytics();
      } catch (error) {
        logger.error('Weekly analytics job failed:', error);
      }
    });

    logger.info('Cron jobs initialized successfully');
  }

  // Expire old crop listings
  private static async expireOldListings(): Promise<void> {
    const expiredCount = await CropListing.updateMany(
      {
        status: 'active',
        availableUntil: { $lt: new Date() }
      },
      {
        $set: { status: 'expired' }
      }
    );

    logger.info(`Expired ${expiredCount.modifiedCount} old crop listings`);
  }

  // Send scheme application reminders
  private static async sendSchemeReminders(): Promise<void> {
    const draftApplications = await SchemeApplication.find({
      status: 'draft',
      createdAt: { 
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) // More than 1 day old
      }
    }).populate('userId schemeId');

    for (const application of draftApplications) {
      const user = application.userId as any;
      const scheme = application.schemeId as any;

      await NotificationService.createAndSend({
        type: 'scheme',
        priority: 'medium',
        title: 'Complete Your Scheme Application',
        message: `Your application for ${scheme.name} is still in draft. Complete it to avail benefits.`,
        channels: ['push', 'sms', 'in-app'],
        targetAudience: {
          userIds: [user._id.toString()]
        },
        actionRequired: true,
        actionUrl: `/schemes/applications/${application._id}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }

    logger.info(`Sent scheme reminders to ${draftApplications.length} users`);
  }

  // Send loan EMI reminders
  private static async sendLoanReminders(): Promise<void> {
    const upcomingEMIs = await LoanApplication.find({
      status: 'disbursed',
      'repayment.nextDueDate': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Next 3 days
      }
    }).populate('userId');

    for (const loan of upcomingEMIs) {
      const user = loan.userId as any;
      const daysUntilDue = Math.ceil(
        (loan.repayment.nextDueDate!.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );

      await NotificationService.createAndSend({
        type: 'loan',
        priority: daysUntilDue <= 1 ? 'high' : 'medium',
        title: 'Loan EMI Reminder',
        message: `Your ${loan.loanProduct.name} EMI is due in ${daysUntilDue} day(s). Amount: ₹${loan.loanTerms?.emi}`,
        channels: ['push', 'sms', 'email', 'in-app'],
        targetAudience: {
          userIds: [user._id.toString()]
        },
        actionRequired: true,
        data: {
          loanId: loan._id,
          emiAmount: loan.loanTerms?.emi,
          dueDate: loan.repayment.nextDueDate
        }
      });
    }

    logger.info(`Sent EMI reminders to ${upcomingEMIs.length} users`);
  }

  // Clean up old notifications
  private static async cleanupOldNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const deletedCount = await NotificationService.cleanupOldNotifications(thirtyDaysAgo);
    
    logger.info(`Cleaned up ${deletedCount} old notifications`);
  }

  // Generate daily reports
  private static async generateDailyReports(): Promise<void> {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // Get daily statistics
    const stats = {
      date: yesterday.toISOString().split('T')[0],
      newUsers: await this.getNewUsersCount(yesterday),
      newListings: await this.getNewListingsCount(yesterday),
      newApplications: await this.getNewApplicationsCount(yesterday),
      totalTransactions: await this.getTransactionsCount(yesterday)
    };

    // Send report to admins
    await NotificationService.createAndSend({
      type: 'system',
      priority: 'low',
      title: 'Daily Report',
      message: `Daily stats: ${stats.newUsers} new users, ${stats.newListings} new listings, ${stats.newApplications} new applications`,
      channels: ['email', 'in-app'],
      targetAudience: {
        roles: ['admin']
      },
      data: stats
    });

    logger.info('Daily report generated and sent to admins');
  }

  // Generate weekly analytics
  private static async generateWeeklyAnalytics(): Promise<void> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Generate comprehensive weekly analytics
    const analytics = {
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      userGrowth: await this.getUserGrowthAnalytics(startDate, endDate),
      tradingVolume: await this.getTradingVolumeAnalytics(startDate, endDate),
      schemeAdoption: await this.getSchemeAdoptionAnalytics(startDate, endDate),
      topCrops: await this.getTopCropsAnalytics(startDate, endDate)
    };

    // Send analytics to admins
    await NotificationService.createAndSend({
      type: 'system',
      priority: 'low',
      title: 'Weekly Analytics Report',
      message: 'Weekly analytics report is ready for review',
      channels: ['email', 'in-app'],
      targetAudience: {
        roles: ['admin']
      },
      data: analytics
    });

    logger.info('Weekly analytics generated and sent to admins');
  }

  // Helper methods for statistics
  private static async getNewUsersCount(date: Date): Promise<number> {
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    return await CropListing.countDocuments({
      createdAt: { $gte: date, $lt: nextDay }
    });
  }

  private static async getNewListingsCount(date: Date): Promise<number> {
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    return await CropListing.countDocuments({
      createdAt: { $gte: date, $lt: nextDay }
    });
  }

  private static async getNewApplicationsCount(date: Date): Promise<number> {
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    return await SchemeApplication.countDocuments({
      createdAt: { $gte: date, $lt: nextDay }
    });
  }

  private static async getTransactionsCount(date: Date): Promise<number> {
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    return await CropListing.countDocuments({
      status: 'sold',
      updatedAt: { $gte: date, $lt: nextDay }
    });
  }

  private static async getUserGrowthAnalytics(startDate: Date, endDate: Date): Promise<any> {
    // Implementation for user growth analytics
    return {
      newUsers: 0,
      activeUsers: 0,
      retentionRate: 0
    };
  }

  private static async getTradingVolumeAnalytics(startDate: Date, endDate: Date): Promise<any> {
    // Implementation for trading volume analytics
    return {
      totalListings: 0,
      soldListings: 0,
      totalValue: 0
    };
  }

  private static async getSchemeAdoptionAnalytics(startDate: Date, endDate: Date): Promise<any> {
    // Implementation for scheme adoption analytics
    return {
      newApplications: 0,
      approvedApplications: 0,
      adoptionRate: 0
    };
  }

  private static async getTopCropsAnalytics(startDate: Date, endDate: Date): Promise<any> {
    // Implementation for top crops analytics
    return [];
  }
}
