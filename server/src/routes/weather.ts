import express from 'express';
import { query } from 'express-validator';
import { auth, optionalAuth } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { WeatherService } from '@/services/weatherService';
import { AppError } from '@/utils/appError';
import { catchAsync } from '@/utils/catchAsync';

const router = express.Router();

// Get current weather
const getCurrentWeather = catchAsync(async (req: any, res: any) => {
  const { lat, lon, city } = req.query;

  if (!lat && !lon && !city) {
    throw new AppError('Location coordinates or city name is required', 400);
  }

  const weather = await WeatherService.getCurrentWeather({ lat, lon, city });

  res.json({
    success: true,
    data: { weather }
  });
});

// Get weather forecast
const getWeatherForecast = catchAsync(async (req: any, res: any) => {
  const { lat, lon, city, days = 5 } = req.query;

  if (!lat && !lon && !city) {
    throw new AppError('Location coordinates or city name is required', 400);
  }

  const forecast = await WeatherService.getWeatherForecast({ 
    lat, 
    lon, 
    city, 
    days: Number(days) 
  });

  res.json({
    success: true,
    data: { forecast }
  });
});

// Get weather alerts
const getWeatherAlerts = catchAsync(async (req: any, res: any) => {
  const { state, district } = req.query;

  const alerts = await WeatherService.getWeatherAlerts({ state, district });

  res.json({
    success: true,
    data: { alerts }
  });
});

// Get agricultural weather advisory
const getAgricultureAdvisory = catchAsync(async (req: any, res: any) => {
  const { lat, lon, cropType } = req.query;

  if (!lat || !lon) {
    throw new AppError('Location coordinates are required', 400);
  }

  const advisory = await WeatherService.getAgricultureAdvisory({ 
    lat: Number(lat), 
    lon: Number(lon), 
    cropType 
  });

  res.json({
    success: true,
    data: { advisory }
  });
});

// Public routes (with optional auth for personalized data)
router.get('/current',
  query('lat').optional().isFloat(),
  query('lon').optional().isFloat(),
  query('city').optional().isString(),
  validate,
  optionalAuth,
  getCurrentWeather
);

router.get('/forecast',
  query('lat').optional().isFloat(),
  query('lon').optional().isFloat(),
  query('city').optional().isString(),
  query('days').optional().isInt({ min: 1, max: 14 }),
  validate,
  optionalAuth,
  getWeatherForecast
);

router.get('/alerts',
  query('state').optional().isString(),
  query('district').optional().isString(),
  validate,
  getWeatherAlerts
);

// Protected routes
router.use(auth);

router.get('/advisory',
  query('lat').isFloat().withMessage('Valid latitude is required'),
  query('lon').isFloat().withMessage('Valid longitude is required'),
  query('cropType').optional().isString(),
  validate,
  getAgricultureAdvisory
);

export default router;
