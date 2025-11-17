import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getSchemes,
  getSchemeById,
  applyForScheme,
  getUserApplications,
  getApplicationById,
  updateApplication,
  getAllApplications,
  updateApplicationStatus,
  createScheme,
  updateScheme,
  deleteScheme
} from '@/controllers/schemeController';
import { auth, authorize, optionalAuth } from '@/middleware/auth';
import { validate } from '@/middleware/validate';

const router = express.Router();

// Public routes (with optional auth for personalized recommendations)
router.get('/', 
  query('category').optional().isIn(['income-support', 'insurance', 'credit', 'agricultural-support', 'sustainability']),
  query('state').optional().isString(),
  query('cropType').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  optionalAuth,
  getSchemes
);

router.get('/:id',
  param('id').isMongoId().withMessage('Invalid scheme ID'),
  validate,
  getSchemeById
);

// Protected routes (require authentication)
router.use(auth);

// User routes
router.post('/:schemeId/apply',
  param('schemeId').isMongoId().withMessage('Invalid scheme ID'),
  body('personalDetails.name').optional().trim().isLength({ min: 2, max: 100 }),
  body('personalDetails.fatherName').optional().trim().isLength({ min: 2, max: 100 }),
  body('personalDetails.dateOfBirth').optional().isISO8601().toDate(),
  body('personalDetails.gender').optional().isIn(['male', 'female', 'other']),
  body('personalDetails.category').optional().isIn(['general', 'obc', 'sc', 'st']),
  body('personalDetails.aadhaarNumber').optional().matches(/^\d{12}$/),
  body('personalDetails.panNumber').optional().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
  body('contactDetails.phone').optional().matches(/^[6-9]\d{9}$/),
  body('contactDetails.email').optional().isEmail(),
  body('farmDetails.farmSize').optional().isFloat({ min: 0 }),
  body('farmDetails.landOwnership').optional().isIn(['owned', 'leased', 'both']),
  body('farmDetails.cropTypes').optional().isArray(),
  body('farmDetails.farmingExperience').optional().isInt({ min: 0 }),
  body('financialDetails.annualIncome').optional().isFloat({ min: 0 }),
  body('financialDetails.bankAccount.accountNumber').optional().isString(),
  body('financialDetails.bankAccount.ifscCode').optional().isString(),
  body('financialDetails.bankAccount.bankName').optional().isString(),
  body('financialDetails.bankAccount.accountHolderName').optional().isString(),
  validate,
  applyForScheme
);

router.get('/applications/my',
  query('status').optional().isIn(['draft', 'submitted', 'under-review', 'approved', 'rejected', 'disbursed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  getUserApplications
);

router.get('/applications/:id',
  param('id').isMongoId().withMessage('Invalid application ID'),
  validate,
  getApplicationById
);

router.put('/applications/:id',
  param('id').isMongoId().withMessage('Invalid application ID'),
  body('status').optional().isIn(['draft', 'submitted']),
  body('personalDetails').optional().isObject(),
  body('contactDetails').optional().isObject(),
  body('farmDetails').optional().isObject(),
  body('financialDetails').optional().isObject(),
  body('documents').optional().isObject(),
  validate,
  updateApplication
);

// Admin routes
router.use(authorize('admin'));

router.get('/admin/applications',
  query('status').optional().isIn(['draft', 'submitted', 'under-review', 'approved', 'rejected', 'disbursed']),
  query('schemeId').optional().isMongoId(),
  query('state').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  getAllApplications
);

router.put('/admin/applications/:id/status',
  param('id').isMongoId().withMessage('Invalid application ID'),
  body('status')
    .isIn(['under-review', 'approved', 'rejected', 'disbursed'])
    .withMessage('Invalid status'),
  body('reviewNotes').optional().isString().isLength({ max: 1000 }),
  body('rejectionReason').optional().isString().isLength({ max: 500 }),
  body('approvedAmount').optional().isFloat({ min: 0 }),
  validate,
  updateApplicationStatus
);

router.post('/admin/schemes',
  body('name')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Scheme name must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('category')
    .isIn(['income-support', 'insurance', 'credit', 'agricultural-support', 'sustainability'])
    .withMessage('Invalid category'),
  body('provider')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Provider name is required'),
  body('eligibility.criteria')
    .isArray({ min: 1 })
    .withMessage('At least one eligibility criteria is required'),
  body('benefits.type')
    .isIn(['monetary', 'subsidy', 'insurance', 'credit', 'services'])
    .withMessage('Invalid benefit type'),
  body('benefits.description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Benefits description is required'),
  body('applicationProcess.documents')
    .isArray({ min: 1 })
    .withMessage('Required documents list is required'),
  body('applicationProcess.steps')
    .isArray({ min: 1 })
    .withMessage('Application steps are required'),
  body('applicationProcess.processingTime')
    .trim()
    .notEmpty()
    .withMessage('Processing time is required'),
  body('priority').optional().isInt({ min: 1, max: 10 }),
  validate,
  createScheme
);

router.put('/admin/schemes/:id',
  param('id').isMongoId().withMessage('Invalid scheme ID'),
  body('name').optional().trim().isLength({ min: 5, max: 200 }),
  body('description').optional().trim().isLength({ min: 20, max: 2000 }),
  body('category').optional().isIn(['income-support', 'insurance', 'credit', 'agricultural-support', 'sustainability']),
  body('provider').optional().trim().isLength({ min: 2, max: 100 }),
  body('benefits.type').optional().isIn(['monetary', 'subsidy', 'insurance', 'credit', 'services']),
  body('benefits.description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('priority').optional().isInt({ min: 1, max: 10 }),
  body('isActive').optional().isBoolean(),
  validate,
  updateScheme
);

router.delete('/admin/schemes/:id',
  param('id').isMongoId().withMessage('Invalid scheme ID'),
  validate,
  deleteScheme
);

export default router;
