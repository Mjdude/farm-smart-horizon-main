import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { getRedisClient } from '@/config/redis';
import { logger } from '@/utils/logger';

// Create rate limiter instance
let rateLimiter: RateLimiterRedis | null = null;

const initRateLimiter = () => {
  const redisClient = getRedisClient();
  
  if (redisClient) {
    rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'rl_farm_smart',
      points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Number of requests
      duration: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60, // Per 15 minutes by default
      blockDuration: 60, // Block for 1 minute if limit exceeded
    });
  }
};

// Initialize rate limiter
initRateLimiter();

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  if (!rateLimiter) {
    // If Redis is not available, skip rate limiting
    return next();
  }

  try {
    // Use IP address as key, but could be enhanced with user ID for authenticated requests
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    
    await rateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    // Rate limit exceeded
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: secs
    });
  }
};

// Specific rate limiter for authentication endpoints
export const authRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const redisClient = getRedisClient();
  
  if (!redisClient) {
    return next();
  }

  const authLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl_auth',
    points: 5, // 5 attempts
    duration: 15 * 60, // Per 15 minutes
    blockDuration: 15 * 60, // Block for 15 minutes
  });

  try {
    const key = req.ip || 'unknown';
    await authLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: secs
    });
  }
};
