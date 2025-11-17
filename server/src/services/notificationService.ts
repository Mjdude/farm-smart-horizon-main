import Notification, { INotification } from '@/models/Notification';
import User, { IUser } from '@/models/User';
import { sendEmail } from '@/services/emailService';
import { sendTemplateSMS } from '@/services/smsService';
import { logger } from '@/utils/logger';
import { getRedisClient } from '@/config/redis';

interface NotificationData {
  type: 'weather' | 'market' | 'pest' | 'irrigation' | 'scheme' | 'loan' | 'trading' | 'general' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: any;
  channels: ('push' | 'sms' | 'email' | 'whatsapp' | 'in-app')[];
  targetAudience: {
    userIds?: string[];
    roles?: ('farmer' | 'buyer' | 'admin' | 'agent')[];
    locations?: {
      states?: string[];
      districts?: string[];
      pincodes?: string[];
    };
    cropTypes?: string[];
    farmSize?: {
      min?: number;
      max?: number;
    };
    all?: boolean;
  };
  actionRequired?: boolean;
  actionUrl?: string;
  actionData?: any;
  expiresAt?: Date;
  sendAt?: Date;
}

export class NotificationService {
  // Create and send notification
  static async createAndSend(notificationData: NotificationData): Promise<INotification> {
    try {
      // Create notification
      const notification = await Notification.create({
        ...notificationData,
        scheduling: {
          sendAt: notificationData.sendAt || new Date(),
          timezone: 'Asia/Kolkata'
        },
        delivery: {
          sent: false,
          deliveryStatus: {},
          recipients: []
        },
        analytics: {
          totalSent: 0,
          totalDelivered: 0,
          totalRead: 0,
          totalClicked: 0,
          deliveryRate: 0,
          readRate: 0,
          clickRate: 0
        }
      });

      // If scheduled for immediate sending
      if (!notificationData.sendAt || notificationData.sendAt <= new Date()) {
        await this.sendNotification(notification._id);
      }

      return notification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  // Send notification to recipients
  static async sendNotification(notificationId: string): Promise<void> {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification || notification.delivery.sent) {
        return;
      }

      // Get target users
      const targetUsers = await this.getTargetUsers(notification.targetAudience);
      
      if (targetUsers.length === 0) {
        logger.warn('No target users found for notification', { notificationId });
        return;
      }

      // Filter users based on their notification preferences
      const filteredUsers = targetUsers.filter(user => {
        const preferences = user.preferences?.notifications;
        if (!preferences) return true;

        return notification.channels.some(channel => {
          switch (channel) {
            case 'push': return preferences.push;
            case 'sms': return preferences.sms;
            case 'email': return preferences.email;
            case 'whatsapp': return preferences.whatsapp;
            default: return true;
          }
        });
      });

      // Send notifications through different channels
      const deliveryPromises = filteredUsers.map(user => 
        this.sendToUser(notification, user)
      );

      const results = await Promise.allSettled(deliveryPromises);

      // Update notification delivery status
      const recipients = results.map((result, index) => ({
        userId: filteredUsers[index]._id,
        channels: notification.channels,
        delivered: result.status === 'fulfilled',
        deliveredAt: result.status === 'fulfilled' ? new Date() : undefined,
        read: false,
        clicked: false
      }));

      // Calculate analytics
      const totalSent = recipients.length;
      const totalDelivered = recipients.filter(r => r.delivered).length;
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

      // Update notification
      notification.delivery = {
        sent: true,
        sentAt: new Date(),
        deliveryStatus: notification.delivery.deliveryStatus,
        recipients
      };

      notification.analytics = {
        totalSent,
        totalDelivered,
        totalRead: 0,
        totalClicked: 0,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        readRate: 0,
        clickRate: 0
      };

      await notification.save();

      logger.info('Notification sent successfully', {
        notificationId,
        totalSent,
        totalDelivered,
        deliveryRate
      });

    } catch (error) {
      logger.error('Failed to send notification:', error);
      throw error;
    }
  }

  // Send notification to individual user
  private static async sendToUser(notification: INotification, user: IUser): Promise<void> {
    const deliveryStatus = notification.delivery.deliveryStatus;

    // Send via different channels
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case 'email':
            if (user.preferences?.notifications?.email !== false) {
              await sendEmail({
                to: user.email,
                subject: notification.title,
                template: 'general',
                data: {
                  name: user.name,
                  message: notification.message,
                  actionUrl: notification.actionUrl,
                  actionRequired: notification.actionRequired
                }
              });
              deliveryStatus.email = { sent: true, sentAt: new Date() };
            }
            break;

          case 'sms':
            if (user.preferences?.notifications?.sms !== false) {
              await sendTemplateSMS(user.phone, 'general', {
                message: `${notification.title}: ${notification.message}`
              });
              deliveryStatus.sms = { sent: true, sentAt: new Date() };
            }
            break;

          case 'push':
            // Implement push notification logic here
            // This would typically use Firebase Cloud Messaging or similar
            deliveryStatus.push = { sent: true, sentAt: new Date() };
            break;

          case 'whatsapp':
            // Implement WhatsApp notification logic here
            // This would typically use WhatsApp Business API
            deliveryStatus.whatsapp = { sent: true, sentAt: new Date() };
            break;

          case 'in-app':
            // Store in-app notification in Redis or database
            await this.storeInAppNotification(user._id, notification);
            deliveryStatus.inApp = { sent: true, sentAt: new Date() };
            break;
        }
      } catch (error) {
        logger.error(`Failed to send ${channel} notification to user ${user._id}:`, error);
        deliveryStatus[channel as keyof typeof deliveryStatus] = { 
          sent: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }
  }

  // Get target users based on audience criteria
  private static async getTargetUsers(targetAudience: any): Promise<IUser[]> {
    let query: any = { isActive: true };

    // If targeting all users
    if (targetAudience.all) {
      return await User.find(query);
    }

    // Build query based on criteria
    const orConditions = [];

    // Specific user IDs
    if (targetAudience.userIds && targetAudience.userIds.length > 0) {
      orConditions.push({ _id: { $in: targetAudience.userIds } });
    }

    // User roles
    if (targetAudience.roles && targetAudience.roles.length > 0) {
      orConditions.push({ role: { $in: targetAudience.roles } });
    }

    // Location-based targeting
    if (targetAudience.locations) {
      const locationQuery: any = {};
      
      if (targetAudience.locations.states) {
        locationQuery['profile.location.state'] = { $in: targetAudience.locations.states };
      }
      
      if (targetAudience.locations.districts) {
        locationQuery['profile.location.district'] = { $in: targetAudience.locations.districts };
      }
      
      if (targetAudience.locations.pincodes) {
        locationQuery['profile.location.pincode'] = { $in: targetAudience.locations.pincodes };
      }

      if (Object.keys(locationQuery).length > 0) {
        orConditions.push(locationQuery);
      }
    }

    // Crop types
    if (targetAudience.cropTypes && targetAudience.cropTypes.length > 0) {
      orConditions.push({ 'profile.cropTypes': { $in: targetAudience.cropTypes } });
    }

    // Farm size
    if (targetAudience.farmSize) {
      const farmSizeQuery: any = {};
      if (targetAudience.farmSize.min !== undefined) {
        farmSizeQuery['profile.farmSize'] = { $gte: targetAudience.farmSize.min };
      }
      if (targetAudience.farmSize.max !== undefined) {
        farmSizeQuery['profile.farmSize'] = { 
          ...farmSizeQuery['profile.farmSize'],
          $lte: targetAudience.farmSize.max 
        };
      }
      if (Object.keys(farmSizeQuery).length > 0) {
        orConditions.push(farmSizeQuery);
      }
    }

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    return await User.find(query);
  }

  // Store in-app notification
  private static async storeInAppNotification(userId: string, notification: INotification): Promise<void> {
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        const notificationData = {
          id: notification._id,
          type: notification.type,
          priority: notification.priority,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          actionRequired: notification.actionRequired,
          actionUrl: notification.actionUrl,
          createdAt: new Date(),
          read: false
        };

        // Store with expiry (30 days)
        await redisClient.setEx(
          `notification:${userId}:${notification._id}`,
          30 * 24 * 60 * 60,
          JSON.stringify(notificationData)
        );

        // Add to user's notification list
        await redisClient.lPush(`notifications:${userId}`, notification._id.toString());
        await redisClient.lTrim(`notifications:${userId}`, 0, 99); // Keep only last 100 notifications
      }
    } catch (error) {
      logger.error('Failed to store in-app notification:', error);
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      // Update in database
      await Notification.updateOne(
        { 
          _id: notificationId,
          'delivery.recipients.userId': userId
        },
        {
          $set: {
            'delivery.recipients.$.read': true,
            'delivery.recipients.$.readAt': new Date()
          }
        }
      );

      // Update in Redis
      const redisClient = getRedisClient();
      if (redisClient) {
        const notificationKey = `notification:${userId}:${notificationId}`;
        const notificationData = await redisClient.get(notificationKey);
        
        if (notificationData) {
          const parsed = JSON.parse(notificationData);
          parsed.read = true;
          parsed.readAt = new Date();
          
          await redisClient.setEx(notificationKey, 30 * 24 * 60 * 60, JSON.stringify(parsed));
        }
      }

      // Update analytics
      await this.updateAnalytics(notificationId);

    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
    }
  }

  // Mark notification as clicked
  static async markAsClicked(notificationId: string, userId: string): Promise<void> {
    try {
      // Update in database
      await Notification.updateOne(
        { 
          _id: notificationId,
          'delivery.recipients.userId': userId
        },
        {
          $set: {
            'delivery.recipients.$.clicked': true,
            'delivery.recipients.$.clickedAt': new Date()
          }
        }
      );

      // Update analytics
      await this.updateAnalytics(notificationId);

    } catch (error) {
      logger.error('Failed to mark notification as clicked:', error);
    }
  }

  // Update notification analytics
  private static async updateAnalytics(notificationId: string): Promise<void> {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) return;

      const recipients = notification.delivery.recipients;
      const totalSent = recipients.length;
      const totalRead = recipients.filter(r => r.read).length;
      const totalClicked = recipients.filter(r => r.clicked).length;

      const readRate = totalSent > 0 ? (totalRead / totalSent) * 100 : 0;
      const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

      notification.analytics = {
        ...notification.analytics,
        totalRead,
        totalClicked,
        readRate: Math.round(readRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100
      };

      await notification.save();

    } catch (error) {
      logger.error('Failed to update notification analytics:', error);
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string, page: number = 1, limit: number = 20): Promise<any[]> {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        return [];
      }

      const start = (page - 1) * limit;
      const end = start + limit - 1;

      const notificationIds = await redisClient.lRange(`notifications:${userId}`, start, end);
      
      const notifications = [];
      for (const id of notificationIds) {
        const notificationData = await redisClient.get(`notification:${userId}:${id}`);
        if (notificationData) {
          notifications.push(JSON.parse(notificationData));
        }
      }

      return notifications;

    } catch (error) {
      logger.error('Failed to get user notifications:', error);
      return [];
    }
  }

  // Send weather alert
  static async sendWeatherAlert(weatherData: any): Promise<void> {
    const { alertType, location, description, severity } = weatherData;

    await this.createAndSend({
      type: 'weather',
      priority: severity === 'severe' ? 'critical' : 'high',
      title: `Weather Alert: ${alertType}`,
      message: `${alertType} expected in ${location}. ${description}`,
      data: weatherData,
      channels: ['push', 'sms', 'in-app'],
      targetAudience: {
        locations: {
          states: [location.state],
          districts: location.district ? [location.district] : undefined
        }
      },
      actionRequired: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  }

  // Send market price alert
  static async sendMarketAlert(marketData: any): Promise<void> {
    const { crop, market, currentPrice, previousPrice, change } = marketData;

    await this.createAndSend({
      type: 'market',
      priority: Math.abs(change) > 10 ? 'high' : 'medium',
      title: `Market Alert: ${crop} Price ${change > 0 ? 'Increase' : 'Decrease'}`,
      message: `${crop} price in ${market} changed to ₹${currentPrice}/kg (${change > 0 ? '+' : ''}${change}%)`,
      data: marketData,
      channels: ['push', 'email', 'in-app'],
      targetAudience: {
        cropTypes: [crop],
        roles: ['farmer']
      },
      actionRequired: false
    });
  }

  // Send pest alert
  static async sendPestAlert(pestData: any): Promise<void> {
    const { pestName, location, affectedCrops, severity } = pestData;

    await this.createAndSend({
      type: 'pest',
      priority: severity === 'high' ? 'critical' : 'high',
      title: `Pest Alert: ${pestName}`,
      message: `${pestName} outbreak reported in ${location}. Check your ${affectedCrops.join(', ')} crops immediately.`,
      data: pestData,
      channels: ['push', 'sms', 'in-app'],
      targetAudience: {
        locations: {
          states: [location.state],
          districts: location.district ? [location.district] : undefined
        },
        cropTypes: affectedCrops
      },
      actionRequired: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  }

  // Clean up old notifications
  static async cleanupOldNotifications(beforeDate: Date): Promise<number> {
    try {
      const result = await Notification.deleteMany({
        createdAt: { $lt: beforeDate },
        'delivery.sent': true
      });

      logger.info(`Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount || 0;
    } catch (error) {
      logger.error('Failed to cleanup old notifications:', error);
      return 0;
    }
  }
}
