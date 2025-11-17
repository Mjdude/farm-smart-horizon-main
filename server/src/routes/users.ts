import express from 'express';
import { body, param, query } from 'express-validator';
import { auth, authorize } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import User from '@/models/User';
import { AppError } from '@/utils/appError';
import { catchAsync } from '@/utils/catchAsync';

const router = express.Router();

// Get all users (Admin only)
const getUsers = catchAsync(async (req: any, res: any) => {
  const { role, state, district, page = 1, limit = 10 } = req.query;

  const filter: any = {};
  if (role) filter.role = role;
  if (state) filter['profile.location.state'] = state;
  if (district) filter['profile.location.district'] = district;

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
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

// Get user by ID
const getUserById = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;

  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user }
  });
});

// Update user status (Admin only)
const updateUserStatus = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user }
  });
});

// Get user statistics (Admin only)
const getUserStats = catchAsync(async (req: any, res: any) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        verifiedUsers: {
          $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
        },
        farmers: {
          $sum: { $cond: [{ $eq: ['$role', 'farmer'] }, 1, 0] }
        },
        buyers: {
          $sum: { $cond: [{ $eq: ['$role', 'buyer'] }, 1, 0] }
        },
        agents: {
          $sum: { $cond: [{ $eq: ['$role', 'agent'] }, 1, 0] }
        }
      }
    }
  ]);

  const locationStats = await User.aggregate([
    {
      $group: {
        _id: '$profile.location.state',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {},
      locationStats
    }
  });
});

// Protected routes
router.use(auth);

// Admin routes
router.get('/', 
  authorize('admin'),
  query('role').optional().isIn(['farmer', 'buyer', 'admin', 'agent']),
  query('state').optional().isString(),
  query('district').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  getUsers
);

router.get('/stats',
  authorize('admin'),
  getUserStats
);

router.get('/:id',
  authorize('admin'),
  param('id').isMongoId().withMessage('Invalid user ID'),
  validate,
  getUserById
);

router.patch('/:id/status',
  authorize('admin'),
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('isActive').isBoolean().withMessage('isActive must be boolean'),
  validate,
  updateUserStatus
);

export default router;
