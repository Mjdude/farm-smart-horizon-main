const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = {
  // Schemes
  getSchemes: async (params?: { category?: string; state?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.state) searchParams.append('state', params.state);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/schemes?${searchParams}`);
    return response.json();
  },

  getSchemeById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/schemes/${id}`);
    return response.json();
  },

  // Trading
  getCropListings: async (params?: { cropType?: string; quality?: string; state?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.cropType) searchParams.append('cropType', params.cropType);
    if (params?.quality) searchParams.append('quality', params.quality);
    if (params?.state) searchParams.append('state', params.state);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/trading/listings?${searchParams}`);
    return response.json();
  },

  getCropListingById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/trading/listings/${id}`);
    return response.json();
  },

  // Finance
  getLoanProducts: async (type?: string) => {
    const searchParams = new URLSearchParams();
    if (type) searchParams.append('type', type);
    
    const response = await fetch(`${API_BASE_URL}/finance/products?${searchParams}`);
    return response.json();
  },

  calculateEMI: async (data: { amount: number; rate: number; tenure: number }) => {
    const response = await fetch(`${API_BASE_URL}/finance/calculate-emi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Weather
  getCurrentWeather: async (params?: { lat?: number; lon?: number; city?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.lat) searchParams.append('lat', params.lat.toString());
    if (params?.lon) searchParams.append('lon', params.lon.toString());
    if (params?.city) searchParams.append('city', params.city);
    
    const response = await fetch(`${API_BASE_URL}/weather/current?${searchParams}`);
    return response.json();
  },

  // Market
  getMarketPrices: async (params?: { state?: string; commodity?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.state) searchParams.append('state', params.state);
    if (params?.commodity) searchParams.append('commodity', params.commodity);
    
    const response = await fetch(`${API_BASE_URL}/market/prices?${searchParams}`);
    return response.json();
  },

  // Notifications
  getNotifications: async (params?: { type?: string; priority?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/notifications?${searchParams}`);
    return response.json();
  },

  // Health check
  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.json();
  }
};

export default api;
