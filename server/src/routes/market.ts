import express from 'express';
import { query } from 'express-validator';
import { optionalAuth } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { MarketService } from '@/services/marketService';
import { AppError } from '@/utils/appError';
import { catchAsync } from '@/utils/catchAsync';

const router = express.Router();

// Get market prices
const getMarketPrices = catchAsync(async (req: any, res: any) => {
  const { state, district, market, commodity, date } = req.query;

  const prices = await MarketService.getMarketPrices({
    state,
    district,
    market,
    commodity,
    date
  });

  res.json({
    success: true,
    data: { prices }
  });
});

// Get price trends
const getPriceTrends = catchAsync(async (req: any, res: any) => {
  const { commodity, market, days = 30 } = req.query;

  if (!commodity) {
    throw new AppError('Commodity is required', 400);
  }

  const trends = await MarketService.getPriceTrends({
    commodity,
    market,
    days: Number(days)
  });

  res.json({
    success: true,
    data: { trends }
  });
});

// Get market analysis
const getMarketAnalysis = catchAsync(async (req: any, res: any) => {
  const { commodity, state } = req.query;

  const analysis = await MarketService.getMarketAnalysis({
    commodity,
    state
  });

  res.json({
    success: true,
    data: { analysis }
  });
});

// Get commodity list
const getCommodities = catchAsync(async (req: any, res: any) => {
  const commodities = await MarketService.getCommodities();

  res.json({
    success: true,
    data: { commodities }
  });
});

// Get market list
const getMarkets = catchAsync(async (req: any, res: any) => {
  const { state, district } = req.query;

  const markets = await MarketService.getMarkets({ state, district });

  res.json({
    success: true,
    data: { markets }
  });
});

// Get price alerts
const getPriceAlerts = catchAsync(async (req: any, res: any) => {
  const { commodity, threshold } = req.query;

  const alerts = await MarketService.getPriceAlerts({
    commodity,
    threshold: threshold ? Number(threshold) : undefined
  });

  res.json({
    success: true,
    data: { alerts }
  });
});

// Public routes
router.get('/prices',
  query('state').optional().isString(),
  query('district').optional().isString(),
  query('market').optional().isString(),
  query('commodity').optional().isString(),
  query('date').optional().isISO8601(),
  validate,
  getMarketPrices
);

router.get('/trends',
  query('commodity').notEmpty().withMessage('Commodity is required'),
  query('market').optional().isString(),
  query('days').optional().isInt({ min: 1, max: 365 }),
  validate,
  getPriceTrends
);

router.get('/analysis',
  query('commodity').optional().isString(),
  query('state').optional().isString(),
  validate,
  getMarketAnalysis
);

router.get('/commodities',
  getCommodities
);

router.get('/markets',
  query('state').optional().isString(),
  query('district').optional().isString(),
  validate,
  getMarkets
);

router.get('/alerts',
  query('commodity').optional().isString(),
  query('threshold').optional().isFloat({ min: 0 }),
  validate,
  optionalAuth,
  getPriceAlerts
);

export default router;
