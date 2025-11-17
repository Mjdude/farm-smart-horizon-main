import express from 'express';
import { body, param, query } from 'express-validator';
import { auth, authorize } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import User from '@/models/User';
import Scheme from '@/models/Scheme';
import SchemeApplication from '@/models/SchemeApplication';
import CropListing from '@/models/CropListing';
import LoanApplication from '@/models/LoanApplication';
import Notification from '@/models/Notification';
import { AppError } from '@/utils/appError';
import { catchAsync } from '@/utils/catchAsync';
import { logger } from '@/utils/logger';

const router = express.Router();

// Admin authentication required for all routes
router.use(auth);
router.use(authorize('admin'));

// Dashboard analytics
const getDashboardAnalytics = catchAsync(async (req: any, res: any) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  // User statistics
  const userStats = await User.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        active: [{ $match: { isActive: true } }, { $count: "count" }],
        verified: [{ $match: { isVerified: true } }, { $count: "count" }],
        byRole: [
          {
            $group: {
              _id: "$role",
              count: { $sum: 1 }
            }
          }
        ],
        recentRegistrations: [
          {
            $match: { createdAt: { $gte: startDate } }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]
      }
    }
  ]);

  // Scheme application statistics
  const schemeStats = await SchemeApplication.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ],
        recent: [
          {
            $match: { createdAt: { $gte: startDate } }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]
      }
    }
  ]);

  // Trading statistics
  const tradingStats = await CropListing.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        active: [{ $match: { status: "active" } }, { $count: "count" }],
        sold: [{ $match: { status: "sold" } }, { $count: "count" }],
        totalValue: [
          {
            $match: { status: "sold" }
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$totalValue" }
            }
          }
        ],
        byCrop: [
          {
            $group: {
              _id: "$cropType",
              count: { $sum: 1 },
              totalQuantity: { $sum: "$quantity" }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]
      }
    }
  ]);

  // Loan application statistics
  const loanStats = await LoanApplication.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ],
        totalAmount: [
          {
            $match: { status: "approved" }
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$approvedAmount" }
            }
          }
        ]
      }
    }
  ]);

  // Notification statistics
  const notificationStats = await Notification.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $facet: {
        total: [{ $count: "count" }],
        byType: [
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 }
            }
          }
        ],
        avgDeliveryRate: [
          {
            $group: {
              _id: null,
              avgRate: { $avg: "$analytics.deliveryRate" }
            }
          }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      users: userStats[0],
      schemes: schemeStats[0],
      trading: tradingStats[0],
      loans: loanStats[0],
      notifications: notificationStats[0],
      period: `Last ${days} days`
    }
  });
});

// System health check
const getSystemHealth = catchAsync(async (req: any, res: any) => {
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    services: {
      database: 'healthy',
      redis: 'healthy',
      email: 'healthy',
      sms: 'healthy',
      payment: 'healthy'
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };

  // Check database connection
  try {
    await User.findOne().limit(1);
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  res.json({
    success: true,
    data: health
  });
});

// User management
const getUsers = catchAsync(async (req: any, res: any) => {
  const { 
    role, 
    isActive, 
    isVerified, 
    state, 
    district, 
    search,
    page = 1, 
    limit = 20,
    sort = '-createdAt'
  } = req.query;

  const filter: any = {};
  
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
  if (state) filter['profile.location.state'] = new RegExp(state, 'i');
  if (district) filter['profile.location.district'] = new RegExp(district, 'i');
  
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') }
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .sort(sort as string)
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit));

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// Update user
const updateUser = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const updates = req.body;

  // Remove sensitive fields
  delete updates.password;
  delete updates._id;

  const user = await User.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  logger.info('User updated by admin', { 
    adminId: req.user._id, 
    userId: id, 
    updates: Object.keys(updates) 
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
});

// Delete user
const deleteUser = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  logger.info('User deactivated by admin', { 
    adminId: req.user._id, 
    userId: id 
  });

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
});

// Content moderation
const getModerationQueue = catchAsync(async (req: any, res: any) => {
  const { type = 'all', page = 1, limit = 20 } = req.query;

  let items: any[] = [];

  if (type === 'all' || type === 'listings') {
    const listings = await CropListing.find({
      status: 'active',
      $or: [
        { views: { $gt: 1000 } },
        { inquiries: { $gt: 50 } }
      ]
    })
    .populate('farmerId', 'name email phone')
    .limit(10);

    items = items.concat(listings.map((listing: any) => ({
      id: listing._id,
      type: 'crop_listing',
      title: `${listing.cropType} - ${listing.variety}`,
      content: listing.description,
      user: listing.farmerId,
      createdAt: listing.createdAt,
      flags: []
    })));
  }

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: items.length,
        pages: Math.ceil(items.length / Number(limit))
      }
    }
  });
});

// System logs
const getSystemLogs = catchAsync(async (req: any, res: any) => {
  const { level = 'info', page = 1, limit = 50 } = req.query;

  // This would typically read from log files or a logging service
  // For now, return mock data
  const logs = [
    {
      timestamp: new Date(),
      level: 'info',
      message: 'User login successful',
      metadata: { userId: '507f1f77bcf86cd799439011' }
    },
    {
      timestamp: new Date(Date.now() - 60000),
      level: 'error',
      message: 'Payment gateway timeout',
      metadata: { orderId: 'order_123' }
    }
  ];

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: logs.length,
        pages: Math.ceil(logs.length / Number(limit))
      }
    }
  });
});

// Export data
const exportData = catchAsync(async (req: any, res: any) => {
  const { type, format = 'json', startDate, endDate } = req.body;

  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  let data: any = {};

  switch (type) {
    case 'users':
      data.users = await User.find(
        dateFilter.createdAt ? { createdAt: dateFilter } : {}
      ).select('-password');
      break;
    
    case 'schemes':
      data.schemes = await SchemeApplication.find(
        dateFilter.createdAt ? { createdAt: dateFilter } : {}
      ).populate('userId schemeId');
      break;
    
    case 'trading':
      data.listings = await CropListing.find(
        dateFilter.createdAt ? { createdAt: dateFilter } : {}
      ).populate('farmerId');
      break;
    
    default:
      throw new AppError('Invalid export type', 400);
  }

  logger.info('Data exported by admin', { 
    adminId: req.user._id, 
    type, 
    format,
    recordCount: Object.values(data).flat().length
  });

  res.json({
    success: true,
    message: 'Data exported successfully',
    data
  });
});

// Routes
router.get('/dashboard', getDashboardAnalytics);
router.get('/health', getSystemHealth);

// User management
router.get('/users',
  query('role').optional().isIn(['farmer', 'buyer', 'admin', 'agent']),
  query('isActive').optional().isBoolean(),
  query('isVerified').optional().isBoolean(),
  query('state').optional().isString(),
  query('district').optional().isString(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  getUsers
);

router.put('/users/:id',
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail(),
  body('phone').optional().matches(/^[6-9]\d{9}$/),
  body('role').optional().isIn(['farmer', 'buyer', 'admin', 'agent']),
  body('isActive').optional().isBoolean(),
  body('isVerified').optional().isBoolean(),
  validate,
  updateUser
);

router.delete('/users/:id',
  param('id').isMongoId().withMessage('Invalid user ID'),
  validate,
  deleteUser
);

// Content moderation
router.get('/moderation',
  query('type').optional().isIn(['all', 'listings', 'comments']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  getModerationQueue
);

// System management
router.get('/logs',
  query('level').optional().isIn(['error', 'warn', 'info', 'debug']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  getSystemLogs
);

router.post('/export',
  body('type').isIn(['users', 'schemes', 'trading']).withMessage('Invalid export type'),
  body('format').optional().isIn(['json', 'csv']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  validate,
  exportData
);

export default router;
