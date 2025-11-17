import express from 'express';
import { body, param, query } from 'express-validator';
import { auth, authorize } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { NotificationService } from '@/services/notificationService';
import Notification from '@/models/Notification';
import { AppError } from '@/utils/appError';
import { catchAsync } from '@/utils/catchAsync';

const router = express.Router();

// Get user notifications
const getUserNotifications = catchAsync(async (req: any, res: any) => {
  const userId = req.user._id;
  const { page = 1, limit = 20, type, priority, read } = req.query;

  // Get from Redis first (for real-time notifications)
  const inAppNotifications = await NotificationService.getUserNotifications(
    userId.toString(), 
    Number(page), 
    Number(limit)
  );

  // Also get from database for persistent notifications
  const filter: any = {
    $or: [
      { 'targetAudience.userIds': userId },
      { 'targetAudience.all': true },
      { 'targetAudience.roles': req.user.role }
    ]
  };

  if (type) filter.type = type;
  if (priority) filter.priority = priority;

  const dbNotifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .select('type priority title message data actionRequired actionUrl createdAt');

  // Combine and deduplicate notifications
  const allNotifications = [...inAppNotifications];
  
  // Add database notifications that aren't already in Redis
  dbNotifications.forEach(dbNotif => {
    const exists = inAppNotifications.find(inApp => inApp.id === dbNotif._id.toString());
    if (!exists) {
      allNotifications.push({
        id: dbNotif._id,
        type: dbNotif.type,
        priority: dbNotif.priority,
        title: dbNotif.title,
        message: dbNotif.message,
        data: dbNotif.data,
        actionRequired: dbNotif.actionRequired,
        actionUrl: dbNotif.actionUrl,
        createdAt: dbNotif.createdAt,
        read: false
      });
    }
  });

  // Sort by creation date
  allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    success: true,
    data: {
      notifications: allNotifications.slice(0, Number(limit)),
      hasMore: allNotifications.length === Number(limit)
    }
  });
});

// Mark notification as read
const markAsRead = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.user._id;

  await NotificationService.markAsRead(id, userId.toString());

  res.json({
    success: true,
    message: 'Notification marked as read'
  });
});

// Mark notification as clicked
const markAsClicked = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.user._id;

  await NotificationService.markAsClicked(id, userId.toString());

  res.json({
    success: true,
    message: 'Notification interaction recorded'
  });
});

// Get notification statistics
const getNotificationStats = catchAsync(async (req: any, res: any) => {
  const userId = req.user._id;

  const stats = await Notification.aggregate([
    {
      $match: {
        'delivery.recipients.userId': userId
      }
    },
    {
      $unwind: '$delivery.recipients'
    },
    {
      $match: {
        'delivery.recipients.userId': userId
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$delivery.recipients.read', false] }, 1, 0] }
        },
        clicked: {
          $sum: { $cond: [{ $eq: ['$delivery.recipients.clicked', true] }, 1, 0] }
        }
      }
    }
  ]);

  const result = stats[0] || { total: 0, unread: 0, clicked: 0 };

  res.json({
    success: true,
    data: result
  });
});

// Admin: Create notification
const createNotification = catchAsync(async (req: any, res: any) => {
  const notificationData = {
    ...req.body,
    createdBy: req.user._id
  };

  const notification = await NotificationService.createAndSend(notificationData);

  res.status(201).json({
    success: true,
    message: 'Notification created and sent successfully',
    data: { notification }
  });
});

// Admin: Get all notifications
const getAllNotifications = catchAsync(async (req: any, res: any) => {
  const { type, priority, sent, page = 1, limit = 20 } = req.query;

  const filter: any = {};
  if (type) filter.type = type;
  if (priority) filter.priority = priority;
  if (sent !== undefined) filter['delivery.sent'] = sent === 'true';

  const notifications = await Notification.find(filter)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Notification.countDocuments(filter);

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// Admin: Get notification analytics
const getNotificationAnalytics = catchAsync(async (req: any, res: any) => {
  const { days = 30 } = req.query;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const analytics = await Notification.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        totalSent: { $sum: '$analytics.totalSent' },
        totalDelivered: { $sum: '$analytics.totalDelivered' },
        totalRead: { $sum: '$analytics.totalRead' },
        totalClicked: { $sum: '$analytics.totalClicked' },
        avgDeliveryRate: { $avg: '$analytics.deliveryRate' },
        avgReadRate: { $avg: '$analytics.readRate' },
        avgClickRate: { $avg: '$analytics.clickRate' }
      }
    }
  ]);

  const typeAnalytics = await Notification.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalSent: { $sum: '$analytics.totalSent' },
        avgReadRate: { $avg: '$analytics.readRate' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      overview: analytics[0] || {},
      byType: typeAnalytics
    }
  });
});

// Protected routes
router.use(auth);

// User routes
router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['weather', 'market', 'pest', 'irrigation', 'scheme', 'loan', 'trading', 'general', 'system']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('read').optional().isBoolean(),
  validate,
  getUserNotifications
);

router.patch('/:id/read',
  param('id').isMongoId().withMessage('Invalid notification ID'),
  validate,
  markAsRead
);

router.patch('/:id/clicked',
  param('id').isMongoId().withMessage('Invalid notification ID'),
  validate,
  markAsClicked
);

router.get('/stats',
  getNotificationStats
);

// Admin routes
router.use(authorize('admin'));

router.post('/',
  body('type').isIn(['weather', 'market', 'pest', 'irrigation', 'scheme', 'loan', 'trading', 'general', 'system']),
  body('priority').isIn(['low', 'medium', 'high', 'critical']),
  body('title').isLength({ min: 5, max: 200 }),
  body('message').isLength({ min: 10, max: 1000 }),
  body('channels').isArray({ min: 1 }),
  body('targetAudience').isObject(),
  validate,
  createNotification
);

router.get('/admin/all',
  query('type').optional().isIn(['weather', 'market', 'pest', 'irrigation', 'scheme', 'loan', 'trading', 'general', 'system']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('sent').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  getAllNotifications
);

router.get('/admin/analytics',
  query('days').optional().isInt({ min: 1, max: 365 }),
  validate,
  getNotificationAnalytics
);

export default router;
