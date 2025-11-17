import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getCropListings,
  getCropListingById,
  createCropListing,
  updateCropListing,
  deleteCropListing,
  getFarmerListings,
  expressInterest,
  getMarketPrices,
  getTrendingCrops,
  searchCropListings,
  markAsSold,
  getFarmerAnalytics
} from '@/controllers/tradingController';
import { auth, authorize, optionalAuth } from '@/middleware/auth';
import { validate } from '@/middleware/validate';

const router = express.Router();

// Public routes
router.get('/listings',
  query('cropType').optional().isIn(['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Spices', 'Other']),
  query('quality').optional().isIn(['Premium', 'Grade A', 'Grade B', 'Standard']),
  query('organic').optional().isBoolean(),
  query('state').optional().isString(),
  query('district').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('minQuantity').optional().isFloat({ min: 0 }),
  query('maxQuantity').optional().isFloat({ min: 0 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isString(),
  validate,
  getCropListings
);

router.get('/listings/:id',
  param('id').isMongoId().withMessage('Invalid listing ID'),
  validate,
  getCropListingById
);

router.get('/market-prices',
  query('state').optional().isString(),
  query('district').optional().isString(),
  query('cropType').optional().isString(),
  validate,
  getMarketPrices
);

router.get('/trending',
  query('days').optional().isInt({ min: 1, max: 365 }),
  validate,
  getTrendingCrops
);

router.get('/search',
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  searchCropListings
);

// Protected routes
router.use(auth);

// Farmer routes
router.post('/listings',
  authorize('farmer'),
  body('cropType')
    .isIn(['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Spices', 'Other'])
    .withMessage('Invalid crop type'),
  body('variety')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Variety must be between 2 and 100 characters'),
  body('quantity')
    .isFloat({ min: 0.1 })
    .withMessage('Quantity must be at least 0.1'),
  body('unit')
    .optional()
    .isIn(['kg', 'quintal', 'ton'])
    .withMessage('Invalid unit'),
  body('pricePerUnit')
    .isFloat({ min: 0.01 })
    .withMessage('Price per unit must be greater than 0'),
  body('quality')
    .isIn(['Premium', 'Grade A', 'Grade B', 'Standard'])
    .withMessage('Invalid quality grade'),
  body('organic')
    .optional()
    .isBoolean()
    .withMessage('Organic must be boolean'),
  body('harvestDate')
    .isISO8601()
    .toDate()
    .withMessage('Invalid harvest date'),
  body('availableFrom')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid available from date'),
  body('availableUntil')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid available until date'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('packaging.type')
    .optional()
    .isString()
    .withMessage('Packaging type must be string'),
  body('packaging.weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Packaging weight must be positive'),
  body('packaging.minOrder')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum order must be at least 1'),
  body('pricing.negotiable')
    .optional()
    .isBoolean()
    .withMessage('Negotiable must be boolean'),
  body('logistics.pickupAvailable')
    .optional()
    .isBoolean()
    .withMessage('Pickup available must be boolean'),
  body('logistics.deliveryAvailable')
    .optional()
    .isBoolean()
    .withMessage('Delivery available must be boolean'),
  body('logistics.deliveryRadius')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Delivery radius must be positive'),
  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  validate,
  createCropListing
);

router.get('/my-listings',
  authorize('farmer'),
  query('status').optional().isIn(['active', 'sold', 'expired', 'draft']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  getFarmerListings
);

router.put('/listings/:id',
  authorize('farmer'),
  param('id').isMongoId().withMessage('Invalid listing ID'),
  body('cropType').optional().isIn(['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Spices', 'Other']),
  body('variety').optional().trim().isLength({ min: 2, max: 100 }),
  body('quantity').optional().isFloat({ min: 0.1 }),
  body('pricePerUnit').optional().isFloat({ min: 0.01 }),
  body('quality').optional().isIn(['Premium', 'Grade A', 'Grade B', 'Standard']),
  body('organic').optional().isBoolean(),
  body('availableUntil').optional().isISO8601().toDate(),
  body('description').optional().isLength({ max: 2000 }),
  validate,
  updateCropListing
);

router.delete('/listings/:id',
  authorize('farmer'),
  param('id').isMongoId().withMessage('Invalid listing ID'),
  validate,
  deleteCropListing
);

router.patch('/listings/:id/sold',
  authorize('farmer'),
  param('id').isMongoId().withMessage('Invalid listing ID'),
  validate,
  markAsSold
);

router.get('/analytics',
  authorize('farmer'),
  query('days').optional().isInt({ min: 1, max: 365 }),
  validate,
  getFarmerAnalytics
);

// Buyer routes
router.post('/listings/:id/interest',
  param('id').isMongoId().withMessage('Invalid listing ID'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),
  body('quantity')
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage('Quantity must be positive'),
  body('proposedPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Proposed price must be positive'),
  validate,
  expressInterest
);

export default router;
