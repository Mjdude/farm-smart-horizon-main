import axios from 'axios';
import { logger } from '@/utils/logger';
import { NotificationService } from '@/services/notificationService';
import { getRedisClient } from '@/config/redis';

interface MarketPrice {
  id: string;
  commodity: string;
  variety?: string;
  market: string;
  state: string;
  district: string;
  date: Date;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  arrivals?: number;
}

interface PriceTrend {
  date: Date;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketAnalysis {
  commodity: string;
  avgPrice: number;
  priceRange: { min: number; max: number };
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: 'low' | 'medium' | 'high';
  seasonality: any;
  forecast: any[];
}

export class MarketService {
  private static readonly AGMARKNET_API = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
  private static readonly API_KEY = process.env.MARKET_DATA_API_KEY;

  // Get current market prices
  static async getMarketPrices(params: {
    state?: string;
    district?: string;
    market?: string;
    commodity?: string;
    date?: string;
  }): Promise<MarketPrice[]> {
    try {
      // Try to get from cache first
      const redisClient = getRedisClient();
      const cacheKey = `market_prices:${JSON.stringify(params)}`;
      
      if (redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Mock data for demonstration (in production, integrate with actual APIs)
      const mockPrices: MarketPrice[] = [
        {
          id: '1',
          commodity: 'Rice',
          variety: 'Basmati',
          market: 'Delhi',
          state: 'Delhi',
          district: 'New Delhi',
          date: new Date(),
          minPrice: 4200,
          maxPrice: 4800,
          modalPrice: 4500,
          unit: 'Quintal',
          arrivals: 150
        },
        {
          id: '2',
          commodity: 'Wheat',
          variety: 'HD-2967',
          market: 'Karnal',
          state: 'Haryana',
          district: 'Karnal',
          date: new Date(),
          minPrice: 2800,
          maxPrice: 3200,
          modalPrice: 3000,
          unit: 'Quintal',
          arrivals: 200
        },
        {
          id: '3',
          commodity: 'Tomato',
          market: 'Azadpur',
          state: 'Delhi',
          district: 'New Delhi',
          date: new Date(),
          minPrice: 3000,
          maxPrice: 4000,
          modalPrice: 3500,
          unit: 'Quintal',
          arrivals: 80
        },
        {
          id: '4',
          commodity: 'Onion',
          market: 'Nashik',
          state: 'Maharashtra',
          district: 'Nashik',
          date: new Date(),
          minPrice: 2200,
          maxPrice: 2800,
          modalPrice: 2500,
          unit: 'Quintal',
          arrivals: 300
        }
      ];

      // Filter based on parameters
      let filteredPrices = mockPrices;
      
      if (params.state) {
        filteredPrices = filteredPrices.filter(p => 
          p.state.toLowerCase().includes(params.state!.toLowerCase())
        );
      }
      
      if (params.district) {
        filteredPrices = filteredPrices.filter(p => 
          p.district.toLowerCase().includes(params.district!.toLowerCase())
        );
      }
      
      if (params.market) {
        filteredPrices = filteredPrices.filter(p => 
          p.market.toLowerCase().includes(params.market!.toLowerCase())
        );
      }
      
      if (params.commodity) {
        filteredPrices = filteredPrices.filter(p => 
          p.commodity.toLowerCase().includes(params.commodity!.toLowerCase())
        );
      }

      // Cache the results
      if (redisClient) {
        await redisClient.setEx(cacheKey, 300, JSON.stringify(filteredPrices)); // Cache for 5 minutes
      }

      return filteredPrices;
    } catch (error) {
      logger.error('Failed to fetch market prices:', error);
      throw new Error('Market data service unavailable');
    }
  }

  // Get price trends
  static async getPriceTrends(params: {
    commodity: string;
    market?: string;
    days: number;
  }): Promise<PriceTrend[]> {
    try {
      // Mock trend data (in production, calculate from historical data)
      const trends: PriceTrend[] = [];
      const basePrice = this.getBasePriceForCommodity(params.commodity);
      
      for (let i = params.days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Simulate price fluctuation
        const randomFactor = 0.9 + Math.random() * 0.2; // ±10% variation
        const seasonalFactor = this.getSeasonalFactor(params.commodity, date);
        const price = Math.round(basePrice * randomFactor * seasonalFactor);
        
        const previousPrice = i === params.days - 1 ? price : trends[trends.length - 1].price;
        const change = price - previousPrice;
        const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
        
        trends.push({
          date,
          price,
          change,
          changePercent
        });
      }

      return trends;
    } catch (error) {
      logger.error('Failed to fetch price trends:', error);
      throw new Error('Price trend service unavailable');
    }
  }

  // Get market analysis
  static async getMarketAnalysis(params: {
    commodity?: string;
    state?: string;
  }): Promise<MarketAnalysis[]> {
    try {
      const commodities = params.commodity ? [params.commodity] : ['Rice', 'Wheat', 'Tomato', 'Onion'];
      const analyses: MarketAnalysis[] = [];

      for (const commodity of commodities) {
        const trends = await this.getPriceTrends({ commodity, days: 30 });
        const prices = trends.map(t => t.price);
        
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        // Calculate trend
        const recentPrices = prices.slice(-7); // Last 7 days
        const earlierPrices = prices.slice(-14, -7); // Previous 7 days
        const recentAvg = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
        const earlierAvg = earlierPrices.reduce((sum, p) => sum + p, 0) / earlierPrices.length;
        
        let trend: 'increasing' | 'decreasing' | 'stable';
        const trendChange = ((recentAvg - earlierAvg) / earlierAvg) * 100;
        
        if (trendChange > 5) trend = 'increasing';
        else if (trendChange < -5) trend = 'decreasing';
        else trend = 'stable';

        // Calculate volatility
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = (stdDev / avgPrice) * 100;
        
        let volatility: 'low' | 'medium' | 'high';
        if (coefficientOfVariation < 10) volatility = 'low';
        else if (coefficientOfVariation < 20) volatility = 'medium';
        else volatility = 'high';

        analyses.push({
          commodity,
          avgPrice: Math.round(avgPrice),
          priceRange: { min: minPrice, max: maxPrice },
          trend,
          volatility,
          seasonality: this.getSeasonalityData(commodity),
          forecast: this.generateForecast(commodity, trends)
        });
      }

      return analyses;
    } catch (error) {
      logger.error('Failed to generate market analysis:', error);
      throw new Error('Market analysis service unavailable');
    }
  }

  // Get commodities list
  static async getCommodities(): Promise<string[]> {
    return [
      'Rice', 'Wheat', 'Maize', 'Bajra', 'Jowar',
      'Arhar/Tur', 'Moong', 'Urad', 'Masur', 'Gram',
      'Groundnut', 'Sunflower', 'Soyabean', 'Sesamum',
      'Cotton', 'Sugarcane', 'Jute',
      'Onion', 'Potato', 'Tomato', 'Cabbage', 'Cauliflower',
      'Brinjal', 'Okra', 'Chilli', 'Turmeric', 'Coriander'
    ];
  }

  // Get markets list
  static async getMarkets(params: { state?: string; district?: string }): Promise<any[]> {
    const allMarkets = [
      { name: 'Azadpur', state: 'Delhi', district: 'New Delhi', type: 'Wholesale' },
      { name: 'Karnal', state: 'Haryana', district: 'Karnal', type: 'Mandi' },
      { name: 'Nashik', state: 'Maharashtra', district: 'Nashik', type: 'APMC' },
      { name: 'Bangalore', state: 'Karnataka', district: 'Bangalore', type: 'Wholesale' },
      { name: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', type: 'Koyambedu' },
      { name: 'Kolkata', state: 'West Bengal', district: 'Kolkata', type: 'Wholesale' }
    ];

    let filteredMarkets = allMarkets;
    
    if (params.state) {
      filteredMarkets = filteredMarkets.filter(m => 
        m.state.toLowerCase().includes(params.state!.toLowerCase())
      );
    }
    
    if (params.district) {
      filteredMarkets = filteredMarkets.filter(m => 
        m.district.toLowerCase().includes(params.district!.toLowerCase())
      );
    }

    return filteredMarkets;
  }

  // Get price alerts
  static async getPriceAlerts(params: {
    commodity?: string;
    threshold?: number;
  }): Promise<any[]> {
    try {
      const alerts = [];
      const commodities = params.commodity ? [params.commodity] : ['Rice', 'Wheat', 'Tomato', 'Onion'];

      for (const commodity of commodities) {
        const trends = await this.getPriceTrends({ commodity, days: 7 });
        const latestPrice = trends[trends.length - 1];
        const previousPrice = trends[trends.length - 2];

        const changePercent = Math.abs(latestPrice.changePercent);
        const threshold = params.threshold || 10; // Default 10% threshold

        if (changePercent >= threshold) {
          alerts.push({
            commodity,
            currentPrice: latestPrice.price,
            previousPrice: previousPrice.price,
            change: latestPrice.change,
            changePercent: latestPrice.changePercent,
            alertType: latestPrice.changePercent > 0 ? 'price_increase' : 'price_decrease',
            severity: changePercent > 20 ? 'high' : 'medium',
            timestamp: new Date()
          });
        }
      }

      return alerts;
    } catch (error) {
      logger.error('Failed to fetch price alerts:', error);
      return [];
    }
  }

  // Helper methods
  private static getBasePriceForCommodity(commodity: string): number {
    const basePrices: { [key: string]: number } = {
      'Rice': 4500,
      'Wheat': 3000,
      'Tomato': 3500,
      'Onion': 2500,
      'Potato': 2000,
      'Maize': 2800,
      'Cotton': 8000,
      'Sugarcane': 350
    };
    return basePrices[commodity] || 3000;
  }

  private static getSeasonalFactor(commodity: string, date: Date): number {
    const month = date.getMonth() + 1; // 1-12
    
    // Simplified seasonal factors
    const seasonalFactors: { [key: string]: { [key: number]: number } } = {
      'Rice': {
        1: 1.1, 2: 1.15, 3: 1.2, 4: 1.1, 5: 0.9, 6: 0.85,
        7: 0.8, 8: 0.85, 9: 0.9, 10: 1.0, 11: 1.05, 12: 1.1
      },
      'Wheat': {
        1: 0.9, 2: 0.85, 3: 0.8, 4: 0.85, 5: 0.9, 6: 1.0,
        7: 1.1, 8: 1.15, 9: 1.2, 10: 1.1, 11: 1.0, 12: 0.95
      },
      'Tomato': {
        1: 1.2, 2: 1.15, 3: 1.0, 4: 0.9, 5: 0.85, 6: 0.9,
        7: 1.0, 8: 1.1, 9: 1.15, 10: 1.2, 11: 1.25, 12: 1.2
      }
    };

    return seasonalFactors[commodity]?.[month] || 1.0;
  }

  private static getSeasonalityData(commodity: string): any {
    return {
      peakSeason: this.getPeakSeason(commodity),
      leanSeason: this.getLeanSeason(commodity),
      harvestMonths: this.getHarvestMonths(commodity)
    };
  }

  private static getPeakSeason(commodity: string): string[] {
    const peakSeasons: { [key: string]: string[] } = {
      'Rice': ['October', 'November', 'December'],
      'Wheat': ['March', 'April', 'May'],
      'Tomato': ['December', 'January', 'February'],
      'Onion': ['March', 'April', 'May']
    };
    return peakSeasons[commodity] || [];
  }

  private static getLeanSeason(commodity: string): string[] {
    const leanSeasons: { [key: string]: string[] } = {
      'Rice': ['June', 'July', 'August'],
      'Wheat': ['September', 'October', 'November'],
      'Tomato': ['June', 'July', 'August'],
      'Onion': ['September', 'October', 'November']
    };
    return leanSeasons[commodity] || [];
  }

  private static getHarvestMonths(commodity: string): string[] {
    const harvestMonths: { [key: string]: string[] } = {
      'Rice': ['October', 'November', 'January', 'February'],
      'Wheat': ['March', 'April'],
      'Tomato': ['November', 'December', 'January', 'February'],
      'Onion': ['March', 'April', 'November', 'December']
    };
    return harvestMonths[commodity] || [];
  }

  private static generateForecast(commodity: string, trends: PriceTrend[]): any[] {
    const forecast = [];
    const lastPrice = trends[trends.length - 1].price;
    const avgChange = trends.slice(-7).reduce((sum, t) => sum + t.changePercent, 0) / 7;

    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const seasonalFactor = this.getSeasonalFactor(commodity, date);
      const trendFactor = 1 + (avgChange / 100) * 0.5; // Dampened trend
      const randomFactor = 0.98 + Math.random() * 0.04; // ±2% random variation
      
      const forecastPrice = Math.round(lastPrice * seasonalFactor * trendFactor * randomFactor);
      
      forecast.push({
        date,
        predictedPrice: forecastPrice,
        confidence: Math.max(0.6, 0.9 - (i * 0.05)) // Decreasing confidence over time
      });
    }

    return forecast;
  }

  // Monitor prices and send alerts
  static async monitorPricesAndAlert(): Promise<void> {
    try {
      const alerts = await this.getPriceAlerts({ threshold: 10 });
      
      for (const alert of alerts) {
        if (alert.severity === 'high') {
          await NotificationService.sendMarketAlert({
            crop: alert.commodity,
            market: 'National Average',
            currentPrice: alert.currentPrice,
            previousPrice: alert.previousPrice,
            change: alert.changePercent
          });
        }
      }

      logger.info('Price monitoring and alerts completed');
    } catch (error) {
      logger.error('Failed to monitor prices and send alerts:', error);
    }
  }
}
