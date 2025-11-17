import axios from 'axios';
import { logger } from '@/utils/logger';
import { NotificationService } from '@/services/notificationService';

interface WeatherLocation {
  lat?: number;
  lon?: number;
  city?: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: string;
  description: string;
  icon: string;
  location: {
    name: string;
    country: string;
    region: string;
  };
  timestamp: Date;
}

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  urgency: 'immediate' | 'expected' | 'future';
  areas: string[];
  startTime: Date;
  endTime: Date;
  instructions: string[];
}

export class WeatherService {
  private static readonly API_KEY = process.env.WEATHER_API_KEY;
  private static readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';

  // Get current weather
  static async getCurrentWeather(location: WeatherLocation): Promise<WeatherData> {
    try {
      let url = `${this.BASE_URL}/weather?appid=${this.API_KEY}&units=metric`;
      
      if (location.lat && location.lon) {
        url += `&lat=${location.lat}&lon=${location.lon}`;
      } else if (location.city) {
        url += `&q=${location.city}`;
      }

      const response = await axios.get(url);
      const data = response.data;

      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: 0, // Would need separate UV API call
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        location: {
          name: data.name,
          country: data.sys.country,
          region: data.sys.country
        },
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Failed to fetch current weather:', error);
      throw new Error('Weather service unavailable');
    }
  }

  // Get weather forecast
  static async getWeatherForecast(params: WeatherLocation & { days: number }): Promise<any[]> {
    try {
      let url = `${this.BASE_URL}/forecast?appid=${this.API_KEY}&units=metric`;
      
      if (params.lat && params.lon) {
        url += `&lat=${params.lat}&lon=${params.lon}`;
      } else if (params.city) {
        url += `&q=${params.city}`;
      }

      const response = await axios.get(url);
      const data = response.data;

      // Process forecast data (OpenWeatherMap returns 5-day forecast with 3-hour intervals)
      const forecast = data.list.slice(0, params.days * 8).map((item: any) => ({
        datetime: new Date(item.dt * 1000),
        temperature: {
          current: item.main.temp,
          min: item.main.temp_min,
          max: item.main.temp_max,
          feelsLike: item.main.feels_like
        },
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        windDirection: item.wind.deg,
        pressure: item.main.pressure,
        condition: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        precipitation: {
          probability: item.pop * 100,
          amount: item.rain?.['3h'] || 0
        }
      }));

      return forecast;
    } catch (error) {
      logger.error('Failed to fetch weather forecast:', error);
      throw new Error('Weather forecast service unavailable');
    }
  }

  // Get weather alerts (mock implementation - would integrate with meteorological services)
  static async getWeatherAlerts(params: { state?: string; district?: string }): Promise<WeatherAlert[]> {
    try {
      // This is a mock implementation. In production, you would integrate with:
      // - India Meteorological Department (IMD) APIs
      // - National Weather Service APIs
      // - Local meteorological services
      
      const mockAlerts: WeatherAlert[] = [
        {
          id: 'alert_001',
          title: 'Heavy Rainfall Warning',
          description: 'Heavy to very heavy rainfall expected over the next 24-48 hours',
          severity: 'severe',
          urgency: 'immediate',
          areas: ['Punjab', 'Haryana', 'Delhi'],
          startTime: new Date(),
          endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
          instructions: [
            'Avoid unnecessary travel',
            'Secure loose objects and livestock',
            'Monitor water levels in low-lying areas',
            'Keep emergency supplies ready'
          ]
        },
        {
          id: 'alert_002',
          title: 'Thunderstorm Alert',
          description: 'Thunderstorms with lightning and gusty winds expected',
          severity: 'moderate',
          urgency: 'expected',
          areas: ['Maharashtra', 'Karnataka'],
          startTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
          instructions: [
            'Stay indoors during thunderstorms',
            'Unplug electrical appliances',
            'Avoid open fields and tall objects',
            'Secure outdoor equipment'
          ]
        }
      ];

      // Filter by location if provided
      let filteredAlerts = mockAlerts;
      if (params.state) {
        filteredAlerts = mockAlerts.filter(alert => 
          alert.areas.some(area => area.toLowerCase().includes(params.state!.toLowerCase()))
        );
      }

      return filteredAlerts;
    } catch (error) {
      logger.error('Failed to fetch weather alerts:', error);
      return [];
    }
  }

  // Get agriculture-specific weather advisory
  static async getAgricultureAdvisory(params: { lat: number; lon: number; cropType?: string }): Promise<any> {
    try {
      // Get current weather and forecast
      const currentWeather = await this.getCurrentWeather(params);
      const forecast = await this.getWeatherForecast({ ...params, days: 7 });

      // Generate agriculture-specific advisory
      const advisory = {
        currentConditions: currentWeather,
        forecast: forecast.slice(0, 7), // Next 7 days
        recommendations: this.generateAgricultureRecommendations(currentWeather, forecast, params.cropType),
        irrigation: this.getIrrigationAdvice(currentWeather, forecast),
        pestDisease: this.getPestDiseaseRisk(currentWeather, forecast, params.cropType),
        fieldWork: this.getFieldWorkAdvice(currentWeather, forecast)
      };

      return advisory;
    } catch (error) {
      logger.error('Failed to generate agriculture advisory:', error);
      throw new Error('Agriculture advisory service unavailable');
    }
  }

  // Generate crop-specific recommendations
  private static generateAgricultureRecommendations(current: WeatherData, forecast: any[], cropType?: string): string[] {
    const recommendations: string[] = [];

    // Temperature-based recommendations
    if (current.temperature > 35) {
      recommendations.push('High temperature alert: Provide shade for sensitive crops and increase irrigation frequency');
    } else if (current.temperature < 10) {
      recommendations.push('Low temperature warning: Protect crops from frost damage');
    }

    // Humidity-based recommendations
    if (current.humidity > 80) {
      recommendations.push('High humidity: Monitor for fungal diseases and ensure good ventilation');
    } else if (current.humidity < 30) {
      recommendations.push('Low humidity: Increase irrigation and consider mulching');
    }

    // Wind-based recommendations
    if (current.windSpeed > 20) {
      recommendations.push('Strong winds expected: Secure tall crops and protect nurseries');
    }

    // Crop-specific advice
    if (cropType) {
      switch (cropType.toLowerCase()) {
        case 'rice':
          if (current.temperature > 30 && current.humidity > 70) {
            recommendations.push('Rice: Ideal conditions for growth, monitor for blast disease');
          }
          break;
        case 'wheat':
          if (current.temperature < 25 && current.humidity < 60) {
            recommendations.push('Wheat: Good conditions for grain filling stage');
          }
          break;
        case 'tomato':
          if (current.temperature > 32) {
            recommendations.push('Tomato: High temperature may cause flower drop, provide shade');
          }
          break;
      }
    }

    // Forecast-based recommendations
    const rainExpected = forecast.some(day => day.precipitation.probability > 70);
    if (rainExpected) {
      recommendations.push('Rain expected: Postpone spraying activities and ensure proper drainage');
    }

    return recommendations;
  }

  // Get irrigation advice
  private static getIrrigationAdvice(current: WeatherData, forecast: any[]): any {
    const rainInNext3Days = forecast.slice(0, 3).some(day => day.precipitation.probability > 60);
    const totalRainfall = forecast.slice(0, 3).reduce((sum, day) => sum + day.precipitation.amount, 0);

    return {
      recommendation: rainInNext3Days ? 'postpone' : 'proceed',
      reason: rainInNext3Days 
        ? `Rain expected (${totalRainfall.toFixed(1)}mm in next 3 days)` 
        : 'No significant rainfall expected',
      nextIrrigation: rainInNext3Days 
        ? 'After rainfall stops' 
        : 'Within 24-48 hours',
      waterRequirement: this.calculateWaterRequirement(current, forecast)
    };
  }

  // Calculate water requirement
  private static calculateWaterRequirement(current: WeatherData, forecast: any[]): string {
    const avgTemp = forecast.slice(0, 3).reduce((sum, day) => sum + day.temperature.current, 0) / 3;
    const avgHumidity = forecast.slice(0, 3).reduce((sum, day) => sum + day.humidity, 0) / 3;

    if (avgTemp > 30 && avgHumidity < 50) {
      return 'High (25-30mm)';
    } else if (avgTemp > 25 && avgHumidity < 70) {
      return 'Medium (15-20mm)';
    } else {
      return 'Low (10-15mm)';
    }
  }

  // Get pest and disease risk
  private static getPestDiseaseRisk(current: WeatherData, forecast: any[], cropType?: string): any {
    const avgTemp = forecast.slice(0, 3).reduce((sum, day) => sum + day.temperature.current, 0) / 3;
    const avgHumidity = forecast.slice(0, 3).reduce((sum, day) => sum + day.humidity, 0) / 3;

    let riskLevel = 'low';
    const risks: string[] = [];

    // High humidity and moderate temperature favor fungal diseases
    if (avgHumidity > 75 && avgTemp > 20 && avgTemp < 30) {
      riskLevel = 'high';
      risks.push('Fungal diseases (leaf spot, blight)');
    }

    // High temperature and low humidity favor insect pests
    if (avgTemp > 30 && avgHumidity < 60) {
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      risks.push('Insect pests (aphids, thrips)');
    }

    // Crop-specific risks
    if (cropType === 'rice' && avgHumidity > 80) {
      risks.push('Rice blast disease');
    }

    return {
      level: riskLevel,
      risks: risks.length > 0 ? risks : ['No specific risks identified'],
      preventiveMeasures: this.getPreventiveMeasures(risks)
    };
  }

  // Get preventive measures
  private static getPreventiveMeasures(risks: string[]): string[] {
    const measures: string[] = [];

    if (risks.some(risk => risk.includes('fungal'))) {
      measures.push('Apply fungicide spray as preventive measure');
      measures.push('Ensure proper field drainage');
      measures.push('Avoid overhead irrigation');
    }

    if (risks.some(risk => risk.includes('insect'))) {
      measures.push('Monitor crop regularly for pest infestation');
      measures.push('Use pheromone traps');
      measures.push('Apply neem-based pesticides');
    }

    return measures.length > 0 ? measures : ['Continue regular monitoring'];
  }

  // Get field work advice
  private static getFieldWorkAdvice(current: WeatherData, forecast: any[]): any {
    const rainExpected = forecast.slice(0, 2).some(day => day.precipitation.probability > 50);
    const windSpeed = current.windSpeed;

    const suitableActivities: string[] = [];
    const postponeActivities: string[] = [];

    if (!rainExpected && windSpeed < 15) {
      suitableActivities.push('Spraying operations');
      suitableActivities.push('Harvesting');
      suitableActivities.push('Field preparation');
    } else {
      if (rainExpected) {
        postponeActivities.push('Spraying (rain expected)');
        postponeActivities.push('Harvesting (rain expected)');
      }
      if (windSpeed >= 15) {
        postponeActivities.push('Spraying (high wind speed)');
      }
    }

    return {
      suitable: suitableActivities.length > 0 ? suitableActivities : ['Indoor activities only'],
      postpone: postponeActivities.length > 0 ? postponeActivities : ['No restrictions'],
      bestTime: rainExpected ? 'After rain stops' : 'Early morning (6-10 AM)'
    };
  }

  // Monitor weather conditions and send alerts
  static async monitorAndAlert(): Promise<void> {
    try {
      // This would be called by a cron job to monitor weather conditions
      // and send alerts to farmers

      const criticalStates = ['Punjab', 'Haryana', 'Maharashtra', 'Karnataka', 'Tamil Nadu'];
      
      for (const state of criticalStates) {
        const alerts = await this.getWeatherAlerts({ state });
        
        for (const alert of alerts) {
          if (alert.severity === 'severe' || alert.severity === 'extreme') {
            await NotificationService.sendWeatherAlert({
              alertType: alert.title,
              location: { state, district: null },
              description: alert.description,
              severity: alert.severity,
              instructions: alert.instructions
            });
          }
        }
      }

      logger.info('Weather monitoring and alerts completed');
    } catch (error) {
      logger.error('Failed to monitor weather and send alerts:', error);
    }
  }
}
